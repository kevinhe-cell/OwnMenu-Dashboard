import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Form, Alert, Badge } from "react-bootstrap";
import { Globe, Clock, CheckCircleFill, ExclamationTriangleFill } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import {
  RESTAURANT_TIME_ZONE_CODES,
  formatRestaurantDateTime,
  getBrowserTimeZone,
  getIanaForRestaurantTimeZone,
} from "../../../utils/restaurantTimeZones";

function formatTime12(time24, locale) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDayHoursSummary(dayData, locale, closedLabel) {
  if (!dayData?.open && !dayData?.close) return { closed: true, text: closedLabel };
  const open = formatTime12(dayData.open, locale);
  const close = formatTime12(dayData.close, locale);
  let text = `${open} – ${close}`;
  if (dayData.breakStart && dayData.breakEnd) {
    text += ` · ${formatTime12(dayData.breakStart, locale)}–${formatTime12(dayData.breakEnd, locale)}`;
  }
  return { closed: false, text };
}

export default function RestaurantTimeZonePanel({
  savedTimeZone,
  onTimeZoneChange,
  disabled = false,
}) {
  const { t, i18n } = useTranslation();
  const intlLocale = i18n.language?.startsWith("zh") ? "zh-CN" : "en-US";
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => setClockTick((n) => n + 1), 1000);
    return () => clearInterval(timerId);
  }, []);

  const savedIana = savedTimeZone
    ? getIanaForRestaurantTimeZone(savedTimeZone)
    : null;

  const restaurantNow = useMemo(() => {
    if (!savedIana) return null;
    void clockTick;
    return formatRestaurantDateTime(savedIana, intlLocale);
  }, [savedIana, intlLocale, clockTick]);

  const browserTz = useMemo(() => getBrowserTimeZone(), []);
  const browserNow = useMemo(() => {
    if (!browserTz) return null;
    void clockTick;
    return formatRestaurantDateTime(browserTz, intlLocale);
  }, [browserTz, intlLocale, clockTick]);

  const browserDiffers = savedIana && browserTz && browserTz !== savedIana;
  const browserMatches = savedIana && browserTz && browserTz === savedIana;

  const zoneOptions = useMemo(
    () =>
      RESTAURANT_TIME_ZONE_CODES.map((code) => {
        const iana = getIanaForRestaurantTimeZone(code);
        void clockTick;
        return {
          code,
          iana,
          now: formatRestaurantDateTime(iana, intlLocale),
          region: t(`online_status.tz_regions.${code}`),
        };
      }),
    [t, intlLocale, clockTick],
  );

  const handlePick = (code) => {
    if (disabled || code === savedTimeZone) return;
    onTimeZoneChange(code);
  };

  return (
    <div
      className="rounded-3 overflow-hidden text-start"
      style={{
        border: "1px solid var(--rgba-primary-2, rgba(221, 47, 110, 0.2))",
        background: "linear-gradient(180deg, var(--rgba-primary-1, rgba(221,47,110,0.06)) 0%, #fff 48%)",
      }}
    >
      <div
        className="px-3 py-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
        style={{ borderBottom: "1px solid var(--rgba-primary-1, rgba(221,47,110,0.1))" }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 40,
              height: 40,
              background: "var(--rgba-primary-1, rgba(221,47,110,0.12))",
              color: "var(--primary, #dd2f6e)",
            }}
          >
            <Globe size={20} />
          </span>
          <div>
            <h5 className="mb-0 fw-semibold">{t("online_status.tz_section_title")}</h5>
            <div className="small text-muted">{t("online_status.tz_select_prompt")}</div>
          </div>
        </div>
        {savedTimeZone ? (
          <Badge
            bg=""
            className="px-3 py-2 rounded-pill fw-semibold"
            style={{
              background: "var(--primary, #dd2f6e)",
              color: "#fff",
              fontSize: "0.95rem",
            }}
          >
            {savedTimeZone}
          </Badge>
        ) : (
          <Badge bg="secondary" className="px-3 py-2 rounded-pill">
            {t("online_status.tz_not_set")}
          </Badge>
        )}
      </div>

      <div className="p-3">
        {savedTimeZone && restaurantNow && (
          <Row className="g-3 mb-3">
            <Col lg={7}>
              <div
                className="h-100 rounded-3 p-3 bg-white"
                style={{ border: "1px solid #e9ecef" }}
              >
                <div className="small text-muted text-uppercase fw-semibold mb-2 letter-spacing-1">
                  {t("online_status.tz_saved_label")}
                </div>
                <div className="fw-bold fs-5 mb-1" style={{ color: "#212529" }}>
                  {t(`online_status.tz_regions.${savedTimeZone}`)}
                </div>
                <code className="small text-muted bg-light px-2 py-1 rounded">
                  {savedIana}
                </code>
                {(restaurantNow.offset || restaurantNow.abbr) && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {restaurantNow.offset && (
                      <Badge bg="light" text="dark" className="fw-normal border">
                        {restaurantNow.offset}
                      </Badge>
                    )}
                    {restaurantNow.abbr && (
                      <Badge bg="light" text="dark" className="fw-normal border">
                        {restaurantNow.abbr}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Col>
            <Col lg={5}>
              <div
                className="h-100 rounded-3 p-3 text-center d-flex flex-column justify-content-center"
                style={{
                  background: "var(--rgba-primary-1, rgba(221,47,110,0.08))",
                  border: "2px solid var(--rgba-primary-2, rgba(221,47,110,0.25))",
                }}
              >
                <div className="d-flex align-items-center justify-content-center gap-1 small text-muted text-uppercase fw-semibold mb-1">
                  <Clock size={14} />
                  {t("online_status.tz_current_time_label")}
                </div>
                <div
                  className="fw-bold font-monospace lh-1 my-1"
                  style={{ fontSize: "2.5rem", color: "var(--primary, #dd2f6e)" }}
                >
                  {restaurantNow.time}
                </div>
                <div className="text-muted">{restaurantNow.date}</div>
              </div>
            </Col>
          </Row>
        )}

        {browserDiffers && browserNow && restaurantNow && (
          <Alert
            variant="warning"
            className="d-flex gap-2 align-items-start small py-2 mb-3 border-0"
            style={{ background: "#fff8e6" }}
          >
            <ExclamationTriangleFill className="flex-shrink-0 mt-1" size={18} />
            <div>
              <div className="fw-semibold mb-1">{t("online_status.tz_mismatch_title")}</div>
              <Row className="g-2">
                <Col sm={6}>
                  <span className="text-muted d-block">{t("online_status.tz_your_device")}</span>
                  <span className="font-monospace fw-semibold">{browserNow.time}</span>
                  <span className="text-muted small d-block">{browserTz}</span>
                </Col>
                <Col sm={6}>
                  <span className="text-muted d-block">{t("online_status.tz_restaurant")}</span>
                  <span className="font-monospace fw-semibold">{restaurantNow.time}</span>
                  <span className="text-muted small d-block">{savedIana}</span>
                </Col>
              </Row>
            </div>
          </Alert>
        )}

        {browserMatches && (
          <Alert
            variant="success"
            className="d-flex gap-2 align-items-center small py-2 mb-3 border-0"
            style={{ background: "#e8f5e9" }}
          >
            <CheckCircleFill className="flex-shrink-0" size={18} />
            <span>{t("online_status.tz_match_ok")}</span>
          </Alert>
        )}

        <Row className="g-2 mb-2">
          {zoneOptions.map(({ code, now, region }) => {
            const active = savedTimeZone === code;
            return (
              <Col xs={6} lg={3} key={code}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handlePick(code)}
                  className={`w-100 text-start rounded-3 p-3 border transition-all ${
                    active ? "shadow-sm" : ""
                  }`}
                  style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                    borderColor: active
                      ? "var(--primary, #dd2f6e)"
                      : "#dee2e6",
                    borderWidth: active ? 2 : 1,
                    background: active
                      ? "var(--rgba-primary-1, rgba(221,47,110,0.1))"
                      : "#fff",
                    opacity: disabled ? 0.65 : 1,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span
                      className="fw-bold"
                      style={{
                        fontSize: "1.25rem",
                        color: active ? "var(--primary, #dd2f6e)" : "#212529",
                      }}
                    >
                      {code}
                    </span>
                    {active && (
                      <Badge
                        bg=""
                        className="rounded-pill"
                        style={{
                          background: "var(--primary, #dd2f6e)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {t("online_status.tz_active")}
                      </Badge>
                    )}
                  </div>
                  <div className="small text-muted lh-sm mb-2" style={{ minHeight: "2.5em" }}>
                    {region}
                  </div>
                  <div
                    className="font-monospace fw-semibold"
                    style={{ color: active ? "var(--primary, #dd2f6e)" : "#6c757d" }}
                  >
                    {now.time}
                  </div>
                </button>
              </Col>
            );
          })}
        </Row>

        <Form.Text className="text-muted d-block mt-1">{t("online_status.tz_hint")}</Form.Text>

        <Form.Group className="mt-3 d-none d-md-block">
          <Form.Label className="small text-muted mb-1">
            {t("online_status.tz_change_label")}
          </Form.Label>
          <Form.Select
            value={savedTimeZone}
            onChange={(e) => handlePick(e.target.value)}
            disabled={disabled || !savedTimeZone}
            size="sm"
          >
            {zoneOptions.map(({ code, now, region }) => (
              <option key={code} value={code}>
                {code} — {region} ({now.time})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
}
