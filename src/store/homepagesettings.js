import { getToken } from "./utlits";
const GET_HOMEPAGE = "homepage/GET_HOMEPAGE";
const UPDATE_HOMEPAGE = "homepage/UPDATE_HOMEPAGE";
const CREATE_HOMEPAGE = "homepage/CREATE_HOMEPAGE";

export const getHomepage = (settings) => ({
  type: GET_HOMEPAGE,
  settings,
});

export const updateHomepage = (settings) => ({
  type: UPDATE_HOMEPAGE,
  settings,
});

export const createHomepage = (settings) => ({
  type: CREATE_HOMEPAGE,
  settings,
});

export const getHomepageThunk = (restaurantId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/homepage-settings/${restaurantId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const settings = await response.json();
    dispatch(getHomepage(settings));
  }
};

export const updateHomepageThunk =
  (restaurantId, payload) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const formData = new FormData();

    // Images
    if (payload.heroBanner) {
      formData.append("heroBanner", payload.heroBanner);
    }

    if (payload.logoImage) {
      formData.append("logoImage", payload.logoImage);
    }

    if (payload.aboutImages?.length) {
      payload.aboutImages.forEach((file) =>
        formData.append("aboutImages", file),
      );
    }

    if (payload.carouselImages?.length) {
      payload.carouselImages.forEach((file) =>
        formData.append("carouselImages", file),
      );
    }

    // Other stringified data
    formData.append("themeStyle", payload.themeStyle);
    formData.append("colors", JSON.stringify(payload.colors));
    formData.append("sections", JSON.stringify(payload.sections));
    formData.append("hero", JSON.stringify(payload.hero));
    formData.append("about", JSON.stringify(payload.about));
    formData.append("info", JSON.stringify(payload.info));
    formData.append("restaurant_name", payload.restaurant_name);

    const response = await fetch(`/api/homepage-settings/${restaurantId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const updated = await response.json();
      dispatch(updateHomepage(updated));
    } else {
      console.error("Failed to update homepage");
    }
  };

export const createHomepageThunk = (payload) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/homepage-settings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const created = await response.json();
    dispatch(createHomepage(created));
    dispatch(getHomepageThunk(payload.restaurantId));
  }
};
export const deleteImageThunk =
  (restaurantId, type, imageUrl) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/homepage-settings/${restaurantId}/delete-image`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, imageUrl }),
      },
    );

    if (response.ok) {
      dispatch(getHomepageThunk(restaurantId)); // Refresh homepage state
    } else {
      const data = await response.json();
      console.error("Image deletion failed:", data.error);
    }
  };

const initialState = { homepage: null };

export default function homepageReducer(state = initialState, action) {
  switch (action.type) {
    case GET_HOMEPAGE:
      return {
        ...state,
        homepage: action.settings,
      };
    case UPDATE_HOMEPAGE:
      return {
        ...state,
        homepage: action.settings,
      };
    case CREATE_HOMEPAGE:
      return {
        ...state,
        homepage: action.settings,
      };
    default:
      return state;
  }
}
