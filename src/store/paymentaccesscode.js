import { getToken } from "./utlits";

const SET_VERIFIED = "passcode/SET_VERIFIED";
const SET_PASSCODE = "passcode/SET_PASSCODE";
const CLEAR_PASSCODE = "passcode/CLEAR_PASSCODE";

// Action Creators
export const setVerified = () => ({
  type: SET_VERIFIED,
});

export const setPasscode = (passcode) => ({
  type: SET_PASSCODE,
  passcode,
});

export const clearPasscode = () => ({
  type: CLEAR_PASSCODE,
});

// Thunks
export const checkPasscodeThunk =
  (restaurantId, passcode) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`/api/payment-access/check-passcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ restaurantId, passcode }),
    });

    if (res.ok) {
      dispatch(setPasscode(passcode));
      dispatch(setVerified());
      return true;
    }

    return false;
  };

export const sendVerificationThunk = (restaurantId, phone) => async () => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/payment-access/send-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone, restaurantId }),
  });

  return res.ok;
};

export const verifyCodeThunk = (restaurantId, phone, code) => async () => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/payment-access/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone, code, restaurantId }),
  });

  return res.ok;
};

export const setNewPasscodeThunk =
  (restaurantId, passcode) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`/api/payment-access/set-passcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ restaurantId, passcode }),
    });

    if (res.ok) {
      dispatch(setPasscode(passcode));
      dispatch(setVerified());
      return true;
    }

    return false;
  };
const initialState = {
  verified: false,
  passcode: null,
};

export default function passcodeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_VERIFIED:
      return { ...state, verified: true };
    case SET_PASSCODE:
      return { ...state, passcode: action.passcode };
    case CLEAR_PASSCODE:
      return initialState;
    default:
      return state;
  }
}
