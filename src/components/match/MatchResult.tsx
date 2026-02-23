import { useState, useEffect, useRef } from 'react';
import styles from './MatchResult.module.css';
import type { MatchResult as MatchResultType, Team, Player } from '../../types';

interface MatchResultProps {
  result: MatchResultType;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  onBack: () => void;
}

const TICK_MS = 100; // 1 game minute per tick → 90s total

export default function MatchResult({
  result,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  onBack,
}: MatchResultProps) {
  const [displayedMinute, setDisplayedMinute] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const isFinished = displayedMinute >= 90;

  useEffect(() => {
    if (isPaused || isFinished) return;
    const interval = setInterval(() => {
      setDisplayedMinute(m => (m >= 90 ? 90 : m + 1));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isPaused, isFinished]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMinute]);

  const visibleEvents = result.events.filter(e => e.minute <= displayedMinute);
  const liveHomeScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
  const liveAwayScore = visibleEvents.filter(e => e.type === 'goal' && e.team === 'away').length;

  const homePlayerMap = new Map(homePlayers.map(p => [p.id, p]));
  const awayPlayerMap = new Map(awayPlayers.map(p => [p.id, p]));

  const homeStarters = result.homeLineup.startingXI
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[];
  const homeSubs = result.homeLineup.subs
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[];
  const awayStarters = result.awayLineup.startingXI
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[];
  const awaySubs = result.awayLineup.subs
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[];

  return (
    <div className={styles.container}>
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
            <button className={styles.actionButton} onClick={onBack}>
              Avançar
            </button>
          )}
        </div>

        {/* Events center */}
        <div className={styles.eventsPanel}>
          <div className={styles.scoreHeader}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>
              {result.stadium}
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
            </div>
          )}

          <div className={styles.eventsList}>
            {visibleEvents.map((event, i) => (
              <div
                key={i}
                className={`${styles.event} ${event.type === 'goal' ? styles.eventGoal : ''}`}
              >
                <span className={styles.eventMinute}>{event.minute}&apos;</span>
                <span className={styles.eventIcon}>
                  {event.type === 'goal' && '⚽'}
                  {event.type === 'yellow_card' && <span className={styles.yellowCard} />}
                </span>
                <span>
                  {event.type === 'goal' && `${event.score} - `}
                  {event.playerName}
                  {event.type === 'goal' && ` - ${event.half}°`}
                </span>
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>

          <div className={styles.attendance}>
            Público: {result.attendance.toLocaleString('pt-BR')}
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
