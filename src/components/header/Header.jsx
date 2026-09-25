// src/components/Header.jsx
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import Button from "../button/Button";
import { useAuth } from "@context/AuthContext";
import { publicUrl } from "@lib/assets";
import styles from "./Header.module.css";

export default function Header({ role, userName = "User" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const roleLabel =
    {
      student: "Student Portal",
      landlord: "Landlord Dashboard",
      admin: "Admin Dashboard",
    }[role] || "";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img
              src={publicUrl("campus-connect.jpg")}
              alt="CampusConnect logo"
              className={styles.logoImg}
            />
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
          <Button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}