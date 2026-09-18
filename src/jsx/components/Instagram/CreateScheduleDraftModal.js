import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "../../../store/utlits";
import { ArrowLeft, ArrowRight, X } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

export default function ScheduleInstagramPostModal({
  show,
  onClose,
  onPosted,
}) {
  const { t } = useTranslation();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [hasLargeFiles, setHasLargeFiles] = useState(false);
  const maxItems = 10;
  const LARGE_FILE_SIZE_MB = 20;

  const isVideoFile = (file) => {
    return file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
  };

  const isImageFile = (file) => {
    return file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  };

  const getFileSizeMB = (file) => {
    return file.size / (1024 * 1024);
  };

  useEffect(() => {
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour later
    setScheduledTime(defaultTime.toISOString().slice(0, 16)); // "YYYY-MM-DDTHH:mm"
  }, [show]);

  const generateCaptionFromMedia = async (file) => {
    if (!isImageFile(file) && !isVideoFile(file)) return;
    
    try {
      setGeneratingCaption(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file); // Backend accepts both images and videos via this field

      const res = await fetch("/api/instagram-account/generate-caption", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.caption) {
        setCaption(data.caption);
      }
    } catch (err) {
      console.error("Error generating caption:", err);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newItems = [];
    let hasLarge = false;

    for (const file of files) {
      if (!isImageFile(file) && !isVideoFile(file)) {
        Swal.fire({
          icon: "warning",
          title: t("instagram_post_modal.swal.unsupported_title"),
          text: t("instagram_post_modal.swal.unsupported_text", { name: file.name }),
        });
        continue;
      }

      const fileSizeMB = getFileSizeMB(file);
      if (fileSizeMB > LARGE_FILE_SIZE_MB) {
        hasLarge = true;
      }

      newItems.push({ id: uuidv4(), file });
    }

    const allItems = [...mediaFiles, ...newItems].slice(0, maxItems);
    setMediaFiles(allItems);
    setHasLargeFiles(hasLarge || allItems.some(item => getFileSizeMB(item.file) > LARGE_FILE_SIZE_MB));

    // Auto-generate caption for first file (image or video) if caption is empty
    if (mediaFiles.length === 0 && newItems.length > 0 && !caption.trim()) {
      const firstFile = newItems[0].file;
      if (isImageFile(firstFile) || isVideoFile(firstFile)) {
        await generateCaptionFromMedia(firstFile);
      }
    }

    e.target.value = "";
  };

  const moveLeft = (index) => {
    if (index <= 0) return;
    const updated = [...mediaFiles];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setMediaFiles(updated);
  };

  const moveRight = (index) => {
    if (index >= mediaFiles.length - 1) return;
    const updated = [...mediaFiles];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setMediaFiles(updated);
  };

  const removeItem = (id) => {
    const updated = mediaFiles.filter((item) => item.id !== id);
    setMediaFiles(updated);
    setHasLargeFiles(updated.some(item => getFileSizeMB(item.file) > LARGE_FILE_SIZE_MB));
  };

  const regenerateCaption = async () => {
    if (mediaFiles.length === 0) return;
    const firstFile = mediaFiles[0].file;
    if (isImageFile(firstFile) || isVideoFile(firstFile)) {
      await generateCaptionFromMedia(firstFile);
    } else {
      Swal.fire({
        icon: "info",
        title: t("instagram_post_modal.regenerate_caption"),
        text: t("common.media_type_restriction"),
      });
    }
  };

  const handleSubmit = async () => {
    if (mediaFiles.length === 0 || !scheduledTime) {
      Swal.fire({
        icon: "warning",
        title: t("schedule_post.swal.missing_info_title"),
        text: t("schedule_post.swal.missing_info_text"),
      });
      return;
    }
    
    // Note: Caption is optional - backend will auto-generate if missing

    try {
      setLoading(true);
      const token = getToken();
      const formData = new FormData();

      mediaFiles.forEach((item) => {
        formData.append(`media`, item.file);
      });

      formData.append("caption", caption);
      formData.append("delivery_date", new Date(scheduledTime).toISOString());

      const res = await fetch("/api/instagram-account/schedule", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        return Swal.fire({
          icon: "error",
          title: t("instagram_post_modal.swal.upload_failed_title"),
          text: data.error || t("common.failed"),
        });
      }

      await Swal.fire({
        icon: "success",
        title: t("schedule_post.swal.success_title"),
        timer: 2000,
        showConfirmButton: false,
      });

      setCaption("");
      setMediaFiles([]);
      if (onPosted) onPosted();
      onClose();
    } catch (err) {
      console.error("Scheduling error:", err);
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("common.failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={loading ? null : onClose}
      size="xl"
      centered
      backdrop={loading ? "static" : true}
    >
      {loading && (
        <div className="w-100">
          <div className="progress" style={{ height: "4px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold fs-4">
          {t("schedule_post.title_insta")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-white px-4 pt-4 pb-3">
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">{t("instagram_post_modal.upload_label")}</Form.Label>
          <Form.Control
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
          />
          <Form.Text className="text-muted">
            {t("instagram_post_modal.upload_text")}
          </Form.Text>
        </Form.Group>

        {hasLargeFiles && (
          <Alert variant="info" className="mb-3">
            <Alert.Heading className="h6 mb-1">
              <strong>{t("instagram_post_modal.large_file_alert")}</strong>
            </Alert.Heading>
            <p className="mb-0 small">
              {t("instagram_post_modal.large_file_desc")}
            </p>
          </Alert>
        )}

        {mediaFiles.length > 0 && (
          <>
            <div className="mb-3 text-muted small">
              {t("instagram_post_modal.reorder_desc")}
            </div>
            <Row className="g-4 flex-nowrap overflow-auto pb-3">
              {mediaFiles.map((item, index) => {
                const preview = URL.createObjectURL(item.file);
                const isVideo = isVideoFile(item.file);
                const fileSizeMB = getFileSizeMB(item.file).toFixed(1);
                
                return (
                  <Col
                    key={item.id}
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
                          alt=""
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
                      {isVideo && (
                        <div
                          className="position-absolute top-0 start-50 translate-middle-x bg-dark text-white px-2 py-1 small rounded-bottom"
                          style={{ 
                            fontSize: 11,
                            transform: "translateX(-50%)",
                            marginTop: "28px"
                          }}
                        >
                          VIDEO
                        </div>
                      )}
                      <div
                        className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-1 small"
                        style={{ fontSize: 10 }}
                      >
                        {fileSizeMB} MB
                      </div>
                      <X
                        onClick={() => removeItem(item.id)}
                        className="position-absolute top-0 end-0 m-1"
                        style={{
                          cursor: "pointer",
                          zIndex: 5,
                          fontSize: "26px",
                          color: "#dc3545",
                          backgroundColor: "rgba(255,255,255,0.85)",
                          borderRadius: "50%",
                          padding: "2px",
                        }}
                      />
                      <div
                        className="position-absolute top-50 start-0 translate-middle-y w-100 d-flex justify-content-between px-2"
                        style={{ zIndex: 4 }}
                      >
                        <ArrowLeft
                          onClick={() => moveLeft(index)}
                          className={index === 0 ? "text-muted" : "text-dark"}
                          style={{
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            fontSize: 26,
                            padding: 4,
                            backgroundColor:
                              index === 0
                                ? "transparent"
                                : "rgba(255,255,255,0.85)",
                            borderRadius: "50%",
                          }}
                        />
                        <ArrowRight
                          onClick={() => moveRight(index)}
                          className={
                            index === mediaFiles.length - 1
                              ? "text-muted"
                              : "text-dark"
                          }
                          style={{
                            cursor:
                              index === mediaFiles.length - 1
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 26,
                            padding: 4,
                            backgroundColor:
                              index === mediaFiles.length - 1
                                ? "transparent"
                                : "rgba(255,255,255,0.85)",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}

        <Form.Group className="mt-4 mb-3">
          <Form.Label className="fw-semibold">
            {t("instagram_post_modal.caption_label")} <span className="text-muted small">{t("instagram_post_modal.caption_optional")}</span>
          </Form.Label>
          <div className="d-flex justify-content-between align-items-center mb-2">
            {mediaFiles.length > 0 && isImageFile(mediaFiles[0]?.file) && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={regenerateCaption}
                disabled={generatingCaption}
              >
                {generatingCaption ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    {t("instagram_post_modal.generating_caption")}
                  </>
                ) : (
                  t("instagram_post_modal.regenerate_caption")
                )}
              </Button>
            )}
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={
              generatingCaption
                ? t("instagram_post_modal.generating_caption")
                : t("instagram_post_modal.caption_placeholder")
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={generatingCaption}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">{t("schedule_post.time_label")}</Form.Label>
          <Form.Control
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            disabled={loading}
            required
          />
        </Form.Group>

        <div className="text-end mt-3">
          <Button
            variant="secondary"
            className="me-2"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {t("schedule_post.scheduling_btn")}
              </>
            ) : (
              t("schedule_post.schedule_btn")
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
