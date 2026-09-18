import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getSalesDailyThunk,
  getTopSellingItemsThunk,
  getMonthlyReportEmailSettingsThunk,
  updateMonthlyReportEmailSettingsThunk,
  sendMonthlyReportEmailThunk,
  getSalesDaily,
  getTopSellingItems,
  getSales,
} from "../../../../store/restaurants";
import { fetchHours } from "../../../../store/Hours";
import { getToken } from "../../../../store/utlits";
import { useTranslation } from "react-i18next";
import { BarChart3, ClipboardList, Mail, ShoppingBag } from "lucide-react";
import { buildSalesReportPdf } from "./salesReportPdf";
import { businessMonthValue } from "./salesReportDates";
import {
  avgOrderValue,
  orderMix,
  pctChange,
  previousRange,
  rangeEndingToday,
} from "./salesReportMetrics";
import "./SalesReport.css";

const salesMemoryCache = new Map();
const SALES_CACHE_TTL = 60 * 1000; // 60s memory cache for instant tab/range switching

const toCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

const fmtMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const summaryToTotals = (summary) => {
  if (!summary) return {};
  const num = (k) => Number(summary[k]) || 0;
  return {
    totalSales: num("totalSales"),
    subtotal: num("subtotal"),
    totalTax: num("totalTax"),
    grossSales: num("grossSales"),
    restaurantDeliveryFee: num("restaurantDeliveryFee"),
    totalDiscount: num("totalDiscount"),
    totalProcessingCharge: num("totalProcessingCharge"),
    totalCreditCardCharge: num("totalCreditCardCharge"),
    totalNetReceivedOnlineOnly: num("totalNetReceivedOnlineOnly"),
    totalRefundAmount: num("totalRefundAmount"),
    doordashDeliveryFee: num("doordashDeliveryFee"),
    doordashDeliveryTips: num("doordashDeliveryTips"),
    totalCommissionFee: num("totalCommissionFee"),
    totalServiceFee: num("totalServiceFee"),
    totalOrders: toCount(summary.totalOrders),
    pickupOrders: toCount(summary.pickupOrders),
    deliveryOrders: toCount(summary.deliveryOrders),
    totalDeletedOrders: toCount(summary.totalDeletedOrders),
  };
};

const FilterPills = React.memo(({ options, value, onChange }) => (
  <div className="sr-pill-group">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`sr-pill${value === opt.value ? " active" : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
));

const CHART_PRESET_DAYS = { "30d": 30, "90d": 90, "12m": 365 };

async function fetchSalesDailyLocal(restaurantId, start, end, orderType, paymentType) {
  const token = getToken();
  if (!token || !restaurantId) return null;
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  if (orderType && orderType !== "all") params.append("orderType", orderType);
  if (paymentType && paymentType !== "all") params.append("paymentType", paymentType);
  const response = await fetch(
    `/api/restaurants/sales/${restaurantId}/daily?${params.toString()}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error("Failed to load previous period sales.");
  return response.json();
}

const ChangeBadge = React.memo(({ change }) => {
  if (!change?.hasPrevious) return null;
  const pct = change.percent;
  if (pct === null) return <span className="sr-change muted">—</span>;
  const cls = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`sr-change ${cls}`}>
      {sign}
      {pct.toFixed(1)}%
    </span>
  );
});

const MetricList = React.memo(({ rows }) => (
  <div className="sr-metric-list">
    {rows.map(([label, value, opts = {}]) => (
      <div
        key={label}
        className={`sr-metric-row${opts.highlight ? " highlight" : ""}${opts.strong ? " strong" : ""}`}
      >
        <span>{label}</span>
        <span>
          {opts.count
            ? toCount(value)
            : Number.isFinite(Number(value))
            ? fmtMoney(value)
            : value ?? "0"}
        </span>
      </div>
    ))}
  </div>
));

