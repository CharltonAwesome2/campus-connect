import styles from './Button.module.css';

export default function Button({ children, onClick, type = 'button', disabled, className = '', style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[styles.button, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </button>
  );
}