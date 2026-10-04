import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import Client, create_client

script_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=script_dir.parent / ".env")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # service key — never NEXT_PUBLIC_*
ZENROWS_KEY = os.getenv("ZENROWS_KEY")

# Set ZENROWS_JS_RENDER=false if the match rows are in the page source (view-source test).
# Unrendered requests are much faster and cost far fewer credits.
JS_RENDER = os.getenv("ZENROWS_JS_RENDER", "true").strip().lower() == "true"

ZENROWS_URL = "https://api.zenrows.com/v1/"
# Rendered pages through premium proxies are slow (crests + background photo per page)
REQUEST_TIMEOUT = 180 if JS_RENDER else 60
MAX_ATTEMPTS = 3
BACKOFF_BASE = 5  # seconds → waits 5s, 10s between attempts

# 401 bad key · 402 out of credits · 403 forbidden → retrying won't help, stop the run
HARD_STOP = {401, 402, 403}
# 422 ZenRows couldn't fetch the target · 429 concurrency limit · 5xx transient
RETRYABLE = {422, 429, 500, 502, 503, 504}

# (event_id, team_id) — one entry per team per season/event
TEAMS = [
    ("54578", "4108117"),
    ("55206", "4243561"),
]

# Brackets emptied by the year/noise removal: "SK (2017)" → "SK ()" → "SK"
EMPTY_BRACKETS_RE = re.compile(r"\(\s*\)|\[\s*\]")

# Squad/color labels to drop from team names. WHOLE WORDS ONLY — so "Golden Eagles"
# and "Bluebirds" survive. Years are removed separately.
NAME_NOISE = ["NYE", "Maignan", "Comets",
              "Zidane", "Baggio", "Gold", "Blue", "PERSEUS"]
NAME_NOISE_RE = re.compile(
    r"\b(?:" + "|".join(map(re.escape, NAME_NOISE)) + r")\b")
# Single years AND season ranges, plus a leading space/hyphen:
#   "SFA 2017/18 CJSL" → "SFA CJSL" · "Travel-2017/2018" → "Travel" · "PFC 2018/2019" → "PFC"
YEAR_RE = re.compile(r"[\s-]*\b(?:19|20)\d{2}(?:\s*/\s*(?:19|20)?\d{2})?\b")
# GotSport prints the timezone (often twice: "EDT EDT"), then any status badge
# like "Rained Out". We split on it so the badge survives instead of being cut off.
TZ_RE = re.compile(r"\s*\bE[DS]T\b")
# A real final score like "4 - 2" or "10-0"
SCORE_RE = re.compile(r"^\d+\s*-\s*\d+$")


def clean_team_name(name: str | None) -> str:
    if not name or name.strip() == "-":
        return "TBD"
    cleaned = NAME_NOISE_RE.sub("", YEAR_RE.sub("", name))
    cleaned = EMPTY_BRACKETS_RE.sub("", cleaned)  # ← new
    return re.sub(r"\s+", " ", cleaned).strip() or "TBD"


def clean_venue(venue_text: str | None) -> str:
    """Keep the source casing — the app title-cases ALL-CAPS names safely."""
    if not venue_text or venue_text.strip() in ("-", "Hidden"):
        return "TBD"
    return re.split(r"\s+-\s+", venue_text.strip())[0].strip()


def split_date_time(text: str) -> tuple[str, str | None]:
    """'Sep 27, 2026 1:00PM EDT EDT Rained Out' → ('Sep 27, 2026 1:00PM', 'Rained Out')"""
    text = re.sub(r"\s+", " ", text).strip()
    dt, *rest = TZ_RE.split(text)
    # GotSport also leaves single-character flags ("Y" / "N") after the timezone.
    # Real status badges are words ("Rained Out", "Cancelled"), so drop 1-char tokens.
    words = [w for w in " ".join(rest).split() if len(w) > 1]
    note = " ".join(words)
    return dt.strip(), note or None


