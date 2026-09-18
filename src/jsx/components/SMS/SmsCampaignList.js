import React, { useEffect, useState, useRef } from "react";
import { Spinner, Button, Badge, Table, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Users, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Calendar,
  Send
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";

const SmsCampaignList = ({ refreshKey }) => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pollingRef = useRef(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCampaigns = async (currentPage = page) => {
    const token = getToken();
    try {
      const res = await fetch(
        `/api/marketing/sms-campaigns?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load SMS campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchCampaigns(), 30000);
    return () => clearInterval(pollingRef.current);
  }, [refreshKey, page]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" size="sm" variant="primary" />
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="d-flex align-items-center mb-3">
        <History size={16} className="text-muted me-2" />
        <span className="small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>
          {t("marketing.sms.history.title")}
        </span>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-5 bg-white border border-dashed rounded-4">
          <MessageSquare size={32} className="text-light-emphasis mb-2" />
          <p className="small text-muted mb-0">{t("marketing.sms.history.empty")}</p>
        </div>
      ) : (
        <div className="bg-white border rounded-4 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle border-0">
              <thead className="bg-light">
                <tr>
                  <th className="extra-small text-uppercase text-muted border-0 ps-4 py-3">{t("marketing.sms.history.col_message")}</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3">{t("marketing.sms.history.col_audience")}</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3">{t("marketing.sms.history.col_status")}</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3 pe-4 text-end">{t("marketing.sms.history.col_date")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {campaigns.map((c) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-bottom"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedCampaign(c);
                        setShowModal(true);
                      }}
                    >
                      <td className="ps-4 py-3" style={{ maxWidth: '400px' }}>
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-light rounded-2 d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                            <MessageSquare size={18} className="text-muted" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="small fw-bold text-dark text-truncate">{c.message}</div>
                            <div className="extra-small text-muted">{c.message?.length} {t("marketing.common.characters")}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <Users size={14} className="text-muted me-2" />
                          <div>
                            <div className="extra-small fw-semibold text-dark">
                              {c.recipient_type?.replace("_", " ").toUpperCase()}
                            </div>
                            <div className="extra-small text-muted">{c.count_sent || 0} {t("marketing.common.reached")}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <Badge bg="success-subtle" className="text-success border border-success-subtle extra-small fw-medium rounded-pill px-2">
                          <CheckCircle2 size={10} className="me-1" /> {t("marketing.common.status_complete")}
                        </Badge>
                      </td>

                      <td className="pe-4 py-3 text-end">
                        <div className="extra-small fw-medium text-dark">
                          {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}
                        </div>
                        <div className="extra-small text-muted">
                          {c.sent_at ? new Date(c.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </Table>
          </div>
        </div>
      )}

      <style>{`
        .extra-small { font-size: 0.72rem; }
        .table > :not(caption) > * > * { background-color: transparent; box-shadow: none; }
        tr:hover { background-color: #fafafa !important; }
      `}</style>

      {/* Campaign Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <MessageSquare size={20} className="me-2 text-primary" />
            {t("marketing.sms.history.modal_title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <div>
              <div className="mb-4">
                <label className="small text-muted text-uppercase fw-bold mb-2 d-block">{t("marketing.sms.history.col_message")}</label>
                <div className="p-3 bg-light rounded-3 border">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedCampaign.message}
                  </p>
                </div>
                <div className="text-muted small mt-2">
                  {selectedCampaign.message?.length} {t("marketing.common.characters")}
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Users size={14} className="me-1" /> {t("marketing.sms.history.col_audience")}
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.recipient_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Send size={14} className="me-1" /> {t("marketing.sms.history.modal_recipients")}
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.count_sent?.toLocaleString() || 0} {t("marketing.sms.history.modal_customers")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <CheckCircle2 size={14} className="me-1" /> {t("marketing.sms.history.col_status")}
                  </label>
                  <div>
                    <Badge bg="success-subtle" className="text-success border border-success-subtle fw-medium rounded-pill px-3 py-2">
                      <CheckCircle2 size={12} className="me-1" /> {t("marketing.common.status_complete")}
                    </Badge>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Calendar size={14} className="me-1" /> {t("marketing.sms.history.modal_sent_date")}
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.sent_at 
                        ? new Date(selectedCampaign.sent_at).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : new Date(selectedCampaign.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                      }
                    </div>
                    <div className="text-muted small">
                      {selectedCampaign.sent_at 
                        ? new Date(selectedCampaign.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(selectedCampaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </div>
                  </div>
                </div>
              </div>

              {selectedCampaign.tokens_used && (
                <div className="mb-3">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">{t("marketing.sms.history.modal_tokens_used")}</label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.tokens_used?.toLocaleString() || 0} {t("marketing.sms.history.modal_sms_tokens")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("marketing.common.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SmsCampaignList;