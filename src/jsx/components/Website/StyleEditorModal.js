import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Tabs, Tab } from "react-bootstrap";
import { SketchPicker } from "react-color";
import { SECTION_TEMPLATES } from "./editorConfig";

const TITLE_FONT_SIZES = [
  "20px", "24px", "28px", "32px", "36px", "40px", "44px", "48px", "52px", "56px", "60px", "64px", "72px", "80px"
];

const SUBTITLE_FONT_SIZES = [
  "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "30px", "32px", "36px"
];

const StyleEditorModal = ({ show, onHide, section, onSave }) => {
  const [styles, setStyles] = useState({
    backgroundColor: "#ffffff",
    fontSize: "16px",
    textColor: "#000000",
    titleColor: "#000000",
    titleFontSize: "32px",
    subtitleColor: "#666666",
    subtitleFontSize: "18px",
  });

  const [activeTab, setActiveTab] = useState("section-base");

  // Reset tab to default when modal is shown
  useEffect(() => {
    if (show) {
      setActiveTab("section-base");
    }
  }, [show]);

  useEffect(() => {
    if (section) {
      const initialStyles = section.style_json || {};
      setStyles({
        backgroundColor: initialStyles.backgroundColor || "#ffffff",
        fontSize: initialStyles.fontSize || "16px",
        textColor: initialStyles.textColor || "#000000",
        titleColor: initialStyles.titleColor || "#000000",
        titleFontSize: initialStyles.titleFontSize || "32px",
        subtitleColor: initialStyles.subtitleColor || "#666666",
        subtitleFontSize: initialStyles.subtitleFontSize || "18px",
      });
    }
  }, [section, show]);

  const handleSave = () => {
    onSave(styles);
  };

  const templateName = section?.template;
  const templateConfig = templateName ? SECTION_TEMPLATES[templateName] : null;

  // Check if template contains title and subtitle fields
  const hasTitle = !!templateConfig?.fields?.some(
    (field) => field.key.includes("title") && !field.key.includes("subtitle")
  );
  const hasSubtitle = !!templateConfig?.fields?.some(
    (field) => field.key.includes("subtitle")
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Edit Section Style</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: "420px" }}>
        <Tabs
          id="style-editor-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          {/* Tab 1: Section Base */}
          <Tab eventKey="section-base" title="Background & Text">
            <Row className="mt-2">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Background Color</Form.Label>
                  <div className="d-flex justify-content-center">
                    <SketchPicker
                      color={styles.backgroundColor}
                      onChangeComplete={(color) => {
                        const { r, g, b, a } = color.rgb;
                        setStyles({ ...styles, backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` });
                      }}
                      width="100%"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-secondary">Global Text Color</Form.Label>
                  <div className="d-flex justify-content-center">
                    <SketchPicker
                      color={styles.textColor}
                      onChangeComplete={(color) => {
                        const { r, g, b, a } = color.rgb;
                        setStyles({ ...styles, textColor: `rgba(${r}, ${g}, ${b}, ${a})` });
                      }}
                      width="100%"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Tab>

          {/* Tab 2: Title Style */}
          {hasTitle && (
            <Tab eventKey="title-style" title="Title Styling">
              <Row className="mt-2">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-secondary">Title Color</Form.Label>
                    <div className="d-flex justify-content-center">
                      <SketchPicker
                        color={styles.titleColor}
                        onChangeComplete={(color) => {
                          const { r, g, b, a } = color.rgb;
                          setStyles({ ...styles, titleColor: `rgba(${r}, ${g}, ${b}, ${a})` });
                        }}
                        width="100%"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-secondary">Title Font Size</Form.Label>
                    <Form.Select
                      value={styles.titleFontSize}
                      onChange={(e) => setStyles({ ...styles, titleFontSize: e.target.value })}
                      className="shadow-sm form-select-lg mt-1"
                    >
                      {TITLE_FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="mt-4 p-3 border rounded bg-light text-center">
                      <div className="text-muted small mb-2">Font Size Preview</div>
                      <div
                        style={{
                          fontSize: styles.titleFontSize,
                          color: styles.titleColor,
                          fontWeight: "bold",
                          lineHeight: "1.2",
                          wordBreak: "break-word",
                          maxHeight: "120px",
                          overflow: "hidden"
                        }}
                      >
                        Delicious Title
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Tab>
          )}

          {/* Tab 3: Subtitle Style */}
          {hasSubtitle && (
            <Tab eventKey="subtitle-style" title="Subtitle Styling">
              <Row className="mt-2">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-secondary">Subtitle Color</Form.Label>
                    <div className="d-flex justify-content-center">
                      <SketchPicker
                        color={styles.subtitleColor}
                        onChangeComplete={(color) => {
                          const { r, g, b, a } = color.rgb;
                          setStyles({ ...styles, subtitleColor: `rgba(${r}, ${g}, ${b}, ${a})` });
                        }}
                        width="100%"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-secondary">Subtitle Font Size</Form.Label>
                    <Form.Select
                      value={styles.subtitleFontSize}
                      onChange={(e) => setStyles({ ...styles, subtitleFontSize: e.target.value })}
                      className="shadow-sm form-select-lg mt-1"
                    >
                      {SUBTITLE_FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="mt-4 p-3 border rounded bg-light text-center">
                      <div className="text-muted small mb-2">Font Size Preview</div>
                      <div
                        style={{
                          fontSize: styles.subtitleFontSize,
                          color: styles.subtitleColor,
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                          maxHeight: "120px",
                          overflow: "hidden"
                        }}
                      >
                        Delicious Subtitle & Description
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} className="px-4">
          Save Styles
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StyleEditorModal;
