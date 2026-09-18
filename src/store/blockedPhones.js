import { getToken } from "./utlits";

const SET_BLOCKED_PHONES = "blockedPhones/SET";
const ADD_BLOCKED_PHONE = "blockedPhones/ADD";
const REMOVE_BLOCKED_PHONE = "blockedPhones/REMOVE";

const setBlockedPhones = (items) => ({ type: SET_BLOCKED_PHONES, items });
const addBlockedPhone = (item) => ({ type: ADD_BLOCKED_PHONE, item });
const removeBlockedPhone = (id, phone) => ({
  type: REMOVE_BLOCKED_PHONE,
  id,
  phone,
});

const sanitizePhone = (raw) => String(raw || "").replace(/\D/g, "");

export const fetchBlockedPhonesThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/blocked-phones`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const items = await res.json();
    dispatch(setBlockedPhones(Array.isArray(items) ? items : []));
    return items;
  }
  return null;
};

export const blockPhoneThunk =
  (phone, reason = "") =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const cleanPhone = sanitizePhone(phone);
    if (cleanPhone.length !== 10) {
      throw new Error("Phone must be a 10-digit number");
    }

    const res = await fetch(`/api/blocked-phones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: cleanPhone, reason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to block phone");
    }

    const item = await res.json();
    dispatch(addBlockedPhone(item));
    return item;
  };

export const unblockPhoneThunk =
  ({ id, phone }) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    let url;
    if (id) {
      url = `/api/blocked-phones/${id}`;
    } else if (phone) {
      url = `/api/blocked-phones/by-phone/${sanitizePhone(phone)}`;
    } else {
      throw new Error("Missing id or phone");
    }

    const res = await fetch(url, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to unblock phone");
    }

    dispatch(removeBlockedPhone(id, phone ? sanitizePhone(phone) : null));
    return true;
  };

const initialState = {
  items: [],
};

export default function blockedPhonesReducer(state = initialState, action) {
  switch (action.type) {
    case SET_BLOCKED_PHONES:
      return { ...state, items: action.items || [] };
    case ADD_BLOCKED_PHONE: {
      const without = state.items.filter(
        (p) => p.phone !== action.item.phone || p.id === action.item.id
      );
      const exists = without.some((p) => p.id === action.item.id);
      return {
        ...state,
        items: exists
          ? without.map((p) => (p.id === action.item.id ? action.item : p))
          : [action.item, ...without],
      };
    }
    case REMOVE_BLOCKED_PHONE:
      return {
        ...state,
        items: state.items.filter((p) => {
          if (action.id != null && p.id === action.id) return false;
          if (action.phone && p.phone === action.phone) return false;
          return true;
        }),
      };
    default:
      return state;
  }
}
