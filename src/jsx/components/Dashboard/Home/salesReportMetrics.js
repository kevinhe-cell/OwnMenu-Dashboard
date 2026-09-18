import { businessDateISO } from "./salesReportDates";

/** Derived sales-report metrics for the dashboard UI. */

export function toCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function avgOrderValue(summary) {
  const orders = toCount(summary?.totalOrders);
  const sales = num(summary?.totalSales);
  if (!orders) return 0;
  return sales / orders;
}

/**
 * @returns {{ delta: number, percent: number | null, hasPrevious: boolean }}
 */
export function pctChange(current, previous) {
  const cur = num(current);
  const prev = num(previous);
  const delta = cur - prev;
  if (prev === 0) {
    return {
      delta,
      percent: cur === 0 ? 0 : null,
      hasPrevious: previous !== undefined && previous !== null,
    };
  }
  return {
    delta,
    percent: (delta / Math.abs(prev)) * 100,
    hasPrevious: true,
  };
}

/** Parse YYYY-MM-DD as local calendar date (noon to avoid DST edge). */
function parseYmd(ymd) {
  const [y, m, d] = String(ymd).split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Same-length window ending the day before `start`.
 * Single-day range → previous calendar day.
 */
export function previousRange(start, end) {
  if (!start || !end) return { start: "", end: "" };
  const startDate = parseYmd(start);
  const endDate = parseYmd(end);
  const days =
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  return { start: formatYmd(prevStart), end: formatYmd(prevEnd) };
}

export function orderMix(summary) {
  const pickup = toCount(summary?.pickupOrders);
  const delivery = toCount(summary?.deliveryOrders);
  const total = pickup + delivery;
  return {
    pickup,
    delivery,
    total,
    pickupPct: total ? (pickup / total) * 100 : 0,
    deliveryPct: total ? (delivery / total) * 100 : 0,
  };
}

export function sparklinePoints(daily, key = "totalSales") {
  if (!Array.isArray(daily) || !daily.length) return [];
  return daily.map((row) => num(row?.[key]));
}

/** Inclusive day count for a YYYY-MM-DD range. */
export function rangeDayCount(start, end) {
  if (!start || !end) return 0;
  const s = parseYmd(start);
  const e = parseYmd(end);
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

export function rangeEndingToday(days, timeZoneAbbr) {
  const end = businessDateISO(timeZoneAbbr);
  const endDate = parseYmd(end);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (Math.max(1, days) - 1));
  return { start: formatYmd(startDate), end };
}

export function monthToRange(monthStr) {
  if (!monthStr) return { start: "", end: "" };
  const [y, m] = monthStr.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function summaryToTotals(summary) {
  if (!summary) return {};
  return {
    totalSales: num(summary.totalSales),
    subtotal: num(summary.subtotal),
    totalTax: num(summary.totalTax),
    grossSales: num(summary.grossSales),
    restaurantDeliveryFee: num(summary.restaurantDeliveryFee),
    totalDiscount: num(summary.totalDiscount),
    totalProcessingCharge: num(summary.totalProcessingCharge),
    totalCreditCardCharge: num(summary.totalCreditCardCharge),
    totalNetReceivedOnlineOnly: num(summary.totalNetReceivedOnlineOnly),
    totalRefundAmount: num(summary.totalRefundAmount),
    doordashDeliveryFee: num(summary.doordashDeliveryFee),
    doordashDeliveryTips: num(summary.doordashDeliveryTips),
    totalCommissionFee: num(summary.totalCommissionFee),
    totalServiceFee: num(summary.totalServiceFee),
    totalOrders: toCount(summary.totalOrders),
    pickupOrders: toCount(summary.pickupOrders),
    deliveryOrders: toCount(summary.deliveryOrders),
    totalDeletedOrders: toCount(summary.totalDeletedOrders),
  };
}
