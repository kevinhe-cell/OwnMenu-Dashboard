import { getToken } from "./utlits";

const GET_FREEITEMS = "freeitems/GET_FREEITEMS";
const CREATE_REDEEMABLE = "freeitems/CREATE_REDEEMABLE";
const UPDATE_REDEEMABLE = "freeitems/UPDATE_REDEEMABLE";
const DELETE_REDEEMABLE = "freeitems/DELETE_REDEEMABLE";
const ADD_FREEITEM = "freeitems/ADD_FREEITEM";
const DELETE_FREEITEM = "freeitems/DELETE_FREEITEM";

const getFreeItems = (freeitems) => ({
  type: GET_FREEITEMS,
  freeitems,
});

const addFreeItem = (freeitem) => ({
  type: ADD_FREEITEM,
  freeitem,
});

const deleteFreeItem = (freeitemId) => ({
  type: DELETE_FREEITEM,
  freeitemId,
});

const createRedeemable = (redeemable) => ({
  type: CREATE_REDEEMABLE,
  redeemable,
});

const updateRedeemable = (redeemable) => ({
  type: UPDATE_REDEEMABLE,
  redeemable,
});

const deleteRedeemable = (redeemableId) => ({
  type: DELETE_REDEEMABLE,
  redeemableId,
});

export const getFreeItemsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/freeitems/admin`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const freeitems = await response.json();
    dispatch(getFreeItems(freeitems));
  }
};

export const createRedeemableThunk =
  (name, need_amount) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`/api/freeitems/admin/reedemable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, need_amount }),
    });

    if (response.ok) {
      const redeemable = await response.json();
      dispatch(createRedeemable(redeemable));
      dispatch(getFreeItemsThunk())
    }
  };

export const updateRedeemableThunk =
  (redeemableId, name, need_amount) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/freeitems/admin/reedemable/${redeemableId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, need_amount }),
      },
    );

    if (response.ok) {
      const redeemable = await response.json();
      dispatch(updateRedeemable(redeemable));
    }
  };

export const deleteRedeemableThunk = (redeemableId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(
    `/api/freeitems/admin/reedemable/${redeemableId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.ok) {
    dispatch(deleteRedeemable(redeemableId));
  }
};

export const addFreeItemThunk = (id, item_id, quantity) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/freeitems/admin/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ item_id, quantity }),
  });

  if (response.ok) {
    const freeitem = await response.json();
    dispatch(addFreeItem(freeitem));
  }
};

export const deleteFreeItemThunk = (freeitemId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/freeitems/admin/${freeitemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    dispatch(deleteFreeItem(freeitemId));
  }
};

const initialState = { freeitems: [] };

const freeitemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FREEITEMS:
      return {
        ...state,
        freeitems: action.freeitems,
      };
    case CREATE_REDEEMABLE:
      return {
        ...state,
        freeitems: [...state.freeitems, action.redeemable],
      };
    case UPDATE_REDEEMABLE:
      return {
        ...state,
        freeitems: state.freeitems.map((redeemable) => {
          if (redeemable.id === action.redeemable.id) {
            return action.redeemable;
          }
          return redeemable;
        }),
      };
    case DELETE_REDEEMABLE:
      return {
        ...state,
        freeitems: state.freeitems.filter(
          (redeemable) => redeemable.id !== action.redeemableId,
        ),
      };
    case ADD_FREEITEM:
      return {
        ...state,
        freeitems: state.freeitems.map((freeitem) => {
          freeitem.ReedemableItems = [
            ...freeitem.ReedemableItems,
            action.freeitem,
          ];
          return freeitem;
        }),
      };
    case DELETE_FREEITEM:
      return {
        ...state,
        freeitems: state.freeitems.map((freeitem) => {
          freeitem.ReedemableItems = freeitem.ReedemableItems.filter(
            (freeitem) => freeitem.id !== action.freeitemId,
          );
          return freeitem;
        }),
      };
    default:
      return state;
  }
};

export default freeitemsReducer;
