import styles from './SquadView.module.css';
import type { Team, Player, Position } from '../../types';

interface SquadViewProps {
  team: Team;
  players: Player[];
  onBack: () => void;
}

const POS_CLASS: Record<Position, string> = {
  G: styles.posG,
  L: styles.posL,
  Z: styles.posZ,
  M: styles.posM,
  A: styles.posA,
};

const POS_ORDER: Record<Position, number> = { G: 0, Z: 1, L: 2, M: 3, A: 4 };

function formatSalary(salary: number): string {
  if (salary >= 1000000) return `${(salary / 1000000).toFixed(1)}M`;
  if (salary >= 1000) return `${Math.round(salary / 1000)}k`;
  return String(salary);
}

export default function SquadView({ team, players, onBack }: SquadViewProps) {
  const sorted = [...players].sort(
    (a, b) => POS_ORDER[a.position] - POS_ORDER[b.position] || b.rating - a.rating
  );

  return (
    <div className={styles.container}>
      <div className={styles.panel} style={{ backgroundColor: team.primaryColor }}>
        <div>
          <div className={styles.teamName}>{team.name}</div>
          <div className={styles.division}>1ª Divisão</div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoLabel}>Técnico</div>
          <div>{team.coach}</div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoLabel}>Estádio</div>
          <div>{team.stadium}</div>
          <div className={styles.capacity}>{team.capacity.toLocaleString('pt-BR')} lugares</div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoLabel}>Jogadores</div>
          <div>{players.length}</div>
        </div>
        <button className={styles.backButton} onClick={onBack}>
          « Voltar
        </button>
      </div>

      <div className={styles.squadPanel}>
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
              {sorted.map((player, index) => (
                <tr
                  key={player.id}
                  className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
