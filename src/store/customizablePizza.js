import { getToken } from "./utlits";

// Action Types
const GET_PIZZAS = "pizzas/GET_PIZZAS";
const GET_SINGLE_PIZZA = "pizzas/GET_SINGLE_PIZZA";
const CREATE_PIZZA = "pizzas/CREATE_PIZZA";
const UPDATE_PIZZA = "pizzas/UPDATE_PIZZA";
const DELETE_PIZZA = "pizzas/DELETE_PIZZA";

// Action Creators
const getPizzas = (pizzas) => ({
  type: GET_PIZZAS,
  pizzas,
});

const getSinglePizza = (pizza) => ({
  type: GET_SINGLE_PIZZA,
  pizza,
});

const createPizza = (pizza) => ({
  type: CREATE_PIZZA,
  pizza,
});

const updatePizza = (pizza) => ({
  type: UPDATE_PIZZA,
  pizza,
});

const deletePizza = (pizzaId) => ({
  type: DELETE_PIZZA,
  pizzaId,
});

// Thunks

// Get all pizzas
export const getPizzasThunk = () => async (dispatch) => {
  const token = getToken();
  // Note: GET requests might not strictly need a token depending on your auth middleware 
  // for the specific route, but we include it to match your pattern.
  
  const res = await fetch(`/api/customizable-pizzas`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      ...(token && { authorization: `Bearer ${token}` }),
    },
  });

  if (res.ok) {
    const data = await res.json();
    // Backend returns { pizzas: [...] }
    dispatch(getPizzas(data.pizzas));
  }
};

// Get specific pizza details
export const getPizzaByIdThunk = (id) => async (dispatch) => {
  const token = getToken();
  
  const res = await fetch(`/api/customizable-pizzas/${id}`, {
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      ...(token && { authorization: `Bearer ${token}` }),
    },
  });

  if (res.ok) {
    const data = await res.json();
    // Backend returns { pizza: {...} }
    dispatch(getSinglePizza(data.pizza));
  }
};

// Create a new pizza
export const createPizzaThunk = (pizzaData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/customizable-pizzas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pizzaData),
  });

  if (res.ok) {
    const data = await res.json();
    // Backend returns { pizza: {...} }
    dispatch(createPizza(data.pizza));
    return data.pizza;
  }
};

// Update an existing pizza
export const updatePizzaThunk = (pizzaId, pizzaData) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/customizable-pizzas/${pizzaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pizzaData),
  });

  if (res.ok) {
    const data = await res.json();
    // Backend returns { pizza: {...} }
    dispatch(updatePizza(data.pizza));
    return data.pizza;
  }
};

// Delete a pizza
export const deletePizzaThunk = (pizzaId) => async (dispatch) => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`/api/customizable-pizzas/${pizzaId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
      authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    dispatch(deletePizza(pizzaId));
  }
};

// Initial State
// allPizzas will store the list, singlePizza stores the detailed view if needed
const initialState = { allPizzas: [], singlePizza: null };

// Reducer
const customizablePizzasReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PIZZAS:
      return { ...state, allPizzas: action.pizzas };
      
    case GET_SINGLE_PIZZA:
      return { ...state, singlePizza: action.pizza };

    case CREATE_PIZZA:
      return {
        ...state,
        allPizzas: [...state.allPizzas, action.pizza],
      };

    case UPDATE_PIZZA:
      return {
        ...state,
        allPizzas: state.allPizzas.map((pizza) =>
          pizza.id === action.pizza.id ? action.pizza : pizza
        ),
        // If the updated pizza is currently being viewed as singlePizza, update that too
        singlePizza:
          state.singlePizza && state.singlePizza.id === action.pizza.id
            ? action.pizza
            : state.singlePizza,
      };

    case DELETE_PIZZA:
      return {
        ...state,
        allPizzas: state.allPizzas.filter((pizza) => pizza.id !== action.pizzaId),
        // If deleted pizza was the single view, clear it
        singlePizza:
          state.singlePizza && state.singlePizza.id === action.pizzaId
            ? null
            : state.singlePizza,
      };

    default:
      return state;
  }
};

export default customizablePizzasReducer;
