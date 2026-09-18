import { getToken } from "./utlits";

const GET_SPECIAL_ITEMS = "specialItems/GET_SPECIAL_ITEMS";
const CREATE_SPECIAL_ITEM = "specialItems/CREATE_SPECIAL_ITEM";
const DELETE_SPECIAL_ITEM = "specialItems/DELETE_SPECIAL_ITEM";

const getSpecialItems = (specialItems) => ({
  type: GET_SPECIAL_ITEMS,
  specialItems,
});

const createSpecialItem = (specialItem) => ({
  type: CREATE_SPECIAL_ITEM,
  specialItem,
});

const deleteSpecialItem = (specialItemId) => ({
  type: DELETE_SPECIAL_ITEM,
  specialItemId,
});

export const getSpecialItemsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/specialitems/admin`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const specialItems = await response.json();
    dispatch(getSpecialItems(specialItems));
  }
};

export const createSpecialItemThunk = (payload) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/specialitems/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      item_id: payload.item_id,
      discount_percent: payload.discount_percent,
    }),
  });

  if (response.ok) {
    const newSpecialItem = await response.json();
    dispatch(createSpecialItem(newSpecialItem));
  }
};

export const deleteSpecialItemThunk = (specialItemId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/specialitems/${specialItemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    dispatch(deleteSpecialItem(specialItemId));
  }
};

const initialState = { specialItems: [] };

const specialItemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPECIAL_ITEMS:
      return { ...state, specialItems: action.specialItems };
    case CREATE_SPECIAL_ITEM:
      return { ...state, specialItems: [...(state.specialItems || []), action.specialItem] };
    case DELETE_SPECIAL_ITEM:
      return {
        ...state,
        specialItems: (state.specialItems || []).filter(
          (s) => s.id !== action.specialItemId,
        ),
      };
    default:
      return state;
  }
};

export default specialItemsReducer;
