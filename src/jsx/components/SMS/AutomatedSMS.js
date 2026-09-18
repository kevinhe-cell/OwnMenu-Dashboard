import React, { useState, useEffect } from "react";
import { Button, Card, Form, Row, Col, Spinner, Alert, Badge, ProgressBar, Dropdown, ButtonGroup } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Users, MessageSquare, Send, ChevronRight,
  ChevronLeft, CheckCircle, Zap, Coins, Smartphone, Plus
} from "lucide-react";
import Lottie from "lottie-react";
import smsLottie from "../../../json/sms22.json";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getToken } from "../../../store/utlits";
import { getUserPlanThunk } from "../../../store/session";
import SmsCampaignList from "./SmsCampaignList";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const MAX_CHAR = 240;

const PRESET_PROMPTS = {
  promotion:
    "Run a limited-time promotion SMS encouraging customers to order soon with a clear offer.",
  holiday:
    "Send a warm holiday greeting SMS with a special seasonal offer for our customers.",
  new_item:
    "Announce a new menu item to our customers and invite them to try it.",
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

const AutomatedSMS = () => {
  const { t } = useTranslation();
  const plan = useSelector((state) => state.session.userPlan);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const presetFromUrl = searchParams.get("preset");
  const promptFromUrl = searchParams.get("prompt");
  const initialPrompt =
    (promptFromUrl && promptFromUrl.trim()) ||
    PRESET_PROMPTS[presetFromUrl] ||
    "";

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(initialPrompt ? 3 : 1);

  // Core Logic State
  const [blastType, setBlastType] = useState("all");
  const [customCustomerCount, setCustomCustomerCount] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [audience, setAudience] = useState("all");
  const [totalRewardUsers, setTotalRewardUsers] = useState(0);
  const [tagCounts, setTagCounts] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenBreakdown, setTokenBreakdown] = useState({
    monthly: 0,
    buy: 0,
    ownmenu: 0,
  });

  const [prompt, setPrompt] = useState(initialPrompt);
  const [tone, setTone] = useState("friendly");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/marketing/sms/overview", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setTotalRewardUsers(data.totalRewardUsers || 0);
        setTagCounts(data.tagCounts || {});
        setTokenBalance(data.sms_tokens_left || 0);
        setTokenBreakdown({
          monthly: data.sms_tokens_monthly || 0,
          buy: data.sms_tokens_buy || 0,
          ownmenu: data.sms_tokens_ownmenu || 0,
        });
      } catch (err) {
        console.error("Failed to fetch SMS overview", err);
      }
    };
    fetchOverview();
    dispatch(getUserPlanThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!presetFromUrl && !promptFromUrl) return;
    // Clear one-shot query params after applying so refresh doesn't re-jump steps
    setSearchParams({}, { replace: true });
  }, [presetFromUrl, promptFromUrl, setSearchParams]);

  const handlePurchase = async (packageId) => {
    try {
      const res = await fetch(`/api/stripe/create-payment-link/buy-sms-token/${packageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_purchase"), "error");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/sms/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ promo: prompt, tone, audienceGroup: audience }),
      });
      const data = await res.json();
      setMessage(data.message || "");
      setCurrentStep(4);
    } catch (err) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_generate"), "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendTest = async () => {
    if (!message.trim() || !testPhone.trim()) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_test_fields"), "error");
      return;
    }

    // Validate phone number format (10 digits)
    const cleanedPhone = testPhone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_test_phone"), "error");
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch("/api/marketing/sms/test-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          message,
          test_phone: cleanedPhone
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire(t("marketing.sms.swal.test_sent"), t("marketing.sms.swal.test_sent_msg", { phone: testPhone }), "success");
      } else {
        Swal.fire(t("common.error"), data.error || t("marketing.sms.swal.err_test_send"), "error");
      }
    } catch (err) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_test_send"), "error");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || actualCount < 1) return;
    if (actualCount > tokenBalance) {
      Swal.fire(t("marketing.sms.swal.insufficient_tokens"), t("marketing.sms.swal.insufficient_tokens_msg"), "error");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/marketing/sms-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          message,
          recipient_type: audience,
          count_sent: actualCount,
          sort_order: blastType === "custom" ? sortOrder : "newest"
        }),
      });

      if (res.ok) {
        Swal.fire(t("common.success"), t("marketing.sms.swal.sent_msg"), "success");
        setRefreshKey(Date.now());
        setTokenBalance(prev => prev - actualCount);
        setCurrentStep(1);
        setMessage("");
        setPrompt("");
        setTestPhone("");
        setBlastType("all");
        setCustomCustomerCount("");
        setSortOrder("newest");
      }
    } catch (err) {
      Swal.fire(t("common.error"), t("marketing.sms.swal.err_send"), "error");
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

  if (!plan?.marketing_enabled) {
    return (
      <Card className="border-0 shadow-sm text-center p-5 rounded-4 bg-white">
        <Lottie animationData={smsLottie} style={{ width: 250, margin: "0 auto" }} />
        <h3 className="fw-bold mt-4">{t("marketing.sms.title")}</h3>
        <p className="text-muted">{t("marketing.sms.desc")}</p>
        <Button variant="primary" size="lg" className="rounded-pill px-5" onClick={() => navigate("/plans")}>
          {t("marketing.sms.upgrade_btn")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="container-fluid py-2" style={{ maxWidth: "1100px" }}>

      {/* Header & Stepper */}
      <div className="text-center mb-5">
        <div className="d-flex justify-content-center align-items-center mb-2">
          <Badge bg="primary" className="px-3 py-2 rounded-pill shadow-sm me-2">
            <Sparkles size={14} className="me-1" /> SMS AI
          </Badge>

          <Dropdown as={ButtonGroup}>
            <Badge bg="light" className="text-dark border px-3 py-2 rounded-pill shadow-sm d-flex align-items-center">
              <Coins size={14} className="me-1 text-primary" />
              <span className="me-2">{tokenBalance.toLocaleString()} {t("marketing.common.tokens")}</span>
              <span className="me-2 small text-muted d-none d-md-inline">
                ({tokenBreakdown.monthly.toLocaleString()} / {tokenBreakdown.buy.toLocaleString()} /{" "}
                {tokenBreakdown.ownmenu.toLocaleString()})
              </span>
              <Dropdown.Toggle split variant="light" className="p-0 border-0 bg-transparent text-primary">
                <Plus size={14} />
              </Dropdown.Toggle>
            </Badge>
            <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
              <Dropdown.Header className="small fw-bold text-uppercase">{t("marketing.common.recharge")}</Dropdown.Header>
              <Dropdown.Item onClick={() => handlePurchase("1")}>1,000 Tokens — $40</Dropdown.Item>
              <Dropdown.Item onClick={() => handlePurchase("2")}>2,000 Tokens — $80</Dropdown.Item>
              <Dropdown.Item onClick={() => handlePurchase("3")}>3,000 Tokens — $120</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <h2 className="fw-bold">{t("marketing.sms.new_campaign")}</h2>

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

            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Users className="me-2 text-primary" /> {t("marketing.sms.step_target")}</h4>
                  <p className="text-muted">{t("marketing.sms.step_target_desc")}</p>
                </div>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t("marketing.sms.segment_group")}</Form.Label>
                  <Form.Select className="form-control-lg border-2" value={audience} onChange={(e) => setAudience(e.target.value)}>
                    <option value="all">{t("marketing.sms.all_reward_users")} ({totalRewardUsers})</option>
                    {Object.keys(TAG_CONFIG).map(t_key => <option key={t_key} value={t_key}>{t(`marketing.segments.${t_key}`)} ({tagCounts[t_key] || 0})</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-uppercase">{t("marketing.sms.blast_volume")}</Form.Label>
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
                <Alert variant="primary" className="border-0 rounded-3 d-flex align-items-center bg-primary bg-opacity-10 text-primary">
                  <Zap size={20} className="me-2" />
                  <span>{t("marketing.sms.targeting_note", { count: actualCount })}</span>
                </Alert>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Smartphone className="me-2 text-primary" /> {t("marketing.sms.step_tone")}</h4>
                  <p className="text-muted">{t("marketing.sms.step_tone_desc")}</p>
                </div>
                <Row className="g-3">
                  {['Friendly', 'Professional', 'Urgent'].map(tone_key => (
                    <Col xs={4} key={t}>
                      <Card
                        onClick={() => setTone(tone_key.toLowerCase())}
                        className={`p-3 text-center transition-all border-2 ${tone === tone_key.toLowerCase() ? 'border-primary bg-primary bg-opacity-10' : 'bg-light border-transparent'}`}
                        style={{ cursor: "pointer" }}
                      >
                        <h6 className="fw-bold mb-0">{t(`marketing.sms.tone_${tone_key.toLowerCase()}`)}</h6>
                        {tone === tone_key.toLowerCase() && <CheckCircle size={16} className="mt-2 text-primary mx-auto" />}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Sparkles className="me-2 text-primary" /> {t("marketing.sms.step_ai")}</h4>
                  <p className="text-muted">{t("marketing.sms.step_ai_desc")}</p>
                </div>
                <Form.Control as="textarea" rows={4} className="border-2 p-3 mb-4" placeholder={t("marketing.sms.ai_placeholder")} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                <Button variant="primary" size="lg" className="w-100 rounded-pill py-3 fw-bold" disabled={!prompt.trim() || generating} onClick={handleGenerate}>
                  {generating ? <Spinner size="sm" /> : t("marketing.sms.magic_generate")}
                </Button>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4">
                  <h4 className="fw-bold"><Send className="me-2 text-primary" /> {t("marketing.sms.step_review")}</h4>
                  <p className="text-muted">{t("marketing.sms.step_review_desc")}</p>
                </div>
                <Form.Control as="textarea" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="border-2 p-3" maxLength={MAX_CHAR} />
                <div className="d-flex justify-content-between mt-2 mb-3">
                  <small className="text-muted">{t("marketing.sms.max_chars", { count: MAX_CHAR })}</small>
                  <small className="text-primary fw-bold">{message.length} / {MAX_CHAR}</small>
                </div>

                {/* Test SMS Section */}
                <Card className="border-0 shadow-sm bg-white mb-4">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <Smartphone size={20} className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{t("marketing.sms.send_test_title")}</h6>
                        <p className="small text-muted mb-0">{t("marketing.sms.send_test_desc")}</p>
                      </div>
                    </div>

                    <hr className="my-3 opacity-10" />

                    <Row className="g-3 align-items-center">
                      <Col xs={12} md={7}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">{t("marketing.sms.phone_label")}</Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder={t("marketing.sms.phone_placeholder")}
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="form-control-lg fs-6 border-light-subtle"
                            style={{ backgroundColor: '#f8f9fa' }}
                            maxLength={10}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={5} className="d-flex align-items-end">
                        <Button
                          variant="primary"
                          className="w-100 py-2 fw-bold shadow-sm"
                          onClick={handleSendTest}
                          disabled={sendingTest || !message.trim() || !testPhone.trim() || testPhone.length !== 10}
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

                <Button variant="success" size="lg" className="w-100 rounded-pill py-3 fw-bold shadow" onClick={handleSend} disabled={sending || message.length === 0}>
                  {sending ? <Spinner size="sm" /> : t("marketing.sms.blast_btn", { count: actualCount })}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}>{t("marketing.common.back")}</Button>
            {currentStep < 3 && <Button variant="primary" className="rounded-pill px-4" onClick={() => setCurrentStep(s => s + 1)}>{t("marketing.common.next")}</Button>}
          </div>
        </Card.Body>
      </Card>

      <div className="mt-5">
        <h5 className="fw-bold mb-4">{t("marketing.sms.recent_campaigns")}</h5>
        <SmsCampaignList refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default AutomatedSMS;
