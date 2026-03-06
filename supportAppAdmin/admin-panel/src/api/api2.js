export const API_BASE = "https://inspectionapi-b3okypgrgq-uc.a.run.app"

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}