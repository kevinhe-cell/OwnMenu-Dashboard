import React, { useEffect, useState, useRef } from "react";
import { Spinner, Button, Badge, Table, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Mail, 
  Image as ImageIcon,
  Send,
  FileText
} from "lucide-react";
import { getToken } from "../../../store/utlits";

const TEMPLATE_LABELS = {
  "1": "Modern Hero",
  "2": "Side-by-Side",
  "3": "Daily Specials",
  "4": "Minimalist",
  "5": "Menu Grid",
  "6": "Professional"
};

const EmailCampaignList = ({ refreshKey }) => {
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
        `/api/marketing/email-campaigns?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load Email campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    if (pollingRef.current) clearInterval(pollingRef.current);

    // Poll every 30 seconds for status updates
    pollingRef.current = setInterval(() => {
      fetchCampaigns();
    }, 30000);

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
          Campaign Archives
        </span>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-5 bg-white border border-dashed rounded-4">
          <Mail size={32} className="text-light-emphasis mb-2" />
          <p className="small text-muted mb-0">No automated campaigns found in history.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-4 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle border-0">
              <thead className="bg-light">
                <tr>
                  <th className="extra-small text-uppercase text-muted border-0 ps-4 py-3">Campaign & Content</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3">Audience</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3">Status</th>
                  <th className="extra-small text-uppercase text-muted border-0 py-3 pe-4 text-end">Date</th>
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
                      {/* Campaign Detail */}
                      <td className="ps-4 py-3" style={{ maxWidth: '300px' }}>
                        <div className="d-flex align-items-start gap-3">
                          {c.images?.length > 0 ? (
                            <img 
                              src={c.images[0]} 
                              alt="thumb" 
                              className="rounded-2 border shadow-sm"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div className="bg-light rounded-2 d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                              <ImageIcon size={18} className="text-muted" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="small fw-bold text-dark text-truncate">{c.subject}</div>
                            <div className="extra-small text-muted text-truncate">{c.preview_text}</div>
                          </div>
                        </div>
                      </td>

                      {/* Audience Info */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <Users size={14} className="text-muted me-2" />
                          <div>
                            <div className="extra-small fw-semibold text-dark">
                                {c.recipient_type?.replace("_", " ").toUpperCase()}
                            </div>
                            <div className="extra-small text-muted">{c.count_sent?.toLocaleString()} reached</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          {c.status === "sent" ? (
                            <Badge bg="success-subtle" className="text-success border border-success-subtle extra-small fw-medium rounded-pill px-2">
                              <CheckCircle2 size={10} className="me-1" /> Complete
                            </Badge>
                          ) : (
                            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle extra-small fw-medium rounded-pill px-2">
                              <Clock size={10} className="me-1" /> {c.status?.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="pe-4 py-3 text-end">
                        <div className="extra-small fw-medium text-dark">
                          {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : 'Pending'}
                        </div>
                        <div className="extra-small text-muted">
                          {c.sent_at ? new Date(c.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top">
              <span className="extra-small text-muted">
                Showing page <strong>{page}</strong> of {totalPages}
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="white"
                  className="extra-small border fw-bold px-3 py-1 rounded-pill"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="white"
                  className="extra-small border fw-bold px-3 py-1 rounded-pill"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .extra-small { font-size: 0.72rem; }
        .table > :not(caption) > * > * {
          background-color: transparent;
          box-shadow: none;
        }
        .table-responsive {
          scrollbar-width: thin;
        }
        tr:hover {
          background-color: #fafafa !important;
        }
      `}</style>

      {/* Campaign Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <Mail size={20} className="me-2 text-primary" />
            Email Campaign Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <div>
              <div className="mb-4">
                <label className="small text-muted text-uppercase fw-bold mb-2 d-block">Subject Line</label>
                <div className="p-3 bg-light rounded-3 border">
                  <p className="mb-0 fw-semibold text-dark">
                    {selectedCampaign.subject || 'No subject'}
                  </p>
                </div>
              </div>

              {selectedCampaign.preview_text && (
                <div className="mb-4">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">Preview Text</label>
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="mb-0 text-muted">
                      {selectedCampaign.preview_text}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                  <FileText size={14} className="me-1" /> Email Body
                </label>
                <div className="p-3 bg-light rounded-3 border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedCampaign.body || 'No body content'}
                  </p>
                </div>
              </div>

              {selectedCampaign.images && selectedCampaign.images.length > 0 && (
                <div className="mb-4">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <ImageIcon size={14} className="me-1" /> Images ({selectedCampaign.images.length})
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedCampaign.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Campaign ${idx + 1}`}
                        className="rounded-2 border shadow-sm"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Users size={14} className="me-1" /> Audience
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.recipient_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Send size={14} className="me-1" /> Recipients
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {selectedCampaign.count_sent?.toLocaleString() || 0} customers
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <CheckCircle2 size={14} className="me-1" /> Status
                  </label>
                  <div>
                    {selectedCampaign.status === "sent" ? (
                      <Badge bg="success-subtle" className="text-success border border-success-subtle fw-medium rounded-pill px-3 py-2">
                        <CheckCircle2 size={12} className="me-1" /> Complete
                      </Badge>
                    ) : (
                      <Badge bg="warning-subtle" className="text-warning border border-warning-subtle fw-medium rounded-pill px-3 py-2">
                        <Clock size={12} className="me-1" /> {selectedCampaign.status?.toUpperCase() || 'Processing'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    Template
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark">
                      {TEMPLATE_LABELS[selectedCampaign.template_choice] || `Template ${selectedCampaign.template_choice || 'N/A'}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                    <Calendar size={14} className="me-1" /> Sent Date
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
                        : 'Pending'
                      }
                    </div>
                    {selectedCampaign.sent_at && (
                      <div className="text-muted small">
                        {new Date(selectedCampaign.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                {selectedCampaign.finished_at && (
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-bold mb-2 d-block">
                      <Calendar size={14} className="me-1" /> Completed Date
                    </label>
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="fw-semibold text-dark">
                        {new Date(selectedCampaign.finished_at).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-muted small">
                        {new Date(selectedCampaign.finished_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

export default EmailCampaignList;