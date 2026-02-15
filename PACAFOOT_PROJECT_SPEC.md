# Brasfoot Browser - Project Specification

## Project Overview
Build a browser-based football management game inspired by Brasfoot (circa 2005). Pure client-side React app with authentic retro aesthetic.

## Tech Stack
- React + TypeScript (Vite)
- CSS Modules for theming
- LocalStorage for saves
- No backend

## Visual Reference
**6 screenshots provided show exact UI patterns to replicate**

### Core Aesthetic (from screenshots):
- **Color scheme**: Green grass-textured backgrounds, team-colored panels for tactical screens
- **Typography**: Arial/Verdana, 10-12px, bold headers
- **Components**: 
  - Embossed gray buttons with subtle 3D effect
  - White data tables with alternating row colors and gray gridlines
  - Red horizontal progress bars for energy/fitness
  - Blue table headers with white text
  - Dropdowns with white background and down arrows
  - Top tab navigation (white/gray inactive, white active)
- **Layout patterns**:
  - League table: Two-column division view with color-coded positions (blue=top 4, red=relegation)
  - Team view: Colored left sidebar (tactics/controls), white right panel (squad table)
  - Match view: Green field background, side-by-side team lineups, center score/events
  - Search screens: Green background, white content panels

### **CRITICAL - Team Color Theming**:
The tactical/team management screen (Screenshot 1 shows Internacional with red sidebar) should use **team-specific colors**:
- Data structure needs: `team.primaryColor` and `team.secondaryColor` (hex codes)
- Left sidebar background uses `team.primaryColor`
- Can default to green for initial development
- Examples from Brazilian teams:
  - Flamengo: Red/Black (`#c8102e`, `#000000`)
  - Palmeiras: Green/White (`#006437`, `#ffffff`)
  - Corinthians: White/Black (`#ffffff`, `#000000`)
  - Internacional: Red/White (`#e20e0e`, `#ffffff`)

## Data Layer

### FBRef API Data Fetching
Create script to pull Serie A 2024-25 data and generate:

**`/public/data/leagues/serie_a/teams.json`**:
```json
{
  "id": "flamengo",
  "name": "Flamengo",
  "primaryColor": "#c8102e",
  "secondaryColor": "#000000",
  "stadium": "Maracanã",
  "coach": "Tite"
}
```

**`/public/data/leagues/serie_a/players.json`**:
```json
{
  "id": "gabigol",
  "name": "Gabigol",
  "teamId": "flamengo",
  "position": "A",  // G, L, Z, M, A
  "rating": 78,     // 1-100 (derive from FBRef stats)
  "age": 27,
  "nationality": "BRA",
  "salary": 500000,
  "passRating": 65, // Derived stat
  "energy": 100,    // Fitness %
  "characteristics": ["Vel/Fin", "Dri/Cab"] // Abilities
}
```

**Rating Formula**: Document in code comments how you convert FBRef metrics → 1-100 rating

## Core Features - Phase 1

### 1. League Table
- Display 20 Serie A teams: Position | Team | PG | J | V | E | D | GP | GC | SG
- Color coding: Top 4 blue, bottom 4 red
- Click team → Team Management View
- Initially all stats at 0

### 2. Team Management View
**Left Panel** (team.primaryColor background):
- Team logo, name, division
- Coach name
- Confidence bars (visual only for now)
- Next match info
- Tactical dropdowns (visual only):
  - Formation selector
  - Play style (Defensive/Balanced/Attacking)
  - Attack focus (Wings/Center)
  - Pressing intensity
- **"Jogar >>"** button (enabled when 11 valid players selected)

**Right Panel** (white):
- Squad table: P | Nome | Função | F | Energia | Salário | Passe | G | Car. | I | M
- Click players to select/deselect for starting XI
- Bottom counter: "Selecionados: X titulares Y reservas"
- Validation: Exactly 11 starters (1 GK, 3-5 L/Z, 2-5 M, 1-3 A)

### 3. Match Simulation Engine

