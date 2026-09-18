import { getToken } from "./utlits";

const GET_WAITLISTS = "session/getWaitlists";

const getWaitlists = (payload) => {
  return {
    type: GET_WAITLISTS,
    payload,
  };
};

export const getWaitlistsThunk = (restaurantId, page) => async (dispatch) => {
  const token = getToken();
  const response = await fetch(
    `/api/waitlists/all/${restaurantId}?page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  dispatch(getWaitlists(data));
  return response;
};

const initialState = { waitlists: [] };

export default function waitlistsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_WAITLISTS:
      return {
        ...state,
        waitlists: action.payload,
      };
    default:
      return state;
  }
}
