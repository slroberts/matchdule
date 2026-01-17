# Matchdule ⚽️
A fast, family-friendly schedule app that keeps multiple kids’ soccer weeks in sync—clean weekly views, filters, map links, and conflict/tight-gap alerts.

**Live:** https://matchdule.vercel.app

---

## What it does
Matchdule is built for families (and coaches) juggling multiple teams. It auto-focuses the **current week**, makes conflicts obvious, and keeps match-day info one tap away. :contentReference[oaicite:2]{index=2}

---

## Key features
- **Weekly schedule view** across multiple teams
- **Auto-select current/closest week** (so you’re never hunting)
- **Tight-gap warnings** for back-to-back games/travel constraints
- **Game cards** with opponent, time range, and field
- Quick actions like **Map / Share **
- **Filters** (team, home/away, result, time of day)
- **Results tracking** (W/L/D + score)
- **Google Sheets → CSV import** for easy updates :contentReference[oaicite:3]{index=3}

UX touches:
- **Pull to refresh**
- **Jump to Current** :contentReference[oaicite:4]{index=4}

---

## Tech stack
- Next.js (App Router) + React
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- Lucide icons :contentReference[oaicite:5]{index=5}

---

## Local development
```bash
git clone https://github.com/slroberts/matchdule.git
cd matchdule
npm install
npm run dev
