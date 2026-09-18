const RESTAURANT_TZ_MAP = {
  CST: "America/Chicago",
  EST: "America/New_York",
  PST: "America/Los_Angeles",
  MST: "America/Denver",
};

export function businessDateISO(timeZoneAbbr, date = new Date()) {
  const tz = RESTAURANT_TZ_MAP[timeZoneAbbr] || "America/New_York";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function businessMonthValue(timeZoneAbbr, date = new Date()) {
  const iso = businessDateISO(timeZoneAbbr, date);
  return iso.slice(0, 7);
}
