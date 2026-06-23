const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  return res;
}