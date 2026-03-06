# Pacafoot — Backlog

Strategy: nail simulation dynamics → transfers → expand DB.
Top rows are highest priority — order is the priority.

| Item | Theme | Status |
|------|-------|--------|
| **Auto-lineup from formation** — when a formation is selected, pre-fill the starting XI and bench with the best available players for that shape (e.g. 4-4-2 picks top 2 A, top 4 M, top 4 Z/L, top 1 G); user can still swap manually after | Tactics & Lineup | ✅ |
| **Substitutions during match** — manager makes up to 3 subs during the minute-by-minute feed; chosen sub pauses the clock, player swapped in affects simulation strength from that minute onward | Match Engine | ✅ |
| **View other squad details** — clicking a team name in the league table opens a read-only squad/tactics view for that club | Tactics & Lineup | ✅ |
| **Follow other match results live** — while playing your match, show a live scores panel for other fixtures in the round | Match Engine | ✅ |
| **Season end screen** — detect end of round 38; show final standings, champion banner, promoted/relegated teams | Season & Competition | ✅ |
| **Cards and suspensions** — yellow/red card events during simulation; accumulated yellows and reds trigger match bans | Match Engine | ✅ |
| **Cap red cards per match** — edge case: prevent more than 4 players being sent off in one game (simulation guardrail) | Match Engine | 📋 |
| **Forfeit due to unavailability** — if a team cannot field 11 players due to suspensions or injuries, they lose the match 3-0 by default | Match Engine | 📋 |
| **Injuries and recovery** — players can get injured during matches; recovery takes N rounds; injured players unavailable for selection | Squad Management | 📋 |
| **Transfer market** — buy/sell players between rounds; budget system; AI clubs also make transfers | Squad Management | 📋 |
| **Real player database** — replace AI-estimated bench players with verified squad data; schema is stable, JSON-only change (football-data.org / API-Football free tier) | Data & Content | 📋 |
| **Improve simulation logic** — incorporate formation, play style (defensive/attacking), and pressing intensity into goal probability | Match Engine | 📋 |
| **Review team strength calculation** — audit current position-weight model; consider form, home advantage, fatigue | Match Engine | 📋 |
| **Multi-season** — after season ends, roll over to next season; update squads, reset standings, keep save continuity | Season & Competition | 📋 |
| **Relegation and promotion** — bottom 4 drop to Série B (or placeholder division); top teams of lower division come up | Season & Competition | 📋 |
| **Additional tournaments** — Copa do Brasil, Libertadores, Sul-Americana; separate bracket/group stage views | Season & Competition | 📋 |
| **Top scorers and clean sheets table** — per tournament; shown in league/competition view | Season & Competition | 📋 |
| **Player season statistics** — goals, assists, yellow/red cards, matches played; visible on player detail or squad table | Season & Competition | 📋 |
| **Player fatigue/energy system** — players lose energy after matches; energy affects rating in simulation; recovers between rounds | Squad Management | 📋 |
| **Player retirement and regens** — older players retire at season end; new youth players enter the game to replace them | Squad Management | 📋 |
| **Youth squads and scouting** — scout young players; promote from youth to senior squad | Squad Management | 📋 |
| **Head coach and board confidence** — confidence meter affected by results; low confidence → sack threat; high confidence → transfer budget bonus | Squad Management | 📋 |
| **Set piece takers** — designate corner, free kick, and penalty takers; influences who scores from those situations | Squad Management | 📋 |
| **Shirt number selection** — assign squad numbers to players (cosmetic; shown in match view and squad table) | Tactics & Lineup | 📋 |
| **Nationality flags** — small flag icon next to player names on lineup selection screen (cosmetic) | Tactics & Lineup | 📋 |
| **Team star indicator** — star marker on top-rated players in lineup screen (cosmetic) | Tactics & Lineup | 📋 |
| **Tooltips for player attributes** — hover/tap on column headers (F, Passe, Car., etc.) to see what each stat means | Tactics & Lineup | 📋 |
| **Stadium improvements** — spend revenue to expand capacity or upgrade facilities; affects matchday income | Stadium & Finances | 📋 |
| **Ticket pricing** — set ticket prices each round; higher prices reduce attendance; revenue funds transfers and wages | Stadium & Finances | 📋 |
| **Team logos** — SVG or PNG crests in `/public/data/leagues/serie_a/logos/`; shown in team view header and league table | Data & Content | 📋 |
| **Player photos** — thumbnail images linked from player records; shown in squad table and player detail | Data & Content | 📋 |
| **Mod files / historical seasons** — data-driven: swap in a different `teams.json` + `players.json` to simulate e.g. 2005 Brasileirão; needs a season/mod picker on StartScreen | Data & Content | 📋 |
| **Multiple leagues** — add `leagues/` entries for other competitions (Série B, Liga Portuguesa, etc.); league picker on StartScreen | Data & Content | 📋 |
| **Open-source setup** — review license, contributing guide, and any data/asset copyright issues before making repo public | Platform & Meta | 📋 |
| **Analytics** — integrate PostHog or Google Analytics to understand feature usage and drop-off points | Platform & Meta | 📋 |
| **Feature request page** — public page (e.g. Canny, GitHub Discussions, or custom) where users submit and upvote features | Platform & Meta | 📋 |
| **Save state checkpointing** — allow saving a named snapshot before a key match; load that snapshot to replay from that point | Platform & Meta | 📋 |
| **Admin control panel** — internal view to inspect active saves, tweak global game parameters, and monitor usage (scope TBD) | Platform & Meta | 📋 |

---

## Done ✅

| Item | Theme |
|------|-------|
| Minute-by-minute simulation display — animated event feed with timer/pause controls; auto-plays on match open | Match Engine |
| League table — 20 Serie A teams, correct points system (PG/J/V/E/D/GP/GC/SG), position colour coding | Season & Competition |
| Team management view — team-coloured left panel, squad table, tactics dropdowns | Tactics & Lineup |
| Starting XI selector — click to select/deselect; validation (exactly 11, including 1 GK and positional minimums) | Tactics & Lineup |
| Match simulation engine — minute-by-minute probability model run internally; instant result displayed | Match Engine |
| Match result display — final score, scorers with minutes, both lineups | Match Engine |
| League table updates — points, goals, wins/draws/losses applied after each round | Season & Competition |
| Full 38-round schedule — circle-method double round-robin, all 10 fixtures per round simulated | Season & Competition |
| Save/load — localStorage auto-save after each match; Novo Jogo resets state | Platform & Meta |
| EN/PT i18n toggle — key-value lookup; preference persisted in localStorage | Platform & Meta |
| Persist lineup between matches — last used lineup restored when returning to team view | Tactics & Lineup |
| Substitutions during match — up to 5 subs per team; sub panel pauses the match, re-simulates remainder; AI makes 0–3 random subs in second half | Match Engine |
