import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Coins,
  Gift,
  Megaphone,
  MessageSquare,
  PartyPopper,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
import { getToken } from "../../../store/utlits";
import { useOverviewDateRange } from "../../../context/OverviewDateRangeContext";
import "./OverviewDashboard.css";

function defaultGrowthRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  const iso = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return { start: iso(start), end: iso(end) };
}

const SMS_CAMPAIGN_ACTIONS = [
  {
    key: "promotion",
    label: "Run Promotion SMS",
    icon: Megaphone,
    prompt:
      "Run a limited-time promotion SMS encouraging customers to order soon with a clear offer.",
  },
  {
    key: "holiday",
    label: "Holiday SMS",
    icon: PartyPopper,
    prompt:
      "Send a warm holiday greeting SMS with a special seasonal offer for our customers.",
  },
  {
    key: "new_item",
    label: "New Item SMS",
    icon: UtensilsCrossed,
    prompt:
      "Announce a new menu item to our customers and invite them to try it.",
  },
];

function formatResetDate(isoDate) {
  if (!isoDate) return "—";
  const parts = String(isoDate).split("-");
  if (parts.length !== 3) return isoDate;
  const month = MONTHS_SHORT[Number(parts[1]) - 1] || parts[1];
  return `${month} ${Number(parts[2])}`;
}

const PRIMARY = "#dd2f6e";
const PREV_ORANGE = "#f97316";
const ORDERS_BLUE = "#2563eb";
const PERIODS = ["Month", "3M", "12M", "Lifetime"];

const PERIOD_COPY = {
  Month: { thisLabel: "This Month", prevLabel: "VS Previous Month" },
  "3M": { thisLabel: "This 3 Months", prevLabel: "VS Previous 3 Months" },
  "12M": { thisLabel: "This 12 Months", prevLabel: "VS Previous 12 Months" },
  Lifetime: { thisLabel: "Lifetime", prevLabel: "VS Prior Window" },
  "30D": { thisLabel: "This 30 Days", prevLabel: "VS Previous 30 Days" },
  custom: { thisLabel: "This Period", prevLabel: "VS Previous Period" },
};

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatChartLabel(isoDate) {
  const parts = String(isoDate || "").split("-");
  if (parts.length === 2) {
    const month = MONTHS_SHORT[Number(parts[1]) - 1] || parts[1];
    return `${month} ${parts[0].slice(2)}`;
  }
  if (parts.length !== 3) return isoDate;
  const month = MONTHS_SHORT[Number(parts[1]) - 1] || parts[1];
  return `${month} ${Number(parts[2])}`;
}

function formatMonthLabel(ym) {
  const parts = String(ym || "").split("-");
  if (parts.length < 2) return ym;
  const month = MONTHS_SHORT[Number(parts[1]) - 1] || parts[1];
  return `${month} ${parts[0].slice(2)}`;
}

/** Aggregate daily sales series into calendar months for growth charts. */
function aggregateSalesByMonth(series) {
  const byMonth = new Map();
  for (const row of series || []) {
    const key = String(row.date || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) continue;
    const cur = byMonth.get(key) || {
      date: key,
      thisPeriod: 0,
      previousPeriod: 0,
      orders: 0,
      previousOrders: 0,
    };
    cur.thisPeriod += Number(row.thisPeriod) || 0;
    cur.previousPeriod += Number(row.previousPeriod) || 0;
    cur.orders += Number(row.orders) || 0;
    cur.previousOrders += Number(row.previousOrders) || 0;
    byMonth.set(key, cur);
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      label: formatMonthLabel(row.date),
    }));
}

function formatSignedMoney(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (n > 0) return `+$${abs}`;
  if (n < 0) return `-$${abs}`;
  return `$${abs}`;
}

const KPI_THEMES = {
  teal: {
    color: "#2d9c8e",
    sparkId: "kpiTeal",
    icon: CalendarDays,
  },
  blue: {
    color: "#3b82f6",
    sparkId: "kpiBlue",
    icon: TrendingUp,
  },
  purple: {
    color: "#8b5cf6",
    sparkId: "kpiPurple",
    icon: Share2,
  },
  orange: {
    color: "#f97316",
    sparkId: "kpiOrange",
    icon: UserRound,
  },
};

