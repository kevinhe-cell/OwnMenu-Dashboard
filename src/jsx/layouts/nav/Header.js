import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown, Form } from "react-bootstrap";
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
import { FaPlus } from "react-icons/fa";
import { Button } from "react-bootstrap";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const userPlan = useSelector((state) => state.session.userPlan);
  const restaurant = useSelector((state) => state.restaurant.restaurant);

  const [loading, setLoading] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);

  // 🔑 Chains & Search State
  const [chains, setChains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentToken, setCurrentToken] = useState(
    localStorage.getItem("ownmenutoken")
  );

  // ===== Helpers =====
  function base64UrlDecode(str) {
    try {
      const s = str.replace(/-/g, "+").replace(/_/g, "/");
      const padded = s.padEnd(s.length + (4 - (s.length % 4)) % 4, "=");
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

  // 🔍 Filtered Chains Logic
  const filteredChains = chains.filter((c) =>
    c.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔑 Fetch chains
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

        if (!res.ok) {
          console.warn("Not a chain user or failed to fetch chains");
          return;
        }

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

  // Restaurant fetch depends on current token
  useEffect(() => {
    if (user?.restaurant_id) {
      dispatch(getRestaurantThunk());
    }
  }, [dispatch, user?.restaurant_id, currentToken]);

  // Switch restaurant
  const handleSwitchRestaurant = (token) => {
    setLoading(true);
    localStorage.setItem("ownmenutoken", token);
    setCurrentToken(token);

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    await dispatch(logout());
    setLoading(false);
    localStorage.removeItem("ownmenu-master");
    localStorage.removeItem("ownmenu-chains");
    localStorage.removeItem("ownmenutoken");
    navigate("/login");
  };

  // Grace warning
  useEffect(() => {
    if (userPlan?.grace_period_end_date) {
      const endDate = new Date(userPlan.grace_period_end_date);

      toast.warn(buildCountdownText(endDate), {
        toastId: "grace-period-warning",
        position: "top-center",
        autoClose: false,
      });

      const interval = setInterval(() => {
        toast.update("grace-period-warning", {
          render: buildCountdownText(endDate),
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userPlan]);

  function buildCountdownText(endDate) {
    const now = new Date();
    let diff = (endDate - now) / 1000;
    if (diff <= 0) return "⚠️ Your plan has expired!";

    const days = Math.floor(diff / 86400);
    diff -= days * 86400;
    const hours = Math.floor(diff / 3600);
    diff -= hours * 3600;
    const minutes = Math.floor(diff / 60);

    return `⚠️ Plan ends in ${days}d ${hours}h ${minutes}m`;
  }

  // Stripe check
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

  // ===== Page name calculation =====
  const path = window.location.pathname.split("/");
  const name = path[path.length - 1].split("-");
  const filterName = name.length >= 3 ? name.filter((n, i) => i > 0) : name;
  const finalName = filterName.filter(
    (n) =>
      ![
        "app", "ui", "uc", "basic", "form", "table", "page",
        "email", "ecom", "chart", "editor",
      ].includes(n)
  );
  const page_name = finalName.join(" ") || "Dashboard";

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />
      
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(255,255,255,0.7)", zIndex: 1050 }}
        >
          <div
            className="spinner-border text-danger"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Stripe hidden banner */}
      {stripeConnectInstance && (
        <div style={{ display: "none" }}>
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectNotificationBanner
              collectionOptions={{
                fields: "currently_due",
                futureRequirements: "include",
              }}
              onNotificationsChange={(response) => {
                if (response.actionRequired > 0 && !toastShown) {
                  toast.warn(
                    <div>
                      ⚠️ <strong>Stripe Action Required</strong>
                      <br />
                      Please update your Stripe account.
                      <br />
                      <button
                        onClick={() => navigate("/payment-onboarding")}
                        className="btn btn-sm btn-outline-light mt-2"
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

      <div className="header">
        <div className="header-content">
          <nav className="navbar navbar-expand">
            <div className="collapse navbar-collapse justify-content-between">
              <div className="header-left">
                <div
                  className="dashboard_bar"
                  style={{ textTransform: "capitalize" }}
                >
                  {page_name}
                </div>
              </div>

              <ul className="navbar-nav header-center align-items-center">
                {page_name.toLowerCase() === "all products" && (
                  <li className="nav-item d-flex align-items-center me-3 gap-2">
                    <Button
                      variant="primary"
                      className="fw-bold shadow-sm px-4 rounded-pill d-none d-sm-block"
                      onClick={() => dispatch(setShowAddModal(true))}
                      style={{ fontSize: "0.9rem" }}
                    >
                      <FaPlus className="me-2" /> Add product
                    </Button>
                    <Button
                      variant="outline-primary"
                      className="fw-bold shadow-sm px-4 rounded-pill d-none d-sm-block"
                      onClick={() => dispatch(setShowCreateGroupModal(true))}
                      style={{ fontSize: "0.9rem" }}
                    >
                      New Group
                    </Button>
                  </li>
                )}
                <Dropdown as="li" className="nav-item header-profile">
                  <Dropdown.Toggle
                    as="a"
                    className="nav-link d-flex align-items-center px-3 py-2 rounded shadow-sm"
                    style={{
                      background: "white",
                      color: "black",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    <div className="d-flex flex-column text-start ms-1">
                      <span className="fw-bold">
                        {chains.length > 0
                          ? chains.find((c) => c.token === currentToken)
                              ?.restaurant_name ||
                            restaurant?.name ||
                            "Dashboard"
                          : restaurant?.name || "Dashboard"}
                      </span>
                      {userPlan?.plan_type && (
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Plan: {userPlan?.plan_type}
                        </small>
                      )}
                    </div>
                    {chains.length > 1 && (
                      <i className="bi bi-caret-down-fill ms-2 small text-muted"></i>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    align="end"
                    className="shadow-sm border-0 p-2"
                    style={{
                      borderRadius: "10px",
                      minWidth: "280px",
                      backgroundColor: "white",
                    }}
                  >
                    {chains.length > 1 && (
                      <>
                        <div className="px-3 py-2 border-bottom">
                          <div
                            className="small text-muted mb-2"
                            style={{ fontWeight: "600", fontSize: "0.75rem" }}
                          >
                            Switch Restaurant
                          </div>
                          
                          {/* 🔍 Search Input */}
                          <div className="position-relative">
                            <Form.Control
                              autoFocus
                              type="text"
                              placeholder="Search restaurant..."
                              className="form-control-sm border-light-subtle mb-1"
                              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              value={searchTerm}
                              onClick={(e) => e.stopPropagation()} // 💡 Stops menu from closing on click
                            />
                            {searchTerm && (
                              <i 
                                className="bi bi-x-circle-fill position-absolute text-muted"
                                style={{ right: '10px', top: '7px', cursor: 'pointer', fontSize: '0.8rem', zIndex: 5 }}
                                onClick={() => setSearchTerm("")}
                              ></i>
                            )}
                          </div>
                        </div>

                        {/* Scrollable wrapper */}
                        <div
                          style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                          }}
                        >
                          {filteredChains.length > 0 ? (
                            filteredChains.map((c, idx) => (
                              <Dropdown.Item
                                key={c.restaurant_id}
                                active={c.token === currentToken}
                                onClick={() => handleSwitchRestaurant(c.token)}
                                className="d-flex align-items-center justify-content-between rounded-2 mb-1"
                                style={{
                                  padding: "10px 14px",
                                  fontWeight: c.token === currentToken ? "600" : "400",
                                  color: c.token === currentToken ? "black" : "#555",
                                  backgroundColor: c.token === currentToken ? "#f1f3f5" : "transparent",
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                <div className="d-flex align-items-center">
                                  <i
                                    className="bi bi-shop me-2"
                                    style={{
                                      fontSize: "1rem",
                                      color: c.token === currentToken ? "black" : "#999",
                                    }}
                                  ></i>
                                  <span className="text-truncate" style={{ maxWidth: '170px' }}>
                                    {c.restaurant_name}
                                  </span>
                                </div>
                                {c.token === currentToken && (
                                  <i className="bi bi-check-lg text-black"></i>
                                )}
                              </Dropdown.Item>
                            ))
                          ) : (
                            <div className="text-center py-3 text-muted small">
                              No restaurants found
                            </div>
                          )}
                        </div>

                        <Dropdown.Divider />
                      </>
                    )}

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="rounded-2 fw-semibold btn-primary text-center"
                      style={{
                        padding: "10px 14px",
                        color: "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
