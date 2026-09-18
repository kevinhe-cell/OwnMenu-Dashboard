import { updateTipThunk } from "./orders";
import { getToken } from "./utlits";

const GET_STRIPE_ACCOUNT = "session/getStripeAccount";

const apiUrl = "https://hutaoadmin.onrender.com";

const getStripeAccount = (payload) => {
  return {
    type: GET_STRIPE_ACCOUNT,
    payload,
  };
};

export const updatePaymentIntentThunk =
  (paymentIntentId, tipAmount, id, restaurant_id) => async (dispatch) => {
    const response = await fetch(`${apiUrl}/api/stripe/update-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ paymentIntentId, tipAmount }),
    });
    const data = await response.json();
    if (data.status === "success") {
      dispatch(updateTipThunk(id, tipAmount, restaurant_id));
    }
    return response;
  };

export const getStripeAccountThunk = () => async (dispatch) => {
  const token = getToken();
  const response = await fetch(`${apiUrl}/api/stripe/account_session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  dispatch(getStripeAccount(data));
  return response;
};

export default function stripeReducer(state = {}, action) {
  switch (action.type) {
    case GET_STRIPE_ACCOUNT:
      return action.payload;
    default:
      return state;
  }
}
//
