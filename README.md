# Pacafoot

A Brasfoot-inspired browser football manager game. Pick a Serie A team, set your tactics, and simulate the 2024-25 season — all client-side, no backend required.

**Live:** https://rblay.github.io/pacafoot/

---

## Getting started

```bash
npm install
npm run dev       # dev server → http://localhost:5173/pacafoot/
```

## Testing

Tests are co-located with source files (`*.test.ts`) and run with Vitest.

```bash
npm test              # run once (used in CI)
npm run test:watch    # watch mode for TDD
```

Tests cover pure logic only — engine functions and storage utilities. Run them before committing any engine or utility changes.

## Building

```bash
npm run build   # type-check + Vite production build → dist/
```

CI runs `npm test && npm run build` on every push to `main`. A failing test blocks deployment.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Bundler | Vite |
| Styling | CSS Modules + global retro theme |
| Tests | Vitest |
| Persistence | localStorage |
| Deployment | GitHub Pages via GitHub Actions |

No external UI libraries. No backend.

---

## Project structure

```
src/
  components/
    layout/       — AppContainer, TopMenu, StatusBar
    start/        — StartScreen (team picker)
    league/       — LeagueTable
    team/         — TeamView, SquadList, TacticsPanel
    match/        — MatchResult
  engine/
    fixtures.ts   — round-robin schedule generator (38 rounds × 10 fixtures)
    simulation.ts — minute-by-minute match simulator
  locales/        — pt.json, en.json, i18n.ts
  styles/         — theme.css (CSS variables)
  utils/
    storage.ts    — localStorage save/load
    dataLoader.ts — fetch teams + players from /public/data/
  types/          — index.ts (all interfaces)
  hooks/          — useGameData.ts

public/
  data/leagues/serie_a/
    teams.json    — 20 teams (name, colors, stadium, coach, capacity)
    players.json  — 500 players, 25 per team
```

## Game data

Player and team data is static JSON in `public/data/`. Teams and starting XIs are accurate for Serie A 2024-25; bench depth players are approximated. Ratings, salaries, and stats are AI-estimated.

To replace with real data, swap `teams.json` and `players.json` — no code changes needed as long as the schema matches `src/types/index.ts`.

## Resetting a save

Open the browser console and run:
```js
localStorage.removeItem('pacafoot_save')
```
Or use **Novo Jogo** in the top menu in-game.
