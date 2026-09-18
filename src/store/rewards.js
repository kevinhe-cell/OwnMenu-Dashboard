import { getToken } from "./utlits";

const GET_REWARDS = "rewards/GET_REWARDS";
const CREATE_REWARD = "rewards/CREATE_REWARD";
const DELETE_REWARD = "rewards/DELETE_REWARD";
const ORDER_HISTORY = "rewards/ORDER_HISTORY";

const getRewards = (rewards) => ({
  type: GET_REWARDS,
  rewards,
});

const createReward = (reward) => ({
  type: CREATE_REWARD,
  reward,
});

const deleteReward = (rewardId) => ({
  type: DELETE_REWARD,
  rewardId,
});

const orderHistory = (orders) => ({
  type: ORDER_HISTORY,
  orders,
});

export const getRewardsThunk = () => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/rewards/admin`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const rewards = await response.json();
    dispatch(getRewards(rewards));
  }
};

export const createRewardThunk = (reward) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/rewards/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reward_type: reward.reward_type,
      item_id: reward.reward_type === "free_item" ? reward.item_id : null,
      discount_amount:
        reward.reward_type === "fixed_amount" ? reward.discount_amount : null,
      need_amount: reward.need_amount,
      quantity: reward.quantity,
    }),
  });

  if (response.ok) {
    const newReward = await response.json();
    dispatch(createReward(newReward));
  }
};


export const deleteRewardThunk = (rewardId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(`/api/rewards/restaurant/${rewardId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    dispatch(deleteReward(rewardId));
  }
};

export const orderHistoryThunk = (customerId, page) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch(
    `/api/rewards/user/${customerId}/orders?page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.ok) {
    const orders = await response.json();
    dispatch(orderHistory(orders));
    return orders;
  }
};

const initialState = {};

const rewardsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REWARDS:
      return { ...state, rewards: action.rewards };
    case CREATE_REWARD:
      return { ...state, rewards: [...state.rewards, action.reward] };
    case DELETE_REWARD:
      return {
        ...state,
        rewards: state.rewards.filter(
          (reward) => reward.id !== action.rewardId,
        ),
      };
    case ORDER_HISTORY:
      return { ...state, orderHistory: action.orders };
    default:
      return state;
  }
};

export default rewardsReducer;
