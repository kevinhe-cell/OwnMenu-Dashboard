import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  createCouponThunk,
  deleteCouponThunk,
  getAllCouponsThunk,
} from "../../../store/coupons";
import { Button, Modal, Form, Card, Table } from "react-bootstrap";
import swal from "sweetalert";
import { Tag, Plus, Filter, TrendingUp } from "lucide-react";

const PAGE_SIZE = 30;

export default function CouponsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { coupons, total, page, limit, loading } = useSelector((state) => state.coupons);
  const [createModal, setCreateModal] = useState(false);
  const [inputType, setInputType] = useState("Percentage");
  const [value, setValue] = useState("");
  const [expiration, setExpiration] = useState("1day");
  const [use_limit, setUseLimit] = useState(null);
  const [min_require, setMinRequire] = useState(0);
  const [limit_one, setLimitOne] = useState(false);
  const [ftCustomer, setFtCustomer] = useState(false);
  const [visibleOnline, setVisibleOnline] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [randomCode, setRandomCode] = useState(true);
  const [customCode, setCustomCode] = useState(false);
  const [customCodeValue, setCustomCodeValue] = useState("");
  const [couponSort, setCouponSort] = useState({ sort: "createdAt", order: "desc" });
  const [couponSourceFilter, setCouponSourceFilter] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / (limit || PAGE_SIZE)));

  useEffect(() => {
    dispatch(getAllCouponsThunk({
      sort: couponSort.sort,
      order: couponSort.order,
      source: couponSourceFilter || undefined,
      page: 1,
      limit: PAGE_SIZE,
    }));
  }, [dispatch, couponSort.sort, couponSort.order, couponSourceFilter]);

  const fetchPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(getAllCouponsThunk({
      sort: couponSort.sort,
      order: couponSort.order,
      source: couponSourceFilter || undefined,
      page: newPage,
      limit: PAGE_SIZE,
    }));
  };

  const handleCreateCoupon = async () => {
    if (customCode && !customCodeValue.trim()) {
      swal({ title: t("coupons_page.err_cannot_delete"), text: t("coupons_page.err_custom_code"), icon: "error", button: t("common.ok") });
      return;
    }
    setCreateModal(false);
    const result = await dispatch(
      createCouponThunk({
        discount: value,
        discount_type: inputType,
        expiration,
        use_limit,
        min_require,
        limit_one,
        ft_customer: ftCustomer,
        visible_online: visibleOnline,
        max_discount: (() => {
          if (maxDiscount === "" || maxDiscount == null) return null;
          const n = Number(maxDiscount);
          return Number.isFinite(n) && n > 0 ? n : null;
        })(),
        custom_code: customCode ? customCodeValue.trim().toUpperCase() : null,
        random_code: randomCode,
      })
    );
    if (result?.error) {
      swal({ title: t("coupons_page.err_cannot_delete"), text: result.error, icon: "error", button: t("common.ok") });
      return;
    }
    setInputType("Percentage");
    setValue("");
    setExpiration("1day");
    setLimitOne(false);
    setFtCustomer(false);
    setVisibleOnline(false);
    setMaxDiscount("");
    setRandomCode(true);
    setCustomCode(false);
    setCustomCodeValue("");
    swal({ title: t("common.success"), text: t("coupons_page.success_created"), icon: "success", button: t("common.ok") });
  };

  const handleDeleteCoupon = async (couponId) => {
    const result = await dispatch(deleteCouponThunk(couponId));
    if (result?.ok) {
      swal({ title: t("common.success"), text: t("coupons_page.success_deleted"), icon: "success", button: t("common.ok") });
    } else if (result?.message) {
      swal({ title: t("coupons_page.err_cannot_delete"), text: result.message, icon: "error", button: t("common.ok") });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSort = (field) => {
    setCouponSort((prev) => ({
      sort: field,
      order: prev.sort === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ field }) =>
    couponSort.sort === field ? (couponSort.order === "desc" ? " ▼" : " ▲") : null;

  const totalUses = coupons.reduce((s, c) => s + (c.redemption_count ?? 0), 0);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#111827", letterSpacing: "-0.025em" }}>
            {t("coupons_page.title")}
          </h2>
          <p className="text-muted mb-0 small">{t("coupons_page.desc")}</p>
        </div>
        <Button
          onClick={() => setCreateModal(true)}
          className="d-flex align-items-center"
          style={{
            background: "#dd2f6e",
            border: "none",
            padding: "0.6rem 1.25rem",
            borderRadius: "10px",
            fontWeight: "500",
          }}
        >
          <Plus size={18} className="me-2" />
          {t("coupons_page.create_btn")}
        </Button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="d-flex align-items-center">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{ width: 48, height: 48, background: "#ecfdf5" }}
              >
                <Tag size={24} style={{ color: "#059669" }} />
              </div>
              <div>
                <div className="small text-muted">{t("coupons_page.total_coupons")}</div>
                <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{loading ? "…" : total}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <Card.Body className="d-flex align-items-center">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{ width: 48, height: 48, background: "#eff6ff" }}
              >
                <TrendingUp size={24} style={{ color: "#dd2f6e" }} />
              </div>
              <div>
                <div className="small text-muted">{t("coupons_page.total_redemptions")}</div>
                <div className="h4 mb-0 fw-bold" style={{ color: "#111827" }}>{loading ? "…" : totalUses}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <Card.Header
          className="d-flex flex-wrap align-items-center gap-3 py-3"
          style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="d-flex align-items-center">
            <Filter size={18} className="me-2 text-muted" />
            <span className="small fw-semibold text-muted">{t("coupons_page.filter_source")}</span>
          </div>
            <Form.Select
            size="sm"
            value={couponSourceFilter}
            onChange={(e) => setCouponSourceFilter(e.target.value)}
            style={{ width: "auto", minWidth: "140px", borderRadius: "8px" }}
          >
            <option value="">{t("coupons_page.filter_all")}</option>
            <option value="automated">{t("coupons_page.filter_ai")}</option>
            <option value="manual">{t("coupons_page.filter_manual")}</option>
            <option value="referral">{t("coupons_page.filter_referral")}</option>
          </Form.Select>
        </Card.Header>
        <Card.Body className="p-0 position-relative">
          {loading && (
            <div
              className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-white opacity-75 rounded-bottom"
              style={{ zIndex: 5, minHeight: 200 }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          )}
          {!loading && !coupons.length ? (
            <div className="text-center py-5 text-muted">
              <Tag size={40} className="mb-2 opacity-50" />
              <p className="mb-0">{t("coupons_page.no_coupons")}</p>
            </div>
          ) : (
            <>
            <Table hover responsive className="mb-0 align-middle">
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  <th
                    className="py-3 px-4"
                    style={{ cursor: "pointer", fontWeight: "600", color: "#374151" }}
                    onClick={() => handleSort("coupon_id")}
                  >
                    {t("coupons_page.table_code")} <SortIcon field="coupon_id" />
                  </th>
                  <th className="py-3 px-4" style={{ fontWeight: "600", color: "#374151" }}>{t("coupons_page.table_discount")}</th>
                  <th className="py-3 px-4" style={{ fontWeight: "600", color: "#374151" }}>{t("coupons_page.table_max_discount")}</th>
                  <th
                    className="py-3 px-4"
                    style={{ cursor: "pointer", fontWeight: "600", color: "#374151" }}
                    onClick={() => handleSort("source")}
                  >
                    {t("coupons_page.table_source")} <SortIcon field="source" />
                  </th>
                  <th
                    className="py-3 px-4"
                    style={{ cursor: "pointer", fontWeight: "600", color: "#374151" }}
                    onClick={() => handleSort("createdAt")}
                  >
                    {t("coupons_page.table_created")} <SortIcon field="createdAt" />
                  </th>
                  <th
                    className="py-3 px-4"
                    style={{ cursor: "pointer", fontWeight: "600", color: "#374151" }}
                    onClick={() => handleSort("expiration_date")}
                  >
                    {t("coupons_page.table_expires")} <SortIcon field="expiration_date" />
                  </th>
                  <th
                    className="py-3 px-4"
                    style={{ cursor: "pointer", fontWeight: "600", color: "#374151" }}
                    onClick={() => handleSort("redemption_count")}
                  >
                    {t("coupons_page.table_uses")} <SortIcon field="redemption_count" />
                  </th>
                  <th className="py-3 px-4" style={{ fontWeight: "600", color: "#374151" }}>{t("coupons_page.table_status")}</th>
                  <th className="py-3 px-4" style={{ fontWeight: "600", color: "#374151" }}></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-4 py-3 fw-semibold" style={{ color: "#111827" }}>{coupon.coupon_id}</td>
                    <td className="px-4 py-3">
                      {coupon.discount}
                      {coupon.discount_type === "Percentage" ? "%" : "$"}
                    </td>
                    <td className="px-4 py-3 text-muted small">
                      {coupon.max_discount != null && coupon.max_discount !== ""
                        ? `$${Number(coupon.max_discount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          coupon.source === "automated" ? "bg-info" : coupon.source === "referral" ? "bg-warning text-dark" : "bg-secondary"
                        }`}
                        style={{ borderRadius: "6px" }}
                      >
                        {coupon.source === "automated" ? t("coupons_page.source_ai") : coupon.source === "referral" ? t("coupons_page.source_referral") : t("coupons_page.source_manual")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted small">{formatDate(coupon.createdAt)}</td>
                    <td className="px-4 py-3 text-muted small">{formatDate(coupon.expiration_date)}</td>
                    <td className="px-4 py-3">{coupon.redemption_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${(coupon.status === "active" || (coupon.expiration_date && new Date(coupon.expiration_date) > new Date())) ? "bg-success" : "bg-secondary"}`}
                        style={{ borderRadius: "6px" }}
                      >
                        {coupon.status === "expired" || (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) ? t("coupons_page.status_expired") : t("coupons_page.status_active")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {coupon.source !== "manual" ? (
                        <Button variant="outline-secondary" size="sm" disabled style={{ borderRadius: "6px" }} title={t("coupons_page.delete_manual_only")}>
                          {t("coupons_page.table_delete")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.coupon_id)}
                          style={{ borderRadius: "6px" }}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="d-flex align-items-center justify-content-between px-4 py-3 border-top" style={{ background: "#f9fafb" }}>
                <span className="small text-muted">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </span>
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => fetchPage(page - 1)}
                  >
                    {t("coupons_page.pagination_prev")}
                  </Button>
                  <span className="align-self-center small px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => fetchPage(page + 1)}
                  >
                    {t("coupons_page.pagination_next")}
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={createModal} onHide={() => setCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{t("coupons_page.modal_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_type")}</Form.Label>
            <div className="d-flex gap-4">
              <Form.Check type="radio" label={t("coupons_page.modal_percentage")} name="discountType" checked={inputType === "Percentage"} onChange={() => setInputType("Percentage")} />
              <Form.Check type="radio" label={t("coupons_page.modal_fixed")} name="discountType" checked={inputType === "Amount"} onChange={() => setInputType("Amount")} />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{inputType === "Percentage" ? t("coupons_page.modal_discount_label") : t("coupons_page.modal_amount_label")}</Form.Label>
            <Form.Control type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={inputType === "Percentage" ? "e.g. 15" : "e.g. 5"} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_max_discount")}</Form.Label>
            <Form.Control
              type="number"
              min={0}
              step="0.01"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder={t("coupons_page.modal_max_discount_placeholder")}
            />
            <Form.Text className="text-muted">{t("coupons_page.modal_max_discount_hint")}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_use_limit")}</Form.Label>
            <Form.Control type="number" value={use_limit} onChange={(e) => setUseLimit(e.target.value)} placeholder={t("coupons_page.modal_unlimited")} min={0} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_min_spend")}</Form.Label>
            <Form.Control type="number" value={min_require} onChange={(e) => setMinRequire(e.target.value)} min={0} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_expiration")}</Form.Label>
            <Form.Select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
              <option value="1day">{t("coupons_page.modal_1day")}</option>
              <option value="1week">{t("coupons_page.modal_1week")}</option>
              <option value="1month">{t("coupons_page.modal_1month")}</option>
              <option value="unlimited">{t("coupons_page.modal_no_expiry")}</option>
            </Form.Select>
          </Form.Group>
          <div className="mb-3">
            <Form.Check type="checkbox" label={t("coupons_page.modal_limit_one")} checked={limit_one} onChange={(e) => setLimitOne(e.target.checked)} />
            <Form.Check type="checkbox" label={t("coupons_page.modal_ft_customer")} checked={ftCustomer} onChange={(e) => setFtCustomer(e.target.checked)} />
            <Form.Check type="checkbox" label={t("coupons_page.modal_visible_online")} checked={visibleOnline} onChange={(e) => setVisibleOnline(e.target.checked)} />
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("coupons_page.modal_code_type")}</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check type="radio" label={t("coupons_page.modal_random")} name="codeType" checked={randomCode} onChange={() => { setRandomCode(true); setCustomCode(false); }} />
              <Form.Check type="radio" label={t("coupons_page.modal_custom")} name="codeType" checked={customCode} onChange={() => { setCustomCode(true); setRandomCode(false); }} />
            </div>
            {customCode && <Form.Control className="mt-2" value={customCodeValue} onChange={(e) => setCustomCodeValue(e.target.value.toUpperCase())} placeholder={t("coupons_page.modal_placeholder_custom")} />}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>{t("common.cancel")}</Button>
          <Button variant="primary" onClick={handleCreateCoupon}>{t("common.create")}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
