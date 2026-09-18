import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Col, Row, Spinner, Table } from "react-bootstrap";
import { getToken } from "../../../store/utlits";

const PAGE_SIZE = 15;

const PAYOUT_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TABS = ["overview", "daily", "bank", "orders"];

const UI = {
  page: { maxWidth: 1080, margin: "0 auto", padding: "24px 16px 48px" },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "#fff",
    marginBottom: 20,
  },
  sectionHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "#374151",
  },
  sectionBody: { padding: "20px" },
  label: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  value: { fontSize: "0.9375rem", color: "#111827", marginBottom: 0 },
  hint: { fontSize: "0.8125rem", color: "#6b7280", marginBottom: 0, lineHeight: 1.5 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.8125rem" },
  tabBar: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 0,
  },
  tab: (active) => ({
    padding: "10px 16px",
    fontSize: "0.875rem",
    fontWeight: active ? 600 : 400,
    color: active ? "#111827" : "#6b7280",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #111827" : "2px solid transparent",
    marginBottom: -1,
    cursor: "pointer",
  }),
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 1,
    background: "#e5e7eb",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  statCell: {
    background: "#fff",
    padding: "16px 18px",
  },
  tableWrap: { overflowX: "auto" },
  th: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
  td: {
    fontSize: "0.875rem",
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
    padding: "12px 14px",
    verticalAlign: "middle",
  },
};

function fmtCents(c) {
  if (c == null || Number.isNaN(Number(c))) return "—";
  const n = Number(c) / 100;
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function entryTypeLabel(entryType, t) {
  const key = String(entryType || "charge").toLowerCase();
  if (key === "refund") return t("payments_mgmt.ledger.entry_refund", { defaultValue: "Refund" });
  if (key === "extra_charge") return t("payments_mgmt.ledger.entry_extra", { defaultValue: "Extra" });
  return t("payments_mgmt.ledger.entry_charge", { defaultValue: "Charge" });
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start: isoDate(start), end: isoDate(end) };
}

function buildQuery({ start, end, limit, offset }) {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));
  return `?${qs.toString()}`;
}

function isExternalSettlementNote(note) {
  return (
    note === "pre_enrollment_stripe_auto" ||
    (typeof note === "string" && note.includes("pre_enrollment"))
  );
}

function resolveBucketDisplayStatus(status, note) {
  if (isExternalSettlementNote(note)) return "settled";
  if (status === "processing" || status === "paid") return "paid";
  if (status === "failed") return "pending";
  return "pending";
}

function resolvePayoutLogDisplayStatus(status) {
  const s = (status || "").toLowerCase();
  if (s === "failed" || s === "canceled") return "pending";
  return "paid";
}

function StatusText({ status, note, t, forPayoutLog = false }) {
  const display = forPayoutLog
    ? resolvePayoutLogDisplayStatus(status)
    : resolveBucketDisplayStatus(status, note);
  const label = t(`payments_mgmt.ledger.status_${display}`, { defaultValue: display });
  const muted = display === "pending" || display === "settled";

  return (
    <span
      style={{
        fontSize: "0.875rem",
        color: muted ? "#6b7280" : "#111827",
        fontStyle: display === "settled" ? "italic" : "normal",
      }}
    >
      {label}
    </span>
  );
}

function PaginationBar({ page, total, pageSize, onPage, loading, t }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className="d-flex flex-wrap align-items-center justify-content-between gap-2"
      style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb" }}
    >
      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
        {t("payments_mgmt.ledger.showing_range", { start, end, total })}
      </span>
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPage(page - 1)}
          style={{ fontSize: "0.8125rem" }}
        >
          {t("payments_mgmt.ledger.pagination_prev")}
        </Button>
        <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
          {t("payments_mgmt.ledger.page_of", { page, totalPages })}
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPage(page + 1)}
          style={{ fontSize: "0.8125rem" }}
        >
          {t("payments_mgmt.ledger.pagination_next")}
        </Button>
      </div>
    </div>
  );
}

