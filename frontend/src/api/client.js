const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}`);
  }
  return payload;
}

export const api = {
  getProjects: (limit = 100, skip = 0) => request(`/projects?limit=${limit}&skip=${skip}`),
  getProject: (projectId) => request(`/projects/${encodeURIComponent(projectId)}`),
  getSnapshots: (projectId, limit = 100, skip = 0) =>
    request(`/projects/${encodeURIComponent(projectId)}/snapshots?limit=${limit}&skip=${skip}`),
  getPrediction: (projectId) => request(`/predictions/${encodeURIComponent(projectId)}`),
  getExplanation: (projectId) => request(`/predictions/${encodeURIComponent(projectId)}/explanations`),
  getAlerts: (projectId) => request(`/alerts/${encodeURIComponent(projectId)}`),
  getDashboardSummary: () => request("/dashboard/summary"),
  getAnalyticsSummary: () => request("/analytics/summary"),
};

export { API_BASE_URL };