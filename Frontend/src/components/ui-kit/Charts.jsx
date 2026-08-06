import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12
};
function AuthTrendChart({ data }) {
  return <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="loginsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="blockedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
    type="monotone"
    dataKey="logins"
    stroke="var(--primary)"
    strokeWidth={2.5}
    fill="url(#loginsFill)"
    name="Successful"
  />
        <Area
    type="monotone"
    dataKey="blocked"
    stroke="var(--destructive)"
    strokeWidth={2}
    fill="url(#blockedFill)"
    name="Blocked"
  />
      </AreaChart>
    </ResponsiveContainer>;
}
const methodColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
function MethodBreakdownChart({ data }) {
  return <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="method" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[10, 10, 6, 6]} name="Share">
          {data.map((entry, index) => <Cell key={entry.method} fill={methodColors[index % methodColors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>;
}
export {
  AuthTrendChart,
  MethodBreakdownChart
};
