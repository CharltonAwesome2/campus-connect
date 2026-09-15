import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/index.css';

const _origSetProperty = CSSStyleDeclaration.prototype.setProperty;
Object.defineProperty(CSSStyleDeclaration.prototype, 'setProperty', {
  value: function (name, value, priority) {
    if (typeof name === 'number' || /^\d+$/.test(name)) {
      console.error('BAD STYLE OBJECT — key is a number:', name, 'value:', value);
      console.trace();
      return;
    }
    return _origSetProperty.call(this, name, value, priority);
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);