// src/data/DataContext.jsx
import { createContext, useContext, useState } from 'react';
import {
  residences as initialResidences,
  applications as initialApplications,
} from './mock-data';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState(initialResidences);
  const [applications, setApplications] = useState(initialApplications);

  const addResidence = (residence) => {
    setResidences((prev) => [...prev, residence]);
  };

  const removeResidence = (id) => {
    setResidences((prev) => prev.filter((r) => r.id !== id));
  };

  const addApplication = (application) => {
    setApplications((prev) => [...prev, application]);
  };

  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  return (
    <DataContext.Provider
      value={{
        residences,
        applications,
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
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}