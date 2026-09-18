import { getMasterToken, getToken } from "./utlits";

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const SET_TOKEN = "session/setToken";
const GET_USER_RESTAURANT = "session/getUserRestaurant";
const GET_USER_PLAN = "session/getUserPlan";

const apiUrl = "https://hutaoadmin.onrender.com";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

export const setToken = (token) => {
  return {
    type: SET_TOKEN,
    payload: token,
  };
};

const getUserRestaurant = (restaurant) => {
  return {
    type: GET_USER_RESTAURANT,
    payload: restaurant,
  };
};

const getPlan = (payload) => {
  return {
    type: GET_USER_PLAN,
    payload,
  };
};

export const loginThunk = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await fetch(`/api/session`, {
    method: "POST",
    body: JSON.stringify({
      credential,
      password,
    }),
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
    },
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  dispatch(setToken(data.token));
  return response;
};

export const logout = () => async (dispatch) => {
  // const token = getToken();

  const response = await fetch(`/api/session`, {
    method: "DELETE",
    credentials: "include",
  });
  dispatch(removeUser());
  return response;
};

export const restoreUser = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`/api/session/restaurantUser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
  } catch (error) {
    // Handle fetch errors
    console.error("Error fetching user session:", error);
    throw error;
  }
};

export const getUserPlanThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch("/api/session/user/plan", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(getPlan(data));
    return data;
  }
};

const initialState = { user: null, usersRestaurant: null, userPlan: null };

const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case SET_USER:
      newState = Object.assign({}, state);
      newState.user = action.payload;
      return newState;
    case REMOVE_USER:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;
    case SET_TOKEN:
      //set token in local storage
      localStorage.setItem("ownmenutoken", action.payload);
      return state;
    case GET_USER_RESTAURANT:
      newState = Object.assign({}, state);
      newState.usersRestaurant = action.payload;
      return newState;
    case GET_USER_PLAN:
      newState = Object.assign({}, state);
      newState.userPlan = action.payload;
      return newState;
    default:
      return state;
  }
};

export default sessionReducer;
