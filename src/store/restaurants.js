import { getToken } from "./utlits";

const readApiError = async (response, fallbackMessage) => {
  try {
    const body = await response.json();
    return body?.error || body?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const GET_TODAY_SALES = "GET_TODAY_SALES";
const GET_TOP_SELLING_ITEMS = "GET_TOP_SELLING_ITEMS";
const CHANGE_ONLINE_STATUS = "CHANGE_ONLINE_STATUS";
const CHANGE_MANUAL_STOP_ORDER = "CHANGE_MANUAL_STOP_ORDER";
const GET_RESTAURANT = "GET_RESTAURANT";
const GET_SALES = "GET_SALES";
const GET_SALES_DAILY = "GET_SALES_DAILY";
const UPDATE_SMS_NOTIFICATION = "UPDATE_SMS_NOTIFICATION";
const UPDATE_RESTAURANT_ADDRESS = "UPDATE_RESTAURANT_ADDRESS";

const getTodaySales = (sales) => ({
  type: GET_TODAY_SALES,
  sales,
});

export const getTopSellingItems = (topSellingItems) => ({
  type: GET_TOP_SELLING_ITEMS,
  topSellingItems,
});

export const getSales = (sales) => ({
  type: GET_SALES,
  sales,
});

export const getSalesDaily = (payload) => ({
  type: GET_SALES_DAILY,
  payload,
});

const updateSMSNotification = (restaurant) => ({
  type: UPDATE_SMS_NOTIFICATION,
  restaurant,
});

export const changeOnlineStatus = (restaurant) => ({
  type: CHANGE_ONLINE_STATUS,
  restaurant,
});

export const changeManualStopOrder = (restaurant) => ({
  type: CHANGE_MANUAL_STOP_ORDER,
  restaurant,
});

export const getRestaurant = (restaurant) => ({
  type: GET_RESTAURANT,
  restaurant,
});

export const getTodaySalesThunk = (restaurant_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(
    `/api/restaurants/today_sales/${restaurant_id}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    const sales = await response.json();
    dispatch(getTodaySales(sales));
  }
};

export const updateRestaurantAddress = (restaurant) => ({
  type: UPDATE_RESTAURANT_ADDRESS,
  restaurant,
});

export const getTopSellingItemsThunk =
  (restaurant_id, startDate, endDate) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    let url = `/api/restaurants/top_selling_items/${restaurant_id}`;
    const params = new URLSearchParams();

    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const sales = await response.json();
      dispatch(getTopSellingItems(sales)); // Ensure this action matches your reducer
      return sales;
    }
    throw new Error(await readApiError(response, "Failed to load top selling items."));
  };

export const changeOnlineStatusThunk = (restaurant_id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(
    `/api/restaurants/${restaurant_id}/online_status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.ok) {
    const restaurant = await response.json();
    dispatch(changeOnlineStatus(restaurant));
  } else {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update online status");
  }
};

export const changeManualStopOrderThunk = (restaurant_id, manual_stop_order) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(
    `/api/restaurants/${restaurant_id}/manual-stop-order`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ manual_stop_order }),
    },
  );

  if (response.ok) {
    const restaurant = await response.json();
    dispatch(changeManualStopOrder(restaurant));
    return restaurant;
  }

  const err = await response.json().catch(() => ({}));
  throw new Error(err.error || "Failed to update stop all orders setting");
};

