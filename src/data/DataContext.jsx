// src/data/DataContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { db } from "@lib/data";
import { useAuth } from "@context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    // No user → clear data, don't fetch
    if (!user) {
      setResidences([]);
      setApplications([]);
      setMonthlyData([]);
      setNotifications([]);
      setAmenities([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const [res, apps, monthly, notes, amenityList] = await Promise.all([
          db.getResidences(),
          db.getApplications(),
          db.getMonthlyData(),
          db.getNotifications().catch((err) => {
            console.error("[data] notifications fetch failed", err);
            return [];
          }),
          db.getAmenities().catch((err) => {
            console.error("[data] amenities fetch failed", err);
            return [];
          }),
        ]);
        if (cancelled) return;
        setResidences(res);
        setApplications(apps);
        setMonthlyData(monthly);
        setNotifications(notes);
        setAmenities(amenityList);
      } catch (err) {
        console.error("Failed to load data", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const addResidence = async (residence) => {
    const updated = await db.addResidence(residence);
    setResidences(updated);
  };

  const removeResidence = async (id) => {
    const updated = await db.removeResidence(id);
    setResidences(updated);
  };

  const addApplication = async (application) => {
    const updated = await db.addApplication(application);
    setApplications(updated);
    setMonthlyData(await db.getMonthlyData());
  };

  const updateApplicationStatus = async (id, status) => {
    const updated = await db.updateApplicationStatus(id, status);
    setApplications(updated);
  };

  const markNotificationRead = async (id) => {
    const updated = await db.markNotificationRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = async () => {
    const updated = await db.markAllNotificationsRead();
    setNotifications(updated);
  };

  const updateResidence = async (id, patch) => {
    const updated = await db.updateResidence(id, patch);
    setResidences(updated);
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  return (
    <DataContext.Provider
      value={{
        residences,
        applications,
        monthlyData,
        notifications,
        amenities,
        unreadCount,
        loading,
        error,
        addResidence,
        updateResidence,
        removeResidence,
        addApplication,
        updateApplicationStatus,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
