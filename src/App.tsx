import { useState, useCallback } from 'react';
import './styles/theme.css';
import AppContainer from './components/layout/AppContainer';
import TopMenu from './components/layout/TopMenu';
import StatusBar from './components/layout/StatusBar';
import LeagueTable from './components/league/LeagueTable';
import TeamView from './components/team/TeamView';
import MatchResultView from './components/match/MatchResult';
import { useGameData } from './hooks/useGameData';
import { getTeamById, getTeamPlayers } from './utils/dataLoader';
import { simulateMatch } from './engine/simulation';
import { sortLeagueTable, saveGame } from './utils/storage';
import { setLanguage, t } from './locales/i18n';
import type { Language } from './locales/i18n';
import type { ViewType, TacticalConfig, MatchResult, GameState, LineupSelection } from './types';

function App() {
  const { teams, players, loading, error, gameState, settings, setGameState, setSettings } = useGameData();
  const [currentView, setCurrentView] = useState<ViewType>('league');
  const [currentMatchResult, setCurrentMatchResult] = useState<MatchResult | null>(null);
  const [, forceRender] = useState(0); // for language re-render

  const handleNavigate = (view: 'league' | 'team') => {
    setCurrentView(view);
  };

  const handleTeamClick = (_teamId: string) => {
    setCurrentView('team');
  };

  const handleSave = useCallback(() => {
    saveGame(gameState, settings);
    alert(t('save.saved'));
  }, [gameState, settings]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setSettings({ ...settings, language: lang });
    forceRender(n => n + 1);
  }, [settings, setSettings]);

  const handlePlay = useCallback((starters: string[], subs: string[], _tactics: TacticalConfig) => {
    const selectedTeam = getTeamById(teams, gameState.selectedTeamId);
    if (!selectedTeam) return;

    const opponents = teams.filter(t => t.id !== selectedTeam.id);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];

    const playerLineup: LineupSelection = { startingXI: starters, subs };

    const oppPlayers = getTeamPlayers(players, opponent.id);
    const oppSorted = [...oppPlayers].sort((a, b) => b.rating - a.rating);
    const oppStarters = oppSorted.slice(0, 11).map(p => p.id);
    const oppSubs = oppSorted.slice(11, 18).map(p => p.id);
    const oppLineup: LineupSelection = { startingXI: oppStarters, subs: oppSubs };

    const isHome = gameState.currentRound % 2 === 1;
    const homeTeamId = isHome ? selectedTeam.id : opponent.id;
    const awayTeamId = isHome ? opponent.id : selectedTeam.id;
    const homePlayers = getTeamPlayers(players, homeTeamId);
    const awayPlayers = getTeamPlayers(players, awayTeamId);
    const homeLineup = isHome ? playerLineup : oppLineup;
    const awayLineup = isHome ? oppLineup : playerLineup;
    const homeTeam = isHome ? selectedTeam : opponent;

    const result = simulateMatch(
      homeTeamId, awayTeamId,
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      gameState.currentRound,
      homeTeam.stadium,
      homeTeam.capacity,
    );

    const updatedTable = gameState.leagueTable.map(entry => {
      if (entry.teamId === homeTeamId) {
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
      if (entry.teamId === awayTeamId) {
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

    const newGameState: GameState = {
      ...gameState,
      leagueTable: sortLeagueTable(updatedTable),
      currentRound: gameState.currentRound + 1,
      matchResults: [...gameState.matchResults, result],
    };

    setGameState(newGameState);

    // Auto-save after each match
    saveGame(newGameState, settings);

    setCurrentMatchResult(result);
    setCurrentView('match_result');
  }, [teams, players, gameState, settings, setGameState]);

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

  const selectedTeam = getTeamById(teams, gameState.selectedTeamId);
  const teamName = selectedTeam?.name ?? '—';

  const renderView = () => {
    switch (currentView) {
      case 'league':
        return (
          <LeagueTable
            leagueTable={gameState.leagueTable}
            teams={teams}
            onTeamClick={handleTeamClick}
          />
        );
      case 'team': {
        if (!selectedTeam) return null;
        const teamPlayers = getTeamPlayers(players, selectedTeam.id);
        return (
          <TeamView
            team={selectedTeam}
            players={teamPlayers}
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
        onLanguageChange={handleLanguageChange}
        currentLanguage={settings.language}
      />
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-green)' }}>
        {renderView()}
      </div>
      <StatusBar teamName={teamName} round={gameState.currentRound} />
    </AppContainer>
  );
}

export default App;
