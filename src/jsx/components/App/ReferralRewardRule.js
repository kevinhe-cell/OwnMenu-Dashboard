import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { getToken } from "../../../store/utlits";
import { Gift, Users } from "lucide-react";

export default function ReferralRewardRule() {
  const restaurantId = useSelector((state) => state.session.user?.restaurant_id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [couponDiscountType, setCouponDiscountType] = useState("Amount");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponExpiryDays, setCouponExpiryDays] = useState(30);
  const [stats, setStats] = useState({ stats: [] });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    const token = getToken();
    fetch(`/api/referral/settings/${restaurantId}`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setEnabled(!!data.enabled);
        setCouponDiscountType(data.coupon_discount_type || "Amount");
        setCouponDiscount(data.coupon_discount != null ? String(data.coupon_discount) : "");
        setCouponExpiryDays(data.coupon_expiry_days != null ? data.coupon_expiry_days : 30);
      })
      .catch(() => toast.error("Could not load referral settings."))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    setStatsLoading(true);
    const token = getToken();
    fetch(`/api/referral/stats/${restaurantId}`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { stats: [] }))
      .then((data) => setStats(data || { stats: [] }))
      .catch(() => setStats({ stats: [] }))
      .finally(() => setStatsLoading(false));
  }, [restaurantId]);

  const handleSave = async () => {
    const discount = couponDiscountType === "Percentage" ? parseFloat(couponDiscount) : parseFloat(couponDiscount);
    if (isNaN(discount) || discount <= 0) {
      toast.error("Please enter a valid discount (e.g. 5 for $5 off or 10 for 10% off).");
      return;
    }
    if (couponDiscountType === "Percentage" && discount > 100) {
      toast.error("Percentage cannot exceed 100.");
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      const res = await fetch(`/api/referral/settings/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled,
          coupon_discount: discount,
          coupon_discount_type: couponDiscountType,
          coupon_expiry_days: couponExpiryDays,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save");
      }
      toast.success("Referral reward rule saved.");
    } catch (err) {
      toast.error(err.message || "Could not save referral settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-muted">Loading referral settings…</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "#111827" }}>
          Referral Reward Rule
        </h2>
        <p className="text-muted mb-0 small">
          One rule per restaurant: when a customer uses a referrer’s link or code and places their first order, the referrer receives a coupon. You can set a fixed amount or percentage off. Referral coupons are created automatically and cannot be deleted.
        </p>
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: "12px", maxWidth: 520 }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{ width: 48, height: 48, background: "#fef3c7" }}
            >
              <Gift size={24} style={{ color: "#d97706" }} />
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">Reward type: Coupon only</h5>
              <span className="small text-muted">Choose fixed amount or percentage off</span>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="referral-enabled"
              label="Enable referral program"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Discount type</Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="discount-amount"
                name="discountType"
                label="Fixed amount ($)"
                checked={couponDiscountType === "Amount"}
                onChange={() => setCouponDiscountType("Amount")}
              />
              <Form.Check
                type="radio"
                id="discount-percent"
                name="discountType"
                label="Percentage (%)"
                checked={couponDiscountType === "Percentage"}
                onChange={() => setCouponDiscountType("Percentage")}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              {couponDiscountType === "Amount" ? "Amount off ($)" : "Percentage off (%)"}
            </Form.Label>
            <Form.Control
              type="number"
              min={couponDiscountType === "Percentage" ? 1 : 0.01}
              max={couponDiscountType === "Percentage" ? 100 : undefined}
              step={couponDiscountType === "Percentage" ? 1 : 0.01}
              value={couponDiscount}
              onChange={(e) => setCouponDiscount(e.target.value)}
              placeholder={couponDiscountType === "Amount" ? "e.g. 5" : "e.g. 10"}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Coupon expiry (days)</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={couponExpiryDays}
              onChange={(e) => setCouponExpiryDays(parseInt(e.target.value, 10) || 30)}
            />
            <Form.Text className="text-muted">Referral reward coupons expire after this many days.</Form.Text>
          </Form.Group>

          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#dd2f6e",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.25rem",
            }}
          >
            {saving ? "Saving…" : "Save rule"}
          </Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mt-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{ width: 48, height: 48, background: "#e0e7ff" }}
            >
              <Users size={24} style={{ color: "#dd2f6e" }} />
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">Referral status</h5>
              <span className="small text-muted">Orders placed with a referral code and who earned a coupon</span>
            </div>
          </div>
          {statsLoading ? (
            <p className="text-muted mb-0">Loading…</p>
          ) : !stats.stats || stats.stats.length === 0 ? (
            <p className="text-muted mb-0">No referral activity yet. When customers place orders using someone’s referral code, they’ll appear here.</p>
          ) : (
            <div className="table-responsive">
              <Table bordered size="sm" className="mb-0">
                <thead style={{ backgroundColor: "#f8fafc" }}>
                  <tr>
                    <th>Referrer (phone)</th>
                    <th>Referred customer (phone)</th>
                    <th>Order ID</th>
                    <th>Reward</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.stats.flatMap((s) =>
                    (s.rewards || []).map((r, i) => (
                      <tr key={`${s.referrer_phone}-${r.order_id}-${i}`}>
                        <td>{s.referrer_phone}</td>
                        <td>{r.referred_phone}</td>
                        <td>{r.order_id ?? "—"}</td>
                        <td>{r.reward_type === "coupon" && r.coupon_id ? `Coupon ${r.coupon_id}` : r.reward_type || "—"}</td>
                        <td>{r.createdAt ? new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
