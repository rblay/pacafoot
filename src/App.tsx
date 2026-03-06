import { useState, useCallback, useMemo } from 'react';
import './styles/theme.css';
import AppContainer from './components/layout/AppContainer';
import TopMenu from './components/layout/TopMenu';
import StatusBar from './components/layout/StatusBar';
import StartScreen from './components/start/StartScreen';
import LeagueTable from './components/league/LeagueTable';
import TeamView from './components/team/TeamView';
import SquadView from './components/team/SquadView';
import MatchResultView from './components/match/MatchResult';
import SeasonEndScreen from './components/season/SeasonEndScreen';
import { useGameData } from './hooks/useGameData';
import { getTeamById, getTeamPlayers } from './utils/dataLoader';
import { simulateMatch } from './engine/simulation';
import { generateSchedule } from './engine/fixtures';
import { sortLeagueTable, saveGame, deleteSave, createDefaultGameState, hasSave } from './utils/storage';
import { setLanguage, t } from './locales/i18n';
import type { Language } from './locales/i18n';
import type { ViewType, TacticalConfig, MatchResult, GameState, LineupSelection, LeagueTableEntry, Player } from './types';

/** Auto-select the best available lineup for an AI-controlled team. */
function autoLineup(teamPlayers: Player[]): LineupSelection {
  const sorted = [...teamPlayers].sort((a, b) => b.rating - a.rating);
  return {
    startingXI: sorted.slice(0, 11).map(p => p.id),
    subs: sorted.slice(11, 18).map(p => p.id),
  };
}

/** Apply a single match result to the league table. */
function applyResult(table: LeagueTableEntry[], result: MatchResult): LeagueTableEntry[] {
  return table.map(entry => {
    if (entry.teamId === result.homeTeamId) {
      const won = result.homeScore > result.awayScore;
      const drawn = result.homeScore === result.awayScore;
      return {
        ...entry,
        played: entry.played + 1,
        won: entry.won + (won ? 1 : 0),
        drawn: entry.drawn + (drawn ? 1 : 0),
        lost: entry.lost + (!won && !drawn ? 1 : 0),
        goalsFor: entry.goalsFor + result.homeScore,
        goalsAgainst: entry.goalsAgainst + result.awayScore,
        points: entry.points + (won ? 3 : drawn ? 1 : 0),
      };
    }
    if (entry.teamId === result.awayTeamId) {
      const won = result.awayScore > result.homeScore;
      const drawn = result.homeScore === result.awayScore;
      return {
        ...entry,
        played: entry.played + 1,
        won: entry.won + (won ? 1 : 0),
        drawn: entry.drawn + (drawn ? 1 : 0),
        lost: entry.lost + (!won && !drawn ? 1 : 0),
        goalsFor: entry.goalsFor + result.awayScore,
        goalsAgainst: entry.goalsAgainst + result.homeScore,
        points: entry.points + (won ? 3 : drawn ? 1 : 0),
      };
    }
    return entry;
  });
}

/** Fixture info needed to render the live player match. */
interface PendingPlayerFixture {
  homeTeamId: string;
  awayTeamId: string;
  homeLineup: LineupSelection;
  awayLineup: LineupSelection;
  round: number;
  stadium: string;
  capacity: number;
}

