import { getToken } from "./utlits";
import { getAllAttributesThunk } from "./attributes";

const GET_ITEMS = "items/GET_ITEMS";
const ADD_ITEM = "items/ADD_ITEM";
const DELETE_ITEM = "items/DELETE_ITEM";
const EDIT_ITEM = "items/EDIT_ITEM";
const CREATE_ITEM_ATTRIBUTE = "items/CREATE_ITEM_ATTRIBUTE";
const DELETE_ITEM_ATTRIBUTE = "items/DELETE_ITEM_ATTRIBUTE";
const UPDATE_DISABLE_ITEM = "items/UPDATE_DISABLE_ITEM";
const GET_DELETED_ITEMS = "items/GET_DELETED_ITEMS";
const RESTORE_ITEM = "items/RESTORE_ITEM";
const SET_SHOW_ADD_MODAL = "items/SET_SHOW_ADD_MODAL";
const SET_SHOW_CREATE_GROUP_MODAL = "items/SET_SHOW_CREATE_GROUP_MODAL";

const apiUrl = "https://hutaoadmin.onrender.com";

const getItems = (items) => ({
  type: GET_ITEMS,
  items,
});

const addItem = (item) => ({
  type: ADD_ITEM,
  item,
});

const deleteItem = (item) => ({
  type: DELETE_ITEM,
  item,
});

const editItem = (item) => ({
  type: EDIT_ITEM,
  item,
});

const createItemAttribute = (itemAttribute) => ({
  type: CREATE_ITEM_ATTRIBUTE,
  itemAttribute,
});

const deleteItemAttribute = (payload) => ({
  type: DELETE_ITEM_ATTRIBUTE,
  payload,
});

export const updateDisableItem = (item) => ({
  type: UPDATE_DISABLE_ITEM,
  item,
});

export const setShowAddModal = (show) => ({
  type: SET_SHOW_ADD_MODAL,
  show,
});

export const setShowCreateGroupModal = (show) => ({
  type: SET_SHOW_CREATE_GROUP_MODAL,
  show,
});

export const getItemsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/items/?ts=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(getItems(data));
    return response;
  }
};

export const addItemThunk = (item, attribute, flag, ingredientIds) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const { image, name, description, price, category_id, chinese_name } = item;

  const formdata = new FormData();
  formdata.append("name", name);
  formdata.append("description", description);
  formdata.append("price", price);
  formdata.append("category_id", category_id);
  formdata.append("chinese_name", chinese_name);
  formdata.append("attributes", JSON.stringify(attribute));
  formdata.append("flags", JSON.stringify(flag));
  
  // ✅ Add ingredientIds
  if (ingredientIds && ingredientIds.length > 0) {
    formdata.append("ingredientIds", JSON.stringify(ingredientIds));
  }

  if (image) {
    formdata.append("image", image);
  }
  const response = await fetch(`/api/items/`, {
    method: "POST",
    body: formdata,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(addItem(data));
    await dispatch(getItemsThunk());
    return data;
  }
};

export const deleteItemThunk = (item) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/items/${item.id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    dispatch(deleteItem(item));
    await dispatch(getItemsThunk());
    return response;
  }
};

export const bulkDeleteItemsThunk = (ids) => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not authenticated" };

  const response = await fetch(`/api/items/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    await dispatch(getItemsThunk());
    await dispatch(getDeletedItemsThunk());
    return { ok: true, deletedCount: data.deletedCount };
  }
  return { ok: false, message: data.message || "Bulk delete failed" };
};

export const bulkUpdatePriceThunk = (ids, price) => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not authenticated" };

  const response = await fetch(`/api/items/bulk-price`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids, price }),
  });

  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    await dispatch(getItemsThunk());
    return { ok: true, updatedCount: data.updatedCount };
  }
  return { ok: false, message: data.message || "Bulk price update failed" };
};

export const bulkSetAttributesThunk = (ids, attributeIds, mode = "add") => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not authenticated" };

  const response = await fetch(`/api/items/bulk-attributes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids, attributeIds, mode }),
  });

  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    await dispatch(getItemsThunk());
    return {
      ok: true,
      itemCount: data.itemCount,
      createdCount: data.createdCount,
      removedCount: data.removedCount,
    };
  }
  return { ok: false, message: data.message || "Bulk modifier update failed" };
};

