import { getToken } from "./utlits";

// Action types
const GET_SPECIAL_HOURS = "specialHours/GET_SPECIAL_HOURS";
const ADD_SPECIAL_HOUR = "specialHours/ADD_SPECIAL_HOUR";
const EDIT_SPECIAL_HOUR = "specialHours/EDIT_SPECIAL_HOUR";
const DELETE_SPECIAL_HOUR = "specialHours/DELETE_SPECIAL_HOUR";

// Action creators
const getSpecialHours = (specialHours) => ({
  type: GET_SPECIAL_HOURS,
  specialHours,
});

const addSpecialHour = (specialHour) => ({
  type: ADD_SPECIAL_HOUR,
  specialHour,
});

const editSpecialHour = (specialHour) => ({
  type: EDIT_SPECIAL_HOUR,
  specialHour,
});

const deleteSpecialHour = (id) => ({
  type: DELETE_SPECIAL_HOUR,
  id,
});

//
// ─── THUNKS ─────────────────────────────────────────────
//

// 🧾 Get all special hours for the logged-in restaurant
export const getSpecialHoursThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/special-hours`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (res.ok) {
    dispatch(getSpecialHours(data));
    return data;
  }
  throw new Error(data.error || data.message || "Failed to fetch special hours.");
};

// ➕ Create new special hour template
export const addSpecialHourThunk = (specialHour) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/special-hours`, {
    method: "POST",
    body: JSON.stringify(specialHour),
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (res.ok) {
    dispatch(getSpecialHoursThunk());
    return data;
  }
  throw new Error(data.error || data.message || "Failed to add special hour.");
};

// ✏️ Edit a special hour template
export const editSpecialHourThunk = (specialHour) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/special-hours/${specialHour.id}`, {
    method: "PUT",
    body: JSON.stringify(specialHour),
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (res.ok) {
    dispatch(editSpecialHour(data));
    dispatch(getSpecialHoursThunk());
    return data;
  }
  throw new Error(data.error || data.message || "Failed to edit special hour.");
};

// 🗑 Delete a special hour template
export const deleteSpecialHourThunk = (id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/special-hours/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || data.message || "Failed to delete special hour.");
  }

  dispatch(deleteSpecialHour(id));
  dispatch(getSpecialHoursThunk());
  return data;
};

//
// ─── REDUCER ────────────────────────────────────────────
//
const initialState = { specialHours: [] };

const specialHoursReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPECIAL_HOURS:
      return { ...state, specialHours: action.specialHours };
    case ADD_SPECIAL_HOUR:
      return {
        ...state,
        specialHours: [...state.specialHours, action.specialHour],
      };
    case EDIT_SPECIAL_HOUR:
      return {
        ...state,
        specialHours: state.specialHours.map((h) =>
          h.id === action.specialHour.id ? action.specialHour : h
        ),
      };
    case DELETE_SPECIAL_HOUR:
      return {
        ...state,
        specialHours: state.specialHours.filter((h) => h.id !== action.id),
      };
    default:
      return state;
  }
};

export default specialHoursReducer;
