# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo contains a single project: `fifa-world-cup-2026-ical/` — a Node.js script that fetches the 2026 FIFA World Cup schedule and generates `.ics` calendar files plus a static HTML download page.

```
fifa-world-cup-2026-ical/
├── generate.js        # entry point — orchestrates fetch + generate phases
├── src/
│   ├── fetch.js       # ESPN API fetch + data normalisation
│   ├── ical.js        # iCal formatting (VEVENT, VCALENDAR, slugify, flag emojis)
│   └── html.js        # builds index.html string
├── data/
│   └── schedule.json  # cached match data — committed, re-fetched with --refresh
├── output/            # generated .ics files — committed
└── index.html         # generated download page — committed
```

## Commands

All commands run from inside this directory.

```bash
npm test                        # run all 21 tests (Node built-in test runner)
node --test tests/ical.test.js  # run a single test file
node generate.js                # regenerate output from cached data/schedule.json
node generate.js --refresh      # re-fetch from ESPN API, then regenerate
```

## Architecture

`generate.js` runs two sequential phases:

1. **Fetch phase** — skipped if `data/schedule.json` exists and `--refresh` is not passed. Otherwise calls `fetchAndNormalize()` in `src/fetch.js`, which hits the ESPN public API and writes the result to `data/schedule.json`.

2. **Generate phase** — reads `data/schedule.json`, then deletes every existing `*.ics` file in `output/` before writing `output/all.ics` (all 104 matches), one `output/<slug>.ics` per team, and `index.html` at the project root. The upfront wipe prunes stale calendars for matchups that dropped out of the schedule (e.g. resolved placeholders like `round-of-32-1-winner.ics`, or slug changes like `usa.ics` → `united-states.ics`) so they don't linger from previous runs.

### Data source

Live data comes from ESPN's undocumented public API — no auth required:
```
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200
```
`src/fetch.js` also contains a legacy `normalizeMatches()` function for the openfootball format (kept for its tests), but `fetchAndNormalize()` uses ESPN exclusively.

### Match schema (`data/schedule.json`)

```json
{
  "matchNumber": 1,
  "stage": "Group Stage",
  "group": null,
  "homeTeam": "Mexico",
  "awayTeam": "South Africa",
  "kickoffUTC": "2026-06-11T19:00:00.000Z",
  "venue": "Estadio Banorte",
  "city": "Mexico City",
  "country": "MX"
}
```

`group` is always `null` — ESPN's API doesn't expose group letters.

### iCal format

All times are UTC. Each event has a stable UID (`fifa2026-match-001@fifa-world-cup-2026`), a 2-hour fixed duration, no alerts, and a SUMMARY like:
```
Group Stage: 🇲🇽 Mexico vs 🇿🇦 South Africa — Mexico City
```
Flag emojis come from the `TEAM_FLAGS` lookup in `src/ical.js`. Unknown/placeholder team names (e.g. `"Round of 32 4 Winner"`) get no flag.

## Deployment

The generated files (`output/`, `index.html`) are committed to the repo and must also be copied to `../isaacarnold.github.io/fifa-world-cup-2026-ical/` to go live at `https://isaacarnold.dev/fifa-world-cup-2026-ical/`.

The `isaacarnold.github.io` repo is what actually serves `isaacarnold.dev` — GitHub Pages project-repo routing does not work with this custom domain setup.

**Full refresh + deploy:**
```bash
cd /Users/isaac/web-projects
node fifa-world-cup-2026-ical/generate.js --refresh
cp fifa-world-cup-2026-ical/index.html isaacarnold.github.io/fifa-world-cup-2026-ical/
# Mirror output/ so resolved placeholders are pruned — a plain `cp -r` leaves
# stale calendars (e.g. round-of-16-*-winner.ics) behind in the deploy repo.
rm -rf isaacarnold.github.io/fifa-world-cup-2026-ical/output
cp -r fifa-world-cup-2026-ical/output isaacarnold.github.io/fifa-world-cup-2026-ical/output
cd isaacarnold.github.io && git add fifa-world-cup-2026-ical/ && git commit -m "chore: refresh World Cup schedule" && git push
```