export const bulkUpdateItemsThunk = (ids, updates) => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not authenticated" };

  const response = await fetch(`/api/items/bulk-update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids, updates }),
  });

  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    await dispatch(getItemsThunk());
    return { ok: true, updatedCount: data.updatedCount };
  }
  return { ok: false, message: data.message || "Bulk update failed" };
};

export const getDeletedItemsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(`/api/items/deleted`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    dispatch({ type: GET_DELETED_ITEMS, deletedItems: data });
    return data;
  }
};

export const restoreItemThunk = (item, categoryId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not signed in" };
  const needsCategory =
    item.category_id === null || item.category_id === undefined;
  if (
    needsCategory &&
    (categoryId === undefined ||
      categoryId === null ||
      categoryId === "" ||
      Number.isNaN(Number(categoryId)))
  ) {
    return {
      ok: false,
      message: "Choose a category before restoring this product.",
    };
  }
  const body = needsCategory
    ? { category_id: Number(categoryId) }
    : {};
  const response = await fetch(`/api/items/${item.id}/restore`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    dispatch({ type: RESTORE_ITEM, item });
    dispatch(getItemsThunk());
    dispatch(getDeletedItemsThunk());
    return { ok: true };
  }
  const err = await response.json().catch(() => ({}));
  return {
    ok: false,
    message: err.message || "Restore failed",
  };
};

export const editItemThunk = (item_id, item, flags, ingredientIds) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const {
    image,
    name,
    description,
    price,
    category_id,
    chinese_name,
    imageAction,
    index
  } = item;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description || "");
  formData.append("price", price);
  formData.append("category_id", category_id);
  formData.append("chinese_name", chinese_name || "");
  formData.append("imageAction", imageAction);
  formData.append("index", index);
  formData.append("flags", JSON.stringify(flags));
  
  // ✅ Add ingredientIds
  if (ingredientIds !== undefined) {
    formData.append("ingredientIds", JSON.stringify(ingredientIds));
  }

  if (image) {
    formData.append("image", image);
  }
  const response = await fetch(`/api/items/${item_id}`, {
    method: "PUT",
    body: formData,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(editItem(data));
    await dispatch(getItemsThunk());
    return response;
  }
};

export const uploadSecondaryImageThunk = (item_id, slot, file) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`/api/items/${item_id}/secondary-image/${slot}`, {
    method: "PUT",
    body: formData,
    headers: { authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    dispatch(editItem(data));
    dispatch(getItemsThunk());
    return { ok: true, item: data };
  }
  return { ok: false };
};

export const deleteSecondaryImageThunk = (item_id, slot) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(`/api/items/${item_id}/secondary-image/${slot}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    dispatch(editItem(data));
    dispatch(getItemsThunk());
    return { ok: true, item: data };
  }
  return { ok: false };
};

export const upsertItemAttributeThunk =
  (item_id, attribute_id, index = 0) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const normalizedIndex = Math.max(0, Number(index) || 0);

    dispatch({
      type: CREATE_ITEM_ATTRIBUTE,
      itemAttribute: {
        item_id,
        attribute_id,
        index: normalizedIndex,
      },
    });

    const response = await fetch(
      `/api/items/${item_id}/attributes/${attribute_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ index: normalizedIndex }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data?.itemAttribute) {
        dispatch(
          createItemAttribute({
            ...data.itemAttribute,
            item_id: data.itemAttribute.item_id ?? item_id,
            attribute_id: data.itemAttribute.attribute_id ?? attribute_id,
            index: data.itemAttribute.index ?? normalizedIndex,
          }),
        );
      }
      return data;
    }

    await dispatch(getItemsThunk());
    console.error("Failed to upsert item attribute");
    return null;
  };

export const upsertItemSpecialAttributeThunk =
  (item_id, special_attribute_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/items/${item_id}/special-attributes/${special_attribute_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      // Refresh all items to get updated special attributes
      dispatch(getItemsThunk());
      return response;
    } else {
      console.error("Failed to upsert item special attribute");
    }
  };

export const deleteItemAttributeThunk =
  (item_id, attribute_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/items/${item_id}/attributes/${attribute_id}`,
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
      dispatch(deleteItemAttribute({ itemId: item_id, attributeId: attribute_id }));
      dispatch(getItemsThunk());
      return response;
    }
  };

