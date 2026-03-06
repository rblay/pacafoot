import { useState } from 'react';
import styles from './SubPanel.module.css';
import type { Player } from '../../types';

interface PendingSub {
  playerOut: string;
  playerIn: string;
}

interface SubPanelProps {
  starters: Player[];
  benchRemaining: Player[];
  onConfirm: (subs: PendingSub[]) => void;
  onCancel: () => void;
  subsUsed: number;
}

const MAX_SUBS = 5;

export default function SubPanel({ starters, benchRemaining, onConfirm, onCancel, subsUsed }: SubPanelProps) {
  const [pendingSubs, setPendingSubs] = useState<PendingSub[]>([]);
  const [selectedOut, setSelectedOut] = useState<string | null>(null);
  const [selectedIn, setSelectedIn] = useState<string | null>(null);

  const maxThisSession = MAX_SUBS - subsUsed;
  const canAddMore = pendingSubs.length < maxThisSession;

  const pendingOutIds = new Set(pendingSubs.map(s => s.playerOut));
  const pendingInIds = new Set(pendingSubs.map(s => s.playerIn));

  const availableStarters = starters.filter(p => !pendingOutIds.has(p.id));
  const availableBench = benchRemaining.filter(p => !pendingInIds.has(p.id));

  const playerMap = new Map([...starters, ...benchRemaining].map(p => [p.id, p]));

  // Auto-queue the pair as soon as both players are selected
  const handleSelectOut = (id: string) => {
    const newOut = selectedOut === id ? null : id;
    if (newOut && selectedIn) {
      setPendingSubs(prev => [...prev, { playerOut: newOut, playerIn: selectedIn }]);
      setSelectedOut(null);
      setSelectedIn(null);
    } else {
      setSelectedOut(newOut);
    }
  };

  const handleSelectIn = (id: string) => {
    const newIn = selectedIn === id ? null : id;
    if (selectedOut && newIn) {
      setPendingSubs(prev => [...prev, { playerOut: selectedOut, playerIn: newIn }]);
      setSelectedOut(null);
      setSelectedIn(null);
    } else {
      setSelectedIn(newIn);
    }
  };

  const handleRemove = (index: number) => {
    setPendingSubs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          Substituições ({subsUsed + pendingSubs.length}/{MAX_SUBS})
        </div>

        {pendingSubs.length > 0 && (
          <div className={styles.pendingList}>
            {pendingSubs.map((sub, i) => (
              <div key={i} className={styles.pendingRow}>
                <span className={styles.pendingOut}>{playerMap.get(sub.playerOut)?.name} →</span>
                {' '}
                <span className={styles.pendingIn}>← {playerMap.get(sub.playerIn)?.name}</span>
                <button className={styles.removeBtn} onClick={() => handleRemove(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {canAddMore && (
          <div className={styles.columns}>
            <div className={styles.column}>
              <div className={styles.columnTitle}>↑ Sai</div>
              {availableStarters.map(p => (
                <div
                  key={p.id}
                  className={`${styles.playerRow} ${selectedOut === p.id ? styles.selected : ''}`}
                  onClick={() => handleSelectOut(p.id)}
                >
                  <span className={styles.pos}>{p.position}</span>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.rating}>{p.rating}</span>
                </div>
              ))}
            </div>

            <div className={styles.column}>
              <div className={styles.columnTitle}>↓ Entra</div>
              {availableBench.length === 0 ? (
                <div className={styles.empty}>Sem reservas</div>
              ) : (
                availableBench.map(p => (
                  <div
                    key={p.id}
                    className={`${styles.playerRow} ${selectedIn === p.id ? styles.selected : ''}`}
                    onClick={() => handleSelectIn(p.id)}
                  >
                    <span className={styles.pos}>{p.position}</span>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.rating}>{p.rating}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.confirmBtn}
            onClick={() => onConfirm(pendingSubs)}
            disabled={pendingSubs.length === 0}
          >
            Confirmar{pendingSubs.length > 0 ? ` (${pendingSubs.length})` : ''}
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {pendingSubs.length > 0 ? 'Cancelar' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
