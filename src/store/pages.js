import { getToken } from "./utlits";
import Swal from "sweetalert2";

// Action Types
const GET_PAGES = "pages/GET_PAGES";
const ADD_PAGE = "pages/ADD_PAGE";
const UPDATE_SECTION = "sections/UPDATE_SECTION";
const DELETE_SECTION = "sections/DELETE_SECTION";

const deleteSection = (id) => ({
  type: DELETE_SECTION,
  id,
});

const updateSection = (payload) => ({
  type: UPDATE_SECTION,
  payload,
});
// Action Creators
const getPages = (payload) => ({
  type: GET_PAGES,
  payload,
});

const addPage = (payload) => ({
  type: ADD_PAGE,
  payload,
});

// Thunks

/**
 * NEW THUNK for AI Website Builder
 * Calls the backend to build a website from a blueprint.
 */
export const buildWebsiteThunk = (formData) => async (dispatch) => {
  const token = getToken();
  const response = await fetch("/api/blueprints/build", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-Type" is intentionally omitted.
      // The browser will automatically set it to "multipart/form-data"
      // and include the boundary when the body is a FormData object.
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to build website from blueprint.");
  }

  const data = await response.json();
  // After building, refresh the pages to get the new structure
  await dispatch(getPagesThunk());
  return data;
};


export const getPagesThunk = () => async (dispatch) => {
  const token = getToken();
  const response = await fetch("/api/pages", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch pages");

  const data = await response.json();
  dispatch(getPages(data));
  return data;
};

export const createPageThunk = (formData) => async (dispatch) => {
  const token = getToken();
  const response = await fetch("/api/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error("Failed to create page");

  const data = await response.json();
  dispatch(addPage(data));
  return data;
};
export const createNewPageThunk =
  ({ name }) =>
  async (dispatch) => {
    const token = getToken();
    const response = await fetch("/api/pages/new", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create new page");
    }

    const data = await response.json();
    dispatch(getPagesThunk()); // refresh pages after creation
    return data;
  };

export const updateSectionThunk =
  (sectionId, updatedData) => async (dispatch) => {
    const token = getToken();

    const response = await fetch(`/api/pages/sections/${sectionId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Failed to update section");
    }

    dispatch(updateSection(data));
    return data;
  };
const REORDER_SECTIONS = "sections/REORDER_SECTIONS";

export const reorderSectionsThunk = (sections) => async (dispatch) => {
  const token = getToken();
  const response = await fetch("/api/pages/reorder", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sections }), // ✅ key must be `sections`
  });

  if (!response.ok) throw new Error("Failed to reorder sections");
};
export const createSectionThunk = (sectionData) => async (dispatch) => {
  const token = getToken();

  const response = await fetch("/api/pages/sections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sectionData),
  });

  if (response.status === 400) {
    const error = await response.json();
    Swal.fire({
      icon: "error",
      title: "Failed to Create Section",
      text: error.message || "Something went wrong.",
    });
    return null;
  }

  if (!response.ok) throw new Error("Failed to create section");

  const data = await response.json();
  return data;
};

export const deleteSectionThunk = (sectionId) => async (dispatch) => {
  const token = getToken();
  const response = await fetch(`/api/pages/sections/${sectionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete section");

  dispatch(deleteSection(sectionId));
  return sectionId;
};

export const deletePageThunk = (pageName) => async (dispatch) => {
  const token = getToken();
  const response = await fetch(`/api/pages/${pageName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete page");

  dispatch(getPagesThunk()); // Re-fetch updated pages
};

// Initial State
const initialState = {
  pages: [],
};

// Reducer
export default function pagesReducer(state = initialState, action) {
  switch (action.type) {
    case GET_PAGES:
      return {
        ...state,
        pages: action.payload,
      };
    case ADD_PAGE:
      return {
        ...state,
        pages: [...state.pages, action.payload],
      };
    case UPDATE_SECTION: {
      const updatedSection = action.payload;

      return {
        ...state,
        pages: state.pages.map((page) => ({
          ...page,
          Sections: page.Sections.map((section) =>
            section.id === updatedSection.id
              ? { ...section, ...updatedSection }
              : section,
          ),
        })),
      };
    }
    case DELETE_SECTION:
      return {
        ...state,
        pages: state.pages.map((page) => ({
          ...page,
          Sections: page.Sections.filter((section) => section.id !== action.id),
        })),
      };

    default:
      return state;
  }
}
