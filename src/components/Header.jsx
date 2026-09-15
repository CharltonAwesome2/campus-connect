import { GraduationCap, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import Button from './Button';
import styles from './Header.module.css';

export default function Header({ role, userName = 'User' }) {
  const navigate = useNavigate();

  const roleLabel = {
    student: 'Student Portal',
    landlord: 'Landlord Dashboard',
    admin: 'Admin Dashboard',
  }[role] || '';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className={styles.title}>CampusConnect</h1>
            <p className={styles.role}>{roleLabel}</p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              <User size={16} color="#4b5563" />
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>
          <Button onClick={() => navigate('/')} className={styles.logoutBtn}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}