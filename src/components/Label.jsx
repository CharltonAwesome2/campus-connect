import styles from './Label.module.css';

export default function Label({ htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
    </label>
  );
}