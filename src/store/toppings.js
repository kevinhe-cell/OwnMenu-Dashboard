import { getToken } from "./utlits";

// --- Action Types ---
const GET_TOPPINGS = "toppings/GET_TOPPINGS";
const CREATE_TOPPING = "toppings/CREATE_TOPPING";
const UPDATE_TOPPING = "toppings/UPDATE_TOPPING";
const DELETE_TOPPING = "toppings/DELETE_TOPPING";

// --- Action Creators ---
const getToppings = (toppings) => ({
  type: GET_TOPPINGS,
  toppings,
});

const createTopping = (topping) => ({
  type: CREATE_TOPPING,
  topping,
});

const updateTopping = (topping) => ({
  type: UPDATE_TOPPING,
  topping,
});

const deleteTopping = (toppingId) => ({
  type: DELETE_TOPPING,
  toppingId,
});

// --- Helper: Prepare FormData ---
const prepareFormData = (data, file) => {
  const formData = new FormData();
  
  // 确保必需字段存在
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required');
  }
  
  if (!data.customizablePizzaId) {
    throw new Error('Customizable pizza ID is required');
  }
  
  formData.append("name", data.name);
  formData.append("detail", data.detail || "");
  formData.append("chinese", data.chinese || "");
  formData.append("position", data.position || "all");
  formData.append("portion", data.portion || "normal");
  formData.append("price", data.price || 0);
  formData.append("quantity", data.quantity || 1);
  formData.append("isDefault", data.isDefault || false);
  // 确保 customizablePizzaId 是整数类型
  formData.append("customizablePizzaId", parseInt(data.customizablePizzaId, 10));
  
  if (file) {
    formData.append("photo", file);
  }
  return formData;
};

// --- Thunks ---

// Get all toppings
export const getToppingsThunk = () => async (dispatch) => {
  const res = await fetch(`/api/toppings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  
  if (res.ok) {
    const data = await res.json();
    dispatch(getToppings(data.toppings));
  }
};

// Create Topping (Handles File Upload)
export const createToppingThunk = (data, file) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  try {
    const formData = prepareFormData(data, file);
    
    console.log('Sending topping data:', data);
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const res = await fetch(`/api/toppings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // NOTE: Do NOT set Content-Type to application/json manually. 
        // The browser sets it to multipart/form-data with the correct boundary automatically.
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(createTopping(data.topping));
      return data.topping;
    } else {
      const errors = await res.json();
      console.error('Topping creation errors:', errors);
      return errors;
    }
  } catch (error) {
    console.error("Error in createToppingThunk:", error);
    throw error;
  }
};

// Update Topping (Handles File Upload)
export const updateToppingThunk = (id, data, file) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const formData = prepareFormData(data, file);

  const res = await fetch(`/api/toppings/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(updateTopping(data.topping));
    return data.topping;
  } else {
    const errors = await res.json();
    return errors;
  }
};

// Delete Topping
export const deleteToppingThunk = (id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/toppings/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    dispatch(deleteTopping(id));
  }
};

// --- Reducer ---
const initialState = { allToppings: [] };

const toppingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TOPPINGS:
      return { ...state, allToppings: action.toppings };

    case CREATE_TOPPING:
      return {
        ...state,
        allToppings: [...state.allToppings, action.topping],
      };

    case UPDATE_TOPPING:
      return {
        ...state,
        allToppings: state.allToppings.map((topping) =>
          topping.id === action.topping.id ? action.topping : topping
        ),
      };

    case DELETE_TOPPING:
      return {
        ...state,
        allToppings: state.allToppings.filter((topping) => topping.id !== action.toppingId),
      };

    default:
      return state;
  }
};

export default toppingsReducer;
