import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth

from supabase import Client, create_client

script_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=script_dir.parent / ".env")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # service key — never NEXT_PUBLIC_*

# (event_id, team_id) — one entry per team per season/event
TEAMS = [
    ("54578", "4108117"),
    ("55206", "4243561"),
]

# Squad/color labels to drop from team names. WHOLE WORDS ONLY — so "Golden Eagles"
# and "Bluebirds" survive. Years are removed separately.
NAME_NOISE = ["NYE", "Maignan", "Comets",
              "Zidane", "Baggio", "Gold", "Blue", "PERSEUS"]
NAME_NOISE_RE = re.compile(
    r"\b(?:" + "|".join(map(re.escape, NAME_NOISE)) + r")\b")
YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")
# GotSport appends the timezone ("EDT" / "EST") plus sometimes stray tokens — cut from there
TZ_SUFFIX_RE = re.compile(r"\s+E[DS]T\b.*$", re.DOTALL)


def clean_team_name(name: str | None) -> str:
    if not name or name.strip() == "-":
        return "TBD"
    cleaned = NAME_NOISE_RE.sub("", YEAR_RE.sub("", name))
    return re.sub(r"\s+", " ", cleaned).strip() or "TBD"


def clean_venue(venue_text: str | None) -> str:
    """Keep the source casing — the app title-cases ALL-CAPS names safely.
    (Python's .title() produced "Randall'S Island".)"""
    if not venue_text or venue_text.strip() in ("-", "Hidden"):
        return "TBD"
    return re.split(r"\s+-\s+", venue_text.strip())[0].strip()


def clean_date_time(text: str) -> str:
    text = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
    return TZ_SUFFIX_RE.sub("", text).strip()


def cell_text(cell) -> str:
    return cell.evaluate("node => node.textContent") or ""


def scrape_teams(teams):
    """Returns ({(event_id, team_id): rows} for teams that scraped successfully,
    the list of teams that failed, and whether GotSport served a CAPTCHA)."""
    results: dict[tuple[str, str], list[dict]] = {}
    failed: list[str] = []
    blocked = False

    with Stealth().use_sync(sync_playwright()) as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        for event_id, team_id in teams:
            print(f"📡 Scraping team {team_id} (event {event_id})…")
            url = f"https://system.gotsport.com/org_event/events/{event_id}/schedules?team={team_id}"
            rows_out: list[dict] = []

            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60_000)

                page.wait_for_selector("tr", timeout=15_000)
                page.mouse.wheel(0, 500)
                page.wait_for_timeout(2_000)

                for row in page.query_selector_all("tr"):
                    cols = row.query_selector_all("td")
                    # 0: Match # | 1: Time | 2: Home | 3: Result | 4: Away | 5: Location
                    if len(cols) < 6:
                        continue
                    g_id = cell_text(cols[0]).strip()
                    # Standings rows start with ranks (1, 2, 3); real game IDs are 3+ digits
                    if not g_id.isdigit() or len(g_id) < 3:
                        continue
                    try:
                        rows_out.append({
                            "game_id": g_id,
                            "event_id": event_id,
                            "team_queried": team_id,
                            "date_time": clean_date_time(cell_text(cols[1])),
                            "home_team": clean_team_name(cell_text(cols[2])),
                            "score_or_status": re.sub(r"\s+", " ", cell_text(cols[3])).strip(),
                            "away_team": clean_team_name(cell_text(cols[4])),
                            "venue": clean_venue(cell_text(cols[5])),
                        })
                    except Exception as e:  # one bad row never sinks the team
                        print(f"⚠️  Skipped malformed row {g_id}: {e}")

                if rows_out:
                    results[(event_id, team_id)] = rows_out
                    print(f"✅ {len(rows_out)} matches for {team_id}")
                else:
                    # Zero rows is treated as a FAILURE (layout change / block), never as
                    # "this team has no games" — so we don't prune their schedule.
                    failed.append(team_id)
                    print(
                        f"⚠️  No match rows found for {team_id} — treating as failed")
            except Exception as e:
                failed.append(team_id)
                print(f"❌ Error on {team_id}: {e}")

        browser.close()
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

    results, failed, blocked = scrape_teams(TEAMS)
    # Teams scraped BEFORE a CAPTCHA are still saved (and pruned only for themselves)
    synced = sync(results)

    if blocked:
        print(
            "🛑 Stopped: GotSport served a CAPTCHA to this automated run. Don't re-run on a loop — "
            "wait a few days, then try ONE manual run. The app keeps showing the last good data "
            "and flags it as out of date after 24 h."
        )
        # distinct from ordinary failures (1) — easy to spot in the Actions log
        sys.exit(2)

    # Non-zero exit → the GitHub Action shows a FAILED run, so someone notices
    if failed or not synced:
        print(
            f"❌ Run finished with problems. Failed teams: {failed or 'none'} · synced: {synced}")
        sys.exit(1)
    print("🏁 Done")
