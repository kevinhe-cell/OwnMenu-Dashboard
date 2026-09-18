import { getToken } from "./utlits";

const GET_COUPONS = "coupons/GET_COUPONS";
const GET_COUPONS_LOADING = "coupons/GET_COUPONS_LOADING";
const CREATE_COUPON = "coupons/CREATE_COUPON";
const DELETE_COUPON = "coupons/DELETE_COUPON";

const getAllCoupons = (coupons, total, page, limit) => ({
  type: GET_COUPONS,
  coupons,
  total: total ?? coupons.length,
  page: page ?? 1,
  limit: limit ?? 30,
});

const setCouponsLoading = (loading) => ({
  type: GET_COUPONS_LOADING,
  loading,
});

const createCoupon = (coupon) => ({
  type: CREATE_COUPON,
  coupon,
});

const deleteCoupon = (couponId) => ({
  type: DELETE_COUPON,
  couponId,
});

export const getAllCouponsThunk = (params = {}) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  dispatch(setCouponsLoading(true));
  const searchParams = new URLSearchParams();
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  if (params.source) searchParams.set("source", params.source);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const url = `/api/coupons/admin${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const coupons = data.coupons ?? (Array.isArray(data) ? data : []);
      dispatch(getAllCoupons(coupons, data.total, data.page, data.limit));
    }
  } finally {
    dispatch(setCouponsLoading(false));
  }
};

export const createCouponThunk = (coupon) => async (dispatch) => {
  const token = getToken();
  if (!token) return { error: "Authentication failed. Please log in again." };

  try {
    const response = await fetch(`/api/coupons/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(coupon),
    });

    const data = await response.json();

    if (response.ok) {
      dispatch(createCoupon(data));
      return data;
    } else {
      return { error: data.message || "Failed to create coupon." };
    }
  } catch (err) {
    console.error("Coupon creation error:", err);
    return { error: "Something went wrong while creating the coupon." };
  }
};


export const deleteCouponThunk = (couponId) => async (dispatch) => {
  const token = getToken();
  if (!token) return { ok: false, message: "Not authenticated" };

  const response = await fetch(`/api/coupons/admin/${couponId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    dispatch(deleteCoupon(couponId));
    return { ok: true };
  }
  const data = await response.json().catch(() => ({}));
  return { ok: false, message: data.message || "Failed to delete coupon." };
};

const initialState = { coupons: [], total: 0, page: 1, limit: 30, loading: false };

export default function couponsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COUPONS_LOADING:
      return { ...state, loading: action.loading };
    case GET_COUPONS:
      return {
        ...state,
        coupons: action.coupons,
        total: action.total ?? state.total,
        page: action.page ?? state.page,
        limit: action.limit ?? state.limit,
      };
    case CREATE_COUPON:
      return {
        ...state,
        coupons: [...state.coupons, action.coupon],
      };
    case DELETE_COUPON:
      return {
        ...state,
        coupons: state.coupons.filter(
          (coupon) => coupon.coupon_id !== action.couponId,
        ),
      };
    default:
      return state;
  }
}
