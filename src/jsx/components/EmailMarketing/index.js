import React, { useState, useEffect } from "react";
import { Button, Card, Form, Row, Col, Spinner, Alert, Badge, ProgressBar } from "react-bootstrap";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Users, Layout, Send, ChevronRight,
  ChevronLeft, CheckCircle, Image as ImageIcon, Zap
} from "lucide-react";
import Lottie from "lottie-react";
import smsLottie from "../../../json/sms.json";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../store/utlits";
import swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import EmailCampaignList from "./EmailCampignList";

// Template labels (replacing image imports with text labels)
const TEMPLATE_CONFIG = {
  "1": { label: "Modern Hero", desc: "Centered and clean" },
  "2": { label: "Side-by-Side", desc: "Card layout" },
  "3": { label: "Daily Specials", desc: "List style" },
  "4": { label: "Minimalist", desc: "Personal letter" },
  "5": { label: "Menu Grid", desc: "3-column style" },
  "6": { label: "Professional", desc: "Bold alert style" },
};

const TAG_CONFIG = {
  new_customer: { label: "New Customers", desc: "First-time customers" },
  returning_customer: { label: "Returning Customers", desc: "2-5 orders" },
  vip: { label: "VIP Customers", desc: "5+ orders or $300+ spend" },
  at_risk: { label: "At Risk", desc: "Last order 21-29 days ago" },
  inactive_30: { label: "Inactive 30d", desc: "Last order 30-59 days ago" },
  inactive_60: { label: "Inactive 60d+", desc: "Last order 60+ days ago" },
  brand_advocate: { label: "Brand Advocates", desc: "5-star reviewers" },
  lapsed_vip: { label: "Lapsed VIP", desc: "VIP inactive 30+ days" },
  one_time_buyer: { label: "One-Time Buyers", desc: "1 order, inactive 14+ days" },
  highly_active: { label: "Highly Active", desc: "5+ orders in last 30 days" },
  lunch_buyer: { label: "Lunch Buyers", desc: "60%+ lunch orders" },
  dinner_buyer: { label: "Dinner Buyers", desc: "60%+ dinner orders" },
  late_night_owl: { label: "Late Night", desc: "50%+ orders after 10PM" },
  weekend_warrior: { label: "Weekend Warriors", desc: "70%+ weekend orders" },
  pickup_only: { label: "Pickup Only", desc: "80%+ pickup orders" },
  delivery_only: { label: "Delivery Only", desc: "80%+ delivery orders" },
  low_basket: { label: "Low Basket", desc: "Avg order < $20" },
  big_spender: { label: "Big Spenders", desc: "Avg order > $40" },
  promo_hunter: { label: "Promo Hunters", desc: "50%+ orders with coupons" },
  group_orderer: { label: "Group Orderers", desc: "Avg 4+ items per order" },
};

