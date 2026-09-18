// src/jsx/pages/AuthCallback.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { restoreUser } from "../../store/session";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = window.location.hash; // or location.search if you used query param
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const token = params.get("token");

    if (token) {
      // save token locally
      localStorage.setItem("ownmenutoken", token);

      // optionally restore session
      dispatch(restoreUser()).then(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Logging you in...</p>;
}