function App() {
  const { teams, players, loading, error, gameState, settings, setGameState, setSettings } = useGameData();
  const [currentView, setCurrentView] = useState<ViewType>(() => hasSave() ? 'team' : 'start');
  const [viewingTeamId, setViewingTeamId] = useState<string | null>(null);
  const [pendingOtherResults, setPendingOtherResults] = useState<MatchResult[] | null>(null);
  const [pendingPlayerFixture, setPendingPlayerFixture] = useState<PendingPlayerFixture | null>(null);
  const [, forceRender] = useState(0); // for language re-render

  // Generate the full 38-round season schedule once from stable sorted team IDs.
  const schedule = useMemo(
    () => teams.length > 0
      ? generateSchedule([...teams].sort((a, b) => a.id.localeCompare(b.id)).map(t => t.id))
      : [],
    [teams]
  );

  const handleTeamSelect = useCallback((teamId: string) => {
    const newState = createDefaultGameState(teams, teamId);
    setGameState(newState);
    saveGame(newState, settings);
    setCurrentView('team');
  }, [teams, settings, setGameState]);

  const handleNewGame = useCallback(() => {
    if (!confirm(t('menu.newGameConfirm'))) return;
    deleteSave();
    setGameState(null);
    setPendingOtherResults(null);
    setPendingPlayerFixture(null);
    setCurrentView('start');
  }, [setGameState]);

  const handleNavigate = (view: 'league' | 'team') => {
    setCurrentView(view);
  };

  const handleTeamClick = (teamId: string) => {
    if (teamId === gameState?.selectedTeamId) {
      setCurrentView('team');
    } else {
      setViewingTeamId(teamId);
      setCurrentView('squad_view');
    }
  };

  const handleSave = useCallback(() => {
    if (!gameState) return;
    saveGame(gameState, settings);
    alert(t('save.saved'));
  }, [gameState, settings]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setSettings({ ...settings, language: lang });
    forceRender(n => n + 1);
  }, [settings, setSettings]);

  /**
   * Called when the player clicks "Jogar" in TeamView.
   * Simulates 9 non-player fixtures immediately; defers the player's match to MatchResult.
   */
  const handleStartMatch = useCallback((starters: string[], subs: string[], tactics: TacticalConfig) => {
    if (!gameState) return;
    const selectedTeamId = gameState.selectedTeamId;
    const roundIndex = gameState.currentRound - 1;

    if (roundIndex >= schedule.length) return;

    const roundFixtures = schedule[roundIndex];
    const playerFixture = roundFixtures.find(
      ([h, a]) => h === selectedTeamId || a === selectedTeamId
    );
    if (!playerFixture) return;

    const [pfHome, pfAway] = playerFixture;
    const playerLineup: LineupSelection = { startingXI: starters, subs };

    // Simulate all fixtures EXCEPT the player's own match
    const otherResults: MatchResult[] = [];
    for (const [hId, aId] of roundFixtures) {
      if (hId === selectedTeamId || aId === selectedTeamId) continue;

      const hTeam = getTeamById(teams, hId);
      const aTeam = getTeamById(teams, aId);
      if (!hTeam || !aTeam) continue;

      const hPlayers = getTeamPlayers(players, hId);
      const aPlayers = getTeamPlayers(players, aId);

      otherResults.push(
        simulateMatch(
          hId, aId,
          hPlayers, aPlayers,
          autoLineup(hPlayers), autoLineup(aPlayers),
          gameState.currentRound,
          hTeam.stadium,
          hTeam.capacity,
        )
      );
    }

    // Determine opposing team lineup (AI)
    const isHome = pfHome === selectedTeamId;
    const opponentId = isHome ? pfAway : pfHome;
    const opponentPlayers = getTeamPlayers(players, opponentId);
    const opponentLineup = autoLineup(opponentPlayers);

    const homeLineup = isHome ? playerLineup : opponentLineup;
    const awayLineup = isHome ? opponentLineup : playerLineup;

    const homeTeam = getTeamById(teams, pfHome);
    if (!homeTeam) return;

    // Persist lineup and tactics before navigating
    const updatedGameState: GameState = {
      ...gameState,
      teamLineups: { ...gameState.teamLineups, [selectedTeamId]: playerLineup },
      teamTactics: { ...gameState.teamTactics, [selectedTeamId]: tactics },
    };
    setGameState(updatedGameState);

    setPendingOtherResults(otherResults);
    setPendingPlayerFixture({
      homeTeamId: pfHome,
      awayTeamId: pfAway,
      homeLineup,
      awayLineup,
      round: gameState.currentRound,
      stadium: homeTeam.stadium,
      capacity: homeTeam.capacity,
    });
    setCurrentView('match_result');
  }, [teams, players, gameState, setGameState, schedule]);

  /**
   * Called when the live match finishes and the player clicks "Avançar".
   * Applies pending other results + the player's result, increments round, saves, navigates to league.
   */
  const handleMatchComplete = useCallback((playerResult: MatchResult) => {
    if (!gameState || !pendingOtherResults || !pendingPlayerFixture) return;

    const allResults = [...pendingOtherResults, playerResult];
    let updatedTable = gameState.leagueTable;
    for (const result of allResults) {
      updatedTable = applyResult(updatedTable, result);
    }

    const newGameState: GameState = {
      ...gameState,
      leagueTable: sortLeagueTable(updatedTable),
      currentRound: gameState.currentRound + 1,
      matchResults: [...gameState.matchResults, ...allResults],
    };

    setGameState(newGameState);
    saveGame(newGameState, settings);
    setPendingOtherResults(null);
    setPendingPlayerFixture(null);
    setCurrentView(newGameState.currentRound > 38 ? 'season_end' : 'league');
  }, [gameState, settings, setGameState, pendingOtherResults, pendingPlayerFixture]);

  if (loading) {
    return (
      <AppContainer>
        <div style={{ color: 'white', padding: 20, textAlign: 'center' }}>
          {t('app.loading')}
        </div>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <div style={{ color: 'red', padding: 20, textAlign: 'center' }}>
          {t('app.error')}: {error}
        </div>
      </AppContainer>
    );
  }

  // Start screen: full-window, no top menu / status bar
  if (currentView === 'start') {
    return (
      <AppContainer>
        <StartScreen teams={teams} onConfirm={handleTeamSelect} />
      </AppContainer>
    );
  }

  // From here gameState is guaranteed to be non-null (save exists or was just created)
  const gs = gameState!;
  const selectedTeam = getTeamById(teams, gs.selectedTeamId);
  const teamName = selectedTeam?.name ?? '—';

  const renderView = () => {
    switch (currentView) {
      case 'season_end':
        return (
          <SeasonEndScreen
            leagueTable={gs.leagueTable}
            teams={teams}
            onNewGame={handleNewGame}
          />
        );
      case 'league':
        return (
          <LeagueTable
            leagueTable={gs.leagueTable}
            teams={teams}
            onTeamClick={handleTeamClick}
            onPrepareMatch={() => setCurrentView('team')}
            isSeasonOver={gs.currentRound > 38}
          />
        );
      case 'team': {
        if (!selectedTeam) return null;
        const teamPlayers = getTeamPlayers(players, selectedTeam.id);
        return (
          <TeamView
            team={selectedTeam}
            players={teamPlayers}
            initialLineup={gs.teamLineups[gs.selectedTeamId]}
            initialTactics={gs.teamTactics[gs.selectedTeamId]}
            onPlay={handleStartMatch}
          />
        );
      }
      case 'squad_view': {
        const viewTeam = viewingTeamId ? getTeamById(teams, viewingTeamId) : null;
        if (!viewTeam) return null;
        return (
          <SquadView
            team={viewTeam}
            players={getTeamPlayers(players, viewTeam.id)}
            onBack={() => setCurrentView('league')}
          />
        );
      }
      case 'match_result': {
        if (!pendingPlayerFixture) return null;
        const homeTeam = getTeamById(teams, pendingPlayerFixture.homeTeamId);
        const awayTeam = getTeamById(teams, pendingPlayerFixture.awayTeamId);
        if (!homeTeam || !awayTeam) return null;
        return (
          <MatchResultView
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homePlayers={getTeamPlayers(players, homeTeam.id)}
            awayPlayers={getTeamPlayers(players, awayTeam.id)}
            homeLineup={pendingPlayerFixture.homeLineup}
            awayLineup={pendingPlayerFixture.awayLineup}
            round={pendingPlayerFixture.round}
            stadium={pendingPlayerFixture.stadium}
            capacity={pendingPlayerFixture.capacity}
            playerTeamId={gs.selectedTeamId}
            otherResults={pendingOtherResults ?? []}
            allTeams={teams}
            allPlayers={players}
            onMatchComplete={handleMatchComplete}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <TopMenu
        onNavigate={handleNavigate}
        onSave={handleSave}
        onNewGame={handleNewGame}
        onLanguageChange={handleLanguageChange}
        currentLanguage={settings.language}
      />
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-green)' }}>
        {renderView()}
      </div>
      <StatusBar teamName={teamName} round={gs.currentRound} />
    </AppContainer>
  );
}

export default App;
