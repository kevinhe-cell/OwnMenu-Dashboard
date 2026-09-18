import React, { useCallback, useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getMasterToken, getToken } from "../../../store/utlits";

const toCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

const fmtMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const fmtPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 10) return value || "-";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
};

const authHeaders = () => {
  const token = getMasterToken() || getToken();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const readApiError = async (response, fallback) => {
  try {
    const data = await response.json();
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
};

function OptPill({ on, yesLabel, noLabel }) {
  return (
    <span className={`cmc-pill ${on ? "is-on" : "is-off"}`}>
      {on ? yesLabel : noLabel}
    </span>
  );
}

function CustomerOrdersModal({ customer, onHide, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!customer?.phone || !customer?.restaurant_id) return;
    let cancelled = false;

    const load = async () => {
      const headers = authHeaders();
      if (!headers) return;
      setLoading(true);
      setError("");
      setPayload(null);
      setExpanded({});
      try {
        const params = new URLSearchParams({
          phone: String(customer.phone),
          restaurantId: String(customer.restaurant_id),
          limit: "50",
        });
        const response = await fetch(
          `/api/rewards/chain/customers/orders?${params.toString()}`,
          { headers },
        );
        if (!response.ok) {
          throw new Error(
            await readApiError(response, t("master_customers.orders.load_error")),
          );
        }
        const data = await response.json();
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) setError(err.message || t("master_customers.orders.load_error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [customer, t]);

  const apiCustomer = payload?.customer || {};
  const orders = payload?.orders || [];
  const name =
    apiCustomer.name || customer?.name || t("master_customers.orders.unnamed");
  const phone = apiCustomer.phone || customer?.phone;
  const email = apiCustomer.email ?? customer?.email;
  const points =
    apiCustomer.points != null ? apiCustomer.points : customer?.points;
  const restaurantName =
    apiCustomer.restaurant_name || customer?.restaurant_name || "—";

  return (
    <Modal show={!!customer} onHide={onHide} centered size="lg" className="cmc-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t("master_customers.orders.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="cmc-detail-card">
          <div className="cmc-detail-grid">
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.name")}</div>
              <div className="cmc-detail-value">{name}</div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.phone")}</div>
              <div className="cmc-detail-value">{fmtPhone(phone)}</div>
            </div>
            <div className="cmc-detail-cell cmc-detail-wide">
              <div className="cmc-detail-label">{t("master_customers.cols.restaurant")}</div>
              <div className="cmc-detail-value">{restaurantName}</div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.email")}</div>
              <div className="cmc-detail-value cmc-detail-soft">{email || "—"}</div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.points")}</div>
              <div className="cmc-detail-value">{toCount(points)}</div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.sms")}</div>
              <div className="cmc-detail-value">
                <OptPill
                  on={!!customer?.opt_in}
                  yesLabel={t("master_customers.yes")}
                  noLabel={t("master_customers.no")}
                />
              </div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.email_opt")}</div>
              <div className="cmc-detail-value">
                <OptPill
                  on={!!customer?.email_opt}
                  yesLabel={t("master_customers.yes")}
                  noLabel={t("master_customers.no")}
                />
              </div>
            </div>
            <div className="cmc-detail-cell">
              <div className="cmc-detail-label">{t("master_customers.cols.joined")}</div>
              <div className="cmc-detail-value">{formatDate(customer?.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="cmc-orders-section">
          <div className="cmc-orders-heading">
            <span>{t("master_customers.orders.history")}</span>
            {!loading && !error && (
              <span className="cmc-orders-count">
                {t("master_customers.orders.count", { count: orders.length })}
              </span>
            )}
          </div>

          {loading && (
            <div className="cmc-modal-loading">
              <Spinner animation="border" size="sm" />
              {t("master_customers.orders.loading")}
            </div>
          )}
          {error && <div className="alert alert-warning mb-0">{error}</div>}
          {!loading && !error && (
            <>
              {orders.length === 0 ? (
                <div className="cmc-empty">{t("master_customers.orders.empty")}</div>
              ) : (
                <div className="cmc-order-list">
                  {orders.map((order) => {
                    const open = !!expanded[order.id];
                    return (
                      <div key={order.id} className={`cmc-order ${open ? "is-open" : ""}`}>
                        <button
                          type="button"
                          className="cmc-order-head"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [order.id]: !prev[order.id],
                            }))
                          }
                        >
                          <div>
                            <div className="cmc-order-id">
                              #{order.order_id || order.id}
                            </div>
                            <div className="cmc-order-date">
                              {formatDateTime(order.createdAt)}
                            </div>
                          </div>
                          <div className="cmc-order-right">
                            <span className="cmc-order-total">
                              {fmtMoney(order.order_total)}
                            </span>
                            <span className="cmc-order-chevron">{open ? "−" : "+"}</span>
                          </div>
                        </button>
                        {open && (
                          <div className="cmc-order-items">
                            {(order.items || []).length === 0 ? (
                              <div className="cmc-empty-sm">
                                {t("master_customers.orders.no_items")}
                              </div>
                            ) : (
                              order.items.map((item) => (
                                <div key={item.id} className="cmc-item-row">
                                  <div>
                                    <div className="cmc-item-name">
                                      {item.quantity}× {item.item_name}
                                    </div>
                                    {(item.modifiers || []).length > 0 && (
                                      <div className="cmc-item-mods">
                                        {item.modifiers
                                          .map((m) =>
                                            m.attribute_name
                                              ? `${m.attribute_name}: ${m.name}`
                                              : m.name,
                                          )
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </div>
                                    )}
                                    {item.special_instructions ? (
                                      <div className="cmc-item-note">
                                        {item.special_instructions}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="cmc-item-price">
                                    {fmtMoney(item.item_price)}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default function MasterCustomersPanel() {
  const { t } = useTranslation();
  const restaurants = useSelector((state) => state.chainDashboard?.restaurants || []);

  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 25 });
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [downloadRestaurantId, setDownloadRestaurantId] = useState("");
  const [downloadStart, setDownloadStart] = useState("");
  const [downloadEnd, setDownloadEnd] = useState("");
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const loadCustomers = useCallback(
    async (nextPage, nextSearch) => {
      const headers = authHeaders();
      if (!headers) return;
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "25",
      });
      if (nextSearch.trim()) params.set("search", nextSearch.trim());

      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/rewards/chain/customers?${params.toString()}`,
          { headers },
        );
        if (!response.ok) {
          throw new Error(await readApiError(response, t("master_customers.errors.load")));
        }
        const data = await response.json();
        setCustomers(data.customers || []);
        setMeta({
          page: data.page || nextPage,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
          limit: data.limit || 25,
        });
      } catch (err) {
        setError(err.message || t("master_customers.errors.load"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    loadCustomers(page, appliedSearch);
  }, [page, appliedSearch, loadCustomers]);

  const downloadCustomerPdf = async () => {
    const headers = authHeaders();
    if (!headers || exporting) return;

    const params = new URLSearchParams({ export: "1", limit: "1000" });
    if (search.trim()) params.set("search", search.trim());

    setExporting(true);
    setError("");
    try {
      const response = await fetch(`/api/rewards/chain/customers?${params.toString()}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, t("master_customers.errors.export")));
      }
      const data = await response.json();
      const rows = data.customers || [];
      if (!rows.length) {
        setError(t("master_customers.errors.export_empty"));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 14;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const cols = [
        { label: "Name", key: "name", w: 58 },
        { label: "Restaurant", key: "restaurant", w: 72 },
        { label: "Phone", key: "phone", w: 42 },
      ];
      const drawHeader = (y) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, y - 5, pageWidth - margin * 2, 7, "F");
        let x = margin;
        cols.forEach((col) => {
          pdf.text(col.label, x + 1, y, { maxWidth: col.w - 2 });
          x += col.w;
        });
      };

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Chain Customers", margin, margin);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        `${rows.length} exported${
          data.exportLimited ? ` of ${data.total} total (limited to first 1000)` : ""
        }`,
        margin,
        margin + 6,
      );

      let y = margin + 16;
      drawHeader(y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      rows.forEach((customer) => {
        if (y > pageHeight - 12) {
          pdf.addPage("a4", "portrait");
          y = margin;
          drawHeader(y);
          y += 7;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
        }
        const row = {
          name: customer.name || "-",
          restaurant: customer.restaurant_name || "-",
          phone: fmtPhone(customer.phone),
        };
        let x = margin;
        cols.forEach((col) => {
          pdf.text(String(row[col.key] || "-"), x + 1, y, { maxWidth: col.w - 2 });
          x += col.w;
        });
        y += 6;
      });

      pdf.save(`Chain_Customers_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      setError(err.message || t("master_customers.errors.export"));
    } finally {
      setExporting(false);
    }
  };

  const downloadOrdersExcel = async () => {
    const headers = authHeaders();
    if (!headers || downloadBusy) return;

    const params = new URLSearchParams();
    if (downloadRestaurantId) params.set("restaurantId", downloadRestaurantId);
    if (downloadStart) params.set("startDate", downloadStart);
    if (downloadEnd) params.set("endDate", downloadEnd);

    setDownloadBusy(true);
    setDownloadError("");
    try {
      const response = await fetch(
        `/api/rewards/chain/customers/export-orders?${params.toString()}`,
        { headers },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, t("master_customers.download.error")),
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Chain_Customer_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message || t("master_customers.download.error"));
    } finally {
      setDownloadBusy(false);
    }
  };

  return (
    <div className="cmc-panel">
      <header className="cmc-header">
        <div>
          <div className="cmc-title-row">
            <h2>{t("master_customers.title")}</h2>
            <span className="cmc-count-chip">
              {t("master_customers.total_chip", { count: meta.total.toLocaleString() })}
            </span>
          </div>
          <p className="cmc-hint">{t("master_customers.hint")}</p>
        </div>
        {loading && <span className="cmc-loading-label">{t("common.refreshing")}</span>}
      </header>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <section className="cmc-card cmc-controls">
        <div className="cmc-toolbar">
          <form
            className="cmc-search"
            onSubmit={(event) => {
              event.preventDefault();
              const next = search.trim();
              setPage(1);
              setAppliedSearch(next);
              if (page === 1 && appliedSearch === next) {
                loadCustomers(1, next);
              }
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("master_customers.search_placeholder")}
            />
            <button type="submit" className="sr-btn-primary" disabled={loading}>
              {t("master_customers.search")}
            </button>
          </form>
          <button
            type="button"
            className="cmc-ghost-btn"
            onClick={downloadCustomerPdf}
            disabled={exporting || loading}
          >
            {exporting ? t("master_customers.pdf_preparing") : t("master_customers.pdf")}
          </button>
        </div>

        <div className="cmc-download-panel">
          <div className="cmc-download-top">
            <div className="cmc-download-title">{t("master_customers.download.title")}</div>
            <div className="cmc-download-sub">{t("master_customers.download.hint")}</div>
          </div>
          <div className="cmc-download-filters">
            <label className="cmc-field">
              <span>{t("master_customers.download.restaurant")}</span>
              <select
                value={downloadRestaurantId}
                onChange={(e) => setDownloadRestaurantId(e.target.value)}
              >
                <option value="">{t("master_customers.download.all_restaurants")}</option>
                {restaurants.map((r) => (
                  <option key={r.restaurant_id} value={r.restaurant_id}>
                    {r.restaurant_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="cmc-field">
              <span>{t("master_customers.download.start")}</span>
              <input
                type="date"
                value={downloadStart}
                onChange={(e) => setDownloadStart(e.target.value)}
              />
            </label>
            <label className="cmc-field">
              <span>{t("master_customers.download.end")}</span>
              <input
                type="date"
                value={downloadEnd}
                onChange={(e) => setDownloadEnd(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="sr-btn-primary cmc-download-btn"
              onClick={downloadOrdersExcel}
              disabled={downloadBusy}
            >
              {downloadBusy
                ? t("master_customers.download.preparing")
                : t("master_customers.download.button")}
            </button>
          </div>
          {downloadError && (
            <div className="alert alert-warning mt-2 mb-0">{downloadError}</div>
          )}
        </div>
      </section>

      <section className="cmc-card cmc-table-card">
        <div className="cmc-table-bar">
          <span className="cmc-summary">
            {t("master_customers.summary", {
              page: meta.page,
              totalPages: meta.totalPages,
              total: meta.total.toLocaleString(),
            })}
          </span>
        </div>

        <div className="cmc-table-wrap">
          <table className="cmc-table">
            <thead>
              <tr>
                <th>{t("master_customers.cols.name")}</th>
                <th>{t("master_customers.cols.restaurant")}</th>
                <th>{t("master_customers.cols.phone")}</th>
                <th className="cmc-col-action" />
              </tr>
            </thead>
            <tbody>
              {customers.length ? (
                customers.map((customer) => (
                  <tr
                    key={`${customer.restaurant_id}-${customer.id}`}
                    className="cmc-row"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="strong">{customer.name || "—"}</td>
                    <td className="cmc-restaurant">{customer.restaurant_name || "—"}</td>
                    <td className="cmc-phone">{fmtPhone(customer.phone)}</td>
                    <td className="cmc-actions">
                      <button
                        type="button"
                        className="cmc-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                      >
                        {t("master_customers.view_orders")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="cmc-empty">
                    {loading ? t("master_customers.loading") : t("sales.no_data")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="cmc-pager">
          <button
            type="button"
            className="cmc-ghost-btn"
            disabled={loading || meta.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("master_customers.prev")}
          </button>
          <span>
            {t("master_customers.page_of", {
              page: meta.page,
              totalPages: meta.totalPages,
            })}
          </span>
          <button
            type="button"
            className="cmc-ghost-btn"
            disabled={loading || meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("master_customers.next")}
          </button>
        </div>
      </section>

      <CustomerOrdersModal
        customer={selectedCustomer}
        onHide={() => setSelectedCustomer(null)}
        t={t}
      />
    </div>
  );
}
