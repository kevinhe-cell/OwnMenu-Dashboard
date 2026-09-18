const SET_NOTIFICATION = "SET_NOTIFICATION";

export const setNotification = (data, status) => ({
  type: SET_NOTIFICATION,
  notificationStatus: status,
  data,
});

const initialState = {
  data: null,
  notificationStatus: false,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case SET_NOTIFICATION:
      return {
        ...state,
        data: action.data,
        notificationStatus: action.notificationStatus,
      };
    default:
      return state;
  }
}
