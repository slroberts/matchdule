import os
import re
from playwright.sync_api import sync_playwright
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def clean_team_name(name):
    if not name or name == "-":
        return "TBD"
    # Removes years and common suffixes
    cleaned = re.sub(
        r'(\d{4}|NYE|Maignan|Comets|Zidane|Baggio|Gold|Blue|PERSEUS)', '', name)
    return cleaned.split("  ")[0].strip()


def clean_venue(venue_text):
    if not venue_text or venue_text in ["-", "Hidden"]:
        return "TBD"
    return venue_text.split(" - ")[0].replace("TURF FIELD ", "").strip().title()


def scrape_teams(team_ids):
    all_matches = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        for team_id in team_ids:
            print(f"📡 Scraping Team: {team_id}...")
            url = f"https://system.gotsport.com/org_event/events/50946/schedules?team={team_id}"

            try:
                page.goto(url, wait_until="networkidle", timeout=60000)
                page.mouse.wheel(0, 500)
                page.wait_for_timeout(2000)

                # Get all rows on the page directly
                rows = page.query_selector_all("tr")
                team_match_count = 0

                for row in rows:
                    cols = row.query_selector_all("td")

                    # A valid GotSport match row always has at least 6 columns
                    if len(cols) < 6:
                        continue

                    # Grab the Game ID directly from the HTML to bypass rendering tricks
                    g_id = cols[0].evaluate("node => node.textContent").strip()

                    # STANDINGS FILTER: Standings rows start with ranks (1, 2, 3)
                    # Real matches have IDs that are 3+ digits long. If it's short, skip it.
                    if not g_id.isdigit() or len(g_id) < 3:
                        continue

                    # Based on the exact headers you just pulled:
                    # 0: Match # | 1: Time | 2: Home | 3: Result | 4: Away | 5: Location
                    try:
                        all_matches.append({
                            "game_id": g_id,
                            "team_queried": team_id,
                            "date_time": cols[1].evaluate("node => node.textContent").split(" EDT")[0].replace("\n", " ").strip(),
                            "home_team": clean_team_name(cols[2].evaluate("node => node.textContent")),
                            "score_or_status": cols[3].evaluate("node => node.textContent").replace("\n", " ").strip(),
                            "away_team": clean_team_name(cols[4].evaluate("node => node.textContent")),
                            "venue": clean_venue(cols[5].evaluate("node => node.textContent"))
                        })
                        team_match_count += 1
                    except Exception as e:
                        print(f"⚠️ Skipped malformed row {g_id}: {e}")
                        continue

                if team_match_count == 0:
                    print(f"⚠️ No valid match rows found for {team_id}.")
                else:
                    print(
                        f"✅ Successfully found {team_match_count} matches for {team_id}")

            except Exception as e:
                print(f"❌ Error on {team_id}: {e}")

        browser.close()
    return all_matches


def push_to_supabase(data):
    if not data:
        print("⚠️ No data found to push.")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        supabase.table("matches").upsert(data).execute()
        print(f"✅ Successfully synced {len(data)} matches to Supabase.")
    except Exception as e:
        print(f"❌ Supabase Push Error: {e}")


if __name__ == "__main__":
    teams = ["3705640", "3802474"]
    scraped_data = scrape_teams(teams)
    push_to_supabase(scraped_data)
