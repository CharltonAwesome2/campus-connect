// src/data/DataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@lib/data";
import { useAuth } from "@context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [res, apps, monthly] = await Promise.all([
          db.getResidences(),
          db.getApplications(),
          db.getMonthlyData(),
        ]);
        if (cancelled) return;
        setResidences(res);
        setApplications(apps);
        setMonthlyData(monthly);
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
    // Refresh monthly aggregates since application counts changed
    setMonthlyData(await db.getMonthlyData());
  };

  const updateApplicationStatus = async (id, status) => {
    const updated = await db.updateApplicationStatus(id, status);
    setApplications(updated);
  };

  return (
    <DataContext.Provider
      value={{
        residences,
        applications,
        monthlyData,
        loading,
        error,
        addResidence,
        removeResidence,
        addApplication,
        updateApplicationStatus,
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