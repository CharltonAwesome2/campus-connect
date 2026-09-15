import Card from '@components/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './StatusPie.module.css';

export default function StatusPie({ data }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Application Status</h3>
      </div>
      <div className={styles.body}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}