const fmtMoney = (value) =>
  `$${(Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtMoneyExact = (value) =>
  `$${(Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtNum = (value) =>
  Math.round(Number(value) || 0).toLocaleString();

function formatPct(pct) {
  if (pct == null || Number.isNaN(Number(pct))) return null;
  const n = Number(pct);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function ChangeBadge({ pct }) {
  const label = formatPct(pct);
  if (!label) return <span className="ov-change muted">—</span>;
  const cls = Number(pct) >= 0 ? "up" : "down";
  return <span className={`ov-change ${cls}`}>{label}</span>;
}

function ImpactTrend({ pct, periodLabel = null, lifetime = false }) {
  if (lifetime) {
    return <span className="ov-impact-trend muted">Lifetime</span>;
  }
  const n = pct == null || Number.isNaN(Number(pct)) ? null : Number(pct);
  if (n == null) return <span className="ov-impact-trend muted">—</span>;
  const up = n >= 0;
  return (
    <span className={`ov-impact-trend${up ? " up" : " down"}`}>
      {up ? "↑" : "↓"} {Math.abs(n).toFixed(1)}%
      {periodLabel ? (
        <span className="ov-impact-period"> ({periodLabel})</span>
      ) : null}
    </span>
  );
}

function ImpactMiniCard({ theme, label, value, changePct, icon, lifetime = false }) {
  return (
    <div className={`ov-impact-mini ov-impact-mini-${theme}`}>
      <span className="ov-impact-mini-icon" aria-hidden>
        {icon}
      </span>
      <div className="ov-impact-mini-value">{value}</div>
      <ImpactTrend pct={changePct} lifetime={lifetime} />
      <div className="ov-impact-mini-label">{label}</div>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`ov-skel ${className}`} aria-hidden />;
}

function KpiSkeleton() {
  return (
    <article className="ov-kpi ov-kpi-skel">
      <div className="ov-kpi-top">
        <SkeletonBlock className="ov-skel-line ov-skel-w40" />
        <SkeletonBlock className="ov-skel-icon" />
      </div>
      <SkeletonBlock className="ov-skel-line ov-skel-value" />
      <div className="ov-kpi-bottom">
        <SkeletonBlock className="ov-skel-line ov-skel-w50" />
        <SkeletonBlock className="ov-skel-spark" />
      </div>
    </article>
  );
}

function SalesSkeleton() {
  return (
    <div className="ov-sales-skel">
      <div className="ov-sales-summary">
        <SkeletonBlock className="ov-skel-summary" />
        <SkeletonBlock className="ov-skel-summary" />
        <SkeletonBlock className="ov-skel-summary" />
      </div>
      <SkeletonBlock className="ov-skel-chart" />
    </div>
  );
}

function CardSkeleton({ lines = 4 }) {
  return (
    <div className="ov-card-skel">
      <SkeletonBlock className="ov-skel-line ov-skel-w40" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="ov-skel-line" />
      ))}
    </div>
  );
}

function GrowthStat({ label, pct }) {
  const n = pct == null || Number.isNaN(Number(pct)) ? null : Number(pct);
  const up = n != null && n >= 0;
  return (
    <div className="ov-growth-stat">
      <span className="ov-growth-stat-label">{label} :</span>
      <span className={`ov-growth-stat-value${n == null ? "" : up ? " up" : " down"}`}>
        {n == null ? "—" : `${up ? "↑" : "↓"} ${Math.abs(n).toFixed(1)}%`}
      </span>
    </div>
  );
}

