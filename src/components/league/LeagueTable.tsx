import styles from './LeagueTable.module.css';
import type { LeagueTableEntry, Team } from '../../types';

interface LeagueTableProps {
  leagueTable: LeagueTableEntry[];
  teams: Team[];
  onTeamClick: (teamId: string) => void;
  onPrepareMatch: () => void;
}

const TABS = ['Nacional', 'Estadual', 'Libertadores', 'Sul-Americana'];

function getRowClass(position: number): string {
  if (position <= 4) return styles.top4;
  if (position >= 17) return styles.relegation;
  return position % 2 === 0 ? styles.rowEven : styles.rowOdd;
}

export default function LeagueTable({ leagueTable, teams, onTeamClick, onPrepareMatch }: LeagueTableProps) {
  const teamMap = new Map(teams.map(t => [t.id, t]));

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${i === 0 ? styles.active : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.header}>1ª Divisão — Série A</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Equipe</th>
              <th>PG</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
            </tr>
          </thead>
          <tbody>
            {leagueTable.map((entry) => {
              const team = teamMap.get(entry.teamId);
              const goalDiff = entry.goalsFor - entry.goalsAgainst;
              return (
                <tr key={entry.teamId} className={getRowClass(entry.position)}>
                  <td className={styles.positionCell}>{entry.position}</td>
                  <td
                    className={styles.teamName}
                    onClick={() => onTeamClick(entry.teamId)}
                  >
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: team?.primaryColor ?? '#888' }}
                    />
                    {team?.name ?? entry.teamId}
                  </td>
                  <td><strong>{entry.points}</strong></td>
                  <td>{entry.played}</td>
                  <td>{entry.won}</td>
                  <td>{entry.drawn}</td>
                  <td>{entry.lost}</td>
                  <td>{entry.goalsFor}</td>
                  <td>{entry.goalsAgainst}</td>
                  <td>{goalDiff > 0 ? `+${goalDiff}` : goalDiff}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        <button className={styles.actionButton} onClick={onPrepareMatch}>
          Preparar próximo jogo »
        </button>
      </div>
    </div>
  );
}
