import { UserProfile, UserStats } from "../types";

const API_BASE = "/api";

export const getToken = () => localStorage.getItem("lingoquest_jwt");
export const setToken = (token: string) => localStorage.setItem("lingoquest_jwt", token);
export const removeToken = () => localStorage.removeItem("lingoquest_jwt");

const getHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const registerUser = async (data: any) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Registration failed");
  const result = await res.json();
  setToken(result.token);
  return result;
};

export const loginUser = async (data: any) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Login failed");
  const result = await res.json();
  setToken(result.token);
  return result;
};

export const syncUserProfile = async (profile: UserProfile, stats: UserStats) => {
  try {
    const res = await fetch(`${API_BASE}/users/sync`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ profile, stats }),
    });
    if (res.status === 401 || res.status === 403) {
       // Token expired or invalid
       removeToken();
       throw new Error("Session expired");
    }
    if (!res.ok) throw new Error("Failed to sync");
    return await res.json();
  } catch (err) {
    console.error("Error syncing profile to backend", err);
    throw err;
  }
};

export const fetchAdminUsers = async () => {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
};

export const toggleBanUser = async (id: string) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-ban`, { 
    method: "POST", 
    headers: getHeaders() 
  });
  if (!res.ok) throw new Error("Failed to toggle ban");
  return await res.json();
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, { 
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return await res.json();
};
