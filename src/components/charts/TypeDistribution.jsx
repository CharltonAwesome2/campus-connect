import Card from "@components/card/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./TypeDistribution.module.css";
import { tooltipContentStyle } from "@data/chartStyles";

export default function TypeDistribution({ data }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Residence Type Distribution</h3>
      </div>
      <div className={styles.body}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Bar dataKey="value" fill="#6366f1" name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
