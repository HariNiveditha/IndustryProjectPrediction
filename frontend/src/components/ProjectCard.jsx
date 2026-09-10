import { Link } from "react-router-dom";
import { Building2, MapPin, Calendar } from "lucide-react";

export default function ProjectCard({ project }) {
  const location = [project.state, project.sector].filter(Boolean).join(" · ");
  return (
    <Link to={`/dashboard/projects/${encodeURIComponent(project.project_id)}`} className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Building2 size={17} /></div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-blue-50 text-blue-600">Live data</span>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{project.project_name || project.project_id}</h3>
      <p className="flex items-center gap-1 text-xs text-slate-400 mb-4"><MapPin size={12} />{location || "Project metadata"}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{project.project_code || "Project code unavailable"}</span>
        <span className="flex items-center gap-1"><Calendar size={12} />View snapshots</span>
      </div>
    </Link>
  );
}
