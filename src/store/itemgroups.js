import { getToken } from "./utlits";

const GET_ITEMGROUPS = "itemGroups/GET_ITEMGROUPS";
const ADD_ITEMGROUP = "itemGroups/ADD_ITEMGROUP";
const DELETE_ITEMGROUP = "itemGroups/DELETE_ITEMGROUP";
const EDIT_ITEMGROUP = "itemGroups/EDIT_ITEMGROUP";

// Action creators
const getItemGroups = (itemGroups) => ({
  type: GET_ITEMGROUPS,
  itemGroups,
});

const addItemGroup = (itemGroup) => ({
  type: ADD_ITEMGROUP,
  itemGroup,
});

const deleteItemGroup = (itemGroupId) => ({
  type: DELETE_ITEMGROUP,
  itemGroupId,
});

const editItemGroup = (itemGroup) => ({
  type: EDIT_ITEMGROUP,
  itemGroup,
});

// Thunks

export const getItemGroupsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/item-groups`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });
  const itemGroups = await res.json();
  dispatch(getItemGroups(itemGroups));
  return itemGroups;
};

export const addItemGroupThunk = (itemGroup) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const formData = new FormData();
  formData.append("name", itemGroup.name);
  formData.append("itemIds", JSON.stringify(itemGroup.itemIds)); // send array as string
  if (itemGroup.index !== undefined && itemGroup.index !== null && itemGroup.index !== "") {
    formData.append("index", String(itemGroup.index));
  }
  if (itemGroup.image) {
    formData.append("image", itemGroup.image); // file object
  }

  const res = await fetch(`/api/item-groups`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`, // DON'T set Content-Type here, browser sets it with correct boundary
    },
  });

  const newItemGroup = await res.json();
  dispatch(addItemGroup(newItemGroup));
};

export const editItemGroupThunk = (id, formData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/item-groups/${id}`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`, // Don't set Content-Type here!
      credentials: "include",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update item group");
  }

  const editedItemGroup = await res.json();
  dispatch(editItemGroup(editedItemGroup));
  dispatch(getItemGroups());
};

export const deleteItemGroupThunk = (itemGroupId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/item-groups/${itemGroupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Failed to delete item group");
  }

  dispatch(deleteItemGroup(itemGroupId));
  dispatch(getItemGroupsThunk());
};

// Initial state
const initialState = { itemGroups: [] };

// Reducer
const itemGroupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ITEMGROUPS:
      return { ...state, itemGroups: action.itemGroups };
    case ADD_ITEMGROUP:
      return { ...state, itemGroups: [...state.itemGroups, action.itemGroup] };
    case DELETE_ITEMGROUP:
      return {
        ...state,
        itemGroups: state.itemGroups.filter(
          (itemGroup) => itemGroup.id !== action.itemGroupId,
        ),
      };
    case EDIT_ITEMGROUP:
      return {
        ...state,
        itemGroups: state.itemGroups.map((itemGroup) =>
          itemGroup.id === action.itemGroup.id ? action.itemGroup : itemGroup,
        ),
      };
    default:
      return state;
  }
};

export default itemGroupsReducer;
