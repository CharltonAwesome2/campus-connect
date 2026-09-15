import Card from "@components/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./OccupancyChart.module.css";
import { tooltipContentStyle } from "@data/chartStyles";

export default function OccupancyChart({ data }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Occupancy Rate Over Time</h3>
      </div>
      <div className={styles.body}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            <Bar dataKey="occupancy" fill="#10b981" name="Occupancy %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
