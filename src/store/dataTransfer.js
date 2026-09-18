import { getToken } from "./utlits";

export const previewDataTransfer = async (sourceRestaurantId) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/data-transfer/preview/${sourceRestaurantId}`, {
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

export const runDataTransfer = async (sourceRestaurantId, password) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/data-transfer`, {
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
    throw new Error(data.message || "Failed to transfer restaurant data");
  }
  return data;
};

export const runCustomerTransfer = async (
  sourceRestaurantId,
  password,
  { transferPoints = true } = {},
) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/data-transfer/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sourceRestaurantId,
      password,
      transferPoints,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to transfer customers");
  }
  return data;
};
