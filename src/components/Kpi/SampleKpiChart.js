import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
  ComposedChart,
} from "recharts";

const SAMPLE_DATA = [
  { x: "Alice", value1: 60, value2: 40 },
  { x: "Bob", value1: 45, value2: 55 },
  { x: "Charlie", value1: 70, value2: 30 },
];
export function SampleKpiChart({ series }) {
  if (!series?.length) {
    return <div className="placeholder">Select a KPI to preview</div>;
  }

  const s = series[0];

  // simple fake dataset
  const data = [
    { x: "Alice", y: 35 },
    { x: "Bob", y: 60 },
    { x: "Charlie", y: 45 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Legend />

        {s.chart_type === "line" && (
          <Line
            dataKey="y"
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        )}

        {s.chart_type === "area" && (
          <Area
            dataKey="y"
            name={s.label}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.3}
          />
        )}

        {s.chart_type === "bar" && (
          <Bar dataKey="y" name={s.label} fill={s.color} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
