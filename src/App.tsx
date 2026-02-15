import { useState } from 'react';
import './styles/theme.css';
import AppContainer from './components/layout/AppContainer';
import TopMenu from './components/layout/TopMenu';
import StatusBar from './components/layout/StatusBar';
import LeagueTable from './components/league/LeagueTable';
import TeamView from './components/team/TeamView';
import MatchResult from './components/match/MatchResult';
import type { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('league');

  const handleNavigate = (view: 'league' | 'team') => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'league':
        return <LeagueTable />;
      case 'team':
        return <TeamView />;
      case 'match_result':
        return <MatchResult />;
      default:
        return <LeagueTable />;
    }
  };

  return (
    <AppContainer>
      <TopMenu onNavigate={handleNavigate} />
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-green)' }}>
        {renderView()}
      </div>
      <StatusBar teamName="—" round={1} />
    </AppContainer>
  );
}

export default App;
