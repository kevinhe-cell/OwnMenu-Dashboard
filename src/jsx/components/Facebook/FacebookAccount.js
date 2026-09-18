import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFacebookDraftsThunk, getFacebookThunk } from "../../../store/facebook";
import { getToken } from "../../../store/utlits";
import FacebookDraftList from "./FacebookDraftList";
import { FaPlus, FaUnlink, FaFacebook } from "react-icons/fa";
import { Button, Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import instajson from "../../../json/insta.json";
import FacebookPostModal from "./FacebookPostModal";
import FacebookSchedulePostModal from "./FacebookSchedulePostModal";
import FacebookFullAutomatedPostModal from "./FacebookFullAutomatedPostModal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FacebookAccount() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const account = useSelector((state) => state.facebook.account);
  const drafts = useSelector((state) => state.facebook.drafts);
  const plan = useSelector((state) => state.session.userPlan);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSchedulePostModal, setShowSchedulePostModal] = useState(false);
  const [showFullAutomatedModal, setShowFullAutomatedModal] = useState(false);
  const [authSuccessPending, setAuthSuccessPending] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const scheduledRef = useRef(null);

  const scrollToScheduled = () => {
    scheduledRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await dispatch(getFacebookThunk());
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dispatch]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = getToken();
      try {
        const res = await fetch("/api/facebook-account/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Facebook profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (account?.facebook_page_id) {
      fetchProfile();
      dispatch(getFacebookDraftsThunk());
    }
  }, [account?.facebook_page_id, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      setAuthSuccessPending(true);
      (async () => {
        try {
          await dispatch(getFacebookThunk());
          await dispatch(getFacebookDraftsThunk());
          await handlePostSuccess();
        } finally {
          setTimeout(() => setAuthSuccessPending(false), 2000);
          // Force a hard refresh to guarantee the dashboard reflects connection state
          // and to remove ?status=... from the URL.
          window.location.replace(window.location.pathname);
        }
      })();
    } else if (status === "cancelled") {
      Swal.fire({
        title: t("marketing.facebook.swal.connect_cancelled"),
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
      window.location.replace(window.location.pathname);
    } else if (status === "error" || status === "no_pages") {
      Swal.fire({
        title:
          status === "no_pages"
            ? t("marketing.facebook.swal.no_pages")
            : t("marketing.facebook.swal.connect_error"),
        icon: "error",
        timer: 2500,
        showConfirmButton: false,
      });
      window.location.replace(window.location.pathname);
    } else if (status === "already_connected") {
      Swal.fire({
        title: t("marketing.facebook.swal.already_connected"),
        icon: "warning",
        timer: 2500,
        showConfirmButton: false,
      });
      window.location.replace(window.location.pathname);
    }
  }, [dispatch]);

  const handlePostSuccess = async () => {
    const token = getToken();
    const res = await fetch("/api/facebook-account/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProfile(await res.json());
  };

  const handleConnectClick = async () => {
    if (!plan?.marketing_enabled) {
      Swal.fire({
        icon: "warning",
        title: t("marketing.facebook.swal.access_denied"),
        text: t("marketing.facebook.swal.access_denied_msg"),
        confirmButtonText: t("marketing.facebook.swal.upgrade_btn"),
      }).then((result) => {
        if (result.isConfirmed) navigate("/plans");
      });
      return;
    }

    let popup = null;
    try {
      setApiLoading(true);
      const token = getToken();
      const res = await fetch("/api/facebook-account/connect?popup=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire(t("common.error"), data.error || t("marketing.facebook.swal.connect_error"), "error");
        return;
      }
      const authUrl = data.authUrl;

      // Open popup synchronously to reduce popup-blocking,
      // then navigate it once we have the auth URL.
      popup = window.open(
        "",
        "ownmenu_facebook_oauth",
        // Important: do NOT use `noopener` here because the OAuth callback page
        // uses `window.opener.postMessage(...)` to notify the dashboard.
        "width=600,height=720,scrollbars=yes",
      );
      if (!popup) {
        // If popup is blocked, silently fall back to same-tab redirect (no warning modal).
        window.location.href = authUrl;
        return;
      }
      try {
        popup.document.title = t("common.connecting");
        popup.document.body.innerHTML =
          "<div style='font-family: system-ui, -apple-system; padding: 24px; color: #111827;'>" +
          `<div style='font-weight: 600; font-size: 16px; margin-bottom: 8px;'>${t("marketing.facebook.connecting_fb")}</div>` +
          `<div style='color: #6b7280; font-size: 13px;'>${t("marketing.facebook.wait_msg")}</div>` +
          "</div>";
      } catch {
        // ignore (some browsers restrict writing when noopener/noreferrer)
      }
      popup.location.href = authUrl;

      const onMessage = (ev) => {
        if (ev.data?.source !== "ownmenu-facebook-oauth") return;
        window.removeEventListener("message", onMessage);
        const status = ev.data.status;
        if (status === "success") {
          setAuthSuccessPending(true);
          (async () => {
            try {
              await dispatch(getFacebookThunk());
              await dispatch(getFacebookDraftsThunk());
              await handlePostSuccess();
            } finally {
              setTimeout(() => setAuthSuccessPending(false), 2000);
              // Ensure the dashboard reflects the new connection immediately.
              window.location.reload();
            }
          })();
        } else if (status === "cancelled") {
          Swal.fire({
            title: t("marketing.facebook.swal.connect_cancelled"),
            icon: "info",
            timer: 1500,
            showConfirmButton: false,
          });
          window.location.reload();
        } else if (status === "no_pages") {
          Swal.fire({
            title: t("marketing.facebook.swal.no_pages"),
            icon: "error",
            timer: 2500,
            showConfirmButton: false,
          });
          window.location.reload();
        } else if (status === "already_connected") {
          Swal.fire({
            title: t("marketing.facebook.swal.already_connected"),
            icon: "warning",
            timer: 2500,
            showConfirmButton: false,
          });
          window.location.reload();
        } else {
          Swal.fire({
            title: t("marketing.facebook.swal.connect_error"),
            icon: "error",
            timer: 2500,
            showConfirmButton: false,
          });
          window.location.reload();
        }
      };
      window.addEventListener("message", onMessage);

      const pollClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(pollClosed);
          window.removeEventListener("message", onMessage);
        }
      }, 600);
    } catch (error) {
      console.error(error);
      Swal.fire(t("common.error"), t("marketing.facebook.swal.connect_error"), "error");
    } finally {
      setApiLoading(false);
    }
  };

  const handleDisconnectClick = async () => {
    const result = await Swal.fire({
      title: t("marketing.facebook.swal.disconnect_title"),
      text: t("marketing.facebook.swal.disconnect_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("marketing.facebook.swal.disconnect_confirm"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setApiLoading(true);
      const token = getToken();
      const res = await fetch("/api/facebook-account/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      Swal.fire({
        title: t("marketing.facebook.swal.disconnected_title"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      dispatch(getFacebookThunk());
      setProfile(null);
    } catch {
      Swal.fire(t("common.failed"), t("marketing.facebook.swal.disconnect_failed"), "error");
    } finally {
      setApiLoading(false);
    }
  };

  const renderProfile = () => {
    if (!profile) return null;
    const pic =
      profile.picture?.data?.url ||
      profile.picture?.url ||
      (typeof profile.picture === "string" ? profile.picture : null);
    const recentPosts = Array.isArray(profile.posts) ? profile.posts : [];
    const scheduledCount = drafts.filter((d) => d.status !== "published").length;

    return (
      <div
        className="card shadow-sm mb-4 border-0 overflow-hidden container"
        style={{ animation: "fadeInUp 0.6s ease-out" }}
      >
        <div className="card-body p-4">
          <div className="row align-items-center gy-3 gx-4 mb-4 pb-4 border-bottom">
            <div className="col-auto">
              <div
                style={{
                  position: "relative",
                  background:
                    "linear-gradient(135deg, #1877f2 0%, #4267B2 45%, #0a58ca 100%)",
                  padding: "4px",
                  borderRadius: "50%",
                  boxShadow: "0 4px 16px rgba(24, 119, 242, 0.35)",
                }}
              >
                <img
                  src={
                    pic ||
                    "https://cdn-icons-png.flaticon.com/512/124/124010.png"
                  }
                  alt="Page"
                  className="rounded-circle bg-white"
                  width="90"
                  height="90"
                  style={{ objectFit: "cover", border: "3px solid white" }}
                />
              </div>
            </div>
            <div className="col">
              <h4 className="mb-1 fw-bold" style={{ color: "#262626" }}>
                {profile.name || t("marketing.facebook.fallback_name")}
              </h4>
              {profile.link && (
                <p className="text-muted small mb-2">
                  <a
                    href={profile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    {t("marketing.facebook.open_page_fb")}
                  </a>
                </p>
              )}
              <span
                className="badge rounded-pill px-3 py-1"
                style={{
                  background: "linear-gradient(135deg, #1877f2 0%, #4267B2 100%)",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                }}
              >
                {t("marketing.facebook.page_badge")}
              </span>
            </div>

            <div className="col-12 col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end mt-3 mt-lg-0">
              <Dropdown>
                <Dropdown.Toggle
                  className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-0"
                  style={{
                    background: "linear-gradient(135deg, #1877f2 0%, #4267B2 100%)",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(24, 119, 242, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaPlus />
                  <span>{t("marketing.facebook.new_post_btn")}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="border-0 shadow-lg"
                  style={{ minWidth: "220px" }}
                >
                  <Dropdown.Item
                    className="py-2 px-3 fb-dropdown-item"
                    onClick={() => setShowPostModal(true)}
                  >
                    <strong>{t("marketing.facebook.post_types.instant")}</strong>
                    <small className="d-block text-muted">{t("marketing.facebook.post_types.instant_desc")}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item
                    className="py-2 px-3 fb-dropdown-item"
                    onClick={() => setShowSchedulePostModal(true)}
                  >
                    <strong>{t("marketing.facebook.post_types.schedule")}</strong>
                    <small className="d-block text-muted">{t("marketing.facebook.post_types.schedule_desc")}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item
                    className="py-2 px-3 fb-dropdown-item"
                    onClick={() => setShowFullAutomatedModal(true)}
                  >
                    <strong>{t("marketing.facebook.post_types.full_automated")}</strong>
                    <small className="d-block text-muted">{t("marketing.facebook.post_types.full_automated_desc")}</small>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <div className="row text-center mb-4 g-3">
            {[
              {
                label: t("marketing.facebook.stats.recent_on_page"),
                value: recentPosts.length,
                gradient: "linear-gradient(135deg, #1877f2 0%, #4267B2 100%)",
              },
              {
                label: t("marketing.facebook.stats.page_fans"),
                value: profile.fan_count ?? 0,
                gradient: "linear-gradient(135deg, #4facfe 0%, #00c6ff 100%)",
              },
              {
                label: t("marketing.facebook.stats.scheduled_here"),
                value: scheduledCount,
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            ].map((item, i) => (
              <div key={i} className="col-4">
                <div
                  className="p-3 rounded-3 h-100"
                  style={{
                    background: "white",
                    border: "1px solid #f0f0f0",
                    cursor: "default",
                  }}
                >
                  <div
                    className="fw-bold mb-1"
                    style={{
                      fontSize: "1.75rem",
                      background: item.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {Number(item.value).toLocaleString()}
                  </div>
                  <div
                    className="text-muted small fw-medium text-uppercase"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentPosts.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 pt-3 border-top">
                <h5 className="mb-0 fw-bold" style={{ color: "#262626" }}>
                  {t("marketing.facebook.recent_posts")}
                </h5>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-medium"
                  onClick={scrollToScheduled}
                  style={{
                    color: "#1877f2",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0a58ca";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#1877f2";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {t("marketing.facebook.view_scheduled")}
                </button>
              </div>
              <div className="row g-3">
                {recentPosts.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    className="col-6 col-md-3"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    <div
                      className="card h-100 border-0 overflow-hidden"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: item.permalink_url ? "pointer" : "default",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-8px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 32px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.08)";
                      }}
                    >
                      {item.permalink_url ? (
                        <a
                          href={item.permalink_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-dark"
                        >
                          <div style={{ position: "relative", overflow: "hidden" }}>
                            {item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url}
                                alt=""
                                className="w-100"
                                style={{
                                  objectFit: "cover",
                                  height: "180px",
                                }}
                              />
                            ) : (
                              <div
                                className="w-100 d-flex align-items-center justify-content-center bg-light"
                                style={{ height: "180px" }}
                              >
                                <FaFacebook size={36} color="#1877f2" />
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background:
                                  "linear-gradient(transparent, rgba(0,0,0,0.75))",
                                color: "white",
                                fontSize: "0.75rem",
                                padding: "8px 10px",
                              }}
                            >
                              <FaFacebook className="me-1" />
                              {t("marketing.facebook.view_on_fb")}
                            </div>
                          </div>
                          {item.message ? (
                            <div className="p-2 small text-muted border-top text-truncate">
                              {item.message}
                            </div>
                          ) : null}
                        </a>
                      ) : (
                        <div>
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt=""
                              className="w-100"
                              style={{ objectFit: "cover", height: "180px" }}
                            />
                          ) : (
                            <div
                              className="w-100 d-flex align-items-center justify-content-center bg-light"
                              style={{ height: "180px" }}
                            >
                              <FaFacebook size={36} color="#1877f2" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-5 border-top">
              <div
                className="d-inline-block p-4 rounded-circle mb-3"
                style={{
                  background: "linear-gradient(135deg, #1877f2 0%, #4267B2 100%)",
                }}
              >
                <FaFacebook size={40} color="white" />
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#262626" }}>
                {t("marketing.facebook.no_posts")}
              </h5>
              <p className="text-muted mb-0 small mx-auto" style={{ maxWidth: 420 }}>
                {t("marketing.facebook.no_posts_desc")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (authSuccessPending) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
        <Lottie animationData={instajson} loop autoplay style={{ width: 280 }} />
        <h4 className="fw-bold mt-3">{t("marketing.facebook.auth_success")}</h4>
        <p className="text-muted">{t("marketing.facebook.loading_page")}</p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fb-dropdown-item:hover {
            background: linear-gradient(135deg, rgba(24, 119, 242, 0.08) 0%, rgba(66, 103, 178, 0.08) 100%) !important;
          }
        `}
      </style>
      {apiLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ zIndex: 9999, background: "rgba(255,255,255,0.9)" }}
        >
          <Lottie animationData={instajson} loop autoplay style={{ width: 200 }} />
        </div>
      )}

      <div className="container my-4">
        <div
          className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4 p-4 rounded-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(24, 119, 242, 0.06) 0%, rgba(66, 103, 178, 0.06) 100%)",
            border: "1px solid rgba(24, 119, 242, 0.12)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2 rounded-3"
              style={{
                background: "linear-gradient(135deg, #1877f2 0%, #4267B2 100%)",
                boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
              }}
            >
              <FaFacebook size={28} color="white" />
            </div>
            <div>
              <h4 className="mb-1 fw-bold" style={{ color: "#262626" }}>
                {t("marketing.facebook.title")}
              </h4>
              <p className="mb-0 text-muted small">
                {t("marketing.facebook.desc")}
              </p>
            </div>
          </div>
          {account && !loading && (
            <Button
              variant="outline-danger"
              className="rounded-pill px-4"
              onClick={handleDisconnectClick}
            >
              <FaUnlink className="me-2" />
              {t("marketing.facebook.disconnect_btn")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Lottie animationData={instajson} loop autoplay style={{ width: 240, margin: "0 auto" }} />
          </div>
        ) : !account ? (
          <div className="card border-0 shadow-sm p-5 text-center">
            <h2 className="fw-bold mb-3">{t("marketing.facebook.connect_title")}</h2>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 560 }}>
              {t("marketing.facebook.connect_desc")}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg px-5 rounded-pill"
              onClick={handleConnectClick}
            >
              <FaFacebook className="me-2" />
              {t("marketing.facebook.connect_btn")}
            </button>
          </div>
        ) : profile ? (
          <>
            {renderProfile()}
            <div ref={scheduledRef}>
              <FacebookDraftList drafts={drafts} />
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-2">{t("marketing.facebook.loading_page")}</p>
          </div>
        )}
      </div>

      <FacebookPostModal
        show={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPosted={handlePostSuccess}
      />
      <FacebookSchedulePostModal
        show={showSchedulePostModal}
        onClose={() => setShowSchedulePostModal(false)}
        onPosted={async () => {
          await dispatch(getFacebookDraftsThunk());
        }}
      />
      <FacebookFullAutomatedPostModal
        show={showFullAutomatedModal}
        onClose={() => setShowFullAutomatedModal(false)}
        initialEnabled={account?.full_automated_post_enabled || false}
        initialPostsPerWeek={account?.posts_per_week || 1}
      />
    </>
  );
}
