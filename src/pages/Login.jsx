import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ImageWithFallback from "@components/ImageWithFallback";
import { useAuth } from "@context/AuthContext";
import { accounts } from "@data/accounts";
import styles from "./Login.module.css";
import { Link } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAs } = useAuth();

  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true });
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const result = login(email, password, selectedRole);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/${selectedRole}`);
  };

  const handleQuickLogin = (role) => {
    setError("");
    const result = loginAs(role);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/${role}`);
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
            {["student", "landlord", "admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={[styles.roleBtn, selectedRole === role ? styles.roleBtnActive : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className={styles.formBody}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.fieldLabel}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.fieldInput}
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

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
              <a href="#" className={styles.link}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Login to Dashboard
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Quick login (testing)
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {accounts.map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => handleQuickLogin(a.role)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    fontSize: 13,
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    background: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  {a.role}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{" "}
              <Link to="/signup" className={styles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