const SalesReport = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const id = useSelector((state) => state.session.user);
  const sales = useSelector((state) => state.restaurant.sales);
  const salesDaily = useSelector((state) => state.restaurant.salesDaily);
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const topSellingItems = useSelector((state) => state.restaurant.topSellingItems);
  const hours = useSelector((state) => state.hours.hours);
  const restaurantTz = hours?.time_zone;

  const [viewMode, setViewMode] = useState("range");
  const [chartPreset, setChartPreset] = useState("month");
  const [monthValue, setMonthValue] = useState(() => businessMonthValue());
  const [startDate, setStartDate] = useState(() => rangeEndingToday(1).start);
  const [endDate, setEndDate] = useState(() => rangeEndingToday(1).end);
  const [datesSyncedToRestaurant, setDatesSyncedToRestaurant] = useState(false);
  const [sendReportMonth, setSendReportMonth] = useState(() => businessMonthValue());
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [orderType, setOrderType] = useState("all");
  const [paymentType, setPaymentType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [topItemsLoading, setTopItemsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [activeTab, setActiveTab] = useState("breakdown");
  const [previousSummary, setPreviousSummary] = useState(null);
  const [previousDaily, setPreviousDaily] = useState([]);

  const displaySales = salesDaily?.summary || sales;

  const monthToRange = (monthStr) => {
    if (!monthStr) return { start: "", end: "" };
    const [y, m] = monthStr.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { start, end };
  };

  const monthTableRows = useMemo(() => {
    if (viewMode !== "month") return [];
    return (salesDaily?.daily || []).map((r) => {
      const [y, m, d] = r.date.split("-").map(Number);
      return {
        ...r,
        dateLabel: new Date(y, m - 1, d).toLocaleDateString(i18n.language, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        grossSales:
          r.grossSales !== undefined && r.grossSales !== null
            ? r.grossSales
            : (Number(r.subtotal) || 0) + (Number(r.totalTax) || 0),
        totalOrders: toCount(r.totalOrders),
        pickupOrders: toCount(r.pickupOrders),
        deliveryOrders: toCount(r.deliveryOrders),
        totalDeletedOrders: toCount(r.totalDeletedOrders),
      };
    });
  }, [viewMode, salesDaily, i18n.language]);

  const periodTotals = useMemo(
    () => summaryToTotals(salesDaily?.summary),
    [salesDaily?.summary]
  );

  const aov = useMemo(() => avgOrderValue(displaySales), [displaySales]);
  const mix = useMemo(() => orderMix(displaySales), [displaySales]);

  const chartData = useMemo(() => {
    const current = salesDaily?.daily || [];
    const previous = previousDaily || [];
    return current.map((row, i) => {
      const parts = String(row.date || "").split("-");
      const label = parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : row.date;
      return {
        date: row.date,
        label,
        thisPeriod: Number(row.totalSales) || 0,
        previousPeriod: previous[i] ? Number(previous[i].totalSales) || 0 : null,
      };
    });
  }, [salesDaily?.daily, previousDaily]);

  const mixData = useMemo(
    () => [
      { name: t("sales.pickup"), value: mix.pickup, color: "#0f766e" },
      { name: t("sales.delivery"), value: mix.delivery, color: "#dd2f6e" },
    ],
    [mix.pickup, mix.delivery, t]
  );

  const topTenItems = useMemo(() => {
    const items = Array.isArray(topSellingItems) ? topSellingItems.slice(0, 10) : [];
    const maxQty = items.reduce((max, item) => Math.max(max, Number(item.quantity) || 0), 0);
    const zh = i18n.language?.startsWith("zh");
    return items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const label =
        zh && item.chinese_name ? item.chinese_name : item.name || `#${item.id}`;
      return {
        ...item,
        quantity,
        price,
        revenue: quantity * price,
        bar: maxQty > 0 ? (quantity / maxQty) * 100 : 0,
        label: String(label).length > 18 ? `${String(label).slice(0, 16)}…` : label,
        fullName: label,
      };
    });
  }, [topSellingItems, i18n.language]);

  const salesChange = useMemo(
    () => pctChange(displaySales?.totalSales, previousSummary?.totalSales),
    [displaySales, previousSummary]
  );
  const ordersChange = useMemo(
    () => pctChange(displaySales?.totalOrders, previousSummary?.totalOrders),
    [displaySales, previousSummary]
  );
  const aovChange = useMemo(
    () => pctChange(avgOrderValue(displaySales), avgOrderValue(previousSummary)),
    [displaySales, previousSummary]
  );

  const applyChartPreset = (preset) => {
    setChartPreset(preset);
  };

  const restaurantDisplayName =
    restaurant?.name ||
    id?.restaurant_name ||
    id?.name ||
    `Restaurant #${id?.restaurant_id || ""}`.trim();

  const useOverviewPeriod = activeTab === "overview";
  const overviewRange = useMemo(() => {
    const days = CHART_PRESET_DAYS[chartPreset];
    if (days) return rangeEndingToday(days, restaurantTz);
    return monthToRange(monthValue);
  }, [chartPreset, monthValue, restaurantTz]);
  const breakdownStart = viewMode === "month" ? monthToRange(monthValue).start : startDate;
  const breakdownEnd = viewMode === "month" ? monthToRange(monthValue).end : endDate;
  const effectiveStart = useOverviewPeriod ? overviewRange.start : breakdownStart;
  const effectiveEnd = useOverviewPeriod ? overviewRange.end : breakdownEnd;
  const fetchOrderType = useOverviewPeriod ? "all" : orderType;
  const fetchPaymentType = useOverviewPeriod ? "all" : paymentType;

  const formatRangeLabel = (start, end) => {
    if (!start || !end) return "";
    const fmt = (d) => {
      const [yy, mm, dd] = d.split("-");
      return `${mm}/${dd}/${yy}`;
    };
    return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
  };

  const periodLabel = useMemo(() => {
    const showMonth =
      (useOverviewPeriod && chartPreset === "month") ||
      (!useOverviewPeriod && viewMode === "month");
    if (showMonth && monthValue) {
      const [y, m] = monthValue.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString(i18n.language, {
        month: "long",
        year: "numeric",
      });
    }
    if (effectiveStart && effectiveEnd) return formatRangeLabel(effectiveStart, effectiveEnd);
    return new Date().toLocaleDateString(i18n.language);
  }, [
    useOverviewPeriod,
    chartPreset,
    viewMode,
    monthValue,
    effectiveStart,
    effectiveEnd,
    i18n.language,
  ]);

  const handleDownloadPDF = () => {
    if (isDownloading || loading) return;
    setIsDownloading(true);
    try {
      buildSalesReportPdf({
        restaurantName: restaurantDisplayName,
        periodLabel,
        sales: displaySales,
        monthTableRows,
        monthColumnTotals: periodTotals,
        viewMode,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (id?.restaurant_id) {
      dispatch(fetchHours(id.restaurant_id));
    }
  }, [dispatch, id?.restaurant_id]);

  useEffect(() => {
    if (!id?.restaurant_id) return;
    dispatch(getMonthlyReportEmailSettingsThunk(id.restaurant_id))
      .then((settings) => {
        if (settings) {
          setEmailEnabled(!!settings.monthly_report_email_enabled);
          setEmailAddress(settings.monthly_report_email || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load monthly report email settings:", err);
      });
  }, [dispatch, id?.restaurant_id]);

  const handleSaveSettings = () => {
    if (!id?.restaurant_id) return;
    
    if (emailEnabled && (!emailAddress || !emailAddress.trim())) {
      setSettingsFeedback({
        type: "error",
        message: t("sales.invalid_email", { defaultValue: "Please enter a valid email address." }),
      });
      return;
    }

    setIsSavingSettings(true);
    setSettingsFeedback(null);

    dispatch(
      updateMonthlyReportEmailSettingsThunk(id.restaurant_id, {
        monthly_report_email_enabled: emailEnabled,
        monthly_report_email: emailAddress.trim(),
      })
    )
      .then(() => {
        setSettingsFeedback({
          type: "success",
          message: t("sales.save_success", { defaultValue: "Email report settings saved successfully." }),
        });
      })
      .catch((err) => {
        setSettingsFeedback({
          type: "error",
          message: err?.message || t("sales.save_failed", { defaultValue: "Failed to save settings." }),
        });
      })
      .finally(() => {
        setIsSavingSettings(false);
      });
  };

  const handleSendTestEmail = () => {
    if (!id?.restaurant_id || !emailAddress?.trim() || !sendReportMonth) return;

    setIsSendingTest(true);
    setSettingsFeedback(null);

    dispatch(sendMonthlyReportEmailThunk(id.restaurant_id, sendReportMonth, emailAddress.trim()))
      .then(() => {
        setSettingsFeedback({
          type: "success",
          message: t("sales.send_success", { defaultValue: "Monthly report sent successfully." }),
        });
      })
      .catch((err) => {
        setSettingsFeedback({
          type: "error",
          message: err?.message || t("sales.send_failed", { defaultValue: "Failed to send report." }),
        });
      })
      .finally(() => {
        setIsSendingTest(false);
      });
  };

  useEffect(() => {
    if (datesSyncedToRestaurant) return;
    if (restaurantTz) {
      const today = rangeEndingToday(1, restaurantTz);
      setStartDate(today.start);
      setEndDate(today.end);
      setViewMode("range");
      setChartPreset("month");
      setMonthValue(businessMonthValue(restaurantTz));
      setSendReportMonth(businessMonthValue(restaurantTz));
      setDatesSyncedToRestaurant(true);
      return;
    }
    const fallbackTimer = setTimeout(() => {
      setDatesSyncedToRestaurant(true);
    }, 150);
    return () => clearTimeout(fallbackTimer);
  }, [restaurantTz, datesSyncedToRestaurant]);

  useEffect(() => {
    if (!id?.restaurant_id || !datesSyncedToRestaurant || !effectiveStart || !effectiveEnd) return;

    const cacheKey = `${id.restaurant_id}:${effectiveStart}:${effectiveEnd}:${fetchOrderType}:${fetchPaymentType}`;
    const cached = salesMemoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < SALES_CACHE_TTL) {
      if (cached.salesDaily) {
        dispatch(getSalesDaily(cached.salesDaily));
        if (cached.salesDaily.summary) {
          dispatch(getSales(cached.salesDaily.summary));
        }
      }
      if (cached.topItems) {
        dispatch(getTopSellingItems(cached.topItems));
      }
      setPreviousSummary(cached.previousSummary || null);
      setPreviousDaily(cached.previousDaily || []);
      setLoading(false);
      setTopItemsLoading(false);
      setReportError("");
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setTopItemsLoading(true);
      setReportError("");

      const prev = previousRange(effectiveStart, effectiveEnd);

      Promise.allSettled([
        dispatch(
          getSalesDailyThunk(
            id.restaurant_id,
            effectiveStart,
            effectiveEnd,
            fetchOrderType,
            fetchPaymentType
          )
        ),
        dispatch(getTopSellingItemsThunk(id.restaurant_id, effectiveStart, effectiveEnd)),
        fetchSalesDailyLocal(
          id.restaurant_id,
          prev.start,
          prev.end,
          fetchOrderType,
          fetchPaymentType
        ),
      ]).then(([dailyRes, topItemsRes, prevRes]) => {
        if (isCancelled) return;

        const salesDailyData = dailyRes.status === "fulfilled" ? dailyRes.value : null;
        const topItemsData = topItemsRes.status === "fulfilled" ? topItemsRes.value : [];
        const prevData = prevRes.status === "fulfilled" ? prevRes.value : null;

        if (dailyRes.status === "rejected") {
          setReportError(dailyRes.reason?.message || "Failed to load sales report.");
        }

        const prevSummaryVal = prevData?.summary || null;
        const prevDailyVal = prevData?.daily || [];
        setPreviousSummary(prevSummaryVal);
        setPreviousDaily(prevDailyVal);
        setLoading(false);
        setTopItemsLoading(false);

        if (salesDailyData) {
          salesMemoryCache.set(cacheKey, {
            salesDaily: salesDailyData,
            topItems: topItemsData,
            previousSummary: prevSummaryVal,
            previousDaily: prevDailyVal,
            timestamp: Date.now(),
          });
        }
      });
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    dispatch,
    id?.restaurant_id,
    datesSyncedToRestaurant,
    effectiveStart,
    effectiveEnd,
    fetchOrderType,
    fetchPaymentType,
  ]);

  const orderTypeOptions = [
    { value: "all", label: t("sales.all") },
    { value: "pickup", label: t("sales.pickup") },
    { value: "delivery", label: t("sales.delivery") },
  ];

  const paymentOptions = [
    { value: "all", label: t("sales.all") },
    { value: "online", label: t("sales.online") },
    { value: "in-store", label: t("sales.in_store") },
  ];

  const viewModeOptions = [
    { value: "range", label: t("sales.date_range") },
    { value: "month", label: t("sales.by_month") },
  ];

  const chartPresetOptions = [
    { value: "month", label: t("sales.preset_month") },
    { value: "30d", label: t("sales.preset_1m") },
    { value: "90d", label: t("sales.preset_90d") },
    { value: "12m", label: t("sales.preset_12m") },
  ];

  const thisPeriodFooterLabel =
    chartPreset === "12m"
      ? t("sales.this_12_months")
      : chartPreset === "90d"
      ? t("sales.this_n_days", { count: 90 })
      : chartPreset === "30d"
      ? t("sales.this_n_days", { count: 30 })
      : t("sales.this_period");

  const previousPeriodFooterLabel =
    chartPreset === "12m"
      ? t("sales.vs_previous_12_months")
      : chartPreset === "90d"
      ? t("sales.vs_previous_n_days", { count: 90 })
      : chartPreset === "30d"
      ? t("sales.vs_previous_n_days", { count: 30 })
      : t("sales.vs_previous");

  const tabs = [
    {
      id: "overview",
      label: t("sales.tab_overview"),
      hint: t("sales.tab_overview_hint"),
      Icon: BarChart3,
    },
    {
      id: "breakdown",
      label: t("sales.tab_breakdown"),
      hint: t("sales.tab_breakdown_hint"),
      Icon: ClipboardList,
    },
    {
      id: "items",
      label: t("sales.tab_items"),
      hint: t("sales.tab_items_hint"),
      Icon: ShoppingBag,
    },
    {
      id: "email",
      label: t("sales.tab_email"),
      hint: t("sales.tab_email_hint"),
      Icon: Mail,
    },
  ];

  return (
    <div className="sr-page">
      <header className="sr-header">
        <div>
          <p className="sr-eyebrow">{restaurantDisplayName}</p>
          <h1>{t("sales.title")}</h1>
          <p>{periodLabel}</p>
        </div>
        <div className="sr-header-actions">
          <span className="sr-period-badge">{periodLabel}</span>
          <button
            type="button"
            className="sr-btn-primary"
            onClick={handleDownloadPDF}
            disabled={isDownloading || loading}
          >
            {isDownloading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                {t("sales.preparing_pdf")}
              </>
            ) : (
              t("sales.download_pdf")
            )}
          </button>
        </div>
      </header>

      <nav className="sr-tabs" role="tablist" aria-label={t("sales.title")}>
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`sr-tab-${tab.id}`}
              className={`sr-tab${active ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={active}
              aria-controls={`sr-panel-${tab.id}`}
            >
              <span className="sr-tab-icon">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="sr-tab-copy">
                <strong>{tab.label}</strong>
                <small>{tab.hint}</small>
              </span>
            </button>
          );
        })}
      </nav>

      {(activeTab === "breakdown" || activeTab === "items") && (
      <div className="sr-filters">
        <div className="sr-filters-card">
          <div className="sr-filters-grid">
            <div className="sr-field">
              <label>{t("sales.view_mode")}</label>
              <FilterPills
                options={viewModeOptions}
                value={viewMode}
                onChange={setViewMode}
              />
            </div>

            {viewMode === "month" ? (
              <div className="sr-field">
                <label>{t("sales.month")}</label>
                <input
                  type="month"
                  value={monthValue}
                  onChange={(e) => setMonthValue(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="sr-field">
                  <label>{t("dashboard.start_date")}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="sr-field">
                  <label>{t("dashboard.end_date")}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="sr-filters-grid" style={{ marginTop: 14 }}>
            <div className="sr-field">
              <label>{t("sales.order_type")}</label>
              <FilterPills options={orderTypeOptions} value={orderType} onChange={setOrderType} />
            </div>
            <div className="sr-field">
              <label>{t("sales.payment")}</label>
              <FilterPills options={paymentOptions} value={paymentType} onChange={setPaymentType} />
            </div>
            <div className="sr-field" style={{ display: "flex", alignItems: "flex-end" }}>
              <span className="sr-period-badge">{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {reportError && (
        <div className="alert alert-warning" role="alert">
          {reportError}
        </div>
      )}

      {activeTab === "email" && (
        <div className="sr-card" role="tabpanel" id="sr-panel-email" aria-labelledby="sr-tab-email">
          <div className="sr-card-header">
            <h2>{t("sales.email_report_settings")}</h2>
            <span>{t("sales.email_report_subtitle")}</span>
          </div>
          <div className="sr-card-body">
            <div className="sr-email-row">
              <div className="form-check custom-switch toggle-switch sr-email-toggle">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="monthlyReportEmailEnabled"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="monthlyReportEmailEnabled">
                  {t("sales.enable_email_report")}
                </label>
              </div>

              <div className="sr-email-input">
                <input
                  type="email"
                  className="form-control"
                  placeholder={t("sales.enter_email")}
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
                <button
                  type="button"
                  className="sr-btn-primary"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? t("sales.saving") : t("sales.save")}
                </button>
              </div>

              <div className="sr-email-send">
                <input
                  type="month"
                  className="form-control"
                  value={sendReportMonth}
                  onChange={(e) => setSendReportMonth(e.target.value)}
                  aria-label={t("sales.month")}
                />
                <button
                  type="button"
                  className="sr-btn-outline"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !emailAddress?.trim() || !sendReportMonth}
                >
                  {isSendingTest ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      {t("sales.sending")}
                    </>
                  ) : (
                    t("sales.send_now")
                  )}
                </button>
              </div>
            </div>

            {settingsFeedback && (
              <div
                className={`alert ${settingsFeedback.type === "success" ? "alert-success" : "alert-danger"}`}
                style={{ marginTop: "12px", marginBottom: 0 }}
              >
                {settingsFeedback.message}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== "email" && loading && !displaySales ? (
        <div className="sr-loading">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          {t("sales.refreshing", { defaultValue: "Loading report…" })}
        </div>
      ) : activeTab !== "email" ? (
        <>
          {activeTab === "overview" && (
            <div role="tabpanel" id="sr-panel-overview" aria-labelledby="sr-tab-overview">
          <div className="sr-kpi-grid">
            <div className="sr-kpi">
              <div className="sr-kpi-top">
                <div className="sr-kpi-label">{t("sales.total_sales")}</div>
                <ChangeBadge change={salesChange} />
              </div>
              <div className="sr-kpi-value">{fmtMoney(displaySales?.totalSales)}</div>
            </div>
            <div className="sr-kpi">
              <div className="sr-kpi-top">
                <div className="sr-kpi-label">{t("sales.total_net_received_online")}</div>
              </div>
              <div className="sr-kpi-value positive">{fmtMoney(displaySales?.totalNetReceivedOnlineOnly)}</div>
            </div>
            <div className="sr-kpi">
              <div className="sr-kpi-top">
                <div className="sr-kpi-label">{t("sales.total_orders")}</div>
                <ChangeBadge change={ordersChange} />
              </div>
              <div className="sr-kpi-value">{toCount(displaySales?.totalOrders)}</div>
            </div>
            <div className="sr-kpi">
              <div className="sr-kpi-top">
                <div className="sr-kpi-label">{t("sales.avg_order_value")}</div>
                <ChangeBadge change={aovChange} />
              </div>
              <div className="sr-kpi-value">{fmtMoney(aov)}</div>
            </div>
            <div className="sr-kpi">
              <div className="sr-kpi-label">{t("sales.refunded_amount")}</div>
              <div className="sr-kpi-value">{fmtMoney(displaySales?.totalRefundAmount)}</div>
            </div>
          </div>

          <div className="sr-chart-grid">
            <div className="sr-card sr-perf-card">
              <div className="sr-card-header">
                <div>
                  <h2>{t("sales.sales_performance")}</h2>
                </div>
                <FilterPills
                  options={chartPresetOptions}
                  value={chartPreset}
                  onChange={applyChartPreset}
                />
              </div>
              <div className="sr-card-body">
                {chartData.length ? (
                  <div className="sr-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(v) => `$${Number(v || 0).toFixed(0)}`}
                          width={48}
                        />
                        <Tooltip formatter={(v) => (v == null ? "—" : fmtMoney(v))} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="thisPeriod"
                          name={t("sales.this_period")}
                          stroke="#dd2f6e"
                          fill="#dd2f6e"
                          fillOpacity={0.14}
                          strokeWidth={2.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="previousPeriod"
                          name={t("sales.previous_period")}
                          stroke="#94a3b8"
                          fill="#94a3b8"
                          fillOpacity={0.05}
                          strokeWidth={2}
                          strokeDasharray="6 4"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="sr-empty">{t("sales.no_data")}</div>
                )}
                <div className="sr-chart-footer">
                  <div>
                    <div className="sr-chart-footer-label">{thisPeriodFooterLabel}</div>
                    <strong>{fmtMoney(displaySales?.totalSales)}</strong>
                  </div>
                  <div>
                    <div className="sr-chart-footer-label">{previousPeriodFooterLabel}</div>
                    <strong>{fmtMoney(previousSummary?.totalSales)}</strong>
                  </div>
                  <div>
                    <div className="sr-chart-footer-label">{t("sales.change")}</div>
                    <strong className={salesChange.delta >= 0 ? "positive" : "negative"}>
                      {salesChange.delta >= 0 ? "+" : ""}
                      {fmtMoney(salesChange.delta)}
                      {salesChange.percent != null ? (
                        <span className="sr-chart-pct">
                          {salesChange.percent >= 0 ? "+" : ""}
                          {salesChange.percent.toFixed(1)}%
                        </span>
                      ) : null}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="sr-card">
              <div className="sr-card-header">
                <h2>{t("sales.order_mix")}</h2>
                <span>
                  {t("sales.pickup")} / {t("sales.delivery")}
                </span>
              </div>
              <div className="sr-card-body">
                {mix.total > 0 ? (
                  <div className="sr-donut-wrap">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={mixData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={84}
                          paddingAngle={2}
                        >
                          {mixData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => toCount(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="sr-donut-center">
                      <span>{t("sales.orders")}</span>
                      <strong>{mix.total}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="sr-empty">{t("sales.no_data")}</div>
                )}
              </div>
            </div>
          </div>
            </div>
          )}

          {activeTab === "breakdown" && (
            <div role="tabpanel" id="sr-panel-breakdown" aria-labelledby="sr-tab-breakdown">
          <div className="sr-card">
            <div className="sr-card-header">
              <h2>{t("sales.payout_breakdown")}</h2>
              <span>{periodLabel}</span>
            </div>
            <div className="sr-card-body">
              <div className="sr-overview-grid">
                <div>
                  <h3 style={{ margin: "0 0 10px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>
                    {t("sales.order_summary")}
                  </h3>
                  <MetricList
                    rows={[
                      [t("sales.total_orders"), displaySales?.totalOrders, { count: true }],
                      [t("sales.pickup_orders"), displaySales?.pickupOrders, { count: true }],
                      [t("sales.delivery_orders"), displaySales?.deliveryOrders, { count: true }],
                      [t("sales.deleted_orders"), displaySales?.totalDeletedOrders, { count: true }],
                    ]}
                  />
                </div>
                <div>
                  <MetricList
                    rows={[
                      [t("sales.subtotal"), displaySales?.subtotal],
                      [t("sales.total_tax"), displaySales?.totalTax],
                      [t("sales.gross_sales"), displaySales?.grossSales],
                      [t("sales.delivery_fee_restaurant"), displaySales?.restaurantDeliveryFee ?? displaySales?.totalDeliveryFee ?? 0],
                      [t("sales.discount"), displaySales?.totalDiscount],
                      [t("sales.total_tips_all"), displaySales?.totalTipsAll ?? displaySales?.totalTips ?? 0],
                      [t("sales.total_sales"), displaySales?.totalSales, { strong: true }],
                      [t("sales.refunded_amount"), displaySales?.totalRefundAmount],
                      [t("sales.processing_chg"), displaySales?.totalProcessingCharge],
                      [t("sales.cc_charge"), displaySales?.totalCreditCardCharge],
                      [t("sales.total_net_received_online"), displaySales?.totalNetReceivedOnlineOnly, { highlight: true }],
                    ]}
                  />
                </div>
                <div className="sr-separate-panel">
                  <h3>{t("sales.separate_charges")}</h3>
                  <MetricList
                    rows={[
                      [t("sales.doordash_fee"), displaySales?.doordashDeliveryFee ?? 0],
                      [t("sales.doordash_tips"), displaySales?.doordashDeliveryTips ?? 0],
                      [t("sales.commission_fee"), displaySales?.totalCommissionFee],
                      [t("sales.service_fee"), displaySales?.totalServiceFee],
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {viewMode === "month" && monthTableRows.length > 0 && (
            <>
              <div className="sr-card">
                <div className="sr-card-header">
                  <h2>{t("sales.daily_breakdown")}</h2>
                  <span>{t("sales.month_total")}</span>
                </div>
                <div className="sr-card-body" style={{ paddingTop: 8 }}>
                  <div className="sr-table-wrap">
                    <table className="sr-table">
                      <thead>
                        <tr>
                          <th>{t("sales.date")}</th>
                          <th className="num">{t("sales.total_sales")}</th>
                          <th className="num">{t("sales.subtotal")}</th>
                          <th className="num">{t("sales.total_tax")}</th>
                          <th className="num">{t("sales.gross_sales")}</th>
                          <th className="num">{t("sales.delivery_fee_restaurant")}</th>
                          <th className="num">{t("sales.discount")}</th>
                          <th className="num">{t("sales.processing_chg")}</th>
                          <th className="num">{t("sales.cc_charge")}</th>
                          <th className="num">{t("sales.total_net_received_online")}</th>
                          <th className="num">{t("sales.refunded")}</th>
                          <th className="num">{t("sales.orders")}</th>
                          <th className="num">{t("sales.pickup")}</th>
                          <th className="num">{t("sales.delivery")}</th>
                          <th className="num">{t("sales.deleted")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthTableRows.map((row) => (
                          <tr key={row.date}>
                            <td>{row.dateLabel}</td>
                            <td className="num strong">{fmtMoney(row.totalSales)}</td>
                            <td className="num">{fmtMoney(row.subtotal)}</td>
                            <td className="num">{fmtMoney(row.totalTax)}</td>
                            <td className="num">{fmtMoney(row.grossSales)}</td>
                            <td className="num">{fmtMoney(row.restaurantDeliveryFee)}</td>
                            <td className="num">{fmtMoney(row.totalDiscount)}</td>
                            <td className="num">{fmtMoney(row.totalProcessingCharge)}</td>
                            <td className="num">{fmtMoney(row.totalCreditCardCharge)}</td>
                            <td className="num strong">{fmtMoney(row.totalNetReceivedOnlineOnly)}</td>
                            <td className="num">{fmtMoney(row.totalRefundAmount)}</td>
                            <td className="num">{toCount(row.totalOrders)}</td>
                            <td className="num">{toCount(row.pickupOrders)}</td>
                            <td className="num">{toCount(row.deliveryOrders)}</td>
                            <td className="num">{toCount(row.totalDeletedOrders)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>{t("sales.month_total")}</td>
                          <td className="num strong">{fmtMoney(periodTotals.totalSales)}</td>
                          <td className="num">{fmtMoney(periodTotals.subtotal)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalTax)}</td>
                          <td className="num">{fmtMoney(periodTotals.grossSales)}</td>
                          <td className="num">{fmtMoney(periodTotals.restaurantDeliveryFee)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalDiscount)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalProcessingCharge)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalCreditCardCharge)}</td>
                          <td className="num strong">{fmtMoney(periodTotals.totalNetReceivedOnlineOnly)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalRefundAmount)}</td>
                          <td className="num">{toCount(periodTotals.totalOrders)}</td>
                          <td className="num">{toCount(periodTotals.pickupOrders)}</td>
                          <td className="num">{toCount(periodTotals.deliveryOrders)}</td>
                          <td className="num">{toCount(periodTotals.totalDeletedOrders)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="sr-card">
                <div className="sr-card-header">
                  <h2>{t("sales.daily_separate_charges")}</h2>
                </div>
                <div className="sr-card-body" style={{ paddingTop: 8 }}>
                  <div className="sr-table-wrap">
                    <table className="sr-table separate">
                      <thead>
                        <tr>
                          <th>{t("sales.date")}</th>
                          <th className="num">{t("sales.doordash_fee")}</th>
                          <th className="num">{t("sales.doordash_tips")}</th>
                          <th className="num">{t("sales.commission_fee")}</th>
                          <th className="num">{t("sales.service_fee")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthTableRows.map((row) => (
                          <tr key={`sep-${row.date}`}>
                            <td>{row.dateLabel}</td>
                            <td className="num">{fmtMoney(row.doordashDeliveryFee)}</td>
                            <td className="num">{fmtMoney(row.doordashDeliveryTips)}</td>
                            <td className="num">{fmtMoney(row.totalCommissionFee)}</td>
                            <td className="num">{fmtMoney(row.totalServiceFee)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>{t("sales.month_total")}</td>
                          <td className="num">{fmtMoney(periodTotals.doordashDeliveryFee)}</td>
                          <td className="num">{fmtMoney(periodTotals.doordashDeliveryTips)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalCommissionFee)}</td>
                          <td className="num">{fmtMoney(periodTotals.totalServiceFee)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
            </div>
          )}

          {activeTab === "items" && (
            <div role="tabpanel" id="sr-panel-items" aria-labelledby="sr-tab-items">
          <div className="sr-card sr-top-items">
            <div className="sr-card-header">
              <div>
                <h2>{t("sales.top_selling_items")}</h2>
                <span>{t("sales.top_10")}</span>
              </div>
              {topItemsLoading && (
                <span>{t("sales.refreshing", { defaultValue: "Loading report..." })}</span>
              )}
            </div>
            <div className="sr-card-body">
              {topTenItems.length ? (
                <div className="sr-top-grid">
                  <div className="sr-top-chart">
                    <ResponsiveContainer width="100%" height={Math.max(220, topTenItems.length * 36)}>
                      <BarChart
                        data={[...topTenItems].reverse()}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                      >
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={110}
                          tick={{ fill: "#334155", fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(v, name) =>
                            name === t("sales.qty_sold") ? toCount(v) : fmtMoney(v)
                          }
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                        />
                        <Bar
                          dataKey="quantity"
                          name={t("sales.qty_sold")}
                          fill="#dd2f6e"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ol className="sr-rank-list">
                    {topTenItems.map((item, index) => (
                      <li key={item.id || index} className="sr-rank-row">
                        <span className={`sr-rank-num${index < 3 ? " top" : ""}`}>
                          {index + 1}
                        </span>
                        <div className="sr-rank-main">
                          <div className="sr-rank-meta">
                            <strong>{item.fullName}</strong>
                            <span>
                              {fmtMoney(item.price)} · {fmtMoney(item.revenue)}
                            </span>
                          </div>
                          <div className="sr-rank-bar" aria-hidden="true">
                            <span style={{ width: `${Math.max(item.bar, item.quantity > 0 ? 4 : 0)}%` }} />
                          </div>
                        </div>
                        <div className="sr-rank-qty">
                          <strong>{item.quantity}</strong>
                          <span>{t("sales.qty_sold")}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="sr-empty">{t("sales.no_data")}</div>
              )}
            </div>
          </div>
            </div>
          )}

        </>
      ) : null}
    </div>
  );
};

export default SalesReport;
