import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight } from "lucide-react";

const LEVEL_COLORS = {
  low: "bg-green-500",
  medium: "bg-orange-500",
  high: "bg-red-500",
  critical: "bg-red-700",
};

/**
 * AI risk-prediction card for a single project, showing an
 * overall confidence score plus a breakdown of individual
 * risk factors. Used on the Predictions page.
 *
 * Props:
 *  - id: number | string        used to build the details link
 *  - project: string            project name
 *  - confidence: number         0-100, model confidence
 *  - summary: string            short natural-language explanation
 *  - factors: [{ label, value, level }]
 *      label: string            e.g. "Cost overrun likelihood"
 *      value: number            0-100
 *      level: "low" | "medium" | "high" | "critical"
 */
export default function RiskCard({ id, project, confidence, summary, factors = [] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm mb-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <Sparkles size={15} className="text-blue-600" />
            {project}
          </p>
          {summary && (
            <p className="text-sm text-slate-500 mt-1 max-w-xl">{summary}</p>
          )}
        </div>

        {confidence != null && (
          <span className="shrink-0 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 px-3 py-1">
            {confidence}% confidence
          </span>
        )}
      </div>

      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 min-w-[190px]">{f.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${LEVEL_COLORS[f.level] || LEVEL_COLORS.low}`}
                style={{ width: `${f.value}%` }}
              />
            </div>
            <strong className="text-xs w-9 text-right text-slate-700">{f.value}%</strong>
          </div>
        ))}
      </div>

      {id != null && (
        <Link
          to={`/dashboard/projects/${id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-4"
        >
          View project details <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}
