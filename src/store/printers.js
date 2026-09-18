import { getToken } from "./utlits";

const GET_PRINTERS = "printers/GET_PRINTERS";
const ADD_CATEGORY = "printers/ADD_CATEGORY";
const DELETE_CATEGORY = "printers/DELETE_CATEGORY";
const ADD_ITEM_PRINTERS = "printers/ADD_ITEM_PRINTERS";
const DELETE_ITEM_PRINTERS = "printers/DELETE_ITEM_PRINTERS";

const getPrinters = (printers) => ({
  type: GET_PRINTERS,
  printers,
});

export const addCategory = (category) => ({
  type: ADD_CATEGORY,
  category,
});

export const deleteCategory = (category_id) => ({
  type: DELETE_CATEGORY,
  category_id,
});

export const addItemPrinters = (item) => ({
  type: ADD_ITEM_PRINTERS,
  item,
});

export const deleteItemPrinters = (item_id) => ({
  type: DELETE_ITEM_PRINTERS,
  item_id,
});

export const getPrintersThunk = (restaurant_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/printers/${restaurant_id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(getPrinters(data.printers));
    return response;
  }
};

export const addCategoryThunk =
  (printer_id, category_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/printers/category/${printer_id}/${category_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(addCategory(data.category));
      return response;
    }
  };

export const deleteCategoryThunk =
  (printer_id, category_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/printers/category/${printer_id}/${category_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(deleteCategory(data.category_id));
      return response;
    }
  };

export const addItemPrintersThunk =
  (printer_id, item_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/printers/item/${printer_id}/${item_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(addItemPrinters(data.item));
      return response;
    }
  };

export const deleteItemPrintersThunk =
  (printer_id, item_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/printers/item/${printer_id}/${item_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(deleteItemPrinters(data.item_id));
      return response;
    }
  };

const intialState = { printers: [] };

const printersReducer = (state = intialState, action) => {
  switch (action.type) {
    case GET_PRINTERS:
      return {
        ...state,
        printers: action.printers,
      };
    case ADD_CATEGORY:
      return {
        ...state,
      };
    case DELETE_CATEGORY:
      return {
        ...state,
      };
    case ADD_ITEM_PRINTERS:
      return {
        ...state,
      };
    case DELETE_ITEM_PRINTERS:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default printersReducer;