def is_captcha(html: str) -> bool:
    # Raw HTML check — catches the marker in hrefs/form actions, not just visible text.
    # (response.url is the ZenRows endpoint, so it never reflects GotSport's redirect.)
    return "verify_captchas" in html


def fetch(target_url: str, team_id: str) -> tuple[str | None, str]:
    """Fetch one page through ZenRows with retries.
    Returns (html, status) where status is "ok", "failed", or "blocked"."""
    params = {
        "apikey": ZENROWS_KEY,
        "url": target_url,
        "premium_proxy": "true",
    }
    if JS_RENDER:
        params["js_render"] = "true"
        # don't return until the schedule table exists
        params["wait_for"] = "table"
        # skip crests, background photo and fonts — we only need the HTML
        params["block_resources"] = "image,media,font"

    last_reason = "unknown"

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = requests.get(
                ZENROWS_URL, params=params, timeout=REQUEST_TIMEOUT)
        except requests.exceptions.RequestException as e:
            # Log the exception TYPE only — the message can echo the URL incl. the API key
            last_reason = type(e).__name__
            print(
                f"⚠️  {last_reason} on {team_id} (attempt {attempt}/{MAX_ATTEMPTS})")
        else:
            code = response.status_code

            if code == 200:
                if not is_captcha(response.text):
                    return response.text, "ok"
                # Premium proxies rotate IPs per request, so a retry can get through
                last_reason = "captcha"
                print(
                    f"🧩 CAPTCHA on {team_id} (attempt {attempt}/{MAX_ATTEMPTS})")

            elif code in HARD_STOP:
                print(
                    f"🛑 ZenRows {code} on {team_id}: {response.text[:300]}")
                return None, "blocked"

            elif code in RETRYABLE:
                last_reason = f"HTTP {code}"
                print(
                    f"⚠️  ZenRows {code} on {team_id} (attempt {attempt}/{MAX_ATTEMPTS}): "
                    f"{response.text[:200]}")

            else:
                print(
                    f"❌ ZenRows {code} on {team_id}: {response.text[:300]}")
                return None, "failed"

        if attempt < MAX_ATTEMPTS:
            delay = BACKOFF_BASE * 2 ** (attempt - 1)
            print(f"   ↻ retrying in {delay}s…")
            time.sleep(delay)

    # A CAPTCHA that survives every retry is a hard block, not a one-team blip
    if last_reason == "captcha":
        print(
            f"🛑 CAPTCHA persisted on {team_id} after {MAX_ATTEMPTS} attempts.")
        return None, "blocked"

    print(
        f"❌ Gave up on {team_id} after {MAX_ATTEMPTS} attempts ({last_reason})")
    return None, "failed"


