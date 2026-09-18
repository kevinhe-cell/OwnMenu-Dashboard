/** US federal holidays plus common restaurant closure days. Dates are calendar dates (not observed-weekday shifts). */

function pad(n) {
  return String(n).padStart(2, "0");
}

export function toIsoLocal(d) {
  if (!d) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoFromParts(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function nthWeekdayOfMonth(year, monthIndex, weekday, n) {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const dt = new Date(year, monthIndex, day);
    if (dt.getMonth() !== monthIndex) break;
    if (dt.getDay() === weekday) {
      count += 1;
      if (count === n) return dt;
    }
  }
  return null;
}

function lastWeekdayOfMonth(year, monthIndex, weekday) {
  const dt = new Date(year, monthIndex + 1, 0);
  while (dt.getDay() !== weekday) dt.setDate(dt.getDate() - 1);
  return dt;
}

/** Anonymous Gregorian algorithm → Easter Sunday. */
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function addDaysISO(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return toIsoLocal(dt);
}

export function rangeISO(startISO, endISO, max = 31) {
  const out = [];
  let cur = startISO;
  while (cur && endISO && cur <= endISO) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
    if (out.length >= max) break;
  }
  return out;
}

export function getHolidayISO(key, year) {
  switch (key) {
    case "new_year":
      return isoFromParts(year, 0, 1);
    case "new_years_eve":
      return isoFromParts(year, 11, 31);
    case "mlk_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 0, 1, 3));
    case "valentines_day":
      return isoFromParts(year, 1, 14);
    case "presidents_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 1, 1, 3));
    case "st_patricks_day":
      return isoFromParts(year, 2, 17);
    case "easter":
      return toIsoLocal(easterSunday(year));
    case "mothers_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 4, 0, 2));
    case "memorial_day":
      return toIsoLocal(lastWeekdayOfMonth(year, 4, 1));
    case "juneteenth":
      return isoFromParts(year, 5, 19);
    case "fathers_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 5, 0, 3));
    case "independence_day":
      return isoFromParts(year, 6, 4);
    case "labor_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 8, 1, 1));
    case "columbus_day":
      return toIsoLocal(nthWeekdayOfMonth(year, 9, 1, 2));
    case "halloween":
      return isoFromParts(year, 9, 31);
    case "veterans_day":
      return isoFromParts(year, 10, 11);
    case "thanksgiving":
      return toIsoLocal(nthWeekdayOfMonth(year, 10, 4, 4));
    case "black_friday": {
      const thanks = nthWeekdayOfMonth(year, 10, 4, 4);
      if (!thanks) return null;
      thanks.setDate(thanks.getDate() + 1);
      return toIsoLocal(thanks);
    }
    case "christmas_eve":
      return isoFromParts(year, 11, 24);
    case "christmas":
      return isoFromParts(year, 11, 25);
    default:
      return null;
  }
}

export const US_HOLIDAYS = [
  { key: "new_year", group: "federal" },
  { key: "mlk_day", group: "federal" },
  { key: "presidents_day", group: "federal" },
  { key: "memorial_day", group: "federal" },
  { key: "juneteenth", group: "federal" },
  { key: "independence_day", group: "federal" },
  { key: "labor_day", group: "federal" },
  { key: "columbus_day", group: "federal" },
  { key: "veterans_day", group: "federal" },
  { key: "thanksgiving", group: "federal" },
  { key: "christmas", group: "federal" },
  { key: "new_years_eve", group: "eve" },
  { key: "christmas_eve", group: "eve" },
  { key: "black_friday", group: "eve" },
  { key: "easter", group: "other" },
  { key: "mothers_day", group: "other" },
  { key: "fathers_day", group: "other" },
  { key: "valentines_day", group: "other" },
  { key: "st_patricks_day", group: "other" },
  { key: "halloween", group: "other" },
];

export function nextHolidayISO(key, todayISO, yearHint) {
  const year = yearHint || Number(todayISO.slice(0, 4));
  const thisYear = getHolidayISO(key, year);
  if (thisYear && thisYear >= todayISO) return thisYear;
  return getHolidayISO(key, year + 1);
}

export function prefillHolidayDates(holidayKey, windowDays, todayISO, yearHint) {
  const baseISO = nextHolidayISO(holidayKey, todayISO, yearHint);
  if (!baseISO) return [];
  const w = Math.min(14, Math.max(0, Number(windowDays) || 0));
  return rangeISO(addDaysISO(baseISO, -w), addDaysISO(baseISO, w)).map((iso) => ({
    date: iso,
    is_closed: iso === baseISO,
    open_time: "",
    close_time: "",
    note: "",
    isHolidayCenter: iso === baseISO,
  }));
}
