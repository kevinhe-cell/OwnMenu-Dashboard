import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getInstagramThunk } from "../../../store/instagram";

export default function FullAutomatedPostModal({
  show,
  onClose,
  initialEnabled = false,
  initialPostsPerWeek = 1,
}) {
  const { t } = useTranslation();
  const [fullAutomatedEnabled, setFullAutomatedEnabled] = useState(initialEnabled);
  const [postsPerWeek, setPostsPerWeek] = useState(initialPostsPerWeek);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Update state when props change
  useEffect(() => {
    setFullAutomatedEnabled(initialEnabled);
    setPostsPerWeek(initialPostsPerWeek);
  }, [initialEnabled, initialPostsPerWeek]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/instagram-account/automated-post-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_automated_post_enabled: fullAutomatedEnabled,
          posts_per_week: postsPerWeek,
        }),
      });

      if (res.ok) {
        await dispatch(getInstagramThunk());
        Swal.fire({
          icon: "success",
          title: t("marketing.automated_post_settings.swal_success_title"),
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
      } else {
        const error = await res.json();
        Swal.fire(t("common.error"), error.error || t("marketing.automated_post_settings.save_fail"), "error");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      Swal.fire(t("common.error"), t("marketing.automated_post_settings.save_fail"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={loading ? null : onClose}
      centered
      size="md"
      backdrop={loading ? "static" : true}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="fw-semibold">
          🤖 {t("marketing.automated_post_settings.title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-1" style={{ color: "#262626" }}>
                {t("marketing.automated_post_settings.enable_label")}
              </h6>
              <p className="text-muted small mb-0">
                {t("marketing.automated_post_settings.enable_desc")}
              </p>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="fullAutomatedToggle"
                checked={fullAutomatedEnabled}
                onChange={(e) => setFullAutomatedEnabled(e.target.checked)}
                disabled={loading}
                style={{
                  width: "3rem",
                  height: "1.5rem",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              />
            </div>
          </div>

          {fullAutomatedEnabled && (
            <div className="mt-4 pt-3 border-top">
              <Form.Group>
                <Form.Label className="fw-bold mb-2">
                  {t("marketing.automated_post_settings.posts_per_week_label")}
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setPostsPerWeek(Math.max(1, postsPerWeek - 1))}
                    disabled={postsPerWeek <= 1 || loading}
                    style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
                  >
                    -
                  </Button>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      minWidth: "40px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {postsPerWeek}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setPostsPerWeek(Math.min(10, postsPerWeek + 1))}
                    disabled={postsPerWeek >= 10 || loading}
                    style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
                  >
                    +
                  </Button>
                </div>
                <Form.Text className="text-muted d-block mt-2">
                  {t("automated_post_settings.posts_per_week_desc")}
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          {loading ? t("automated_post_settings.saving_btn") : t("automated_post_settings.save_btn")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
