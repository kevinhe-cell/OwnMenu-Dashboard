import React, { useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Switch,
  Badge,
} from "react-bootstrap";
import { Save, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";

const SettingsTab = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState({
    enabled: settings?.enabled || false,
    discounts_enabled: settings?.discounts_enabled || false,
    discount_level: settings?.discount_level || "balanced",
    discount_min: settings?.discount_min || "",
    discount_max: settings?.discount_max || "",
    quiet_hours_start: settings?.quiet_hours_start || 9,
    quiet_hours_end: settings?.quiet_hours_end || 21,
    max_promo_per_month: settings?.max_promo_per_month || 2,
    max_sms_per_month: settings?.max_sms_per_month !== null && settings?.max_sms_per_month !== undefined
      ? settings.max_sms_per_month
      : settings?.max_promo_per_month || 2,
    max_email_per_month: settings?.max_email_per_month !== null && settings?.max_email_per_month !== undefined
      ? settings.max_email_per_month
      : settings?.max_promo_per_month || 2,
    cooldown_days: settings?.cooldown_days || 7,
    sms_cooldown_days: settings?.sms_cooldown_days !== null && settings?.sms_cooldown_days !== undefined
      ? settings.sms_cooldown_days
      : settings?.cooldown_days || 7,
    email_cooldown_days: settings?.email_cooldown_days !== null && settings?.email_cooldown_days !== undefined
      ? settings.email_cooldown_days
      : 0,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/automated-marketing/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "✨ Settings Saved!",
          text: "Your automated marketing settings have been updated. Message templates will be updated to reflect discount changes.",
        });
        onUpdate();
        // Trigger a custom event to refresh rules (so templates reflect new discount settings)
        window.dispatchEvent(new Event("settingsUpdated"));
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Alert
        variant="info"
        className="mb-4"
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div className="d-flex align-items-start">
          <Sparkles size={24} className="me-3" color="#667eea" />
          <div>
            <strong>🤖 Automatic Rule Creation</strong>
            <p className="mb-0 mt-2">
              When you enable Automated Marketing, rules are automatically created for all
              customer lifecycle tags. You can customize message templates for each rule
              in the Automation Rules tab.
            </p>
          </div>
        </div>
      </Alert>

      <Card
        className="mb-4 border-0 shadow-sm"
        style={{ borderRadius: "15px" }}
      >
        <Card.Header
          className="bg-white border-0"
          style={{ borderRadius: "15px 15px 0 0" }}
        >
          <div className="d-flex align-items-center">
            <SettingsIcon size={20} className="me-2" color="#667eea" />
            <h5 className="mb-0 fw-bold">General Settings</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Form.Label className="fw-semibold mb-1">
                  Enable Automated Marketing
                </Form.Label>
                <Form.Text className="d-block text-muted">
                  When enabled, automation rules will run daily to send messages to
                  eligible customers based on their lifecycle tags.
                </Form.Text>
              </div>
              <Form.Check
                type="switch"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => handleChange("enabled", e.target.checked)}
                style={{ transform: "scale(1.3)" }}
              />
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card
        className="mb-4 border-0 shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <Card.Header
          className="bg-white border-0"
          style={{ borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="d-flex align-items-center">
            <Sparkles size={20} className="me-2" color="#dd2f6e" />
            <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>Discount Settings</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Form.Label className="fw-semibold mb-1">
                  Allow Discounts in Automated Messages
                </Form.Label>
                <Form.Text className="d-block text-muted">
                  When enabled, rules can automatically generate coupons for
                  customers.
                </Form.Text>
              </div>
              <Form.Check
                type="switch"
                id="discounts_enabled"
                checked={formData.discounts_enabled}
                onChange={(e) =>
                  handleChange("discounts_enabled", e.target.checked)
                }
                style={{ transform: "scale(1.3)" }}
              />
            </div>
          </Form.Group>

          {formData.discounts_enabled && (
            <>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Discount Level</Form.Label>
                <Form.Select
                  value={formData.discount_level}
                  onChange={(e) =>
                    handleChange("discount_level", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="conservative">Conservative (10% off)</option>
                  <option value="balanced">Balanced (15% off)</option>
                  <option value="aggressive">Aggressive (20% off)</option>
                  <option value="custom">Custom Range</option>
                </Form.Select>
              </Form.Group>

              {formData.discount_level === "custom" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Min Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="50"
                        value={formData.discount_min}
                        onChange={(e) =>
                          handleChange("discount_min", parseFloat(e.target.value))
                        }
                        style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Max Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="50"
                        value={formData.discount_max}
                        onChange={(e) =>
                          handleChange("discount_max", parseFloat(e.target.value))
                        }
                        style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* <Card
        className="mb-4 border-0 shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <Card.Header
          className="bg-white border-0"
          style={{ borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e5e7eb" }}
        >
          <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>⏰ Quiet Hours</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Start Hour (24h format)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="23"
                  value={formData.quiet_hours_start}
                  onChange={(e) =>
                    handleChange("quiet_hours_start", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
                <Form.Text className="text-muted">
                  Messages will only be sent during these hours (restaurant local time).
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">End Hour (24h format)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="23"
                  value={formData.quiet_hours_end}
                  onChange={(e) =>
                    handleChange("quiet_hours_end", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card> */}

      <Card
        className="mb-4 border-0 shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <Card.Header
          className="bg-white border-0"
          style={{ borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e5e7eb" }}
        >
          <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>📊 Message Limits</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Max SMS per Customer per Month
                  <Badge bg="primary" className="ms-2" style={{ fontSize: "0.7rem" }}>SMS</Badge>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_sms_per_month}
                  onChange={(e) =>
                    handleChange("max_sms_per_month", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
                <Form.Text className="text-muted">
                  Maximum SMS promotional messages a customer can receive per month.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Max Email per Customer per Month
                  <Badge bg="info" className="ms-2" style={{ fontSize: "0.7rem" }}>Email</Badge>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_email_per_month}
                  onChange={(e) =>
                    handleChange("max_email_per_month", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
                <Form.Text className="text-muted">
                  Maximum email promotional messages a customer can receive per month.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  SMS Cooldown Days
                  <Badge bg="info" className="ms-2" style={{ fontSize: "0.7rem" }}>Longer</Badge>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="30"
                  value={formData.sms_cooldown_days}
                  onChange={(e) =>
                    handleChange("sms_cooldown_days", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
                <Form.Text className="text-muted">
                  Minimum days between SMS promotional messages to the same customer.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Email Cooldown Days
                  <Badge bg="success" className="ms-2" style={{ fontSize: "0.7rem" }}>Shorter</Badge>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="30"
                  value={formData.email_cooldown_days}
                  onChange={(e) =>
                    handleChange("email_cooldown_days", parseInt(e.target.value))
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
                <Form.Text className="text-muted">
                  Minimum days between email promotional messages. Set to 0 for no cooldown.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Button
        type="submit"
        variant="primary"
        disabled={saving}
        className="w-100"
        style={{
          background: "#dd2f6e",
          border: "none",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "1rem",
          fontWeight: "600",
        }}
      >
        <Save size={20} className="me-2" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </Form>
  );
};

export default SettingsTab;
