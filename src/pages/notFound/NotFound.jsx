import { useNavigate } from 'react-router';
import Button from '@/components/button/Button';
import { Home, ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.text}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button className={styles.homeBtn} onClick={() => navigate('/')}>
            <Home size={16} />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}