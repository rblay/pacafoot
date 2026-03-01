import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './MatchResult.module.css';
import SubPanel from './SubPanel';
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
  onMatchComplete: (result: MatchResultType) => void;
}

const TICK_MS = 100;
const POSITION_ORDER: Record<string, number> = { G: 0, L: 1, Z: 2, M: 3, A: 4 };
const byPosition = (a: Player, b: Player) =>
  (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9);
const MAX_SUBS = 5;

/** Generate 0–3 random sub plans for the AI team at random minutes in [55, 85]. */
function generateAiSubPlan(allPlayers: Player[], lineup: LineupSelection): PlannedSub[] {
  const count = Math.floor(Math.random() * 4); // 0–3
  if (count === 0) return [];

  const startingSet = new Set(lineup.startingXI);
  const benchAvailable = lineup.subs.filter(id => !startingSet.has(id));
  if (benchAvailable.length === 0) return [];

  const subs: PlannedSub[] = [];
  const usedMinutes = new Set<number>();
  const usedOut = new Set<string>();
  const usedIn = new Set<string>();

  // Only field players (not goalkeeper) can be swapped
  const fieldStarters = lineup.startingXI.filter(id => {
    const p = allPlayers.find(pl => pl.id === id);
    return p && p.position !== 'G';
  });

  for (let i = 0; i < count; i++) {
    if (usedIn.size >= benchAvailable.length) break;
    const availableOut = fieldStarters.filter(id => !usedOut.has(id));
    const availableIn = benchAvailable.filter(id => !usedIn.has(id));
    if (availableOut.length === 0 || availableIn.length === 0) break;

    // Pick a unique minute
    let minute: number;
    let attempts = 0;
    do {
      minute = 55 + Math.floor(Math.random() * 31); // 55–85
      attempts++;
    } while (usedMinutes.has(minute) && attempts < 50);
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
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  homeLineup,
  awayLineup,
  round,
  stadium,
  capacity,
  playerTeamId,
  onMatchComplete,
}: MatchResultProps) {
  const isHomeTeam = playerTeamId === homeTeam.id;

  // The AI sub plan is fixed for the whole match
  const aiSubPlan = useMemo(() => {
    const opponentPlayers = isHomeTeam ? awayPlayers : homePlayers;
    const opponentLineup = isHomeTeam ? awayLineup : homeLineup;
    return generateAiSubPlan(opponentPlayers, opponentLineup);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  const attendance = useMemo(
    () => Math.round(capacity * (0.6 + Math.random() * 0.35)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Simulate the full match upfront (with AI subs baked in)
  const [events, setEvents] = useState<MatchEvent[]>(() => {
    const homeSubs = isHomeTeam ? [] : aiSubPlan;
    const awaySubs = isHomeTeam ? aiSubPlan : [];
    return simulateSegment(
      1, 90,
      homeTeam.id, awayTeam.id,
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      { home: 0, away: 0 },
      homeSubs,
      awaySubs,
    );
  });

  // Player's current lineup (changes as subs are made)
  const [currentPlayerLineup, setCurrentPlayerLineup] = useState<LineupSelection>(() =>
    isHomeTeam ? homeLineup : awayLineup
  );

  const [subsUsed, setSubsUsed] = useState(0);
  const [benchRemaining, setBenchRemaining] = useState<string[]>(() =>
    isHomeTeam ? homeLineup.subs : awayLineup.subs
  );

  const [displayedMinute, setDisplayedMinute] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [showSubPanel, setShowSubPanel] = useState(false);

  const eventsEndRef = useRef<HTMLDivElement>(null);

  const isFinished = displayedMinute >= 90;

  // Ticker
  useEffect(() => {
    if (isPaused || isFinished) return;
    const interval = setInterval(() => {
      setDisplayedMinute(m => (m >= 90 ? 90 : m + 1));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isPaused, isFinished]);

  // Pause at half-time and open sub panel if subs are available
  useEffect(() => {
    if (displayedMinute === 45 && !isFinished) {
      setIsPaused(true);
      if (subsUsed < MAX_SUBS && benchRemaining.length > 0) {
        setShowSubPanel(true);
      }
    }
  }, [displayedMinute]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll events
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMinute]);

  const visibleEvents = events.filter(e => e.minute <= displayedMinute);
  const liveHomeScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
  const liveAwayScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'away').length;

  const homePlayerMap = new Map(homePlayers.map(p => [p.id, p]));
  const awayPlayerMap = new Map(awayPlayers.map(p => [p.id, p]));

  // Display lineup: show current state for player team
  const displayHomeLineup = isHomeTeam ? currentPlayerLineup : homeLineup;
  const displayAwayLineup = isHomeTeam ? awayLineup : currentPlayerLineup;

  const homeStarters = (displayHomeLineup.startingXI
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);
  const homeSubs = (displayHomeLineup.subs
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);
  const awayStarters = (displayAwayLineup.startingXI
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);
  const awaySubs = (displayAwayLineup.subs
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);

  // Players available for sub panel
  const playerMap = isHomeTeam ? homePlayerMap : awayPlayerMap;
  const currentXIPlayers = (currentPlayerLineup.startingXI
    .map(id => playerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);
  const benchRemainingPlayers = (benchRemaining
    .map(id => playerMap.get(id))
    .filter(Boolean) as Player[]).sort(byPosition);

  const handleSubButtonClick = () => {
    setIsPaused(true);
    setShowSubPanel(true);
  };

  const handleSubConfirm = (subs: Array<{ playerOut: string; playerIn: string }>) => {
    if (subs.length === 0) return;

    // Score at current displayed minute
    const eventsUpToNow = events.filter(e => e.minute <= displayedMinute);
    const currentHomeScore = eventsUpToNow.filter(e => e.type === 'goal' && e.team === 'home').length;
    const currentAwayScore = eventsUpToNow.filter(e => e.type === 'goal' && e.team === 'away').length;

    const half: 1 | 2 = displayedMinute <= 45 ? 1 : 2;
    const score = `${currentHomeScore}x${currentAwayScore}`;

    // Build sub events and updated lineup in one pass
    const subEvents: MatchEvent[] = [];
    let newStartingXI = [...currentPlayerLineup.startingXI];
    let newBenchRemaining = [...benchRemaining];

    for (const sub of subs) {
      const playerInObj = playerMap.get(sub.playerIn);
      const playerOutObj = playerMap.get(sub.playerOut);
      if (!playerInObj || !playerOutObj) continue;

      subEvents.push({
        minute: displayedMinute,
        half,
        type: 'substitution',
        playerId: sub.playerIn,
        playerName: playerInObj.name,
        playerOutId: sub.playerOut,
        playerOutName: playerOutObj.name,
        team: isHomeTeam ? 'home' : 'away',
        score,
      });

      newStartingXI = newStartingXI.map(id => id === sub.playerOut ? sub.playerIn : id);
      newBenchRemaining = newBenchRemaining.filter(id => id !== sub.playerIn);
    }

    const newPlayerLineup: LineupSelection = {
      startingXI: newStartingXI,
      subs: currentPlayerLineup.subs,
    };

    // Re-simulate remainder once with fully updated lineup
    const nextMinute = Math.min(displayedMinute + 1, 90);
    const aiSubsRemaining = aiSubPlan.filter(s => s.minute > displayedMinute);
    const newHomeLineup = isHomeTeam ? newPlayerLineup : homeLineup;
    const newAwayLineup = isHomeTeam ? awayLineup : newPlayerLineup;
    const homePlannedSubs = isHomeTeam ? [] : aiSubsRemaining;
    const awayPlannedSubs = isHomeTeam ? aiSubsRemaining : [];

    const newSegmentEvents = nextMinute <= 90
      ? simulateSegment(
          nextMinute, 90,
          homeTeam.id, awayTeam.id,
          homePlayers, awayPlayers,
          newHomeLineup, newAwayLineup,
          { home: currentHomeScore, away: currentAwayScore },
          homePlannedSubs,
          awayPlannedSubs,
        )
      : [];

    const eventsBeforeNow = events.filter(e => e.minute <= displayedMinute);
    setEvents([...eventsBeforeNow, ...subEvents, ...newSegmentEvents]);

    setCurrentPlayerLineup(newPlayerLineup);
    setBenchRemaining(newBenchRemaining);
    setSubsUsed(n => n + subs.length);
    setShowSubPanel(false);
    setIsPaused(false);
  };

  const handleSubCancel = () => {
    setShowSubPanel(false);
    setIsPaused(false);
  };

  const handleAdvance = () => {
    const finalHomeScore = events.filter(e => e.type === 'goal' && e.team === 'home').length;
    const finalAwayScore = events.filter(e => e.type === 'goal' && e.team === 'away').length;

    const finalHomeLineup = isHomeTeam ? currentPlayerLineup : homeLineup;
    const finalAwayLineup = isHomeTeam ? awayLineup : currentPlayerLineup;

    const result: MatchResultType = {
      round,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeScore: finalHomeScore,
      awayScore: finalAwayScore,
      events,
      homeLineup: finalHomeLineup,
      awayLineup: finalAwayLineup,
      attendance,
      stadium,
    };
    onMatchComplete(result);
  };

  const canSub = !isFinished && subsUsed < MAX_SUBS && benchRemaining.length > 0;

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

      <div className={styles.panels}>
        {/* Home lineup */}
        <div className={styles.lineupPanel}>
          <div className={styles.lineupHeader}>
            <span className={styles.teamColor} style={{ backgroundColor: homeTeam.primaryColor }} />
            {homeTeam.name}
          </div>
          <div className={styles.sectionTitle}>Titulares</div>
          {homeStarters.map(p => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.playerPos}>{p.position}</span>
              <span>{p.name}</span>
            </div>
          ))}
          {homeSubs.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Reservas</div>
              {homeSubs.map(p => (
                <div key={p.id} className={styles.playerRow}>
                  <span className={styles.playerPos}>{p.position}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </>
          )}
          {isFinished && (
            <button className={styles.actionButton} onClick={handleAdvance}>
              Avançar
            </button>
          )}
        </div>

        {/* Events center */}
        <div className={styles.eventsPanel}>
          <div className={styles.scoreHeader}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>
              {stadium}
            </div>
            <div className={styles.scoreTeams}>
              <span>{homeTeam.shortName}</span>
              <span className={styles.scoreNumber}>{liveHomeScore}</span>
              <span className={styles.scoreX}>X</span>
              <span className={styles.scoreNumber}>{liveAwayScore}</span>
              <span>{awayTeam.shortName}</span>
            </div>
            <div className={styles.matchClock}>
              {isFinished ? 'FT' : `${displayedMinute}'`}
            </div>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(displayedMinute / 90) * 100}%` }}
            />
          </div>

          {!isFinished && (
            <div className={styles.controls}>
              <button className={styles.controlBtn} onClick={() => setIsPaused(p => !p)}>
                {isPaused ? '▶ Continuar' : '⏸ Pausa'}
              </button>
              <button className={styles.controlBtn} onClick={() => setDisplayedMinute(90)}>
                ⏭ Pular
              </button>
              {canSub && (
                <button className={styles.subButton} onClick={handleSubButtonClick}>
                  ↕ Substituir
                </button>
              )}
            </div>
          )}

          <div className={styles.eventsList}>
            {visibleEvents.map((event, i) => (
              <div
                key={i}
                className={`${styles.event} ${event.type === 'goal' ? styles.eventGoal : ''} ${event.type === 'substitution' ? styles.eventSub : ''}`}
              >
                <span className={styles.eventMinute}>{event.minute}&apos;</span>
                <span className={styles.eventIcon}>
                  {event.type === 'goal' && '⚽'}
                  {event.type === 'yellow_card' && <span className={styles.yellowCard} />}
                </span>
                <span>
                  {event.type === 'goal' && `${event.score} - `}
                  {event.type === 'goal' && event.playerName}
                  {event.type === 'goal' && ` - ${event.half}°`}
                  {event.type === 'yellow_card' && event.playerName}
                  {event.type === 'substitution' && (
                    <>
                      <span className={styles.subOut}>{event.playerOutName} →</span>
                      {' '}
                      <span className={styles.subInText}>← {event.playerName}</span>
                    </>
                  )}
                </span>
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>

          <div className={styles.attendance}>
            Público: {attendance.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Away lineup */}
        <div className={styles.lineupPanel}>
          <div className={styles.lineupHeader}>
            <span className={styles.teamColor} style={{ backgroundColor: awayTeam.primaryColor }} />
            {awayTeam.name}
          </div>
          <div className={styles.sectionTitle}>Titulares</div>
          {awayStarters.map(p => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.playerPos}>{p.position}</span>
              <span>{p.name}</span>
            </div>
          ))}
          {awaySubs.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Reservas</div>
              {awaySubs.map(p => (
                <div key={p.id} className={styles.playerRow}>
                  <span className={styles.playerPos}>{p.position}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