export const getRestaurantThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/restaurants/admin`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const restaurant = await response.json();
    dispatch(getRestaurant(restaurant));
  }
};

export const getSalesThunk =
  (restaurant_id, startDate, endDate, orderType, paymentType) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    let url = `/api/restaurants/sales/${restaurant_id}`;
    const params = new URLSearchParams();

    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);

    // These are your new dual filters
    if (orderType && orderType !== "all") params.append("orderType", orderType);
    if (paymentType && paymentType !== "all")
      params.append("paymentType", paymentType);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const sales = await response.json();
      dispatch(getSales(sales));
    }
  };

export const getSalesDailyThunk =
  (restaurant_id, startDate, endDate, orderType, paymentType) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    let url = `/api/restaurants/sales/${restaurant_id}/daily`;
    const params = new URLSearchParams();
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (orderType && orderType !== "all") params.append("orderType", orderType);
    if (paymentType && paymentType !== "all")
      params.append("paymentType", paymentType);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      dispatch(getSalesDaily(data));
      if (data.summary) {
        dispatch(getSales(data.summary));
      }
      return data;
    }
    throw new Error(await readApiError(response, "Failed to load sales report."));
  };

export const updateSMSNotificationThunk =
  (restaurant_id, sms_noti_phone) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(
      `/api/restaurants/${restaurant_id}/sms_noti_phone`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sms_noti_phone }),
      },
    );

    if (response.ok) {
      const restaurant = await response.json();
      dispatch(updateSMSNotification(restaurant));
    }
  };
export const updateRestaurantAddressThunk =
  (restaurant_id, addressData) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`/api/restaurants/${restaurant_id}/address`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    if (response.ok) {
      const updatedRestaurant = await response.json();
      dispatch(updateRestaurantAddress(updatedRestaurant));
    }
  };

export const updateDisallowSpecialInstructionsThunk =
  (restaurant_id, disallow_special_instructions) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/disallow-special-instructions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disallow_special_instructions }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateAllowOrderNotesThunk =
  (restaurant_id, allow_order_notes) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/allow-order-notes`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allow_order_notes }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateAskForUtensilsThunk =
  (restaurant_id, ask_for_utensils) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/ask-for-utensils`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ask_for_utensils }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateSingleDealOnlyThunk =
  (restaurant_id, single_deal_only) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/single-deal-only`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ single_deal_only }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateSmsVerificationNeedThunk =
  (restaurant_id, sms_verification_need) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/sms-verification-need`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sms_verification_need }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateDisableScheduleOrdersThunk =
  (restaurant_id, disable_schedule_orders) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/disable-schedule-orders`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disable_schedule_orders }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const updateCateringLeadTimeThunk =
  (restaurant_id, catering_lead_time) => async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/catering-lead-time`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catering_lead_time }),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

/** Dashboard: auto-accept + scheduled-order buffer + auto prep time (minutes). */
export const updateRestaurantOrderAutomationThunk =
  (restaurant_id, { auto_accept_order, order_buffer_minutes, auto_prep_time_minutes }) =>
  async (dispatch) => {
    const token = getToken();
    if (!token) return null;
    const body = {};
    if (auto_accept_order !== undefined) body.auto_accept_order = !!auto_accept_order;
    if (order_buffer_minutes !== undefined) body.order_buffer_minutes = order_buffer_minutes;
    if (auto_prep_time_minutes !== undefined) body.auto_prep_time_minutes = auto_prep_time_minutes;
    const response = await fetch(
      `/api/restaurants/${restaurant_id}/order-automation`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (response.ok) {
      dispatch(getRestaurantThunk());
    }
    return response.ok;
  };

export const getMonthlyReportEmailSettingsThunk = (restaurant_id) => async () => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/restaurants/${restaurant_id}/monthly-report-email-settings`, {
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error(await readApiError(response, "Failed to load email settings."));
};

export const updateMonthlyReportEmailSettingsThunk = (restaurant_id, data) => async () => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/restaurants/${restaurant_id}/monthly-report-email-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error(await readApiError(response, "Failed to update email settings."));
};

export const sendMonthlyReportEmailThunk = (restaurant_id, month, email) => async () => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/restaurants/${restaurant_id}/monthly-report-email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ month, email }),
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error(await readApiError(response, "Failed to send monthly report email."));
};

const initialState = {
  today_sales: null,
  topSellingItems: null,
  restaurant: null,
  sales: null,
  salesDaily: null,
};

const restaurantReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TODAY_SALES:
      return { ...state, today_sales: action.sales };
    case GET_TOP_SELLING_ITEMS:
      return { ...state, topSellingItems: action.topSellingItems };
    case GET_RESTAURANT:
      return { ...state, restaurant: action.restaurant };
    case CHANGE_ONLINE_STATUS:
      return { ...state, restaurant: action.restaurant };
    case CHANGE_MANUAL_STOP_ORDER:
      return { ...state, restaurant: action.restaurant };
    case GET_SALES:
      return { ...state, sales: action.sales };
    case GET_SALES_DAILY:
      return { ...state, salesDaily: action.payload };
    case UPDATE_RESTAURANT_ADDRESS:
      return { ...state, restaurant: action.restaurant };

    default:
      return state;
  }
};

export default restaurantReducer;
