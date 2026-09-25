import { useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

export default function Dialog({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={styles.dialog}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}