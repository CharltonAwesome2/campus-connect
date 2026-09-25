import { useState } from "react";
import DashboardShell from "@components/DashboardShell";
import ResidenceCard from "@components/ResidenceCard";
import ApplicationCard from "@components/ApplicationCard";
import StatCard from "@components/StatCard";
import EmptyState from "@components/EmptyState";
import Card from "@components/Card";
import Tabs from "@components/Tabs";
import Input from "@components/Input";
import Select from "@components/Select";
import { useData } from "@data/DataContext";
import { Search, Building2, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import styles from "./StudentDashboard.module.css";
import { useAuth } from "@context/AuthContext";
import { priceOptions, typeOptions } from "@data/options";

export default function StudentDashboard() {
  const { residences, applications, addApplication } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const myApplications = applications.filter((a) => a.studentId === user.id);

  const handleApply = (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    if (!residence) return;

    const already = myApplications.some((a) => a.residenceId === residenceId);
    if (already) {
      toast.error("You already applied for this residence.");
      return;
    }

    addApplication({
      residenceId: residence.id,
      status: "pending",
      appliedDate: new Date().toISOString(),
    });

    toast.success(`Application submitted for ${residence.name}!`, {
      description: "You will be notified once your application is reviewed.",
    });
  };

  const filteredResidences = residences.filter((residence) => {
    const matchesSearch = residence.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && residence.price < 4000) ||
      (priceFilter === "medium" && residence.price >= 4000 && residence.price < 6000) ||
      (priceFilter === "high" && residence.price >= 6000);
    const matchesType = typeFilter === "all" || residence.type === typeFilter;
    return matchesSearch && matchesPrice && matchesType;
  });

  const stats = {
    total: myApplications.length,
    pending: myApplications.filter((a) => a.status === "pending").length,
    approved: myApplications.filter((a) => a.status === "approved").length,
    rejected: myApplications.filter((a) => a.status === "rejected").length,
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, Icon: FileText, color: "#2563eb", bg: "#dbeafe" },
    { label: "Pending", value: stats.pending, Icon: Clock, color: "#ca8a04", bg: "#fef9c3" },
    { label: "Approved", value: stats.approved, Icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "Rejected", value: stats.rejected, Icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
  ];

  const tabs = [
    {
      value: "browse",
      label: (
        <>
          <Building2 size={16} /> Browse Residences
        </>
      ),
    },
    {
      value: "applications",
      label: (
        <>
          <FileText size={16} /> My Applications
        </>
      ),
    },
  ];

  return (
    <DashboardShell role="student" userName={user.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.statsGrid}
      >
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <StatCard key={label} label={label} value={value} Icon={Icon} color={color} bg={bg} />
        ))}
      </motion.div>

      <Tabs tabs={tabs} defaultValue="browse">
        {(active) =>
          active === "browse" ? (
            <div className={styles.tabContent}>
              <Card>
                <div className={styles.filterBody}>
                  <div className={styles.filterGrid}>
                    <div className={styles.searchWrap}>
                      <Search size={16} className={styles.searchIcon} />
                      <Input
                        placeholder="Search residences..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                    <Select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      options={priceOptions}
                    />
                    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={typeOptions} />
                  </div>
                </div>
              </Card>

              <div className={styles.residenceGrid}>
                {filteredResidences.map((residence, index) => (
                  <motion.div
                    key={residence.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ResidenceCard residence={residence} onApply={handleApply} />
                  </motion.div>
                ))}
              </div>

              {filteredResidences.length === 0 && (
                <Card>
                  <EmptyState Icon={Building2} title="No residences found matching your criteria" />
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>Application Status Tracking</h3>
              </div>
              <div className={styles.cardBody}>
                {myApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ApplicationCard application={application} />
                  </motion.div>
                ))}
                {myApplications.length === 0 && (
                  <EmptyState
                    Icon={FileText}
                    title="No applications yet"
                    subtitle="Browse residences and apply to get started"
                  />
                )}
              </div>
            </Card>
          )
        }
      </Tabs>
    </DashboardShell>
  );
}
