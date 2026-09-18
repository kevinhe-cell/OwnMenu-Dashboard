import "./vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { restoreUser } from "./store/session";
import React, { lazy, Suspense, useEffect } from "react";
import AuthCallback from "./jsx/pages/AuthCallback";

const Login = lazy(() => import("./jsx/pages/Login"));
const Index = lazy(() => import("./jsx"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);

useEffect(() => {
  const path = location.pathname;
  const query = new URLSearchParams(location.search);
  const hasPhoneAutoLogin = Boolean(query.get("phone"));

  // if not logged in, but on /login or /auth/callback → allow
  if (!currentUser && path !== "/login" && path !== "/auth/callback") {
    navigate("/login", { state: { from: path } });
  }

  // if logged in and on /login → redirect back (unless phone auto-login is requested)
  if (currentUser && path === "/login" && !hasPhoneAutoLogin) {
    const redirectTo = location.state?.from || "/";
    navigate(redirectTo, { replace: true });
  }
}, [currentUser, location.pathname, location.search, location.state, navigate]);

  return (
<Suspense fallback={<Preloader />}>
  <Routes>
    <Route path="/login" element={<Login />} />
    {/* 🔑 allow auth callback page without currentUser */}
    <Route path="/auth/callback" element={<AuthCallback />} />

    {/* protect everything else */}
    {currentUser && <Route path="/*" element={<Index />} />}
  </Routes>
</Suspense>

  );
}

const Preloader = () => (
  <div id="preloader" className="vh-100">
    <div className="sk-three-bounce">
      <div className="sk-child sk-bounce1"></div>
      <div className="sk-child sk-bounce2"></div>
      <div className="sk-child sk-bounce3"></div>
    </div>
  </div>
);

export default App;
