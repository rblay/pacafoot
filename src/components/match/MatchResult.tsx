import { useState, useEffect, useMemo } from 'react';
import styles from './MatchResult.module.css';
import SubPanel from './SubPanel';
import MatchDayTable from './MatchDayTable';
import MatchDayDetail from './MatchDayDetail';
import { simulateSegment } from '../../engine/simulation';
import type { MatchResult as MatchResultType, Team, Player, LineupSelection, MatchEvent, PlannedSub } from '../../types';

interface MatchResultProps {
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeLineup: LineupSelection;
  awayLineup: LineupSelection;
  round: number;
  stadium: string;
  capacity: number;
  playerTeamId: string;
  otherResults: MatchResultType[];
  allTeams: Team[];
  allPlayers: Player[];
  onMatchComplete: (result: MatchResultType) => void;
}

const TICK_MS = 100;
const MAX_SUBS = 5;
const POSITION_ORDER: Record<string, number> = { G: 0, L: 1, Z: 2, M: 3, A: 4 };
const byPosition = (a: Player | undefined, b: Player | undefined) =>
  (POSITION_ORDER[a?.position ?? ''] ?? 9) - (POSITION_ORDER[b?.position ?? ''] ?? 9);

function generateAiSubPlan(players: Player[], lineup: LineupSelection): PlannedSub[] {
  const count = Math.floor(Math.random() * 4);
  if (count === 0) return [];

  const startingSet = new Set(lineup.startingXI);
  const benchAvailable = lineup.subs.filter(id => !startingSet.has(id));
  if (benchAvailable.length === 0) return [];

  const subs: PlannedSub[] = [];
  const usedMinutes = new Set<number>();
  const usedOut = new Set<string>();
  const usedIn = new Set<string>();
  const fieldStarters = lineup.startingXI.filter(id => {
    const p = players.find(pl => pl.id === id);
    return p && p.position !== 'G';
  });

  for (let i = 0; i < count; i++) {
    if (usedIn.size >= benchAvailable.length) break;
    const availableOut = fieldStarters.filter(id => !usedOut.has(id));
    const availableIn = benchAvailable.filter(id => !usedIn.has(id));
    if (availableOut.length === 0 || availableIn.length === 0) break;
    let minute: number;
    let attempts = 0;
    do { minute = 55 + Math.floor(Math.random() * 31); attempts++; }
    while (usedMinutes.has(minute) && attempts < 50);
    if (usedMinutes.has(minute)) break;
    const playerOut = availableOut[Math.floor(Math.random() * availableOut.length)];
    const playerIn = availableIn[Math.floor(Math.random() * availableIn.length)];
    subs.push({ minute, playerOut, playerIn });
    usedMinutes.add(minute);
    usedOut.add(playerOut);
    usedIn.add(playerIn);
  }
  return subs;
}

