import { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getToken } from "../../../store/utlits";
import AppStoreConnectForm from "./AppStoreConnectForm";
import {
  DateFilters,
  formatNumber,
  formatPeriodLabel,
  toISODate,
  usePeriodState,
} from "./dashboardAnalyticsUtils";

export default function AppStoreAnalytics({ today, todayStr }) {
  const { t, i18n } = useTranslation();
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const restaurantId = restaurant?.id;
  const { periodOptions, applyPreset } = usePeriodState(today, todayStr, t);

  const [connection, setConnection] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [todayMetrics, setTodayMetrics] = useState({
    ios_downloads: 0,
    ios_page_views: 0,
    android_downloads: 0,
    android_page_views: 0,
  });
  const [rangeMetrics, setRangeMetrics] = useState([]);
  const [monthMetrics, setMonthMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [periodPreset, setPeriodPreset] = useState("today");

  const fetchConnection = useCallback(async () => {
    if (!restaurantId) return;
    setConnectionLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/restaurants/app-store/connection", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConnection(data.data);
        setShowConnectForm(false);
      }
    } catch {
      setError(t("dashboard.app_store.failed_fetch_connection"));
    } finally {
      setConnectionLoading(false);
    }
  }, [restaurantId, t]);

  const fetchMetrics = useCallback(
    async (customStart, customEnd) => {
      if (!restaurantId) return;
      try {
        setLoading(true);
        setError(null);
        const token = getToken();

        const resToday = await fetch("/api/restaurants/app-store-metrics/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todayData = await resToday.json();
        if (!todayData.configured) {
          setConnection((prev) => ({ ...prev, connected: false }));
          return;
        }
        setTodayMetrics({
          ios_downloads: todayData.ios_downloads || 0,
          ios_page_views: todayData.ios_page_views || 0,
          android_downloads: todayData.android_downloads || 0,
          android_page_views: todayData.android_page_views || 0,
        });

        const resRange = await fetch(
          `/api/restaurants/app-store-metrics/custom?start=${customStart}&end=${customEnd}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rangeData = await resRange.json();
        if (rangeData.success && rangeData.configured) {
          setRangeMetrics(rangeData.data || []);
        }

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const resMonth = await fetch(
          `/api/restaurants/app-store-metrics/custom?start=${toISODate(monthStart)}&end=${todayStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const monthData = await resMonth.json();
        if (monthData.success && monthData.configured) {
          setMonthMetrics(monthData.data || []);
        }
      } catch {
        setError(t("dashboard.app_store.failed_fetch_metrics"));
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, t, today, todayStr]
  );

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  useEffect(() => {
    if (connection?.connected) {
      fetchMetrics(startDate, endDate);
    }
  }, [connection?.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetChange = (preset) => {
    const { start, end } = applyPreset(preset);
    setPeriodPreset(preset);
    setStartDate(start);
    setEndDate(end);
    if (connection?.connected) fetchMetrics(start, end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setPeriodPreset("custom");
    if (connection?.connected) fetchMetrics(startDate, endDate);
  };

  const handleConnected = (data) => {
    setConnection(data);
    setShowConnectForm(!data?.connected);
    if (data?.connected) {
      fetchMetrics(startDate, endDate);
    }
  };

  const periodLabel = useMemo(
    () => formatPeriodLabel(startDate, endDate, today, i18n.language),
    [startDate, endDate, today, i18n.language]
  );

  const totalDownloads = rangeMetrics.reduce(
    (sum, row) => sum + (row.ios_downloads || 0) + (row.android_downloads || 0),
    0
  );
  const totalPageViews = rangeMetrics.reduce(
    (sum, row) => sum + (row.ios_page_views || 0) + (row.android_page_views || 0),
    0
  );
  const iosPeriodDownloads = rangeMetrics.reduce((sum, row) => sum + (row.ios_downloads || 0), 0);
  const androidPeriodDownloads = rangeMetrics.reduce(
    (sum, row) => sum + (row.android_downloads || 0),
    0
  );
  const todayDownloads =
    (todayMetrics.ios_downloads || 0) + (todayMetrics.android_downloads || 0);
  const todayPageViews =
    (todayMetrics.ios_page_views || 0) + (todayMetrics.android_page_views || 0);
  const avgDaily =
    rangeMetrics.length > 0 ? Math.round(totalDownloads / rangeMetrics.length) : 0;
  const hasData = rangeMetrics.some(
    (row) =>
      (row.ios_downloads || 0) +
        (row.android_downloads || 0) +
        (row.ios_page_views || 0) +
        (row.android_page_views || 0) >
      0
  );

  const chartData = useMemo(() => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const downloadsData = new Array(daysInMonth).fill(0);
    const pageViewsData = new Array(daysInMonth).fill(0);

    monthMetrics.forEach((row) => {
      const [year, month, day] = row.metric_date.split("-").map(Number);
      if (year === currentYear && month - 1 === currentMonth) {
        downloadsData[day - 1] =
          (row.ios_downloads || 0) + (row.android_downloads || 0);
        pageViewsData[day - 1] =
          (row.ios_page_views || 0) + (row.android_page_views || 0);
      }
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: t("dashboard.app_store.downloads"),
          data: downloadsData,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2.5,
        },
        {
          label: t("dashboard.app_store.page_views"),
          data: pageViewsData,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.06)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2.5,
        },
      ],
    };
  }, [monthMetrics, t, today]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } },
    }),
    []
  );

  if (connectionLoading) {
    return (
      <div className="vd-loading">
        <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
        {t("dashboard.loading_analytics")}
      </div>
    );
  }

  if (!connection?.connected) {
    return (
      <div className="vd-empty-connect">
        {showConnectForm ? (
          <>
            <h2>{t("dashboard.app_store.connect_title")}</h2>
            <p>{t("dashboard.app_store.connect_desc")}</p>
            <AppStoreConnectForm
              restaurantId={restaurantId}
              initialConnection={connection}
              onConnected={handleConnected}
            />
          </>
        ) : (
          <>
            <h2>{t("dashboard.app_store.not_connected")}</h2>
            <p>{t("dashboard.app_store.not_connected_desc")}</p>
            <button type="button" className="vd-btn-apply" onClick={() => setShowConnectForm(true)}>
              {t("dashboard.app_store.connect_now")}
            </button>
          </>
        )}
      </div>
    );
  }

  if (showConnectForm) {
    return (
      <div className="vd-empty-connect">
        <h2>{t("dashboard.app_store.edit_connection")}</h2>
        <p>{t("dashboard.app_store.connect_desc")}</p>
        <AppStoreConnectForm
          restaurantId={restaurantId}
          initialConnection={connection}
          onConnected={handleConnected}
          onCancel={() => setShowConnectForm(false)}
          showCancel
        />
      </div>
    );
  }

  return (
    <>
      <div className="vd-connected-banner">
        <div>
          <strong>{t("dashboard.app_store.connected_summary")}</strong>
          <div className="vd-connected-meta">
            {connection.apple_app_id ? `iOS: ${connection.apple_app_id}` : null}
            {connection.apple_app_id && connection.android_package_name ? " · " : null}
            {connection.android_package_name
              ? `Android: ${connection.android_package_name}`
              : null}
          </div>
        </div>
        <button type="button" className="vd-btn-secondary" onClick={() => setShowConnectForm(true)}>
          {t("dashboard.app_store.edit_connection")}
        </button>
      </div>

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
          {!hasData ? (
            <div className="vd-sync-pending">{t("dashboard.app_store.sync_pending")}</div>
          ) : null}

          <div className="vd-kpi-grid">
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.app_store.total_downloads")}</div>
              <div className="vd-kpi-value brand">{formatNumber(totalDownloads)}</div>
              <div className="vd-kpi-meta">{periodLabel}</div>
            </div>
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.app_store.todays_downloads")}</div>
              <div className="vd-kpi-value">{formatNumber(todayDownloads)}</div>
              <div className="vd-kpi-meta">
                iOS: {formatNumber(todayMetrics.ios_downloads)} · Android:{" "}
                {formatNumber(todayMetrics.android_downloads)}
              </div>
            </div>
            <div className="vd-kpi">
              <div className="vd-kpi-label">{t("dashboard.app_store.page_views")}</div>
              <div className="vd-kpi-value">{formatNumber(totalPageViews)}</div>
              <div className="vd-kpi-meta">
                {t("dashboard.app_store.today")}: {formatNumber(todayPageViews)}
              </div>
            </div>
          </div>

          <div className="vd-split-row">
            <div className="vd-split-card">
              <div className="vd-split-icon home">iOS</div>
              <div>
                <div className="vd-split-label">{t("dashboard.app_store.ios_downloads")}</div>
                <div className="vd-split-value">{formatNumber(iosPeriodDownloads)}</div>
              </div>
            </div>
            <div className="vd-split-card">
              <div className="vd-split-icon order">And</div>
              <div>
                <div className="vd-split-label">{t("dashboard.app_store.android_downloads")}</div>
                <div className="vd-split-value">{formatNumber(androidPeriodDownloads)}</div>
              </div>
            </div>
          </div>

          <div className="vd-chart-card">
            <div className="vd-chart-head">
              <h2>{t("dashboard.app_store.metrics_over_time")}</h2>
              <p>{t("dashboard.app_store.metrics_over_time_desc")}</p>
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
