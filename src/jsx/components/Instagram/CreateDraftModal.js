import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { createDraftThunk } from "../../../store/instagram";

export default function CreateDraftModal({ show, onClose, onDraftCreated }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("IMAGE");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmitDraft = async (e) => {
    e.preventDefault();

    if (!mediaUrl.trim()) {
      setError(t("marketing.create_draft.error_url_required"));
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await dispatch(
        createDraftThunk({
          media_url: mediaUrl.trim(),
          caption: caption.trim(),
          media_type: mediaType,
        }),
      );

      setSuccessMsg(t("marketing.create_draft.success_msg"));
      setMediaUrl("");
      setCaption("");
      setMediaType("IMAGE");

      if (onDraftCreated) {
        onDraftCreated(); // notify parent to refresh drafts list
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || t("common.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccessMsg("");
    setMediaUrl("");
    setCaption("");
    setMediaType("IMAGE");
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("marketing.create_draft.title")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <Form onSubmit={handleSubmitDraft}>
          <Form.Group controlId="mediaUrl" className="mb-3">
            <Form.Label>{t("marketing.create_draft.media_url_label")}</Form.Label>
            <Form.Control
              type="url"
              placeholder={t("marketing.create_draft.media_url_placeholder")}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              required
              disabled={submitting}
            />
            <Form.Text className="text-muted">
              {t("marketing.create_draft.media_url_help")}
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="caption" className="mb-3">
            <Form.Label>{t("marketing.create_draft.caption_label")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t("marketing.create_draft.caption_placeholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group controlId="mediaType" className="mb-3">
            <Form.Label>{t("marketing.create_draft.media_type_label")}</Form.Label>
            <Form.Select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              disabled={submitting}
            >
              <option value="IMAGE">{t("marketing.create_draft.media_type_image")}</option>
              <option value="VIDEO">{t("marketing.create_draft.media_type_video")}</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t("marketing.create_draft.creating_btn") : t("marketing.create_draft.create_btn")}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
