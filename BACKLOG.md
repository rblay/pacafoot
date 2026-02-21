# Pacafoot — Backlog

Items are grouped by theme. Priority is not implied by order within a group.

## Legend
- ✅ Done
- 📋 To do

---

## Match Engine

- 📋 **Minute-by-minute simulation display** — animated event feed with timer/pause controls; events array already generated internally, just needs UI
- 📋 **Follow other match results live** — while playing your match, show a live scores panel for other fixtures in the round
- 📋 **Improve simulation logic** — incorporate formation, play style (defensive/attacking), and pressing intensity into goal probability
- 📋 **Review team strength calculation** — audit current position-weight model; consider form, home advantage, fatigue
- 📋 **Cards and suspensions** — yellow/red card events during simulation; accumulated yellows and reds trigger match bans
- 📋 **Injuries and recovery** — players can get injured during matches; recovery takes N rounds; injured players unavailable for selection

## Season & Competition Structure

- 📋 **Season end screen** — detect end of round 38; show final standings, champion banner, promoted/relegated teams
- 📋 **Multi-season** — after season ends, roll over to next season; update squads, reset standings, keep save continuity
- 📋 **Relegation and promotion** — bottom 4 drop to Série B (or placeholder division); top teams of lower division come up
- 📋 **Additional tournaments** — Copa do Brasil, Libertadores, Sul-Americana; separate bracket/group stage views
- 📋 **Top scorers and clean sheets table** — per tournament; shown in league/competition view
- 📋 **Player season statistics** — goals, assists, yellow/red cards, matches played; visible on player detail or squad table

## Squad Management

- 📋 **Player fatigue/energy system** — players lose energy after matches; energy affects rating in simulation; recovers between rounds
- 📋 **Transfer market** — buy/sell players between rounds; budget system; AI clubs also make transfers
- 📋 **Player retirement and regens** — older players retire at season end; new youth players enter the game to replace them
- 📋 **Youth squads and scouting** — scout young players; promote from youth to senior squad
- 📋 **Head coach and board confidence** — confidence meter affected by results; low confidence → sack threat; high confidence → transfer budget bonus
- 📋 **Set piece takers** — designate corner, free kick, and penalty takers; influences who scores from those situations

## Tactics & Lineup UI

- 📋 **View other squad details** — clicking a team name in the league table opens a read-only squad/tactics view for that club
- 📋 **Shirt number selection** — assign squad numbers to players (cosmetic; shown in match view and squad table)
- 📋 **Nationality flags** — small flag icon next to player names on lineup selection screen (cosmetic)
- 📋 **Team star indicator** — star marker on top-rated players in lineup screen (cosmetic)
- 📋 **Tooltips for player attributes** — hover/tap on column headers (F, Passe, Car., etc.) to see what each stat means

## Stadium & Finances

- 📋 **Stadium improvements** — spend revenue to expand capacity or upgrade facilities; affects matchday income
- 📋 **Ticket pricing** — set ticket prices each round; higher prices reduce attendance; revenue funds transfers and wages

## Data & Content

- 📋 **Real player database** — replace AI-estimated bench players with verified squad data; schema is stable, JSON-only change (football-data.org / API-Football free tier)
- 📋 **Team logos** — SVG or PNG crests in `/public/data/leagues/serie_a/logos/`; shown in team view header and league table
- 📋 **Player photos** — thumbnail images linked from player records; shown in squad table and player detail
- 📋 **Mod files / historical seasons** — data-driven: swap in a different `teams.json` + `players.json` to simulate e.g. 2005 Brasileirão; needs a season/mod picker on StartScreen
- 📋 **Multiple leagues** — add `leagues/` entries for other competitions (Série B, Liga Portuguesa, etc.); league picker on StartScreen

## Platform & Meta

- 📋 **Open-source setup** — review license, contributing guide, and any data/asset copyright issues before making repo public
- 📋 **Analytics** — integrate PostHog or Google Analytics to understand feature usage and drop-off points
- 📋 **Feature request page** — public page (e.g. Canny, GitHub Discussions, or custom) where users submit and upvote features
- 📋 **Save state checkpointing** — allow saving a named snapshot before a key match; load that snapshot to replay from that point (e.g. "save before the final")
- 📋 **Admin control panel** — internal view to inspect active saves, tweak global game parameters, and monitor usage (scope TBD)

---

## Done ✅

- League table — 20 Serie A teams, correct points system (PG/J/V/E/D/GP/GC/SG), position colour coding
- Team management view — team-coloured left panel, squad table, tactics dropdowns
- Starting XI selector — click to select/deselect; validation (exactly 11, including 1 GK and positional minimums)
- Match simulation engine — minute-by-minute probability model run internally; instant result displayed
- Match result display — final score, scorers with minutes, both lineups
- League table updates — points, goals, wins/draws/losses applied after each round
- Full 38-round schedule — circle-method double round-robin, all 10 fixtures per round simulated
- Save/load — localStorage auto-save after each match; Novo Jogo resets state
- EN/PT i18n toggle — key-value lookup; preference persisted in localStorage
- Persist lineup between matches — last used lineup restored when returning to team view
