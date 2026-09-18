import { getToken } from "./utlits";

const GET_SEO = "seo/GET_SEO";
const SET_SEO = "seo/SET_SEO";

// ACTIONS
const getSEO = (seo) => ({
  type: GET_SEO,
  seo,
});

export const setSEO = (seo) => ({
  type: SET_SEO,
  seo,
});

// THUNKS
export const getSEOThunk = (restaurantId) => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch(`/api/seo/${restaurantId}`, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    dispatch(getSEO(data));
  } catch (err) {
    console.error("Failed to fetch SEO settings:", err);
  }
};

export const setSEOThunk = (seoData) => async (dispatch) => {
  const token = getToken();

  try {
    const res = await fetch(`/api/seo`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(seoData),
    });

    const data = await res.json();
    dispatch(setSEO(data));
  } catch (err) {
    console.error("Failed to save SEO settings:", err);
  }
};

// REDUCER
const initialState = { seo: null };

export default function seoReducer(state = initialState, action) {
  switch (action.type) {
    case GET_SEO:
    case SET_SEO:
      return { ...state, seo: action.seo };
    default:
      return state;
  }
}
