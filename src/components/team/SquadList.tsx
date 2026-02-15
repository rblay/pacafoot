import styles from './SquadList.module.css';
import type { Player, Position } from '../../types';

interface SquadListProps {
  players: Player[];
  selectedStarters: Set<string>;
  selectedSubs: Set<string>;
  onTogglePlayer: (playerId: string) => void;
}

const VIEW_TABS = ['Jogar', 'Histórico', 'Técnico', 'Jogador'];

const POS_CLASS: Record<Position, string> = {
  G: styles.posG,
  L: styles.posL,
  Z: styles.posZ,
  M: styles.posM,
  A: styles.posA,
};

/** Sort players: G first, then Z, L, M, A */
const POS_ORDER: Record<Position, number> = { G: 0, Z: 1, L: 2, M: 3, A: 4 };

function formatSalary(salary: number): string {
  if (salary >= 1000000) return `${(salary / 1000000).toFixed(1)}M`;
  if (salary >= 1000) return `${Math.round(salary / 1000)}k`;
  return String(salary);
}

export default function SquadList({
  players,
  selectedStarters,
  selectedSubs,
  onTogglePlayer,
}: SquadListProps) {
  const sortedPlayers = [...players].sort(
    (a, b) => POS_ORDER[a.position] - POS_ORDER[b.position] || b.rating - a.rating
  );

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {VIEW_TABS.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${i === 0 ? styles.active : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>P</th>
              <th className={styles.nameCol}>Nome</th>
              <th>Função</th>
              <th>F</th>
              <th>Energia</th>
              <th>Salário</th>
              <th>Passe</th>
              <th>G</th>
              <th>Car.</th>
              <th>I</th>
              <th>M</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const isStarter = selectedStarters.has(player.id);
              const isSub = selectedSubs.has(player.id);
              const isSelected = isStarter || isSub;

              return (
                <tr
                  key={player.id}
                  className={
                    isSelected
                      ? styles.selected
                      : index % 2 === 0
                        ? styles.rowEven
                        : styles.rowOdd
                  }
                  onClick={() => onTogglePlayer(player.id)}
                >
                  <td className={POS_CLASS[player.position]}>{player.position}</td>
                  <td className={styles.nameCol}>{player.name}</td>
                  <td>{player.role}</td>
                  <td>{player.rating}</td>
                  <td>
                    <div className={styles.energyBar}>
                      <div
                        className={styles.energyFill}
                        style={{ width: `${player.energy}%` }}
                      />
                    </div>
                  </td>
                  <td>{formatSalary(player.salary)}</td>
                  <td>{player.passRating}</td>
                  <td>{player.goals}</td>
                  <td>{player.characteristics.join('/')}</td>
                  <td>{player.age}</td>
                  <td>{player.matchesPlayed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span>
          Selecionados: {selectedStarters.size} titulares {selectedSubs.size} reservas
        </span>
        {selectedStarters.size > 0 && selectedStarters.size !== 11 && (
          <span className={styles.validationError}>
            Selecione exatamente 11 titulares
          </span>
        )}
      </div>
    </div>
  );
}
