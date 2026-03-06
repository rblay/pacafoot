import { useEffect, useRef } from 'react';
import styles from './MatchDayDetail.module.css';
import type { Team, Player, MatchEvent } from '../../types';

interface MatchDayDetailProps {
  homeTeam: Team;
  awayTeam: Team;
  homeStarters: Player[];
  homeSubs: Player[];
  awayStarters: Player[];
  awaySubs: Player[];
  visibleEvents: MatchEvent[];
  liveHomeScore: number;
  liveAwayScore: number;
  displayedMinute: number;
  stadium: string;
  attendance: number;
  /** True for the player's own match — shows sub/pause/skip controls */
  isPlayerMatch: boolean;
  isPaused: boolean;
  isFinished: boolean;
  canSub: boolean;
  onBack: () => void;
  onTogglePause: () => void;
  onSubClick: () => void;
  onSkip: () => void;
  onAdvance: () => void;
}

export default function MatchDayDetail({
  homeTeam, awayTeam,
  homeStarters, homeSubs, awayStarters, awaySubs,
  visibleEvents, liveHomeScore, liveAwayScore,
  displayedMinute, stadium, attendance,
  isPlayerMatch, isPaused, isFinished, canSub,
  onBack, onTogglePause, onSubClick, onSkip, onAdvance,
}: MatchDayDetailProps) {
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMinute]);

  return (
    <div className={styles.wrapper}>
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
          <div className={styles.panelFooter}>
            {isPlayerMatch && isFinished && (
              <button className={styles.actionButton} onClick={onAdvance}>
                Avançar
              </button>
            )}
            <button className={styles.backButton} onClick={onBack}>
              ← Voltar
            </button>
          </div>
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

          {isPlayerMatch && !isFinished && (
            <div className={styles.controls}>
              <button className={styles.controlBtn} onClick={onTogglePause}>
                {isPaused ? '▶ Continuar' : '⏸ Pausa'}
              </button>
              <button className={styles.controlBtn} onClick={onSkip}>
                ⏭ Pular
              </button>
              {canSub && (
                <button className={styles.subButton} onClick={onSubClick}>
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
