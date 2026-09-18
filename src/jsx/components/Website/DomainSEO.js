import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDomainThunk,
  addOrReplaceDomainThunk,
  deleteDomainThunk,
  manualConnectDomainThunk,
} from "../../../store/domains";
import {
  Button,
  Card,
  Container,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Alert,
  Modal,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../../../store/utlits";
import { useTranslation } from "react-i18next";

const POLL_INTERVAL_MS = 15000; // 15 seconds, matches DNS tips copy

export default function DomainAndSEO() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const domain = useSelector((state) => state.domains.domain);
  const [newDomain, setNewDomain] = useState("");
  const [domainInputError, setDomainInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const pollIntervalRef = useRef(null);
  const lastVerifiedRef = useRef(null);

  const [manualDomain, setManualDomain] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [showManualPassword, setShowManualPassword] = useState(false);
  const [manualPassword, setManualPassword] = useState("");

  useEffect(() => {
    dispatch(getDomainThunk());
  }, [dispatch]);

  const fetchVerification = useCallback(
    async (options = {}) => {
      const { silent = false } = options;
      if (!domain?.restaurant_id) return null;
      const token = getToken();
      if (!token) return null;
      try {
        const res = await fetch(
          `/api/domains/verify/${domain.restaurant_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const contentType = res.headers.get("content-type");
        const isJson =
          contentType && contentType.toLowerCase().includes("application/json");
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          const message =
            data?.error || data?.message || `Verification failed (${res.status})`;
          if (!silent) setVerifyError(message);
          return null;
        }
        setVerifyError(null);
        setVerificationInfo(data);
        if (data.verified && lastVerifiedRef.current !== true && !silent) {
          toast.success(
            t('website.domain.verify_success'),
            { autoClose: 4000, toastId: "verifiedSuccess" }
          );
          lastVerifiedRef.current = true;
          dispatch(getDomainThunk());
        } else if (
          !data.verified &&
          data.error &&
          lastVerifiedRef.current !== false &&
          !silent
        ) {
          toast.warn(`DNS: ${data.error}`, {
            autoClose: 5000,
            toastId: "dnsWarn",
          });
          lastVerifiedRef.current = false;
        }
        if (!data.verified) lastVerifiedRef.current = false;
        return data;
      } catch (e) {
        const message =
          e.message || "Could not reach verification service.";
        if (!silent) setVerifyError(message);
        toast.error("Verification check failed. Please try again.", {
          autoClose: 4000,
          toastId: "verifyError",
        });
        return null;
      }
    },
    [domain?.restaurant_id, dispatch, t]
  );

  const handleVerify = useCallback(
    async (options = {}) => {
      if (!domain?.restaurant_id) return;
      setLoading(true);
      await fetchVerification({ ...options, silent: false });
      setLoading(false);
    },
    [domain?.restaurant_id, fetchVerification]
  );

  const refreshStatus = useCallback(async () => {
    if (!domain?.restaurant_id) return;
    setRefreshing(true);
    await fetchVerification({ silent: true });
    setRefreshing(false);
  }, [domain?.restaurant_id, fetchVerification]);

  // Poll when domain exists and is not verified
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    if (!domain || domain.is_verified) return;
    pollIntervalRef.current = setInterval(() => {
      refreshStatus();
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [domain?.id, domain?.is_verified, refreshStatus]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(t('website.domain.copied'), {
      autoClose: 2000,
      toastId: "copy" + text,
    });
  };

  const handleAdd = async () => {
    setDomainInputError("");
    const raw = newDomain.trim();
    if (!raw) {
      setDomainInputError(t('website.domain.enter_domain_error'));
      return;
    }
    const result = await dispatch(
      addOrReplaceDomainThunk({ domain: raw })
    );
    if (!result.success) {
      const msg = result.error || result.message || "Failed to add domain.";
      setDomainInputError(msg);
      toast.error(msg, { autoClose: 4000, toastId: "domainError" });
    } else {
      setNewDomain("");
      setVerificationInfo(null);
      setVerifyError(null);
    }
  };

  const handleRemove = async () => {
    const confirmed = window.confirm(
      t('website.domain.remove_confirm')
    );
    if (confirmed) {
      await dispatch(deleteDomainThunk(domain.restaurant_id));
      setVerificationInfo(null);
      setVerifyError(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  const openManualPassword = () => {
    setManualError("");
    const raw = manualDomain.trim();
    if (!raw) {
      setManualError(t("website.domain.enter_domain_error"));
      return;
    }
    setManualPassword("");
    setShowManualPassword(true);
  };

  const handleManualConnect = async () => {
    setManualError("");
    if (!manualPassword.trim()) {
      setManualError(t("website.domain.manual_password_required"));
      return;
    }
    setManualLoading(true);
    const result = await dispatch(
      manualConnectDomainThunk({
        domain: manualDomain.trim(),
        password: manualPassword.trim(),
      })
    );
    setManualLoading(false);
    if (!result.success) {
      setManualError(result.error || t("website.domain.manual_failed"));
      toast.error(result.error || t("website.domain.manual_failed"), {
        autoClose: 5000,
        toastId: "manualDomainError",
      });
      return;
    }
    setShowManualPassword(false);
    setManualPassword("");
    setManualDomain("");
    setVerificationInfo(null);
    setVerifyError(null);
    toast.success(t("website.domain.manual_success"), {
      autoClose: 5000,
      toastId: "manualDomainOk",
    });
  };

  const hasDnsInstructions =
    verificationInfo?.recommendedA || verificationInfo?.recommendedCname;

  const ownershipChallenges =
    verificationInfo?.vercelOwnershipVerification || [];
  const hasOwnershipTxt = ownershipChallenges.length > 0;

  return (
    <Container className="py-4">
      <ToastContainer position="top-right" />
      <div className="d-flex align-items-center gap-2 mb-3">
        <h3 className="mb-0 fw-bold">{t('website.domain.title')}</h3>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id="tooltip-domain">
              {t('website.domain.tooltip')}
            </Tooltip>
          }
        >
          <span className="text-muted" style={{ cursor: "help" }}>
            <i className="bi bi-info-circle" />
          </span>
        </OverlayTrigger>
      </div>

      <Alert variant="info" className="mb-4">
        <Alert.Heading as="h6" className="fw-bold">
          {t('website.domain.propagation_title')}
        </Alert.Heading>
        <p className="mb-2 small">
          {t('website.domain.propagation_notice')}
        </p>
        <ul className="mb-0 ps-3 small">
          <li>
            {t('website.domain.dns_conflict_notice')}
          </li>
          <li>
            {t('website.domain.pending_notice')}
          </li>
        </ul>
      </Alert>

      {!domain ? (
        <Card className="shadow-sm border">
          <Card.Body className="p-4">
            <h5 className="fw-semibold mb-2">{t('website.domain.connect_title')}</h5>
            <p className="text-muted small mb-3">
              {t('website.domain.connect_desc')}
            </p>
            <Row className="g-2 align-items-end">
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="www.myrestaurant.com"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    if (domainInputError) setDomainInputError("");
                  }}
                  isInvalid={!!domainInputError}
                  aria-describedby="domain-add-error"
                />
                {domainInputError && (
                  <Form.Control.Feedback type="invalid" id="domain-add-error">
                    {domainInputError}
                  </Form.Control.Feedback>
                )}
              </Col>
              <Col md={4}>
                <Button
                  className="w-100"
                  variant="primary"
                  onClick={handleAdd}
                  disabled={!newDomain.trim()}
                >
                  {t('website.domain.add_domain')}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <h5 className="text-primary mb-1">{t('website.domain.connected_title')}</h5>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fw-semibold text-decoration-none"
                  >
                    {domain.domain}
                  </a>
                  {domain.is_verified ? (
                    <Badge bg="success">{t('website.domain.verified')}</Badge>
                  ) : (
                    <Badge bg="warning text-dark">{t('website.domain.pending')}</Badge>
                  )}
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleRemove}
                  aria-label="Remove domain"
                >
                  {t('website.domain.remove')}
                </Button>
                {!domain.is_verified && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleVerify()}
                    disabled={loading}
                    aria-label="Check verification now"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" role="status" />
                    ) : (
                      t('website.domain.check_now')
                    )}
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={refreshStatus}
                  disabled={refreshing}
                  aria-label="Refresh status"
                >
                  {refreshing ? (
                    <Spinner animation="border" size="sm" role="status" />
                  ) : (
                    t('website.domain.refresh')
                  )}
                </Button>
              </div>
            </div>

            {verifyError && (
              <Alert variant="danger" className="mb-4 py-2 small">
                <strong>{t('website.domain.verify_error')}:</strong> {verifyError}
              </Alert>
            )}

            {hasOwnershipTxt && (
              <Alert variant="warning" className="mb-4">
                <Alert.Heading as="h6" className="fw-bold">
                  {t("website.domain.ownership_title")}
                </Alert.Heading>
                <p className="small mb-3">{t("website.domain.ownership_desc")}</p>
                {ownershipChallenges.map((ch, idx) => (
                  <div
                    key={`${ch.recordName}-${ch.value}-${idx}`}
                    className="mb-3 pb-3 border-bottom border-warning-subtle"
                  >
                    <p className="small text-muted mb-2">
                      <strong>{t("website.domain.ownership_applies_to")}:</strong>{" "}
                      <code>{ch.forDomain}</code>
                    </p>
                    <Row className="g-2">
                      <Col xs={6} md={2}>
                        <div className="bg-white border rounded p-2 text-center">
                          <small className="text-muted d-block">
                            {t("website.domain.type")}
                          </small>
                          <code>{ch.type || "TXT"}</code>
                        </div>
                      </Col>
                      <Col xs={6} md={4}>
                        <div className="bg-white border rounded p-2 text-center">
                          <small className="text-muted d-block">
                            {t("website.domain.ownership_for")}
                          </small>
                          <code className="text-break small">{ch.recordName}</code>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center bg-white border rounded p-2 gap-2">
                          <div className="flex-grow-1 min-w-0">
                            <small className="text-muted d-block">
                              {t("website.domain.value")}
                            </small>
                            <code className="text-break small">{ch.value}</code>
                          </div>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => copyToClipboard(ch.value)}
                            aria-label="Copy TXT value"
                          >
                            {t("website.domain.copy")}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Alert>
            )}

            {hasDnsInstructions && (
              <Card className="border-info bg-light mb-4">
                <Card.Body className="p-4">
                  <h6 className="fw-bold text-primary mb-3">
                    {t('website.domain.dns_setup_title')}
                  </h6>
                  <p className="text-muted small mb-4">
                    {t('website.domain.dns_setup_desc')}
                  </p>

                  {verificationInfo?.recommendedA && (
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-2">{t('website.domain.a_record')}</h6>
                      <Row className="g-2">
                        <Col xs={6} md={2}>
                          <div className="bg-white border rounded p-2 text-center">
                            <small className="text-muted d-block">{t('website.domain.type')}</small>
                            <code>A</code>
                          </div>
                        </Col>
                        <Col xs={6} md={2}>
                          <div className="bg-white border rounded p-2 text-center">
                            <small className="text-muted d-block">{t('website.domain.host')}</small>
                            <code>@</code>
                          </div>
                        </Col>
                        <Col xs={12} md={8}>
                          <div className="d-flex align-items-center bg-white border rounded p-2 gap-2">
                            <div className="flex-grow-1 min-w-0">
                              <small className="text-muted d-block">{t('website.domain.value')}</small>
                              <code className="text-break">
                                {verificationInfo.recommendedA}
                              </code>
                            </div>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(verificationInfo.recommendedA)
                              }
                              aria-label="Copy A record value"
                            >
                              {t('website.domain.copy')}
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      {verificationInfo?.currentARecords?.length > 0 && (
                        <p className="text-danger small mt-2 mb-0">
                          {t('website.domain.conflicting_records')}:{" "}
                          {verificationInfo.currentARecords.join(", ")}. Remove
                          them at your DNS provider.
                        </p>
                      )}
                    </div>
                  )}

                  {verificationInfo?.recommendedCname && (
                    <div>
                      <h6 className="fw-semibold mb-2">
                        {t('website.domain.cname_record')}
                        <small className="text-muted fw-normal ms-1">
                          optional for www
                        </small>
                      </h6>
                      <Row className="g-2">
                        <Col xs={6} md={2}>
                          <div className="bg-white border rounded p-2 text-center">
                            <small className="text-muted d-block">{t('website.domain.type')}</small>
                            <code>CNAME</code>
                          </div>
                        </Col>
                        <Col xs={6} md={2}>
                          <div className="bg-white border rounded p-2 text-center">
                            <small className="text-muted d-block">{t('website.domain.host')}</small>
                            <code>www</code>
                          </div>
                        </Col>
                        <Col xs={12} md={8}>
                          <div className="d-flex align-items-center bg-white border rounded p-2 gap-2">
                            <div className="flex-grow-1 min-w-0">
                              <small className="text-muted d-block">{t('website.domain.value')}</small>
                              <code className="text-break">
                                {verificationInfo.recommendedCname}
                              </code>
                            </div>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  verificationInfo.recommendedCname
                                )
                              }
                              aria-label="Copy CNAME value"
                            >
                              {t('website.domain.copy')}
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {verificationInfo?.error && !hasDnsInstructions && (
              <Alert variant="warning" className="mb-0 small">
                <strong>DNS:</strong> {verificationInfo.error}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border mt-4">
        <Card.Body className="p-4">
          <h5 className="fw-semibold mb-2">{t("website.domain.manual_title")}</h5>
          <p className="text-muted small mb-3">
            {t("website.domain.manual_desc")}
          </p>
          <Form.Label className="small fw-semibold mb-1">
            {t("website.domain.manual_domain_label")}
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="touchdownwings.com"
            value={manualDomain}
            onChange={(e) => {
              setManualDomain(e.target.value);
              if (manualError) setManualError("");
            }}
            isInvalid={!!manualError && !showManualPassword}
          />
          {manualError && !showManualPassword && (
            <Alert variant="danger" className="mt-3 mb-0 py-2 small">
              {manualError}
            </Alert>
          )}
          <div className="mt-3">
            <Button
              variant="outline-dark"
              onClick={openManualPassword}
              disabled={!manualDomain.trim() || manualLoading}
            >
              {t("website.domain.manual_connect")}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showManualPassword}
        onHide={() => !manualLoading && setShowManualPassword(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("website.domain.manual_password_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            {t("website.domain.manual_password_desc")}
          </p>
          <Form.Control
            type="password"
            autoFocus
            placeholder={t("website.domain.manual_password_placeholder")}
            value={manualPassword}
            onChange={(e) => {
              setManualPassword(e.target.value);
              if (manualError) setManualError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualConnect();
            }}
            isInvalid={!!manualError}
          />
          {manualError && (
            <Form.Control.Feedback type="invalid">
              {manualError}
            </Form.Control.Feedback>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowManualPassword(false)}
            disabled={manualLoading}
          >
            {t("website.domain.manual_cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleManualConnect}
            disabled={manualLoading || !manualPassword.trim()}
          >
            {manualLoading ? (
              <Spinner animation="border" size="sm" role="status" />
            ) : (
              t("website.domain.manual_confirm")
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
