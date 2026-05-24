# ⚽ Matchdule

A modern, parent-centric web application designed to solve the logistical headaches of youth sports scheduling. Matchdule features a fully automated data pipeline that scrapes dynamic schedule data, stores it in the cloud, and serves it through an intelligent UI that flags overlaps, tight turnarounds, and pending game times.

## 🏗 Architecture & Data Pipeline

Matchdule isn't just a frontend—it's a complete automated scheduling system:

1. **Automated Scraping:** A custom Python web scraper utilizing headless browsers navigates the target scheduling sites and extracts the latest team schedules and location assignments.
2. **CI/CD Automation:** A GitHub Action is configured as a cron job to execute the Python scraper automatically, ensuring the data is always up-to-date without manual intervention.
3. **Cloud Database:** The extracted and cleaned schedule data is pushed directly to a **Supabase** PostgreSQL database.
4. **Intelligent Frontend:** The Next.js App Router fetches the live data from Supabase and processes it through a custom scheduling engine to calculate exact minute overlaps and travel gaps.

## ✨ Features

- **Intelligent Conflict Detection:** The scheduling engine automatically scans weekend matchups and flags overlapping game times or physically impossible turnarounds.
- **Persistent Timeline Filtration:** A sophisticated, fluid bottom-sheet drawer allows users to apply filters as a persistent lens over the timeline. Users can refine schedules by team side (Home/Away), match status (Upcoming/Final), time of day, or specific urgency alerts, all while seamlessly paginating through weeks without losing their filter context.
- **Zero-Shift Server Hydration:** User filter preferences and active teams are securely persisted via cookies and parsed server-side. This guarantees the UI renders instantly on load with the correct data—eliminating client-side flashes and layout shifts.
- **Smart UI Alerts & Contextual Empty States:** Progressive disclosure alerts warn parents of schedule conflicts and "TBD" game times. The interface maintains a perfectly stable, unified layout between standard and filtered states, utilizing an iOS-style notification badge to silently indicate active filters and intelligently swapping between "Rest Week" and "No Results" empty states.
- **Native Web Sharing:** Integrated with the OS-level Web Share API, allowing parents to text beautifully formatted game details directly to family members, with a seamless clipboard fallback for desktop.
- **One-Tap Directions:** Universal cross-platform Google Maps deep-linking gets parents to the right field immediately, with visual and functional disable-states for unassigned "TBD" locations.
- **Custom Design System:** The entire UI is built from scratch using Tailwind CSS and animated with Framer Motion. It relies on a bespoke component architecture rather than pre-built UI libraries.

## 🛠 Tech Stack

**Frontend**

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Components:** 100% Custom UI Architecture

**Data & Automation**

- **Database:** Supabase (PostgreSQL)
- **Data Extraction:** Python & Playwright (Dynamic headless web scraping)
- **Automation:** GitHub Actions (Cron scheduling)

**Testing & Documentation**

- **UI Sandboxing:** Storybook (Component isolation and visual state testing)
- **Unit Testing:** Vitest (Core scheduling logic & engine math)

## 🚀 Roadmap

- [x] Python Web Scraper (Playwright) & Supabase Integration
- [x] GitHub Actions Automation Pipeline
- [x] Core Scheduling Engine (Overlap & Gap Math)
- [x] Interactive Match Cards (Share & Directions)
- [x] Smart Alert System
- [x] Advanced Filtration Engine & Filter Drawer
- [x] Server-Side State Hydration (Cookies)
- [ ] Push Notifications for Schedule Changes
