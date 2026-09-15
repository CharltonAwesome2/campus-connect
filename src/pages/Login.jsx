import { useState } from 'react';
import { useNavigate } from 'react-router';
import ImageWithFallback from '@components/ImageWithFallback';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(`/${selectedRole}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftGradient} />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1554744072-50e09710cbda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="University Building"
          className={styles.leftImage}
        />
        <div className={styles.leftContent}>
          <div className={styles.leftInner}>
            <h1 className={styles.leftTitle}>Find Your Perfect Student Home</h1>
            <p className={styles.leftText}>
              Connect with trusted landlords and discover amazing student housing opportunities near your campus
            </p>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.heading}>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Please login to continue</p>
          </div>

          <div className={styles.roles}>
            {['student', 'landlord', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={[
                  styles.roleBtn,
                  selectedRole === role ? styles.roleBtnActive : '',
                ].filter(Boolean).join(' ')}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className={styles.formBody}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.fieldLabel}>Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.fieldLabel}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.formMeta}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Remember Me</span>
              </label>
              <a href="#" className={styles.link}>Forgot Password?</a>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Login to Dashboard
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <a href="#" className={styles.link}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}