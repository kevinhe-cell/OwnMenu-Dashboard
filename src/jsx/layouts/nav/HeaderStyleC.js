import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getUserPlanThunk, logout } from "../../../store/session";
import { getRestaurantThunk } from "../../../store/restaurants";
import { FaSearch, FaCheck, FaBell, FaUserCircle } from "react-icons/fa";

// ===== Helpers =====
function base64UrlDecode(str) {
  try {
    const s = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = s.padEnd(s.length + (4 - (s.length % 4)) % 4, "=");
    return atob(padded);
  } catch { return ""; }
}

function getRestaurantIdFromToken(token) {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return payload?.data?.restaurant_id ?? null;
  } catch { return null; }
}

/**
 * HeaderStyleC - MINIMALIST CENTRED
 */
const HeaderStyleC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const restaurant = useSelector((state) => state.restaurant.restaurant);

  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState([]);
  const [currentToken, setCurrentToken] = useState(localStorage.getItem("ownmenutoken"));

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
          const storedToken = localStorage.getItem("ownmenutoken");
          const storedRestaurantId = storedToken ? getRestaurantIdFromToken(storedToken) : null;
          const match = storedRestaurantId ? data.tokens.find((c) => c.restaurant_id === storedRestaurantId) : null;
          if (match) setCurrentToken(storedToken);
          else {
            localStorage.setItem("ownmenutoken", data.tokens[0].token);
            setCurrentToken(data.tokens[0].token);
          }
        }
      } catch (err) { console.error(err); }
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
    localStorage.removeItem("ownmenu-master");
    localStorage.removeItem("ownmenu-chains");
    localStorage.removeItem("ownmenutoken");
    navigate("/login");
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-white/50 z-[1050] d-flex justify-content-center align-items-center">
          <div className="spinner-grow text-dark"></div>
        </div>
      )}

      <div className="header bg-transparent border-0" style={{ height: '80px' }}>
        <div className="header-content h-100 px-5">
          <nav className="navbar h-100 d-flex justify-content-between align-items-center">
            {/* Left: Branding */}
            <div className="d-flex align-items-center">
               <span className="fw-black text-dark tracking-[4px] uppercase" style={{ fontSize: '1.4rem' }}>
                  {chains.length > 0 ? chains.find(c => c.token === currentToken)?.restaurant_name?.slice(0, 3) : restaurant?.name?.slice(0, 3) || 'OWN'}
               </span>
            </div>

            {/* Middle: Centered Search */}
            <div className="flex-grow-1 d-flex justify-content-center">
               <div className="position-relative w-100 max-w-[500px]">
                  <FaSearch className="position-absolute text-muted" style={{ left: '16px', top: '14px' }} size={14} />
                  <Form.Control 
                     type="text" 
                     placeholder="Search across your dashboard..." 
                     className="rounded-full border-0 bg-white shadow-sm py-2.5 ps-5"
                     style={{ border: '1px solid #f1f5f9' }}
                  />
               </div>
            </div>

            {/* Right: Profile & Notifications */}
            <div className="d-flex align-items-center gap-3">
               <div className="p-2 cursor-pointer text-muted hover:text-dark transition-colors position-relative">
                  <FaBell size={20} />
                  <span className="position-absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
               </div>
               
               <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="cursor-pointer d-flex align-items-center gap-2">
                     <div className="w-10 h-10 rounded-full bg-light d-flex align-items-center justify-content-center border-2 border-white shadow-sm overflow-hidden">
                        <FaUserCircle size={28} className="text-gray-400" />
                     </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-2xl border-0 mt-3 p-3 rounded-2xl" style={{ minWidth: '320px' }}>
                     <div className="text-center mb-4 pt-2">
                        <div className="w-16 h-16 bg-dark text-white rounded-full mx-auto mb-3 d-flex align-items-center justify-content-center font-black text-2xl">
                           {chains.length > 0 ? chains.find(c => c.token === currentToken)?.restaurant_name?.charAt(0) : restaurant?.name?.charAt(0) || 'U'}
                        </div>
                        <h5 className="mb-0 text-dark font-black">{chains.length > 0 ? chains.find(c => c.token === currentToken)?.restaurant_name : restaurant?.name}</h5>
                        <p className="small text-muted mb-0">{user?.email}</p>
                     </div>

                     {chains.length > 1 && (
                        <div className="mb-3 px-1">
                           <div className="p-3 bg-light rounded-xl">
                              <span className="small fw-bold text-muted uppercase tracking-widest block mb-2 px-1">Quick Switch</span>
                              <div className="overflow-auto max-h-[160px] pr-1">
                                 {chains.map(c => (
                                    <button key={c.restaurant_id} onClick={() => handleSwitchRestaurant(c.token)}
                                       className={`w-full text-left p-2 rounded-lg mb-1 transition-all d-flex align-items-center justify-content-between
                                       ${c.token === currentToken ? 'bg-white shadow-sm font-bold text-dark' : 'hover:bg-white/60 text-muted'}`}>
                                       <span className="small truncate">{c.restaurant_name}</span>
                                       {c.token === currentToken && <FaCheck size={8}/>}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     <Dropdown.Item onClick={() => navigate("/account")} className="rounded-xl py-2 px-3 fw-bold small uppercase tracking-widest text-center">My Account</Dropdown.Item>
                     <Dropdown.Divider />
                     <Dropdown.Item onClick={handleLogout} className="text-danger rounded-xl py-2 px-3 fw-bold small uppercase tracking-widest text-center">Sign Out</Dropdown.Item>
                  </Dropdown.Menu>
               </Dropdown>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default HeaderStyleC;
