import { useState } from "react";
import DashboardShell from "@components/dashBoardShell/DashboardShell";
import StatCard from "@components/statCard/StatCard";
import Card from "@/components/card/Card";
import Tabs from "@/components/tabs/Tabs";
import Badge from "@/components/badge/Badge";
import Progress from "@/components/progress/Progress";
import AllocationList from "@/components/allocationList/AllocationList";
import TrendsChart from "@components/charts/TrendsChart";
import OccupancyChart from "@components/charts/OccupancyChart";
import StatusPie from "@components/charts/StatusPie";
import TypeDistribution from "@components/charts/TypeDistribution";
import { useData } from "@data/DataContext";
import { Building2, FileText, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import styles from "./AdminDashboard.module.css";
import { useAuth } from "@context/AuthContext";

export default function AdminDashboard() {
  const { residences, applications, monthlyData } = useData();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  const totalRooms = residences.reduce((sum, r) => sum + r.totalRooms, 0);
  const availableRooms = residences.reduce((sum, r) => sum + r.availableRooms, 0);
  const occupiedRooms = totalRooms - availableRooms;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0.0";

  const pendingApplications = applications.filter((a) => a.status === "pending").length;
  const approvedApplications = applications.filter((a) => a.status === "approved");
  const rejectedApplications = applications.filter((a) => a.status === "rejected").length;

  const occupancyData = monthlyData.map((m) => ({
    month: m.month,
    occupancy: Number(occupancyRate),
  }));

  const alerts = residences
    .filter((r) => r.availableRooms === 0)
    .map((r) => ({ id: r.id, name: r.name, message: "Fully occupied - no rooms available" }));

  const applicationStatusData = [
    { name: "Approved", value: approvedApplications.length, color: "#10b981" },
    { name: "Pending", value: pendingApplications, color: "#f59e0b" },
    { name: "Rejected", value: rejectedApplications, color: "#ef4444" },
  ];

  const typeDistribution = [
    { name: "Single", value: residences.filter((r) => r.type === "single").length },
    { name: "Shared", value: residences.filter((r) => r.type === "shared").length },
    { name: "Apartment", value: residences.filter((r) => r.type === "apartment").length },
  ];

  const statCards = [
    { label: "Total Residences", value: residences.length, Icon: Building2, color: "#2563eb", bg: "#dbeafe" },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      Icon: TrendingUp,
      color: "#16a34a",
      bg: "#dcfce7",
      progress: parseFloat(occupancyRate),
    },
    { label: "Total Applications", value: applications.length, Icon: FileText, color: "#4f46e5", bg: "#e0e7ff" },
    { label: "Pending Review", value: pendingApplications, Icon: Clock, color: "#ca8a04", bg: "#fef9c3" },
  ];

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "analytics", label: "Analytics" },
    { value: "allocations", label: "Allocations" },
  ];

  return (
    <DashboardShell role="admin" userName={user.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.statsGrid}
      >
        {statCards.map(({ label, value, Icon, color, bg, progress }) => (
          <StatCard key={label} label={label} value={value} Icon={Icon} color={color} bg={bg} progress={progress} />
        ))}
      </motion.div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={styles.alertsWrap}
        >
          <Card className={styles.alertsCard}>
            <div className={styles.alertsHead}>
              <h3 className={styles.alertsTitle}>
                <AlertCircle size={20} />
                System Alerts
              </h3>
            </div>
            <div className={styles.alertsBody}>
              {alerts.map((alert) => (
                <div key={alert.id} className={styles.alertRow}>
                  <div>
                    <p className={styles.alertName}>{alert.name}</p>
                    <p className={styles.alertMessage}>{alert.message}</p>
                  </div>
                  <Badge className={styles.alertBadge}>Full</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <Tabs tabs={tabs} defaultValue={selectedTab} onChange={setSelectedTab}>
        {(active) =>
          active === "overview" ? (
            <div className={styles.chartsGrid}>
              <TrendsChart data={monthlyData} />
              <OccupancyChart data={occupancyData} />
              <StatusPie data={applicationStatusData} />
              <TypeDistribution data={typeDistribution} />
            </div>
          ) : active === "analytics" ? (
            <div className={styles.analyticsWrap}>
              <div className={styles.analyticsStats}>
                {[
                  {
                    label: "Approved",
                    value: approvedApplications.length,
                    Icon: CheckCircle,
                    color: "#16a34a",
                    bg: "#dcfce7",
                  },
                  { label: "Pending", value: pendingApplications, Icon: Clock, color: "#ca8a04", bg: "#fef9c3" },
                  { label: "Rejected", value: rejectedApplications, Icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
                ].map(({ label, value, Icon, color, bg }) => (
                  <Card key={label}>
                    <div className={styles.miniStat}>
                      <div className={styles.miniIcon} style={{ background: bg }}>
                        <Icon size={20} color={color} />
                      </div>
                      <div>
                        <p className={styles.miniLabel}>{label}</p>
                        <p className={styles.miniValue}>{value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>Residence Performance</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.performanceList}>
                    {residences.map((residence) => {
                      const occupancy =
                        residence.totalRooms > 0
                          ? ((residence.totalRooms - residence.availableRooms) / residence.totalRooms) * 100
                          : 0;
                      const badgeClass =
                        occupancy >= 90 ? styles.badgeGreen : occupancy >= 70 ? styles.badgeBlue : styles.badgeYellow;
                      return (
                        <div key={residence.id} className={styles.performanceRow}>
                          <div className={styles.performanceHead}>
                            <div>
                              <p className={styles.performanceName}>{residence.name}</p>
                              <p className={styles.performanceMeta}>
                                {residence.totalRooms - residence.availableRooms} / {residence.totalRooms} occupied
                              </p>
                            </div>
                            <Badge className={badgeClass}>{occupancy.toFixed(0)}%</Badge>
                          </div>
                          <Progress value={occupancy} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className={styles.allocationsWrap}>
              <AllocationList
                title="Recent Student Allocations"
                applications={approvedApplications}
                badgeClass={styles.badgeGreen}
                avatarClass={styles.avatarBlue}
                label="Allocated"
              />
              <AllocationList
                title="Pending Allocations"
                applications={applications.filter((a) => a.status === "pending")}
                badgeClass={styles.badgeYellow}
                avatarClass={styles.avatarYellow}
                label="Awaiting Review"
              />
            </div>
          )
        }
      </Tabs>
    </DashboardShell>
  );
}
