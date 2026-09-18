import { getToken } from "./utlits";

const GET_ORDERS = "orders/GET_ORDERS";
const UPDATE_TIME = "orders/UPDATE_TIME";
const UPDATE_STATUS = "order/UPDATE_STATUS";
const GET_ALL_ORDERS = "orders/GET_ALL_ORDERS";
const UPDATE_TIP = "orders/UPDATE_TIP";
const UPDATE_ORDER = "orders/UPDATE_ORDER";

const apiUrl = "https://hutaoadmin.onrender.com";

const getOrders = (orders) => ({
  type: GET_ORDERS,
  orders,
});

const updateTime = (order) => ({
  type: UPDATE_TIME,
  order,
});

const updateStatus = (order) => ({
  type: UPDATE_STATUS,
  order,
});

const getAllOrders = (orders) => ({
  type: GET_ALL_ORDERS,
  orders,
});

export const updateTip = (order) => ({
  type: UPDATE_TIP,
  order,
});

export const updateOrder = (order) => ({
  type: UPDATE_ORDER,
  order,
});

const REMOVE_ORDER = "orders/REMOVE_ORDER";

export const removeOrder = (order_id) => ({
  type: REMOVE_ORDER,
  order_id,
});

export const getOrdersThunk = (restaurant_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/orders/${restaurant_id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(getOrders(data));
  }
};

export const getAllOrdersThunk =
  (user_id, page = 1, filters = {}) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const params = new URLSearchParams({ page });

    // Append any non-empty filters (allow "0" for totals)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value != null) params.append(key, value);
    });

    const response = await fetch(
      `/api/orders/all/${user_id}?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(getAllOrders(data));
    }
  };

export const updatePrepTimeThunk = (order_id, time) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/orders/prep_time/${order_id}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      credentials: "include",
    },

    body: JSON.stringify({ time }),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateTime(data));
  }
};

export const updateStatusThunk = (order_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/orders/status/${order_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateStatus(data));
  }
};

export const updateTipThunk =
  (order_id, tip, restaurant_id) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/orders/tip/${order_id}/${restaurant_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
          authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({ tip }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      dispatch(updateTip(data));
    }
  };

export const deleteOrderThunk = (order_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/orders/${order_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateOrder(data));
    return data;
  }
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Failed to delete order");
};

export const hardDeleteOrderThunk = (order_id, password) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/orders/${encodeURIComponent(order_id)}/hard-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to hard delete order");
  }
  dispatch(removeOrder(order_id));
  return data;
};
const cleanPhoneNumber = (phoneNumber) => {
  //split phone if includes /
  //return phone number without any special characters
  if (phoneNumber?.includes("/")) {
    return phoneNumber?.split("/").map((phone) => phone?.replace(/\D/g, ""));
  }
  return phoneNumber?.replace(/\D/g, "");
};

export const updateDeliverByThunk =
  (order, method, adminRestaurant) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    // Platform delivery: create-delivery owns provider selection (doordash | uber | undeliverable)
    if (method === "doordash") {
      await fetch(`/api/drivers/create-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: order.order_id,
          pickup_address: `${adminRestaurant?.street}, ${adminRestaurant?.city}`,
          pickup_phone_number: cleanPhoneNumber(
            adminRestaurant?.phone || adminRestaurant?.zip,
          ),
          dropoff_address: order.address,
          dropoff_phone_number: order.phone_number,
          customer_name: order.name,
          business_name:
            adminRestaurant?.name || order.restaurant_name || "Restaurant",
          items: order.OrderItems || [],
          aptNumber: order.delivery_apt_number,
          delivery_instructions: order.delivery_instruction,
        }),
      });

      dispatch(getOrdersThunk(order.restaurant_id));
      return;
    }

    // Admin: abort DoorDash retry/timer flow and create Uber immediately
    if (method === "uber") {
      await fetch(`/api/drivers/request-uber`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: order.order_id,
          pickup_address: `${adminRestaurant?.street}, ${adminRestaurant?.city}`,
          pickup_phone_number: cleanPhoneNumber(
            adminRestaurant?.phone || adminRestaurant?.zip,
          ),
          dropoff_address: order.address,
          dropoff_phone_number: order.phone_number,
          customer_name: order.name,
          business_name:
            adminRestaurant?.name || order.restaurant_name || "Restaurant",
          items: order.OrderItems || [],
          aptNumber: order.delivery_apt_number,
          delivery_instructions: order.delivery_instruction,
        }),
      });

      dispatch(getOrdersThunk(order.restaurant_id));
      return;
    }

    const response = await fetch(`/api/orders/deliver_by/${order.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        credentials: "include",
      },
      body: JSON.stringify({ deliver_by: method }),
    });

    if (response.ok) {
      const updatedOrder = await response.json();
      dispatch(updateOrder(updatedOrder));
    }
  };

const initialState = { orders: [], allOrders: [], appOrderCount: 0, websiteOrderCount: 0 };

const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORDERS:
      return {
        ...state,
        orders: action.orders.orders,
      };
    case GET_ALL_ORDERS:
      return {
        ...state,
        allOrders: action.orders.orders,
        appOrderCount: action.orders.appOrderCount ?? 0,
        websiteOrderCount: action.orders.websiteOrderCount ?? 0,
      };
    case UPDATE_TIME:
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === action.order.id) {
            return action.order;
          } else {
            return order;
          }
        }),
      };
    case UPDATE_STATUS:
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === action.order.id) {
            return action.order;
          } else {
            return order;
          }
        }),
      };
    case UPDATE_TIP:
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === action.order.id) {
            return action.order;
          } else {
            return order;
          }
        }),
      };

    case UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.order_id === action.order.order_id) {
            return action.order;
          } else {
            return order;
          }
        }),
        allOrders: state.allOrders.map((order) => {
          if (order.order_id === action.order.order_id) {
            return action.order;
          } else {
            return order;
          }
        }),
      };

    case REMOVE_ORDER:
      return {
        ...state,
        orders: state.orders.filter((order) => order.order_id !== action.order_id),
        allOrders: state.allOrders.filter(
          (order) => order.order_id !== action.order_id,
        ),
      };

    default:
      return state;
  }
};

export default ordersReducer;
