import { useState } from "react";
import { useNavigate, Link } from "react-router";
import ImageWithFallback from "@components/ImageWithFallback";
import { useAuth } from "@context/AuthContext";
import styles from "./Login.module.css"; // reuse the same styles

export default function Signup() {
  const navigate = useNavigate();
  const { loginAs } = useAuth(); // we only use quick-login for now

  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // For now we just show a success message.
    // Later this will call supabase.auth.signUp()
    setSuccess(
      `Account created successfully as ${role}! You can now log in.`
    );

    // Optional: clear the form
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={styles.page}>
      {/* Left side – same as Login */}
      <div className={styles.left}>
        <div className={styles.leftGradient} />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1554744072-50e09710cbda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="University Building"
          className={styles.leftImage}
        />
        <div className={styles.leftContent}>
          <div className={styles.leftInner}>
            <h1 className={styles.leftTitle}>Join Campus Connect</h1>
            <p className={styles.leftText}>
              Create an account to find student housing or list your properties.
            </p>
          </div>
        </div>
      </div>

      {/* Right side – form */}
      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.heading}>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Sign up to get started</p>
          </div>

          {/* Role selector */}
          <div className={styles.roles}>
            {["student", "landlord"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={[
                  styles.roleBtn,
                  role === r ? styles.roleBtnActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.formBody}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={styles.fieldInput}
              />
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: 14, margin: 0 }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{ color: "#16a34a", fontSize: 14, margin: 0 }}>
                {success}
              </p>
            )}

            <button type="submit" className={styles.submitBtn}>
              Create Account
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{" "}
              <Link to="/" className={styles.link}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}