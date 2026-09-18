import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getUserPlanThunk, logout } from "../../../store/session";
import { getRestaurantThunk } from "../../../store/restaurants";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectNotificationBanner,
} from "@stripe/react-connect-js";
import { getToken } from "../../../store/utlits";
import { setShowAddModal, setShowCreateGroupModal } from "../../../store/items";
import { FaPlus, FaSearch, FaSignOutAlt, FaStore, FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Languages, Menu as MenuIcon, ChevronDown } from "lucide-react";
import { NavMenuToggle } from "./NavHader";
import "./HeaderPremium.css";
import "./ShellChrome.css";

function base64UrlDecode(str) {
  try {
    const s = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = s.padEnd(s.length + ((4 - (s.length % 4)) % 4), "=");
    return atob(padded);
  } catch {
    return "";
  }
}

function getRestaurantIdFromToken(token) {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return payload?.data?.restaurant_id ?? null;
  } catch {
    return null;
  }
}

const HeaderPremium = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = useSelector((state) => state.session.user);
  const userPlan = useSelector((state) => state.session.userPlan);
  const restaurant = useSelector((state) => state.restaurant.restaurant);

  const [loading, setLoading] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);

  const [chains, setChains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentToken, setCurrentToken] = useState(
    localStorage.getItem("ownmenutoken")
  );

  const filteredChains = chains.filter((c) =>
    c.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchChains = async () => {
      try {
        const existingMaster = localStorage.getItem("ownmenu-master");
        const fallbackToken = localStorage.getItem("ownmenutoken");
        const tokenToUse = existingMaster || fallbackToken;
        if (!tokenToUse) return;

        const res = await fetch(`/api/session/chain-users/tokens`, {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data?.tokens) && data.tokens.length > 0) {
          localStorage.setItem("ownmenu-chains", JSON.stringify(data.tokens));
          setChains(data.tokens);

          if (!existingMaster) {
            localStorage.setItem("ownmenu-master", tokenToUse);
          }

          const storedToken = localStorage.getItem("ownmenutoken");
          const storedRestaurantId = storedToken
            ? getRestaurantIdFromToken(storedToken)
            : null;

          const match = storedRestaurantId
            ? data.tokens.find((c) => c.restaurant_id === storedRestaurantId)
            : null;

          if (match) {
            setCurrentToken(storedToken);
          } else {
            localStorage.setItem("ownmenutoken", data.tokens[0].token);
            setCurrentToken(data.tokens[0].token);
          }
        }
      } catch (err) {
        console.error("Failed to fetch chains:", err);
      }
    };

    fetchChains();
    dispatch(getUserPlanThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user?.restaurant_id) {
      dispatch(getRestaurantThunk());
    }
  }, [dispatch, user?.restaurant_id, currentToken]);

  const handleSwitchRestaurant = (token) => {
    setLoading(true);
    localStorage.setItem("ownmenutoken", token);
    setCurrentToken(token);

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleLogout = async () => {
    setLoading(true);
    await dispatch(logout());
    setLoading(false);
    localStorage.removeItem("ownmenu-master");
    localStorage.removeItem("ownmenu-chains");
    localStorage.removeItem("ownmenutoken");
    navigate("/login");
  };

  useEffect(() => {
    if (userPlan?.stripe_onboarded) return;

    const fetchStripeInstance = async () => {
      const token = getToken();
      if (!token) return;

      const res = await fetch("/api/stripe/account_session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return;
      const { client_secret } = await res.json();

      const instance = await loadConnectAndInitialize({
        publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret: () => Promise.resolve(client_secret),
      });
      setStripeConnectInstance(instance);
    };

    fetchStripeInstance();
  }, [userPlan?.stripe_onboarded]);

  const path = window.location.pathname.split("/");
  const page_name =
    path[path.length - 1]
      .split("-")
      .filter((n) => !["app", "ui", "uc"].includes(n))
      .join(" ") || "Dashboard";

  const pageTitle = t(
    `header.${page_name.toLowerCase().replace(/ /g, "_")}`,
    page_name
  );

  const restaurantLabel =
    chains.length > 0
      ? chains.find((c) => c.token === currentToken)?.restaurant_name ||
        restaurant?.name
      : restaurant?.name || t("header.dashboard");

  const restaurantInitial = (
    String(restaurantLabel || "")
      .trim()
      .charAt(0) || "O"
  ).toUpperCase();

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />

      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(255,255,255,0.7)", zIndex: 1050 }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {stripeConnectInstance && (
        <div style={{ display: "none" }}>
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectNotificationBanner
              onNotificationsChange={(response) => {
                if (response.actionRequired > 0 && !toastShown) {
                  toast.warn(
                    <div>
                      ⚠️ <strong>Stripe Action Required</strong>
                      <br /> Please update your Stripe account.
                      <br />
                      <button
                        onClick={() => navigate("/payment-onboarding")}
                        className="btn btn-sm btn-primary mt-2"
                      >
                        View Stripe
                      </button>
                    </div>,
                    {
                      autoClose: false,
                      toastId: "stripe-action-required",
                      position: "top-center",
                    }
                  );
                  setToastShown(true);
                }
              }}
            />
          </ConnectComponentsProvider>
        </div>
      )}

      <header className="header om-header">
        <div className="om-header-inner">
          <div className="om-header-left">
            <button
              type="button"
              className="om-header-menu-btn"
              aria-label="Toggle menu"
              onClick={() => NavMenuToggle()}
            >
              <MenuIcon size={18} strokeWidth={2.25} />
            </button>
            <div className="om-header-crumbs">
              <span>Pages</span>
              <span className="om-crumb-sep">/</span>
              <span className="om-crumb-current">{pageTitle}</span>
            </div>
          </div>

          <div className="om-header-right">
            {page_name.toLowerCase() === "all products" && (
              <div className="d-none d-lg-flex gap-2 me-1">
                <Button
                  variant="primary"
                  className="rounded-pill px-3 py-1 shadow-sm fw-semibold border-0"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => dispatch(setShowAddModal(true))}
                >
                  <FaPlus className="me-1" size={11} /> {t("header.add_product")}
                </Button>
                <Button
                  variant="light"
                  className="rounded-pill px-3 py-1 border shadow-sm fw-semibold"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => dispatch(setShowCreateGroupModal(true))}
                >
                  {t("header.new_group")}
                </Button>
              </div>
            )}

            <Dropdown align="end" className="om-header-lang">
              <Dropdown.Toggle
                variant="link"
                id="om-lang-toggle"
                className="om-header-icon"
                aria-label="Language"
              >
                <Languages size={15} />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="shadow-lg border-0 mt-2 p-1 rounded-lg"
                style={{ minWidth: "120px" }}
              >
                <Dropdown.Item
                  onClick={() => i18n.changeLanguage("en")}
                  className={`rounded mb-1 ${
                    i18n.language === "en" ? "fw-bold" : ""
                  }`}
                  style={{
                    fontSize: "0.85rem",
                    backgroundColor:
                      i18n.language === "en" ? "#fce7f0" : "transparent",
                    color: i18n.language === "en" ? "#dd2f6e" : undefined,
                  }}
                >
                  English
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => i18n.changeLanguage("zh")}
                  className={`rounded ${
                    i18n.language.startsWith("zh") ? "fw-bold" : ""
                  }`}
                  style={{
                    fontSize: "0.85rem",
                    backgroundColor: i18n.language.startsWith("zh")
                      ? "#fce7f0"
                      : "transparent",
                    color: i18n.language.startsWith("zh")
                      ? "#dd2f6e"
                      : undefined,
                  }}
                >
                  中文
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown align="end" className="om-header-account">
              <Dropdown.Toggle
                variant="link"
                id="om-account-toggle"
                className="om-header-profile"
              >
                <div className="om-header-avatar" aria-hidden>
                  {restaurantInitial}
                </div>
                <span className="om-header-name">{restaurantLabel}</span>
                {chains.length > 1 && (
                  <ChevronDown
                    className="om-header-caret"
                    size={14}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow-lg border-0 mt-2 p-2 rounded-xl"
                style={{ minWidth: "280px" }}
              >
                {chains.length > 1 && (
                  <div className="p-3 border-bottom mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fw-bold small text-muted text-uppercase">
                        {t("header.switch_shop")}
                      </span>
                      <FaStore className="text-muted" />
                    </div>
                    <div className="position-relative mb-2">
                      <FaSearch
                        className="position-absolute text-muted"
                        style={{ left: "12px", top: "10px" }}
                        size={12}
                      />
                      <Form.Control
                        type="text"
                        placeholder={t("header.search_restaurants")}
                        className="form-control-sm ps-5 border-light bg-light"
                        style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                      {filteredChains.map((c) => (
                        <div
                          key={c.restaurant_id}
                          onClick={() => handleSwitchRestaurant(c.token)}
                          className="d-flex align-items-center justify-content-between p-2 mt-1 rounded-lg"
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              c.token === currentToken ? "#fce7f0" : "transparent",
                            color:
                              c.token === currentToken ? "#dd2f6e" : undefined,
                            fontWeight: c.token === currentToken ? 700 : 400,
                          }}
                        >
                          <span
                            className="text-truncate"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {c.restaurant_name}
                          </span>
                          {c.token === currentToken && <FaCheck size={12} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Dropdown.Item
                  onClick={() => navigate("/account")}
                  className="d-flex align-items-center gap-3 p-3 rounded-lg"
                >
                  <div className="p-2 rounded bg-light text-primary">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <span className="fw-medium">
                    {t("header.account_settings")}
                  </span>
                </Dropdown.Item>

                <div className="p-2">
                  <Button
                    variant="outline-danger"
                    className="w-100 rounded-lg py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt size={14} /> {t("header.logout")}
                  </Button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderPremium;
