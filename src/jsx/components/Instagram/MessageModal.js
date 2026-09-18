import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Form, Alert, Card, Badge } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import Lottie from "lottie-react";
import messagelottie from "../../../json/message.json";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const setupMessages = [
  "Setting up your AI agent...",
  "Training your agent...",
  "Enabling auto-reply...",
];
const disableMessages = [
  "Disabling your AI agent...",
  "Deleting saved messages...",
];

export default function MessagesModal({ show, onClose, restaurantId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [showSetupOverlay, setShowSetupOverlay] = useState(false);
  const [messagesData, setMessagesData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [autoRespondEnabled, setAutoRespondEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [setupMessage, setSetupMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const isOverlayLoading = loading || initLoading;

  useEffect(() => {
    if (!show) {
      setSelectedUserId(null);
      return;
    }

    const fetchData = async () => {
      const token = getToken();
      try {
        setLoading(true);
        const [msgRes, agentRes] = await Promise.all([
          fetch("/api/instagram-account/messages", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/ai-agent/${restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!msgRes.ok) throw new Error(t("marketing.instagram_messages.init_fail_msg"));
        const msgData = await msgRes.json();
        setMessagesData(msgData);

        if (agentRes.ok) {
          const agentData = await agentRes.json();
          setAutoRespondEnabled(agentData.enabled);
        }
      } catch (err) {
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show]);

  useEffect(() => {
    if (!showSetupOverlay) return;

    const messages = autoRespondEnabled 
      ? t("marketing.instagram_messages.disable_messages", { returnObjects: true }) 
      : t("marketing.instagram_messages.setup_messages", { returnObjects: true });
    setMessageIndex(0);
    setSetupMessage(messages[0]);

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = prev + 1;
        if (next < messages.length) {
          setSetupMessage(messages[next]);
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [showSetupOverlay]);

  const handleToggle = async () => {
    const token = getToken();
    const newState = !autoRespondEnabled;
    setShowSetupOverlay(true);

    if (newState) {
      try {
        const res = await fetch(`/api/ai-agent/init`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("instagram_messages.init_fail_msg"));
        await new Promise((res) => setTimeout(res, 10000));
        setAutoRespondEnabled(true);
      } catch (err) {
        console.error(err.message);
      } finally {
        setShowSetupOverlay(false);
        Swal.fire({
          icon: "success",
          title: t("instagram_messages.init_success_title"),
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } else {
      try {
        await fetch(`/api/ai-agent/toggle`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: false }),
        });
        await new Promise((res) => setTimeout(res, 5000));
        setAutoRespondEnabled(false);
      } catch (err) {
        setError(err.message || t("marketing.instagram_messages.toggle_fail_msg"));
      } finally {
        setShowSetupOverlay(false);
      }
    }
  };

  const selectedConversation = messagesData?.conversations?.find(
    (conv) => conv.instagram_user_id === selectedUserId,
  );

  return (
    <Modal
      show={show}
      onHide={showSetupOverlay ? null : onClose}
      size="xl"
      centered
      backdrop={showSetupOverlay ? "static" : true}
      keyboard={!showSetupOverlay}
    >
      <Modal.Header
        closeButton={!showSetupOverlay}
        className="align-items-center"
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
          <Modal.Title className="mb-0">{t("marketing.instagram_messages.title")}</Modal.Title>
          {!showSetupOverlay && autoRespondEnabled && (
            <Form.Check
              type="switch"
              id="auto-respond-toggle"
              label={
                <span className="fw-semibold small">
                  {t("marketing.instagram_messages.enable_auto_label")}
                </span>
              }
              checked={autoRespondEnabled}
              onChange={handleToggle}
              disabled={initLoading || showSetupOverlay}
              className="d-flex align-items-center"
              style={{ gap: "0.5rem", marginBottom: 0 }}
            />
          )}
        </div>
      </Modal.Header>

      <Modal.Body style={{ height: "70vh", overflow: "hidden", padding: "0" }}>
        {isOverlayLoading || showSetupOverlay ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div style={{ width: 200 }}>
              <Lottie animationData={messagelottie} loop autoplay />
            </div>
            <p
              className="mt-3 text-center fw-medium"
              style={{ whiteSpace: "pre-line" }}
            >
              {setupMessage}
            </p>
          </div>
        ) : !autoRespondEnabled ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4 text-center">
            <div style={{ width: 220 }}>
              <Lottie animationData={messagelottie} loop autoplay />
            </div>
            <Button
              variant="primary"
              size="lg"
              className="mt-4 px-4 py-2 fw-semibold"
              onClick={handleToggle}
            >
              {t("marketing.instagram_messages.enable_auto_label")}
            </Button>
            <div
              className="mt-4 text-start bg-light rounded border p-3 small"
              style={{ maxWidth: 460 }}
            >
              <h5 className="fw-bold mb-2">{t("marketing.instagram_messages.why_enable_title")}</h5>
                <ul className="text-muted small ps-3 mb-4">
                  {t("marketing.instagram_messages.why_enable_list", { returnObjects: true }).map((item, i) => (
                    <li key={i} className="mb-1">{item}</li>
                  ))}
                </ul>
            </div>
          </div>
        ) : (
          <div
            className="d-flex h-100"
            style={{ gap: "1rem", padding: "1rem" }}
          >
            {/* Left: Conversation list */}
            <div
              className="flex-shrink-0"
              style={{
                width: "100%",
                maxWidth: "320px",
                minWidth: "240px",
                overflowY: "auto",
                flexBasis: "30%",
              }}
            >
              <div
                className="bg-white p-3 rounded border"
                style={{ minHeight: "100%", overflowY: "auto" }}
              >
                <Alert
                  variant="secondary"
                  className="small rounded mb-4"
                  style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }}
                >
                  <h6 className="fw-bold mb-2 small text-uppercase" style={{ letterSpacing: "0.5px" }}>
                  {t("marketing.instagram_messages.heads_up_title")}
                </h6>
                <ul className="text-muted small ps-3 mb-0">
                  {t("marketing.instagram_messages.heads_up_list", { returnObjects: true }).map((item, i) => (
                    <li key={i} className="mb-1">{item}</li>
                  ))}
                </ul>
                </Alert>
                {messagesData?.conversations.length === 0 && (
                  <span>{t("marketing.instagram_messages.no_conversations")}</span>
                )}
                {messagesData?.conversations?.map((conv) => {
                  const latestMsg = conv?.messages[0].text || "";
                  return (
                    <Card
                      key={conv.instagram_user_id}
                      onClick={() => setSelectedUserId(conv.instagram_user_id)}
                      className={`mb-3 shadow-sm conversation-card ${selectedUserId === conv.instagram_user_id ? "border-primary" : ""}`}
                      style={{
                        cursor: "pointer",
                        borderRadius: "12px",
                        transition: "box-shadow 0.2s ease",
                      }}
                    >
                      <Card.Body>
                        <div className="fw-semibold small mb-1 text-dark">
                          <strong>{t("marketing.instagram_messages.user_id_label")}</strong> {conv.instagram_user_id}
                        </div>
                        <div
                          className="text-muted small text-truncate"
                          style={{ maxWidth: "100%" }}
                        >
                          {latestMsg.length > 100
                            ? latestMsg.slice(0, 100) + "..."
                            : latestMsg}
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right: Message thread */}
            <div className="flex-grow-1 d-flex flex-column rounded bg-white p-3 border">
              {selectedConversation ? (
                <>
                  <div className="border-bottom pb-2 mb-3">
                    <strong>{t("marketing.instagram_messages.conversation_with")}</strong>{" "}
                    {selectedConversation.instagram_user_id}
                  </div>
                  <div className="flex-grow-1" style={{ overflowY: "auto" }}>
                    <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
                      {selectedConversation.messages.map((msg, idx) => {
                        const isIncoming = msg.direction === "incoming";
                        const isAutomated = msg.message_id?.startsWith("auto-");

                        return (
                          <div
                            key={idx}
                            className={`d-flex mb-3 ${isIncoming ? "" : "justify-content-end"}`}
                          >
                            <div
                              className="p-2 rounded shadow-sm text-wrap position-relative"
                              style={{
                                backgroundColor: isIncoming
                                  ? "#f1f1f1"
                                  : "#DD2F6E",
                                color: isIncoming ? "#000" : "#fff",
                                maxWidth: "75%",
                                whiteSpace: "pre-line",
                              }}
                            >
                              <div>{msg.text}</div>
                              <div className="text-end small text-muted mt-1">
                                {new Date(msg.timestamp).toLocaleString()}
                              </div>
                              {!isIncoming && isAutomated && (
                                <span
                                  className="position-absolute top-0 end-0 me-2 mt-1"
                                >
                                  <Badge bg="info" className="ms-2">{t("marketing.instagram_messages.automated_badge")}</Badge>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted d-flex align-items-center justify-content-center h-100">
                  {t("instagram_messages.select_prompt")}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={showSetupOverlay}
        >
          {t("common.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
