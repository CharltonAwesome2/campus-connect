import { GraduationCap, Building2, User, Shield, Check, Scale, Zap } from "lucide-react";
import Card from "@components/Card";
import Button from "@components/Button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student Portal",
      description: "Browse available residences and track your applications",
      icon: User,
      color: "#2563eb",
      path: "/student",
    },
    {
      id: "landlord",
      title: "Landlord Dashboard",
      description: "Manage properties and review student applications",
      icon: Building2,
      color: "#4f46e5",
      path: "/landlord",
    },
    {
      id: "admin",
      title: "Admin Dashboard",
      description: "Oversee the entire residence management system",
      icon: Shield,
      color: "#9333ea",
      path: "/admin",
    },
  ];

  const pillars = [
    {
      icon: Check,
      color: "#2563eb",
      bg: "#dbeafe",
      title: "Transparency",
      text: "Clear visibility into available residences and application status",
    },
    {
      icon: Scale,
      color: "#4f46e5",
      bg: "#e0e7ff",
      title: "Fairness",
      text: "Equitable allocation process for all students",
    },
    {
      icon: Zap,
      color: "#9333ea",
      bg: "#f3e8ff",
      title: "Efficiency",
      text: "Streamlined application and approval workflow",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <div className={styles.heroIcon}>
            <GraduationCap size={48} color="#ffffff" />
          </div>
          <h1 className={styles.heroTitle}>CampusConnect Management System</h1>
          <p className={styles.heroText}>
            Connecting South African students with quality accommodation - improving transparency, fairness, and
            efficiency in student residence allocation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={styles.sectionTitle}>Select Your Role</h2>
          <div className={styles.roleGrid}>
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className={styles.roleCard}>
                    <div className={styles.roleCardBody}>
                      <div className={styles.roleIcon} style={{ background: role.color }}>
                        <Icon size={24} color="#ffffff" />
                      </div>
                      <h3 className={styles.roleTitle}>{role.title}</h3>
                      <p className={styles.roleText}>{role.description}</p>
                      <Button
                        className={styles.roleButton}
                        style={{ background: role.color, color: "#ffffff", borderColor: role.color }}
                        onClick={() => navigate(role.path)}
                      >
                        Enter Dashboard
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={styles.pillars}
        >
          <div className={styles.pillarGrid}>
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title}>
                  <div className={styles.pillarIcon} style={{ background: p.bg }}>
                    <Icon size={24} color={p.color} />
                  </div>
                  <h4 className={styles.pillarTitle}>{p.title}</h4>
                  <p className={styles.pillarText}>{p.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
