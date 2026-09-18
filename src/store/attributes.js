// Import fetch if not already imported
import { getToken } from "./utlits";

// const apiUrl = process.env.REACT_APP_API_URL;

// Action Types
const GET_ALL_ATTRIBUTES = "attributes/GET_ALL_ATTRIBUTES";
const CREATE_ATTRIBUTE = "attributes/CREATE_ATTRIBUTE";
const DELETE_ATTRIBUTE = "attributes/DELETE_ATTRIBUTE";
const UPDATE_ATTRIBUTE = "attributes/UPDATE_ATTRIBUTE";
const CREATE_ITEM_ATTRIBUTE = "attributes/CREATE_ITEM_ATTRIBUTE";
const DELETE_ITEM_ATTRIBUTE = "attributes/DELETE_ITEM_ATTRIBUTE";
const UPDATE_ITEM_ATTRIBUTE = "attributes/UPDATE_ITEM_ATTRIBUTE";
const DUPLICATE_ATTRIBUTE = "attributes/DUPLICATE_ATTRIBUTE";
const SET_OPTION_TAGS = "attributes/SET_OPTION_TAGS";

// Action Creators
const getAllAttributes = (attributes) => ({
  type: GET_ALL_ATTRIBUTES,
  attributes,
});

const createAttribute = (attribute) => ({
  type: CREATE_ATTRIBUTE,
  attribute,
});

const deleteAttribute = (attributeId) => ({
  type: DELETE_ATTRIBUTE,
  attributeId,
});

const updateAttribute = (attribute) => ({
  type: UPDATE_ATTRIBUTE,
  attribute,
});

const createItemAttribute = (payload) => ({
  type: CREATE_ITEM_ATTRIBUTE,
  payload,
});

const deleteItemAttribute = (itemAttributeId) => ({
  type: DELETE_ITEM_ATTRIBUTE,
  itemAttributeId,
});

const updateItemAttribute = (itemAttribute) => ({
  type: UPDATE_ITEM_ATTRIBUTE,
  itemAttribute,
});

const setOptionTags = (optionTags) => ({
  type: SET_OPTION_TAGS,
  optionTags,
});

const duplicateAttribute = (attribute) => ({
  type: DUPLICATE_ATTRIBUTE,
  attribute,
});

