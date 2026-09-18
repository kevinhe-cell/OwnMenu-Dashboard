import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";

export default function AppStoreConnectForm({
  restaurantId,
  initialConnection,
  onConnected,
  onCancel,
  showCancel,
}) {
  const { t } = useTranslation();
  const [appleInput, setAppleInput] = useState(initialConnection?.apple_app_id || initialConnection?.ios_url || "");
  const [androidInput, setAndroidInput] = useState(
    initialConnection?.android_package_name || initialConnection?.android_url || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    if (!appleInput.trim() && !androidInput.trim()) {
      setError(t("dashboard.app_store.connect_required"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      const body = {
        provides_app: true,
        disconnect: false,
      };
      if (appleInput.trim()) {
        if (appleInput.includes("apple.com")) body.ios_url = appleInput.trim();
        else body.apple_app_id = appleInput.trim();
      }
      if (androidInput.trim()) {
        if (androidInput.includes("play.google.com")) body.android_url = androidInput.trim();
        else body.android_package_name = androidInput.trim();
      }

      const res = await fetch(`/api/restaurant-app-links/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("dashboard.app_store.connect_failed"));
      }
      onConnected?.(data.data);
    } catch (err) {
      setError(err.message || t("dashboard.app_store.connect_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(t("dashboard.app_store.disconnect_confirm"))) return;
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`/api/restaurant-app-links/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disconnect: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("dashboard.app_store.connect_failed"));
      }
      onConnected?.(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vd-connect-card">
      <form onSubmit={handleSubmit}>
        <div className="vd-field">
          <label htmlFor="apple-app-input">{t("dashboard.app_store.apple_app_id_label")}</label>
          <input
            id="apple-app-input"
            type="text"
            value={appleInput}
            onChange={(e) => setAppleInput(e.target.value)}
            placeholder="6752232260"
            disabled={saving}
          />
          <p className="vd-field-hint">{t("dashboard.app_store.apple_app_id_hint")}</p>
        </div>
        <div className="vd-field">
          <label htmlFor="android-package-input">{t("dashboard.app_store.android_package_label")}</label>
          <input
            id="android-package-input"
            type="text"
            value={androidInput}
            onChange={(e) => setAndroidInput(e.target.value)}
            placeholder="com.example.customer"
            disabled={saving}
          />
          <p className="vd-field-hint">{t("dashboard.app_store.android_package_hint")}</p>
        </div>
        {error ? (
          <div className="vd-error" role="alert">
            {error}
          </div>
        ) : null}
        <div className="vd-connect-actions">
          <button type="submit" className="vd-btn-apply" disabled={saving}>
            {saving ? t("dashboard.app_store.saving") : t("dashboard.app_store.save_connection")}
          </button>
          {showCancel ? (
            <button type="button" className="vd-btn-secondary" onClick={onCancel} disabled={saving}>
              {t("dashboard.app_store.cancel")}
            </button>
          ) : null}
          {initialConnection?.connected ? (
            <button type="button" className="vd-btn-danger" onClick={handleDisconnect} disabled={saving}>
              {t("dashboard.app_store.disconnect")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
