import { getToken } from "./utlits";

const GET_HOURS = "hours/GET_HOURS";
const UPDATE_REGULAR_HOURS = "hours/UPDATE_REGULAR_HOURS";
const UPDATE_TIMEZONE = "hours/UPDATE_TIMEZONE";

const getHours = (hours) => ({
  type: GET_HOURS,
  hours,
});

export const updateRegularHours = (hours) => ({
  type: UPDATE_REGULAR_HOURS,
  hours,
});

const updateTimezone = (timezone) => ({
  type: UPDATE_TIMEZONE,
  timezone,
});

export const fetchHours = (restaurantId) => async (dispatch) => {
  const token = getToken();

  const response = await fetch(`/api/restaurants/hours/${restaurantId}`, {
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const hours = await response.json();
    dispatch(getHours(hours));
  }
};

export const updateRegularHoursThunk =
  (restaurantId, day, open, close, breakStart, breakEnd, fullTimeString) =>
  async (dispatch) => {
    const token = getToken();

    try {
      const res = await fetch(
        `/api/restaurants/regular_hours/${restaurantId}/`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day,
            open,
            close,
            breakStart,
            breakEnd,
            fullTime: fullTimeString, // 👈 new field
          }),
        },
      );

      if (res.ok) {
        dispatch(fetchHours(restaurantId));
      }
    } catch (err) {
      console.error("Failed to update hours:", err);
    }
  };

export const updateTimezoneThunk =
  (restaurantId, timezone) => async (dispatch) => {
    const token = getToken();

    const response = await fetch(`/api/restaurants/timezone/${restaurantId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time_zone: timezone }),
    });

    if (response.ok) {
      const hours = await response.json();
      dispatch(updateTimezone(hours));
    }
  };

const initialState = {
  hours: [],
};

const hoursReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_HOURS:
      return {
        ...state,
        hours: action.hours,
      };
    case UPDATE_REGULAR_HOURS:
      return {
        ...state,
        hours: {
          ...state.hours, // Retain the existing hours
          ...action.hours, // Merge the updated hours
        },
      };
    case UPDATE_TIMEZONE:
      return {
        ...state,
        hours: {
          ...state.hours, // Retain the existing hours
          time_zone: action.timezone.time_zone, // Update only the time zone
        },
      };
    default:
      return state;
  }
};

export default hoursReducer;