def parse_rows(html: str, event_id: str, team_id: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    rows_out: list[dict] = []

    for row in soup.find_all("tr"):
        cols = row.find_all("td")
        # 0: Match # | 1: Time | 2: Home | 3: Result | 4: Away | 5: Location | 6: Division
        if len(cols) < 6:
            continue

        g_id = cols[0].get_text(strip=True)

        # Standings rows start with ranks (1, 2, 3); real game IDs are 3+ digits
        if not g_id.isdigit() or len(g_id) < 3:
            continue

        try:
            dt, note = split_date_time(
                cols[1].get_text(separator=" ", strip=True))
            score = re.sub(r"\s+", " ", cols[3].get_text(strip=True)).strip()

            rows_out.append({
                "game_id": g_id,
                "event_id": event_id,
                "team_queried": team_id,
                "date_time": dt,
                "home_team": clean_team_name(cols[2].get_text(strip=True)),
                # A real score always wins; otherwise a status badge
                # ("Rained Out", "Cancelled"…) outranks the "-" placeholder
                "score_or_status": score if SCORE_RE.match(score) else (note or score),
                "away_team": clean_team_name(cols[4].get_text(strip=True)),
                "venue": clean_venue(cols[5].get_text(separator=" ", strip=True)),
            })
        except Exception as e:  # one bad row never sinks the team
            print(f"⚠️  Skipped malformed row {g_id}: {e}")

    return rows_out


def scrape_teams(teams):
    """Returns ({(event_id, team_id): rows} for teams that scraped successfully,
    the list of teams that failed, and whether the run hit a hard block."""
    results: dict[tuple[str, str], list[dict]] = {}
    failed: list[str] = []
    blocked = False

    for event_id, team_id in teams:
        print(
            f"📡 Scraping team {team_id} (event {event_id}) via ZenRows "
            f"[js_render={'on' if JS_RENDER else 'off'}]…")
        target_url = f"https://system.gotsport.com/org_event/events/{event_id}/schedules?team={team_id}"

        html, status = fetch(target_url, team_id)

        if status == "blocked":
            failed.append(team_id)
            blocked = True
            print(
                "🛑 Halting: ZenRows key invalid, out of credits, or persistent CAPTCHA.")
            break

        if status != "ok" or html is None:
            failed.append(team_id)
            continue

        rows_out = parse_rows(html, event_id, team_id)

        if rows_out:
            results[(event_id, team_id)] = rows_out
            print(f"✅ {len(rows_out)} matches for {team_id}")
        else:
            # Zero rows is treated as a FAILURE (layout change / block), never as
            # "this team has no games" — so we don't prune their schedule.
            failed.append(team_id)
            print(
                f"⚠️  No match rows found for {team_id} — treating as failed")

    return results, failed, blocked


def dedupe(rows: list[dict]) -> list[dict]:
    """Two of our teams can play each other → same game_id twice in one batch.
    Postgres rejects an upsert that touches a row twice, so keep one copy."""
    by_id: dict[str, dict] = {}
    for r in rows:
        by_id.setdefault(r["game_id"], r)
    return list(by_id.values())


def sync(results) -> bool:
    if not results:
        print("⚠️  Nothing scraped — leaving the database untouched.")
        return False

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    scraped_at = datetime.now(timezone.utc).isoformat()
    ok = True

    # 1. Upsert every row we saw, stamped with this run's time (the app's "Updated … ago")
    rows = dedupe([r for team_rows in results.values() for r in team_rows])
    for r in rows:
        r["scraped_at"] = scraped_at
    try:
        supabase.table("matches").upsert(rows, on_conflict="game_id").execute()
        print(f"✅ Upserted {len(rows)} matches")
    except Exception as e:
        print(f"❌ Supabase upsert error: {e}")
        return False  # don't prune after a failed write

    # 2. Prune games the league removed — ONLY for teams that scraped successfully,
    #    scoped to that event (past seasons live under other event IDs and stay untouched)
    for (event_id, team_id), team_rows in results.items():
        seen = {r["game_id"] for r in team_rows}
        try:
            existing = (
                supabase.table("matches")
                .select("game_id")
                .eq("event_id", event_id)
                .eq("team_queried", team_id)
                .execute()
                .data
                or []
            )
            gone = [r["game_id"] for r in existing if r["game_id"] not in seen]
            if gone:
                supabase.table("matches").delete().in_(
                    "game_id", gone).execute()
                print(
                    f"🧹 Removed {len(gone)} games no longer listed for {team_id}: {gone}")
        except Exception as e:
            ok = False
            print(f"❌ Prune error for {team_id}: {e}")

    return ok


if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_KEY")
        sys.exit(1)

    if not ZENROWS_KEY:
        print("❌ Missing ZENROWS_KEY")
        sys.exit(1)

    results, failed, blocked = scrape_teams(TEAMS)
    # Teams scraped BEFORE a hard block are still saved (and pruned only for themselves)
    synced = sync(results)

    if blocked:
        print(
            "🛑 Stopped: hard block (bad key, no credits, or persistent CAPTCHA). The app keeps "
            "showing the last good data and flags it as out of date after 24 h."
        )
        sys.exit(2)

    # Non-zero exit → the GitHub Action shows a FAILED run, so someone notices
    if failed or not synced:
        print(
            f"❌ Run finished with problems. Failed teams: {failed or 'none'} · synced: {synced}")
        sys.exit(1)
    print("🏁 Done")