export const deleteItemSpecialAttributeThunk =
  (item_id, special_attribute_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/items/${item_id}/special-attributes/${special_attribute_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      // Refresh all items to get updated special attributes
      dispatch(getItemsThunk());
      return response;
    } else {
      console.error("Failed to delete item special attribute");
    }
  };

export const updateDisableItemThunk = (item_id, name) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/items/${item_id}/hide`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (response.ok) {
    const data = await response.json();
    await dispatch(getItemsThunk());
    return response;
  }
};

export const upsertOptionNestedAttributesThunk =
  (item_id, option_id, nested_attribute_ids = []) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/items/${item_id}/options/${option_id}/nested-attributes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nested_attribute_ids }),
      },
    );

    if (response.ok) {
      dispatch(getItemsThunk());
      // Nested links live on Item_Attribute_Option; GET /items does not reload option.nested_attribute_ids.
      // Modal rebuilds from attributes slice — refresh it so reopening the modal shows saved nested modifiers.
      dispatch(getAllAttributesThunk());
      return response.json();
    }

    return null;
  };

const initialState = { 
  items: [], 
  item: {}, 
  deletedItems: [], 
  showAddModal: false, 
  showCreateGroupModal: false 
};

const itemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DELETED_ITEMS:
      return { ...state, deletedItems: action.deletedItems || [] };
    case RESTORE_ITEM:
      return {
        ...state,
        deletedItems: state.deletedItems.filter((i) => i.id !== action.item.id),
      };
    case GET_ITEMS:
      return { ...state, items: action.items };
    case ADD_ITEM:
      return { ...state, items: [...state.items, action.item] };
    case DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.item.id),
      };

    case CREATE_ITEM_ATTRIBUTE: {
      const link = action.itemAttribute;
      if (!link) return state;

      const itemId = link.item_id ?? link.Item?.id;
      const attributeId = link.attribute_id ?? link.Item_Attribute?.id;

      return {
        ...state,
        items: state.items.map((item) => {
          if (Number(item.id) !== Number(itemId)) return item;

          const existing = (item.Restaurant_Item_Attributes || []).find(
            (attr) =>
              Number(attr.id) === Number(link.id) ||
              Number(attr.attribute_id) === Number(attributeId),
          );

          const nextLink = existing
            ? { ...existing, ...link, index: link.index ?? existing.index }
            : link;

          const withoutDuplicate = (item.Restaurant_Item_Attributes || []).filter(
            (attr) =>
              Number(attr.id) !== Number(nextLink.id) &&
              Number(attr.attribute_id) !== Number(attributeId),
          );

          return {
            ...item,
            Restaurant_Item_Attributes: [...withoutDuplicate, nextLink].sort(
              (a, b) => (a?.index ?? 0) - (b?.index ?? 0),
            ),
          };
        }),
      };
    }

    case DELETE_ITEM_ATTRIBUTE: {
      const { itemId, attributeId } = action.payload || {};
      if (!itemId || !attributeId) return state;

      return {
        ...state,
        items: state.items.map((item) => {
          if (Number(item.id) !== Number(itemId)) return item;

          return {
            ...item,
            Restaurant_Item_Attributes: (item.Restaurant_Item_Attributes || []).filter(
              (attr) => Number(attr.attribute_id) !== Number(attributeId),
            ),
          };
        }),
      };
    }

    case UPDATE_DISABLE_ITEM:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === action.item.id) {
            return {
              ...item,
              disabled: !item.disabled,
            };
          }
          return item;
        }),
      };

    case SET_SHOW_ADD_MODAL:
      return { ...state, showAddModal: action.show };

    case SET_SHOW_CREATE_GROUP_MODAL:
      return { ...state, showCreateGroupModal: action.show };

    default:
      return state;
  }
};

export default itemsReducer;
