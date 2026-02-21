# Pacafoot - Project Conventions

## Overview
Brasfoot-inspired browser football manager game. React + TypeScript + Vite. Pure client-side, no backend.

## Tech Stack
- React 19 + TypeScript (strict mode, no `any`)
- Vite for bundling
- Vitest for testing
- CSS Modules for component styling
- LocalStorage for game saves
- No external UI libraries — custom retro styling

## Code Conventions
- **Language**: TypeScript strict, no `any` types
- **Components**: Functional components with hooks
- **Styling**: CSS Modules (`.module.css` files), global theme in `src/styles/theme.css`
- **State**: React useState/useReducer, no external state library
- **Data**: Static JSON in `/public/data/`, loaded via fetch
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`)
- **Branches**: Always create a feature branch from `main`; never commit directly to `main`

## File Structure
```
src/
  components/
    layout/     — AppContainer, TopMenu, StatusBar
    start/      — StartScreen (team picker)
    league/     — LeagueTable
    team/       — TeamView, SquadList, TacticsPanel
    match/      — MatchResult
  engine/       — fixtures.ts, simulation.ts, teamStrength.ts
  hooks/        — useGameData.ts
  locales/      — en.json, pt.json, i18n.ts
  styles/       — theme.css (CSS variables)
  utils/        — storage.ts, dataLoader.ts
  types/        — index.ts (all interfaces)
public/
  data/leagues/serie_a/ — teams.json, players.json
```

## Key Design Decisions
- Position codes: G (goalkeeper), L (left back), Z (center back), M (midfielder), A (attacker)
- Team strength: weighted average (A=1.4x, M=1.1x, Z/L=0.9x, G=0.5x)
- Retro aesthetic: green backgrounds, team-colored panels, embossed buttons
- i18n: simple key-value lookup, player/team names never translated
- Save format: JSON in LocalStorage under key "pacafoot_save"

## Testing
- `npm test` — run all tests once (Vitest); required before committing engine/util changes
- `npm run test:watch` — watch mode for TDD
- `npm run dev` — start dev server
- `npm run build` — production build; must pass with no errors
- Tests are co-located with source as `*.test.ts`; cover engine and utils only (no component tests)

## Workflow Checklist
Before committing, always:
1. **Create a branch** — never commit directly to `main`; use `feat/`, `fix/`, or `chore/` prefix; push the branch to remote and merge via PR on GitHub
2. **Review `CLAUDE.md`** — ensure conventions are current; remove anything outdated
3. **Review `BACKLOG.md`** — mark items done, add newly discovered work, adjust as needed
4. **Review `README.md`** — update if project structure, setup steps, or features have changed
