import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getFacebookThunk } from "../../../store/facebook";

export default function FacebookFullAutomatedPostModal({
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
      const res = await fetch("/api/facebook-account/automated-post-settings", {
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
        await dispatch(getFacebookThunk());
        Swal.fire({
          icon: "success",
          title: t("automated_post_settings.swal_success_title"),
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
      } else {
        const error = await res.json();
        Swal.fire(t("common.error"), error.error || t("automated_post_settings.save_fail"), "error");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      Swal.fire(t("common.error"), t("automated_post_settings.save_fail"), "error");
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
          {t("automated_post_settings.title_fb")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-1" style={{ color: "#262626" }}>
                {t("automated_post_settings.enable_label")}
              </h6>
              <p className="text-muted small mb-0">
                {t("automated_post_settings.enable_desc_fb")}
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
            <div className="mt-4 pt-4 border-top">
              <Form.Group>
                <Form.Label className="fw-semibold mb-3">
                  {t("automated_post_settings.posts_per_week_label")}
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="7"
                    value={postsPerWeek}
                    onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <span
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontSize: "1.1rem",
                      minWidth: "50px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {postsPerWeek}
                  </span>
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
