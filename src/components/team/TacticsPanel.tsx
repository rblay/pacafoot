import { useState } from 'react';
import styles from './TacticsPanel.module.css';
import type { Team, TacticalConfig, Formation, PlayStyle, AttackFocus, Pressing } from '../../types';

interface TacticsPanelProps {
  team: Team;
  tactics: TacticalConfig;
  onTacticsChange: (tactics: TacticalConfig) => void;
  startersCount: number;
  subsCount: number;
  canPlay: boolean;
  onPlay: () => void;
}

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '3-4-3'];
const PLAY_STYLES: PlayStyle[] = ['Defensivo', 'Equilibrado', 'Ofensivo'];
const ATTACK_FOCUSES: AttackFocus[] = ['Alas', 'Centro', 'Ambos'];
const PRESSING_OPTIONS: Pressing[] = ['Baixa', 'Média', 'Alta'];

export default function TacticsPanel({
  team,
  tactics,
  onTacticsChange,
  startersCount,
  subsCount,
  canPlay,
  onPlay,
}: TacticsPanelProps) {
  const [boardConfidence] = useState(72);
  const [fanConfidence] = useState(65);

  const updateTactic = <K extends keyof TacticalConfig>(key: K, value: TacticalConfig[K]) => {
    onTacticsChange({ ...tactics, [key]: value });
  };

  return (
    <div className={styles.panel} style={{ backgroundColor: team.primaryColor }}>
      <div>
        <div className={styles.teamName}>{team.name}</div>
        <div className={styles.division}>1ª Divisão</div>
      </div>

      <div className={styles.coach}>Técnico: {team.coach}</div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Confiança diretoria</div>
        <div className={styles.confidenceBar}>
          <div className={styles.confidenceFill} style={{ width: `${boardConfidence}%` }} />
          <span className={styles.confidenceText}>{boardConfidence}%</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Confiança torcida</div>
        <div className={styles.confidenceBar}>
          <div className={styles.confidenceFill} style={{ width: `${fanConfidence}%` }} />
          <span className={styles.confidenceText}>{fanConfidence}%</span>
        </div>
      </div>

      <div className={styles.nextMatch}>
        <div className={styles.sectionLabel}>Próximo jogo</div>
        <div>Rodada —</div>
      </div>

      <div className={styles.tacticalRow}>
        <label className={styles.tacticalLabel}>Formação</label>
        <select
          className={styles.tacticalSelect}
          value={tactics.formation}
          onChange={e => updateTactic('formation', e.target.value as Formation)}
        >
          {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className={styles.tacticalRow}>
        <label className={styles.tacticalLabel}>Estilo</label>
        <select
          className={styles.tacticalSelect}
          value={tactics.playStyle}
          onChange={e => updateTactic('playStyle', e.target.value as PlayStyle)}
        >
          {PLAY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={styles.tacticalRow}>
        <label className={styles.tacticalLabel}>Ataque</label>
        <select
          className={styles.tacticalSelect}
          value={tactics.attackFocus}
          onChange={e => updateTactic('attackFocus', e.target.value as AttackFocus)}
        >
          {ATTACK_FOCUSES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className={styles.tacticalRow}>
        <label className={styles.tacticalLabel}>Marcação</label>
        <select
          className={styles.tacticalSelect}
          value={tactics.pressing}
          onChange={e => updateTactic('pressing', e.target.value as Pressing)}
        >
          {PRESSING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
        Selecionados: {startersCount} titulares {subsCount} reservas
      </div>

      <button
        className={styles.playButton}
        disabled={!canPlay}
        onClick={onPlay}
      >
        Jogar &gt;&gt;
      </button>
    </div>
  );
}
