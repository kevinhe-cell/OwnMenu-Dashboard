import { getToken } from "./utlits";

const GET_CATEGORIES = "categories/GET_CATEGORIES";
const ADD_CATEGORY = "categories/ADD_CATEGORY";
const DELETE_CATEGORY = "categories/DELETE_CATEGORY";
const EDIT_CATEGORY = "categories/EDIT_CATEGORY";

const getCategories = (categories) => ({
  type: GET_CATEGORIES,
  categories,
});

const addCategory = (category) => ({
  type: ADD_CATEGORY,
  category,
});

const deleteCategory = (categoryId) => ({
  type: DELETE_CATEGORY,
  categoryId,
});

const editCategory = (category) => ({
  type: EDIT_CATEGORY,
  category,
});

function buildCategoryFormData(category) {
  const formData = new FormData();
  Object.entries(category || {}).forEach(([key, value]) => {
    if (key === "id" || key === "image_url") return;
    if (key === "image") {
      if (value) formData.append("image", value);
      return;
    }
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    if (value !== undefined) {
      formData.append(key, value === null ? "" : value);
    }
  });
  return formData;
}

export const getCategoriesThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/categories`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });
  const categories = await res.json();
  dispatch(getCategories(categories));
};

export const addCategoryThunk = (category) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/categories`, {
    method: "POST",
    body: buildCategoryFormData(category),
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const newCategory = await res.json();
  dispatch(addCategory(newCategory));
};

export const editCategoryThunk = (category) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;
  if (category?.id == null || category?.id === "" || String(category.id) === "undefined") {
    console.error("editCategoryThunk: missing category id", category);
    return null;
  }

  const res = await fetch(`/api/categories/${category.id}`, {
    method: "PUT",
    body: buildCategoryFormData(category),
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const editedCategory = await res.json();
  dispatch(editCategory(editedCategory));
  dispatch(getCategoriesThunk())
};

export const deleteCategoryThunk = (categoryId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Failed to delete category");
  }

  dispatch(deleteCategory(categoryId));
  dispatch(getCategoriesThunk());
};

const initialState = { categories: [] };

const categoriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CATEGORIES:
      return { ...state, categories: action.categories };
    case ADD_CATEGORY:
      return { ...state, categories: [...state.categories, action.category] };
    case DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.categoryId,
        ),
      };
    case EDIT_CATEGORY:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.category.id ? action.category : category,
        ),
      };
    default:
      return state;
  }
};

export default categoriesReducer;
