// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import ImageWithFallback from "@components/imageWithFallback/ImageWithFallback";
import { useAuth } from "@context/AuthContext";
import styles from "../login/Login.module.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
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

    setSubmitting(true);
    const result = await signup({ email, password, fullName, role });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setSuccess(
        "Account created. Check your email to confirm, then log in."
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Session is live — straight to the dashboard.
    navigate(`/${result.user.role}`);
  };

  const nameLabel = role === "landlord" ? "Company Name" : "Full Name";
  const namePlaceholder =
    role === "landlord"
      ? "Enter your company name"
      : "Enter your full name";

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
              Create an account to find student housing or list your
              properties.
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
                disabled={submitting}
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
              <label className={styles.fieldLabel}>{nameLabel}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={namePlaceholder}
                className={styles.fieldInput}
                disabled={submitting}
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
                autoComplete="email"
                disabled={submitting}
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
                autoComplete="new-password"
                disabled={submitting}
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
                autoComplete="new-password"
                disabled={submitting}
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

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create Account"}
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