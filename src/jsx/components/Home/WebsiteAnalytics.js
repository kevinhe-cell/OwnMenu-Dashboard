import { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import {
  DateFilters,
  formatNumber,
  formatPeriodLabel,
  toISODate,
  usePeriodState,
} from "./dashboardAnalyticsUtils";

export default function WebsiteAnalytics({ today, todayStr }) {
  const { t, i18n } = useTranslation();
  const { periodOptions, applyPreset } = usePeriodState(today, todayStr, t);

  const [todayViews, setTodayViews] = useState({ home: 0, order: 0 });
  const [rangeViews, setRangeViews] = useState([]);
  const [monthViews, setMonthViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [periodPreset, setPeriodPreset] = useState("today");

  const fetchViews = useCallback(
    async (customStart, customEnd) => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();

        const resToday = await fetch("/api/restaurants/views/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todayData = await resToday.json();
        if (todayData.success) {
          setTodayViews({
            home: todayData.home || 0,
            order: todayData.order || 0,
          });
        }

        const resRange = await fetch(
          `/api/restaurants/views/custom?start=${customStart}&end=${customEnd}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rangeData = await resRange.json();
        if (rangeData.success) setRangeViews(rangeData.data);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = todayStr;
        const resMonth = await fetch(
          `/api/restaurants/views/custom?start=${toISODate(monthStart)}&end=${monthEnd}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const monthData = await resMonth.json();
        if (monthData.success) setMonthViews(monthData.data);
      } catch {
        setError(t("dashboard.failed_fetch_views"));
      } finally {
        setLoading(false);
      }
    },
    [t, today, todayStr]
  );

  useEffect(() => {
    fetchViews(startDate, endDate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetChange = (preset) => {
    const { start, end } = applyPreset(preset);
    setPeriodPreset(preset);
    setStartDate(start);
    setEndDate(end);
    fetchViews(start, end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setPeriodPreset("custom");
    fetchViews(startDate, endDate);
  };

  const periodLabel = useMemo(
    () => formatPeriodLabel(startDate, endDate, today, i18n.language),
    [startDate, endDate, today, i18n.language]
  );

  const totalViews = rangeViews.reduce(
    (sum, v) => sum + (v.home_viewCount || 0) + (v.order_viewCount || 0),
    0
  );
  const homePeriodTotal = rangeViews.reduce((sum, v) => sum + (v.home_viewCount || 0), 0);
  const orderPeriodTotal = rangeViews.reduce((sum, v) => sum + (v.order_viewCount || 0), 0);
  const avgViews = rangeViews.length > 0 ? Math.round(totalViews / rangeViews.length) : 0;
  const todayTotal = (todayViews?.home || 0) + (todayViews?.order || 0);

  const chartData = useMemo(() => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const homeData = new Array(daysInMonth).fill(0);
    const orderData = new Array(daysInMonth).fill(0);

    monthViews.forEach((v) => {
      const [year, month, day] = v.view_date.split("-").map(Number);
      if (year === currentYear && month - 1 === currentMonth) {
        homeData[day - 1] = v.home_viewCount || 0;
        orderData[day - 1] = v.order_viewCount || 0;
      }
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: `${t("dashboard.home")} ${t("dashboard.number_of_views")}`,
          data: homeData,
          borderColor: "#dd2f6e",
          backgroundColor: "rgba(221, 47, 110, 0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#dd2f6e",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2.5,
        },
        {
          label: `${t("dashboard.order")} ${t("dashboard.number_of_views")}`,
          data: orderData,
          borderColor: "#334155",
          backgroundColor: "rgba(51, 65, 85, 0.06)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#334155",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2.5,
        },
      ],
    };
  }, [monthViews, t, today]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "start",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 16,
            font: { size: 12, family: "Inter, sans-serif" },
            color: "#64748b",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#fff",
          titleColor: "#0f172a",
          bodyColor: "#64748b",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12,
        },
      },
      interaction: { mode: "nearest", axis: "x", intersect: false },
      scales: {
        x: {
          title: {
            display: true,
            text: `${t("dashboard.days_in")} ${today.toLocaleDateString(i18n.language, {
              month: "long",
              year: "numeric",
            })}`,
            font: { size: 12, family: "Inter, sans-serif", weight: "600" },
            color: "#64748b",
          },
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: {
            maxRotation: 0,
            color: "#94a3b8",
            font: { size: 11, family: "Inter, sans-serif" },
            callback: (value) => (value % 5 === 1 || value === 1 ? value : ""),
          },
        },
        y: {
          title: {
            display: true,
            text: t("dashboard.number_of_views"),
            font: { size: 12, family: "Inter, sans-serif", weight: "600" },
            color: "#64748b",
          },
          beginAtZero: true,
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 11, family: "Inter, sans-serif" } },
        },
      },
    }),
    [t, i18n.language, today]
  );

  return (
    <>
      <DateFilters
        t={t}
        periodOptions={periodOptions}
        periodPreset={periodPreset}
        onPresetChange={handlePresetChange}
        startDate={startDate}
        endDate={endDate}
        todayStr={todayStr}
        onStartChange={(v) => {
          setPeriodPreset("custom");
          setStartDate(v);
        }}
        onEndChange={(v) => {
          setPeriodPreset("custom");
          setEndDate(v);
        }}
        onSubmit={handleSubmit}
        loading={loading}
        periodLabel={periodLabel}
      />

      {error ? (
        <div className="vd-error" role="alert">
          {error}
        </div>
      ) : loading ? (
        <div className="vd-loading">
          <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
          {t("dashboard.loading_analytics")}
        </div>
      ) : (
        <>
          <div className="vd-kpi-grid">
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.total_views")}</div>
              <div className="vd-kpi-value brand">{formatNumber(totalViews)}</div>
              <div className="vd-kpi-meta">{periodLabel}</div>
            </div>
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.todays_views")}</div>
              <div className="vd-kpi-value">{formatNumber(todayTotal)}</div>
              <div className="vd-kpi-meta">
                {t("dashboard.home")}: {formatNumber(todayViews?.home || 0)} · {t("dashboard.order")}:{" "}
                {formatNumber(todayViews?.order || 0)}
              </div>
            </div>
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.daily_average")}</div>
              <div className="vd-kpi-value">{formatNumber(avgViews)}</div>
              <div className="vd-kpi-meta">{t("dashboard.across_selected_period")}</div>
            </div>
          </div>

          <div className="vd-split-row">
            <div className="vd-split-card">
              <div className="vd-split-icon home">H</div>
              <div>
                <div className="vd-split-label">{t("dashboard.home_page_views")}</div>
                <div className="vd-split-value">{formatNumber(homePeriodTotal)}</div>
              </div>
            </div>
            <div className="vd-split-card">
              <div className="vd-split-icon order">O</div>
              <div>
                <div className="vd-split-label">{t("dashboard.order_page_views")}</div>
                <div className="vd-split-value">{formatNumber(orderPeriodTotal)}</div>
              </div>
            </div>
          </div>

          <div className="vd-chart-card">
            <div className="vd-chart-head">
              <h2>{t("dashboard.views_over_time")}</h2>
              <p>{t("dashboard.views_over_time_desc")}</p>
            </div>
            <div className="vd-chart-wrap">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
