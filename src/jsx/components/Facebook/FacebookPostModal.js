import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "../../../store/utlits";
import { ArrowLeft, ArrowRight, X, Images } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import SmartMediaPickerModal from "../common/SmartMediaPickerModal";

export default function FacebookPostModal({ show, onClose, onPosted }) {
  const { t } = useTranslation();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [hasLargeFiles, setHasLargeFiles] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const maxItems = 10;
  const LARGE_FILE_SIZE_MB = 20; // 20MB threshold

  useEffect(() => {
    if (!show) setShowGalleryPicker(false);
  }, [show]);

  const postingSteps = t("instagram_post_modal.steps", { returnObjects: true });

  const isVideoFile = (file) => {
    return file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
  };

  const isImageFile = (file) => {
    return file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  };

  const currentFormat = () => {
    const first = mediaFiles?.[0]?.file;
    if (!first) return null;
    if (isImageFile(first)) return "image";
    if (isVideoFile(first)) return "video";
    return null;
  };

  const acceptForCurrentFormat = () => {
    const fmt = currentFormat();
    if (fmt === "image") return "image/*";
    if (fmt === "video") return "video/*";
    return "image/*,video/*";
  };

  const getFileSizeMB = (file) => {
    return file.size / (1024 * 1024);
  };

  const generateCaptionFromMedia = async (file) => {
    if (!isImageFile(file) && !isVideoFile(file)) return;
    
    try {
      setGeneratingCaption(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file); // Backend accepts both images and videos via this field

      const res = await fetch("/api/facebook-account/generate-caption", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn("Caption generation failed:", data.error);
        return;
      }

      if (data.caption) {
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
    const fmt = currentFormat();

    for (const file of files) {
      if (!isImageFile(file) && !isVideoFile(file)) {
        Swal.fire({
          icon: "warning",
          title: t("instagram_post_modal.swal.unsupported_title"),
          text: t("instagram_post_modal.swal.unsupported_text", { name: file.name }),
        });
        continue;
      }

      if (fmt === "image" && isVideoFile(file)) {
        Swal.fire({
          icon: "info",
          title: t("instagram_post_modal.swal.format_error_title"),
          text: t("instagram_post_modal.swal.format_error_text_image"),
          timer: 2200,
          showConfirmButton: false,
        });
        continue;
      }
      if (fmt === "video" && isImageFile(file)) {
        Swal.fire({
          icon: "info",
          title: t("instagram_post_modal.swal.format_error_title"),
          text: t("instagram_post_modal.swal.format_error_text_video"),
          timer: 2200,
          showConfirmButton: false,
        });
        continue;
      }

      const fileSizeMB = getFileSizeMB(file);
      if (fileSizeMB > LARGE_FILE_SIZE_MB) {
        hasLarge = true;
      }

      newItems.push({ id: uuidv4(), file });
    }

    const allItems = [...mediaFiles, ...newItems].slice(0, 10);
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

  const handleGalleryPick = async (files) => {
    const newItems = [];
    let hasLarge = false;
    const fmt = currentFormat();
    for (const file of files) {
      if (!isImageFile(file) && !isVideoFile(file)) {
        Swal.fire({
          icon: "warning",
          title: t("instagram_post_modal.swal.unsupported_title"),
          text: t("instagram_post_modal.swal.unsupported_text", { name: file.name }),
        });
        continue;
      }
      if (fmt === "image" && isVideoFile(file)) continue;
      if (fmt === "video" && isImageFile(file)) continue;
      if (getFileSizeMB(file) > LARGE_FILE_SIZE_MB) {
        hasLarge = true;
      }
      newItems.push({ id: uuidv4(), file });
    }
    if (newItems.length === 0) return;

    const allItems = [...mediaFiles, ...newItems].slice(0, maxItems);
    setMediaFiles(allItems);
    setHasLargeFiles(
      hasLarge ||
        allItems.some((item) => getFileSizeMB(item.file) > LARGE_FILE_SIZE_MB),
    );

    if (mediaFiles.length === 0 && !caption.trim()) {
      const firstFile = newItems[0].file;
      if (isImageFile(firstFile) || isVideoFile(firstFile)) {
        await generateCaptionFromMedia(firstFile);
      }
    }
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

  const handleSubmit = async () => {
    if (mediaFiles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("instagram_post_modal.swal.missing_content_title"),
        text: t("instagram_post_modal.swal.missing_content_text"),
      });
      return;
    }
    
    // Note: Caption is optional - backend will auto-generate if missing

    // Show warning for large files
    if (hasLargeFiles) {
      const result = await Swal.fire({
        icon: "info",
        title: t("instagram_post_modal.swal.large_file_title"),
        html: t("instagram_post_modal.swal.large_file_text"),
        showCancelButton: true,
        confirmButtonText: t("instagram_post_modal.swal.continue_btn"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    let progressInterval = null;
    try {
      setLoading(true);
      setCurrentStep(0);
      
      // Simulate progress steps (since backend doesn't send real-time updates)
      progressInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < postingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000); // Move to next step every 2 seconds

      const token = getToken();
      const formData = new FormData();
      mediaFiles.forEach((item) => {
        formData.append(`media`, item.file);
      });
      formData.append("caption", caption);

      const res = await fetch("/api/facebook-account/post", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setCurrentStep(postingSteps.length - 1); // Ensure we show final step

      const data = await res.json();
      if (!res.ok) {
        setCurrentStep(0);
        return Swal.fire({
          icon: "error",
          title: t("instagram_post_modal.swal.upload_failed_title"),
          text: data.error || t("instagram_post_modal.swal.upload_failed_text"),
        });
      }

      // ✅ Success - show different message for large files
      if (hasLargeFiles) {
        await Swal.fire({
          icon: "success",
          title: t("instagram_post_modal.swal.success_large_title"),
          html: t("instagram_post_modal.swal.success_large_text"),
          timer: 5000,
          showConfirmButton: true,
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: t("instagram_post_modal.swal.success_title"),
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setCaption("");
      setMediaFiles([]);
      setHasLargeFiles(false);
      if (onPosted) onPosted(); // ✅ Notify parent
      onClose();
    } catch (err) {
      console.error("Post error:", err);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setCurrentStep(0);
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("common.failed"),
      });
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
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

  return (
    <>
    <Modal
      show={show}
      onHide={loading ? null : onClose}
      size="xl"
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      enforceFocus={false}
    >
      {loading && (
        <div className="w-100 bg-light border-bottom">
          <div className="px-4 py-3">
            <div className="d-flex align-items-center mb-3">
              <Spinner
                animation="border"
                size="sm"
                className="me-3 text-primary"
                style={{ width: "24px", height: "24px" }}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold text-dark mb-1">
                  {postingSteps[currentStep]?.title || t("common.processing")}
                </div>
                <div className="text-muted small">
                  {postingSteps[currentStep]?.description || t("common.wait")}
                </div>
              </div>
            </div>
            <div className="progress" style={{ height: "6px", borderRadius: "10px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                style={{ 
                  width: `${((currentStep + 1) / postingSteps.length) * 100}%`,
                  transition: "width 0.5s ease"
                }}
              />
            </div>
            <div className="text-center mt-2">
              <small className="text-muted">
                {t("instagram_post_modal.step_indicator", { current: currentStep + 1, total: postingSteps.length })}
              </small>
            </div>
          </div>
        </div>
      )}
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold fs-4">
          {t("instagram_post_modal.title_fb")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-white px-4 pt-4 pb-3">
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">{t("instagram_post_modal.upload_label")}</Form.Label>
          <div className="d-flex flex-wrap align-items-stretch gap-2 mb-2">
            <Form.Control
              type="file"
              accept={acceptForCurrentFormat()}
              multiple
              onChange={handleFileUpload}
              disabled={loading}
              className="flex-grow-1"
              style={{ minWidth: 200 }}
            />
            <Button
              variant="outline-primary"
              className="text-nowrap"
              type="button"
              disabled={loading || mediaFiles.length >= maxItems}
              onClick={() => setShowGalleryPicker(true)}
            >
              <Images className="me-1" />
              {t("instagram_post_modal.from_gallery")}
            </Button>
          </div>
          <Form.Text className="text-muted">
            {t("instagram_post_modal.upload_fb_text", { max: maxItems })}
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
            <Row
              className="g-4 flex-nowrap overflow-auto pb-3"
              style={{ marginBottom: "1rem" }}
            >
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

                      <div
                        className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 small rounded-end"
                        style={{ fontSize: 12 }}
                      >
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
                          className={index === 0 ? "text-muted" : "text-dark"}
                        />

                        <ArrowRight
                          onClick={() => moveRight(index)}
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
                          className={
                            index === mediaFiles.length - 1
                              ? "text-muted"
                              : "text-dark"
                          }
                        />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}

        <Form.Group className="mt-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="fw-semibold d-flex justify-content-between align-items-center">
              <span>{t("instagram_post_modal.caption_label")} <span className="text-muted small">{t("instagram_post_modal.caption_optional")}</span></span>
            </Form.Label>
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
                {t("marketing.instagram_post_modal.posting_btn")}
              </>
            ) : (
              t("marketing.instagram_post_modal.post_now_btn")
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
    <SmartMediaPickerModal
      show={showGalleryPicker}
      onHide={() => setShowGalleryPicker(false)}
      maxAdd={maxItems - mediaFiles.length}
      onPickFiles={handleGalleryPick}
    />
    </>
  );
}
