import { getToken } from "./utlits";

export const previewMenuImport = async (sourceRestaurantId) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/menu-import/preview/${sourceRestaurantId}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to look up restaurant");
  }
  return data;
};

export const runMenuImport = async (sourceRestaurantId, password) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/menu-import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sourceRestaurantId, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to import menu");
  }
  return data;
};
