import { Link } from "react-router-dom";
import { Building2, MapPin, Calendar } from "lucide-react";

const STATUS_STYLES = {
  "on-track": { label: "On Track", classes: "bg-green-50 text-green-600" },
  "at-risk": { label: "At Risk", classes: "bg-orange-50 text-orange-600" },
  delayed: { label: "Delayed", classes: "bg-red-50 text-red-600" },
  completed: { label: "Completed", classes: "bg-blue-50 text-blue-600" },
};

/**
 * Project summary card used in the Projects grid.
 *
 * Props (project object):
 *  - id: number | string          used to build the details link
 *  - name: string
 *  - location: string
 *  - progress: number             0-100
 *  - status: "on-track" | "at-risk" | "delayed" | "completed"
 *  - deadline: string             e.g. "Dec 2026" or "Completed"
 */
export default function ProjectCard({ id, name, location, progress, status, deadline }) {
  const statusInfo = STATUS_STYLES[status] || STATUS_STYLES["on-track"];

  return (
    <Link
      to={`/dashboard/projects/${id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <Building2 size={17} />
        </div>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${statusInfo.classes}`}>
          {statusInfo.label}
        </span>
      </div>

      <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>

      <p className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <MapPin size={12} />
        {location}
      </p>

      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{progress}% complete</span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {deadline}
        </span>
      </div>
    </Link>
  );
}
