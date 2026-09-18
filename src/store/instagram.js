import { getToken } from "./utlits";

// ACTION TYPES
const GET_INSTAGRAM = "instagram/GET_INSTAGRAM";
const GET_INSTAGRAM_DRAFTS = "instagram/GET_INSTAGRAM_DRAFTS";
const CREATE_DRAFT = "instagram/CREATE_DRAFT";
const DELETE_DRAFT = "instagram/DELETE_DRAFT"; // ✅ NEW

// ACTION CREATORS
const getInstagram = (account) => ({
  type: GET_INSTAGRAM,
  account,
});

const getInstagramDrafts = (drafts) => ({
  type: GET_INSTAGRAM_DRAFTS,
  drafts,
});

const createDraft = (draft) => ({
  type: CREATE_DRAFT,
  draft,
});

const deleteDraft = (id) => ({
  // ✅ NEW
  type: DELETE_DRAFT,
  id,
});

// THUNKS

export const getInstagramThunk = () => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch(`/api/instagram-account`, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Not connected");

    const data = await res.json();
    dispatch(getInstagram(data));
  } catch (err) {
    console.error("Failed to fetch Instagram account:", err);
    dispatch(getInstagram(null));
  }
};

export const getInstagramDraftsThunk = () => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch(`/api/instagram-account/drafts`, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch drafts");

    const data = await res.json();
    dispatch(getInstagramDrafts(data));
  } catch (err) {
    console.error("Failed to fetch Instagram drafts:", err);
    dispatch(getInstagramDrafts([]));
  }
};

export const createDraftThunk = (draftData) => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch("/api/instagram-account/drafts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draftData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create draft");
    }

    const draft = await res.json();
    dispatch(createDraft(draft));
    return draft;
  } catch (error) {
    console.error("Failed to create draft:", error);
    throw error;
  }
};

// ✅ NEW DELETE THUNK
export const deleteDraftThunk = (id) => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch(`/api/instagram-account/drafts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete draft");

    dispatch(deleteDraft(id));
  } catch (err) {
    console.error("Failed to delete draft:", err);
    throw err;
  }
};

// REDUCER
const initialState = { account: null, drafts: [] };

export default function instagramReducer(state = initialState, action) {
  switch (action.type) {
    case GET_INSTAGRAM:
      return { ...state, account: action.account };
    case GET_INSTAGRAM_DRAFTS:
      return { ...state, drafts: action.drafts };
    case CREATE_DRAFT:
      return { ...state, drafts: [...state.drafts, action.draft] };
    case DELETE_DRAFT: // ✅ REDUCER CASE
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.id),
      };
    default:
      return state;
  }
}
