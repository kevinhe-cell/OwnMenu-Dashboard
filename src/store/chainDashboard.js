import { getMasterToken, getToken } from "./utlits";

const SET_CHAIN_RESTAURANTS_LOADING = "chainDashboard/setRestaurantsLoading";
const SET_CHAIN_RESTAURANTS = "chainDashboard/setRestaurants";
const SET_CHAIN_RESTAURANTS_ERROR = "chainDashboard/setRestaurantsError";
const SET_CHAIN_SALES_LOADING = "chainDashboard/setSalesLoading";
const SET_CHAIN_SALES = "chainDashboard/setSales";
const SET_CHAIN_SALES_ERROR = "chainDashboard/setSalesError";

const authToken = () => getToken() || getMasterToken();

export const setChainSales = (payload) => ({
  type: SET_CHAIN_SALES,
  payload,
});

const readApiError = async (response, fallbackMessage) => {
  try {
    const body = await response.json();
    return body?.error || body?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const fetchChainRestaurantsThunk = () => async (dispatch) => {
  const token = authToken();
  if (!token) {
    // Mark loaded so SideBar does not spin forever without a session token.
    dispatch({
      type: SET_CHAIN_RESTAURANTS,
      payload: { chain: false, restaurants: [] },
    });
    return null;
  }

  dispatch({ type: SET_CHAIN_RESTAURANTS_LOADING, payload: true });
  dispatch({ type: SET_CHAIN_RESTAURANTS_ERROR, payload: "" });

  try {
    const response = await fetch("/api/session/chain-users/restaurants", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, "Failed to load chain restaurants."));
    }

    const data = await response.json();
    dispatch({ type: SET_CHAIN_RESTAURANTS, payload: data });
    return data;
  } catch (error) {
    // Treat failure as "checked" — otherwise SideBar retries infinitely on 401.
    dispatch({
      type: SET_CHAIN_RESTAURANTS,
      payload: { chain: false, restaurants: [] },
    });
    dispatch({
      type: SET_CHAIN_RESTAURANTS_ERROR,
      payload: error?.message || "Failed to load chain restaurants.",
    });
    return null;
  } finally {
    dispatch({ type: SET_CHAIN_RESTAURANTS_LOADING, payload: false });
  }
};

export const getChainSalesDailyThunk =
  (restaurantIds, startDate, endDate, orderType, paymentType) => async (dispatch) => {
    const token = authToken();
    if (!token) return null;

    const params = new URLSearchParams();
    if (Array.isArray(restaurantIds) && restaurantIds.length) {
      params.append("restaurantIds", restaurantIds.join(","));
    }
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (orderType && orderType !== "all") params.append("orderType", orderType);
    if (paymentType && paymentType !== "all") params.append("paymentType", paymentType);

    dispatch({ type: SET_CHAIN_SALES_LOADING, payload: true });
    dispatch({ type: SET_CHAIN_SALES_ERROR, payload: "" });

    try {
      const response = await fetch(`/api/restaurants/chain/sales/daily?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to load chain sales report."));
      }

      const data = await response.json();
      dispatch({ type: SET_CHAIN_SALES, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: SET_CHAIN_SALES_ERROR,
        payload: error?.message || "Failed to load chain sales report.",
      });
      throw error;
    } finally {
      dispatch({ type: SET_CHAIN_SALES_LOADING, payload: false });
    }
  };

const initialState = {
  chain: false,
  restaurants: [],
  restaurantsLoading: false,
  restaurantsLoaded: false,
  restaurantsError: "",
  salesDaily: null,
  salesLoading: false,
  salesError: "",
};

const chainDashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CHAIN_RESTAURANTS_LOADING:
      return { ...state, restaurantsLoading: action.payload };
    case SET_CHAIN_RESTAURANTS:
      return {
        ...state,
        chain: !!action.payload?.chain,
        restaurants: action.payload?.restaurants || [],
        restaurantsLoaded: true,
      };
    case SET_CHAIN_RESTAURANTS_ERROR:
      return { ...state, restaurantsError: action.payload };
    case SET_CHAIN_SALES_LOADING:
      return { ...state, salesLoading: action.payload };
    case SET_CHAIN_SALES:
      return { ...state, salesDaily: action.payload };
    case SET_CHAIN_SALES_ERROR:
      return { ...state, salesError: action.payload };
    default:
      return state;
  }
};

export default chainDashboardReducer;