function GrowthRocket() {
  return (
    <svg
      className="ov-growth-rocket"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* exhaust cloud */}
      <ellipse cx="60" cy="108" rx="28" ry="8" fill="#f9a8d4" opacity="0.45" />
      <ellipse cx="48" cy="104" rx="14" ry="6" fill="#fda4af" opacity="0.4" />
      <ellipse cx="72" cy="104" rx="12" ry="5" fill="#fb7185" opacity="0.35" />
      {/* flame outer */}
      <path
        d="M52 78c0 10 4 18 8 22 4-4 8-12 8-22-5 2-11 2-16 0z"
        fill="#fb923c"
      />
      {/* flame inner */}
      <path
        d="M56 80c0 7 2.5 12.5 4 15.5 1.5-3 4-8.5 4-15.5-2.5 1-5.5 1-8 0z"
        fill="#fde68a"
      />
      {/* left fin */}
      <path
        d="M44 64L26 86l20-8 2-12-4-2z"
        fill="#be185d"
      />
      <path d="M44 66l-12 14 14-6v-8z" fill="#f472b6" />
      {/* right fin */}
      <path
        d="M76 64l18 22-20-8-2-12 4-2z"
        fill="#be185d"
      />
      <path d="M76 66l12 14-14-6v-8z" fill="#f472b6" />
      {/* body */}
      <path
        d="M48 70c0-22 4-42 12-58 8 16 12 36 12 58-4 4-16 4-24 0z"
        fill="#ffffff"
        stroke="#f9a8d4"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* body stripe */}
      <path
        d="M50.5 66c1-18 3.5-34 9.5-48 6 14 8.5 30 9.5 48-3.5 2.5-12.5 2.5-19 0z"
        fill="#fce7f3"
      />
      {/* nose cone */}
      <path
        d="M60 12c6 8 9.5 18 11.5 28H48.5C50.5 30 54 20 60 12z"
        fill="#dd2f6e"
      />
      <path
        d="M60 12c3.5 5 6 12 7.5 18H52.5C54 24 56.5 17 60 12z"
        fill="#f472b6"
      />
      {/* window ring */}
      <circle cx="60" cy="48" r="9" fill="#9d174d" />
      <circle cx="60" cy="48" r="6.5" fill="#38bdf8" />
      <circle cx="57.5" cy="45.5" r="2.2" fill="#fff" opacity="0.85" />
      {/* mid band */}
      <rect x="49" y="62" width="22" height="5" rx="1.5" fill="#dd2f6e" />
      {/* sparkles */}
      <circle cx="88" cy="28" r="2" fill="#fbbf24" />
      <circle cx="96" cy="40" r="1.4" fill="#fcd34d" />
      <circle cx="24" cy="36" r="1.5" fill="#fbbf24" />
    </svg>
  );
}

