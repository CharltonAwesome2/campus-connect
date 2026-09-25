import styles from './Input.module.css';

export default function Input({ id, type = 'text', value, onChange, placeholder, required, className = '' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={[styles.input, className].filter(Boolean).join(' ')}
    />
  );
}