import { getToken } from "./utlits";

// --- Action Types ---
const GET_CRUSTS = "crustTypes/GET_CRUSTS";
const CREATE_CRUST = "crustTypes/CREATE_CRUST";
const UPDATE_CRUST = "crustTypes/UPDATE_CRUST";
const DELETE_CRUST = "crustTypes/DELETE_CRUST";

// --- Action Creators ---
const getCrusts = (crusts) => ({
  type: GET_CRUSTS,
  crusts,
});

const createCrust = (crustType) => ({
  type: CREATE_CRUST,
  crustType,
});

const updateCrust = (crustType) => ({
  type: UPDATE_CRUST,
  crustType,
});

const deleteCrust = (crustId) => ({
  type: DELETE_CRUST,
  crustId,
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
  
  if (data.price === undefined || data.price === null || data.price === '') {
    throw new Error('Price is required');
  }
  
  formData.append("name", data.name);
  formData.append("detail", data.detail || "");
  formData.append("chinese", data.chinese || "");
  formData.append("price", data.price);
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

// Get all crusts
export const getCrustsThunk = () => async (dispatch) => {
  const res = await fetch(`/api/crust-types`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  
  if (res.ok) {
    const data = await res.json();
    dispatch(getCrusts(data.crustTypes));
  }
};

// Create Crust (Handles File Upload)
export const createCrustThunk = (data, file) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  try {
    const formData = prepareFormData(data, file);
    

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const res = await fetch(`/api/crust-types`, {
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
      dispatch(createCrust(data.crustType));
      return data.crustType;
    } else {
      const errors = await res.json();
      console.error('Crust creation errors:', errors);
      return errors;
    }
  } catch (error) {
    console.error("Error in createCrustThunk:", error);
    throw error;
  }
};

// Update Crust (Handles File Upload)
export const updateCrustThunk = (id, data, file) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const formData = prepareFormData(data, file);

  const res = await fetch(`/api/crust-types/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(updateCrust(data.crustType));
    return data.crustType;
  } else {
    const errors = await res.json();
    return errors;
  }
};

// Delete Crust
export const deleteCrustThunk = (id) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/crust-types/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    dispatch(deleteCrust(id));
  }
};

// --- Reducer ---
const initialState = { allCrusts: [] };

const crustTypesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CRUSTS:
      return { ...state, allCrusts: action.crusts };

    case CREATE_CRUST:
      return {
        ...state,
        allCrusts: [...state.allCrusts, action.crustType],
      };

    case UPDATE_CRUST:
      return {
        ...state,
        allCrusts: state.allCrusts.map((crust) =>
          crust.id === action.crustType.id ? action.crustType : crust
        ),
      };

    case DELETE_CRUST:
      return {
        ...state,
        allCrusts: state.allCrusts.filter((crust) => crust.id !== action.crustId),
      };

    default:
      return state;
  }
};

export default crustTypesReducer;