const mergeAttributeOptions = (prevOptions = [], freshOptions = []) => {
  const byId = new Map(
    freshOptions.map((option) => [Number(option.id), option]),
  );
  prevOptions.forEach((option) => {
    if (!byId.has(Number(option.id))) {
      byId.set(Number(option.id), option);
    }
  });
  return [...byId.values()].sort((a, b) => {
    const aIndex = Number.isFinite(Number(a.index)) ? Number(a.index) : 0;
    const bIndex = Number.isFinite(Number(b.index)) ? Number(b.index) : 0;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
};

const buildOptionPayload = (attributeOption) => {
  const hasFile =
    (typeof File !== "undefined" && attributeOption?.image instanceof File) ||
    attributeOption?.remove_image === true;

  if (!hasFile) {
    return {
      body: JSON.stringify(attributeOption),
      headers: { "Content-Type": "application/json" },
    };
  }

  const formData = new FormData();
  Object.entries(attributeOption || {}).forEach(([key, value]) => {
    if (key === "image") {
      if (value) formData.append("image", value);
      return;
    }
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return { body: formData, headers: {} };
};

// Thunks
export const getAllAttributesThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes?ts=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  const attributes = await response.json();
  dispatch(getAllAttributes(attributes));
  return attributes;
};

export const getOptionTagsThunk = (itemAttributeId) => async (dispatch) => {
  const token = getToken();
  if (!token) return [];

  const query = itemAttributeId ? `?itemAttributeId=${itemAttributeId}` : "";
  const response = await fetch(`/api/attributes/option-tags${query}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  const optionTags = await response.json();
  dispatch(setOptionTags(optionTags));
  return optionTags;
};

export const createOptionTagThunk = (name, itemAttributeId, index) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes/option-tags`, {
    method: "POST",
    body: JSON.stringify({ name, item_attribute_id: itemAttributeId, index }),
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  const optionTag = await response.json();
  await dispatch(getOptionTagsThunk(itemAttributeId));
  return optionTag;
};

export const updateOptionTagThunk = (tagId, name, itemAttributeId, index) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes/option-tags/${tagId}`, {
    method: "PUT",
    body: JSON.stringify({ name, index }),
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  const optionTag = await response.json();
  await dispatch(getOptionTagsThunk(itemAttributeId));
  await dispatch(getAllAttributesThunk());
  return optionTag;
};

export const deleteOptionTagThunk = (tagId, itemAttributeId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes/option-tags/${tagId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  const deletedTag = await response.json();
  await dispatch(getOptionTagsThunk(itemAttributeId));
  await dispatch(getAllAttributesThunk());
  return deletedTag;
};

export const createAttributeThunk = (name) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes`, {
    method: "POST",
    body: JSON.stringify(name),
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const newAttribute = await response.json();
  dispatch(createAttribute(newAttribute));
  return newAttribute;
};

export const deleteAttributeThunk = (attributeId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes/${attributeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });
  const deletedAttribute = await response.json();
  dispatch(deleteAttribute(deletedAttribute.id));
  return deletedAttribute;
};

export const updateAttributeThunk =
  (name, require_number, id, max_number, muti_allow) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`/api/attributes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, require_number, max_number, muti_allow }),
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
    });
    const updatedAttribute = await response.json();
    dispatch(updateAttribute(updatedAttribute));
    return updatedAttribute;
  };

export const duplicateAttributeThunk = (attributeId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/attributes/${attributeId}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to duplicate attribute");
  }

  const duplicatedAttribute = await response.json();
  dispatch(duplicateAttribute(duplicatedAttribute));
  await dispatch(getAllAttributesThunk());
  return duplicatedAttribute;
};

export const createItemAttributeThunk =
  (id, attributeOption) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const payload = buildOptionPayload(attributeOption);

    const response = await fetch(`/api/attributes/${id}/options`, {
      method: "POST",
      body: payload.body,
      headers: {
        credentials: "include",
        authorization: `Bearer ${token}`,
        ...payload.headers,
      },
    });
    const newItemAttribute = await response.json();
    dispatch(createItemAttribute(newItemAttribute));
    await dispatch(getAllAttributesThunk());
    return newItemAttribute;
  };

export const deleteItemAttributeThunk =
  (attribute_id, attributeOption_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/attributes/${attribute_id}/options/${attributeOption_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },
      },
    );
    const deletedItemAttribute = await response.json();
    dispatch(deleteItemAttribute(deletedItemAttribute.id));
    await dispatch(getAllAttributesThunk());
    return deletedItemAttribute;
  };

export const updateItemAttributeThunk =
  (attribute_id, attributeOption_id, attributeOption) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const payload = buildOptionPayload(attributeOption);

    const response = await fetch(
      `/api/attributes/${attribute_id}/options/${attributeOption_id}`,
      {
        method: "PUT",
        body: payload.body,
        headers: {
          credentials: "include",
          authorization: `Bearer ${token}`,
          ...payload.headers,
        },
      },
    );
    const updatedItemAttribute = await response.json();
    dispatch(updateItemAttribute(updatedItemAttribute));
    await dispatch(getAllAttributesThunk());
    return updatedItemAttribute;
  };

// Initial State
const initialState = { attributes: null, optionTags: [] };

// Reducer
const attributesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_ATTRIBUTES:
      return { ...state, attributes: action.attributes };
    case SET_OPTION_TAGS:
      return { ...state, optionTags: action.optionTags };
    case CREATE_ATTRIBUTE:
      return {
        ...state,
        attributes: [...(state.attributes || []), action.attribute],
      };
    case DUPLICATE_ATTRIBUTE: {
      const existing = (state.attributes || []).some(
        (attribute) => Number(attribute.id) === Number(action.attribute.id),
      );
      if (existing) {
        return {
          ...state,
          attributes: (state.attributes || []).map((attribute) =>
            Number(attribute.id) === Number(action.attribute.id)
              ? action.attribute
              : attribute,
          ),
        };
      }
      return {
        ...state,
        attributes: [...(state.attributes || []), action.attribute],
      };
    }
    case DELETE_ATTRIBUTE: {
      const newAttributes = (state.attributes || []).filter(
        (attribute) => attribute.id !== action.attributeId,
      );
      return { ...state, attributes: newAttributes };
    }
    case UPDATE_ATTRIBUTE: {
      const updatedAttributes = (state.attributes || []).map((attribute) =>
        attribute.id === action.attribute.id ? action.attribute : attribute,
      );
      return { ...state, attributes: updatedAttributes };
    }
    case CREATE_ITEM_ATTRIBUTE: {
      const attributeId =
        action.payload.item_attribute_id ?? action.payload.attribute_id;
      return {
        ...state,
        attributes: (state.attributes || []).map((attr) => {
          if (Number(attr.id) !== Number(attributeId)) return attr;

          const existingOptions = attr.Item_Attribute_Options || [];
          const alreadyExists = existingOptions.some(
            (option) => Number(option.id) === Number(action.payload.id),
          );

          return {
            ...attr,
            Item_Attribute_Options: alreadyExists
              ? existingOptions.map((option) =>
                  Number(option.id) === Number(action.payload.id)
                    ? action.payload
                    : option,
                )
              : [...existingOptions, action.payload],
          };
        }),
      };
    }

    case DELETE_ITEM_ATTRIBUTE: {
      const deletedOptionId = Number(action.itemAttributeId);
      return {
        ...state,
        attributes: (state.attributes || []).map((attribute) => ({
          ...attribute,
          Item_Attribute_Options: (attribute.Item_Attribute_Options || []).filter(
            (option) => Number(option.id) !== deletedOptionId,
          ),
        })),
      };
    }
    case UPDATE_ITEM_ATTRIBUTE: {
      const updatedAttributesWithUpdatedItem = (state.attributes || []).map(
        (attribute) => {
          const optionAttributeId =
            action.itemAttribute.attribute_id ||
            action.itemAttribute.item_attribute_id;
          if (Number(attribute.id) !== Number(optionAttributeId)) return attribute;

          return {
            ...attribute,
            Item_Attribute_Options: mergeAttributeOptions(
              attribute.Item_Attribute_Options || [],
              (attribute.Item_Attribute_Options || []).map((option) =>
                Number(option.id) === Number(action.itemAttribute.id)
                  ? action.itemAttribute
                  : option,
              ),
            ),
          };
        },
      );
      return { ...state, attributes: updatedAttributesWithUpdatedItem };
    }
    default:
      return state;
  }
};

export { mergeAttributeOptions };

export default attributesReducer;
