import Card from "@components/card/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./ApplicationsByStatusChart.module.css";
import { tooltipContentStyle } from "@data/chartStyles";

export default function ApplicationsByStatusChart({ data }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Applications by Status</h3>
      </div>
      <div className={styles.body}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
            <Bar dataKey="pending"  stackId="a" fill="#f59e0b" name="Pending" />
            <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}