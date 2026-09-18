import React, { useState } from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { ArrowLeft, ArrowRight, X } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import moment from "moment";

export default function EditDraftForm({ draft, onCancel, onSaveSuccess }) {
  const { t } = useTranslation();
  const [caption, setCaption] = useState(draft.caption || "");
  const [scheduledTime, setScheduledTime] = useState(
    moment(draft.delivery_date).format("YYYY-MM-DDTHH:mm"),
  );
  const [mediaItems, setMediaItems] = useState(
    JSON.parse(draft.media_url || "[]").map((url) => ({
      type: "existing",
      url,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const maxItems = 10;

  const isVideoUrl = (url) => {
    if (!url) return false;
    return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
  };

  const isVideoFile = (file) => {
    if (!file) return false;
    return file.type?.startsWith("video/") || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);
  };

  const moveLeft = (index) => {
    if (index <= 0) return;
    const updated = [...mediaItems];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setMediaItems(updated);
  };

  const moveRight = (index) => {
    if (index >= mediaItems.length - 1) return;
    const updated = [...mediaItems];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setMediaItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...mediaItems];
    updated.splice(index, 1);
    setMediaItems(updated);
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files).slice(
      0,
      maxItems - mediaItems.length,
    );
    const newItems = files.map((file) => ({ type: "new", file }));
    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const regenerateCaption = async () => {
    try {
      setGeneratingCaption(true);
      const token = getToken();
      const firstImage = mediaItems.find(
        (item) => item.type === "existing",
      )?.url;
      if (!firstImage) return;

      const res = await fetch("/api/instagram-account/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url: firstImage }),
      });

      const data = await res.json();
      if (res.ok && data.caption) {
        setCaption(data.caption);
      } else {
        throw new Error(data.error || t("common.failed"));
      }
    } catch (err) {
      console.error("Caption generation error:", err);
      Swal.fire({ icon: "error", title: t("common.error"), text: err.message });
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleSubmit = async () => {
    if (!caption || !scheduledTime || mediaItems.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: t("marketing.schedule_post.swal.missing_info_title"),
        text: t("marketing.schedule_post.swal.missing_info_text"),
      });
    }

    try {
      setLoading(true);
      const token = getToken();
      const formData = new FormData();

      const existingUrls = [];
      const newFiles = [];
      const mediaOrder = [];

      mediaItems.forEach((item, idx) => {
        if (item.type === "existing") {
          existingUrls.push(item.url);
          mediaOrder.push(`url:${item.url}`);
        } else if (item.type === "new") {
          newFiles.push(item.file);
          mediaOrder.push(`new:${newFiles.length - 1}`);
        }
      });

      formData.append("caption", caption);
      formData.append("delivery_date", new Date(scheduledTime).toISOString());
      formData.append("existing_media_urls", JSON.stringify(existingUrls));
      formData.append("media_order", JSON.stringify(mediaOrder));
      newFiles.forEach((file) => formData.append("media", file));

      const res = await fetch(`/api/instagram-account/draft/${draft.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");

      Swal.fire({
        icon: "success",
        title: t("marketing.edit_draft.swal_success_title"),
        timer: 1500,
        showConfirmButton: false,
      });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({ icon: "error", title: t("common.error"), text: t("common.failed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="fw-semibold mb-4">{t("marketing.edit_draft.title")}</h4>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">{t("marketing.instagram_post_modal.upload_label")}</Form.Label>
        <Form.Control
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleAddFiles}
        />
        <Form.Text className="text-muted">
          {t("marketing.instagram_post_modal.upload_text")}
        </Form.Text>
      </Form.Group>

      <div className="mb-3 text-muted small">
        {t("marketing.instagram_post_modal.reorder_desc")}
      </div>
      <Row className="g-4 flex-nowrap overflow-auto pb-3">
        {mediaItems.map((item, index) => {
          const preview =
            item.type === "existing"
              ? item.url
              : URL.createObjectURL(item.file);
          const isVideo = item.type === "existing" 
            ? isVideoUrl(item.url)
            : isVideoFile(item.file);
          return (
            <Col
              key={index}
              xs={6}
              sm={4}
              md={3}
              lg={3}
              className="flex-shrink-0"
              style={{ minWidth: 180 }}
            >
              <div
                className="border rounded shadow-sm position-relative"
                style={{
                  width: "100%",
                  paddingBottom: "100%",
                  backgroundColor: "#fafafa",
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                }}
              >
                {isVideo ? (
                  <video
                    src={preview}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={preview}
                    alt="media"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 small rounded-end">
                  {index + 1}
                </div>
                <X
                  onClick={() => removeItem(index)}
                  className="position-absolute top-0 end-0 m-1"
                  style={{
                    cursor: "pointer",
                    fontSize: "24px",
                    color: "#dc3545",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderRadius: "50%",
                    padding: "2px",
                  }}
                />
                <div className="position-absolute top-50 start-0 translate-middle-y w-100 d-flex justify-content-between px-2">
                  <ArrowLeft
                    onClick={() => moveLeft(index)}
                    className={index === 0 ? "text-muted" : "text-dark"}
                    style={{
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      fontSize: 24,
                      backgroundColor:
                        index === 0 ? "transparent" : "rgba(255,255,255,0.85)",
                      borderRadius: "50%",
                      padding: "4px",
                    }}
                  />
                  <ArrowRight
                    onClick={() => moveRight(index)}
                    className={
                      index === mediaItems.length - 1
                        ? "text-muted"
                        : "text-dark"
                    }
                    style={{
                      cursor:
                        index === mediaItems.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontSize: 24,
                      backgroundColor:
                        index === mediaItems.length - 1
                          ? "transparent"
                          : "rgba(255,255,255,0.85)",
                      borderRadius: "50%",
                      padding: "4px",
                    }}
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <Form.Group className="mt-4 mb-3">
        <Form.Label className="fw-semibold">Caption</Form.Label>
        <div className="d-flex justify-content-between align-items-center mb-2">
          {mediaItems.length > 0 && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={regenerateCaption}
              disabled={generatingCaption}
            >
              {generatingCaption ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("marketing.instagram_post_modal.generating_caption")}
                </>
              ) : (
                t("marketing.instagram_post_modal.regenerate_caption")
              )}
            </Button>
          )}
        </div>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder={
            generatingCaption
              ? t("marketing.instagram_post_modal.generating_caption")
              : t("marketing.instagram_post_modal.caption_placeholder")
          }
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={generatingCaption}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.schedule_post.time_label")}</Form.Label>
        <Form.Control
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          min={moment().format("YYYY-MM-DDTHH:mm")}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t("marketing.edit_draft.saving_btn")}
            </>
          ) : (
            t("marketing.edit_draft.save_btn")
          )}
        </Button>
      </div>
    </div>
  );
}
