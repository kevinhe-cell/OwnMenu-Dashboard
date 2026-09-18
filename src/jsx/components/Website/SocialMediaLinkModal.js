import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

export default function SocialMediaLinksModal({ show, onHide, onSave, initialLinks }) {
  const [links, setLinks] = useState({
    instagram: "",
    facebook: "",
    google: "",
    tiktok: "",
  });

  useEffect(() => {
    if (show && initialLinks) {
      setLinks((prev) => ({ ...prev, ...initialLinks }));
    }
  }, [show, initialLinks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    onSave(links);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Social Media Links</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          These links appear on your live site in the <strong>footer</strong> and on <strong>contact</strong> pages when at least one URL is set.
          For Instagram feeds, use <strong>Add Section</strong> where supported.
        </Alert>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="url"
              name="instagram"
              value={links.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourhandle"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Facebook</Form.Label>
            <Form.Control
              type="url"
              name="facebook"
              value={links.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Google</Form.Label>
            <Form.Control
              type="url"
              name="google"
              value={links.google}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>TikTok</Form.Label>
            <Form.Control
              type="url"
              name="tiktok"
              value={links.tiktok}
              onChange={handleChange}
              placeholder="https://www.tiktok.com/@yourhandle"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
