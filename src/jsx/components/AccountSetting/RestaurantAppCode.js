import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import { getRestaurantThunk } from "../../../store/restaurants";

function RestaurantAppCode() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const [loading, setLoading] = useState(false);

  const handleGenerateOrReset = async (type) => {
    try {
      setLoading(true);
      const endpoint =
        type === "generate"
          ? "/api/restaurants/generate-code"
          : "/api/restaurants/reset-code";

      const token = getToken();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success) {
        await dispatch(getRestaurantThunk()); // refresh redux state
      } else {
        alert(data.error || t('login.err_failed_send'));
      }
    } catch (err) {
      console.error("Error generating/resetting code:", err);
      alert(t('login.err_failed_send'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-body text-center">
        <h5 className="fw-semibold mb-2">🔐 {t('account.app_code.title')}</h5>
        <p className="text-muted small mb-4">
          {t('account.app_code.desc')}
        </p>

        {restaurant?.app_login_code ? (
          <>
            <div
              className={`fw-bold border rounded bg-light d-inline-block mb-4 px-4 py-3 ${
                loading ? "opacity-50" : ""
              }`}
              style={{
                fontSize: "2rem",
                letterSpacing: "6px",
                minWidth: "250px",
                filter: loading ? "blur(2px)" : "none", // 🔄 blur while loading
                transition: "all 0.3s ease",
              }}
            >
              {restaurant.app_login_code}
            </div>

            <div className="d-grid d-sm-flex justify-content-center gap-2">
              <button
                className="btn btn-warning"
                onClick={() => handleGenerateOrReset("reset")}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {t('account.app_code.regenerating')}
                  </>
                ) : (
                  `🔄 ${t('account.app_code.regenerate')}`
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="d-grid d-sm-flex justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => handleGenerateOrReset("generate")}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                    {t('account.app_code.generating')}
                  </>
                ) : (
                  `➕ ${t('account.app_code.generate')}`
                )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantAppCode;
