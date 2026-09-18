import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getSpecialHoursThunk,
  addSpecialHourThunk,
  editSpecialHourThunk,
  deleteSpecialHourThunk,
} from "../../../store/specialHours";
import { fetchHours, updateTimezoneThunk } from "../../../store/Hours";
import { Spinner, Alert, Modal } from "react-bootstrap";
import { ChevronLeft, ChevronRight, X, Check2 } from "react-bootstrap-icons";
import { DateTime } from "luxon";
import RestaurantTimeZonePanel from "./RestaurantTimeZonePanel";
import {
  getIanaForRestaurantTimeZone,
  formatRestaurantDateTime,
} from "../../../utils/restaurantTimeZones";
import {
  US_HOLIDAYS,
  nextHolidayISO,
  addDaysISO,
  getHolidayISO,
} from "../../../utils/usHolidays";
import "./SpecialHoursPage.css";

const TIME_PRESETS = [
  { open: "11:00", close: "21:00", label: "11 AM – 9 PM" },
  { open: "12:00", close: "20:00", label: "12 – 8 PM" },
  { open: "16:00", close: "22:00", label: "4 – 10 PM" },
  { open: "10:00", close: "14:00", label: "10 AM – 2 PM" },
];

function toYyyyMmDd(raw) {
  if (raw == null) return "";
  const s = typeof raw === "string" ? raw : String(raw);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s.slice(0, 10);
}

function formatLong(ymd, locale) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShort(ymd, locale) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimeShort(t) {
  if (!t) return "";
  const m = String(t).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return String(t);
  const dt = new Date(2000, 0, 1, parseInt(m[1], 10), parseInt(m[2], 10), 0);
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function timeInputValue(t) {
  const m = String(t || "").match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "";
  return `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]}`;
}

function weekdayLabels(locale) {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" })
  );
}

function dateTileParts(ymd, locale) {
  if (!ymd) return { mon: "", day: "", week: "" };
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    mon: dt.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
    day: String(d),
    week: dt.toLocaleDateString(locale, { weekday: "long" }),
  };
}

