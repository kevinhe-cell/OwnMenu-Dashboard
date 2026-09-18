import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { Elements } from "@stripe/react-stripe-js";
import UpdateCardModal from "./UpdateCardModal";
import { loadStripe } from "@stripe/stripe-js";
import { getUserPlanThunk } from "../../../store/session";
import { motion } from "framer-motion";
import { getToken } from "../../../store/utlits";
import { CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(
  "pk_live_51N1jsSIzDtG53Sp0IYroac8Yq8aSbX7PQgISERDGaQNviBMnz4SGJ4RhjZws64QrELl0aJoWqtyYe5W3Ud6bqhmV00sR5crhK1"
);

export default function PlanAddon() {
  const { t } = useTranslation();
  const plan = useSelector((state) => state.session.userPlan);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const toggleMarketingAddon = async (promoCodeInput) => {
    const token = getToken();
    if (!plan?.payment_method_id) return setShowUpdateCard(true);

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/toggle-marketing-addon", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: plan.restaurant_id,
          stripe_customer_id: plan.stripe_customer_id,
          payment_method_id: plan.payment_method_id,
          current_status: plan?.subscriptions?.marketing?.status === "active",
          promo_code: promoCodeInput || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await dispatch(getUserPlanThunk());
        Swal.fire(t('common.success'), data.message, "success");
      } else {
        Swal.fire(t('common.error'), data.message || t('common.error'), "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire(t('common.error'), t('common.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  const marketingSub = plan?.subscriptions?.marketing;
  console.group(marketingSub)
  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="fw-bold text-center mb-2">{t('plans.addons.marketing_title')}</h2>
        <p
          className="text-center text-muted mb-5"
          style={{ fontSize: "16px" }}
        >
          {t('plans.addons.marketing_desc')}
        </p>

        <div
          className="card border-0 shadow-sm p-4"
          style={{ borderRadius: "12px" }}
        >
          <div className="text-center mb-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3037/3037366.png"
              alt="Marketing"
              style={{ width: "80px", height: "80px", objectFit: "contain" }}
            />
          </div>
          <h4 className="text-center fw-bold mb-2">{t('plans.addons.ai_marketing_title')}</h4>
          <h6 className="text-muted text-center mb-3">$149/month</h6>

          <ul className="list-unstyled small ps-2" style={{ fontSize: "14px" }}>
            {t('plans.addons.features', { returnObjects: true }).map((f, i) => (
              <li key={i} className="d-flex align-items-start mb-1">
                <CheckCircle size={16} className="text-success me-2" /> {f}
              </li>
            ))}
          </ul>

          <div className="text-center mt-4">
            {marketingSub?.status === "active" ? (
              <>
                {marketingSub.cancel_at_period_end ? (
                  <div className="text-warning small mb-2">
                    {t('plans.canceled_notice', {
                      date: new Date(marketingSub.current_period_end).toLocaleDateString()
                    })}
                  </div>
                ) : (
                  <div className="text-success small mb-2">
                    {t('plans.renews_on', {
                      date: new Date(marketingSub.current_period_end).toLocaleDateString()
                    })}
                  </div>
                )}

                <Button
                  variant={
                    marketingSub.cancel_at_period_end
                      ? "outline-success"
                      : "outline-danger"
                  }
                  onClick={async () => {
                    if (loading) return;
                    setLoading(true);

                    if (marketingSub.cancel_at_period_end) {
                      await toggleMarketingAddon(); // re-activate
                    } else {
                      const result = await Swal.fire({
                        title: t('plans.addons.swal.cancel_title'),
                        text: t('plans.addons.swal.cancel_text'),
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: t('plans.swal.cancel_confirm'),
                        cancelButtonText: t('plans.swal.cancel_keep'),
                        reverseButtons: true,
                      });
                      if (result.isConfirmed) await toggleMarketingAddon();
                    }

                    setLoading(false);
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />{" "}
                      {t('plans.processing')}
                    </>
                  ) : marketingSub.cancel_at_period_end ? (
                    t('plans.addons.reactivate')
                  ) : (
                    t('plans.addons.cancel')
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline-success"
                onClick={async () => {
                  if (loading) return;
                  setLoading(true);

                  if (!plan?.payment_method_id) {
                    setShowUpdateCard(true);
                    setLoading(false);
                    return;
                  }

                  let promoCode = null;
                  const { isConfirmed } = await Swal.fire({
                    title: t('plans.swal.promo_title'),
                    showDenyButton: true,
                    confirmButtonText: t('plans.swal.promo_yes'),
                    denyButtonText: t('plans.swal.promo_no'),
                  });

                  if (isConfirmed) {
                    const { value: promoInput } = await Swal.fire({
                      title: t('plans.swal.promo_input_title'),
                      input: "text",
                      inputPlaceholder: t('plans.swal.promo_placeholder'),
                      inputAttributes: { style: "text-transform:uppercase;" },
                      showCancelButton: true,
                      confirmButtonText: t('plans.swal.promo_apply'),
                    });
                    promoCode = promoInput ? promoInput.toUpperCase() : null;
                  }

                  await toggleMarketingAddon(promoCode);
                  setLoading(false);
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />{" "}
                    {t('plans.activating')}
                  </>
                ) : (
                  t('plans.addons.activate')
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Update Card Modal */}
        <Elements stripe={stripePromise}>
          <UpdateCardModal
            show={showUpdateCard}
            handleClose={() => setShowUpdateCard(false)}
            customerId={plan?.stripe_customer_id}
            onCardSuccess={async () => await toggleMarketingAddon()}
          />
        </Elements>
      </motion.div>
    </div>
  );
}
