import { useEffect, useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { api } from "../api/client";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    api.getProjects().then((data) => {
      setProjects(data.items || []);
      setState({ loading: false, error: "" });
    }).catch((error) => setState({ loading: false, error: error.message }));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => !query ||
      [project.project_name, project.project_code, project.project_id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [projects, search]);

  return (
    <div className="projects-page">
      <div className="page-header">
        <div><h1>Projects</h1><p>{projects.length} projects returned by MARG.</p></div>
      </div>
      <div className="projects-toolbar">
        <input className="analytics-filter" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" />
      </div>
      {state.loading && <p>Loading projects...</p>}
      {state.error && <p role="alert">Unable to load projects: {state.error}</p>}
      {!state.loading && !state.error && filtered.length === 0 && <p>No projects match the current search.</p>}
      {!state.loading && !state.error && <div className="projects-grid">{filtered.map((project) => <ProjectCard key={project.project_id} project={project} />)}</div>}
    </div>
  );
}

export default Projects;
