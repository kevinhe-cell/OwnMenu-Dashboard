import { getToken } from "./utlits";

const SET_DOMAIN = "domain/SET_DOMAIN";
const REMOVE_DOMAIN = "domain/REMOVE_DOMAIN";

const setDomain = (domain) => ({ type: SET_DOMAIN, domain });
const removeDomain = () => ({ type: REMOVE_DOMAIN });

// GET current domain
export const getDomainThunk = () => async (dispatch) => {
  const token = getToken();
  const res = await fetch(`/api/domains`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  dispatch(setDomain(data));
};

// ADD or REPLACE current domain
export const addOrReplaceDomainThunk = (domainData) => async (dispatch) => {
  const token = getToken();
  try {
    const res = await fetch(`/api/domains`, {
      method: "POST",
      body: JSON.stringify(domainData),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save domain");

    dispatch(setDomain(data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE current domain
export const deleteDomainThunk = (id) => async (dispatch) => {
  const token = getToken();
  await fetch(`/api/domains/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  dispatch(removeDomain());
};

/** Manual connect: mark domain verified in DB without adding it to Vercel. */
export const manualConnectDomainThunk = (payload) => async (dispatch) => {
  const token = getToken();
  try {
    const res = await fetch(`/api/domains/manual-connect`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to manually connect domain");
    if (data.domain) dispatch(setDomain(data.domain));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const initialState = { domain: null };

const domainReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DOMAIN:
      return { ...state, domain: action.domain };
    case REMOVE_DOMAIN:
      return { ...state, domain: null };
    default:
      return state;
  }
};

export default domainReducer;
