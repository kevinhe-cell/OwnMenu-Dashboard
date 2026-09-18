/** Matches backend timezoneMap (EST/CST/MST/PST → IANA). */
export const RESTAURANT_TIME_ZONE_CODES = ["EST", "CST", "MST", "PST"];

export const RESTAURANT_TIME_ZONE_IANA = {
  EST: "America/New_York",
  CST: "America/Chicago",
  MST: "America/Denver",
  PST: "America/Los_Angeles",
};

export function getIanaForRestaurantTimeZone(code) {
  return RESTAURANT_TIME_ZONE_IANA[code] || RESTAURANT_TIME_ZONE_IANA.EST;
}

export function formatRestaurantDateTime(iana, locale = "en-US") {
  const now = new Date();
  const parts = (options) =>
    new Intl.DateTimeFormat(locale, { timeZone: iana, ...options }).formatToParts(now);

  const timeParts = parts({
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const time = timeParts
    .filter((p) => p.type !== "literal" || p.value.trim())
    .map((p) => p.value)
    .join("")
    .trim();

  const date = new Intl.DateTimeFormat(locale, {
    timeZone: iana,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);

  // Some browsers (notably older Safari) don't support `timeZoneName: "shortOffset"`.
  // If Intl throws, we degrade gracefully to no offset/abbr rather than white-screening.
  let offset = "";
  let abbr = "";
  try {
    abbr = parts({ timeZoneName: "short" }).find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    abbr = "";
  }

  return { time, date, offset, abbr };
}

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}
