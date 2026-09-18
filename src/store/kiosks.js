import { getToken } from "./utlits";

const GET_KIOSKS = "kiosks/GET_KIOSKS";
const SET_LOADING = "kiosks/SET_LOADING";
const SET_FEES = "kiosks/SET_FEES";

const getKiosks = (devices) => ({
  type: GET_KIOSKS,
  devices,
});

const setLoading = (loading) => ({
  type: SET_LOADING,
  loading,
});

const authHeaders = () => ({
  "Content-Type": "application/json",
  credentials: "include",
  authorization: `Bearer ${getToken()}`,
});

export const getKiosksThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  dispatch(setLoading(true));
  try {
    const response = await fetch("/api/kiosk/devices", {
      headers: authHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      dispatch(setLoading(false));
      return { error: data.message || "Failed to load kiosks" };
    }
    dispatch(getKiosks(data.devices || []));
    return { ok: true };
  } catch (err) {
    dispatch(setLoading(false));
    return { error: err.message || "Failed to load kiosks" };
  }
};

export const createKioskThunk = ({ deviceName, orientation }) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch("/api/kiosk/devices", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      deviceName,
      orientation: orientation || "portrait",
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to create kiosk" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true, device: data, pairingCode: data.pairingCode };
};

export const regenerateKioskCodeThunk = (deviceId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch(`/api/kiosk/devices/${deviceId}/regenerate-code`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to regenerate code" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true, device: data, pairingCode: data.pairingCode };
};

export const refreshKioskThunk = (deviceId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch(`/api/kiosk/devices/${deviceId}/refresh`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to refresh kiosk" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true, device: data };
};

export const goHomeKioskThunk = (deviceId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch(`/api/kiosk/devices/${deviceId}/go-home`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to release kiosk to home" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true, device: data };
};

export const requestKioskAppDiagThunk =
  (deviceId, action = "check") =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`/api/kiosk/devices/${deviceId}/app-diag`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        action: action === "disable_verifier" ? "disable_verifier" : "check",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.message || "Failed to request app diagnostic" };
    }
    await dispatch(getKiosksThunk());
    return { ok: true, device: data };
  };

export const logoutKioskThunk = (deviceId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch(`/api/kiosk/devices/${deviceId}/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to logout kiosk" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true, device: data, pairingCode: data.pairingCode };
};

export const updateKioskOrientationThunk =
  (deviceId, orientation) => async (dispatch) => {
    const token = getToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`/api/kiosk/devices/${deviceId}/orientation`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ orientation }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.message || "Failed to update orientation" };
    }
    await dispatch(getKiosksThunk());
    return { ok: true, device: data };
  };

export const updateKioskActiveThunk =
  (deviceId, isActive) => async (dispatch) => {
    const token = getToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`/api/kiosk/devices/${deviceId}/active`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isActive: !!isActive }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.message || "Failed to update device status" };
    }
    await dispatch(getKiosksThunk());
    return { ok: true, device: data };
  };

export const updateKioskSettingsThunk =
  (deviceId, settingsPatch) => async (dispatch) => {
    const token = getToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`/api/kiosk/devices/${deviceId}/settings`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(settingsPatch || {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.message || "Failed to update settings" };
    }
    await dispatch(getKiosksThunk());
    return { ok: true, device: data };
  };

export const uploadKioskAttractImageThunk =
  (deviceId, file, orientation) => async (dispatch) => {
    const token = getToken();
    if (!token) return { error: "Not authenticated" };
    if (!file) return { error: "No image selected" };

    const form = new FormData();
    form.append("image", file);
    form.append("orientation", orientation === "landscape" ? "landscape" : "portrait");

    const response = await fetch(`/api/kiosk/devices/${deviceId}/attract-image`, {
      method: "POST",
      headers: {
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.message || "Failed to upload image" };
    }
    await dispatch(getKiosksThunk());
    return { ok: true, device: data };
  };

export const deleteKioskThunk = (deviceId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch(`/api/kiosk/devices/${deviceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to delete kiosk" };
  }
  await dispatch(getKiosksThunk());
  return { ok: true };
};

export const getKioskFeesThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch("/api/kiosk/fees", {
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to load kiosk fees" };
  }
  dispatch({
    type: SET_FEES,
    fees: {
      tax: Number(data.tax) || 0,
      processing_fee: Number(data.processing_fee) || 0,
    },
  });
  return { ok: true, fees: data };
};

export const updateKioskFeesThunk = ({ tax, processing_fee }) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Not authenticated" };

  const response = await fetch("/api/kiosk/fees", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ tax, processing_fee }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "Failed to save kiosk fees" };
  }
  dispatch({
    type: SET_FEES,
    fees: {
      tax: Number(data.tax) || 0,
      processing_fee: Number(data.processing_fee) || 0,
    },
  });
  return { ok: true, fees: data };
};

const initialState = {
  devices: [],
  loading: false,
  fees: null,
};

export default function kiosksReducer(state = initialState, action) {
  switch (action.type) {
    case GET_KIOSKS:
      return { ...state, devices: action.devices, loading: false };
    case SET_LOADING:
      return { ...state, loading: action.loading };
    case SET_FEES:
      return { ...state, fees: action.fees };
    default:
      return state;
  }
}
