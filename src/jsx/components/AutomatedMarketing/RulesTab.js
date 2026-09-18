import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  Sparkles,
  Mail,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";

const TAG_LABELS = {
  new_customer: { label: "New Customer", emoji: "👋", color: "#10b981", timing: "1 week after first order" },
  returning_customer: { label: "Returning", emoji: "🔄", color: "#3b82f6", timing: "Every 2 weeks" },
  inactive_30: { label: "Inactive 30d", emoji: "😴", color: "#8b5cf6", timing: "Every 30 days" },
  inactive_60: { label: "Inactive 60d+", emoji: "💤", color: "#6b7280", timing: "Every 60 days" },
};

const RulesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [editTemplate, setEditTemplate] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  // Refetch rules when settings might have changed (e.g., discount settings)
  // This ensures templates reflect current discount status

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automated-marketing/rules", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch rules when settings are updated (to reflect discount changes)
  useEffect(() => {
    const handleSettingsUpdate = () => {
      fetchRules();
    };
    window.addEventListener("settingsUpdated", handleSettingsUpdate);
    return () => window.removeEventListener("settingsUpdated", handleSettingsUpdate);
  }, []);

  const handleToggle = async (rule) => {
    try {
      const res = await fetch(
        `/api/automated-marketing/rules/${rule.id}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (res.ok) {
        fetchRules();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update rule.", "error");
    }
  };

  const handleEditTemplate = (rule) => {
    setEditingRule(rule);
    setEditTemplate(rule.message_template || "");
  };


  const handleSaveTemplate = async () => {
    if (!editingRule) return;

    try {
      const updateData = {
        message_template: editTemplate,
      };

      const res = await fetch(`/api/automated-marketing/rules/${editingRule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updatedRule = await res.json();
        Swal.fire("Success!", "Message template updated successfully.", "success");
        setEditingRule(null);
        setEditTemplate("");
        // Refresh rules to get the processed template (with synced discount percentages)
        fetchRules();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update template.", "error");
    }
  };

  const handleSyncRules = async () => {
    try {
      Swal.fire({
        title: "🔄 Syncing Rules",
        html: '<div class="spinner-border text-primary" role="status"></div><p class="mt-2">Updating automation rules...</p>',
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      const res = await fetch("/api/automated-marketing/rules/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (res.ok) {
        Swal.fire("Success!", "Rules synced successfully!", "success");
        fetchRules();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to sync rules.", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading automation rules...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#1f2937" }}>🤖 Automation Rules</h4>
          <p className="text-muted mb-0">
            Focused automation for 4 key customer segments. Messages are automatically regenerated with AI after each campaign to keep content fresh.
          </p>
        </div>
        <Button
          variant="outline-primary"
          onClick={handleSyncRules}
          style={{
            borderRadius: "8px",
            padding: "10px 20px",
            borderColor: "#dd2f6e",
            color: "#dd2f6e",
          }}
        >
          <RefreshCw size={16} className="me-2" />
          Sync Rules
        </Button>
      </div>

      {rules.length === 0 ? (
        <Alert
          variant="info"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <div className="text-center">
            <Sparkles size={48} className="mb-3" color="#dd2f6e" />
            <h5>No rules configured yet</h5>
            <p className="mb-0">
              Enable Automated Marketing in Settings to automatically create rules
              for all customer segments.
            </p>
          </div>
        </Alert>
      ) : (
        <Row>
          {rules.filter(rule => ['new_customer', 'returning_customer', 'inactive_30', 'inactive_60'].includes(rule.tag)).map((rule) => {
            const tagInfo = TAG_LABELS[rule.tag] || {
              label: rule.tag,
              emoji: "📋",
              color: "#6b7280",
            };
            const channels = rule.channel === "both" ? ["sms", "email"] : [rule.channel];

            return (
              <Col md={6} lg={4} key={rule.id} className="mb-4">
                <Card
                  className="h-100 shadow-sm border"
                  style={{
                    borderRadius: "12px",
                    transition: "all 0.2s ease",
                    borderColor: "#e5e7eb",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            fontSize: "2rem",
                            marginRight: "10px",
                          }}
                        >
                          {tagInfo.emoji}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>{tagInfo.label}</h6>
                          <small className="text-muted">{rule.name}</small>
                          {tagInfo.timing && (
                            <div className="mt-1">
                              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                ⏰ {tagInfo.timing}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => handleToggle(rule)}
                        style={{ minWidth: "auto" }}
                      >
                        {rule.enabled ? (
                          <ToggleRight size={24} color={tagInfo.color} />
                        ) : (
                          <ToggleLeft size={24} color="#9ca3af" />
                        )}
                      </Button>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex gap-2 mb-2 flex-wrap">
                        {channels.map((ch) => (
                          <Badge
                            key={ch}
                            bg={ch === "sms" ? "primary" : "info"}
                            style={{
                              borderRadius: "6px",
                              padding: "5px 10px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {ch === "sms" ? (
                              <Smartphone size={12} className="me-1" />
                            ) : (
                              <Mail size={12} className="me-1" />
                            )}
                            {ch.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Priority: {rule.priority}
                      </div>
                    </div>

                    {editingRule?.id === rule.id ? (
                      <div>
                        <Form.Group className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label className="fw-semibold mb-0" style={{ fontSize: "0.875rem" }}>
                              Message Template
                              <span className="text-muted ms-2" style={{ fontSize: "0.7rem", fontWeight: "normal" }}>
                                (Auto-regenerated after each campaign)
                              </span>
                            </Form.Label>
                          </div>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={editTemplate}
                            onChange={(e) => setEditTemplate(e.target.value)}
                            placeholder="Use {restaurant_name}, {coupon}, {order_url}, {home_url} as placeholders"
                            style={{
                              fontSize: "0.85rem",
                              borderRadius: "8px",
                              borderColor: "#d1d5db",
                            }}
                          />
                          <Form.Text className="text-muted" style={{ fontSize: "0.75rem", marginTop: "8px" }}>
                            <strong>Note:</strong> Coupons are controlled by the main Discount Settings. 
                            Use {`{coupon}`} placeholder in your template - it will automatically be included 
                            if discounts are enabled in Settings, or excluded if disabled. Messages are automatically 
                            regenerated with AI when automation is enabled and after each campaign to keep content fresh.
                          </Form.Text>
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={handleSaveTemplate}
                            style={{ flex: 1, background: "#dd2f6e", border: "none" }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              setEditingRule(null);
                              setEditTemplate("");
                            }}
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#4b5563",
                            marginBottom: "10px",
                            minHeight: "60px",
                            padding: "10px",
                            background: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {rule.message_template || "No message template"}
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditTemplate(rule)}
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            borderColor: "#dd2f6e",
                            color: "#dd2f6e",
                          }}
                        >
                          <Edit2 size={14} className="me-1" />
                          Edit Message
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default RulesTab;
