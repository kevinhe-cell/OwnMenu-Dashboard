import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Spinner } from "react-bootstrap";
import { useState } from "react";
import Swal from "sweetalert2";
import UpdateCardModal from "./UpdateCardModal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { getUserPlanThunk } from "../../../store/session";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../store/utlits";
import PlanAddon from "./PlanAddons";
import { CheckCircle } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(
  "pk_live_51N1jsSIzDtG53Sp0IYroac8Yq8aSbX7PQgISERDGaQNviBMnz4SGJ4RhjZws64QrELl0aJoWqtyYe5W3Ud6bqhmV00sR5crhK1"
);

export default function PlansSubscription() {
  const { t } = useTranslation();
  const plan = useSelector((state) => state.session.userPlan);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ single state for all API calls
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return t('plans.no_expiration');
    return new Date(dateStr).toLocaleDateString();
  };

  // -------------------
  // Handlers
  // -------------------

  const handleChangePlan = async (promoCode) => {
    const token = getToken();
    if (loading || plan?.plan_type === "pro") return;

    if (!plan?.payment_method_id) {
      const result = await Swal.fire({
        icon: "info",
        title: t('plans.swal.card_required_title'),
        text: t('plans.swal.card_required_text'),
        confirmButtonText: "OK",
      });
      if (result.isConfirmed) setShowUpdateCard(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: plan.restaurant_id,
          stripeCustomerId: plan.stripe_customer_id,
          paymentMethodId: plan.payment_method_id,
          promo_code: promoCode || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await Swal.fire(t('common.success'), t('plans.swal.sub_success_text'), "success");
        await dispatch(getUserPlanThunk());
      } else {
        throw new Error(data.message || t('common.error'));
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrialProPlan = async (promoCode) => {
    const token = getToken();
    if (loading) return;

    if (!plan?.payment_method_id) {
      const result = await Swal.fire({
        icon: "info",
        title: t('plans.swal.card_required_title'),
        text: t('plans.swal.trial_card_text'),
        confirmButtonText: "OK",
      });
      if (result.isConfirmed) setShowUpdateCard(true);
      return;
    }

    setLoading(true);
    try {
      const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      const res = await fetch("/api/stripe/start-pro-trial", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: plan.restaurant_id,
          stripe_customer_id: plan.stripe_customer_id,
          payment_method_id: plan.payment_method_id,
          trial_end: trialEnd,
          promo_code: promoCode || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await Swal.fire(t('plans.swal.trial_success_title'), t('plans.swal.trial_success_text'), "success");
        await dispatch(getUserPlanThunk());
      } else {
        throw new Error(data.message || t('common.error'));
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const token = getToken();
    if (loading) return;

    const confirm = await Swal.fire({
      title: t('plans.swal.cancel_title'),
      text: t('plans.swal.cancel_text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('plans.swal.cancel_confirm'),
      cancelButtonText: t('plans.swal.cancel_keep'),
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/cancel-pro-subscription", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurant_id: plan.restaurant_id }),
      });

      const data = await res.json();
      if (data.success) {
        await dispatch(getUserPlanThunk());
        Swal.fire(
          t('plans.swal.canceled_title'),
          t('plans.active_until', {
            date: new Date(
              plan?.subscriptions?.pro?.current_period_end || plan.plan_expiration_date
            ).toLocaleDateString()
          }),
          "info"
        );
      } else {
        Swal.fire(t('common.error'), data.message || t('common.error'), "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivatePlan = async () => {
    const token = getToken();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/reactivate-pro-subscription", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: plan.restaurant_id,
          subscription_id: plan.stripe_subscription_id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await Swal.fire(t('plans.swal.reactivated_title'), t('plans.swal.reactivated_text'), "success");
        await dispatch(getUserPlanThunk());
      } else {
        throw new Error(data.message || t('common.error'));
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = async () => {
    const token = getToken();
    if (loading) return;

    if (plan?.plan_type !== "free") {
      return Swal.fire(
        t('common.error'),
        t('plans.swal.downgrade_first'),
        "error"
      );
    }

    const confirmed = await Swal.fire({
      icon: "warning",
      title: t('plans.swal.remove_card_title'),
      text: t('plans.swal.remove_card_text'),
      showCancelButton: true,
      confirmButtonText: t('plans.swal.remove_confirm'),
    });
    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/remove-card", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: plan.payment_method_id,
          restaurantId: plan.restaurant_id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await dispatch(getUserPlanThunk());
        Swal.fire(t('plans.swal.card_removed_title'), data.message || t('plans.swal.card_removed_text'), "success");
      } else {
        throw new Error(data.message || "Failed to remove card.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------
  // Render
  // -------------------

  const plans = [
    { key: "pro", title: t('plans.pro.title'), badge: t('plans.recommended'), price: "$299/month", description: t('plans.pro.desc'), features: t('plans.pro.features', { returnObjects: true }) },
    { key: "custom", title: t('plans.custom.title'), badge: t('plans.contact_us'), price: t('plans.custom_pricing'), description: t('plans.custom.desc'), features: t('plans.custom.features', { returnObjects: true }) },
  ];

  return (
    <div className="container mt-4">
      {/* Current Plan */}
      <Card className="mb-4 shadow border-0 rounded-4">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">{t('plans.current_plan', { type: plan?.plan_type?.toUpperCase() || "N/A" })}</h5>
          <span className="text-muted small">
            {plan?.plan_type === "free"
              ? "0/month"
              : plan?.plan_type === "pro"
              ? `$${plan?.current_plan_price || 299}/month`
              : t('plans.custom_pricing')}
          </span>
        </Card.Header>
        <Card.Body className="px-4 py-4">
          <Row>
            <Col md={6}><div className="d-flex justify-content-between"><span className="text-muted">{t('plans.start_date')}</span><strong>{formatDate(plan?.plan_start_date)}</strong></div></Col>
            <Col md={6}><div className="d-flex justify-content-between"><span className="text-muted">{t('plans.expiration')}</span><strong>{plan?.plan_type === "free" ? t('plans.no_expiration') : formatDate(plan?.plan_expiration_date)}</strong></div></Col>
          </Row>
        </Card.Body>
      </Card>
      {/* Payment Method Section */}
      {plan?.paymentMethod_card && (
        <Card className="mb-5 shadow-sm border-0 rounded-4">
          <Card.Header className="bg-white fw-bold">{t('plans.payment_method')}</Card.Header>
          <Card.Body className="p-4">
            <Row className="align-items-center mb-3">
              <Col md={6} className="d-flex align-items-center gap-3">
                <img
                  src={
                    plan.paymentMethod_card.brand === "visa"
                      ? "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                      : plan.paymentMethod_card.brand === "mastercard"
                      ? "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                      : "https://cdn-icons-png.flaticon.com/512/633/633611.png"
                  }
                  alt="Card Brand"
                  style={{ width: 50, height: 32, objectFit: "contain" }}
                />
                <div>
                  <div className="text-muted small">{t('plans.card')}</div>
                  <strong>
                    {`${plan.paymentMethod_card.brand?.toUpperCase()} •••• ${plan.paymentMethod_card.last4}`}
                  </strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-muted small">{t('plans.expiration')}</div>
                <strong>{`${plan.paymentMethod_card.exp_month}/${plan.paymentMethod_card.exp_year}`}</strong>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={handleRemoveCard}
                >
                  {t('plans.remove_card')}
                </Button>
              </Col>
              <Col md={6}>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => setShowUpdateCard(true)}
                >
                  {t('plans.update_card')}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      {/* Plan Comparison */}
      <h4 className="fw-bold text-center mb-4">{t('plans.title')}</h4>
      <Row className="g-4">
        {plans.map((p) => {
          const currentPlanKey = plan?.plan_type;
          return (
            <Col md={6} key={p.key}>
              <Card className={`h-100 border-0 shadow-sm rounded-4`} style={{ border: p.key === currentPlanKey ? "2px solid #198754" : "1px solid #dee2e6", transform: p.key === currentPlanKey ? "scale(1.02)" : "scale(1)", transition: "all 0.3s ease" }}>
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{p.title}</h5>
                    {p.badge && <span className="badge bg-warning text-dark">{p.badge}</span>}
                  </div>
                  <h6 className="fw-semibold text-success mb-2">{p.price}</h6>
                  <p className="small text-secondary">{p.description}</p>
                  <ul className="list-unstyled small mb-4">
                    {p.features.map((f, i) => (
                      <li key={i} className="d-flex align-items-start mb-2">
                        <CheckCircle size={16} className="text-success me-2" /> {f}
                      </li>
                    ))}
                  </ul>
                  {p.key === "pro" && (
                    plan?.subscriptions?.pro?.cancel_at_period_end && (
                      <div className="mt-3 text-warning small">
                        {t('plans.canceled_notice', {
                          date: new Date(plan.subscriptions.pro.current_period_end).toLocaleDateString()
                        })}
                      </div>
                    )
                  )}

                  <div className="mt-auto">
                    {p.key === currentPlanKey ? (
                      <div className="d-flex flex-column gap-2">
                        <Button variant="outline-secondary" disabled className="w-100">{t('plans.current_plan', { type: "" }).replace(":", "")}</Button>
                        {plan?.plan_type === "pro" && (
                          plan?.subscriptions?.pro?.cancel_at_period_end ? (
                            <Button variant="outline-success" className="w-100" disabled={loading} onClick={handleReactivatePlan}>
                              {loading ? <Spinner size="sm" animation="border" /> : t('plans.reactivate')}
                            </Button>
                          ) : (
                            <Button variant="outline-danger" className="w-100" disabled={loading} onClick={handleCancelSubscription}>
                              {loading ? <Spinner size="sm" animation="border" /> : t('plans.cancel_sub')}
                            </Button>
                          )
                        )}
                      </div>
                    ) : p.key === "custom" ? (
                      <Button variant="outline-primary" className="w-100" onClick={() => navigate("/account")}>{t('plans.contact_us')}</Button>
                    ) : (
                      <>
                        {p.key === "pro" && !plan?.trials_used?.pro && (
                           <Button variant="info" className="w-100 mb-2" disabled={loading} onClick={async () => {
                            let promoCode = null;
                            const { isConfirmed } = await Swal.fire({ title: t('plans.swal.promo_title'), showDenyButton: true, confirmButtonText: t('plans.swal.promo_yes'), denyButtonText: t('plans.swal.promo_no') });
                            if (isConfirmed) {
                              const { value: promoInput } = await Swal.fire({ title: t('plans.swal.promo_input_title'), input: "text", inputPlaceholder: t('plans.swal.promo_placeholder'), inputAttributes: { style: "text-transform:uppercase;" }, showCancelButton: true, confirmButtonText: t('plans.swal.promo_apply') });
                              promoCode = promoInput ? promoInput.toUpperCase() : null;
                            }
                            await handleStartTrialProPlan(promoCode);
                          }}>
                            {loading ? <Spinner size="sm" animation="border" /> : t('plans.start_trial')}
                          </Button>
                        )}
                         <Button variant="success" className="w-100" disabled={loading} onClick={async () => {
                          let promoCode = null;
                          const { isConfirmed } = await Swal.fire({ title: t('plans.swal.promo_title'), showDenyButton: true, confirmButtonText: t('plans.swal.promo_yes'), denyButtonText: t('plans.swal.promo_no') });
                          if (isConfirmed) {
                            const { value: promoInput } = await Swal.fire({ title: t('plans.swal.promo_input_title'), input: "text", inputPlaceholder: t('plans.swal.promo_placeholder'), inputAttributes: { style: "text-transform:uppercase;" }, showCancelButton: true, confirmButtonText: t('plans.swal.promo_apply') });
                            promoCode = promoInput ? promoInput.toUpperCase() : null;
                          }
                          await handleChangePlan(promoCode);
                        }}>
                          {loading ? <Spinner size="sm" animation="border" /> : t('plans.upgrade_to', { title: p.title })}
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <hr className="my-5" />
      <PlanAddon />

      <Elements stripe={stripePromise}>
        <UpdateCardModal show={showUpdateCard} handleClose={() => setShowUpdateCard(false)} customerId={plan?.stripe_customer_id} />
      </Elements>
    </div>
  );
}
