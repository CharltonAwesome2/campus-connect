import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export default function Sonner() {
  const { theme = 'system' } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      style={{
        '--normal-bg': 'var(--background)',
        '--normal-text': 'var(--foreground)',
        '--normal-border': 'var(--border)',
      }}
    />
  );
}