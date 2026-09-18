import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Table,
  Row,
  Col,
  Badge,
  Card,
  Pagination,
  Form,
} from "react-bootstrap";
import { getAllOrdersThunk } from "../../../store/orders";
import OrderDetailsModal from "./OrderDetailModal";
import { getFeesThunk } from "../../../store/fees";
import { OrderItemModifiersBlock } from "./orderModifierDisplay";
import { OrderSourceBadge } from "./orderSourceBadge";
import { useTranslation } from "react-i18next";

const EMPTY_FILTERS = {
  search: "",
  order_id: "",
  name: "",
  phone: "",
  pickup: "",
  fulfillment: "",
  status: "",
  payment: "",
  source: "",
  refunded: "",
  coupon: "",
  min_total: "",
  max_total: "",
  has_tip: "",
  first_time: "",
  has_note: "",
  start: "",
  end: "",
};

function OrderItemsPreview({ order, maxItems = 4 }) {
  const { t } = useTranslation();
  const items = order?.OrderItems || [];
  if (!items.length) {
    return <span className="text-muted small">—</span>;
  }
  const shown = items.slice(0, maxItems);
  const rest = items.length - shown.length;

  return (
    <div className="small text-start" style={{ maxWidth: 320 }}>
      {shown.map((line) => (
        <div key={line.id} className="mb-2 pb-1 border-bottom border-light">
          <div className="fw-semibold text-dark">
            <span className="badge bg-dark me-1">{line.quantity}×</span>
            {line?.Item?.name}
            {line?.Item?.chinese_name ? (
              <span className="text-muted fw-normal ms-1">
                ({line.Item.chinese_name})
              </span>
            ) : null}
          </div>
          <OrderItemModifiersBlock orderItem={line} compact />
        </div>
      ))}
      {rest > 0 ? (
        <div className="text-muted fst-italic pt-1">
          +{rest} {t("orders.more_items")}
        </div>
      ) : null}
    </div>
  );
}

