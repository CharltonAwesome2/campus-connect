import styles from './Card.module.css';

export default function Card({ children, className = '' }) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}