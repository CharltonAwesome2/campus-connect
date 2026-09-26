import { useState } from "react";
import DashboardShell from "@components/dashboardShell/DashboardShell";
import ResidenceCard from "@components/residenceCard/ResidenceCard";
import ApplicationCard from "@components/applicationCard/ApplicationCard";
import StatCard from "@components/statCard/StatCard";
import EmptyState from "@components/emptyState/EmptyState";
import AddPropertyDialog from "@components/addPropertyDialog/AddPropertyDialog";
import Card from "@components/card/Card";
import Tabs from "@components/tabs/Tabs";
import Button from "@components/button/Button";
import { useData } from "@data/DataContext";
import { Building2, FileText, Plus, DollarSign, Users, TrendingUp, Home } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import styles from "./LandlordDashboard.module.css";
import { useAuth } from "@context/AuthContext";

export default function LandlordDashboard() {
  const [editingResidence, setEditingResidence] = useState(null);
  const { residences, applications, addResidence, removeResidence, updateApplicationStatus } = useData();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const landlordResidences = user?.landlordId ? residences.filter((r) => r.landlordId === user.landlordId) : [];

  const landlordApplications = user?.landlordId
    ? applications.filter((a) => landlordResidences.some((r) => r.id === a.residenceId))
    : [];

  const handleApprove = (applicationId) => {
    const application = applications.find((a) => a.id === applicationId);
    updateApplicationStatus(applicationId, "approved");
    toast.success(`Application approved for ${application?.studentName}`, {
      description: "The student has been notified.",
    });
  };

  const handleReject = (applicationId) => {
    const application = applications.find((a) => a.id === applicationId);
    updateApplicationStatus(applicationId, "rejected");
    toast.error(`Application rejected for ${application?.studentName}`, {
      description: "The student has been notified.",
    });
  };

  const handleEdit = (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    if (residence) setEditingResidence(residence);
  };

  const handleDelete = async (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    if (!window.confirm(`Remove ${residence?.name}?`)) return;
    try {
      await removeResidence(residenceId);
      toast.success(`${residence?.name} removed from listings`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove property");
    }
  };

  const handleAddProperty = (data) => {
    if (!data) {
      toast.error("Please fill in name, price, and total rooms.");
      return;
    }

    if (editingResidence) {
      updateResidence(editingResidence.id, {
        name: data.name,
        address: data.address,
        description: data.description,
        distanceKm: data.distanceKm,
        price: data.price,
        type: data.type,
        totalRooms: data.totalRooms,
        availableRooms: data.availableRooms,
        amenityIds: data.amenityIds,
      });
      toast.success("Property updated successfully!");
      setEditingResidence(null);
      setIsAddDialogOpen(false);
      return;
    }

    addResidence({
      landlordId: user.landlordId,
      name: data.name,
      address: data.address,
      description: data.description,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      distanceKm: data.distanceKm,
      price: data.price,
      type: data.type,
      totalRooms: data.totalRooms,
      availableRooms: data.availableRooms || data.totalRooms,
      amenityIds: data.amenityIds,
    });
    toast.success("New property added successfully!");
    setIsAddDialogOpen(false);
  };

  const totalRooms = landlordResidences.reduce((sum, r) => sum + r.totalRooms, 0);
  const occupiedRooms = landlordResidences.reduce((sum, r) => sum + (r.totalRooms - r.availableRooms), 0);
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
  const avgPrice =
    landlordResidences.length > 0
      ? (landlordResidences.reduce((sum, r) => sum + r.price, 0) / landlordResidences.length).toFixed(0)
      : 0;
  const pendingCount = landlordApplications.filter((a) => a.status === "pending").length;

  const statCards = [
    { label: "Total Properties", value: landlordResidences.length, Icon: Home, color: "#2563eb", bg: "#dbeafe" },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      Icon: TrendingUp,
      color: "#16a34a",
      bg: "#dcfce7",
      progress: parseFloat(occupancyRate),
    },
    {
      label: "Avg. Price",
      value: `R${Number(avgPrice).toLocaleString()}`,
      Icon: DollarSign,
      color: "#4f46e5",
      bg: "#e0e7ff",
    },
    { label: "Pending Apps", value: pendingCount, Icon: FileText, color: "#ca8a04", bg: "#fef9c3" },
  ];

  const tabs = [
    {
      value: "properties",
      label: (
        <>
          <Building2 size={16} /> My Properties
        </>
      ),
    },
    {
      value: "applications",
      label: (
        <>
          <FileText size={16} /> Applications ({pendingCount})
        </>
      ),
    },
  ];

  return (
    <DashboardShell role="landlord" userName={user.name}>
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

      <Tabs tabs={tabs} defaultValue="properties">
        {(active) =>
          active === "properties" ? (
            <div className={styles.tabContent}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Property Listings</h2>
                <Button className={styles.addBtn} onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} />
                  Add Property
                </Button>
              </div>

              <div className={styles.residenceGrid}>
                {landlordResidences.map((residence, index) => (
                  <motion.div
                    key={residence.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ResidenceCard residence={residence} showActions onEdit={handleEdit} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>Student Applications</h3>
              </div>
              <div className={styles.cardBody}>
                {landlordApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ApplicationCard
                      application={application}
                      showActions
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </motion.div>
                ))}
                {landlordApplications.length === 0 && <EmptyState Icon={Users} title="No applications received yet" />}
              </div>
            </Card>
          )
        }
      </Tabs>

      <AddPropertyDialog
        open={isAddDialogOpen || !!editingResidence}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingResidence(null);
        }}
        onSubmit={handleAddProperty}
        initialData={editingResidence}
      />
    </DashboardShell>
  );
}
