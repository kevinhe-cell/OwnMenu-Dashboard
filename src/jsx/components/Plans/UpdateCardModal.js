import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { getUserPlanThunk } from "../../../store/session";
import swal from "sweetalert";
import { getToken } from "../../../store/utlits";
import { useTranslation } from "react-i18next";

export default function UpdateCardModal({
  show,
  handleClose,
  customerId,
  showTrialMessage = false,
  onCardSuccess = () => {},
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);

  const handleUpdateCard = async (e) => {
    const token = getToken();
    e.preventDefault(); // ⛔️ Stop default submission

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/stripe/update-payment-method", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId: paymentMethod.id,
        email: user.phone,
        restaurantId: user.restaurant_id,
      }),
    });

    const data = await res.json();
    if (data.success) {
      const res = await dispatch(getUserPlanThunk());
      const updatedPlan = res; // ✅ Correct way to access updated plan from thunk

      onCardSuccess(updatedPlan);

      handleClose();
    } else {
      setError(data.message || t('common.error'));
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('plans.modal.title')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleUpdateCard}>
        {showTrialMessage && (
          <small className="text-muted d-block mt-2 text-center">
            {t('plans.modal.trial_notice')}
          </small>
        )}

        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('plans.modal.label')}</Form.Label>
            <div className="p-2 border rounded bg-light">
              <CardElement
                options={{ style: { base: { fontSize: "16px" } } }}
              />
            </div>
          </Form.Group>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t('plans.modal.updating') : t('plans.modal.update_btn')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
