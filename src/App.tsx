import { useState } from 'react';
import './styles/theme.css';
import AppContainer from './components/layout/AppContainer';
import TopMenu from './components/layout/TopMenu';
import StatusBar from './components/layout/StatusBar';
import LeagueTable from './components/league/LeagueTable';
import TeamView from './components/team/TeamView';
import MatchResult from './components/match/MatchResult';
import { useGameData } from './hooks/useGameData';
import { getTeamById } from './utils/dataLoader';
import type { ViewType } from './types';

function App() {
  const { teams, loading, error, gameState } = useGameData();
  const [currentView, setCurrentView] = useState<ViewType>('league');

  const handleNavigate = (view: 'league' | 'team') => {
    setCurrentView(view);
  };

  const handleTeamClick = (_teamId: string) => {
    setCurrentView('team');
  };

  if (loading) {
    return (
      <AppContainer>
        <div style={{ color: 'white', padding: 20, textAlign: 'center' }}>
          Carregando...
        </div>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <div style={{ color: 'red', padding: 20, textAlign: 'center' }}>
          Erro: {error}
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
      case 'team':
        return <TeamView />;
      case 'match_result':
        return <MatchResult />;
      default:
        return (
          <LeagueTable
            leagueTable={gameState.leagueTable}
            teams={teams}
            onTeamClick={handleTeamClick}
          />
        );
    }
  };

  return (
    <AppContainer>
      <TopMenu onNavigate={handleNavigate} />
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-green)' }}>
        {renderView()}
      </div>
      <StatusBar teamName={teamName} round={gameState.currentRound} />
    </AppContainer>
  );
}

export default App;
