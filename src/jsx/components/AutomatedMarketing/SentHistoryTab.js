import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  Row,
  Col,
  Button,
  Pagination,
  Spinner,
  Modal,
} from "react-bootstrap";
import { Filter, Download, History, MessageSquare, Mail, User, Calendar, Tag, AlertCircle } from "lucide-react";
import { getToken } from "../../../store/utlits";

const SentHistoryTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    channel: "",
    status: "",
    source: "",
    start_date: "",
    end_date: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const res = await fetch(
        `/api/automated-marketing/sent-history?${params}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading message history...</p>
      </div>
    );
  }

  return (
    <div>
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
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Filter size={20} className="me-2" color="#667eea" />
              <h5 className="mb-0 fw-bold">Filters</h5>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              style={{
                borderRadius: "8px",
                borderColor: "#dd2f6e",
                color: "#dd2f6e",
              }}
            >
              <Download size={16} className="me-1" />
              Export
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Channel</Form.Label>
                <Form.Select
                  value={filters.channel}
                  onChange={(e) =>
                    handleFilterChange("channel", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="">All Channels</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Source</Form.Label>
                <Form.Select
                  value={filters.source}
                  onChange={(e) =>
                    handleFilterChange("source", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="">All Sources</option>
                  <option value="automated">Automated</option>
                  <option value="manual">Manual</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="suppressed">Suppressed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card
        className="border-0 shadow-sm"
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
            <History size={20} className="me-2" color="#667eea" />
            <h5 className="mb-0 fw-bold">Message History</h5>
          </div>
        </Card.Header>
        <Card.Body>
          {logs.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                background: "#f9fafb",
                borderRadius: "15px",
              }}
            >
              <History size={48} className="mb-3 text-muted" />
              <p className="text-muted mb-0">No messages found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Date
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Customer
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Channel
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Message
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Coupon
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Source
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Clicked
                      </th>
                      <th style={{ borderTop: "none", fontWeight: "600" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr 
                        key={log.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedLog(log);
                          setShowModal(true);
                        }}
                      >
                        <td style={{ padding: "15px" }}>
                          {new Date(log.queued_at).toLocaleString()}
                        </td>
                        <td style={{ padding: "15px" }}>
                          {log.Reward_User?.name ||
                            log.Reward_User?.phone ||
                            log.Reward_User?.email ||
                            "N/A"}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <Badge
                            bg={log.channel === "sms" ? "primary" : "info"}
                            style={{
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                            }}
                          >
                            {log.channel.toUpperCase()}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            maxWidth: "300px",
                          }}
                        >
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={log.message_content}
                          >
                            {log.message_content}
                          </div>
                        </td>
                        <td style={{ padding: "15px" }}>
                          {log.coupon_code ? (
                            <Badge
                              bg="success"
                              style={{
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                              }}
                            >
                              {log.coupon_code}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <Badge
                            bg={log.source === "manual" ? "secondary" : "info"}
                            style={{
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                            }}
                          >
                            {log.source === "manual" ? "Manual" : "Automated"}
                          </Badge>
                        </td>
                        <td style={{ padding: "15px" }}>
                          {log.clicked_at ? (
                            <Badge bg="success" style={{ borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem" }}>
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <Badge
                            bg={
                              log.status === "delivered"
                                ? "success"
                                : log.status === "sent"
                                ? "primary"
                                : log.status === "failed"
                                ? "danger"
                                : log.status === "suppressed"
                                ? "warning"
                                : "secondary"
                            }
                            style={{
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                            }}
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      style={{ borderRadius: "10px", margin: "0 5px" }}
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === page}
                        onClick={() => setPage(i + 1)}
                        style={{
                          borderRadius: "10px",
                          margin: "0 2px",
                          border: "none",
                        }}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      style={{ borderRadius: "10px", margin: "0 5px" }}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Message Log Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center">
            {selectedLog?.channel === 'sms' ? (
              <MessageSquare size={20} className="me-2 text-primary" />
            ) : (
              <Mail size={20} className="me-2 text-primary" />
            )}
            Message Delivery Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <div className="mb-4">
                <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                  <MessageSquare size={14} className="me-1" /> Message Content
                </label>
                <div className="p-3 bg-light rounded-3 border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedLog.message_content || 'No message content'}
                  </p>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <User size={14} className="me-1" /> Customer
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedLog.Reward_User?.name || 'N/A'}
                    </div>
                    {selectedLog.Reward_User?.phone && (
                      <div className="text-muted small mt-1">Phone: {selectedLog.Reward_User.phone}</div>
                    )}
                    {selectedLog.Reward_User?.email && (
                      <div className="text-muted small mt-1">Email: {selectedLog.Reward_User.email}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    Channel
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <Badge
                      bg={selectedLog.channel === "sms" ? "primary" : "info"}
                      style={{
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {selectedLog.channel?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Calendar size={14} className="me-1" /> Queued At
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedLog.queued_at 
                        ? new Date(selectedLog.queued_at).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </div>
                    {selectedLog.queued_at && (
                      <div className="text-muted small">
                        {new Date(selectedLog.queued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                {selectedLog.sent_at && (
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                      <Calendar size={14} className="me-1" /> Sent At
                    </label>
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="fw-semibold text-dark">
                        {new Date(selectedLog.sent_at).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-muted small">
                        {new Date(selectedLog.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    Status
                  </label>
                  <div>
                    <Badge
                      bg={
                        selectedLog.status === "delivered"
                          ? "success"
                          : selectedLog.status === "sent"
                          ? "primary"
                          : selectedLog.status === "failed"
                          ? "danger"
                          : selectedLog.status === "suppressed"
                          ? "warning"
                          : "secondary"
                      }
                      style={{
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {selectedLog.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
                {selectedLog.coupon_code && (
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                      <Tag size={14} className="me-1" /> Coupon Code
                    </label>
                    <div className="p-3 bg-light rounded-3 border">
                      <Badge
                        bg="success"
                        style={{
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {selectedLog.coupon_code}
                      </Badge>
                      {selectedLog.Coupon && (
                        <div className="text-muted small mt-2">
                          {selectedLog.Coupon.discount_type === 'percentage' 
                            ? `${selectedLog.Coupon.discount}% off`
                            : `$${selectedLog.Coupon.discount} off`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedLog.provider_message_id && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">Provider Message ID</label>
                  <div className="p-3 bg-light rounded-3 border">
                    <code className="text-dark small">{selectedLog.provider_message_id}</code>
                  </div>
                </div>
              )}

              {(selectedLog.error_message || selectedLog.error_code) && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <AlertCircle size={14} className="me-1 text-danger" /> Delivery Error
                  </label>
                  <div className="p-3 bg-danger bg-opacity-10 rounded-3 border border-danger">
                    {selectedLog.error_code && (
                      <p className="mb-1 text-danger small">
                        <strong>Code:</strong> {selectedLog.error_code}
                      </p>
                    )}
                    {selectedLog.error_message && (
                      <p className="mb-0 text-danger small">{selectedLog.error_message}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.suppression_reason && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <AlertCircle size={14} className="me-1 text-warning" /> Suppression Reason
                  </label>
                  <div className="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning">
                    <p className="mb-0 text-warning small">{selectedLog.suppression_reason}</p>
                  </div>
                </div>
              )}

              {selectedLog.AutomatedMarketingRule && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">Rule / Strategy</label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">{selectedLog.AutomatedMarketingRule.name || 'N/A'}</div>
                  </div>
                </div>
              )}

              {selectedLog.tokens_spent !== undefined && selectedLog.tokens_spent > 0 && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">Tokens Spent</label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">{selectedLog.tokens_spent} token{selectedLog.tokens_spent !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SentHistoryTab;
