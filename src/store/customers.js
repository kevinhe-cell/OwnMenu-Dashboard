import { getToken } from "./utlits";

// ACTION TYPES
const GET_CUSTOMERS = "customers/GET_CUSTOMERS";
const UPDATE_POINTS = "customers/UPDATE_POINTS";
const ADD_CUSTOMER = "customers/ADD_CUSTOMER";
const UPDATE_CUSTOMER_TAGS = "customers/UPDATE_CUSTOMER_TAGS";

// 🔹 Profile-specific
const SET_CUSTOMER_PROFILE = "customers/SET_CUSTOMER_PROFILE";
const SET_PROFILE_LOADING = "customers/SET_PROFILE_LOADING";
const SET_PROFILE_ERROR = "customers/SET_PROFILE_ERROR";
const CLEAR_CUSTOMER_PROFILE = "customers/CLEAR_CUSTOMER_PROFILE";

// ACTION CREATORS
const getCustomers = (payload) => ({ type: GET_CUSTOMERS, payload }); // { data, stats }
export const updatePoints = (points) => ({ type: UPDATE_POINTS, points });
const addCustomer = (customer) => ({ type: ADD_CUSTOMER, customer });

// 🔹 Profile actions
const setCustomerProfile = (profile) => ({ type: SET_CUSTOMER_PROFILE, profile });
const setProfileLoading = (isLoading) => ({ type: SET_PROFILE_LOADING, isLoading });
const setProfileError = (error) => ({ type: SET_PROFILE_ERROR, error });
export const clearCustomerProfile = () => ({ type: CLEAR_CUSTOMER_PROFILE });

// THUNKS
export const getCustomerThunk =
  (page, search = "", sortBy = "createdAt", order = "desc") =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(
      `/api/rewards/all/user?page=${page}&search=${encodeURIComponent(
        search
      )}&sortBy=${sortBy}&order=${order}`,
      {
        headers: { authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        dispatch(
          getCustomers({
            data,
            stats: {
              totalCustomers: data.length,
              newCustomers: 0,
              reorderCustomers: 0,
            },
          })
        );
      } else {
        dispatch(
          getCustomers({
            data: data.data || [],
            stats:
              data.stats || {
                totalCustomers: 0,
                newCustomers: 0,
                reorderCustomers: 0,
              },
          })
        );
      }
    }
  };


export const updatePointsThunk = (id, points) => async (dispatch, getState) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/rewards/user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ points }),
  });

  if (res.ok) {
    const customer = await res.json();
    dispatch(updatePoints(customer));

    // 🔹 If profile is loaded and matches, update it too
    const { customers } = getState();
    if (customers.profile && customers.profile.id === customer.id) {
      dispatch(setCustomerProfile({ ...customers.profile, points: customer.points }));
    }
  }
};

// 🚨 Add customer
export const addCustomerThunk = (customerData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/rewards/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(customerData),
  });

  if (res.ok) {
    const customer = await res.json();
    dispatch(addCustomer(customer));
    return customer;
  } else {
    const err = await res.json();
    throw new Error(err.message || "Failed to add customer");
  }
};

/** Upload Excel/CSV/PDF → parsed preview rows */
export const parseCustomerImport = async (file) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/api/rewards/import-customers/parse`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to parse customer file");
  }
  return data;
};

/** Confirm importing previewed customers */
export const confirmCustomerImport = async (customers) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/rewards/import-customers/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ customers }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to import customers");
  }
  return data;
};

// 🔹 Fetch single customer profile (includes orders by phone)
export const getCustomerProfileThunk = (id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  try {
    dispatch(setProfileLoading(true));
    dispatch(setProfileError(null));

    const res = await fetch(`/api/rewards/user/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to load customer profile");
    }

    const profile = await res.json(); // { ...customer, orders: [...] }
    dispatch(setCustomerProfile(profile));
  } catch (e) {
    dispatch(setProfileError(e.message || "Error"));
  } finally {
    dispatch(setProfileLoading(false));
  }
};

export const updateCustomerProfileThunk = (id, data) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/rewards/profile/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const updated = await res.json();
    dispatch(getCustomerProfileThunk(id)); // refresh
    return updated;
  } else {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update customer profile");
  }
};

// Update customer tags manually
export const updateCustomerTagsThunk = (customerId, tags) => async (dispatch, getState) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/customer-tags/${customerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tags }),
  });

  if (res.ok) {
    const data = await res.json();
    const state = getState();
    // Update profile if it's loaded
    if (state.customers?.profile && state.customers.profile.id === customerId) {
      dispatch(setCustomerProfile({ ...state.customers.profile, tags: data.tags }));
    }
    // Update this customer in the list so the table row reflects new tags
    dispatch({ type: UPDATE_CUSTOMER_TAGS, customerId, tags: data.tags });
    return data;
  } else {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update customer tags");
  }
};


// REDUCER
const initialState = {
  customers: [],
  stats: {
    totalCustomers: 0,
    newCustomers: 0,
    reorderCustomers: 0,
  },
  // 🔹 Profile slice
  profile: null,
  profileLoading: false,
  profileError: null,
};

export default function customersReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CUSTOMERS:
      return {
        ...state,
        customers: action.payload.data || [],
        stats: action.payload.stats || state.stats,
      };

    case UPDATE_POINTS:
      return {
        ...state,
        customers: Array.isArray(state.customers)
          ? state.customers.map((c) => (c.id === action.points.id ? action.points : c))
          : state.customers,
      };

    case ADD_CUSTOMER:
      return {
        ...state,
        customers: Array.isArray(state.customers) ? [action.customer, ...state.customers] : [action.customer],
        stats: {
          ...state.stats,
          totalCustomers: state.stats.totalCustomers + 1,
          newCustomers: state.stats.newCustomers + 1,
        },
      };

    case UPDATE_CUSTOMER_TAGS:
      return {
        ...state,
        customers: Array.isArray(state.customers)
          ? state.customers.map((c) =>
              c.id === action.customerId ? { ...c, tags: action.tags } : c
            )
          : state.customers,
      };

    // 🔹 Profile
    case SET_CUSTOMER_PROFILE:
      return { ...state, profile: action.profile };
    case SET_PROFILE_LOADING:
      return { ...state, profileLoading: action.isLoading };
    case SET_PROFILE_ERROR:
      return { ...state, profileError: action.error };
    case CLEAR_CUSTOMER_PROFILE:
      return { ...state, profile: null, profileLoading: false, profileError: null };

    default:
      return state;
  }
}
