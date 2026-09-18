import React, { useState, useRef, useEffect } from "react";
import { Modal, Form, Button, Alert, ProgressBar } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import Lottie from "lottie-react";
import calendarlottie from "../../../json/calendar.json";
import Swal from "sweetalert2";
import { useTranslation, Trans } from "react-i18next";

export default function SmartScheduleModal({
  show,
  onClose,
  onPublish,
  drafts,
}) {
  const { t } = useTranslation();
  const [postsPerWeek, setPostsPerWeek] = useState(2);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const aiDrafts = drafts?.filter((d) => d.created_by === "AI") || [];
  const aiDraftCount = aiDrafts.length;

  const requiredImages = postsPerWeek * 4;

  const isVideoFile = (file) => {
    return file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
  };

  const isImageFile = (file) => {
    return file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  };
  const [statusIndex, setStatusIndex] = useState(0);
  const statusMessages = t("smart_schedule.status_messages", { returnObjects: true });

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const mediaFiles = files.filter((file) => isImageFile(file) || isVideoFile(file));
    
    // Show warning for unsupported files
    const unsupported = files.filter((file) => !isImageFile(file) && !isVideoFile(file));
    if (unsupported.length > 0) {
      Swal.fire({
        icon: "warning",
        title: t("smart_schedule.swal.unsupported_title"),
        text: t("smart_schedule.swal.unsupported_text", { count: unsupported.length }),
      });
    }
    
    setImageFiles((prev) => [...prev, ...mediaFiles]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSchedule = async () => {
    if (imageFiles.length < requiredImages) {
      setError(t("smart_schedule.error_min_images", { count: requiredImages }));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("postsPerWeek", postsPerWeek);
      imageFiles.forEach((file) => formData.append("media", file));

      const res = await fetch("/api/instagram-account/drafts/smart-schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("common.failed"));
      setImageFiles([]);
      setPostsPerWeek(2);
      if (onPublish) onPublish();
      setTimeout(() => {
        setLoading(false);
        onClose();
        Swal.fire({
          icon: "success",
          title: t("smart_schedule.swal.success_title"),
          timer: 2000,
          showConfirmButton: false,
        });
      }, 2000); // show Lottie for 2 more seconds
    } catch (err) {
      console.error(err);
      setError(t("smart_schedule.error_upload_failed"));
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => !loading && onClose()}
      size="lg"
      centered
      backdrop="static"
      keyboard={!loading}
    >
      {loading ? (
        <Modal.Body className="text-center py-5">
          <Lottie
            animationData={calendarlottie}
            loop={true}
            style={{ height: 250 }}
          />
          <h5 className="fw-bold mt-4">{statusMessages[statusIndex]}</h5>
          <p className="text-muted small">
            {t("smart_schedule.loading_desc")}
          </p>
        </Modal.Body>
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{t("smart_schedule.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {aiDraftCount > 0 && (
              <Alert variant="primary" className="text-center mb-4 fw-medium">
                <Trans 
                  i18nKey="smart_schedule.alert_replace" 
                  values={{ count: aiDraftCount, plural: aiDraftCount > 1 ? "s" : "" }}
                  components={{ strong: <strong /> }}
                />
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">{t("smart_schedule.duration_label")}</Form.Label>
              <div className="form-control-plaintext">{t("smart_schedule.duration_val")}</div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                {t("smart_schedule.frequency_label")}
              </Form.Label>
              <Form.Select
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(Number(e.target.value))}
              >
                {[...Array(7)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {t("smart_schedule.posts_per_week", { count: i + 1, plural: i > 0 ? "s" : "" })}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">{t("smart_schedule.upload_label")}</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              <Form.Text className="text-muted">
                {t("smart_schedule.upload_desc")}
              </Form.Text>
              <div className="mt-2 text-muted small">
                {t("smart_schedule.progress_label", { current: imageFiles.length, total: requiredImages })}
              </div>
              <ProgressBar
                now={(imageFiles.length / requiredImages) * 100}
                className="mt-2"
              />
              {imageFiles.length > 0 && (
                <div className="d-flex flex-wrap mt-3" style={{ gap: "10px" }}>
                  {imageFiles.map((file, index) => {
                    const isVideo = isVideoFile(file);
                    const preview = URL.createObjectURL(file);
                    return (
                      <div key={index} className="position-relative">
                        {isVideo ? (
                          <video
                            src={preview}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={preview}
                            alt="preview"
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                        {isVideo && (
                          <div
                            className="position-absolute top-0 start-0 bg-dark text-white px-1 small"
                            style={{ fontSize: 8, borderRadius: "4px 0 4px 0" }}
                          >
                            VIDEO
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeImage(index)}
                          className="position-absolute top-0 end-0 p-0 px-1"
                          style={{ fontSize: 10 }}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.Group>

            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}
            {imageFiles.length < requiredImages && !error && (
              <Alert variant="warning" className="text-center">
                {t("marketing.smart_schedule.warning_upload_required", { count: requiredImages })}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              className="flex-grow-1"
              onClick={handleSchedule}
              disabled={loading || imageFiles.length === 0}
            >
              {loading ? t("marketing.smart_schedule.processing_btn") : t("marketing.smart_schedule.schedule_btn")}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
