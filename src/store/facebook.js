import { getToken } from "./utlits";

const GET_FACEBOOK = "facebook/GET_FACEBOOK";
const GET_FACEBOOK_DRAFTS = "facebook/GET_FACEBOOK_DRAFTS";
const DELETE_DRAFT = "facebook/DELETE_DRAFT";

const getFacebook = (account) => ({ type: GET_FACEBOOK, account });
const getFacebookDrafts = (drafts) => ({ type: GET_FACEBOOK_DRAFTS, drafts });
const deleteDraft = (id) => ({ type: DELETE_DRAFT, id });

export const getFacebookThunk = () => async (dispatch) => {
  const token = getToken();
  try {
    const res = await fetch(`/api/facebook-account`, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Not connected");
    const data = await res.json();
    dispatch(getFacebook(data));
  } catch (err) {
    console.error("Failed to fetch Facebook account:", err);
    dispatch(getFacebook(null));
  }
};

export const getFacebookDraftsThunk = () => async (dispatch) => {
  const token = getToken();
  try {
    const res = await fetch(`/api/facebook-account/drafts`, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch drafts");
    const data = await res.json();
    dispatch(getFacebookDrafts(data));
  } catch (err) {
    console.error("Failed to fetch Facebook drafts:", err);
    dispatch(getFacebookDrafts([]));
  }
};

export const deleteFacebookDraftThunk = (id) => async (dispatch) => {
  const token = getToken();
  const res = await fetch(`/api/facebook-account/drafts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete draft");
  dispatch(deleteDraft(id));
};

const initialState = { account: null, drafts: [] };

export default function facebookReducer(state = initialState, action) {
  switch (action.type) {
    case GET_FACEBOOK:
      return { ...state, account: action.account };
    case GET_FACEBOOK_DRAFTS:
      return { ...state, drafts: action.drafts };
    case DELETE_DRAFT:
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.id),
      };
    default:
      return state;
  }
}
