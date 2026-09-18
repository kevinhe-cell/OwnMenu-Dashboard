import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchChainRestaurantsThunk,
  getChainSalesDailyThunk,
  setChainSales,
} from "../../../store/chainDashboard";
import { getMasterToken, getToken } from "../../../store/utlits";
import {
  businessDateISO,
  businessMonthValue,
} from "../Dashboard/Home/salesReportDates";
import "../Dashboard/Home/SalesReport.css";
import "./MasterDashboard.css";
import MasterCustomersPanel from "./MasterCustomersPanel";

const masterSalesMemoryCache = new Map();
const MASTER_SALES_CACHE_TTL = 60 * 1000; // 60s memory cache for instant multi-location filtering

const toCount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

const fmtMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;
const SALES_AUTOLOAD_LIMIT = 50;
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

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
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

const monthToRange = (monthStr) => {
  if (!monthStr) return { start: "", end: "" };
  const [y, m] = monthStr.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
};

const MasterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    chain,
    restaurants,
    restaurantsLoading,
    restaurantsLoaded,
    restaurantsError,
    salesDaily,
    salesLoading,
    salesError,
  } = useSelector((state) => state.chainDashboard);

  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("range");
  const [monthValue, setMonthValue] = useState(() => businessMonthValue());
  const [startDate, setStartDate] = useState(() => businessDateISO());
  const [endDate, setEndDate] = useState(() => businessDateISO());
  const [orderType, setOrderType] = useState("all");
  const [paymentType, setPaymentType] = useState("all");
  const [restaurantsExpanded, setRestaurantsExpanded] = useState(false);
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [activeTab, setActiveTab] = useState("sales");
  const [chainCoupons, setChainCoupons] = useState([]);
  const [chainRewards, setChainRewards] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState("");
  const [couponForm, setCouponForm] = useState({
    random_code: true,
    custom_code: "",
    discount_type: "Amount",
    discount: "",
    expiration: "1month",
    min_require: 0,
    use_limit: "",
    visible_online: true,
  });
  const [rewardForm, setRewardForm] = useState({
    need_amount: "",
    discount_amount: "",
  });
  const [loadedSalesKey, setLoadedSalesKey] = useState("");

  useEffect(() => {
    dispatch(fetchChainRestaurantsThunk()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (!restaurants.length || selectedIds.length) return;
    setSelectedIds(restaurants.map((restaurant) => restaurant.restaurant_id));
    localStorage.setItem("ownmenu-chains", JSON.stringify(restaurants));
  }, [restaurants, selectedIds.length]);

  const effectiveStart = viewMode === "month" ? monthToRange(monthValue).start : startDate;
  const effectiveEnd = viewMode === "month" ? monthToRange(monthValue).end : endDate;

  const periodLabel = useMemo(() => {
    if (viewMode === "month" && monthValue) {
      const [y, m] = monthValue.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString(i18n.language, {
        month: "long",
        year: "numeric",
      });
    }
    if (effectiveStart && effectiveEnd) {
      const fmt = (d) => {
        const [yy, mm, dd] = d.split("-");
        return `${mm}/${dd}/${yy}`;
      };
      return `${fmt(effectiveStart)} - ${fmt(effectiveEnd)}`;
    }
    return new Date().toLocaleDateString(i18n.language);
  }, [viewMode, monthValue, effectiveStart, effectiveEnd, i18n.language]);

  const needsManualSalesLoad = selectedIds.length > SALES_AUTOLOAD_LIMIT;
  const salesQueryKey = [
    selectedIds.join(","),
    effectiveStart,
    effectiveEnd,
    orderType,
    paymentType,
  ].join("|");
  const showSalesReport = !needsManualSalesLoad || loadedSalesKey === salesQueryKey;

  const loadChainSales = () => {
    if (!selectedIds.length) return;
    const cacheKey = `master:${selectedIds.slice().sort().join(",")}:${effectiveStart}:${effectiveEnd}:${orderType}:${paymentType}`;
    const cached = masterSalesMemoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < MASTER_SALES_CACHE_TTL) {
      dispatch(setChainSales(cached.data));
      return;
    }

    dispatch(
      getChainSalesDailyThunk(
        selectedIds,
        effectiveStart,
        effectiveEnd,
        orderType,
        paymentType
      )
    )
      .then((data) => {
        if (data) {
          masterSalesMemoryCache.set(cacheKey, { data, timestamp: Date.now() });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!selectedIds.length || needsManualSalesLoad || !effectiveStart || !effectiveEnd) return;

    const cacheKey = `master:${selectedIds.slice().sort().join(",")}:${effectiveStart}:${effectiveEnd}:${orderType}:${paymentType}`;
    const cached = masterSalesMemoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < MASTER_SALES_CACHE_TTL) {
      dispatch(setChainSales(cached.data));
      return;
    }

    const timer = setTimeout(() => {
      loadChainSales();
    }, 150);

    return () => clearTimeout(timer);
  }, [dispatch, selectedIds, effectiveStart, effectiveEnd, orderType, paymentType, needsManualSalesLoad]);

  const onViewSales = () => {
    setLoadedSalesKey(salesQueryKey);
    loadChainSales();
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = restaurants.length > 0 && selectedIds.length === restaurants.length;
  const displaySales = salesDaily?.summary || {};
  const dailyRows = salesDaily?.daily || [];
  const restaurantRows = useMemo(() => {
    const rows = [...(salesDaily?.restaurants || [])];
    rows.sort(
      (a, b) =>
        (Number(b.summary?.totalSales) || 0) - (Number(a.summary?.totalSales) || 0)
    );
    return rows;
  }, [salesDaily?.restaurants]);
  const maxRestaurantSales = useMemo(
    () =>
      restaurantRows.reduce(
        (max, row) => Math.max(max, Number(row.summary?.totalSales) || 0),
        0
      ),
    [restaurantRows]
  );
  const avgOrderValue = useMemo(() => {
    const orders = Number(displaySales.totalOrders) || 0;
    const sales = Number(displaySales.totalSales) || 0;
    if (!orders) return 0;
    return sales / orders;
  }, [displaySales.totalOrders, displaySales.totalSales]);
  const filteredRestaurants = useMemo(() => {
    const q = restaurantQuery.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((restaurant) => {
      const hay = [
        restaurant.restaurant_name,
        restaurant.street,
        restaurant.city,
        restaurant.state,
        restaurant.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [restaurants, restaurantQuery]);
  const chainRewardRows = useMemo(() => {
    const grouped = new Map();
    chainRewards.forEach((reward) => {
      const key = `${Number(reward.need_amount) || 0}:${Number(reward.discount_amount) || 0}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          need_amount: reward.need_amount,
          discount_amount: reward.discount_amount,
        });
      }
    });
    return Array.from(grouped.values());
  }, [chainRewards]);

  const toggleRestaurant = (restaurantId) => {
    setSelectedIds((current) => {
      if (current.includes(restaurantId)) {
        return current.filter((id) => id !== restaurantId);
      }
      return [...current, restaurantId];
    });
  };

  const toggleAllRestaurants = () => {
    setSelectedIds(allSelected ? [] : restaurants.map((restaurant) => restaurant.restaurant_id));
  };

  const openRestaurantDashboard = (restaurant) => {
    if (!restaurant?.token) return;
    localStorage.setItem("ownmenutoken", restaurant.token);
    navigate("/overview");
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

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

  const loadChainCoupons = async () => {
    const headers = authHeaders();
    if (!headers) return;
    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch("/api/coupons/chain/me", { headers });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to load chain coupons."));
      }
      const data = await response.json();
      setChainCoupons(data.coupons || []);
    } catch (error) {
      setToolsError(error?.message || "Failed to load chain coupons.");
    } finally {
      setToolsLoading(false);
    }
  };

  const loadChainRewards = async () => {
    const headers = authHeaders();
    if (!headers) return;
    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch("/api/rewards/chain", { headers });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to load chain rewards."));
      }
      const data = await response.json();
      setChainRewards(data.rewards || []);
    } catch (error) {
      setToolsError(error?.message || "Failed to load chain rewards.");
    } finally {
      setToolsLoading(false);
    }
  };

  useEffect(() => {
    if (!chain) return;
    if (activeTab === "coupons") {
      loadChainCoupons();
    } else if (activeTab === "rewards") {
      loadChainRewards();
    }
  }, [activeTab, chain]);

  const createChainCoupon = async (event) => {
    event.preventDefault();
    const headers = authHeaders();
    if (!headers) return;
    const useLimitValue = Number(couponForm.use_limit);
    if (!Number.isFinite(useLimitValue) || useLimitValue <= 0) {
      setToolsError("Use limit must be 1 or more. 0 means the coupon cannot be used.");
      return;
    }
    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch("/api/coupons/chain", {
        method: "POST",
        headers,
        body: JSON.stringify({
          random_code: couponForm.random_code,
          custom_code: couponForm.random_code ? null : couponForm.custom_code,
          discount_type: couponForm.discount_type,
          discount: couponForm.discount,
          expiration: couponForm.expiration,
          min_require: couponForm.min_require,
          use_limit: useLimitValue,
          visible_online: couponForm.visible_online,
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to create chain coupon."));
      }
      setCouponForm((current) => ({
        ...current,
        random_code: true,
        custom_code: "",
        discount: "",
        min_require: 0,
        use_limit: "",
      }));
      await loadChainCoupons();
    } catch (error) {
      setToolsError(error?.message || "Failed to create chain coupon.");
    } finally {
      setToolsLoading(false);
    }
  };

  const deleteChainCoupon = async (couponId) => {
    if (!couponId) return;
    const confirmed = window.confirm(`Delete coupon ${couponId}?`);
    if (!confirmed) return;

    const headers = authHeaders();
    if (!headers) return;

    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch(`/api/coupons/chain/${encodeURIComponent(couponId)}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to delete chain coupon."));
      }
      await loadChainCoupons();
    } catch (error) {
      setToolsError(error?.message || "Failed to delete chain coupon.");
    } finally {
      setToolsLoading(false);
    }
  };

  const createChainReward = async (event) => {
    event.preventDefault();
    const headers = authHeaders();
    if (!headers) return;
    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch("/api/rewards/chain", {
        method: "POST",
        headers,
        body: JSON.stringify({
          need_amount: rewardForm.need_amount,
          discount_amount: rewardForm.discount_amount,
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to create chain reward."));
      }
      setRewardForm({ need_amount: "", discount_amount: "" });
      await loadChainRewards();
    } catch (error) {
      setToolsError(error?.message || "Failed to create chain reward.");
    } finally {
      setToolsLoading(false);
    }
  };

  const deleteChainReward = async (reward) => {
    if (!reward) return;
    const points = Number(reward.need_amount) || 0;
    const dollars = Number(reward.discount_amount) || 0;
    const confirmed = window.confirm(
      `Delete reward ${toCount(points)} points for ${fmtMoney(dollars)} off?`
    );
    if (!confirmed) return;

    const headers = authHeaders();
    if (!headers) return;

    setToolsLoading(true);
    setToolsError("");
    try {
      const response = await fetch(
        `/api/rewards/chain/${encodeURIComponent(points)}/${encodeURIComponent(dollars)}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to delete chain reward."));
      }
      await loadChainRewards();
    } catch (error) {
      setToolsError(error?.message || "Failed to delete chain reward.");
    } finally {
      setToolsLoading(false);
    }
  };

  if (restaurantsLoaded && !chain) {
    return <Navigate to="/overview" replace />;
  }

  const tabs = [
    ["sales", t("chain.tab_sales")],
    ["coupons", t("chain.tab_coupons")],
    ["rewards", t("chain.tab_rewards")],
    ["customers", t("chain.tab_customers")],
  ];

  const totalSalesNum = Number(displaySales.totalSales) || 0;

  return (
    <div className="sr-page chain-master">
      <header className="chain-master__hero">
        <div className="chain-master__hero-copy">
          <p className="chain-master__eyebrow">
            {t("chain.locations")} · {restaurants.length}
          </p>
          <h1>{t("chain.master_title")}</h1>
          <p>{t("chain.master_subtitle")}</p>
        </div>
        <div className="chain-master__hero-meta">
          <span className="chain-master__meta-chip">
            <strong>{selectedIds.length}</strong>
            <span>
              {t("chain.selected_count", {
                selected: selectedIds.length,
                total: restaurants.length,
              })}
            </span>
          </span>
          {activeTab === "sales" && (
            <span className="chain-master__meta-chip muted">
              <strong>{t("chain.period")}</strong>
              <span>{periodLabel}</span>
            </span>
          )}
        </div>
      </header>

      {(restaurantsError || salesError || toolsError) && (
        <div className="chain-master__alert" role="alert">
          {restaurantsError || salesError || toolsError}
        </div>
      )}

      <nav className="chain-master__tabs" aria-label={t("chain.master_sections")}>
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={activeTab === value ? "active" : ""}
            onClick={() => setActiveTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "sales" && (
        <>
          <section className="chain-master__panel">
            <div className="chain-master__panel-head">
              <div>
                <h2>{t("chain.locations")}</h2>
                <p>
                  {t("chain.selected_count", {
                    selected: selectedIds.length,
                    total: restaurants.length,
                  })}
                </p>
              </div>
              <div className="chain-master__panel-actions">
                <button type="button" className="sr-pill" onClick={toggleAllRestaurants}>
                  {allSelected ? t("chain.clear_all") : t("chain.select_all")}
                </button>
                <button
                  type="button"
                  className="chain-master__collapse-btn"
                  onClick={() => setRestaurantsExpanded((expanded) => !expanded)}
                  aria-expanded={restaurantsExpanded}
                >
                  {restaurantsExpanded ? t("chain.hide_restaurants") : t("chain.show_restaurants")}
                </button>
              </div>
            </div>

            {restaurantsExpanded && (
              <div className="chain-master__panel-body">
                <div className="chain-master__search">
                  <input
                    type="search"
                    value={restaurantQuery}
                    onChange={(e) => setRestaurantQuery(e.target.value)}
                    placeholder={t("chain.search_locations")}
                    aria-label={t("chain.search_locations")}
                  />
                </div>

                {restaurantsLoading && !restaurants.length ? (
                  <div className="chain-master__empty">{t("chain.loading_restaurants")}</div>
                ) : filteredRestaurants.length ? (
                  <div className="chain-master__location-grid">
                    {filteredRestaurants.map((restaurant) => {
                      const selected = selectedSet.has(restaurant.restaurant_id);
                      const address =
                        [restaurant.street, restaurant.city, restaurant.state]
                          .filter(Boolean)
                          .join(", ") || t("chain.no_address");
                      return (
                        <article
                          key={restaurant.restaurant_id}
                          className={`chain-master__location-card${selected ? " is-selected" : ""}`}
                        >
                          <label className="chain-master__location-main">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleRestaurant(restaurant.restaurant_id)}
                            />
                            <span>
                              <strong>{restaurant.restaurant_name}</strong>
                              <small>{address}</small>
                              {restaurant.phone ? <small>{restaurant.phone}</small> : null}
                            </span>
                          </label>
                          <button
                            type="button"
                            className="chain-master__open-btn"
                            onClick={() => openRestaurantDashboard(restaurant)}
                          >
                            {t("chain.open_dashboard")}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="chain-master__empty">{t("sales.no_data")}</div>
                )}
              </div>
            )}
          </section>

          <section className="chain-master__panel chain-master__filters">
            <div className="chain-master__panel-head compact">
              <div>
                <h2>{t("sales.view_mode")}</h2>
                <p>{periodLabel}</p>
              </div>
              {needsManualSalesLoad && (
                <div className="chain-master__panel-actions">
                  <button
                    type="button"
                    className="chain-master__view-btn"
                    onClick={onViewSales}
                    disabled={salesLoading || !selectedIds.length}
                  >
                    {t("chain.view_sales")}
                  </button>
                </div>
              )}
            </div>
            <div className="chain-master__panel-body">
              <div className="chain-master__filter-grid">
                <div className="sr-field">
                  <label>{t("sales.view_mode")}</label>
                  <FilterPills options={viewModeOptions} value={viewMode} onChange={setViewMode} />
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

                <div className="sr-field">
                  <label>{t("sales.order_type")}</label>
                  <FilterPills options={orderTypeOptions} value={orderType} onChange={setOrderType} />
                </div>
                <div className="sr-field">
                  <label>{t("sales.payment")}</label>
                  <FilterPills
                    options={paymentOptions}
                    value={paymentType}
                    onChange={setPaymentType}
                  />
                </div>
              </div>
            </div>
          </section>

          {!showSalesReport ? (
            <section className="chain-master__panel">
              <div className="chain-master__empty chain-master__sales-gate">
                <p>{t("chain.view_sales_hint")}</p>
                <button
                  type="button"
                  className="chain-master__view-btn"
                  onClick={onViewSales}
                  disabled={salesLoading || !selectedIds.length}
                >
                  {t("chain.view_sales")}
                </button>
              </div>
            </section>
          ) : salesLoading && (!salesDaily || needsManualSalesLoad) ? (
            <div className="sr-loading">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              {t("sales.refreshing", { defaultValue: "Loading report..." })}
            </div>
          ) : (
            <>
              <div className="chain-master__kpi-grid">
                <div className="chain-master__kpi">
                  <div className="chain-master__kpi-label">{t("sales.total_sales")}</div>
                  <div className="chain-master__kpi-value">
                    {fmtMoney(displaySales.totalSales)}
                  </div>
                </div>
                <div className="chain-master__kpi accent">
                  <div className="chain-master__kpi-label">
                    {t("sales.total_net_received_online")}
                  </div>
                  <div className="chain-master__kpi-value positive">
                    {fmtMoney(displaySales.totalNetReceivedOnlineOnly)}
                  </div>
                </div>
                <div className="chain-master__kpi">
                  <div className="chain-master__kpi-label">{t("sales.total_orders")}</div>
                  <div className="chain-master__kpi-value">
                    {toCount(displaySales.totalOrders)}
                  </div>
                </div>
                <div className="chain-master__kpi">
                  <div className="chain-master__kpi-label">{t("chain.avg_order")}</div>
                  <div className="chain-master__kpi-value">{fmtMoney(avgOrderValue)}</div>
                </div>
                <div className="chain-master__kpi warn">
                  <div className="chain-master__kpi-label">{t("sales.refunded_amount")}</div>
                  <div className="chain-master__kpi-value">
                    {fmtMoney(displaySales.totalRefundAmount)}
                  </div>
                </div>
              </div>

              <section className="chain-master__panel">
                <div className="chain-master__panel-head">
                  <div>
                    <h2>{t("chain.restaurant_breakdown")}</h2>
                    <p>{periodLabel}</p>
                  </div>
                  {salesLoading && (
                    <span className="chain-master__loading-label">
                      {t("sales.refreshing", { defaultValue: "Refreshing..." })}
                    </span>
                  )}
                </div>
                <div className="chain-master__panel-body tight">
                  {restaurantRows.length ? (
                    <div className="chain-master__breakdown">
                      {restaurantRows.map((row) => {
                        const sales = Number(row.summary?.totalSales) || 0;
                        const share = totalSalesNum > 0 ? (sales / totalSalesNum) * 100 : 0;
                        const bar =
                          maxRestaurantSales > 0 ? (sales / maxRestaurantSales) * 100 : 0;
                        return (
                          <div key={row.restaurant_id} className="chain-master__breakdown-row">
                            <div className="chain-master__breakdown-top">
                              <div>
                                <strong>{row.restaurant_name}</strong>
                                <span>
                                  {toCount(row.summary?.totalOrders)} {t("sales.orders")} ·{" "}
                                  {toCount(row.summary?.pickupOrders)} {t("sales.pickup")} ·{" "}
                                  {toCount(row.summary?.deliveryOrders)} {t("sales.delivery")}
                                </span>
                              </div>
                              <div className="chain-master__breakdown-nums">
                                <strong>{fmtMoney(sales)}</strong>
                                <small>
                                  {t("chain.share_of_sales")} {share.toFixed(1)}%
                                </small>
                              </div>
                            </div>
                            <div className="chain-master__bar" aria-hidden="true">
                              <span style={{ width: `${Math.max(bar, sales > 0 ? 4 : 0)}%` }} />
                            </div>
                            <div className="chain-master__breakdown-meta">
                              <span>
                                {t("sales.total_net_received_online")}:{" "}
                                {fmtMoney(row.summary?.totalNetReceivedOnlineOnly)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="chain-master__empty">{t("sales.no_data")}</div>
                  )}
                </div>
              </section>

              {viewMode === "month" && dailyRows.length > 0 && (
                <section className="chain-master__panel">
                  <div className="chain-master__panel-head">
                    <div>
                      <h2>{t("sales.daily_breakdown")}</h2>
                      <p>{periodLabel}</p>
                    </div>
                  </div>
                  <div className="chain-master__panel-body tight">
                    <div className="sr-table-wrap">
                      <table className="sr-table">
                        <thead>
                          <tr>
                            <th>{t("sales.date")}</th>
                            <th className="num">{t("sales.total_sales")}</th>
                            <th className="num">{t("sales.total_net_received_online")}</th>
                            <th className="num">{t("sales.orders")}</th>
                            <th className="num">{t("sales.pickup")}</th>
                            <th className="num">{t("sales.delivery")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyRows.map((row) => (
                            <tr key={row.date}>
                              <td>{row.date}</td>
                              <td className="num strong">{fmtMoney(row.totalSales)}</td>
                              <td className="num">
                                {fmtMoney(row.totalNetReceivedOnlineOnly)}
                              </td>
                              <td className="num">{toCount(row.totalOrders)}</td>
                              <td className="num">{toCount(row.pickupOrders)}</td>
                              <td className="num">{toCount(row.deliveryOrders)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "coupons" && (
        <div className="chain-master__split">
          <section className="chain-master__panel">
            <div className="chain-master__panel-head">
              <div>
                <h2>{t("chain.create_coupon_title")}</h2>
                <p>{t("chain.chain_coupons")}</p>
              </div>
            </div>
            <div className="chain-master__panel-body">
              <form className="chain-master__form-stack" onSubmit={createChainCoupon}>
                <div className="sr-field">
                  <label>{t("chain.coupon_code")}</label>
                  <select
                    value={couponForm.random_code ? "random" : "custom"}
                    onChange={(e) =>
                      setCouponForm((current) => ({
                        ...current,
                        random_code: e.target.value === "random",
                      }))
                    }
                  >
                    <option value="random">{t("chain.random_code")}</option>
                    <option value="custom">{t("chain.custom_code")}</option>
                  </select>
                </div>
                {!couponForm.random_code && (
                  <div className="sr-field">
                    <label>{t("chain.custom_code")}</label>
                    <input
                      value={couponForm.custom_code}
                      onChange={(e) =>
                        setCouponForm((current) => ({
                          ...current,
                          custom_code: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                    />
                  </div>
                )}
                <div className="chain-master__form-two">
                  <div className="sr-field">
                    <label>{t("chain.discount_type")}</label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) =>
                        setCouponForm((current) => ({
                          ...current,
                          discount_type: e.target.value,
                        }))
                      }
                    >
                      <option value="Amount">{t("chain.amount_off")}</option>
                      <option value="Percentage">{t("chain.percent_off")}</option>
                    </select>
                  </div>
                  <div className="sr-field">
                    <label>{t("chain.discount")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={couponForm.discount}
                      onChange={(e) =>
                        setCouponForm((current) => ({ ...current, discount: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="chain-master__form-two">
                  <div className="sr-field">
                    <label>{t("chain.expiration")}</label>
                    <select
                      value={couponForm.expiration}
                      onChange={(e) =>
                        setCouponForm((current) => ({
                          ...current,
                          expiration: e.target.value,
                        }))
                      }
                    >
                      <option value="1day">1 day</option>
                      <option value="1week">1 week</option>
                      <option value="1month">1 month</option>
                      <option value="unlimited">{t("chain.unlimited")}</option>
                    </select>
                  </div>
                  <div className="sr-field">
                    <label>{t("chain.minimum_order")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={couponForm.min_require}
                      onChange={(e) =>
                        setCouponForm((current) => ({
                          ...current,
                          min_require: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="sr-field">
                  <label>{t("chain.use_limit")}</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.use_limit}
                    onChange={(e) =>
                      setCouponForm((current) => ({ ...current, use_limit: e.target.value }))
                    }
                    placeholder="1+"
                  />
                  <small>Use 1 or more. 0 means this coupon cannot be used.</small>
                </div>
                <label className="chain-master__checkbox">
                  <input
                    type="checkbox"
                    checked={couponForm.visible_online}
                    onChange={(e) =>
                      setCouponForm((current) => ({
                        ...current,
                        visible_online: e.target.checked,
                      }))
                    }
                  />
                  {t("chain.visible_online")}
                </label>
                <button type="submit" className="sr-btn-primary" disabled={toolsLoading}>
                  {t("chain.create_coupon")}
                </button>
              </form>
            </div>
          </section>

          <section className="chain-master__panel">
            <div className="chain-master__panel-head">
              <div>
                <h2>{t("chain.active_list")}</h2>
                <p>
                  {chainCoupons.length} {t("chain.chain_coupons").toLowerCase()}
                </p>
              </div>
              {toolsLoading && (
                <span className="chain-master__loading-label">{t("common.refreshing")}</span>
              )}
            </div>
            <div className="chain-master__panel-body tight">
              {chainCoupons.length ? (
                <div className="chain-master__list">
                  {chainCoupons.map((coupon) => (
                    <div key={coupon.id || coupon.coupon_id} className="chain-master__list-item">
                      <div>
                        <strong>{coupon.coupon_id}</strong>
                        <span>
                          {coupon.discount_type === "Percentage"
                            ? `${Number(coupon.discount) || 0}%`
                            : fmtMoney(coupon.discount)}{" "}
                          · {formatDate(coupon.expiration_date)}
                        </span>
                      </div>
                      <div className="chain-master__list-actions">
                        <span className="chain-master__status">
                          {coupon.status || "-"}
                        </span>
                        <button
                          type="button"
                          className="chain-master__delete-btn"
                          disabled={toolsLoading}
                          onClick={() => deleteChainCoupon(coupon.coupon_id)}
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chain-master__empty">{t("chain.empty_coupons")}</div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="chain-master__split">
          <section className="chain-master__panel">
            <div className="chain-master__panel-head">
              <div>
                <h2>{t("chain.create_reward_title")}</h2>
                <p>{t("chain.chain_rewards")}</p>
              </div>
            </div>
            <div className="chain-master__panel-body">
              <form className="chain-master__form-stack" onSubmit={createChainReward}>
                <div className="sr-field">
                  <label>{t("chain.points_required")}</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={rewardForm.need_amount}
                    onChange={(e) =>
                      setRewardForm((current) => ({ ...current, need_amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="sr-field">
                  <label>{t("chain.reward_dollars")}</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={rewardForm.discount_amount}
                    onChange={(e) =>
                      setRewardForm((current) => ({
                        ...current,
                        discount_amount: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <button type="submit" className="sr-btn-primary" disabled={toolsLoading}>
                  {t("chain.create_reward")}
                </button>
              </form>
            </div>
          </section>

          <section className="chain-master__panel">
            <div className="chain-master__panel-head">
              <div>
                <h2>{t("chain.active_list")}</h2>
                <p>
                  {chainRewardRows.length} {t("chain.chain_rewards").toLowerCase()}
                </p>
              </div>
              {toolsLoading && (
                <span className="chain-master__loading-label">{t("common.refreshing")}</span>
              )}
            </div>
            <div className="chain-master__panel-body tight">
              {chainRewardRows.length ? (
                <div className="chain-master__list">
                  {chainRewardRows.map((reward) => (
                    <div key={reward.id} className="chain-master__list-item">
                      <div>
                        <strong>
                          {toCount(reward.need_amount)} pts → {fmtMoney(reward.discount_amount)}
                        </strong>
                        <span>{t("chain.chain_rewards")}</span>
                      </div>
                      <button
                        type="button"
                        className="chain-master__delete-btn"
                        disabled={toolsLoading}
                        onClick={() => deleteChainReward(reward)}
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chain-master__empty">{t("chain.empty_rewards")}</div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "customers" && (
        <section className="chain-master__panel chain-master__customers">
          <div className="chain-master__panel-body">
            <MasterCustomersPanel />
          </div>
        </section>
      )}
    </div>
  );
};

export default MasterDashboard;