const AutomatedEmail = () => {
  const { t } = useTranslation();
  const plan = useSelector((state) => state.session.userPlan);
  const navigate = useNavigate();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  // Core Logic State
  const [blastType, setBlastType] = useState("all");
  const [customCustomerCount, setCustomCustomerCount] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [audience, setAudience] = useState("all");
  const [totalRewardUsers, setTotalRewardUsers] = useState(0);
  const [tagCounts, setTagCounts] = useState({});
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [hasEmails, setHasEmails] = useState(false);
  const [templateChoice, setTemplateChoice] = useState("1");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("friendly");
  const [generating, setGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [images, setImages] = useState([]);
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/marketing/email/overview", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setTotalRewardUsers(data.totalRewardUsers || 0);
        setTagCounts(data.tagCounts || {});
        setHasEmails((data.totalRewardUsers || 0) > 0);
      } catch (err) {
        console.error("Failed to fetch email overview", err);
      } finally {
        setLoadingOverview(false);
      }
    };
    fetchOverview();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/email/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ promo: prompt, tone, audienceGroup: audience }),
      });
      const data = await res.json();
      setSubject(data.subject || "");
      setPreviewText(data.previewText || "");
      setBody(data.body || "");
      setWebsiteUrl(data.websiteUrl || "");
      // Auto-move to next step once generated
      setCurrentStep(4);
    } catch (err) {
      alert(t("marketing.email.swal.err_generate"));
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Template image limits: 1 -> 1 image, 2 -> 2 images, 3 -> 5 images, 4 -> 0 images, 5 -> 3 images, 6 -> 0 images
    const limit = templateChoice === "1" ? 1 : templateChoice === "2" ? 2 : templateChoice === "3" ? 5 : templateChoice === "4" ? 0 : templateChoice === "5" ? 3 : 0;
    const previews = files.slice(0, limit - images.length).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...previews].slice(0, limit));
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !body.trim() || !testEmail.trim()) {
      swal.fire(t("common.error"), t("marketing.email.swal.err_test_fields"), "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      swal.fire(t("common.error"), t("marketing.email.swal.err_test_email"), "error");
      return;
    }

    setSendingTest(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("preview_text", previewText);
      formData.append("body", body);
      formData.append("website_url", websiteUrl);
      formData.append("template_choice", templateChoice);
      formData.append("test_email", testEmail);
      images.forEach((img) => { if (img.file) formData.append("images", img.file); });

      const res = await fetch("/api/marketing/email/test-message", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (res.ok) {
        swal.fire(t("common.success"), t("marketing.email.swal.test_success"), "success");
      } else {
        const err = await res.json();
        swal.fire(t("common.error"), err.error || t("marketing.email.swal.err_test_send"), "error");
      }
    } catch (err) {
      swal.fire(t("common.error"), t("marketing.email.swal.err_test_send"), "error");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || actualCount < 1) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("preview_text", previewText);
      formData.append("body", body);
      formData.append("website_url", websiteUrl);
      formData.append("template_choice", templateChoice);
      formData.append("recipient_type", audience);
      formData.append("count_sent", actualCount);
      formData.append("sort_order", blastType === "custom" ? sortOrder : "newest");
      images.forEach((img) => { if (img.file) formData.append("images", img.file); });

      const res = await fetch("/api/marketing/email-campaigns", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (res.ok) {
        swal.fire(t("common.success"), t("marketing.email.swal.campaign_launched"), "success");
        setRefreshKey(Date.now());
        setCurrentStep(1);
        setBlastType("all");
        setCustomCustomerCount("");
        setSortOrder("newest");
      }
    } catch (err) {
      swal.fire(t("common.error"), t("marketing.email.swal.err_send"), "error");
    } finally {
      setSending(false);
    }
  };

  const getCurrentCount = () => {
    if (audience === "all") return totalRewardUsers;
    return tagCounts[audience] || 0;
  };

  const maxCount = getCurrentCount();
  let actualCount = blastType === "all" ? maxCount : parseInt(customCustomerCount) || 0;
  if (actualCount > maxCount) actualCount = maxCount;
  if (actualCount < 0) actualCount = 0;

  // Plan Gating — Marketing Add-on
  if (!plan?.marketing_enabled) {
    return (
      <Card className="border-0 shadow-sm text-center p-5 rounded-4">
        <Lottie animationData={smsLottie} style={{ width: 250, margin: "0 auto" }} />
        <h3 className="fw-bold mt-4">{t("marketing.email.title")}</h3>
        <p className="text-muted">{t("marketing.email.desc")}</p>
        <Button variant="primary" size="lg" className="rounded-pill px-5" onClick={() => navigate("/plans")}>
          {t("marketing.email.upgrade_btn")}
        </Button>
      </Card>
    );
  }

  // Animation variants
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="container-fluid py-2" style={{ maxWidth: "1100px" }}>
      {/* Header & Stepper */}
      <div className="text-center mb-5">
        <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">
          <Sparkles size={14} className="me-1" /> Email Autopilot
        </Badge>
        <h2 className="fw-bold">{t("marketing.email.new_campaign")}</h2>
        <div className="d-flex justify-content-center mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="d-flex align-items-center">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm transition-all`}
                style={{
                  width: "35px", height: "35px",
                  backgroundColor: currentStep >= s ? "#dd2f6e" : "#f8f9fa",
                  color: currentStep >= s ? "white" : "#adb5bd",
                  border: currentStep === s ? "2px solid #dd2f6e" : "1px solid #dee2e6"
                }}
              >
                {currentStep > s ? <CheckCircle size={18} /> : s}
              </div>
              {s < 4 && <div style={{ width: "40px", height: "2px", backgroundColor: currentStep > s ? "#dd2f6e" : "#dee2e6" }} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-lg border-0 rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-4 p-md-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: AUDIENCE */}
            {currentStep === 1 && (
              <motion.div key="step1" {...slideVariants}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Users className="me-2 text-primary" /> {t("marketing.email.step_target")}</h4>
                  <p className="text-muted">{t("marketing.email.step_target_desc")}</p>
                </div>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t("marketing.sms.segment_group")}</Form.Label>
                  <Form.Select className="form-control-lg border-2" value={audience} onChange={(e) => setAudience(e.target.value)}>
                    <option value="all">{t("marketing.email.all_active_customers")} ({totalRewardUsers})</option>
                    <optgroup label={t("marketing.email.smart_tags")}>
                      {Object.keys(TAG_CONFIG).map(t_key => <option key={t_key} value={t_key}>{t(`marketing.segments.${t_key}`)} ({tagCounts[t_key] || 0})</option>)}
                    </optgroup>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t("marketing.email.blast_size")}</Form.Label>
                  <Form.Select className="form-control-lg border-2" value={blastType} onChange={(e) => setBlastType(e.target.value)}>
                    <option value="all">{t("marketing.sms.all_customers")}</option>
                    <option value="custom">{t("marketing.sms.custom_amount")}</option>
                  </Form.Select>
                </Form.Group>
                {blastType === "custom" && (
                  <>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold text-uppercase">{t("marketing.sms.customer_count")}</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={maxCount}
                        className="form-control-lg border-2"
                        placeholder={t("marketing.sms.customer_count_placeholder", { max: maxCount })}
                        value={customCustomerCount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= maxCount)) {
                            setCustomCustomerCount(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            setCustomCustomerCount("");
                          } else if (value > maxCount) {
                            setCustomCustomerCount(maxCount.toString());
                          }
                        }}
                      />
                      {customCustomerCount && parseInt(customCustomerCount) > maxCount && (
                        <Form.Text className="text-danger">
                          {t("marketing.sms.max_customers_note", { count: maxCount })}
                        </Form.Text>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold text-uppercase">{t("marketing.sms.sort_by")}</Form.Label>
                      <Form.Select className="form-control-lg border-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">{t("marketing.sms.sort_newest")}</option>
                        <option value="oldest">{t("marketing.sms.sort_oldest")}</option>
                      </Form.Select>
                    </Form.Group>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: TEMPLATE */}
            {currentStep === 2 && (
              <motion.div key="step2" {...slideVariants}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Layout className="me-2 text-primary" /> {t("marketing.email.step_template")}</h4>
                  <p className="text-muted">{t("marketing.email.step_template_desc")}</p>
                </div>
                <Row className="g-3">
                  {Object.keys(TEMPLATE_CONFIG).map(templateId => {
                    const template = TEMPLATE_CONFIG[templateId];
                    const isSelected = templateChoice === templateId;
                    return (
                      <Col xs={6} md={4} key={templateId}>
                        <div
                          onClick={() => setTemplateChoice(templateId)}
                          className={`p-4 rounded-3 border-3 transition-all d-flex flex-column align-items-center justify-content-center ${isSelected ? 'border-primary shadow-sm bg-primary bg-opacity-10' : 'border-light'}`}
                          style={{
                            cursor: "pointer",
                            height: "150px",
                            minHeight: "150px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <h5 className={`fw-bold mb-1 ${isSelected ? 'text-primary' : 'text-dark'}`}>
                            {t(`marketing.email.templates.${templateId}.label`)}
                          </h5>
                          <small className={`${isSelected ? 'text-primary' : 'text-muted'}`}>
                            {t(`marketing.email.templates.${templateId}.desc`)}
                          </small>
                          {isSelected && (
                            <CheckCircle size={20} className="mt-2 text-primary" />
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </motion.div>
            )}

            {/* STEP 3: AI GENERATION */}
            {currentStep === 3 && (
              <motion.div key="step3" {...slideVariants}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Sparkles className="me-2 text-primary" /> {t("marketing.email.step_ai")}</h4>
                  <p className="text-muted">{t("marketing.email.step_ai_desc")}</p>
                </div>
                <Form.Group className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    className="border-2 p-3"
                    placeholder={t("marketing.email.ai_placeholder")}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex gap-2 mb-4">
                  {['Friendly', 'Professional', 'Playful'].map(tone_key => (
                    <Button
                      key={t}
                      variant={tone === t.toLowerCase() ? "primary" : "outline-secondary"}
                      className="rounded-pill px-4"
                      onClick={() => setTone(t.toLowerCase())}
                    >
                      {t(`marketing.sms.tone_${tone_key.toLowerCase()}`)}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 rounded-pill py-3 fw-bold"
                  disabled={!prompt.trim() || generating}
                  onClick={handleGenerate}
                >
                  {generating ? <Spinner size="sm" className="me-2" /> : <Sparkles size={18} className="me-2" />}
                  {generating ? t("marketing.email.generating_content") : t("marketing.email.magic_generate")}
                </Button>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {currentStep === 4 && (
              <motion.div key="step4" {...slideVariants}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Send className="me-2 text-primary" /> {t("marketing.email.step_review")}</h4>
                  <p className="text-muted">{t("marketing.email.step_review_desc")}</p>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">{t("marketing.email.subject_label")}</Form.Label>
                  <Form.Control value={subject} onChange={(e) => setSubject(e.target.value)} className="border-2" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">{t("marketing.email.body_label")}</Form.Label>
                  <Form.Control as="textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="border-2" />
                </Form.Group>
                {(() => {
                  const imageLimit = templateChoice === "1" ? 1 : templateChoice === "2" ? 2 : templateChoice === "3" ? 5 : templateChoice === "4" ? 0 : templateChoice === "5" ? 3 : 0;
                  if (imageLimit === 0) return null;
                  return (
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">
                        <ImageIcon size={14} className="me-1" /> {t("marketing.email.images_label")}
                        <span className="text-muted ms-2">({t("marketing.email.images_limit", { count: imageLimit, unit: t(imageLimit === 1 ? "marketing.email.image_unit" : "marketing.email.images_unit") })})</span>
                      </Form.Label>
                      <Form.Control type="file" multiple onChange={handleImageUpload} className="border-2" />
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {images.map((img, i) => <img key={i} src={img.url} className="rounded" style={{ width: 60, height: 60, objectFit: 'cover' }} alt="preview" />)}
                      </div>
                    </Form.Group>
                  );
                })()}

                {/* Test Email Section */}
                <Card className="border-0 shadow-sm bg-white mb-4">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <Send size={20} className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{t("marketing.email.send_test_title")}</h6>
                        <p className="small text-muted mb-0">{t("marketing.email.send_test_desc")}</p>
                      </div>
                    </div>

                    <hr className="my-3 opacity-10" />

                    <Row className="g-3 align-items-center">
                      <Col xs={12} md={7}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">{t("marketing.email.email_label")}</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder={t("marketing.email.email_placeholder")}
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="form-control-lg fs-6 border-light-subtle"
                            style={{ backgroundColor: '#f8f9fa' }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={5} className="d-flex align-items-end">
                        <Button
                          variant="primary"
                          className="w-100 py-2 fw-bold shadow-sm"
                          onClick={handleSendTest}
                          disabled={sendingTest || !subject.trim() || !body.trim() || !testEmail.trim()}
                        >
                          {sendingTest ? (
                            <><Spinner size="sm" className="me-2" /> {t("marketing.common.sending")}</>
                          ) : (
                            t("marketing.sms.send_test_btn")
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Button
                  variant="success"
                  size="lg"
                  className="w-100 rounded-pill py-3 fw-bold shadow"
                  onClick={handleSend}
                  disabled={sending || actualCount < 1}
                >
                  {sending ? <Spinner size="sm" /> : t("marketing.email.blast_btn", { count: actualCount })}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            <Button
              variant="light"
              className="rounded-pill px-4"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1 || generating}
            >
              <ChevronLeft size={18} className="me-1" /> {t("marketing.common.back")}
            </Button>
            {currentStep < 3 && (
              <Button
                variant="primary"
                className="rounded-pill px-4"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 3}
              >
                {t("marketing.common.next")} <ChevronRight size={18} className="ms-1" />
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <div className="mt-5">
        <h5 className="fw-bold mb-4">{t("marketing.email.recent_campaigns")}</h5>
        <EmailCampaignList key={refreshKey} />
      </div>
    </div>
  );
};

export default AutomatedEmail;