function formatOrderTotal(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function FilterField({ label, children }) {
  return (
    <Form.Group className="mb-0">
      <Form.Label className="small text-muted mb-1 fw-semibold">{label}</Form.Label>
      {children}
    </Form.Group>
  );
}

function AllOrders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.allOrders);
  const appOrderCount = useSelector((state) => state.orders.appOrderCount);
  const websiteOrderCount = useSelector(
    (state) => state.orders.websiteOrderCount,
  );
  const id = useSelector((state) => state.session.user.id);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fees = useSelector((state) => state.fees.fees);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 1200);
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await dispatch(getAllOrdersThunk(id, currentPage, appliedFilters));
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, id, currentPage, appliedFilters]);

  useEffect(() => {
    dispatch(getFeesThunk());
  }, [dispatch]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const onFilterKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const activeChips = useMemo(() => {
    const chips = [];
    const a = appliedFilters;
    if (a.search) chips.push({ key: "search", label: t("orders.filter_chip_search", { q: a.search }) });
    if (a.order_id) chips.push({ key: "order_id", label: `${t("orders.order_number")}: ${a.order_id}` });
    if (a.name) chips.push({ key: "name", label: `${t("orders.customer_name")}: ${a.name}` });
    if (a.phone) chips.push({ key: "phone", label: `${t("orders.phone")}: ${a.phone}` });
    if (a.pickup) chips.push({ key: "pickup", label: `${t("orders.filter_pickup_number")}: ${a.pickup}` });
    if (a.fulfillment === "pickup") chips.push({ key: "fulfillment", label: t("orders.fulfillment_pickup") });
    if (a.fulfillment === "delivery") chips.push({ key: "fulfillment", label: t("orders.fulfillment_delivery") });
    if (a.status) chips.push({ key: "status", label: `${t("orders.status")}: ${t(`orders.filter_status_${a.status.toLowerCase()}`)}` });
    if (a.payment === "online") chips.push({ key: "payment", label: t("orders.paid_online") });
    if (a.payment === "in-store") chips.push({ key: "payment", label: t("orders.pay_in_store") });
    if (a.source === "app") chips.push({ key: "source", label: t("orders.source_app") });
    if (a.source === "website") chips.push({ key: "source", label: t("orders.source_website") });
    if (a.refunded === "yes") chips.push({ key: "refunded", label: t("orders.filter_refunded_yes") });
    if (a.refunded === "no") chips.push({ key: "refunded", label: t("orders.filter_refunded_no") });
    if (a.coupon) chips.push({ key: "coupon", label: `${t("orders.filter_coupon")}: ${a.coupon}` });
    if (a.min_total) chips.push({ key: "min_total", label: `${t("orders.filter_min_total")}: $${a.min_total}` });
    if (a.max_total) chips.push({ key: "max_total", label: `${t("orders.filter_max_total")}: $${a.max_total}` });
    if (a.has_tip === "yes") chips.push({ key: "has_tip", label: t("orders.filter_has_tip_yes") });
    if (a.has_tip === "no") chips.push({ key: "has_tip", label: t("orders.filter_has_tip_no") });
    if (a.first_time === "yes") chips.push({ key: "first_time", label: t("orders.filter_first_time_yes") });
    if (a.first_time === "no") chips.push({ key: "first_time", label: t("orders.filter_first_time_no") });
    if (a.has_note === "yes") chips.push({ key: "has_note", label: t("orders.filter_has_note_yes") });
    if (a.has_note === "no") chips.push({ key: "has_note", label: t("orders.filter_has_note_no") });
    if (a.start || a.end) {
      chips.push({
        key: "dates",
        label: `${a.start || "…"} → ${a.end || "…"}`,
      });
    }
    return chips;
  }, [appliedFilters, t]);

  const removeChip = (key) => {
    const next = { ...appliedFilters };
    if (key === "dates") {
      next.start = "";
      next.end = "";
    } else {
      next[key] = "";
    }
    setFilters(next);
    setAppliedFilters(next);
    setCurrentPage(1);
  };

  const visibleOrders = useMemo(() => {
    const list = orders || [];
    if (appliedFilters.status === "HOLD") return list;
    return list.filter((o) => o.order_status !== "HOLD");
  }, [orders, appliedFilters.status]);

  const selectClass = "form-select form-select-sm";
  const inputClass = "form-control form-control-sm";

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <h5 className="card-title mb-0">{t("orders.all_orders")}</h5>
            <Badge bg="secondary">
              {t("orders.app_order_count", { count: appOrderCount })}
            </Badge>
            <Badge bg="info">
              {t("orders.website_order_count", { count: websiteOrderCount })}
            </Badge>
          </div>

          <div
            className="mb-3 p-3 border rounded-3 bg-light"
            onKeyDown={onFilterKeyDown}
          >
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
              <div>
                <div className="fw-semibold">{t("orders.filter_title")}</div>
                <div className="small text-muted">{t("orders.filter_subtitle")}</div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced
                    ? t("orders.filter_hide_advanced")
                    : t("orders.filter_show_advanced")}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClear}
                  disabled={loading}
                >
                  {t("orders.filter_clear")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? t("orders.searching") : t("orders.search")}
                </Button>
              </div>
            </div>

            <Row className="g-2 align-items-end">
              <Col lg={4} md={6}>
                <FilterField label={t("orders.filter_quick_search")}>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={t("orders.filter_quick_search_placeholder")}
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                  />
                </FilterField>
              </Col>
              <Col lg={2} md={3} xs={6}>
                <FilterField label={t("orders.filter_date_from")}>
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.start}
                    onChange={(e) => setFilter("start", e.target.value)}
                  />
                </FilterField>
              </Col>
              <Col lg={2} md={3} xs={6}>
                <FilterField label={t("orders.filter_date_to")}>
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.end}
                    onChange={(e) => setFilter("end", e.target.value)}
                  />
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_fulfillment")}>
                  <select
                    className={selectClass}
                    value={filters.fulfillment}
                    onChange={(e) => setFilter("fulfillment", e.target.value)}
                  >
                    <option value="">{t("orders.fulfillment_all")}</option>
                    <option value="pickup">{t("orders.fulfillment_pickup")}</option>
                    <option value="delivery">
                      {t("orders.fulfillment_delivery")}
                    </option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.status")}>
                  <select
                    className={selectClass}
                    value={filters.status}
                    onChange={(e) => setFilter("status", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="OPEN">{t("orders.filter_status_open")}</option>
                    <option value="READY">{t("orders.filter_status_ready")}</option>
                    <option value="CLOSE">{t("orders.filter_status_close")}</option>
                    <option value="HOLD">{t("orders.filter_status_hold")}</option>
                  </select>
                </FilterField>
              </Col>
            </Row>

            <Row className="g-2 align-items-end mt-1">
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_payment")}>
                  <select
                    className={selectClass}
                    value={filters.payment}
                    onChange={(e) => setFilter("payment", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="online">{t("orders.paid_online")}</option>
                    <option value="in-store">{t("orders.pay_in_store")}</option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_source")}>
                  <select
                    className={selectClass}
                    value={filters.source}
                    onChange={(e) => setFilter("source", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="app">{t("orders.source_app")}</option>
                    <option value="website">{t("orders.source_website")}</option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_refunded")}>
                  <select
                    className={selectClass}
                    value={filters.refunded}
                    onChange={(e) => setFilter("refunded", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="yes">{t("orders.filter_refunded_yes")}</option>
                    <option value="no">{t("orders.filter_refunded_no")}</option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_has_tip")}>
                  <select
                    className={selectClass}
                    value={filters.has_tip}
                    onChange={(e) => setFilter("has_tip", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="yes">{t("orders.filter_has_tip_yes")}</option>
                    <option value="no">{t("orders.filter_has_tip_no")}</option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_first_time")}>
                  <select
                    className={selectClass}
                    value={filters.first_time}
                    onChange={(e) => setFilter("first_time", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="yes">{t("orders.filter_first_time_yes")}</option>
                    <option value="no">{t("orders.filter_first_time_no")}</option>
                  </select>
                </FilterField>
              </Col>
              <Col lg={2} md={4} xs={6}>
                <FilterField label={t("orders.filter_has_note")}>
                  <select
                    className={selectClass}
                    value={filters.has_note}
                    onChange={(e) => setFilter("has_note", e.target.value)}
                  >
                    <option value="">{t("orders.filter_all")}</option>
                    <option value="yes">{t("orders.filter_has_note_yes")}</option>
                    <option value="no">{t("orders.filter_has_note_no")}</option>
                  </select>
                </FilterField>
              </Col>
            </Row>

            {showAdvanced ? (
              <Row className="g-2 align-items-end mt-2 pt-2 border-top">
                <Col lg={2} md={4} xs={6}>
                  <FilterField label={t("orders.order_number")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={filters.order_id}
                      onChange={(e) => setFilter("order_id", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={2} md={4} xs={6}>
                  <FilterField label={t("orders.customer_name")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={filters.name}
                      onChange={(e) => setFilter("name", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={2} md={4} xs={6}>
                  <FilterField label={t("orders.phone")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={filters.phone}
                      onChange={(e) => setFilter("phone", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={2} md={4} xs={6}>
                  <FilterField label={t("orders.filter_pickup_number")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={filters.pickup}
                      onChange={(e) => setFilter("pickup", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={2} md={4} xs={6}>
                  <FilterField label={t("orders.filter_coupon")}>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={t("orders.filter_coupon_placeholder")}
                      value={filters.coupon}
                      onChange={(e) => setFilter("coupon", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={1} md={2} xs={6}>
                  <FilterField label={t("orders.filter_min_total")}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={filters.min_total}
                      onChange={(e) => setFilter("min_total", e.target.value)}
                    />
                  </FilterField>
                </Col>
                <Col lg={1} md={2} xs={6}>
                  <FilterField label={t("orders.filter_max_total")}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={filters.max_total}
                      onChange={(e) => setFilter("max_total", e.target.value)}
                    />
                  </FilterField>
                </Col>
              </Row>
            ) : null}

            {activeChips.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top">
                <span className="small text-muted align-self-center">
                  {t("orders.filter_active")}:
                </span>
                {activeChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    bg="dark"
                    className="d-inline-flex align-items-center gap-1 px-2 py-2"
                    style={{ cursor: "pointer", fontWeight: 500 }}
                    onClick={() => removeChip(chip.key)}
                    title={t("orders.filter_remove_chip")}
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {isMobile ? (
            <Row>
              {visibleOrders.map((order) => (
                  <Col xs={12} key={order.id} className="mb-3">
                    <Card
                      onClick={() => handleOrderClick(order)}
                      className="custom-card"
                    >
                      <Card.Body>
                        <Card.Title className="mb-2">
                          #{order.order_id} -{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </Card.Title>
                        <Card.Text>
                          <strong>{order.name}</strong>
                          <br />
                          {order.phone_number}
                          <br />
                          <div className="mt-2 mb-2 small border-top pt-2">
                            <strong className="d-block mb-1">
                              {t("orders.items")}
                            </strong>
                            <OrderItemsPreview order={order} maxItems={3} />
                          </div>
                          <strong>{t("orders.total")}:</strong> $
                          {formatOrderTotal(order.order_total)}
                          <br />
                          <Badge
                            bg={
                              order.payment_method === "in-store"
                                ? "danger"
                                : "success"
                            }
                          >
                            {order.payment_method === "in-store"
                              ? t("orders.pay_in_store")
                              : t("orders.paid_online")}
                          </Badge>{" "}
                          <Badge bg="success">
                            {order.address && order.address !== "Pickup"
                              ? t("orders.require_delivery")
                              : t("orders.pickup")}
                          </Badge>{" "}
                          <Badge bg={order?.is_refunded ? "warning" : ""}>
                            {order?.is_refunded
                              ? t("orders.refunded_label")
                              : ""}
                          </Badge>{" "}
                          <OrderSourceBadge order={order} />
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          ) : (
            <div className="table-responsive-sm">
              <Table bordered hover responsive striped>
                <thead>
                  <tr>
                    <th>{t("orders.order_number")}</th>
                    <th>{t("orders.order_time")}</th>
                    <th>{t("orders.customer_info")}</th>
                    <th style={{ minWidth: 280 }}>{t("orders.items")}</th>
                    <th>{t("orders.total")}</th>
                    <th>{t("orders.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.length > 0 ? (
                    visibleOrders.map((order) => (
                        <tr
                          key={order.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleOrderClick(order)}
                        >
                          <td>#{order.order_id}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </td>
                          <td>
                            {order.name}
                            <br />
                            {order.phone_number}
                          </td>
                          <td className="align-top small">
                            <OrderItemsPreview order={order} maxItems={4} />
                          </td>
                          <td>${formatOrderTotal(order.order_total)}</td>
                          <td>
                            <Badge
                              bg={
                                order.payment_method === "in-store"
                                  ? "danger"
                                  : "success"
                              }
                            >
                              {order.payment_method === "in-store"
                                ? t("orders.pay_in_store")
                                : t("orders.paid_online")}
                            </Badge>{" "}
                            <Badge bg="success">
                              {order.address && order.address !== "Pickup"
                                ? t("orders.require_delivery")
                                : t("orders.pickup")}
                            </Badge>{" "}
                            <Badge bg={order?.is_refunded ? "warning" : ""}>
                              {order?.is_refunded
                                ? t("orders.refunded_label")
                                : ""}
                            </Badge>{" "}
                            <OrderSourceBadge order={order} />
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        {t("orders.no_orders")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}

          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              <Pagination.Item>{currentPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        </div>
      </div>
      <OrderDetailsModal
        showModal={showModal}
        selectedOrder={selectedOrder}
        setShowModal={setShowModal}
        fees={fees}
      />
    </div>
  );
}

export default AllOrders;
