export const API_BASE =
"https://us-central1-phoneloginapp-7e9e0.cloudfunctions.net/supportApi/api";

export const gMapApi = "AIzaSyCtGObOL3eg_jJclP4i8wdqRrtkkfiLwBA"

// UNIVERSAL REQUEST FUNCTION
export async function apiRequest(path, options = {}) {

  const res = await fetch(`${API_BASE}${path}`, {

    method: options.method || "GET",

    headers: {
      "Content-Type": "application/json",
    },

    body: options.body
      ? JSON.stringify(options.body)
      : undefined,

  });

  if (!res.ok) {

    const text = await res.text();
    throw new Error(text);

  }

  return res.json();
}

// Helpers
export const apiGet = (path) =>
  apiRequest(path);

export const apiPost = (path, body) =>
  apiRequest(path, { method:"POST", body });

export const apiPatch = (path, body) =>
  apiRequest(path, { method:"PATCH", body });

export const apiDelete = (path) =>
  apiRequest(path, { method:"DELETE" });

