import { useState, useCallback, useMemo } from 'react';
import './styles/theme.css';
import AppContainer from './components/layout/AppContainer';
import TopMenu from './components/layout/TopMenu';
import StatusBar from './components/layout/StatusBar';
import StartScreen from './components/start/StartScreen';
import LeagueTable from './components/league/LeagueTable';
import TeamView from './components/team/TeamView';
import MatchResultView from './components/match/MatchResult';
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

function App() {
  const { teams, players, loading, error, gameState, settings, setGameState, setSettings } = useGameData();
  const [currentView, setCurrentView] = useState<ViewType>(() => hasSave() ? 'team' : 'start');
  const [currentMatchResult, setCurrentMatchResult] = useState<MatchResult | null>(null);
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
    setCurrentMatchResult(null);
    setCurrentView('start');
  }, [setGameState]);

  const handleNavigate = (view: 'league' | 'team') => {
    setCurrentView(view);
  };

  const handleTeamClick = (_teamId: string) => {
    setCurrentView('team');
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

  const handlePlay = useCallback((starters: string[], subs: string[], tactics: TacticalConfig) => {
    if (!gameState) return;
    const selectedTeamId = gameState.selectedTeamId;
    const roundIndex = gameState.currentRound - 1;

    if (roundIndex >= schedule.length) return;

    const roundFixtures = schedule[roundIndex];
    const playerFixture = roundFixtures.find(
      ([h, a]) => h === selectedTeamId || a === selectedTeamId
    );
    if (!playerFixture) return;

    const playerLineup: LineupSelection = { startingXI: starters, subs };
    const roundResults: MatchResult[] = [];
    let playerResult: MatchResult | null = null;

    for (const [hId, aId] of roundFixtures) {
      const hTeam = getTeamById(teams, hId);
      const aTeam = getTeamById(teams, aId);
      if (!hTeam || !aTeam) continue;

      const hPlayers = getTeamPlayers(players, hId);
      const aPlayers = getTeamPlayers(players, aId);

      const hLineup = hId === selectedTeamId ? playerLineup : autoLineup(hPlayers);
      const aLineup = aId === selectedTeamId ? playerLineup : autoLineup(aPlayers);

      const result = simulateMatch(
        hId, aId,
        hPlayers, aPlayers,
        hLineup, aLineup,
        gameState.currentRound,
        hTeam.stadium,
        hTeam.capacity,
      );

      roundResults.push(result);
      if (hId === selectedTeamId || aId === selectedTeamId) {
        playerResult = result;
      }
    }

    if (!playerResult) return;

    let updatedTable = gameState.leagueTable;
    for (const result of roundResults) {
      updatedTable = applyResult(updatedTable, result);
    }

    const newGameState: GameState = {
      ...gameState,
      leagueTable: sortLeagueTable(updatedTable),
      currentRound: gameState.currentRound + 1,
      matchResults: [...gameState.matchResults, ...roundResults],
      teamLineups: { ...gameState.teamLineups, [selectedTeamId]: playerLineup },
      teamTactics: { ...gameState.teamTactics, [selectedTeamId]: tactics },
    };

    setGameState(newGameState);
    saveGame(newGameState, settings);
    setCurrentMatchResult(playerResult);
    setCurrentView('match_result');
  }, [teams, players, gameState, settings, setGameState, schedule]);

  const handleBackFromMatch = () => {
    setCurrentMatchResult(null);
    setCurrentView('league');
  };

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
      case 'league':
        return (
          <LeagueTable
            leagueTable={gs.leagueTable}
            teams={teams}
            onTeamClick={handleTeamClick}
            onPrepareMatch={() => setCurrentView('team')}
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
            onPlay={handlePlay}
          />
        );
      }
      case 'match_result': {
        if (!currentMatchResult) return null;
        const homeTeam = getTeamById(teams, currentMatchResult.homeTeamId);
        const awayTeam = getTeamById(teams, currentMatchResult.awayTeamId);
        if (!homeTeam || !awayTeam) return null;
        return (
          <MatchResultView
            result={currentMatchResult}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homePlayers={getTeamPlayers(players, homeTeam.id)}
            awayPlayers={getTeamPlayers(players, awayTeam.id)}
            onBack={handleBackFromMatch}
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
