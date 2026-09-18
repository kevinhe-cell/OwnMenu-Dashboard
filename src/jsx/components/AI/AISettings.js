import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Alert, Spinner, Button, Row, Col, Badge, Pagination } from "react-bootstrap";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { FaRobot, FaCommentDots, FaCoins, FaHistory, FaSort, FaLayerGroup } from "react-icons/fa";

const ADDON_DISABLED_MSG = "AI Assistant access is not enabled for your restaurant.  Contact support to get access.";

const LOGS_PAGE_SIZES = [25, 50, 100];
const LOGS_PAGE_SIZE_DEFAULT = 50;
const TRUNCATE_LEN = 80;

const formatLogDate = (dateStr, t) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const logDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (logDay.getTime() === today.getTime()) return t('ai.today');
  if (logDay.getTime() === yesterday.getTime()) return t('ai.yesterday');
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatLogTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const truncate = (str, len = TRUNCATE_LEN) => {
  if (!str || typeof str !== "string") return "—";
  return str.length <= len ? str : str.slice(0, len) + "…";
};

const groupLogsByDate = (logs, t) => {
  const groups = {};
  logs.forEach((log) => {
    const key = formatLogDate(log.createdAt, t);
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  const entries = Object.entries(groups).map(([label, items]) => ({ label, items }));
  const order = (a, b) => {
    if (a.label === t('ai.today')) return -1;
    if (b.label === t('ai.today')) return 1;
    if (a.label === t('ai.yesterday')) return -1;
    if (b.label === t('ai.yesterday')) return 1;
    return new Date(b.items[0]?.createdAt) - new Date(a.items[0]?.createdAt);
  };
  return entries.sort(order);
};

const groupLogsByStatus = (logs, t) => {
  const groups = { success: [], error: [] };
  logs.forEach((log) => {
    const key = (log.status || "success").toLowerCase() === "error" ? "error" : "success";
    groups[key].push(log);
  });
  return [
    { label: t('ai.success'), items: groups.success },
    { label: t('ai.error'), items: groups.error },
  ].filter((g) => g.items.length > 0);
};

const AISettings = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.session.user);
  const restaurantId = user?.restaurant_id;

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingKnowledge, setUpdatingKnowledge] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [stats, setStats] = useState({
    totalCalls: 0,
    todayCalls: 0,
    totalTokens: 0
  });
  const [addonEnabled, setAddonEnabled] = useState(false);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(LOGS_PAGE_SIZE_DEFAULT);
  const [logsSort, setLogsSort] = useState("newest");
  const [logsGroupBy, setLogsGroupBy] = useState("date");
  const [hasMoreLogs, setHasMoreLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
        setLoading(false);
        return;
    }

    // Fetch current status (includes addonEnabled from plan)
    fetch(`/api/custom/ai-agent/${restaurantId}`)
      .then((res) => {
        if (res.status === 403) {
          return res.json().then((body) => ({ addonEnabled: false, enabled: false, error: body?.error }));
        }
        if (res.status === 404) {
          return { enabled: false, addonEnabled: true };
        }
        if (!res.ok) throw new Error("Failed to fetch AI settings");
        return res.json();
      })
      .then((data) => {
        setAddonEnabled(data.addonEnabled !== false);
        setEnabled(!!data.enabled);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load AI settings.");
        setLoading(false);
      });

    // Fetch stats only when addon is enabled (checked after first fetch)
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId || !addonEnabled) return;
    fetch(`/api/custom/ai-agent/stats/${restaurantId}`)
      .then((res) => {
        if (res.status === 403) {
          setAddonEnabled(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error("Failed to fetch stats", err));
  }, [restaurantId, addonEnabled]);

  const fetchLogs = useCallback(
    (page = 1, append = false) => {
      if (!restaurantId) return;
      if (!addonEnabled) {
        Swal.fire({
          icon: "warning",
          title: t('ai.access_denied'),
          text: t('ai.access_notice'),
          confirmButtonText: "OK",
        });
        return;
      }
      setLogsLoading(true);
      setLogsError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(logsPageSize),
        sort: logsSort,
      });
      fetch(`/api/custom/ai-agent/logs/${restaurantId}?${params}`)
        .then(async (res) => {
          if (res.status === 403) {
            setAddonEnabled(false);
            const body = await res.json();
            await Swal.fire({
              icon: "warning",
              title: t('ai.access_denied'),
              text: body?.error || t('ai.access_notice'),
              confirmButtonText: "OK",
            });
            return null;
          }
          if (!res.ok) throw new Error("Failed to load logs");
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          const newLogs = data.logs || [];
          setLogs((prev) => (append ? [...prev, ...newLogs] : newLogs));
          setLogsTotal(data.total ?? 0);
          const limit = data.limit ?? logsPageSize;
          setHasMoreLogs((data.page ?? page) * limit < (data.total ?? 0));
          setLogsPage(data.page ?? page);
        })
        .catch((err) => {
          setLogsError(err.message || "Could not load message logs.");
          if (!append) setLogs([]);
        })
        .finally(() => setLogsLoading(false));
    },
    [restaurantId, logsSort, logsPageSize, addonEnabled, t]
  );

  useEffect(() => {
    if (!restaurantId || !addonEnabled) return;
    fetchLogs(1, false);
  }, [restaurantId, logsSort, logsPageSize, addonEnabled, fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(logsTotal / logsPageSize));
  const goToPage = (pageNum) => {
    const p = Math.max(1, Math.min(pageNum, totalPages));
    if (p === logsPage) return;
    fetchLogs(p, false);
  };
  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    if (!addonEnabled) {
      Swal.fire({ icon: "warning", title: t('ai.access_denied'), text: t('ai.access_notice'), confirmButtonText: "OK" });
      return;
    }
    setLogsPageSize(size);
    setLogsPage(1);
    // Refetch first page with new size (useEffect will run after state update)
  };

  const handleToggle = async () => {
    if (!addonEnabled) {
      Swal.fire({
        icon: "warning",
        title: t('ai.access_denied'),
        text: t('ai.access_notice'),
        confirmButtonText: "OK",
      });
      return;
    }
    const newState = !enabled;
    setLoading(true);
    setError(null);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/custom/ai-agent/toggle", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          enabled: newState,
        }),
      });

      const data = await res.json();
      if (res.status === 403) {
        setAddonEnabled(false);
        Swal.fire({
          icon: "warning",
          title: t('ai.access_denied'),
          text: data?.error || t('ai.access_notice'),
          confirmButtonText: "OK",
        });
        return;
      }
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update status");
      }
      setEnabled(data.enabled);
      setSuccessMsg(data.enabled ? t('ai.enabled_msg') : t('ai.disabled_msg'));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update AI Agent status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKnowledge = async () => {
    if (!addonEnabled) {
      Swal.fire({
        icon: "warning",
        title: t('ai.access_denied'),
        text: t('ai.access_notice'),
        confirmButtonText: "OK",
      });
      return;
    }
    setUpdatingKnowledge(true);
    setError(null);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/custom/ai-agent/update-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
        }),
      });

      const data = await res.json();
      if (res.status === 403) {
        setAddonEnabled(false);
        Swal.fire({
          icon: "warning",
          title: t('ai.access_denied'),
          text: data?.error || t('ai.access_notice'),
          confirmButtonText: "OK",
        });
        return;
      }
      if (!res.ok) throw new Error("Failed to update knowledge base");

      setSuccessMsg(t('ai.kb_success'));
      setTimeout(() => setSuccessMsg(""), 5000);

    } catch (err) {
      console.error(err);
      setError("Failed to update knowledge base. Please try again.");
    } finally {
      setUpdatingKnowledge(false);
    }
  };

  if (!restaurantId) {
      return (
          <div className="col-12">
              <Alert variant="warning">Loading user information...</Alert>
          </div>
      );
  }

  return (
    <div className="col-xl-12 col-lg-12">
      <Card>
        <Card.Header>
          <Card.Title>{t('ai.title')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}
          {!addonEnabled && (
            <Alert variant="warning" className="mb-4">
              <strong>{t('ai.not_enabled')}</strong> {t('ai.access_notice')}
            </Alert>
          )}
          
          {/* Stats Row */}
          <Row className="mb-4">
            <Col md={4}>
                <div className="p-3 border rounded bg-light d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-3 me-3">
                        <FaCommentDots size={20} />
                    </div>
                    <div>
                        <h3 className="mb-0">{stats.todayCalls}</h3>
                        <small className="text-muted">{t('ai.interactions_today')}</small>
                    </div>
                </div>
            </Col>
            <Col md={4}>
                <div className="p-3 border rounded bg-light d-flex align-items-center">
                    <div className="bg-success text-white rounded-circle p-3 me-3">
                        <FaRobot size={20} />
                    </div>
                    <div>
                        <h3 className="mb-0">{stats.totalCalls}</h3>
                        <small className="text-muted">{t('ai.total_interactions')}</small>
                    </div>
                </div>
            </Col>
            <Col md={4}>
                <div className="p-3 border rounded bg-light d-flex align-items-center">
                    <div className="bg-warning text-white rounded-circle p-3 me-3">
                        <FaCoins size={20} />
                    </div>
                    <div>
                        <h3 className="mb-0">{stats.totalTokens.toLocaleString()}</h3>
                        <small className="text-muted">{t('ai.tokens_used')}</small>
                    </div>
                </div>
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-4">
            <div>
              <h5 className="mb-1">{t('ai.enable_title')}</h5>
              <p className="text-muted mb-0">
                {t('ai.enable_desc')}
              </p>
            </div>
            <div className="d-flex align-items-center">
                {loading && <Spinner animation="border" size="sm" className="me-3" />}
                <Form.Check 
                type="switch"
                id="ai-switch"
                label={enabled ? "On" : "Off"}
                checked={enabled}
                onChange={handleToggle}
                disabled={loading}
                style={{ transform: "scale(1.2)" }}
                />
            </div>
          </div>

          <div className="p-3 border rounded">
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <h5 className="mb-1">{t('ai.update_kb')}</h5>
                    <p className="text-muted mb-0">
                        {t('ai.kb_desc')}
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={handleUpdateKnowledge}
                    disabled={updatingKnowledge}
                >
                    {updatingKnowledge ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                            {t('ai.updating')}
                        </>
                    ) : (
                        t('ai.update_now')
                    )}
                </Button>
            </div>
          </div>
          
          <div className="mt-4">
              <h6>{t('ai.how_it_works')}</h6>
              <p className="text-muted small">
                  {t('ai.how_it_works_desc')}
                  <br/>
                  <strong>{t('orders.details.attention')}:</strong> {t('ai.update_note')}
              </p>
          </div>

          {/* AI Message Logs */}
          <hr className="my-4" />
          {!addonEnabled && (
            <p className="text-muted small mb-3">AI Assistant access must be enabled for your restaurant (by your account manager) to view message logs.</p>
          )}
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaHistory className="text-secondary" />
              {t('ai.logs_title')}
            </h5>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="d-flex align-items-center gap-1">
                <FaSort className="text-muted small" />
                <Form.Select
                  size="sm"
                  style={{ width: "auto", minWidth: "130px" }}
                  value={logsSort}
                  onChange={(e) => {
                    if (!addonEnabled) {
                      Swal.fire({ icon: "warning", title: t('ai.access_denied'), text: t('ai.access_notice'), confirmButtonText: "OK" });
                      return;
                    }
                    setLogsSort(e.target.value);
                  }}
                  aria-label="Sort logs"
                >
                  <option value="newest">{t('ai.sort.newest')}</option>
                  <option value="oldest">{t('ai.sort.oldest')}</option>
                  <option value="tokens">{t('ai.sort.tokens')}</option>
                  <option value="status">{t('ai.sort.status')}</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-1">
                <FaLayerGroup className="text-muted small" />
                <Form.Select
                  size="sm"
                  style={{ width: "auto", minWidth: "110px" }}
                  value={logsGroupBy}
                  onChange={(e) => {
                    if (!addonEnabled) {
                      Swal.fire({ icon: "warning", title: t('ai.access_denied'), text: t('ai.access_notice'), confirmButtonText: "OK" });
                      return;
                    }
                    setLogsGroupBy(e.target.value);
                  }}
                  aria-label="Group logs"
                >
                  <option value="date">{t('ai.group.date')}</option>
                  <option value="status">{t('ai.group.status')}</option>
                  <option value="none">{t('ai.group.none')}</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Form.Select
                  size="sm"
                  style={{ width: "auto", minWidth: "90px" }}
                  value={logsPageSize}
                  onChange={handlePageSizeChange}
                  aria-label="Per page"
                >
                  {LOGS_PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n} {t('ai.per_page')}</option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </div>
          {logsError && (
            <Alert variant="warning" className="py-2 small">
              {logsError}
            </Alert>
          )}
          <p className="text-muted small mb-3">
            {t('ai.logs_desc')}
            {logsTotal > 0 && (
              <span className="ms-1">
                {t('ai.showing')} {(logsPage - 1) * logsPageSize + 1}–{Math.min(logsPage * logsPageSize, logsTotal)} {t('ai.of')} {logsTotal.toLocaleString()}
              </span>
            )}
          </p>

          <div className="border rounded overflow-hidden">
            {!addonEnabled ? (
              <div className="p-5 text-center text-muted small">
                AI Assistant access is not enabled for your restaurant. Your account manager can enable it in your plan.
              </div>
            ) : logsLoading && logs.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <Spinner animation="border" size="sm" className="me-2" />
                {t('ai.loading_logs')}
              </div>
            ) : logs.length === 0 ? (
              <div className="p-5 text-center text-muted small">
                {t('ai.no_logs')}
              </div>
            ) : (
              <>
                {logsGroupBy === "date" && groupLogsByDate(logs, t).map(({ label, items }) => (
                  <div key={label} className="border-bottom border-md-end-0">
                    <div className="bg-light px-3 py-2 small fw-semibold text-muted">{label}</div>
                    {items.map((log) => (
                      <LogRow
                        key={log.id}
                        log={log}
                        t={t}
                        expanded={expandedLogId === log.id}
                        onToggle={() => setExpandedLogId((id) => (id === log.id ? null : log.id))}
                      />
                    ))}
                  </div>
                ))}
                {logsGroupBy === "status" && groupLogsByStatus(logs, t).map(({ label, items }) => (
                  <div key={label} className="border-bottom border-md-end-0">
                    <div className="bg-light px-3 py-2 small fw-semibold text-muted">{label}</div>
                    {items.map((log) => (
                      <LogRow
                        key={log.id}
                        log={log}
                        t={t}
                        expanded={expandedLogId === log.id}
                        onToggle={() => setExpandedLogId((id) => (id === log.id ? null : log.id))}
                      />
                    ))}
                  </div>
                ))}
                {logsGroupBy === "none" && logs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    t={t}
                    expanded={expandedLogId === log.id}
                    onToggle={() => setExpandedLogId((id) => (id === log.id ? null : log.id))}
                  />
                ))}
                {logsTotal > 0 && (
                  <div className="p-3 bg-light d-flex flex-wrap align-items-center justify-content-between gap-2 border-top">
                    <span className="small text-muted">
                      {t('sales.month')} {logsPage} {t('ai.of')} {totalPages}
                    </span>
                    <Pagination className="mb-0 flex-wrap justify-content-center">
                      <Pagination.Prev
                        disabled={logsPage <= 1 || logsLoading}
                        onClick={() => goToPage(logsPage - 1)}
                      />
                      <Pagination.Item active>{logsPage}</Pagination.Item>
                      <Pagination.Next
                        disabled={logsPage >= totalPages || logsLoading}
                        onClick={() => goToPage(logsPage + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  function LogRow({ log, expanded, onToggle, t }) {
    const isError = (log.status || "").toLowerCase() === "error";
    return (
      <div
        className="border-bottom border-md-end-0 px-3 py-2 py-md-3 d-flex flex-column gap-1 cursor-pointer"
        style={{ cursor: "pointer" }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        aria-expanded={expanded}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span className="small text-muted">
            {formatLogDate(log.createdAt, t)} · {formatLogTime(log.createdAt)}
          </span>
          <div className="d-flex align-items-center gap-2">
            {log.tokens > 0 && (
              <Badge bg="secondary" className="fw-normal">
                {log.tokens} tokens
              </Badge>
            )}
            <Badge bg={isError ? "danger" : "success"}>
              {isError ? t('ai.error') : t('ai.success')}
            </Badge>
          </div>
        </div>
        <div className="small">
          <strong className="text-dark">Q:</strong>{" "}
          {expanded ? (log.question || "—") : truncate(log.question)}
        </div>
        <div className="small text-muted">
          <strong>A:</strong>{" "}
          {expanded ? (log.answer || "—") : truncate(log.answer)}
        </div>
        {expanded && (log.question?.length > TRUNCATE_LEN || log.answer?.length > TRUNCATE_LEN) && (
          <div className="small mt-1 pt-1 border-top text-muted">{t('ai.collapse')}</div>
        )}
      </div>
    );
  }
};

export default AISettings;
