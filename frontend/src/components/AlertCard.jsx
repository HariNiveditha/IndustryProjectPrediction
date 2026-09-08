import { Link } from "react-router-dom";
import { ShieldAlert, ArrowUpRight } from "lucide-react";

const SEVERITY_STYLES = {
  high: { label: "High", icon: "bg-red-50 text-red-500", badge: "bg-red-50 text-red-600" },
  medium: { label: "Medium", icon: "bg-orange-50 text-orange-500", badge: "bg-orange-50 text-orange-600" },
  low: { label: "Low", icon: "bg-blue-50 text-blue-500", badge: "bg-blue-50 text-blue-600" },
};

/**
 * A single alert row, used on the Dashboard "Recent Alerts"
 * panel and the full Alerts list.
 *
 * Props:
 *  - title: string             e.g. "Budget overrun risk detected"
 *  - desc: string              optional longer description
 *  - severity: "high" | "medium" | "low"
 *  - time: string              e.g. "2 hours ago"
 *  - project: string           project name, shown as a link
 *  - projectId: number|string  used to build the details link
 */
export default function AlertCard({ title, desc, severity = "low", time, project, projectId }) {
  const sev = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${sev.icon}`}>
        <ShieldAlert size={17} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm text-slate-900">{title}</p>
          {time && <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>}
        </div>

        {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}

        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${sev.badge}`}>
            {sev.label} severity
          </span>

          {project && projectId && (
            <Link
              to={`/dashboard/projects/${projectId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {project} <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
