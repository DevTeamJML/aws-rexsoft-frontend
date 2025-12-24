import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const COLOR = "#4F46E5";

export function KpiMiniChart({ type, data }) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      {type === "bar" && (
        <BarChart data={data} barCategoryGap={12}>
          <XAxis dataKey="x" hide />
          <YAxis hide />
          <Bar
            dataKey="y"
            fill={COLOR}
            radius={[6, 6, 0, 0]}  
          />
        </BarChart>
      )}

      {type === "area" && (
        <AreaChart data={data}>
          <XAxis dataKey="x" hide />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="y"
            stroke={COLOR}
            strokeWidth={2}
            fill={COLOR}
            fillOpacity={0.18}   
            dot={false}
          />
        </AreaChart>
      )}

      {type === "line" && (
        <LineChart data={data}>
          <XAxis dataKey="x" hide />
          <YAxis hide />
          <Line
            type="monotone"
            dataKey="y"
            stroke={COLOR}
            strokeWidth={2.5}     
            dot={false}
            activeDot={{
              r: 4,
              fill: COLOR,
            }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