function Sparkline({ data, color = PRIMARY, gradientId = "kpiSpark" }) {
  const chartData = (data || []).map((v, i) => ({ i, v: Number(v) || 0 }));
  if (chartData.length < 2) {
    return <div className="ov-spark empty" />;
  }
  return (
    <div className="ov-spark">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  label,
  value,
  changePct,
  sparkline,
  format = "money",
  theme = "teal",
  periodLabel = null,
}) {
  const themeCfg = KPI_THEMES[theme] || KPI_THEMES.teal;
  const Icon = themeCfg.icon;
  const display =
    format === "money"
      ? fmtMoneyExact(value)
      : format === "aov"
        ? fmtMoneyExact(value)
        : fmtNum(value);
  const n = changePct == null || Number.isNaN(Number(changePct)) ? null : Number(changePct);
  const up = n != null && n >= 0;

  return (
    <article className={`ov-kpi ov-kpi-${theme}`}>
      <div className="ov-kpi-top">
        <span className="ov-kpi-label">{label}</span>
        <div className="ov-kpi-icon-wrap" aria-hidden>
          <div className="ov-kpi-icon">
            <Icon size={18} strokeWidth={2.25} />
          </div>
          <span className="ov-kpi-icon-glass" />
        </div>
      </div>
      <div className="ov-kpi-value" style={{ color: themeCfg.color }}>
        {display}
      </div>
      <div className="ov-kpi-bottom">
        <div className={`ov-kpi-change${n == null ? " muted" : up ? " up" : " down"}`}>
          {n == null ? (
            <span>—</span>
          ) : (
            <span>
              {up ? "↑" : "↓"} {Math.abs(n).toFixed(1)}%
            </span>
          )}
          {periodLabel ? (
            <span className="ov-kpi-period-tag">({periodLabel})</span>
          ) : null}
        </div>
        <Sparkline
          data={sparkline}
          color={themeCfg.color}
          gradientId={themeCfg.sparkId}
        />
      </div>
    </article>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const user = useSelector((s) => s.session.user);
  const restaurant = useSelector((s) => s.restaurant.restaurant);
  const { start, end, preset, setPreset } = useOverviewDateRange();
  const [data, setData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialGrowth = useMemo(() => defaultGrowthRange(), []);
  const [growthStart, setGrowthStart] = useState(initialGrowth.start);
  const [growthEnd, setGrowthEnd] = useState(initialGrowth.end);
  const [growth, setGrowth] = useState({});

  const restaurantId = user?.restaurant_id;
  const displayName =
    restaurant?.name || data?.restaurantName || t("header.dashboard", "Dashboard");
  const periodCopy = PERIOD_COPY[preset] || PERIOD_COPY.custom;
  const filterPeriodLabel = useMemo(() => {
    if (!growthStart || !growthEnd) return null;
    const a = String(growthStart).slice(5).replace("-", "/");
    const b = String(growthEnd).slice(5).replace("-", "/");
    return `${a}–${b}`;
  }, [growthStart, growthEnd]);

  // KPI cards + growth banner — both driven by Time Filtering
  useEffect(() => {
    let cancelled = false;
    async function loadFiltered() {
      if (!restaurantId || !growthStart || !growthEnd) return;
      setKpiLoading(true);
      setGrowthLoading(true);
      try {
        const token = getToken();
        const params = new URLSearchParams({
          start: growthStart,
          end: growthEnd,
          restaurantId: String(restaurantId),
        });
        const res = await fetch(`/api/restaurants/overview?${params}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load overview");
        const json = await res.json();
        if (!cancelled) {
          setKpiData(json);
          setGrowth(json.growthBanner || {});
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Error");
      } finally {
        if (!cancelled) {
          setKpiLoading(false);
          setGrowthLoading(false);
        }
      }
    }
    loadFiltered();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, growthStart, growthEnd]);

  // Sales chart / marketing / bottom cards — Sales Performance period toggles
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!restaurantId) return;
      setSalesLoading(true);
      setError(null);
      try {
        const token = getToken();
        const params = new URLSearchParams({
          start,
          end,
          restaurantId: String(restaurantId),
        });
        const res = await fetch(`/api/restaurants/overview?${params}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load overview");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message || "Error");
      } finally {
        if (!cancelled) setSalesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, start, end]);

  const salesSeries = useMemo(() => {
    const raw = (data?.salesSeries || []).map((row) => ({
      ...row,
      label: formatChartLabel(row.date),
    }));
    if (preset === "12M" || preset === "Lifetime" || preset === "3M") {
      return aggregateSalesByMonth(raw);
    }
    return raw;
  }, [data, preset]);

  const ordersGmv = data?.ordersGmv || {};
  const ordersGmvSeries = useMemo(() => {
    return (ordersGmv.lifetime?.series || []).map((row) => ({
      ...row,
      label: formatMonthLabel(row.month),
    }));
  }, [ordersGmv]);
  const ordersGmvChartWidth = Math.max(
    420,
    (ordersGmvSeries.length || 0) * 56
  );
  const donutData = useMemo(() => {
    const segs = data?.customers?.segments || [];
    const active = segs.filter((s) => s.count > 0);
    if (active.length > 0) return active;
    return [{ key: "empty", label: "Empty", count: 1, color: "#e8edf3" }];
  }, [data]);
  const hasCustomerSegments = (data?.customers?.segments || []).some(
    (s) => s.count > 0
  );

  const kpis = kpiData?.kpis || {};
  const impact = data?.impact || {};
  const sms = data?.smsCampaign || {};

  const salesPct = growth.salesPct;
  const ordersPct = growth.ordersPct;
  const customersPct = growth.customersPct;
  const isDeclining =
    [salesPct, ordersPct, customersPct].filter(
      (p) => p != null && !Number.isNaN(Number(p)) && Number(p) < 0
    ).length >= 2 ||
    (salesPct != null && Number(salesPct) < 0);

  return (
    <div className="ov-page">
      <div className="ov-welcome-row">
        <div className="ov-welcome">
          <h1>
            {t("overview.welcome", "Welcome back")},{" "}
            <span className="ov-brand">{displayName}</span>
          </h1>
          <p className="ov-welcome-sub">
            {t(
              "overview.welcome_sub",
              "Track growth in sales, orders, and customers — all trending up."
            )}
          </p>
        </div>

        <div className="ov-time-filtering">
          <span className="ov-time-label">
            {t("overview.time_filtering", "Time Filtering")}:
          </span>
          <label className="ov-time-box">
            <input
              type="date"
              value={growthStart}
              max={growthEnd}
              onChange={(e) => setGrowthStart(e.target.value)}
              aria-label="Growth start date"
            />
            <span className="ov-time-sep">—</span>
            <input
              type="date"
              value={growthEnd}
              min={growthStart}
              onChange={(e) => setGrowthEnd(e.target.value)}
              aria-label="Growth end date"
            />
            <CalendarDays size={16} className="ov-time-cal" aria-hidden />
          </label>
        </div>
      </div>

      {growthLoading ? (
        <SkeletonBlock className="ov-skel-banner" />
      ) : (
      <div className={`ov-growth-banner${isDeclining ? " declining" : ""}`}>
        <div className="ov-growth-bg" aria-hidden>
          <span className="ov-growth-blob ov-growth-blob-a" />
          <span className="ov-growth-blob ov-growth-blob-b" />
          <span className="ov-growth-blob ov-growth-blob-c" />
          <span className="ov-growth-waves" />
        </div>

        <div className="ov-growth-main">
          <div className="ov-growth-copy">
            <strong>
              {isDeclining
                ? t("overview.growth_down_title", "Let’s Win Them Back")
                : t("overview.growth_title", "Amazing Growth!")}
            </strong>
            <span>
              {isDeclining
                ? t(
                    "overview.growth_down_sub",
                    "Performance dipped this period — reach out to customers."
                  )
                : t(
                    "overview.growth_sub",
                    "Your business is performing great!"
                  )}
            </span>
          </div>

          <div className="ov-growth-stats">
            <GrowthStat
              label={t("overview.growth_sales", "Sales")}
              pct={salesPct}
            />
            <GrowthStat
              label={t("overview.growth_orders", "Orders")}
              pct={ordersPct}
            />
            <GrowthStat
              label={t("overview.growth_customers", "Customers")}
              pct={customersPct}
            />
          </div>

          {isDeclining && (
            <button type="button" className="ov-winback-btn">
              {t("overview.win_back", "Win Back")}
            </button>
          )}
        </div>

        <div className="ov-growth-art">
          <GrowthRocket />
        </div>
      </div>
      )}

      {error && <div className="ov-error">{error}</div>}

      <div className="ov-kpi-grid">
        {kpiLoading
          ? [0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)
          : (
            <>
        <KpiCard
          label={t("overview.kpi_online_sales", "Online Sales")}
          value={kpis.onlineSales?.value}
          changePct={kpis.onlineSales?.changePct}
          sparkline={kpis.onlineSales?.sparkline}
          format="money"
          theme="teal"
          periodLabel={filterPeriodLabel}
        />
        <KpiCard
          label={t("overview.kpi_orders", "Orders")}
          value={kpis.orders?.value}
          changePct={kpis.orders?.changePct}
          sparkline={kpis.orders?.sparkline}
          format="number"
          theme="blue"
          periodLabel={filterPeriodLabel}
        />
        <KpiCard
          label={t("overview.kpi_aov", "Avg. Order Value")}
          value={kpis.aov?.value}
          changePct={kpis.aov?.changePct}
          sparkline={kpis.aov?.sparkline}
          format="aov"
          theme="purple"
          periodLabel={filterPeriodLabel}
        />
        <KpiCard
          label={t("overview.kpi_returning", "Returning Customers")}
          value={kpis.returningCustomers?.value}
          changePct={kpis.returningCustomers?.changePct}
          sparkline={kpis.returningCustomers?.sparkline}
          format="number"
          theme="orange"
          periodLabel={filterPeriodLabel}
        />
            </>
          )}
      </div>

      <div className="ov-mid-row">
        <section className="ov-card ov-sales">
          <div className="ov-card-head ov-sales-head">
            <h2>{t("overview.sales_performance", "Sales Growth")}</h2>
            <div className="ov-period-toggles" role="group">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`ov-period${preset === p ? " active" : ""}`}
                  onClick={() => setPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {salesLoading ? (
            <SalesSkeleton />
          ) : (
            <>
              <div className="ov-sales-summary">
                <div className="ov-sales-metric">
                  <strong>{fmtMoney(data?.salesCompare?.thisTotal)}</strong>
                  <span>{periodCopy.thisLabel}</span>
                </div>
                <div className="ov-sales-metric">
                  <strong>{fmtMoney(data?.salesCompare?.previousTotal)}</strong>
                  <span>{periodCopy.prevLabel}</span>
                </div>
                <div className="ov-sales-metric">
                  <strong className="ov-sales-change-row">
                    <span
                      className={
                        Number(data?.salesCompare?.delta) >= 0 ? "up" : "down"
                      }
                    >
                      {formatSignedMoney(data?.salesCompare?.delta)}
                    </span>
                    <span
                      className={`ov-sales-pct${
                        Number(data?.salesCompare?.changePct) >= 0 ? " up" : " down"
                      }`}
                    >
                      {Number(data?.salesCompare?.changePct) >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(Number(data?.salesCompare?.changePct) || 0).toFixed(1)}%
                    </span>
                  </strong>
                  <span>{t("overview.change", "Change")}</span>
                </div>
              </div>

              <div className="ov-chart-wrap ov-chart-sales">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesSeries}
                    margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ovSalesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e8edf3"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={28}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => {
                        const n = Number(v || 0);
                        if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 2)}K`;
                        return `$${n.toFixed(0)}`;
                      }}
                    />
                    <Tooltip
                      formatter={(v, name) => [
                        fmtMoneyExact(v),
                        name === "thisPeriod" ? "This Period" : "Previous Period",
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="plainline"
                      wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                      formatter={(value) =>
                        value === "thisPeriod" ? "This Period" : "Previous Period"
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="previousPeriod"
                      name="previousPeriod"
                      stroke={PREV_ORANGE}
                      strokeWidth={2}
                      fill="transparent"
                      strokeDasharray="6 4"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="thisPeriod"
                      name="thisPeriod"
                      stroke={PRIMARY}
                      strokeWidth={2.5}
                      fill="url(#ovSalesFill)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </section>

        <section className="ov-card ov-views">
          <div className="ov-card-head ov-og-head">
            <div>
              <h2>{t("overview.orders_gmv", "Orders & GMV")}</h2>
              <p className="ov-card-sub">
                {t("overview.orders_gmv_life_sub", "Lifetime · Monthly trend")}
              </p>
            </div>
            {!salesLoading && (
              <div className="ov-og-summary">
                <div className="ov-sales-metric ov-og-metric-orders">
                  <strong>{fmtNum(ordersGmv.lifetime?.orders)}</strong>
                  <span className="ov-og-metric-label">
                    {t("overview.orders", "Orders")}
                  </span>
                  <span className="ov-og-delta up">
                    ↑{" "}
                    {Math.abs(Number(ordersGmv.lifetime?.ordersChangePct) || 0).toFixed(1)}%
                    <em>
                      {t(
                        "overview.vs_start",
                        ordersGmv.lifetime?.ordersVsLabel || "vs start"
                      )}
                    </em>
                  </span>
                </div>
                <div className="ov-sales-metric ov-og-metric-gmv">
                  <strong>{fmtMoney(ordersGmv.lifetime?.gmv)}</strong>
                  <span className="ov-og-metric-label">
                    {t("overview.gmv", "GMV")}
                  </span>
                  <span className="ov-og-delta up">
                    ↑{" "}
                    {Math.abs(Number(ordersGmv.lifetime?.gmvChangePct) || 0).toFixed(1)}%
                    <em>
                      {t(
                        "overview.vs_start",
                        ordersGmv.lifetime?.gmvVsLabel || "vs start"
                      )}
                    </em>
                  </span>
                </div>
              </div>
            )}
          </div>
          {salesLoading ? (
            <CardSkeleton lines={5} />
          ) : (
            <div className="ov-chart-wrap ov-chart-views ov-chart-scroll">
              <div
                className="ov-chart-scroll-inner"
                style={{ minWidth: ordersGmvChartWidth }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={ordersGmvSeries}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ovGmvFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
                        <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="ovOrdersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ORDERS_BLUE} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={ORDERS_BLUE} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e8edf3"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      yAxisId="gmv"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => {
                        const n = Number(v || 0);
                        if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
                        return `$${n.toFixed(0)}`;
                      }}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      formatter={(v, name) => [
                        name === "gmv" ? fmtMoneyExact(v) : fmtNum(v),
                        name === "gmv" ? "GMV" : "Orders",
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
                      formatter={(value) => (value === "gmv" ? "GMV" : "Orders")}
                    />
                    <Area
                      yAxisId="gmv"
                      type="monotone"
                      dataKey="gmv"
                      name="gmv"
                      stroke={PRIMARY}
                      strokeWidth={2.5}
                      fill="url(#ovGmvFill)"
                      dot={{ r: 3.5, strokeWidth: 1.5, fill: "#fff", stroke: PRIMARY }}
                      activeDot={{ r: 5 }}
                    />
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orders"
                      name="orders"
                      stroke={ORDERS_BLUE}
                      strokeWidth={2}
                      fill="url(#ovOrdersFill)"
                      dot={{ r: 3.5, strokeWidth: 1.5, fill: "#fff", stroke: ORDERS_BLUE }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="ov-bottom-row">
        <section className="ov-card ov-impact">
          <h2>{t("overview.impact", "OwnMenu Impact")}</h2>
          {salesLoading ? (
            <CardSkeleton lines={8} />
          ) : (
            <>
              <div className="ov-impact-grid">
                <ImpactMiniCard
                  theme="green"
                  label={t("overview.impact_sales", "Online Sales Generated")}
                  value={fmtMoney(impact.onlineSales)}
                  changePct={impact.onlineSalesChangePct}
                  lifetime={impact.lifetime !== false}
                  icon={<Activity size={28} strokeWidth={1.75} />}
                />
                <ImpactMiniCard
                  theme="purple"
                  label={t(
                    "overview.impact_repeat",
                    "Repeat Customer Revenue"
                  )}
                  value={fmtMoney(impact.repeatCustomerRevenue)}
                  changePct={impact.repeatRevenueChangePct}
                  lifetime={impact.lifetime !== false}
                  icon={<CircleDollarSign size={28} strokeWidth={1.75} />}
                />
                <ImpactMiniCard
                  theme="blue"
                  label={t("overview.impact_orders", "Orders completed")}
                  value={fmtNum(impact.ordersCompleted)}
                  changePct={impact.ordersChangePct}
                  lifetime={impact.lifetime !== false}
                  icon={<BarChart3 size={28} strokeWidth={1.75} />}
                />
                <ImpactMiniCard
                  theme="orange"
                  label={t("overview.impact_returning", "Returning customers")}
                  value={fmtNum(impact.returningCustomers)}
                  changePct={impact.returningChangePct}
                  lifetime={impact.lifetime !== false}
                  icon={<Users size={28} strokeWidth={1.75} />}
                />
              </div>

              <div className="ov-impact-views">
                <div className="ov-impact-views-copy">
                  <span className="ov-impact-views-label">
                    {t("overview.impact_lifetime_gmv", "Lifetime GMV trend")}
                  </span>
                  <strong className="ov-impact-views-value">
                    {fmtMoney(ordersGmv.lifetime?.gmv ?? impact.onlineSales)}
                  </strong>
                  <span className="ov-impact-life-tag">
                    {t("overview.lifetime", "Lifetime")}
                  </span>
                </div>
                <div className="ov-impact-views-chart">
                  <Sparkline
                    data={(ordersGmv.lifetime?.series || []).map((r) => r.gmv)}
                    color="#16a34a"
                    gradientId="impactGmvSpark"
                  />
                </div>
              </div>
            </>
          )}
        </section>

        <section className="ov-card ov-customers">
          <div className="ov-customers-head">
            <h2>{t("overview.customers", "Customer Growth")}</h2>
            {!salesLoading && (
              <p className="ov-customers-sub">
                {fmtNum(data?.customers?.total)}{" "}
                {t("overview.total_customers", "total customers")}
              </p>
            )}
          </div>
          {salesLoading ? (
            <CardSkeleton lines={6} />
          ) : (
            <>
              <div className="ov-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="58%"
                      outerRadius="90%"
                      paddingAngle={hasCustomerSegments ? 2 : 0}
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {donutData.map((s) => (
                        <Cell key={s.key} fill={s.color} />
                      ))}
                    </Pie>
                    {hasCustomerSegments && (
                      <Tooltip formatter={(v) => fmtNum(v)} />
                    )}
                  </PieChart>
                </ResponsiveContainer>
                <div className="ov-donut-center">
                  <strong>{fmtNum(data?.customers?.newThisMonth)}</strong>
                  <span>{t("overview.new_customers", "New")}</span>
                </div>
              </div>
              <ul className="ov-legend">
                {(data?.customers?.segments || []).map((s) => (
                  <li key={s.key}>
                    <i style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <strong>{fmtNum(s.count)}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="ov-card ov-sms">
          <div className="ov-sms-head">
            <h2>
              <MessageSquare size={18} strokeWidth={2.25} aria-hidden />
              {t("overview.sms_campaigns", "SMS Campaigns")}
            </h2>
            <p className="ov-sms-sub">
              {t(
                "overview.sms_sub",
                "Blast promotions to opted-in customers"
              )}
            </p>
          </div>
          {salesLoading ? (
            <CardSkeleton lines={5} />
          ) : (
            <>
              <div className="ov-sms-stats">
                <div className="ov-sms-stat">
                  <span className="ov-sms-stat-icon teal">
                    <Coins size={16} strokeWidth={2.25} aria-hidden />
                  </span>
                  <div>
                    <strong>{fmtNum(sms.tokensLeft)}</strong>
                    <span>
                      {t("overview.sms_tokens_left", "Tokens left")}
                    </span>
                    <span className="ov-sms-breakdown">
                      {t("overview.sms_monthly", "Monthly")}{" "}
                      {fmtNum(sms.tokensMonthly)} ·{" "}
                      {t("overview.sms_buy", "Buy")} {fmtNum(sms.tokensBuy)} ·{" "}
                      {t("overview.sms_ownmenu", "OwnMenu")}{" "}
                      {fmtNum(sms.tokensOwnmenu)}
                    </span>
                  </div>
                </div>
                <div className="ov-sms-stat">
                  <span className="ov-sms-stat-icon blue">
                    <RefreshCw size={16} strokeWidth={2.25} aria-hidden />
                  </span>
                  <div>
                    <strong>
                      {sms.resetLabel ||
                        t("overview.sms_reset_1st", "1st of each month")}
                    </strong>
                    <span>
                      {t("overview.sms_next_reset", "Next reset")}{" "}
                      {formatResetDate(sms.nextResetDate)}
                    </span>
                  </div>
                </div>
                <div className="ov-sms-stat">
                  <span className="ov-sms-stat-icon pink">
                    <Gift size={16} strokeWidth={2.25} aria-hidden />
                  </span>
                  <div>
                    <strong>+{fmtNum(sms.nextGrantTokens)}</strong>
                    <span>
                      {t(
                        "overview.sms_next_grant",
                        "Tokens on next reset"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ov-sms-actions">
                {SMS_CAMPAIGN_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const to = `/automated-sms?preset=${encodeURIComponent(
                    action.key
                  )}&prompt=${encodeURIComponent(action.prompt)}`;
                  return (
                    <Link
                      key={action.key}
                      to={to}
                      className={`ov-sms-action ov-sms-action-${action.key}`}
                    >
                      <span className="ov-sms-action-icon">
                        <Icon size={16} strokeWidth={2.25} aria-hidden />
                      </span>
                      <span>{t(`overview.sms_${action.key}`, action.label)}</span>
                    </Link>
                  );
                })}
              </div>

              <Link to="/automated-sms" className="ov-sms-open">
                <Sparkles size={14} strokeWidth={2.25} aria-hidden />
                {t("overview.sms_open_builder", "Open SMS campaign builder")}
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