function DataTable({ columns, rows, emptyMessage, footer }) {
  return (
    <div style={{ ...UI.section, marginBottom: 0, border: "none", borderRadius: 0 }}>
      <div style={UI.tableWrap}>
        <Table className="mb-0" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={UI.th}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ ...UI.td, textAlign: "center", color: "#9ca3af", padding: "32px 14px" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows
            )}
          </tbody>
        </Table>
      </div>
      {footer}
    </div>
  );
}

function StatBlock({ label, value, sub }) {
  return (
    <div style={UI.statCell}>
      <div style={UI.label}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
        {value}
      </div>
      {sub && (
        <div style={{ ...UI.hint, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export default function ConnectPayoutLedger() {
  const { t } = useTranslation();
  const initialRange = defaultDateRange();

  const [activeTab, setActiveTab] = useState("overview");
  const [rangeStart, setRangeStart] = useState(initialRange.start);
  const [rangeEnd, setRangeEnd] = useState(initialRange.end);
  const [appliedStart, setAppliedStart] = useState(initialRange.start);
  const [appliedEnd, setAppliedEnd] = useState(initialRange.end);

  const [summary, setSummary] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [bucketTotal, setBucketTotal] = useState(0);
  const [bucketPage, setBucketPage] = useState(1);

  const [payouts, setPayouts] = useState([]);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [payoutPage, setPayoutPage] = useState(1);

  const [charges, setCharges] = useState([]);
  const [chargeTotal, setChargeTotal] = useState(0);
  const [chargePage, setChargePage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [err, setErr] = useState("");

  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleErr, setScheduleErr] = useState("");
  const [scheduleOk, setScheduleOk] = useState("");
  const [payoutInterval, setPayoutInterval] = useState(null);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [payoutCadence, setPayoutCadence] = useState("daily");
  const [weeklyAnchor, setWeeklyAnchor] = useState("friday");
  const [payoutDueToday, setPayoutDueToday] = useState(null);
  const [payoutWeekStart, setPayoutWeekStart] = useState(null);
  const [payoutWeekEnd, setPayoutWeekEnd] = useState(null);
  const [nextAnchorDate, setNextAnchorDate] = useState(null);
  const [cadenceSaving, setCadenceSaving] = useState(false);

  const authHeaders = useCallback(() => {
    const token = getToken();
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const loadSummary = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
    const qs = new URLSearchParams();
    if (appliedStart) qs.set("start", appliedStart);
    if (appliedEnd) qs.set("end", appliedEnd);
    const res = await fetch(`/api/connect-transfers/summary?${qs}`, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Summary failed");
    setSummary(data.summary || null);
  }, [appliedStart, appliedEnd, authHeaders]);

  const loadBuckets = useCallback(
    async (page) => {
      const headers = authHeaders();
      if (!headers) return;
      const q = buildQuery({
        start: appliedStart,
        end: appliedEnd,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      const res = await fetch(`/api/connect-transfers/buckets${q}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Buckets failed");
      setBuckets(data.buckets || []);
      setBucketTotal(data.pagination?.total ?? (data.buckets || []).length);
    },
    [appliedStart, appliedEnd, authHeaders],
  );

  const loadPayouts = useCallback(
    async (page) => {
      const headers = authHeaders();
      if (!headers) return;
      const q = buildQuery({
        start: appliedStart,
        end: appliedEnd,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      const res = await fetch(`/api/connect-transfers/payouts${q}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Payouts failed");
      setPayouts(data.payouts || []);
      setPayoutTotal(data.pagination?.total ?? (data.payouts || []).length);
    },
    [appliedStart, appliedEnd, authHeaders],
  );

  const loadCharges = useCallback(
    async (page) => {
      const headers = authHeaders();
      if (!headers) return;
      const q = buildQuery({
        start: appliedStart,
        end: appliedEnd,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      const res = await fetch(`/api/connect-transfers/charges${q}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Charges failed");
      setCharges(data.charges || []);
      setChargeTotal(data.pagination?.total ?? (data.charges || []).length);
    },
    [appliedStart, appliedEnd, authHeaders],
  );

  const loadAll = useCallback(
    async ({ bp = 1, pp = 1, cp = 1 } = {}) => {
      const headers = authHeaders();
      if (!headers) {
        setErr(t("payments_mgmt.ledger.not_signed_in"));
        setLoading(false);
        return;
      }
      setErr("");
      try {
        await Promise.all([
          loadSummary(),
          loadBuckets(bp),
          loadPayouts(pp),
          loadCharges(cp),
        ]);
      } catch (e) {
        setErr(e.message || t("payments_mgmt.ledger.error_loading"));
      } finally {
        setLoading(false);
        setTabLoading(false);
      }
    },
    [authHeaders, loadBuckets, loadCharges, loadPayouts, loadSummary, t],
  );

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      setErr(t("payments_mgmt.ledger.not_signed_in"));
      setLoading(false);
      return;
    }
    (async () => {
      setScheduleLoading(true);
      try {
        const [scheduleRes, cadenceRes] = await Promise.all([
          fetch("/api/connect-transfers/payout-schedule", { headers }),
          fetch("/api/connect-transfers/payout-cadence", { headers }),
        ]);
        const scheduleData = await scheduleRes.json().catch(() => ({}));
        const cadenceData = await cadenceRes.json().catch(() => ({}));
        if (!scheduleRes.ok) throw new Error(scheduleData.error || "Schedule error");
        if (!cadenceRes.ok) throw new Error(cadenceData.error || "Cadence error");
        setPayoutInterval(scheduleData.interval || null);
        setPayoutCadence(cadenceData.cadence === "weekly" ? "weekly" : "daily");
        if (cadenceData.weekly_anchor) {
          setWeeklyAnchor(cadenceData.weekly_anchor);
        }
        setPayoutDueToday(Boolean(cadenceData.payout_due_today));
        setPayoutWeekStart(cadenceData.payout_week_start || null);
        setPayoutWeekEnd(cadenceData.payout_week_end || null);
        setNextAnchorDate(cadenceData.next_anchor_date || null);
      } catch (e) {
        setScheduleErr(e.message);
      } finally {
        setScheduleLoading(false);
      }
    })();
    setLoading(true);
    loadAll({ bp: 1, pp: 1, cp: 1 });
    setBucketPage(1);
    setPayoutPage(1);
    setChargePage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedStart, appliedEnd]);

  const setStripePayoutMode = async (mode) => {
    setScheduleSaving(true);
    setScheduleErr("");
    setScheduleOk("");
    const headers = authHeaders();
    if (!headers) return;
    try {
      const res = await fetch("/api/connect-transfers/payout-schedule", {
        method: "PUT",
        headers,
        body: JSON.stringify({ mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      setPayoutInterval(data.interval);
      setScheduleOk(t("common.success"));
    } catch (e) {
      setScheduleErr(e.message || "Update failed");
    } finally {
      setScheduleSaving(false);
    }
  };

  const savePayoutCadence = async () => {
    setCadenceSaving(true);
    setScheduleErr("");
    setScheduleOk("");
    const headers = authHeaders();
    if (!headers) return;
    try {
      const body = { cadence: payoutCadence };
      if (payoutCadence === "weekly") {
        body.weekly_anchor = weeklyAnchor;
      }
      const res = await fetch("/api/connect-transfers/payout-cadence", {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      setPayoutCadence(data.cadence === "weekly" ? "weekly" : "daily");
      if (data.weekly_anchor) setWeeklyAnchor(data.weekly_anchor);
      setPayoutDueToday(Boolean(data.payout_due_today));
      setPayoutWeekStart(data.payout_week_start || null);
      setPayoutWeekEnd(data.payout_week_end || null);
      setNextAnchorDate(data.next_anchor_date || null);
      if (payoutCadence === "weekly") {
        setPayoutInterval("manual");
      }
      setScheduleOk(data.message || t("common.success"));
    } catch (e) {
      setScheduleErr(e.message || "Update failed");
    } finally {
      setCadenceSaving(false);
    }
  };

  const applyRange = (e) => {
    e.preventDefault();
    setLoading(true);
    setBucketPage(1);
    setPayoutPage(1);
    setChargePage(1);
    setAppliedStart(rangeStart);
    setAppliedEnd(rangeEnd);
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    if (days != null) start.setDate(start.getDate() - days);
    const s = days == null ? "" : isoDate(start);
    const e = isoDate(end);
    setRangeStart(s);
    setRangeEnd(e);
    setLoading(true);
    setBucketPage(1);
    setPayoutPage(1);
    setChargePage(1);
    setAppliedStart(s);
    setAppliedEnd(e);
  };

  const stripeStatusLabel =
    payoutInterval === "manual"
      ? t("payments_mgmt.ledger.stripe_status_manual")
      : payoutInterval === "daily"
        ? t("payments_mgmt.ledger.stripe_status_auto")
        : payoutInterval || "—";

  const platformStatusLabel =
    payoutCadence === "weekly"
      ? t("payments_mgmt.ledger.platform_status_weekly", {
          day: t(`payments_mgmt.ledger.weekday_${weeklyAnchor}`),
        })
      : t("payments_mgmt.ledger.platform_status_daily");

  const tabLabels = {
    overview: t("payments_mgmt.ledger.tab_overview"),
    daily: t("payments_mgmt.ledger.tab_daily"),
    bank: t("payments_mgmt.ledger.tab_bank"),
    orders: t("payments_mgmt.ledger.tab_orders"),
  };

  const dateRangeLabel =
    appliedStart && appliedEnd
      ? `${appliedStart} — ${appliedEnd}`
      : t("payments_mgmt.ledger.preset_all");

  return (
    <div style={UI.page}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600, color: "#111827", marginBottom: 8 }}>
          {t("payments_mgmt.ledger.title")}
        </h1>
        <p style={{ ...UI.hint, maxWidth: 640 }}>{t("payments_mgmt.ledger.desc_short")}</p>
      </header>

      {/* Payout settings */}
      <section style={UI.section}>
        <div style={UI.sectionHeader}>{t("payments_mgmt.ledger.settings_section")}</div>
        <div style={UI.sectionBody}>
          {(scheduleErr || scheduleOk) && (
            <div
              style={{
                fontSize: "0.8125rem",
                color: scheduleErr ? "#991b1b" : "#374151",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                marginBottom: 16,
                background: "#fafafa",
              }}
            >
              {scheduleErr || scheduleOk}
            </div>
          )}
          <Row className="g-4">
            <Col md={6}>
              <div style={UI.label}>{t("payments_mgmt.ledger.stripe_mode_label")}</div>
              {scheduleLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <p style={{ ...UI.value, marginBottom: 8 }}>{stripeStatusLabel}</p>
                  <p style={{ ...UI.hint, marginBottom: 12 }}>
                    {t("payments_mgmt.ledger.schedule_desc_short")}
                  </p>
                  {payoutInterval !== "manual" && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={scheduleSaving || scheduleLoading}
                      onClick={() => setStripePayoutMode("manual")}
                    >
                      {scheduleSaving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        t("payments_mgmt.ledger.set_manual")
                      )}
                    </Button>
                  )}
                </>
              )}
            </Col>
            <Col md={6}>
              <div style={UI.label}>{t("payments_mgmt.ledger.platform_frequency_label")}</div>
              {scheduleLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <p style={{ ...UI.value, marginBottom: 12 }}>{platformStatusLabel}</p>
                  <Row className="g-2 align-items-end">
                    <Col xs={12} sm={5}>
                      <label style={{ ...UI.label, textTransform: "none", letterSpacing: 0 }}>
                        {t("payments_mgmt.ledger.cadence_title")}
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={payoutCadence}
                        disabled={cadenceSaving || scheduleLoading}
                        onChange={(e) => setPayoutCadence(e.target.value)}
                      >
                        <option value="daily">{t("payments_mgmt.ledger.cadence_daily")}</option>
                        <option value="weekly">{t("payments_mgmt.ledger.cadence_weekly")}</option>
                      </select>
                    </Col>
                    {payoutCadence === "weekly" && (
                      <Col xs={12} sm={5}>
                        <label style={{ ...UI.label, textTransform: "none", letterSpacing: 0 }}>
                          {t("payments_mgmt.ledger.cadence_weekly_day")}
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={weeklyAnchor}
                          disabled={cadenceSaving || scheduleLoading}
                          onChange={(e) => setWeeklyAnchor(e.target.value)}
                        >
                          {PAYOUT_WEEKDAYS.map((day) => (
                            <option key={day} value={day}>
                              {t(`payments_mgmt.ledger.weekday_${day}`)}
                            </option>
                          ))}
                        </select>
                      </Col>
                    )}
                    <Col xs={12} sm={payoutCadence === "weekly" ? 2 : 7}>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100"
                        disabled={cadenceSaving || scheduleLoading}
                        onClick={savePayoutCadence}
                      >
                        {cadenceSaving ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          t("payments_mgmt.ledger.cadence_save")
                        )}
                      </Button>
                    </Col>
                  </Row>
                  {payoutCadence === "weekly" && payoutDueToday != null && (
                    <p style={{ ...UI.hint, marginTop: 10 }}>
                      {payoutDueToday
                        ? t("payments_mgmt.ledger.cadence_due_today_weekly", {
                            start: payoutWeekStart || "—",
                            end: payoutWeekEnd || "—",
                          })
                        : t("payments_mgmt.ledger.cadence_not_due_today_weekly", {
                            day: t(`payments_mgmt.ledger.weekday_${weeklyAnchor}`),
                            date: nextAnchorDate || "—",
                            start: payoutWeekStart || "—",
                            end: payoutWeekEnd || "—",
                          })}
                    </p>
                  )}
                </>
              )}
            </Col>
          </Row>
        </div>
      </section>

      {/* Summary */}
      {!loading && summary && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ ...UI.label, marginBottom: 8 }}>
            {t("payments_mgmt.ledger.summary_heading", { range: dateRangeLabel })}
          </div>
          <div style={UI.statGrid}>
            <StatBlock
              label={t("payments_mgmt.ledger.summary_days")}
              value={summary.dayCount ?? "—"}
            />
            <StatBlock
              label={t("payments_mgmt.ledger.summary_pending")}
              value={fmtCents(summary.pendingCents)}
              sub={`${summary.pendingDays ?? 0} ${t("payments_mgmt.ledger.summary_days_unit")}`}
            />
            <StatBlock
              label={t("payments_mgmt.ledger.summary_paid")}
              value={fmtCents(summary.paidCents)}
              sub={`${summary.paidDays ?? 0} ${t("payments_mgmt.ledger.summary_days_unit")}`}
            />
            <StatBlock
              label={t("payments_mgmt.ledger.summary_settled")}
              value={fmtCents(summary.settledCents)}
              sub={`${summary.settledDays ?? 0} ${t("payments_mgmt.ledger.summary_settled_hint")}`}
            />
          </div>
        </section>
      )}

      {/* Date filter */}
      <section style={UI.section}>
        <div style={UI.sectionBody}>
          <div className="d-flex flex-wrap align-items-end gap-3">
            <div className="d-flex flex-wrap gap-2">
              {[
                { key: "7d", days: 7 },
                { key: "30d", days: 30 },
                { key: "90d", days: 90 },
                { key: "all", days: null },
              ].map(({ key, days }) => (
                <Button
                  key={key}
                  size="sm"
                  variant="link"
                  className="text-decoration-none p-0"
                  style={{ fontSize: "0.8125rem", color: "#374151" }}
                  onClick={() => applyPreset(days)}
                >
                  {t(`payments_mgmt.ledger.preset_${key}`)}
                </Button>
              ))}
            </div>
            <form className="d-flex flex-wrap align-items-end gap-2 ms-md-auto" onSubmit={applyRange}>
              <div>
                <label style={UI.label}>{t("payments_mgmt.ledger.from")}</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                />
              </div>
              <div>
                <label style={UI.label}>{t("payments_mgmt.ledger.to")}</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline-secondary" size="sm" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : t("payments_mgmt.ledger.apply")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {err && (
        <div
          style={{
            fontSize: "0.875rem",
            color: "#991b1b",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            marginBottom: 20,
          }}
        >
          {err}
        </div>
      )}

      {/* Data tabs */}
      <section style={UI.section}>
        <div style={UI.tabBar}>
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              style={UI.tab(activeTab === key)}
              onClick={() => setActiveTab(key)}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <p style={{ ...UI.hint, marginTop: 12 }}>{t("payments_mgmt.status_loading")}</p>
          </div>
        ) : (
          <div style={UI.sectionBody}>
            {activeTab === "overview" && (
              <div>
                <p style={{ ...UI.hint, marginBottom: 16 }}>
                  {t("payments_mgmt.ledger.overview_intro")}
                </p>
                <ol style={{ ...UI.hint, paddingLeft: 20, marginBottom: 0 }}>
                  <li className="mb-2">{t("payments_mgmt.ledger.how_it_works_1")}</li>
                  <li className="mb-2">{t("payments_mgmt.ledger.how_it_works_2")}</li>
                  <li>{t("payments_mgmt.ledger.how_it_works_3")}</li>
                </ol>
              </div>
            )}

            {activeTab === "daily" && (
              <>
                <p style={{ ...UI.hint, marginBottom: 12 }}>{t("payments_mgmt.ledger.buckets_help")}</p>
                {tabLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
                ) : (
                  <DataTable
                    columns={[
                      { key: "date", label: t("payments_mgmt.ledger.table_date") },
                      { key: "total", label: t("payments_mgmt.ledger.table_total") },
                      { key: "status", label: t("payments_mgmt.ledger.table_status") },
                      { key: "paid", label: t("payments_mgmt.ledger.table_paid_at") },
                      { key: "attempt", label: t("payments_mgmt.ledger.table_last_attempt") },
                    ]}
                    emptyMessage={t("payments_mgmt.ledger.no_buckets")}
                    rows={buckets.map((b) => {
                      const total = Number(b.total_cents) || 0;
                      return (
                      <tr key={b.id}>
                        <td style={{ ...UI.td, fontWeight: 500 }}>{b.business_date}</td>
                        <td style={{ ...UI.td, color: total < 0 ? "#b91c1c" : undefined }}>
                          {fmtCents(b.total_cents)}
                        </td>
                        <td style={UI.td}>
                          <StatusText status={b.status} note={b.last_payout_attempt_note} t={t} />
                        </td>
                        <td style={{ ...UI.td, color: "#6b7280" }}>
                          {b.paid_at ? new Date(b.paid_at).toLocaleString() : "—"}
                        </td>
                        <td style={{ ...UI.td, color: "#6b7280", maxWidth: 260 }}>
                          {b.last_payout_attempt_note && b.status === "pending"
                            ? b.last_payout_attempt_note
                            : "—"}
                        </td>
                      </tr>
                      );
                    })}
                    footer={
                      <PaginationBar
                        page={bucketPage}
                        total={bucketTotal}
                        pageSize={PAGE_SIZE}
                        onPage={(p) => {
                          setTabLoading(true);
                          setBucketPage(p);
                          loadBuckets(p).finally(() => setTabLoading(false));
                        }}
                        loading={tabLoading}
                        t={t}
                      />
                    }
                  />
                )}
              </>
            )}

            {activeTab === "bank" && (
              <>
                <p style={{ ...UI.hint, marginBottom: 12 }}>{t("payments_mgmt.ledger.payouts_help")}</p>
                {tabLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
                ) : (
                  <DataTable
                    columns={[
                      { key: "amount", label: t("payments_mgmt.ledger.table_amount") },
                      { key: "status", label: t("payments_mgmt.ledger.table_status") },
                      { key: "arrival", label: t("payments_mgmt.ledger.table_arrival") },
                      { key: "meta", label: t("payments_mgmt.ledger.table_meta_date") },
                      { key: "id", label: t("payments_mgmt.ledger.table_payout_id") },
                    ]}
                    emptyMessage={t("payments_mgmt.ledger.no_payouts")}
                    rows={payouts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ ...UI.td, fontWeight: 500 }}>{fmtCents(p.amount_cents)}</td>
                        <td style={UI.td}>
                          <StatusText status={p.status} t={t} forPayoutLog />
                        </td>
                        <td style={UI.td}>{p.arrival_date || "—"}</td>
                        <td style={UI.td}>{p.business_date || "—"}</td>
                        <td style={{ ...UI.td, ...UI.mono }}>{p.stripe_payout_id}</td>
                      </tr>
                    ))}
                    footer={
                      <PaginationBar
                        page={payoutPage}
                        total={payoutTotal}
                        pageSize={PAGE_SIZE}
                        onPage={(p) => {
                          setTabLoading(true);
                          setPayoutPage(p);
                          loadPayouts(p).finally(() => setTabLoading(false));
                        }}
                        loading={tabLoading}
                        t={t}
                      />
                    }
                  />
                )}
              </>
            )}

            {activeTab === "orders" && (
              <>
                <p style={{ ...UI.hint, marginBottom: 12 }}>{t("payments_mgmt.ledger.charges_help")}</p>
                {tabLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
                ) : (
                  <DataTable
                    columns={[
                      { key: "date", label: t("payments_mgmt.ledger.table_date") },
                      { key: "type", label: t("payments_mgmt.ledger.table_type", { defaultValue: "Type" }) },
                      { key: "order", label: t("payments_mgmt.ledger.table_order") },
                      { key: "net", label: t("payments_mgmt.ledger.table_net") },
                      { key: "charge", label: t("payments_mgmt.ledger.table_charge_total") },
                      { key: "fee", label: t("payments_mgmt.ledger.table_app_fee") },
                    ]}
                    emptyMessage={t("payments_mgmt.ledger.no_charges")}
                    rows={charges.map((c) => {
                      const net = Number(c.net_to_connect_cents) || 0;
                      return (
                      <tr key={c.id}>
                        <td style={UI.td}>{c.business_date}</td>
                        <td style={UI.td}>{entryTypeLabel(c.entry_type, t)}</td>
                        <td style={UI.td}>{c.order_id ? `#${c.order_id}` : "—"}</td>
                        <td style={{ ...UI.td, fontWeight: 500, color: net < 0 ? "#b91c1c" : "#111827" }}>
                          {fmtCents(c.net_to_connect_cents)}
                        </td>
                        <td style={{ ...UI.td, color: "#6b7280" }}>{fmtCents(c.amount_cents)}</td>
                        <td style={{ ...UI.td, color: "#6b7280" }}>{fmtCents(c.application_fee_cents)}</td>
                      </tr>
                      );
                    })}
                    footer={
                      <PaginationBar
                        page={chargePage}
                        total={chargeTotal}
                        pageSize={PAGE_SIZE}
                        onPage={(p) => {
                          setTabLoading(true);
                          setChargePage(p);
                          loadCharges(p).finally(() => setTabLoading(false));
                        }}
                        loading={tabLoading}
                        t={t}
                      />
                    }
                  />
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
