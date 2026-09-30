# <img src="public/matchdule-logo.svg" alt="Matchdule logo" width="220">

[![CI](https://github.com/slroberts/matchdule/actions/workflows/ci.yml/badge.svg)](https://github.com/slroberts/matchdule/actions/workflows/ci.yml)
[![Live app](https://img.shields.io/badge/live-matchdule.vercel.app-0B0F24)](https://matchdule.vercel.app)

A phone-first schedule app for youth soccer parents. Matchdule pulls league schedules into a cloud database and turns them into a UI that answers the questions parents actually ask: **Where do I need to be next? Can I make both games? How is the season going?** It flags overlapping games, tight turnarounds, and missing kickoff times before they become a problem.

**[Open the app →](https://matchdule.vercel.app)**

<img src="docs/social-preview.png" alt="Matchdule schedule and season screens" width="760">

## 📱 Screens

|                                               Schedule                                               |                                          Season                                           |                                   Filters                                    |
| :--------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="docs/screenshots/schedule.png" width="240" alt="Schedule with the next game highlighted">  | <img src="docs/screenshots/season.png" width="240" alt="Season snapshot with team cards"> |   <img src="docs/screenshots/filters.png" width="240" alt="Filter sheet">    |
| The next game is a dark "Versus" card with a countdown; everything else collapses to scannable rows. |     Each team's season at a glance: points, a W/D/L bar, form, and achievement flags.     | A bottom sheet that prevents zero-result combinations before you apply them. |

## 🏗 Architecture & Data Pipeline

Matchdule isn't just a frontend — it's a complete scheduling system:

1. **Schedule sync:** A Python + Playwright job reads the league's public schedule pages and cleans the data (team names, dates, venues) before storing it.
2. **Safe writes:** Games are deduplicated and upserted by game ID, stamped with a sync time, and games the league removed are pruned — only after a successful read, and only within their own season.
3. **Cloud database:** Everything lives in a **Supabase** PostgreSQL database.
4. **Scheduling engine:** The Next.js App Router loads the data server-side and runs it through a custom engine that calculates exact overlaps, turnaround gaps, live status, and season stats.
5. **Honest about freshness:** The sync time powers an "Updated 12 min ago" line in the app, which turns into a warning if the data is more than a day old.

> **A note on the sync job:** It runs on GitHub Actions twice a day and **stops immediately if the source site serves a bot check** instead of trying to get around it. When a run is stopped, the app keeps serving the last good data and tells parents when it's out of date.

## ✨ Features

**Schedule**

- **Focus stack:** The next game (or every live game) is highlighted as a dark "Versus" card; all other games collapse to _who · vs whom · where_ rows. The highlight never swaps while you're looking at it.
- **Live game states:** A countdown on game day, a live score with a pulse, final results, and **"Pending"** when a game is over but the score isn't posted yet.
- **Conflict & tight-gap detection:** The engine flags overlapping games and turnarounds under an hour — as a week-level alert parents can mute, plus markers on each affected game.
- **Season-aware:** "Next up" links to the next game, a _Final week_ marker, and a **"That's a wrap"** recap when a season ends, pointing to the next season's first game.

**Season tab**

- One season at a time with a ‹ › season pager, and a card per team with points, W/D/L proportions, goals, last-5 form, and **Undefeated / win-streak** flags.

**Filters**

- A bottom sheet that filters by team side, age group, time of day, game status, result, and alerts — and **prevents combinations that would return nothing** before you apply them. Active filters show as removable chips and persist across weeks.

**Everywhere**

- **Shareable URLs:** The week, tab and season live in the URL (`?date=…&view=season&season=spring-2026`), so links can be shared and the back button works — without refetching data when switching tabs.
- **Server-rendered state:** The selected team and filters are stored in cookies and read on the server, so the page renders correctly on first load with no flash.
- **Loading, error & empty states:** A loading shell (the real header and tabs, with shimmering rows), a "Couldn't load the schedule · Try again" state, and distinct "Rest week" / "No results" states.
- **Share & directions:** The native share sheet (with a clipboard fallback on desktop) and one-tap directions, disabled for TBD fields.
- **Installable PWA:** Works from the home screen, with iOS status-bar and splash-screen handling.

## 🎨 Design System

Designed in **Figma first**, then built — every screen and state exists in both.

- **Tokens as the source of truth:** Figma variables in three collections — _Primitives_, _Color_ (Light / Dark modes) and _Density_ (Compact / Regular) — generate `styles/globals.css`, so design and code share the same names (`--color-text-secondary`, `--space-card-pad`, …).
- **Clear visual rules:** Dark = headline (header, the next-game card, season summary, week alerts) · a quiet pill with a colored icon = marker (tight gap, pending) · teal = "you are here" · green = winning.
- **Accessibility (WCAG 2.1 AA):** 44 px tap targets, contrast-checked tokens in both modes, icons never carry meaning alone, polite screen-reader announcements, keyboard focus management, and reduced-motion support.
- **No component library:** Every component is custom, built with Tailwind CSS and animated with Framer Motion.

## 🛠 Tech Stack

**Frontend**

- **Framework:** Next.js 16 (App Router, streaming + Suspense), React 19, TypeScript
- **Styling:** Tailwind CSS 4 with a token-driven design system
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **PWA:** Serwist

**Data & Automation**

- **Database:** Supabase (PostgreSQL)
- **Schedule sync:** Python & Playwright
- **Automation:** GitHub Actions (sync job + CI)

**Testing & Documentation**

- **Unit testing:** Vitest — **150+ tests** covering date and venue parsing, the scheduling engine, season stats, and the match clock. They run in **both New York and UTC**, because the server renders in UTC while every game is in New York (this caught a real bug where late games landed on the wrong day).
- **Component testing:** Storybook 10 with a story for every component state, a pinned clock so time-based states render the same every run, interaction tests (muting alerts, keyboard tab switching, focus after removing a filter), and automated accessibility checks.
- **CI:** Every push runs lint, type-checking, the unit tests, and the Storybook tests. `npm run build` also runs the tests first, so a broken data rule can't deploy.

## 🚀 Run it locally

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + publishable key
npm run dev                  # http://localhost:3000
```

| Command                  | What it does                    |
| ------------------------ | ------------------------------- |
| `npm run dev`            | Dev server                      |
| `npm test`               | Unit tests in watch mode        |
| `npm run test:ci`        | Unit tests in New York and UTC  |
| `npm run storybook`      | Component workshop on port 6006 |
| `npm run test:storybook` | Stories as browser tests        |
| `npm run build`          | Tests, then a production build  |

## 🗺 Roadmap

- [x] Schedule sync (Python + Playwright) & Supabase integration
- [x] Core scheduling engine (overlaps, turnaround gaps, live status)
- [x] Match cards with share & directions
- [x] Alert system (conflicts, tight gaps, TBD times)
- [x] Filter sheet with zero-result prevention
- [x] Server-rendered state (cookies) & shareable URLs
- [x] Focus stack with the next-game "Versus" card
- [x] Season tab with achievement flags and season pager
- [x] Loading, error & data-freshness states
- [x] Unit + Storybook test suites in CI
- [ ] **Add to calendar** for each game, then a subscribable feed per team
- [ ] Push notifications for schedule changes and night-before tight-gap reminders
