import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Table, Badge, Spinner, Alert, Button, Row, Col, Nav, Form } from "react-bootstrap";
import { 
  getCustomerProfileThunk, 
  clearCustomerProfile, 
  updateCustomerProfileThunk,
  updateCustomerTagsThunk
} from "../../../store/customers";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler } from "chart.js";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler);

// Layer 1 tags (mutually exclusive)
const LAYER_1_TAGS = ['new_customer', 'returning_customer', 'vip'];

function CustomerProfileModal({ show, onHide, customerId, onTagsSaved }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const TAG_CONFIG = useMemo(() => ({
    new_customer: { color: "#dd2f6e", label: t('customers.tags.new_customer'), icon: "fa-user-plus" },
    returning_customer: { color: "#10b981", label: t('customers.tags.returning_customer'), icon: "fa-history" },
    vip: { color: "#f59e0b", label: t('customers.tags.vip'), icon: "fa-crown" },
    at_risk: { color: "#ef4444", label: t('customers.tags.at_risk'), icon: "fa-exclamation-circle" },
    inactive_30: { color: "#64748b", label: t('customers.tags.inactive_30'), icon: "fa-clock" },
    inactive_60: { color: "#1e293b", label: t('customers.tags.inactive_60'), icon: "fa-calendar-xmark" },
    brand_advocate: { color: "#8b5cf6", label: t('customers.tags.brand_advocate'), icon: "fa-star" },
    lapsed_vip: { color: "#d97706", label: t('customers.tags.lapsed_vip'), icon: "fa-gem" },
    one_time_buyer: { color: "#94a3b8", label: t('customers.tags.one_time_buyer'), icon: "fa-bag-shopping" },
    lunch_buyer: { color: "#06b6d4", label: t('customers.tags.lunch_buyer'), icon: "fa-sun" },
    dinner_buyer: { color: "#dd2f6e", label: t('customers.tags.dinner_buyer'), icon: "fa-moon" },
    late_night_owl: { color: "#4338ca", label: t('customers.tags.late_night_owl'), icon: "fa-owl" },
    weekend_warrior: { color: "#0ea5e9", label: t('customers.tags.weekend_warrior'), icon: "fa-calendar-days" },
    pickup_only: { color: "#14b8a6", label: t('customers.tags.pickup_only'), icon: "fa-walking" },
    delivery_only: { color: "#ec4899", label: t('customers.tags.delivery_only'), icon: "fa-truck-fast" },
    promo_hunter: { color: "#be185d", label: t('customers.tags.promo_hunter'), icon: "fa-tag" },
  }), [t]);
  const profile = useSelector((s) => s.customers.profile);
  const loading = useSelector((s) => s.customers.profileLoading);
  const error = useSelector((s) => s.customers.profileError);
  
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", email: "", opt_in: false, email_opt: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [editingTags, setEditingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    if (show && customerId) dispatch(getCustomerProfileThunk(customerId));
    return () => dispatch(clearCustomerProfile());
  }, [dispatch, show, customerId]);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        opt_in: !!profile.opt_in,
        email_opt: profile.email_opt !== false,
      });
      setSelectedTags(Array.isArray(profile.tags) ? [...profile.tags] : []);
    }
  }, [profile]);
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validatePhone = (phone) => {
    return phone.length === 10 && !isNaN(phone);
  };
  const validateName = (name) => {
    return name.trim() !== "";
  };  

  const handleSave = async () => {
    if (!validateName(editData.name) || !validatePhone(editData.phone) || !validateEmail(editData.email)) {
      return Swal.fire(t('customers.swal.invalid_profile'), t('customers.swal.invalid_profile_msg'), "error");
    }

    try {
      if (profile.phone !== editData.phone) {
        const result = await Swal.fire({
          title: t('customers.swal.update_phone_title'),
          text: t('customers.swal.update_phone_text', { phone: editData.phone }),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#dd2f6e",
          confirmButtonText: t('common.confirm'),
        });
        if (!result.isConfirmed) return;
      }

      setSavingProfile(true);
      await dispatch(updateCustomerProfileThunk(customerId, editData));
      setEditMode(false);
      Swal.fire({ icon: "success", title: t('customers.swal.profile_updated'), toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleTag = (tag) => {
    setSelectedTags(prev => {
      // If this is a Layer 1 tag (new, returning, vip), ensure mutual exclusivity
      if (LAYER_1_TAGS.includes(tag)) {
        if (prev.includes(tag)) {
          // Deselecting this Layer 1 tag
          return prev.filter(t => t !== tag);
        } else {
          // Selecting this Layer 1 tag - remove all other Layer 1 tags first
          const withoutLayer1 = prev.filter(t => !LAYER_1_TAGS.includes(t));
          return [...withoutLayer1, tag];
        }
      } else {
        // Layer 2 tags can be toggled normally
        return prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag];
      }
    });
  };

  const handleSaveTags = async () => {
    try {
      setSavingTags(true);
      const data = await dispatch(updateCustomerTagsThunk(customerId, selectedTags));
      setEditingTags(false);
      if (data?.tags) setSelectedTags(data.tags);
      onTagsSaved?.();
      Swal.fire({ icon: "success", title: t('customers.swal.tags_updated'), toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update tags", "error");
    } finally {
      setSavingTags(false);
    }
  };

   const renderStats = () => (
    <div className="d-flex align-items-center justify-content-between p-4 mb-4" style={{ backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <div className="text-center px-3 flex-grow-1">
        <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>{t('customers.stats.total_orders')}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1e293b" }}>{profile.stats?.totalOrders || 0}</div>
      </div>
      <div style={{ width: "1px", height: "40px", backgroundColor: "#e2e8f0" }}></div>
      <div className="text-center px-3 flex-grow-1">
        <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>{t('customers.stats.monthly_avg')}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1e293b" }}>{profile.stats?.avgPerMonth || 0}</div>
      </div>
      <div style={{ width: "1px", height: "40px", backgroundColor: "#e2e8f0" }}></div>
      <div className="text-center px-3 flex-grow-1">
        <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>{t('customers.table.points')}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#dd2f6e" }}>{profile.points || 0}</div>
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <style>{`
        .profile-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .avatar-box { width: 64px; height: 64px; border-radius: 12px; background: linear-gradient(135deg, #dd2f6e 0%, #dd2f6e 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
        .tag-pill-sm { background: white; border: 1px solid currentColor; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .nav-link-modern { font-size: 13px; font-weight: 700; padding: 10px 20px; color: #64748b; }
        .nav-pills .nav-link-modern.active { background-color: #dd2f6e !important; color: white; border-radius: 10px; }
      `}</style>

      <Modal.Header closeButton className="border-0 px-4 pt-4">
        <Modal.Title className="fw-bold" style={{ color: "#1e293b", fontSize: "1.1rem" }}>
          <i className="fas fa-id-card me-2 text-primary"></i> {t('customers.modals.profile.title')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : profile && (
          <>
            {/* Identity Card with Edit Mode */}
            <div className="profile-card mb-4">
              <div className="d-flex align-items-start gap-4">
                <div className="avatar-box">{profile.name?.charAt(0)}</div>
                <div className="flex-grow-1">
                  {editMode ? (
                     <div className="row g-2 align-items-end">
                      <Col md={4}>
                        <Form.Label className="small fw-bold text-muted uppercase">{t('customers.modals.profile.full_name')}</Form.Label>
                        <Form.Control 
                          className="shadow-none border-2"
                          value={editData.name} 
                          onChange={e => setEditData({...editData, name: e.target.value})} 
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small fw-bold text-muted uppercase">{t('customers.modals.profile.phone')}</Form.Label>
                        <Form.Control 
                          className="shadow-none border-2"
                          maxLength={10}
                          value={editData.phone} 
                          onChange={e => setEditData({...editData, phone: e.target.value.replace(/\D/g,"")})} 
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small fw-bold text-muted uppercase">{t('customers.modals.profile.email')}</Form.Label>
                        <Form.Control 
                          className="shadow-none border-2"
                          value={editData.email} 
                          onChange={e => setEditData({...editData, email: e.target.value})} 
                        />
                      </Col>
                      <Col xs={12} className="mt-2">
                        <Form.Check
                          type="checkbox"
                          id="profile-opt-in-sms"
                          label={t('customers.modals.profile.sms_opt')}
                          checked={!!editData.opt_in}
                          onChange={e => setEditData({ ...editData, opt_in: e.target.checked })}
                          className="small"
                        />
                        <Form.Check
                          type="checkbox"
                          id="profile-email-opt"
                          label={t('customers.modals.profile.email_opt')}
                          checked={editData.email_opt !== false}
                          onChange={e => setEditData({ ...editData, email_opt: e.target.checked })}
                          className="small ms-3"
                        />
                      </Col>
                      <Col md={3} className="d-flex gap-2">
                        <Button variant="dark" className="fw-bold" onClick={handleSave} disabled={savingProfile}>
                          {savingProfile ? <Spinner size="sm" /> : t('customers.modals.profile.save')}
                        </Button>
                        <Button variant="outline-secondary" onClick={() => setEditMode(false)}>{t('common.cancel')}</Button>
                      </Col>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h4 className="fw-bold mb-1 text-dark">{profile.name}</h4>
                          <div className="text-muted small">
                            <i className="fas fa-phone-alt me-2"></i>{profile.phone}
                            <span className="mx-2">|</span>
                            <i className="fas fa-envelope me-2"></i>{profile.email || t('customers.modals.profile.no_email')}
                          </div>
                          <div className="mt-2 small">
                            <Badge bg={profile.opt_in ? "success" : "secondary"} className="me-1">{t('customers.modals.profile.sms')} {profile.opt_in ? t('customers.modals.profile.on') : t('customers.modals.profile.off')}</Badge>
                            <Badge bg={profile.email_opt !== false ? "success" : "secondary"}>{t('customers.modals.profile.email_label')} {profile.email_opt !== false ? t('customers.modals.profile.on') : t('customers.modals.profile.off')}</Badge>
                          </div>
                        </div>
                        <Button variant="light" size="sm" className="border shadow-none rounded-3" onClick={() => setEditMode(true)}>
                          <i className="fas fa-user-edit me-1"></i> {t('customers.modals.profile.edit')}
                        </Button>
                      </div>
                      {editingTags ? (
                        <div className="mt-3">
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {Object.keys(TAG_CONFIG).map(tagKey => (
                              <Button
                                key={tagKey}
                                variant={selectedTags.includes(tagKey) ? "primary" : "outline-secondary"}
                                size="sm"
                                className="rounded-pill"
                                onClick={() => handleToggleTag(tagKey)}
                                style={selectedTags.includes(tagKey) ? { 
                                  backgroundColor: TAG_CONFIG[tagKey]?.color || '#94a3b8',
                                  borderColor: TAG_CONFIG[tagKey]?.color || '#94a3b8'
                                } : {}}
                              >
                                <i className={`fas ${TAG_CONFIG[tagKey]?.icon || 'fa-tag'} me-1`}></i>
                                {TAG_CONFIG[tagKey]?.label || tagKey}
                              </Button>
                            ))}
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="dark" size="sm" onClick={handleSaveTags} disabled={savingTags}>
                              {savingTags ? <Spinner size="sm" /> : t('customers.modals.tags.save')}
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => {
                              setEditingTags(false);
                              setSelectedTags(Array.isArray(profile.tags) ? [...profile.tags] : []);
                            }}>
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-1 mt-3 align-items-center">
                          {profile.tags?.map(t => (
                            <span key={t} className="tag-pill-sm" style={{ color: TAG_CONFIG[t]?.color || '#94a3b8' }}>
                              <i className={`fas ${TAG_CONFIG[t]?.icon || 'fa-tag'} me-1`}></i> {TAG_CONFIG[t]?.label || t}
                            </span>
                          ))}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-decoration-none text-primary small ms-2"
                            onClick={() => setEditingTags(true)}
                          >
                            <i className="fas fa-edit me-1"></i>{t('customers.modals.profile.edit_tags')}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {renderStats()}

            <Nav variant="pills" activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-4 bg-light p-1" style={{ borderRadius: "12px", width: "fit-content" }}>
              <Nav.Item><Nav.Link eventKey="orders" className="nav-link-modern">{t('customers.modals.profile.history')}</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="insights" className="nav-link-modern">{t('customers.modals.profile.ai')}</Nav.Link></Nav.Item>
            </Nav>

            {activeTab === "orders" ? (
              <div className="border rounded-4 overflow-hidden shadow-sm bg-white">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 small fw-bold text-muted">{t('customers.modals.profile.order')}</th>
                      <th className="py-3 small fw-bold text-muted">{t('customers.modals.profile.value')}</th>
                      <th className="py-3 small fw-bold text-muted">{t('customers.modals.profile.date')}</th>
                      <th className="px-4 py-3 text-end small fw-bold text-muted">{t('customers.modals.profile.receipt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.orders?.map(o => (
                      <tr key={o.id}>
                        <td className="px-4 py-3 fw-bold text-dark">#{o.id}</td>
                        <td className="fw-bold text-primary">${o.order_total}</td>
                        <td className="text-muted small">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 text-end">
                          <Button variant="link" className="p-0 text-decoration-none fw-bold small text-primary" onClick={() => window.open(o.receiptUrl, "_blank")}>{t('customers.modals.profile.view')}</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="p-5 text-center bg-white border rounded-4 text-muted small">
                {t('customers.modals.profile.ai_msg')}
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default CustomerProfileModal;