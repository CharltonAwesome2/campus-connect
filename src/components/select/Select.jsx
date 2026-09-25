import styles from './Select.module.css';

export default function Select({ id, value, onChange, options, className = '' }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={[styles.select, className].filter(Boolean).join(' ')}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}