import { useState } from 'react';
import styles from './Tabs.module.css';

export default function Tabs({ tabs, defaultValue, onChange, children }) {
  const [active, setActive] = useState(defaultValue ?? tabs[0].value);

  const handleSelect = (value) => {
    setActive(value);
    if (onChange) onChange(value);
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.list} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => handleSelect(tab.value)}
            className={[styles.trigger, active === tab.value ? styles.active : ''].filter(Boolean).join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content} role="tabpanel">
        {children(active)}
      </div>
    </div>
  );
}