**Architecture** (Phase 2 ready):
```javascript
function simulateMatch(homeTeam, awayTeam, homeXI, awayXI) {
  const homeStrength = calculateTeamStrength(homeXI);
  const awayStrength = calculateTeamStrength(awayXI);
  
  // Simulate minute-by-minute internally
  const events = generateMatchEvents(homeStrength, awayStrength, homeXI, awayXI);
  
  // Phase 1: Return final state only
  // Phase 2: Expose events array progressively with pause/resume
  return {
    homeScore: events.filter(e => e.type === 'goal' && e.team === 'home').length,
    awayScore: events.filter(e => e.type === 'goal' && e.team === 'away').length,
    events: events, // Full array for Phase 2
    finalMinute: 90
  };
}

function generateMatchEvents(homeStr, awayStr, homeXI, awayXI) {
  const events = [];
  for (let min = 1; min <= 90; min++) {
    // Goal probability based on strength differential + position weights
    // Randomly select scorer from attacking players
    // Store as {minute, type: 'goal', player, team}
  }
  return events;
}
```

**Team Strength**: Average player ratings weighted by position (A=1.4x, M=1.1x, Z/L=0.9x, G=0.5x)

### 4. Match Result Display
- Show final score prominently
- List goal scorers: "⚽ 23' Gabigol (Flamengo)"
- Display both team lineups in side panels
- Update league table (points, goals, wins/draws/losses)
- "Voltar" button returns to league table

### 5. Localization
- `/src/locales/en.json` and `pt.json`
- Simple key-value pairs for UI strings only
- Toggle in top menu Options → Language
- Store preference in LocalStorage
- **Do not translate**: Player names, team names, coach names

### 6. Save/Load System
**LocalStorage schema**:
```javascript
{
  gameState: {
    leagueTable: [{teamId, position, played, won, drawn, lost, gf, ga, points}, ...],
    currentRound: 1,
    matchResults: [{round, homeTeam, awayTeam, homeScore, awayScore, events}, ...],
    selectedTeam: 'flamengo',
    teamLineups: {flamengo: {startingXI: [...], subs: [...]}}
  },
  settings: {language: 'pt'},
  lastSaved: timestamp
}
```
- Auto-save after each match
- Manual save button in status bar
- Load on app start

## File Structure
```
/src
  /components
    /layout
      AppContainer.tsx      // Main wrapper
      TopMenu.tsx          // Menu bar
      StatusBar.tsx        // Bottom status
    /league
      LeagueTable.tsx      // Main table view
    /team
      TeamView.tsx         // Team management screen
      SquadList.tsx        // Player table
      TacticsPanel.tsx     // Left colored sidebar
    /match
      MatchSimulator.tsx   // Simulation engine
      MatchResult.tsx      // Result display
  /engine
    simulation.ts          // Core match logic
    teamStrength.ts
  /locales
    en.json, pt.json
    i18n.ts
  /styles
    theme.css              // Color variables
  /utils
    storage.ts
  /types
    index.ts
  App.tsx
```

## Development Steps
1. Setup Vite + React + TypeScript
2. Create FBRef data fetching script → generate JSON files
3. Build visual theme CSS (extract exact colors from screenshots)
4. Static league table with dummy data (verify aesthetics)
5. Wire up data loading
6. Team management view with squad table
7. Starting XI selector with validation
8. Match simulation engine
9. Result display + league table updates
10. Save/load + i18n

## Future-Proofing
- **Phase 2**: Minute-by-minute display - just expose existing `events` array with timer controls
- **Phase 3**: Transfers - add `transferValue` and `forSale` to player schema
- **Multi-league**: Data structure already supports `/leagues/{league_id}/`
- **Copyright**: Add `config.ANONYMIZE_MODE` toggle to replace real names with generated ones

## Success Criteria
- [ ] Looks like Brasfoot (green backgrounds, team-colored panels, retro UI)
- [ ] Team management screen uses team.primaryColor for left sidebar
- [ ] Can select 11 valid starters and simulate matches
- [ ] Match results show scorers with minutes
- [ ] League table updates correctly
- [ ] Save/load works
- [ ] EN/PT toggle works
- [ ] 20 Serie A teams with real FBRef player data
