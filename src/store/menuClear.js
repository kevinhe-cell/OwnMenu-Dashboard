import { getToken } from "./utlits";

export const previewMenuClear = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/menu-clear/preview`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to load menu summary");
  }
  return data;
};

export const runMenuClear = async (password) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/menu-clear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password, confirm: true }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete menu");
  }
  return data;
};
