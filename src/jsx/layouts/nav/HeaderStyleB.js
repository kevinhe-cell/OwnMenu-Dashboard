import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getUserPlanThunk, logout } from "../../../store/session";
import { getRestaurantThunk } from "../../../store/restaurants";
import { setShowAddModal } from "../../../store/items";
import { FaPlus, FaSearch, FaSignOutAlt, FaStore, FaCheck, FaBolt } from "react-icons/fa";

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

/**
 * HeaderStyleB - PRODUCTIVITY LAYOUT
 */
const HeaderStyleB = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const restaurant = useSelector((state) => state.restaurant.restaurant);

  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState([]);
  const [currentToken, setCurrentToken] = useState(
    localStorage.getItem("ownmenutoken")
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
          if (!existingMaster) localStorage.setItem("ownmenu-master", tokenToUse);
          const storedToken = localStorage.getItem("ownmenutoken");
          const storedRestaurantId = storedToken ? getRestaurantIdFromToken(storedToken) : null;
          const match = storedRestaurantId ? data.tokens.find((c) => c.restaurant_id === storedRestaurantId) : null;
          if (match) setCurrentToken(storedToken);
          else {
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
    if (user?.restaurant_id) dispatch(getRestaurantThunk());
  }, [dispatch, user?.restaurant_id, currentToken]);

  const handleSwitchRestaurant = (token) => {
    setLoading(true);
    localStorage.setItem("ownmenutoken", token);
    setCurrentToken(token);
    setTimeout(() => window.location.reload(), 300);
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

  const path = window.location.pathname.split("/");
  const page_name = path[path.length - 1].split("-").filter(n => !["app", "ui", "uc"].includes(n)).join(" ") || "Dashboard";

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(255,255,255,0.7)", zIndex: 1050 }}>
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
        </div>
      )}

      <div className="header shadow-sm bg-white" style={{ borderBottom: '1px solid #edf2f7' }}>
        <div className="header-content px-4">
          <nav className="navbar navbar-expand justify-content-between py-3">
            <div className="d-flex align-items-center gap-4">
              <div className="page-title d-none d-lg-block">
                <h2 className="mb-0 fw-black text-dark text-uppercase tracking-tighter" style={{ fontSize: '1.25rem' }}>{page_name}</h2>
              </div>
              
              <div className="search-tool d-none d-md-flex align-items-center bg-light rounded-lg px-3 py-2 border" style={{ minWidth: '350px' }}>
                <FaSearch className="text-muted me-2" size={14} />
                <input type="text" className="bg-transparent border-0 outline-none w-100 small" placeholder="Quick find orders, products, or customers..." style={{ outline: 'none' }} />
                <span className="badge bg-white border text-muted ms-2 fw-normal" style={{ fontSize: '0.65rem' }}>⌘ K</span>
              </div>
            </div>

            <div className="header-right d-flex align-items-center gap-3">
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="p-2.5 rounded-lg bg-primary text-white cursor-pointer shadow-sm hover:brightness-110">
                  <FaBolt size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg border-0 mt-3 p-2 rounded-xl" style={{ minWidth: '220px' }}>
                  <div className="p-2 mb-1"><span className="text-muted uppercase small fw-bold tracking-widest">Quick Actions</span></div>
                  <Dropdown.Item className="rounded-lg py-2" onClick={() => dispatch(setShowAddModal(true))}><FaPlus className="me-2 text-primary" /> Create New Product</Dropdown.Item>
                  <Dropdown.Item className="rounded-lg py-2" onClick={() => navigate("/all-orders")}><FaStore className="me-2 text-success" /> View Recent Orders</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <div className="vr d-none d-sm-block bg-gray-200 my-2 mx-1" style={{ width: '1px' }}></div>

              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="cursor-pointer d-flex align-items-center gap-2 p-1.5 pe-3 rounded-lg hover:bg-light transition-all border border-transparent hover:border-light">
                  <div className="w-9 h-9 rounded-lg bg-dark text-white d-flex align-items-center justify-center font-black">
                    {chains.length > 0 ? chains.find((c) => c.token === currentToken)?.restaurant_name?.charAt(0) : restaurant?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="d-none d-md-block text-start">
                    <div className="fw-bold text-dark leading-none" style={{ fontSize: '0.85rem' }}>
                        {chains.length > 0 ? chains.find((c) => c.token === currentToken)?.restaurant_name || restaurant?.name : restaurant?.name || "Dashboard"}
                    </div>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 mt-2 p-2 rounded-xl" style={{ minWidth: '280px' }}>
                  {chains.length > 1 && (
                     <div className="p-3 bg-light/50 rounded-lg mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                           <span className="small fw-bold text-muted">MY SHOPS</span>
                           <span className="badge bg-white text-dark border">{chains.length}</span>
                        </div>
                        <div className="overflow-auto" style={{ maxHeight: '180px' }}>
                           {chains.map(c => (
                              <div key={c.restaurant_id} onClick={() => handleSwitchRestaurant(c.token)} 
                                 className={`p-2 rounded-md mb-1 cursor-pointer d-flex align-items-center justify-content-between
                                 ${c.token === currentToken ? 'bg-white shadow-sm border border-primary/20 text-primary fw-bold' : 'hover:bg-white/80'}`}>
                                 <span className="small text-truncate">{c.restaurant_name}</span>
                                 {c.token === currentToken && <FaCheck size={10} />}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                  <Dropdown.Item onClick={() => navigate("/account")} className="rounded-lg py-2 mt-1 fw-medium">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-danger fw-bold py-2" onClick={handleLogout}><FaSignOutAlt className="me-2" /> Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default HeaderStyleB;
