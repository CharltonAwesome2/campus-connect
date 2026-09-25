import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";
import styles from "./Sonner.module.css";

export default function Sonner() {
  const { theme = "system" } = useTheme();

  return <SonnerToaster theme={theme} className={styles.toaster} />;
}
