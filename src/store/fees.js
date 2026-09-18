import { getToken } from "./utlits";

const GET_FEES = "fees/GET_FEES";
const CREATE_FEE = "fees/CREATE_FEE";
const UPDATE_FEE = "fees/UPDATE_FEE";
const UPDATE_DELIVERY_FEE = "fees/UPDATE_DELIVERY_FEE";

const apiUrl = "https://hutaoadmin.onrender.com";
const getFees = (fees) => ({
  type: GET_FEES,
  fees,
});

const createFee = (fee) => ({
  type: CREATE_FEE,
  fee,
});

const updateFee = (fee) => ({
  type: UPDATE_FEE,
  fee,
});

const updateDeliveryFee = (fee) => ({
  type: UPDATE_DELIVERY_FEE,
  fee,
});

export const getFeesThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/fees`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    const fees = await res.json();
    dispatch(getFees(fees));
  }
};

export const createFeeThunk =
  (commission_fee, tax_percentage, delivery_fee, service_fee, processing_fee) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`/api/fees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        commission_fee,
        tax_percentage,
        delivery_fee,
        service_fee,
        processing_fee,
      }),
    });

    if (res.ok) {
      const fee = await res.json();
      dispatch(createFee(fee));
    }
  };

export const updateFeeThunk = (feeId, feeData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/fees/${feeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(feeData),
  });

  if (res.ok) {
    const updatedFee = await res.json();
    dispatch(updateFee(updatedFee));
  }
};

export const updateDeliveryFeeThunk = (feeId, feeData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/fees/${feeId}/custom_delivery_fee`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(feeData),
  });

  if (res.ok) {
    const updateFee = await res.json();
    dispatch(updateDeliveryFee(updateFee));
  }
};

const putAutoDeliverySettings = async (body) => {
  const token = getToken();
  const res = await fetch(`/api/fees/auto-delivery-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      credentials: "include",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update auto-delivery settings");
  }
  return data;
};

export const updateAutoDeliveryEnabledThunk =
  (enabled) => async (dispatch) => {
    const fee = await putAutoDeliverySettings({
      auto_delivery_switch_enabled: !!enabled,
    });
    dispatch(updateFee(fee));
    return fee;
  };

export const updateDeliveryTimezoneThunk =
  (timezone) => async (dispatch) => {
    const fee = await putAutoDeliverySettings({
      delivery_time_zone: timezone || null,
    });
    dispatch(updateFee(fee));
    return fee;
  };

export const updateAutoDeliveryFeesThunk =
  ({ doordashDeliveryFee, doordashServiceFee }) =>
  async (dispatch) => {
    const body = {};
    if (doordashDeliveryFee !== undefined)
      body.auto_delivery_doordash_delivery_fee = doordashDeliveryFee;
    if (doordashServiceFee !== undefined)
      body.auto_delivery_doordash_service_fee = doordashServiceFee;
    const fee = await putAutoDeliverySettings(body);
    dispatch(updateFee(fee));
    return fee;
  };

export const updateDeliveryScheduleDayThunk =
  (day, start, end) => async (dispatch) => {
    const token = getToken();
    const res = await fetch(`/api/fees/delivery-schedule/${day}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        credentials: "include",
      },
      body: JSON.stringify({ start: start || "", end: end || "" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Failed to save delivery schedule");
    }
    dispatch(updateFee(data));
    return data;
  };

export const replaceDeliveryScheduleThunk =
  (schedule) => async (dispatch) => {
    const fee = await putAutoDeliverySettings({
      auto_delivery_schedule: schedule,
    });
    dispatch(updateFee(fee));
    return fee;
  };

const initialState = { fees: {} };

const feesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FEES:
      return { ...state, fees: action.fees };
    case CREATE_FEE:
      return {
        ...state,
        fees: action.fee,
      };
    case UPDATE_FEE:
      return { ...state, fees: action.fee };
    case UPDATE_DELIVERY_FEE:
      return {
        ...state,
        fees: action.fee,
      };
    default:
      return state;
  }
};

export default feesReducer;
