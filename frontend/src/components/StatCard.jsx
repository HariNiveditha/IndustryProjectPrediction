import { TrendingUp, TrendingDown } from "lucide-react";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

/**
 * Dashboard summary tile — icon, headline number, and an
 * optional up/down change badge. Used for things like
 * "Total Projects", "Projects At Risk", etc.
 *
 * Props:
 *  - icon: a lucide-react icon component
 *  - color: "blue" | "green" | "orange" | "red"   (default "blue")
 *  - label: string          e.g. "Total Projects"
 *  - value: string | number e.g. "1,981"
 *  - change: string         e.g. "8.2%" or "+12" (omit to hide the badge)
 *  - trend: "up" | "down"   controls arrow + color of the change badge
 *  - description: string    e.g. "Ongoing projects"
 */
export default function StatCard({
  icon: Icon,
  color = "blue",
  label,
  value,
  change,
  trend = "up",
  description,
}) {
  const iconClasses = ICON_COLORS[color] || ICON_COLORS.blue;
  const isPositive = trend === "up";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClasses}`}>
          {Icon && <Icon size={22} />}
        </div>

        {change && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <h2 className="text-2xl font-bold text-slate-900">{value}</h2>

      {description && (
        <span className="text-xs text-slate-400">{description}</span>
      )}
    </div>
  );
}
