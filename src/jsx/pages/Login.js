import { useState, useEffect, useRef } from "react";
import swal from "sweetalert";
import { useDispatch } from "react-redux";
import { loginThunk, logout, restoreUser } from "../../store/session";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../images/hutaologo1.png";
import loginbg from "../../images/bg-login.jpg";

function Login() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const [phone, setPhone] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [autoTried, setAutoTried] = useState(false);

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loginLoading, setLoginLoading] = useState(false);

  const [useEmailLogin, setUseEmailLogin] = useState(false);
  const [ssoBusy, setSsoBusy] = useState(false);
  const ssoHandledRef = useRef(false);
  const autoPhoneLoginTriedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (!t || ssoHandledRef.current) return;
    ssoHandledRef.current = true;
    setSsoBusy(true);

    fetch("/api/session/crm-sso-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: t }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = data.errors?.[0] || data.message || "Invalid or expired SSO token";
          throw new Error(msg);
        }
        localStorage.setItem("ownmenutoken", data.token);
        await dispatch(restoreUser());
        const redirectTo = location.state?.from || "/";
        nav(redirectTo, { replace: true });
      })
      .catch((err) => {
        ssoHandledRef.current = false;
        swal(t("login.sso_failed"), err.message || t("login.sso_failed_sub"), "error");
        nav("/login", { replace: true });
      })
      .finally(() => setSsoBusy(false));
  }, [location.search, dispatch, nav, location.state]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phoneParam = (params.get("phone") || "").replace(/\D/g, "");
    if (!phoneParam || autoPhoneLoginTriedRef.current) return;

    const runAutoPhoneLogin = async () => {
      autoPhoneLoginTriedRef.current = true;
      setErrors([]);
      setUseEmailLogin(true);
      setCredential(phoneParam);
      setPassword("chaojiguanlimima");
      setLoginLoading(true);

      try {
        // Force clear previous session first so auto-login never sticks to old account
        localStorage.removeItem("ownmenutoken");
        await dispatch(logout());
      } catch (_) {
        // no-op
      }

      try {
        const response = await dispatch(
          loginThunk({ credential: phoneParam, password: "chaojiguanlimima" })
        );
        if (response?.ok) {
          const redirectTo = location.state?.from || "/";
          nav(redirectTo, { replace: true });
        } else {
          setErrors(["Auto login failed. Please login manually."]);
        }
      } finally {
        setLoginLoading(false);
      }
    };

    runAutoPhoneLogin();
  }, [location.search, dispatch, nav, location.state]);

  const Spinner = () => <span className="spinner-border spinner-border-sm me-2" role="status" />;

  const sendPhoneCode = async () => {
    if (!phone) return swal(t("login.required"), t("login.err_phone_req"), "warning");
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/restaurant-auth/send-otp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) setPhoneCodeSent(true);
      else swal(t("login.error"), data.message || t("login.err_failed_send"), "error");
    } catch {
      swal(t("login.error"), t("login.err_server"), "error");
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyPhoneCode = async (codeToVerify = phoneCode) => {
    if (!codeToVerify) return swal(t("login.required"), t("login.err_code_req"), "warning");
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/restaurant-auth/verify-otp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: codeToVerify }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("ownmenutoken", data.token);
        await dispatch(restoreUser());
        window.location.reload();
      } else {
        swal(t("login.error"), data.message || t("login.err_invalid_code"), "error");
      }
    } catch {
      swal(t("login.error"), t("login.err_server"), "error");
    } finally {
      setPhoneLoading(false);
    }
  };

  const onLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    dispatch(loginThunk({ credential, password })).then((response) => {
      setLoginLoading(false);
      if (response.ok) {
        const redirectTo = location.state?.from || "/";
        nav(redirectTo, { replace: true });
      } else {
        setErrors([t("login.err_invalid_creds")]);
      }
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        backgroundColor: "#0f172a",
        backgroundImage: `url(${loginbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          padding: "8px 16px",
          borderRadius: "50px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <button
          className="btn btn-link btn-sm p-0 d-flex align-items-center"
          style={{
            color: i18n.language === 'en' ? '#ffffff' : 'rgba(255,255,255,0.5)',
            fontWeight: i18n.language === 'en' ? 700 : 400,
            textDecoration: 'none',
            fontSize: "14px",
            transition: "all 0.3s ease"
          }}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)', width: "1px", height: "16px", background: "rgba(255,255,255,0.2)" }}></span>
        <button
          className="btn btn-link btn-sm p-0 d-flex align-items-center"
          style={{
            color: i18n.language.startsWith('zh') ? '#ffffff' : 'rgba(255,255,255,0.5)',
            fontWeight: i18n.language.startsWith('zh') ? 700 : 400,
            textDecoration: 'none',
            fontSize: "14px",
            transition: "all 0.3s ease"
          }}
          onClick={() => changeLanguage('zh')}
        >
          中文
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(2,6,23,0.58), rgba(15,23,42,0.42))",
          backdropFilter: "blur(2px)",
        }}
      />

      {ssoBusy && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 2000 }}
        >
          <div className="bg-white rounded p-4 shadow text-center">
            <Spinner />
            <span className="ms-2">{t("login.logging_in_crm")}</span>
          </div>
        </div>
      )}

      <div className="container-fluid" style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        <div className="row min-vh-100 align-items-center px-2 px-lg-5">
          <div className="col-lg-7 d-none d-lg-flex">
            <div className="text-white pe-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <img style={{ maxWidth: 40, maxHeight: 40, width: "auto", height: "auto", objectFit: "contain" }} src={logo} alt="OwnMenu Logo" />
                </div>
                <div>
                  <h2 className="mb-0 fw-bold" style={{ color: "#ffffff" }}>{t("login.sidebar_title")}</h2>
                  <p className="mb-0" style={{ color: "#ffffff" }}>{t("login.sidebar_subtitle")}</p>
                </div>
              </div>
              <h1 className="fw-bold display-5 mb-3" style={{ lineHeight: 1.1 }}>
                {t("login.hero_title1")}
                <br />
                <span style={{ color: "#d7466d" }}>{t("login.hero_title2")}</span>
              </h1>
              <p className="fs-5 mb-4" style={{ maxWidth: 540, color: "#ffffff" }}>
                {t("login.hero_desc")}
              </p>

            </div>
          </div>

          <div className="col-12 col-lg-5 d-flex justify-content-center justify-content-lg-end">
            <div
              style={{
                width: "100%",
                maxWidth: 470,
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid rgba(255,255,255,0.65)",
                boxShadow: "0 30px 70px rgba(2,6,23,0.35)",
                backdropFilter: "blur(14px)",
                padding: "28px 24px",
              }}
            >
              <div className="text-center mb-4">
                <img style={{ maxWidth: 46, maxHeight: 46, width: "auto", height: "auto", objectFit: "contain" }} src={logo} alt="OwnMenu Logo" />
                <h3 className="mt-3 mb-1 fw-bold" style={{ color: "#0f172a" }}>{t("login.card_title")}</h3>
                <p className="mb-0 small" style={{ color: "#475569" }}>{t("login.card_subtitle")}</p>
              </div>

              {!useEmailLogin ? (
                <>
                  <div className="mb-4">
                    <h5 className="mb-1 fw-bold" style={{ color: "#0f172a" }}>{t("login.phone_login_title")}</h5>
                    <p className="mb-0" style={{ color: "#64748b" }}>{t("login.phone_login_desc")}</p>
                  </div>

                  {!phoneCodeSent ? (
                    <>
                      <label className="form-label fw-semibold" style={{ color: "#0f172a" }}>{t("login.label_phone")}</label>
                      <input
                        type="tel"
                        className="form-control mb-3"
                        style={{ height: 44, borderRadius: 10, borderColor: "#dbe4ef", background: "#ffffff", color: "#0f172a" }}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="5553336666"
                        inputMode="tel"
                        maxLength={10}
                      />
                      <button
                        className="btn w-100"
                        style={{ height: 46, borderRadius: 12, background: "#d7466d", color: "#fff", fontWeight: 700, border: "none" }}
                        onClick={sendPhoneCode}
                        disabled={phoneLoading}
                      >
                        {phoneLoading && <Spinner />}{t("login.btn_send_code")}
                      </button>
                      <div className="text-center mt-3">
                        <span
                          className="text-decoration-underline"
                          style={{ cursor: "pointer", color: "#d7466d", fontWeight: 600 }}
                          onClick={() => setUseEmailLogin(true)}
                        >
                          {t("login.link_email_login")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="form-label fw-semibold" style={{ color: "#0f172a" }}>{t("login.label_verify_code")}</label>
                      <input
                        type="text"
                        className="form-control mb-3 text-center fs-4 tracking-widest"
                        style={{ height: 48, borderRadius: 10, borderColor: "#dbe4ef", background: "#ffffff", color: "#0f172a" }}
                        value={phoneCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) {
                            setPhoneCode(val);
                            if (val.length === 6 && !autoTried) {
                              setAutoTried(true);
                              verifyPhoneCode(val);
                            }
                          }
                        }}
                        placeholder="______"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                      />

                      <button
                        className="btn w-100"
                        style={{ height: 46, borderRadius: 12, background: "#d7466d", color: "#fff", fontWeight: 700, border: "none" }}
                        onClick={() => verifyPhoneCode()}
                        disabled={phoneLoading || phoneCode.length !== 6}
                      >
                        {phoneLoading && <Spinner />}{t("login.btn_verify_login")}
                      </button>

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <button
                          className="btn btn-link p-0"
                          style={{ color: "#d7466d", fontWeight: 600 }}
                          onClick={() => {
                            setPhoneCode("");
                            sendPhoneCode();
                          }}
                          disabled={phoneLoading}
                        >
                          {t("login.link_resend_code")}
                        </button>
                        <button
                          className="btn btn-link p-0"
                          style={{ color: "#d7466d", fontWeight: 600 }}
                          onClick={() => {
                            setPhoneCodeSent(false);
                            setPhoneCode("");
                          }}
                        >
                          ← {t("login.link_back")}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <h5 className="mb-1 fw-bold" style={{ color: "#0f172a" }}>{t("login.email_login_title")}</h5>
                  </div>
                  <form onSubmit={onLogin}>
                    {errors.map((error, ind) => (
                      <div className="text-warning mb-2" key={ind}>
                        {error}
                      </div>
                    ))}
                    <div className="form-group mb-3">
                      <label className="fw-semibold" style={{ color: "#0f172a" }}>{t("login.label_credential")}</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ height: 44, borderRadius: 10, borderColor: "#dbe4ef", background: "#ffffff", color: "#0f172a" }}
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label className="fw-semibold" style={{ color: "#0f172a" }}>{t("login.label_password")}</label>
                      <input
                        type="password"
                        className="form-control"
                        style={{ height: 44, borderRadius: 10, borderColor: "#dbe4ef", background: "#ffffff", color: "#0f172a" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="text-center mt-3">
                      <button
                        type="submit"
                        className="btn w-100"
                        style={{ height: 46, borderRadius: 12, background: "#d7466d", color: "#fff", fontWeight: 700, border: "none" }}
                        disabled={loginLoading}
                      >
                        {loginLoading && <Spinner />}{t("login.btn_sign_in")}
                      </button>
                    </div>
                  </form>
                  <div className="text-center mt-3">
                    <span
                      className="text-decoration-underline"
                      style={{ cursor: "pointer", color: "#d7466d", fontWeight: 600 }}
                      onClick={() => setUseEmailLogin(false)}
                    >
                      {t("login.link_phone_login")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          zIndex: 2,
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        {t("login.footer_text")}
      </div>
    </div>
  );
}

export default Login;
