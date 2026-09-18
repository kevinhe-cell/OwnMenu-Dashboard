import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import ordersReducer from "./orders";
import sessionReducer from "./session";
import itemsReducer from "./items";
import categoriesReducer from "./categories";
import attributesReducer from "./attributes";
import feesReducer from "./fees";
import notificationReducer from "./notifications";
import restaurantReducer from "./restaurants";
import stripeReducer from "./stripe";
import customersReducer from "./customers";
import waitlistsReducer from "./waitlists";
import couponsReducer from "./coupons";
import freeitemsReducer from "./freeitems";
import printersReducer from "./printers";
import kiosksReducer from "./kiosks";
import rewardsReducer from "./rewards";
import specialItemsReducer from "./specialItems";
import hoursReducer from "./Hours";
import homepageReducer from "./homepagesettings";
import domainsReducer from "./domains";
import seoReducer from "./seo";
import passcodeReducer from "./paymentaccesscode";
import pagesReducer from "./pages";
import itemGroupsReducer from "./itemgroups";
import instagramReducer from "./instagram";
import facebookReducer from "./facebook";
import specialHoursReducer from "./specialHours";
import customizablePizzasReducer from "./customizablePizza";
import crustTypesReducer from "./crustTypes";
import toppingsReducer from "./toppings";
import blockedPhonesReducer from "./blockedPhones";
import chainDashboardReducer from "./chainDashboard";

const appReducer = combineReducers({
  // add reducer functions here
  session: sessionReducer,
  orders: ordersReducer,
  items: itemsReducer,
  categories: categoriesReducer,
  attributes: attributesReducer,
  fees: feesReducer,
  notifications: notificationReducer,
  restaurant: restaurantReducer,
  stripe: stripeReducer,
  customers: customersReducer,
  waitlists: waitlistsReducer,
  coupons: couponsReducer,
  freeItems: freeitemsReducer,
  printers: printersReducer,
  kiosks: kiosksReducer,
  rewards: rewardsReducer,
  specialItems: specialItemsReducer,
  hours: hoursReducer,
  homepage: homepageReducer,
  domains: domainsReducer,
  seo: seoReducer,
  passcode: passcodeReducer,
  pages: pagesReducer,
  itemgroup: itemGroupsReducer,
  instagram: instagramReducer,
  facebook: facebookReducer,
  specialHours: specialHoursReducer,
  customizablePizzas: customizablePizzasReducer,
  crustTypes: crustTypesReducer,
  toppings: toppingsReducer,
  blockedPhones: blockedPhonesReducer,
  chainDashboard: chainDashboardReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "session/removeUser") {
    localStorage.removeItem("token"); // optional cleanup
    return appReducer(undefined, action); // reset all slices
  }
  return appReducer(state, action);
};

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
