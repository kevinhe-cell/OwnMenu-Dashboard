import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { getToken } from "../../../store/utlits";

/**
 * Stripe Connect: edit the two customer-facing display names on the
 * connected account.
 *
 *   1. Business name — what shows up in the customer-facing mandate text
 *      ("By providing your card information, you allow {NAME} to charge..."),
 *      Stripe Checkout headers, etc. Stripe field: business_profile.name
 *
 *   2. Card statement DBA — what shows up on the cardholder's credit card
 *      statement next to the charge. Stripe field:
 *   - settings.payments.statement_descriptor (5–22 chars).
 */
function StripeBusinessProfile() {
  const plan = useSelector((state) => state.session.userPlan);
  const [businessName, setBusinessName] = useState("");
  const [cardDescriptor, setCardDescriptor] = useState("");
  const [paymentsFallback, setPaymentsFallback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    setSuccess("");
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/business-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to load");
      }
      setBusinessName(data.business_profile_name || "");
      setCardDescriptor(data.card_statement_descriptor || "");
      setPaymentsFallback(data.payments_statement_descriptor || "");
    } catch (e) {
      setError(e.message || "Failed to load business profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (plan?.stripe_onboarded) {
      load();
    } else {
      setLoading(false);
    }
  }, [plan?.stripe_onboarded, load]);

  const save = async () => {
    setError("");
    setSuccess("");
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/stripe/connect/business-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_profile_name: businessName,
          card_statement_descriptor: cardDescriptor,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || "Save failed");
      }
      setBusinessName(data.business_profile_name || "");
      setCardDescriptor(data.card_statement_descriptor || "");
      setPaymentsFallback(data.payments_statement_descriptor || "");
      setSuccess("Saved.");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!plan?.stripe_onboarded) {
    return null;
  }

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body>
        <Card.Title className="h5 mb-2">Business name &amp; card statement</Card.Title>
        <Card.Subtitle className="text-muted small mb-3">
          Controls what your customers see during checkout and on their credit
          card statement.
        </Card.Subtitle>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {loading ? (
          <div className="py-3 text-center">
            <Spinner animation="border" size="sm" variant="primary" />
          </div>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">
                Business name (shown to customers)
              </Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Hutao Sushi"
              />
              <Form.Text muted>
                Replaces the name customers see in the checkout mandate
                (&quot;By providing your card information, you allow{" "}
                <em>{businessName || "[BUSINESS NAME]"}</em> to charge your
                card...&quot;) and other Stripe customer-facing UI.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">
                Card statement DBA
              </Form.Label>
              <Form.Control
                type="text"
                maxLength={22}
                value={cardDescriptor}
                onChange={(e) => setCardDescriptor(e.target.value.toUpperCase())}
                placeholder="e.g. HUTAO SUSHI"
              />
              <Form.Text muted>
                {cardDescriptor.length}/22 characters. This is the short name
                that appears on the cardholder&apos;s credit card statement.
                Stripe requires 5–22 characters; uppercase letters, numbers and
                spaces work best.
                {paymentsFallback &&
                  !cardDescriptor &&
                  ` Stripe currently has: "${paymentsFallback}" under payments settings.`}
              </Form.Text>
            </Form.Group>

            <div className="d-flex flex-wrap gap-2">
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={load}
                disabled={saving || loading}
              >
                Reload
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default StripeBusinessProfile;
