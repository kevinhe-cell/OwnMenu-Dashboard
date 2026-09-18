import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { restoreUser } from "../../../store/session";
import CustomerSupportForm from "./CustomerSupport";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PasscodeModal from "../Stripe/PasscodeModal";
import { getToken } from "../../../store/utlits";
import RestaurantAppCode from "./RestaurantAppCode";

export default function AccountSetting() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.session.user);
  const plan = useSelector((state) => state.session.userPlan);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [verifyCode, setVerifyCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fromAccount, setformAccount] = useState(true);

  const [mode, setMode] = useState(null); // 'email' or 'password'
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  //secure passcode modal
  const [passcodeModal, setPasscodeModal] = useState(false);
  const startVerification = (type) => {
    setMode(type);
    sendVerificationCode();
  };

  useEffect(() => {
    const checkIfPasscodeExists = async () => {
      const token = getToken();
      const res = await fetch(
        `/api/payment-access/check-exists/${user.restaurant_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setformAccount(true);
        } else {
          setformAccount(false);
        }
      }
    };
    if (user) {
      checkIfPasscodeExists();
    }
  }, [user]);

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setCodeSent(true);
        swal(
          t('account.swal.verify_sent_title'),
          t('account.swal.verify_sent_text', { email: user.phone }),
          "success",
        );
      } else {
        swal(
          t('common.error'),
          data.message || t('login.err_failed_send'),
          "error",
        );
      }
    } catch (err) {
      swal("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeAndContinue = async () => {
    if (!verifyCode)
      return swal(t('account.swal.missing_code'), t('account.swal.enter_code'), "warning");
    setLoading(true);

    try {
      const res = await fetch("/api/users/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.phone, code: verifyCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setCodeVerified(true);
        swal(t('account.swal.verified_title'), t('account.swal.verified_text'), "success");
      } else {
        swal(t('common.error'), data.message || t('login.err_invalid_code'), "error");
      }
    } catch (err) {
      swal("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async () => {
    if (mode === "email") {
      if (!newEmail.includes("@"))
        return swal(t('account.swal.invalid_email'), t('account.swal.enter_valid_email'), "warning");

      const res = await fetch("/api/users/account/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldEmail: user.phone, newEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        swal(t('common.success'), t('account.swal.email_updated'), "success");
        dispatch(restoreUser());
        resetState();
      } else {
        swal(t('common.error'), data.message || "Failed to update email.", "error");
      }
    } else if (mode === "password") {
      if (newPassword.length < 6)
        return swal(
          t('account.swal.invalid_password'),
          t('account.swal.password_len'),
          "warning",
        );

      const res = await fetch("/api/users/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.phone, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        swal(t('common.success'), t('account.swal.password_updated'), "success");
        resetState();
      } else {
        swal(t('common.error'), data.message || "Failed to update password.", "error");
      }
    }
  };

  const resetState = () => {
    setMode(null);
    setNewEmail("");
    setNewPassword("");
    setVerifyCode("");
    setCodeSent(false);
    setCodeVerified(false);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  const badge = (label, enabled) => (
    <span
      className={`badge rounded-pill ${enabled ? "bg-success" : "bg-secondary"}`}
    >
      {enabled ? `${label}` : `No ${label}`}
    </span>
  );

  return (
    <div className="container">
      <div className="mx-auto">
        <div className="mb-4">
          <h2 className="fw-semibold mb-3">{t('account.title')}</h2>
          <p className="text-muted mb-0">
            {t('account.desc')}
          </p>
        </div>

        {/* <div className="card border-0 shadow-sm mb-4"> */}
        {/* <div className="card-body"> */}
        {/* <div className="d-flex justify-content-between align-items-center mb-3"> */}
        {/* <div>
        <h5 className="fw-semibold mb-1">Subscription Plan</h5>
        <p className="text-muted mb-0">Manage your subscription and payment method.</p>
      </div> */}
        {/* <button
        className="btn btn-sm btn-primary"
        onClick={() => navigate('/plans')}
      >
        ⚙️ Edit Plan
      </button> */}
        {/* </div> */}

        {/* <hr className="mb-3" /> */}

        {/* <div className="row g-3"> */}
        {/* Plan Type */}
        {/* <div className="col-md-12 d-flex align-items-center">
        <div className="me-2 fw-semibold">Plan:</div>
        <span className={`badge rounded-pill px-3 py-1 text-uppercase bg-${plan?.plan_type === 'free' ? 'secondary' : 'primary'}`}>
          {plan?.plan_type?.toUpperCase()}
        </span>
      </div> */}

        {/* Plan Dates */}
        {/* <div className="col-md-6 d-flex align-items-center">
        <div className="me-2 fw-semibold">Start:</div>
        <div>{formatDate(plan?.plan_start_date)}</div>
      </div>
      <div className="col-md-6 d-flex align-items-center">
        <div className="me-2 fw-semibold">End:</div>
        <div>{formatDate(plan?.plan_expiration_date)}</div> */}
        {/* </div> */}

        {/* Feature Toggles */}
        {/* <div className="col-md-6 d-flex align-items-center">
        <div className="me-2 fw-semibold">SMS Notifications:</div>
        {badge('Enabled', plan?.sms_notification_enabled)}
      </div>
      <div className="col-md-6 d-flex align-items-center">
        <div className="me-2 fw-semibold">Online Payment:</div>
        {badge('Enabled', plan?.online_payment_enabled)} */}
        {/* </div> */}
        {/* </div> */}

        {/* Card Info */}
        {/* {plan?.paymentMethod_card && (
      <>
        <hr className="mt-4 mb-3" />
        <h6 className="text-uppercase text-muted mb-2">Card on File</h6>
        <div className="d-flex align-items-center gap-3">
          <div className="fs-4 text-muted">💳</div>
          <div>
            <div className="fw-semibold">
              {plan.paymentMethod_card.brand?.toUpperCase()} •••• {plan.paymentMethod_card.last4}
            </div>
            <div className="text-muted small">
              Expires {plan.paymentMethod_card.exp_month}/{plan.paymentMethod_card.exp_year}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</div> */}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="text-uppercase text-muted mb-3">{t('account.info')}</h6>

            {!mode && (
              <>
                <div className="mb-3">
                  <label className="form-label">{t('account.email')}</label>
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded bg-light">
                    <span>{user?.phone}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled
                      title={t('account.email_notice')}
                    >
                      🔒 {t('account.locked')}
                    </button>
                  </div>
                  <div className="text-muted small mt-1">
                    {t('account.email_notice')}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t('account.password')}</label>
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span>••••••••</span>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => startVerification("password")}
                    >
                      🔒 {t('account.change')}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t('account.secure_code')}</label>
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span>••••</span>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => setPasscodeModal(true)}
                    >
                      🔒 {t('account.change')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode && !codeVerified && (
              <div className="mt-4">
                <h6 className="text-muted mb-2">{t('account.verify_identity')}</h6>
                <label className="form-label">
                  {t('account.code_sent_to')} <strong>{user?.phone}</strong>
                </label>
                <input
                  type="text"
                  className="form-control mb-3"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder={t('account.verify_code')}
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={verifyCodeAndContinue}
                    disabled={loading}
                  >
                    ✅ {t('account.verify')}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetState}
                  >
                    ❌ {t('account.cancel')}
                  </button>
                </div>
              </div>
            )}

            {codeVerified && (
              <div className="mt-4">
                {mode === "email" && (
                  <>
                    <label className="form-label">{t('account.new_email')}</label>
                    <input
                      type="email"
                      className="form-control mb-3"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={t('account.enter_new_email')}
                    />
                  </>
                )}

                {mode === "password" && (
                  <>
                    <label className="form-label">{t('account.new_password')}</label>
                    <input
                      type="password"
                      className="form-control mb-3"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('account.enter_new_password')}
                    />
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <div className="text-danger small">
                        {t('account.password_hint')}
                      </div>
                    )}
                  </>
                )}

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleSubmitUpdate}
                    disabled={loading}
                  >
                    💾 {t('account.save')}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetState}
                  >
                    ❌ {t('account.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PasscodeModal
        show={passcodeModal}
        onClose={() => setPasscodeModal(false)}
        restaurantId={user.restaurant_id}
        onSuccess={() => setPasscodeModal(false)}
        fromAccount={fromAccount}
      />

      <RestaurantAppCode />

      <CustomerSupportForm />
    </div>
  );
}
