import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserPlanThunk } from "../../../store/session";

export default function SMSNotification() {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const plan = useSelector((state) => state.session.userPlan);
  const restaurantId = plan?.restaurant_id;
  const isSMSEnabled = plan?.sms_notification_enabled;
  const isFreePlan = plan?.plan_type === "free" || plan?.plan_type === "custom";

  useEffect(() => {
    dispatch(getUserPlanThunk());
  }, [dispatch]);

  useEffect(() => {
    if (plan?.phone_number) setPhoneNumber(plan.phone_number);
  }, [plan]);

  useEffect(() => {
    let timer;
    if (cooldownTimer > 0) {
      timer = setTimeout(() => setCooldownTimer(cooldownTimer - 1), 1000);
    } else {
      setIsCooldown(false);
    }
    return () => clearTimeout(timer);
  }, [cooldownTimer]);

  const handleSavePhone = async () => {
    if (!restaurantId) return setStatus(t("sms_noti.alerts.missing_id"));

    setLoading(true);
    try {
      const res = await fetch("/api/users/sms/save-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, restaurantId }),
      });

      const data = await res.json();
      setStatus(data.message || t("sms_noti.alerts.saved"));
      dispatch(getUserPlanThunk());
    } catch (err) {
      setStatus(t("sms_noti.alerts.err_save"));
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async () => {
    const confirm = await swal({
      title: t("sms_noti.swal.test_title"),
      text: `${t("sms_noti.swal.test_text")}${phoneNumber}?`,
      icon: "warning",
      buttons: [t("common.cancel"), t("common.yes")],
      dangerMode: true,
    });
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      setStatus(data.message || t("sms_noti.alerts.test_sent"));

      setIsCooldown(true);
      setCooldownTimer(30);
    } catch (err) {
      setStatus(t("sms_noti.alerts.err_test"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    const confirm = await swal({
      title: t("sms_noti.swal.remove_title"),
      text: t("sms_noti.swal.remove_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("sms_noti.swal.btn_remove")],
      dangerMode: true,
    });
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/sms/remove-phone", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });

      const data = await res.json();
      setStatus(data.message || t("sms_noti.alerts.removed"));

      if (data.success) setPhoneNumber("");
      dispatch(getUserPlanThunk());
    } catch (err) {
      setStatus(t("sms_noti.alerts.err_remove"));
    } finally {
      setLoading(false);
    }
  };

  const renderLockedNotice = () => (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-lg border-0 text-center" style={{ maxWidth: "500px" }}>
        <div className="card-body p-4">
          <h4 className="fw-bold mb-3">{t("sms_noti.locked.title")}</h4>
          <p className="text-muted mb-3">
            {t("sms_noti.locked.desc_1")}<strong>{t("sms_noti.locked.starter")}</strong>{t("sms_noti.locked.or")}
            <strong>{t("sms_noti.locked.pro")}</strong>{t("sms_noti.locked.desc_2")}
            <strong>{t("sms_noti.locked.addon")}</strong>{t("sms_noti.locked.dot")}
          </p>
          <button onClick={() => navigate("/plans")} className="btn btn-primary btn-lg">
            {t("sms_noti.locked.btn_upgrade")}
          </button>
        </div>
      </div>
    </div>
  );

  if (isFreePlan && !isSMSEnabled) return renderLockedNotice();

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-lg border-0" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="card-body p-4">
          <h3 className="fw-bold text-center mb-4">{t("sms_noti.setup.title")}</h3>
          <p className="text-muted small text-center mb-4">
            {t("sms_noti.setup.desc")}
          </p>

          {/* Phone Setup Section */}
          <div className="mb-4">
            <label className="form-label fw-semibold">{t("sms_noti.setup.label")}</label>
            <input
              type="text"
              placeholder={t("sms_noti.setup.placeholder")}
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) setPhoneNumber(value);
              }}
              className="form-control form-control-lg"
              disabled={loading}
            />
            <div className="form-text">{t("sms_noti.setup.format")}</div>
          </div>

          {/* Actions Section */}
          <div className="border-top pt-3">
            {!plan?.phone_number ? (
              <div className="d-flex justify-content-end">
                <button
                  onClick={handleSavePhone}
                  className="btn btn-primary btn-lg"
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? t("sms_noti.setup.saving") : t("sms_noti.setup.btn_save")}
                </button>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2 justify-content-between">
                <button
                  onClick={handleSavePhone}
                  className="btn btn-primary flex-fill"
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? t("sms_noti.setup.saving") : t("sms_noti.setup.btn_update")}
                </button>

                <button
                  onClick={handleTestSMS}
                  className="btn btn-outline-success flex-fill"
                  disabled={loading || isCooldown}
                >
                  {loading
                    ? "⏳ Testing..."
                    : isCooldown
                    ? `⏳ Wait ${cooldownTimer}s`
                    : "📤 Send Test SMS"}
                </button>

                <button
                  onClick={handleRemovePhone}
                  className="btn btn-outline-danger flex-fill"
                  disabled={loading}
                >
                  {loading ? t("sms_noti.setup.removing") : t("sms_noti.setup.btn_remove")}
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {status && (
            <div className="alert alert-info text-center fw-semibold mt-4" role="alert">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
