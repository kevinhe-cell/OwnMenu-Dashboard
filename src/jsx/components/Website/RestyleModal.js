import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RestyleModal = ({
  show,
  onHide,
  themeOptions,
  selectedTheme,
  setSelectedTheme,
  onRestyle,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Choose Your Theme</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3">What theme layout do you want?</p>
        <Form.Select
          className="mb-4"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          {themeOptions.map((theme, idx) => (
            <option key={idx} value={theme}>
              {theme}
            </option>
          ))}
        </Form.Select>

        <Button variant="primary" className="w-100" onClick={onRestyle}>
          ⭐️ AI Restyle Entire Site
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default RestyleModal;
