import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Table, Alert, Button } from "react-bootstrap";
import {
  RefreshCw,
  Users,
  MousePointer,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getToken } from "../../../store/utlits";

const StatusTab = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/automated-marketing/status", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return <Alert variant="warning">Failed to load status</Alert>;
  }

  const successCount = (status.messageStats?.delivered || 0) + (status.messageStats?.sent || 0);
  const failCount = (status.messageStats?.failed || 0) + (status.messageStats?.suppressed || 0);
  const totalMessages = successCount + failCount;
  const successRate = totalMessages > 0 ? (successCount / totalMessages) * 100 : 100;
  const clickRatePct = ((status.clickRate ?? 0) * 100).toFixed(1);
  const conversionRatePct = ((status.conversionRate ?? 0) * 100).toFixed(1);
  const revenue = status.revenueFromCoupons ?? 0;

  return (
    <div className="container-fluid py-3 px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#111827", letterSpacing: "-0.025em" }}>
            Marketing Autopilot Overview
          </h2>
          <p className="text-muted mb-0 small">Key performance metrics and recent activity</p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          style={{ borderRadius: "8px" }}
          onClick={fetchStatus}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </Button>
      </div>

      {/* Hero metrics - Revenue & Click Rate */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48, background: "#ecfdf5" }}>
                  <DollarSign size={24} style={{ color: "#059669" }} />
                </div>
                <div>
                  <div className="small text-muted mb-1">Revenue from Coupons (30d)</div>
                  <div className="h3 mb-0 fw-bold" style={{ color: "#111827" }}>
                    ${revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48, background: "#eff6ff" }}>
                  <MousePointer size={24} style={{ color: "#dd2f6e" }} />
                </div>
                <div>
                  <div className="small text-muted mb-1">Click Rate</div>
                  <div className="h3 mb-0 fw-bold" style={{ color: "#111827" }}>{clickRatePct}%</div>
                  <div className="small text-muted">{status.clicksTotal ?? 0} clicks</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48, background: status.settings?.enabled ? "#ecfdf5" : "#f3f4f6" }}>
                    <Activity size={24} style={{ color: status.settings?.enabled ? "#059669" : "#6b7280" }} />
                  </div>
                  <div>
                    <div className="small text-muted mb-1">Autopilot</div>
                    <Badge
                      bg={status.settings?.enabled ? "success" : "secondary"}
                      style={{ borderRadius: "6px", padding: "6px 12px", fontSize: "0.875rem" }}
                    >
                      {status.settings?.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Second row - Performance & Usage */}
      <Row>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="small text-muted mb-1">Active Rules</div>
              <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{status.rulesCount || 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="small text-muted mb-1">SMS Tokens</div>
              <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{status.tokens?.left ?? 0}</div>
              <div className="small text-muted">{status.tokens?.used ?? 0} used</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="small text-muted mb-1">Messages Delivered</div>
              <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{successCount}</div>
              <div className="small text-muted d-flex align-items-center gap-1">
                <CheckCircle2 size={14} style={{ color: "#059669" }} /> {successRate.toFixed(0)}% success
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="small text-muted mb-1">Redemptions</div>
              <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{status.redemptionsTotal ?? 0}</div>
              <div className="small text-muted">{conversionRatePct}% conversion</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Simple Message Status */}
      <Row className="mt-3">
        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <span className="small fw-semibold text-muted">Message Status (30d)</span>
                <div className="d-flex align-items-center gap-4">
                  <span className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} style={{ color: "#059669" }} />
                    <span className="fw-semibold" style={{ color: "#059669" }}>Success</span>
                    <span>{successCount}</span>
                  </span>
                  <span className="d-flex align-items-center gap-2">
                    <XCircle size={18} style={{ color: "#dc2626" }} />
                    <span className="fw-semibold" style={{ color: "#dc2626" }}>Failed</span>
                    <span>{failCount}</span>
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Executions */}
      <Card className="border-0 shadow-sm mt-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <Card.Header
          className="py-3"
          style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <h5 className="mb-0 fw-bold" style={{ color: "#111827" }}>Recent Executions</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {!status.recentExecutions?.length ? (
            <Alert variant="info" className="mb-0 m-3" style={{ borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <Users size={20} className="me-2" />
              No executions yet. Automation runs daily.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Date</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Rule</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Evaluated</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Queued</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Coupons</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Tokens</th>
                    <th style={{ fontWeight: "600", color: "#374151", padding: "12px 16px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {status.recentExecutions?.map((exec) => (
                    <tr key={exec.id}>
                      <td style={{ padding: "12px 16px" }}>{new Date(exec.execution_date).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "#111827" }}>{exec.AutomatedMarketingRule?.name || "N/A"}</strong>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{exec.customers_evaluated}</td>
                      <td style={{ padding: "12px 16px" }}>{exec.messages_queued}</td>
                      <td style={{ padding: "12px 16px" }}>{exec.coupons_created}</td>
                      <td style={{ padding: "12px 16px" }}>{exec.tokens_used}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge
                          bg={
                            exec.status === "completed" ? "success" :
                            exec.status === "failed" ? "danger" : "warning"
                          }
                          style={{ borderRadius: "6px", padding: "5px 10px", fontSize: "0.8rem" }}
                        >
                          {exec.status === "completed" ? "Success" : exec.status === "failed" ? "Failed" : exec.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StatusTab;