export default function MatchResult({
  homeTeam, awayTeam,
  homePlayers, awayPlayers,
  homeLineup, awayLineup,
  round, stadium, capacity,
  playerTeamId,
  otherResults, allTeams, allPlayers,
  onMatchComplete,
}: MatchResultProps) {
  const isHomeTeam = playerTeamId === homeTeam.id;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const aiSubPlan = useMemo(() => generateAiSubPlan(
    isHomeTeam ? awayPlayers : homePlayers,
    isHomeTeam ? awayLineup : homeLineup,
  ), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attendance = useMemo(() => Math.round(capacity * (0.6 + Math.random() * 0.35)), []);

  const [events, setEvents] = useState<MatchEvent[]>(() =>
    simulateSegment(
      1, 90,
      homeTeam.id, awayTeam.id,
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      { home: 0, away: 0 },
      isHomeTeam ? [] : aiSubPlan,
      isHomeTeam ? aiSubPlan : [],
    )
  );

  const [currentPlayerLineup, setCurrentPlayerLineup] = useState<LineupSelection>(
    () => isHomeTeam ? homeLineup : awayLineup
  );
  const [subsUsed, setSubsUsed] = useState(0);
  const [benchRemaining, setBenchRemaining] = useState<string[]>(
    () => isHomeTeam ? homeLineup.subs : awayLineup.subs
  );
  const [displayedMinute, setDisplayedMinute] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [view, setView] = useState<'table' | 'detail'>('table');
  const [viewingMatchKey, setViewingMatchKey] = useState<string | null>(null);

  const isFinished = displayedMinute >= 90;
  const canSub = !isFinished && subsUsed < MAX_SUBS && benchRemaining.length > 0;

  // Ticker
  useEffect(() => {
    if (isPaused || isFinished) return;
    const id = setInterval(() => setDisplayedMinute(m => Math.min(m + 1, 90)), TICK_MS);
    return () => clearInterval(id);
  }, [isPaused, isFinished]);

  // Half-time: pause, switch to player's match detail, open sub panel if subs available
  useEffect(() => {
    if (displayedMinute === 45 && !isFinished) {
      setIsPaused(true);
      setViewingMatchKey(null);
      setView('detail');
      if (subsUsed < MAX_SUBS && benchRemaining.length > 0) {
        setShowSubPanel(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedMinute]);

  const homePlayerMap = useMemo(() => new Map(homePlayers.map(p => [p.id, p])), [homePlayers]);
  const awayPlayerMap = useMemo(() => new Map(awayPlayers.map(p => [p.id, p])), [awayPlayers]);
  const teamMap = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

  const playerMap = isHomeTeam ? homePlayerMap : awayPlayerMap;
  const displayHomeLineup = isHomeTeam ? currentPlayerLineup : homeLineup;
  const displayAwayLineup = isHomeTeam ? awayLineup : currentPlayerLineup;

  const currentXIPlayers = useMemo(
    () => currentPlayerLineup.startingXI.map(id => playerMap.get(id)).filter(Boolean).sort(byPosition) as Player[],
    [currentPlayerLineup, playerMap]
  );
  const benchRemainingPlayers = useMemo(
    () => benchRemaining.map(id => playerMap.get(id)).filter(Boolean).sort(byPosition) as Player[],
    [benchRemaining, playerMap]
  );

  const handleViewMatch = (hId: string, aId: string) => {
    const isPlayer = hId === homeTeam.id && aId === awayTeam.id;
    setViewingMatchKey(isPlayer ? null : `${hId}-${aId}`);
    setIsPaused(true);
    setView('detail');
  };

  const handleCloseDetail = () => {
    setView('table');
    setViewingMatchKey(null);
    setIsPaused(false);
  };

  const handleSubButtonClick = () => {
    if (view === 'table') {
      setViewingMatchKey(null);
      setView('detail');
    }
    setIsPaused(true);
    setShowSubPanel(true);
  };

  const handleSubConfirm = (subs: Array<{ playerOut: string; playerIn: string }>) => {
    if (subs.length === 0) return;

    const eventsUpToNow = events.filter(e => e.minute <= displayedMinute);
    const currentHomeScore = eventsUpToNow.filter(e => e.type === 'goal' && e.team === 'home').length;
    const currentAwayScore = eventsUpToNow.filter(e => e.type === 'goal' && e.team === 'away').length;
    const half: 1 | 2 = displayedMinute <= 45 ? 1 : 2;
    const score = `${currentHomeScore}x${currentAwayScore}`;

    const subEvents: MatchEvent[] = [];
    let newStartingXI = [...currentPlayerLineup.startingXI];
    let newBenchRemaining = [...benchRemaining];

    for (const sub of subs) {
      const inObj = playerMap.get(sub.playerIn);
      const outObj = playerMap.get(sub.playerOut);
      if (!inObj || !outObj) continue;
      subEvents.push({
        minute: displayedMinute, half, type: 'substitution',
        playerId: sub.playerIn, playerName: inObj.name,
        playerOutId: sub.playerOut, playerOutName: outObj.name,
        team: isHomeTeam ? 'home' : 'away', score,
      });
      newStartingXI = newStartingXI.map(id => id === sub.playerOut ? sub.playerIn : id);
      newBenchRemaining = newBenchRemaining.filter(id => id !== sub.playerIn);
    }

    const newPlayerLineup: LineupSelection = { startingXI: newStartingXI, subs: currentPlayerLineup.subs };
    const nextMinute = Math.min(displayedMinute + 1, 90);
    const aiSubsRemaining = aiSubPlan.filter(s => s.minute > displayedMinute);
    const newHomeLineup = isHomeTeam ? newPlayerLineup : homeLineup;
    const newAwayLineup = isHomeTeam ? awayLineup : newPlayerLineup;

    const newSegmentEvents = nextMinute <= 90
      ? simulateSegment(
          nextMinute, 90,
          homeTeam.id, awayTeam.id,
          homePlayers, awayPlayers,
          newHomeLineup, newAwayLineup,
          { home: currentHomeScore, away: currentAwayScore },
          isHomeTeam ? [] : aiSubsRemaining,
          isHomeTeam ? aiSubsRemaining : [],
        )
      : [];

    setEvents([...events.filter(e => e.minute <= displayedMinute), ...subEvents, ...newSegmentEvents]);
    setCurrentPlayerLineup(newPlayerLineup);
    setBenchRemaining(newBenchRemaining);
    setSubsUsed(n => n + subs.length);
    setShowSubPanel(false);
    setIsPaused(false);
    setView('table');
    setViewingMatchKey(null);
  };

  const handleSubCancel = () => {
    setShowSubPanel(false);
    setIsPaused(false);
    setView('table');
    setViewingMatchKey(null);
  };

  const handleAdvance = () => {
    const finalHomeScore = events.filter(e => e.type === 'goal' && e.team === 'home').length;
    const finalAwayScore = events.filter(e => e.type === 'goal' && e.team === 'away').length;
    onMatchComplete({
      round, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
      homeScore: finalHomeScore, awayScore: finalAwayScore,
      events,
      homeLineup: isHomeTeam ? currentPlayerLineup : homeLineup,
      awayLineup: isHomeTeam ? awayLineup : currentPlayerLineup,
      attendance, stadium,
    });
  };

  // Build the detail view for the current selection
  const detailContent = (() => {
    if (view !== 'detail') return null;

    if (viewingMatchKey === null) {
      // Player's own match
      const visibleEvents = events.filter(e => e.minute <= displayedMinute);
      const liveHomeScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
      const liveAwayScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
      const homeStarters = displayHomeLineup.startingXI.map(id => homePlayerMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
      const homeSubs = displayHomeLineup.subs.map(id => homePlayerMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
      const awayStarters = displayAwayLineup.startingXI.map(id => awayPlayerMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
      const awaySubs = displayAwayLineup.subs.map(id => awayPlayerMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
      return (
        <MatchDayDetail
          homeTeam={homeTeam} awayTeam={awayTeam}
          homeStarters={homeStarters} homeSubs={homeSubs}
          awayStarters={awayStarters} awaySubs={awaySubs}
          visibleEvents={visibleEvents}
          liveHomeScore={liveHomeScore} liveAwayScore={liveAwayScore}
          displayedMinute={displayedMinute} stadium={stadium} attendance={attendance}
          isPlayerMatch isPaused={isPaused} isFinished={isFinished} canSub={canSub}
          onBack={handleCloseDetail}
          onTogglePause={() => setIsPaused(p => !p)}
          onSubClick={handleSubButtonClick}
          onSkip={() => setDisplayedMinute(90)}
          onAdvance={handleAdvance}
        />
      );
    }

    // Another team's match — read-only
    const other = otherResults.find(r => `${r.homeTeamId}-${r.awayTeamId}` === viewingMatchKey);
    if (!other) return null;
    const ht = teamMap.get(other.homeTeamId);
    const at = teamMap.get(other.awayTeamId);
    if (!ht || !at) return null;

    const hMap = new Map(allPlayers.filter(p => p.teamId === other.homeTeamId).map(p => [p.id, p]));
    const aMap = new Map(allPlayers.filter(p => p.teamId === other.awayTeamId).map(p => [p.id, p]));
    const homeStarters = other.homeLineup.startingXI.map(id => hMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
    const homeSubs = other.homeLineup.subs.map(id => hMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
    const awayStarters = other.awayLineup.startingXI.map(id => aMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
    const awaySubs = other.awayLineup.subs.map(id => aMap.get(id)).filter(Boolean).sort(byPosition) as Player[];
    const visibleEvents = other.events.filter(e => e.minute <= displayedMinute);
    const liveHomeScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
    const liveAwayScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'away').length;

    return (
      <MatchDayDetail
        homeTeam={ht} awayTeam={at}
        homeStarters={homeStarters} homeSubs={homeSubs}
        awayStarters={awayStarters} awaySubs={awaySubs}
        visibleEvents={visibleEvents}
        liveHomeScore={liveHomeScore} liveAwayScore={liveAwayScore}
        displayedMinute={displayedMinute} stadium={other.stadium} attendance={other.attendance}
        isPlayerMatch={false} isPaused={isPaused} isFinished={isFinished} canSub={false}
        onBack={handleCloseDetail}
        onTogglePause={() => {}} onSubClick={() => {}} onSkip={() => {}} onAdvance={() => {}}
      />
    );
  })();

  return (
    <div className={styles.container}>
      {showSubPanel && (
        <SubPanel
          starters={currentXIPlayers}
          benchRemaining={benchRemainingPlayers}
          onConfirm={handleSubConfirm}
          onCancel={handleSubCancel}
          subsUsed={subsUsed}
        />
      )}
      {view === 'table'
        ? (
          <MatchDayTable
            playerHomeTeamId={homeTeam.id}
            playerAwayTeamId={awayTeam.id}
            playerEvents={events}
            otherResults={otherResults}
            allTeams={allTeams}
            playerTeamId={playerTeamId}
            displayedMinute={displayedMinute}
            isPaused={isPaused}
            isFinished={isFinished}
            canSub={canSub}
            round={round}
            onViewMatch={handleViewMatch}
            onTogglePause={() => setIsPaused(p => !p)}
            onSubClick={handleSubButtonClick}
            onAdvance={handleAdvance}
          />
        )
        : detailContent
      }
    </div>
  );
}
