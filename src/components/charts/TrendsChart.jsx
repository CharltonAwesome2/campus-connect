import Card from "@/components/card/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./TrendsChart.module.css";
import { tooltipContentStyle } from "@data/chartStyles";

export default function TrendsChart({ data }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Application Trends</h3>
      </div>
      <div className={styles.body}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} name="Applications" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