function diffDays(fromISO, toISO) {
  const [ay, am, ad] = fromISO.split("-").map(Number);
  const [by, bm, bd] = toISO.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

function relativeDay(ymd, todayISO, t) {
  const n = diffDays(todayISO, ymd);
  if (n === 0) return t("special_hours.page.today_label");
  if (n === 1) return t("special_hours.page.tomorrow");
  if (n > 1) return t("special_hours.page.in_days", { count: n });
  return t("special_hours.page.ago_days", { count: Math.abs(n) });
}

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DayEditor({
  show,
  onHide,
  onSave,
  onClear,
  date,
  title,
  kicker,
  existing,
  isNew,
  occupiedSet,
  locale,
  t,
}) {
  const [intent, setIntent] = useState("closed");
  const [openTime, setOpenTime] = useState("11:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [extras, setExtras] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const tile = dateTileParts(date, locale);
  const strip = date ? [-2, -1, 0, 1, 2].map((n) => addDaysISO(date, n)) : [];

  useEffect(() => {
    if (!show) return;
    setError("");
    setExtras(new Set());
    if (existing?.is_closed) {
      setIntent("closed");
      setOpenTime("11:00");
      setCloseTime("21:00");
    } else if (existing?.open_time && existing?.close_time) {
      setIntent("custom");
      setOpenTime(timeInputValue(existing.open_time) || "11:00");
      setCloseTime(timeInputValue(existing.close_time) || "21:00");
    } else if (existing) {
      setIntent("weekly");
    } else {
      setIntent("closed");
      setOpenTime("11:00");
      setCloseTime("21:00");
    }
  }, [show, existing, date]);

  const toggleExtra = (ymd) => {
    if (!ymd || ymd === date || occupiedSet?.has(ymd)) return;
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(ymd)) next.delete(ymd);
      else next.add(ymd);
      return next;
    });
  };

  const handleSave = async () => {
    if (intent === "custom" && (!openTime || !closeTime)) {
      setError(t("special_hours.alerts.times_pair"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (intent === "weekly") {
        await onClear();
      } else {
        const dates = [date, ...Array.from(extras)].filter(Boolean).sort();
        await onSave({ intent, openTime, closeTime, dates });
      }
    } catch (err) {
      setError(err?.message || t("special_hours.alerts.create_error"));
    } finally {
      setSaving(false);
    }
  };

  const previewText =
    intent === "closed"
      ? t("special_hours.editor.preview_closed")
      : intent === "custom"
        ? t("special_hours.editor.preview_custom", {
            open: formatTimeShort(openTime),
            close: formatTimeShort(closeTime),
          })
        : t("special_hours.editor.preview_weekly");

  const cta =
    intent === "closed"
      ? t("special_hours.editor.cta_closed")
      : intent === "custom"
        ? t("special_hours.editor.cta_custom")
        : t("special_hours.editor.cta_weekly");

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="sh-dialog"
      contentClassName="sh-sheet"
    >
      <div className="sh-sheet-head">
        <div className="sh-date-tile" aria-hidden="true">
          <span className="sh-date-tile-mon">{tile.mon}</span>
          <span className="sh-date-tile-num">{tile.day}</span>
          <span className="sh-date-tile-wk">{tile.week}</span>
        </div>
        <div className="sh-sheet-copy">
          {kicker ? <div className="sh-editor-kicker">{kicker}</div> : null}
          <h2>{title}</h2>
          <div className="sh-editor-sub">{formatLong(date, locale)}</div>
        </div>
        <button
          type="button"
          className="sh-nav-btn sh-sheet-close"
          onClick={onHide}
          aria-label={t("common.cancel")}
        >
          <X size={16} />
        </button>
      </div>

      <div className="sh-editor">
        <div className={`sh-choices${isNew ? " is-two" : ""}`}>
          <button
            type="button"
            className={`sh-choice${intent === "closed" ? " is-on is-closed" : ""}`}
            onClick={() => setIntent("closed")}
          >
            <strong>{t("special_hours.editor.closed")}</strong>
            <span>{t("special_hours.editor.closed_hint")}</span>
          </button>
          <button
            type="button"
            className={`sh-choice${intent === "custom" ? " is-on" : ""}`}
            onClick={() => setIntent("custom")}
          >
            <strong>{t("special_hours.editor.custom")}</strong>
            <span>{t("special_hours.editor.custom_hint")}</span>
          </button>
          {!isNew ? (
            <button
              type="button"
              className={`sh-choice${intent === "weekly" ? " is-on" : ""}`}
              onClick={() => setIntent("weekly")}
            >
              <strong>{t("special_hours.editor.weekly")}</strong>
              <span>{t("special_hours.editor.weekly_hint")}</span>
            </button>
          ) : null}
        </div>

        {intent === "custom" ? (
          <>
            <div className="sh-times">
              <div className="sh-time-field">
                <label>{t("special_hours.modal.th_opens_at")}</label>
                <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
              </div>
              <div className="sh-time-field">
                <label>{t("special_hours.modal.th_closes_at")}</label>
                <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
              </div>
            </div>
            <div className="sh-presets">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`sh-preset${openTime === p.open && closeTime === p.close ? " is-on" : ""}`}
                  onClick={() => {
                    setOpenTime(p.open);
                    setCloseTime(p.close);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {isNew && intent !== "weekly" ? (
          <>
            <div className="sh-near">
              {intent === "closed"
                ? t("special_hours.editor.include")
                : t("special_hours.editor.include_hours")}
            </div>
            <div className="sh-strip">
              {strip.map((ymd) => {
                const busy = occupiedSet?.has(ymd);
                const on = ymd === date || extras.has(ymd);
                const parts = dateTileParts(ymd, locale);
                return (
                  <button
                    key={ymd}
                    type="button"
                    className={`sh-strip-day${on ? " is-on" : ""}${ymd === date ? " is-center" : ""}${busy ? " is-busy" : ""}`}
                    disabled={busy}
                    onClick={() => toggleExtra(ymd)}
                    title={busy ? t("special_hours.editor.occupied") : formatShort(ymd, locale)}
                  >
                    <em>{parts.week.slice(0, 3)}</em>
                    <strong>{parts.day}</strong>
                    {busy ? <span>{t("special_hours.editor.occupied")}</span> : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div className={`sh-preview is-${intent}`}>
          <small>{t("special_hours.editor.preview")}</small>
          <strong>{previewText}</strong>
        </div>

        {error ? <p className="sh-editor-error">{error}</p> : null}
      </div>

      <div className="sh-editor-foot">
        <div className="sh-foot-left">
          <button type="button" className="sh-btn-ghost" onClick={onHide} disabled={saving}>
            {t("common.cancel")}
          </button>
          {!isNew ? (
            <button
              type="button"
              className="sh-btn-remove"
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  await onClear();
                } catch (err) {
                  setError(err?.message || t("special_hours.alerts.delete_error"));
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {t("special_hours.editor.remove")}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className={`sh-btn-primary${intent === "weekly" ? " is-quiet" : ""}${intent === "closed" ? " is-closed" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Spinner size="sm" /> : cta}
        </button>
      </div>
    </Modal>
  );
}

export default function SpecialHoursPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { specialHours } = useSelector((s) => s.specialHours);
  const restaurantId = useSelector((s) => s.session?.user?.restaurant_id);
  const hours = useSelector((s) => s.hours?.hours);
  const savedTimeZone = hours?.time_zone || "";
  const iana = savedTimeZone ? getIanaForRestaurantTimeZone(savedTimeZone) : "America/Chicago";
  const todayISO = DateTime.now().setZone(iana).toISODate();
  const locale = i18n.language?.startsWith("zh") ? "zh-CN" : "en-US";
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const [clockTick, setClockTick] = useState(0);
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayISO.split("-").map(Number);
    return { year: y, month: m - 1 };
  });
  const [loading, setLoading] = useState(false);
  const [tzSaving, setTzSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showTzEditor, setShowTzEditor] = useState(false);
  const [editor, setEditor] = useState(null);

  const showAlert = (variant, message) => {
    setAlert({ variant, message });
    setTimeout(() => setAlert(null), 4500);
  };

  useEffect(() => {
    const id = setInterval(() => setClockTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (restaurantId) dispatch(fetchHours(restaurantId));
  }, [dispatch, restaurantId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await dispatch(getSpecialHoursThunk());
      } catch {
        showAlert("danger", t("special_hours.alerts.fetch_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, t]);

  useEffect(() => {
    if (!savedTimeZone) setShowTzEditor(true);
  }, [savedTimeZone]);

  const restaurantNow = useMemo(() => {
    void clockTick;
    return formatRestaurantDateTime(iana, locale);
  }, [iana, locale, clockTick]);

  const dayIndex = useMemo(() => {
    const map = {};
    for (const tmpl of specialHours || []) {
      for (const row of tmpl.SpecialHourDates || []) {
        const ymd = toYyyyMmDd(row.date);
        if (ymd) map[ymd] = { tmpl, row };
      }
    }
    return map;
  }, [specialHours]);

  const holidayByDate = useMemo(() => {
    const map = {};
    const year = Number(todayISO.slice(0, 4));
    for (const h of US_HOLIDAYS) {
      for (const y of [year - 1, year, year + 1]) {
        const date = getHolidayISO(h.key, y);
        if (date) map[date] = h;
      }
    }
    return map;
  }, [todayISO]);

  const holidayCards = useMemo(
    () =>
      US_HOLIDAYS.map((h) => {
        const date = nextHolidayISO(h.key, todayISO);
        return { ...h, date, added: !!(date && dayIndex[date]) };
      }).sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [todayISO, dayIndex]
  );

  const upcomingDays = useMemo(
    () =>
      Object.keys(dayIndex)
        .filter((ymd) => ymd >= todayISO)
        .sort()
        .slice(0, 12)
        .map((ymd) => ({ ymd, ...dayIndex[ymd] })),
    [dayIndex, todayISO]
  );

  const cells = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor]);
  const canEdit = !!savedTimeZone;
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  const showingTodayMonth = cursor.year === Number(todayISO.slice(0, 4)) && cursor.month === Number(todayISO.slice(5, 7)) - 1;

  const occupiedSet = useMemo(() => {
    const skip = editor?.tmpl?.id;
    return new Set(
      Object.keys(dayIndex).filter((d) => (skip ? dayIndex[d].tmpl?.id !== skip : true))
    );
  }, [dayIndex, editor]);

  const handleTimeZoneChange = async (value) => {
    if (!restaurantId || !value || value === savedTimeZone) return;
    setTzSaving(true);
    try {
      await dispatch(updateTimezoneThunk(restaurantId, value));
      showAlert("success", t("online_status.swal.success_tz"));
    } catch {
      showAlert("danger", t("online_status.swal.err_tz"));
    } finally {
      setTzSaving(false);
    }
  };

  const openDay = (ymd, holiday) => {
    if (!canEdit || !ymd) return;
    const hit = dayIndex[ymd];
    setEditor({
      date: ymd,
      holiday: holiday || holidayByDate[ymd] || null,
      tmpl: hit?.tmpl || null,
      row: hit?.row || null,
    });
  };

  const closeEditor = () => setEditor(null);

  const saveDay = async ({ intent, openTime, closeTime, dates }) => {
    const center = editor.date;
    const list = (dates?.length ? dates : [center]).sort();
    const occupied = list.filter((d) => dayIndex[d] && dayIndex[d].tmpl?.id !== editor.tmpl?.id);
    if (occupied.length) {
      throw new Error(t("special_hours.alerts.overlap", { dates: occupied.join(", ") }));
    }

    const makeRow = (d) => ({
      date: d,
      is_closed: intent === "closed",
      open_time: intent === "custom" ? openTime : "",
      close_time: intent === "custom" ? closeTime : "",
      note: "",
      isHolidayCenter: d === center,
    });

    if (editor.tmpl && list.length === 1) {
      const rows = (editor.tmpl.SpecialHourDates || []).map((r) => {
        const ymd = toYyyyMmDd(r.date);
        if (ymd !== center) {
          return {
            date: ymd,
            is_closed: !!r.is_closed,
            open_time: timeInputValue(r.open_time),
            close_time: timeInputValue(r.close_time),
            note: r.note || "",
            isHolidayCenter: !!r.is_holiday_center,
          };
        }
        return makeRow(center);
      });
      await dispatch(
        editSpecialHourThunk({
          id: editor.tmpl.id,
          type: editor.tmpl.type,
          title: editor.tmpl.title,
          holiday_key: editor.tmpl.holiday_key,
          window_days: editor.tmpl.window_days,
          start_date: editor.tmpl.start_date,
          end_date: editor.tmpl.end_date,
          rows,
        })
      );
    } else {
      const span = Math.max(0, ...list.map((d) => Math.abs(diffDays(center, d))));
      await dispatch(
        addSpecialHourThunk({
          type: editor.holiday ? "holiday" : "manual",
          title: editor.holiday
            ? t(`special_hours.holidays.${editor.holiday.key}`)
            : formatShort(center, locale),
          holiday_key: editor.holiday?.key,
          window_days: span,
          start_date: list[0],
          end_date: list[list.length - 1],
          rows: list.map(makeRow),
        })
      );
    }
    showAlert("success", t("special_hours.alerts.update_success"));
    closeEditor();
  };

  const clearDay = async () => {
    if (!editor?.tmpl) {
      closeEditor();
      return;
    }
    const remaining = (editor.tmpl.SpecialHourDates || []).filter(
      (r) => toYyyyMmDd(r.date) !== editor.date
    );
    if (!remaining.length) {
      await dispatch(deleteSpecialHourThunk(editor.tmpl.id));
    } else {
      await dispatch(
        editSpecialHourThunk({
          id: editor.tmpl.id,
          type: editor.tmpl.type,
          title: editor.tmpl.title,
          holiday_key: editor.tmpl.holiday_key,
          window_days: editor.tmpl.window_days,
          start_date: editor.tmpl.start_date,
          end_date: editor.tmpl.end_date,
          rows: remaining.map((r) => ({
            date: toYyyyMmDd(r.date),
            is_closed: !!r.is_closed,
            open_time: timeInputValue(r.open_time),
            close_time: timeInputValue(r.close_time),
            note: r.note || "",
            isHolidayCenter: !!r.is_holiday_center,
          })),
        })
      );
    }
    showAlert("success", t("special_hours.alerts.delete_success"));
    closeEditor();
  };

  const shiftMonth = (delta) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const jumpToday = () => {
    const [y, m] = todayISO.split("-").map(Number);
    setCursor({ year: y, month: m - 1 });
  };

  const dayStatus = (ymd) => {
    const hit = dayIndex[ymd];
    const holiday = holidayByDate[ymd] ? " is-holiday" : "";
    if (!hit) return holiday;
    if (hit.row.is_closed) return `is-closed${holiday}`;
    if (hit.row.open_time && hit.row.close_time) return `is-custom${holiday}`;
    return holiday;
  };

  return (
    <div className="sh-page">
      <header className="sh-hero">
        <div>
          <h1>{t("special_hours.page.title")}</h1>
          <p>{t("special_hours.page.hero_cal")}</p>
        </div>
      </header>

      <section className="sh-tz">
        <span className="sh-tz-label">{t("special_hours.page.tz_shared")}</span>
        {savedTimeZone ? (
          <span className="sh-tz-value">
            {savedTimeZone}
            <span className="sh-tz-sep">·</span>
            {t(`online_status.tz_regions.${savedTimeZone}`)}
            {restaurantNow?.time ? (
              <>
                <span className="sh-tz-sep">·</span>
                {restaurantNow.time}
              </>
            ) : null}
          </span>
        ) : (
          <span className="sh-tz-value is-warn">{t("online_status.tz_not_set")}</span>
        )}
        <button type="button" className="sh-tz-link" onClick={() => setShowTzEditor((v) => !v)}>
          {savedTimeZone ? t("special_hours.page.change_tz") : t("special_hours.page.set_tz")}
        </button>
      </section>
      {(showTzEditor || !savedTimeZone) && (
        <div className="sh-tz-editor">
          {!savedTimeZone ? (
            <p className="sh-tz-warn">{t("special_hours.page.tz_required")}</p>
          ) : (
            <p className="sh-tz-hint">
              {t("special_hours.page.tz_linked")}{" "}
              <Link to="/online-status">{t("special_hours.page.info_4_link")}</Link>
            </p>
          )}
          {tzSaving ? (
            <Spinner size="sm" />
          ) : (
            <RestaurantTimeZonePanel
              savedTimeZone={savedTimeZone}
              onTimeZoneChange={handleTimeZoneChange}
              disabled={tzSaving || !restaurantId}
            />
          )}
        </div>
      )}

      {alert ? (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      ) : null}

      <div className="sh-rail-label">{t("special_hours.page.holidays_title")}</div>
      <div className="sh-pills">
        {holidayCards.map((h) => (
          <button
            key={h.key}
            type="button"
            className={`sh-pill${h.added ? " is-added" : ""}`}
            disabled={!canEdit}
            onClick={() => openDay(h.date, h)}
          >
            <strong>
              {h.added ? <Check2 size={12} /> : null}
              {t(`special_hours.holidays.${h.key}`)}
            </strong>
            <span>
              {h.date ? formatShort(h.date, locale) : "—"}
              {h.date ? ` · ${relativeDay(h.date, todayISO, t)}` : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="sh-workspace">
        <div className="sh-cal">
          <div className="sh-cal-nav">
            <button
              type="button"
              className="sh-nav-btn"
              onClick={() => shiftMonth(-1)}
              aria-label={t("special_hours.page.prev_month")}
            >
              <ChevronLeft />
            </button>
            <div className="sh-cal-title">
              <h2>{monthLabel}</h2>
              {!showingTodayMonth ? (
                <button type="button" className="sh-today-jump" onClick={jumpToday}>
                  {t("special_hours.page.jump_today")}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="sh-nav-btn"
              onClick={() => shiftMonth(1)}
              aria-label={t("special_hours.page.next_month")}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="sh-weekdays">
            {weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="sh-grid">
            {cells.map((ymd, i) =>
              ymd ? (
                <button
                  key={ymd}
                  type="button"
                  className={`sh-cell${ymd === todayISO ? " is-today" : ""} ${dayStatus(ymd)}`}
                  disabled={!canEdit}
                  title={
                    holidayByDate[ymd]
                      ? t(`special_hours.holidays.${holidayByDate[ymd].key}`)
                      : formatLong(ymd, locale)
                  }
                  onClick={() => openDay(ymd, holidayByDate[ymd] || null)}
                >
                  <span className="sh-cell-num">{Number(ymd.slice(8))}</span>
                  {holidayByDate[ymd] && !dayIndex[ymd] ? <i className="sh-hol-mark" /> : null}
                  {dayIndex[ymd]?.row?.is_closed ? (
                    <span className="sh-cell-tag">{t("special_hours.editor.closed")}</span>
                  ) : dayIndex[ymd]?.row?.open_time ? (
                    <span className="sh-cell-tag">{formatTimeShort(dayIndex[ymd].row.open_time)}</span>
                  ) : null}
                </button>
              ) : (
                <span key={`e-${i}`} />
              )
            )}
          </div>
          <div className="sh-legend">
            <span>
              <i className="is-closed" />
              {t("special_hours.editor.closed")}
            </span>
            <span>
              <i className="is-custom" />
              {t("special_hours.editor.custom")}
            </span>
            <span>
              <i className="is-holiday" />
              {t("special_hours.page.holidays_title")}
            </span>
          </div>
        </div>

        <aside className="sh-side">
          <h3>{t("special_hours.page.upcoming_title")}</h3>
          {loading && !upcomingDays.length ? (
            <div className="sh-empty-side">
              <Spinner size="sm" />
            </div>
          ) : upcomingDays.length === 0 ? (
            <div className="sh-empty-side">{t("special_hours.page.no_upcoming_hint")}</div>
          ) : (
            upcomingDays.map(({ ymd, row, tmpl }) => (
              <button key={ymd} type="button" className="sh-event" onClick={() => openDay(ymd, holidayByDate[ymd] || null)}>
                <i className={`sh-event-mark${row.is_closed ? " closed" : " custom"}`} />
                <div>
                  <strong>{tmpl?.title || formatShort(ymd, locale)}</strong>
                  <span>
                    {formatShort(ymd, locale)} · {relativeDay(ymd, todayISO, t)}
                  </span>
                </div>
                <em>
                  {row.is_closed
                    ? t("special_hours.editor.closed")
                    : row.open_time && row.close_time
                      ? `${formatTimeShort(row.open_time)} – ${formatTimeShort(row.close_time)}`
                      : t("special_hours.editor.weekly")}
                </em>
              </button>
            ))
          )}
        </aside>
      </div>

      <DayEditor
        show={!!editor}
        onHide={closeEditor}
        onSave={saveDay}
        onClear={clearDay}
        date={editor?.date}
        title={
          editor?.holiday
            ? t(`special_hours.holidays.${editor.holiday.key}`)
            : editor?.tmpl?.title || t("special_hours.editor.this_day")
        }
        kicker={editor?.holiday ? t("special_hours.page.holidays_title") : t("special_hours.editor.kicker")}
        existing={editor?.row}
        isNew={!editor?.tmpl}
        occupiedSet={occupiedSet}
        locale={locale}
        t={t}
      />
    </div>
  );
}
