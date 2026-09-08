import { useState } from "react";
import { Plus } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import "./Projects.css";

const PROJECTS = [
  { id: 1, name: "NH-44 Widening Phase II", location: "Nagpur, MH", progress: 72, status: "on-track", deadline: "Dec 2026" },
  { id: 2, name: "Godavari River Bridge", location: "Rajahmundry, AP", progress: 41, status: "at-risk", deadline: "Mar 2027" },
  { id: 3, name: "Metro Corridor Extension", location: "Hyderabad, TS", progress: 88, status: "on-track", deadline: "Oct 2026" },
  { id: 4, name: "Rural Water Pipeline", location: "Bidar, KA", progress: 23, status: "delayed", deadline: "Jan 2027" },
  { id: 5, name: "Coastal Highway Repair", location: "Vizag, AP", progress: 100, status: "completed", deadline: "Completed" },
  { id: 6, name: "Smart Traffic Signal Grid", location: "Pune, MH", progress: 55, status: "on-track", deadline: "Aug 2026" },
];

const FILTERS = ["All", "On Track", "At Risk", "Delayed", "Completed"];
const STATUS_MAP = {
  "On Track": "on-track",
  "At Risk": "at-risk",
  Delayed: "delayed",
  Completed: "completed",
};

function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.status === STATUS_MAP[activeFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{PROJECTS.length} infrastructure projects across your portfolio.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="projects-toolbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-pill ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}

export default Projects;