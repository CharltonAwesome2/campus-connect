import { RouterProvider } from "react-router";
import { router } from "./Routes";
import Sonner from "@components/sonner/Sonner";
import { DataProvider } from "@data/DataContext";
import { AuthProvider } from "@context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterProvider router={router} />
        <Sonner />
      </DataProvider>
    </AuthProvider>
  );
}