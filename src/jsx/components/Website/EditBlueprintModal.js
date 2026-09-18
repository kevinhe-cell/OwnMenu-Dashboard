import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const EditBlueprintModal = ({ show, handleClose, blueprint, onUpdate }) => {
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    tags: "",
    font_style: "",
    layout: "",
    default_colors: {
      primary: "",
      secondary: "",
      text: ""
    }
  });

  useEffect(() => {
    if (blueprint) {
      setFormData({
        label: blueprint.label || "",
        description: blueprint.description || "",
        tags: Array.isArray(blueprint.tags) ? blueprint.tags.join(", ") : 
               typeof blueprint.tags === 'string' ? blueprint.tags.replace(/[\[\]]/g, "") : "",
        font_style: blueprint.font_style || "",
        layout: Array.isArray(blueprint.layout) ? JSON.stringify(blueprint.layout, null, 2) : 
                typeof blueprint.layout === 'string' ? blueprint.layout : "",
        default_colors: {
          primary: blueprint.default_colors?.primary || "",
          secondary: blueprint.default_colors?.secondary || "",
          text: blueprint.default_colors?.text || ""
        }
      });
    }
  }, [blueprint]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      // Handle nested properties like default_colors.primary
      const [outer, inner] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [outer]: {
          ...prev[outer],
          [inner]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse tags into array
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    // Parse layout - try to parse as JSON, if it fails, send as string
    let layoutData = formData.layout;
    try {
      layoutData = JSON.parse(formData.layout);
    } catch (e) {
      // If parsing fails, keep as string
      console.warn("Layout is not valid JSON, sending as string");
    }
    
    // Prepare data for submission
    const submitData = {
      label: formData.label,
      description: formData.description,
      tags: tagsArray,
      font_style: formData.font_style,
      layout: layoutData,
      default_colors: formData.default_colors
    };

    try {
      const token = localStorage.getItem("ownmenutoken");
      const response = await fetch(`/api/blueprints/${blueprint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const updatedBlueprint = await response.json();
        onUpdate(updatedBlueprint);
        handleClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to update blueprint:", errorData.message);
        alert(`Failed to update blueprint: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating blueprint:", error);
      alert("Error updating blueprint. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Blueprint</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Label</Form.Label>
                <Form.Control
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Font Style</Form.Label>
                <Form.Control
                  type="text"
                  name="font_style"
                  value={formData.font_style}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas"
            />
            <Form.Text className="text-muted">
              Enter tags separated by commas (e.g., chinese, dim_sum, tea)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Layout</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="layout"
              value={formData.layout}
              onChange={handleChange}
              placeholder='Enter layout as JSON array (e.g., [{"type":"hero","template":"hero-13"},{"type":"about","template":"about-3"}])'
            />
            <Form.Text className="text-muted">
              Enter layout as JSON array. If invalid JSON, it will be stored as plain text.
            </Form.Text>
          </Form.Group>

          <h6 className="mt-4">Default Colors</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Color</Form.Label>
                <Form.Control
                  type="text"
                  name="default_colors.primary"
                  value={formData.default_colors.primary}
                  onChange={handleChange}
                  placeholder="#B71C1C"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Secondary Color</Form.Label>
                <Form.Control
                  type="text"
                  name="default_colors.secondary"
                  value={formData.default_colors.secondary}
                  onChange={handleChange}
                  placeholder="#FFD700"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Text Color</Form.Label>
                <Form.Control
                  type="text"
                  name="default_colors.text"
                  value={formData.default_colors.text}
                  onChange={handleChange}
                  placeholder="#3E2723"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditBlueprintModal;