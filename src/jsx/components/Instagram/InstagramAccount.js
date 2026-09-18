import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getInstagramDraftsThunk,
  getInstagramThunk,
} from "../../../store/instagram";
import { getToken } from "../../../store/utlits";
import DraftsList from "./DraftList";
import { FaEnvelope, FaPlus, FaUnlink, FaInstagram } from "react-icons/fa";
import { Button, Dropdown } from "react-bootstrap";
import MessagesModal from "./MessageModal";
import InstagramPostModal from "./InstagramPostModal";
import Swal from "sweetalert2";
import SmartScheduleModal from "./SmartScheduleModal";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import instajson from "../../../json/insta.json";
import instagramicon from "../../../json/instaicon.json";
import ScheduleInstagramPostModal from "./CreateScheduleDraftModal";
import FullAutomatedPostModal from "./FullAutomatedPostModal";
import { useNavigate } from "react-router-dom";

export default function InstagramAccount() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const account = useSelector((state) => state.instagram.account);
  const drafts = useSelector((state) => state.instagram.drafts);
  const plan = useSelector((state) => state.session.userPlan);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSchedulePostModal, setShowSchedulePostModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [showFullAutomatedModal, setShowFullAutomatedModal] = useState(false);
  const [authSuccessPending, setAuthSuccessPending] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authMsgIndex, setAuthMsgIndex] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);

  const scheduledRef = useRef(null);

  const authMessages = t("marketing.instagram.auth_messages", { returnObjects: true });

  const scrollToScheduled = () => {
    scheduledRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchInstagram = async () => {
      setLoading(true);
      try {
        await dispatch(getInstagramThunk());
      } finally {
        setLoading(false);
      }
    };
    fetchInstagram();
  }, [dispatch]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = getToken();
      try {
        const res = await fetch("/api/instagram-account/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (account?.instagram_business_id) {
      fetchProfile();
      dispatch(getInstagramDraftsThunk());
    }
  }, [account?.instagram_business_id, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      setAuthSuccessPending(true);
      setAuthMsgIndex(0);
      setAuthMessage(authMessages[0]);

      const interval = setInterval(() => {
        setAuthMsgIndex((prev) => {
          const next = prev + 1;
          if (next < authMessages.length) {
            setAuthMessage(authMessages[next]);
          }
          return next;
        });
      }, 1500);

      dispatch(getInstagramThunk()).finally(() => {
        setTimeout(() => {
          clearInterval(interval);
          setAuthSuccessPending(false);
        }, 5000);
      });
    } else if (status === "cancelled") {
      Swal.fire({
        title: t("marketing.instagram.swal.connect_cancelled"),
        icon: "info",
        timer: 1000,
        showConfirmButton: false,
      });
    } else if (status === "error") {
      Swal.fire({
        title: t("marketing.instagram.swal.connect_error"),
        icon: "error",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  }, [dispatch]);

  const handlePostSuccess = async () => {
    const token = getToken();
    const res = await fetch("/api/instagram-account/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
  };

  const handleConnectClick = async () => {
    if (!plan?.marketing_enabled) {
      Swal.fire({
        icon: "warning",
        title: t("marketing.instagram.swal.access_denied"),
        text: t("marketing.instagram.swal.access_denied_msg"),
        confirmButtonText: t("marketing.instagram.swal.upgrade_btn"),
      }).then((result) => {
        if (result.isConfirmed) navigate("/plans");
      });
      return;
    }

    try {
      setApiLoading(true);
      const token = getToken();
      const res = await fetch("/api/instagram-account/connect", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("OAuth redirect error:", error);
      Swal.fire(t("common.error"), t("marketing.instagram.swal.connect_error"), "error");
    } finally {
      setApiLoading(false);
    }
  };

  const handleDisconnectClick = async () => {
    const result = await Swal.fire({
      title: t("marketing.instagram.swal.disconnect_title"),
      text: t("marketing.instagram.swal.disconnect_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("marketing.instagram.swal.disconnect_confirm"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setApiLoading(true);
      const token = getToken();
      const res = await fetch("/api/instagram-account/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      Swal.fire({
        title: t("marketing.instagram.swal.disconnected_title"),
        text: t("marketing.instagram.swal.disconnected_text"),
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      dispatch(getInstagramThunk());
      setProfile(null);
    } catch {
      Swal.fire(t("common.failed"), t("marketing.instagram.swal.disconnect_failed"), "error");
    } finally {
      setApiLoading(false);
    }
  };

  const renderProfile = () => {
    if (!profile) return null;
    return (
      <div 
        className="card shadow-sm mb-4 border-0 overflow-hidden container"
        style={{
          animation: "fadeInUp 0.6s ease-out",
        }}
      >
        <div className="card-body p-4">
          {/* Profile Header */}
          <div className="row align-items-center gy-3 gx-4 mb-4 pb-4 border-bottom">
            <div className="col-auto">
              <div style={{
                position: "relative",
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                padding: "4px",
                borderRadius: "50%",
                boxShadow: "0 4px 12px rgba(188, 24, 136, 0.3)"
              }}>
                <img
                  src={
                    profile.profile_picture_url ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile"
                  className="rounded-circle bg-white"
                  width="90"
                  height="90"
                  style={{ 
                    objectFit: "cover",
                    border: "3px solid white"
                  }}
                />
              </div>
            </div>
            <div className="col">
              <h4 className="mb-1 fw-bold" style={{ color: "#262626" }}>
                {profile.name || t("marketing.instagram.fallback_name")}
              </h4>
              <p className="text-muted mb-1 fs-6">@{profile.username}</p>
              <span 
                className="badge rounded-pill px-3 py-1" 
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: "500"
                }}
              >
                {profile.account_type} {t("marketing.instagram.account_badge")}
              </span>
            
            </div>

            <div className="col-12 col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end mt-3 mt-lg-0">
              <Button
                variant="outline-dark"
                className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-2"
                onClick={() => setShowMessagesModal(true)}
                style={{
                  transition: "all 0.3s ease",
                  fontWeight: "500"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <FaEnvelope />
                <span>{t("marketing.instagram.messages_btn")}</span>
              </Button>
              <Dropdown>
                <Dropdown.Toggle 
                  className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-0"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: "500",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaPlus />
                  <span>{t("marketing.instagram.new_post_btn")}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="border-0 shadow-lg" style={{ minWidth: "200px" }}>
                  <Dropdown.Item 
                    onClick={() => setShowPostModal(true)}
                    className="py-2 px-3"
                    style={{ transition: "background 0.2s ease" }}
                  >
                    <strong>{t("marketing.instagram.post_types.instant")}</strong>
                    <small className="d-block text-muted">{t("marketing.instagram.post_types.instant_desc")}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item 
                    onClick={() => setShowSchedulePostModal(true)}
                    className="py-2 px-3"
                  >
                    <strong>{t("marketing.instagram.post_types.schedule")}</strong>
                    <small className="d-block text-muted">{t("marketing.instagram.post_types.schedule_desc")}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item 
                    onClick={() => setShowSmartModal(true)}
                    className="py-2 px-3"
                  >
                    <strong>{t("marketing.instagram.post_types.ai_schedule")}</strong>
                    <small className="d-block text-muted">{t("marketing.instagram.post_types.ai_schedule_desc")}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item 
                    onClick={() => setShowFullAutomatedModal(true)}
                    className="py-2 px-3"
                  >
                    <strong>{t("marketing.instagram.post_types.full_automated")}</strong>
                    <small className="d-block text-muted">{t("marketing.instagram.post_types.full_automated_desc")}</small>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Stats Section */}
          <div className="row text-center mb-4 g-3">
            {[
              { label: t("marketing.instagram.posts_label"), value: profile?.media?.length ?? 0, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
              { label: t("marketing.instagram.followers_label"), value: profile.followers_count ?? 0, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
              { label: t("marketing.instagram.following_label"), value: profile.follows_count ?? 0, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
            ].map((item, i) => (
              <div key={i} className="col-4">
                <div 
                  className="p-3 rounded-3 h-100"
                  style={{
                    background: "white",
                    border: "1px solid #f0f0f0",
                    cursor: "default"
                  }}
            
                >
                  <div 
                    className="fw-bold mb-1"
                    style={{
                      fontSize: "1.75rem",
                      background: item.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-muted small fw-medium text-uppercase" style={{ letterSpacing: "0.5px" }}>
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Posts Section */}
          {profile.media?.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 pt-3">
                <h5 className="mb-0 fw-bold" style={{ color: "#262626" }}>{t("marketing.instagram.recent_posts")}</h5>
                <button
                  className="btn btn-link p-0 text-decoration-none fw-medium"
                  onClick={scrollToScheduled}
                  style={{
                    color: "#667eea",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#764ba2";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#667eea";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {t("marketing.instagram.view_scheduled")}
                </button>
              </div>
              <div className="row g-3">
                {profile.media.slice(0, 6).map((item, idx) => (
                  <div 
                    className="col-6 col-md-4 col-lg-3" 
                    key={item.id}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <div 
                      className="card h-100 border-0 overflow-hidden"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                      }}
                    >
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <div style={{ position: "relative", overflow: "hidden" }}>
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt="Instagram Post"
                            className="w-100"
                            style={{ 
                              objectFit: "cover", 
                              height: "180px",
                              transition: "transform 0.3s ease"
                            }}
            
                          />
                          <div 
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              color: "white",
                              fontSize: "0.75rem",
                     
                            }}
                          >
                            <FaInstagram className="me-1" />
                            {t("marketing.instagram.view_post")}
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div 
                className="d-inline-block p-4 rounded-circle mb-3"
                style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}
              >
                <FaInstagram size={40} color="white" />
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#262626" }}>{t("marketing.instagram.no_posts")}</h5>
              <p className="text-muted mb-0">
                {t("marketing.instagram.no_posts_desc")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (authSuccessPending) {
    return (
      <div 
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ 
          minHeight: "60vh",
          animation: "fadeIn 0.5s ease-out"
        }}
      >
        <Lottie animationData={instajson} loop autoplay style={{ width: 320 }} />
        <h4 className="fw-bold mb-2 mt-3" style={{ color: "#262626" }}>
          {t("marketing.instagram.preparing_dashboard")}
        </h4>
        <p 
          className="text-muted mb-0"
          style={{
            animation: "pulse 1.5s ease-in-out infinite"
          }}
        >
          {authMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .dropdown-item:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
          }
        `}
      </style>

      {/* Global API Loading Overlay */}
      {apiLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{
            zIndex: 9999,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.3s ease-out"
          }}
        >
          <Lottie animationData={instajson} loop autoplay style={{ width: 200 }} />
          <p className="text-muted mt-3 fw-medium" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
            {t("marketing.instagram.processing_request")}
          </p>
        </div>
      )}

      <div
        className="container my-4"
        style={{
          opacity: loading ? 0 : 1,
          transform: loading ? "translateY(20px)" : "translateY(0)",
          transition: "all 0.6s ease-out"
        }}
      >
        {/* Header */}
        <div 
          className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4 p-4 rounded-3"
          style={{
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)"
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div 
              className="p-2 rounded-3"
              style={{
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                boxShadow: "0 4px 12px rgba(188, 24, 136, 0.3)"
              }}
            >
              <FaInstagram size={28} color="white" />
            </div>
            <div>
              <h4 className="mb-1 fw-bold" style={{ color: "#262626" }}>
                {t("marketing.instagram.title")}
              </h4>
              <p className="mb-0 text-muted small">
                {t("marketing.instagram.desc")}
              </p>
            </div>
          </div>

          {account && !loading && (
            <Button
              variant="outline-danger"
              className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill border-2"
              onClick={handleDisconnectClick}
              style={{
                fontWeight: "500",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FaUnlink />
              <span>{t("marketing.instagram.disconnect_btn")}</span>
            </Button>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div 
            className="text-center py-5"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <Lottie animationData={instajson} loop autoplay style={{ width: 280, margin: "0 auto" }} />
            <p className="mt-4 text-muted fw-medium" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
              {t("marketing.instagram.loading_data")}
            </p>
          </div>
        ) : !account ? (
          <div 
            className="card border-0 shadow-sm p-5 text-center"
            style={{
              background: "white",
              borderRadius: "16px",
              animation: "fadeInUp 0.6s ease-out"
            }}
          >
            <div className="mb-4 d-flex justify-content-center">
              <div style={{ width: 240 }}>
                <Lottie animationData={instagramicon} loop autoplay />
              </div>
            </div>
            <h2 className="fw-bold mb-3" style={{ color: "#262626" }}>
              {t("marketing.instagram.connect_title")}
            </h2>
            <p className="text-muted fs-6 mb-4 mx-auto" style={{ maxWidth: 560, lineHeight: "1.6" }}>
              <strong style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>{t("marketing.instagram.ai_brand")}</strong> — {t("marketing.instagram.connect_desc")}
            </p>
            <button 
              className="btn btn-lg px-5 py-3 rounded-pill border-0 fw-semibold mx-auto"
              onClick={handleConnectClick}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #f01f76ff 100%)",
                color: "white",
                maxWidth: "320px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.3)";
              }}
            >
              <FaInstagram className="me-2" />
              {t("marketing.instagram.connect_btn")}
            </button>
          </div>
        ) : profile ? (
          <>
            {renderProfile()}
            <div ref={scheduledRef} style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
              <DraftsList
                drafts={drafts}
                onCreateClick={() => setShowSmartModal(true)}
              />
            </div>
          </>
        ) : (
          <div 
            className="card border-0 shadow-sm p-4 text-center"
            style={{
              background: "white",
              animation: "fadeIn 0.5s ease-out"
            }}
          >
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">{t("marketing.instagram.loading_profile")}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <MessagesModal
        show={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        restaurantId={account?.restaurant_id}
      />
      <InstagramPostModal
        show={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPosted={handlePostSuccess}
      />
      <SmartScheduleModal
        show={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onPublish={async () => {
          await dispatch(getInstagramDraftsThunk());
        }}
        drafts={drafts}
      />
      <ScheduleInstagramPostModal
        show={showSchedulePostModal}
        onClose={() => setShowSchedulePostModal(false)}
        onPosted={async () => {
          await dispatch(getInstagramDraftsThunk());
        }}
      />
      <FullAutomatedPostModal
        show={showFullAutomatedModal}
        onClose={() => setShowFullAutomatedModal(false)}
        initialEnabled={account?.full_automated_post_enabled || false}
        initialPostsPerWeek={account?.posts_per_week || 1}
      />
    </>
  );
}
