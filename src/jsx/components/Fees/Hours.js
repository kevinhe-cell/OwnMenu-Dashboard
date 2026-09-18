import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHours,
  updateRegularHoursThunk,
  updateTimezoneThunk,
} from "../../../store/Hours";
import { Row, Col, Card, Accordion, Form, Button, Alert } from "react-bootstrap";
import swal from "sweetalert";
import { changeOnlineStatusThunk, changeManualStopOrderThunk, getRestaurantThunk } from "../../../store/restaurants";
import { useTranslation } from "react-i18next";
import RestaurantTimeZonePanel from "./RestaurantTimeZonePanel";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function Hours({ id }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const hours = useSelector((state) => state?.hours?.hours);
  const [timeZone, setTimeZone] = useState("");
  const [hourData, setHourData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const [stoppedOrdering, setStoppedOrdering] = useState(false);
  const [manualStopOrder, setManualStopOrder] = useState(false);
  const [manualStopSaving, setManualStopSaving] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const options = { month: "short", day: "2-digit", year: "numeric" };
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(tomorrow);
  const tomorrowDate = `${parts.find((p) => p.type === "month").value} ${parts.find((p) => p.type === "day").value}, ${parts.find((p) => p.type === "year").value}`;

  useEffect(() => {
    if (restaurant) {
      setManualStopOrder(!!restaurant.manual_stop_order);
      setStoppedOrdering(!!restaurant.stop_order && !restaurant.manual_stop_order);
    }
  }, [restaurant]);

  useEffect(() => {
    dispatch(fetchHours(id));
    dispatch(getRestaurantThunk());
  }, [dispatch, id]);

  const savedTimeZone = timeZone || hours?.time_zone || "";

  useEffect(() => {
    if (hours) {
      setTimeZone(hours.time_zone);
      const formatted = {};
      for (const day of daysOfWeek) {
        const val = hours[day] || "";
        if (!val || String(val).trim().toLowerCase() === "closed") {
          formatted[day] = {
            open: "",
            close: "",
            breakStart: "",
            breakEnd: "",
          };
        } else {
          const [main, breakStr] = val.split("|") || [];
          const [open, close] = main.split("-") || [];
          const [breakStart, breakEnd] = breakStr?.split("-") || [];
          const norm = (t) => {
            if (!t) return "";
            const m = String(t).match(/^(\d{1,2}):(\d{2})/);
            if (!m) return t;
            return `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]}`;
          };
          formatted[day] = {
            open: norm(open),
            close: norm(close),
            breakStart: norm(breakStart),
            breakEnd: norm(breakEnd),
          };
        }
      }
      setHourData(formatted);
    }
  }, [hours]);

  const handleGoOffline = () => {
    swal({
      title: t("online_status.swal.offline_title"),
      text: t("online_status.swal.offline_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("online_status.swal.btn_go_offline")],
      dangerMode: true,
    }).then((willGoOffline) => {
      if (willGoOffline) {
        dispatch(changeOnlineStatusThunk(id)).catch((err) => {
          swal(t("common.error"), err.message || t("online_status.swal.err_update"), "error");
        });
      }
    });
  };

  const handleGoOnline = () => {
    swal({
      title: t("online_status.swal.online_title"),
      text: t("online_status.swal.online_text"),
      icon: "info",
      buttons: [t("common.cancel"), t("online_status.swal.btn_go_online")],
    }).then((willGoOnline) => {
      if (willGoOnline) {
        dispatch(changeOnlineStatusThunk(id)).catch((err) => {
          swal(t("common.error"), err.message || t("online_status.swal.err_update"), "error");
        });
      }
    });
  };

  const handleManualStopToggle = async () => {
    const enabling = !manualStopOrder;
    const MANUAL_STOP_PASSCODE = "0930";

    if (enabling) {
      const gate = await swal({
        title: t("online_status.manual_stop.swal_off_title"),
        text: t("online_status.manual_stop.swal_off_text"),
        icon: "warning",
        content: {
          element: "input",
          attributes: {
            placeholder: t("online_status.manual_stop.passcode_placeholder"),
            type: "password",
            inputMode: "numeric",
          },
        },
        buttons: {
          cancel: t("common.cancel"),
          confirm: {
            text: t("online_status.manual_stop.btn_stop"),
          },
        },
        dangerMode: true,
        closeOnClickOutside: false,
      });

      if (gate === null) return;
      const passcode = String(gate || "").trim();
      if (passcode !== MANUAL_STOP_PASSCODE) {
        swal(
          t("common.error"),
          passcode
            ? t("online_status.manual_stop.passcode_incorrect")
            : t("online_status.manual_stop.passcode_required"),
          "error",
        );
        return;
      }
    } else {
      const confirmed = await swal({
        title: t("online_status.manual_stop.swal_on_title"),
        text: t("online_status.manual_stop.swal_on_text"),
        icon: "warning",
        buttons: [t("common.cancel"), t("online_status.manual_stop.btn_resume")],
      });
      if (!confirmed) return;
    }

    setManualStopSaving(true);
    try {
      await dispatch(changeManualStopOrderThunk(id, enabling));
      swal(
        t("common.success"),
        enabling
          ? t("online_status.manual_stop.success_stopped")
          : t("online_status.manual_stop.success_resumed"),
        "success",
      );
    } catch (err) {
      swal(t("common.error"), err.message || t("online_status.swal.err_update"), "error");
    } finally {
      setManualStopSaving(false);
    }
  };

  const handleChange = (day, field, value) => {
    setHourData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async (day) => {
    const d = hourData[day];

    if ((d.open && !d.close) || (!d.open && d.close)) {
      swal(t("common.error"), t("online_status.swal.err_open_close"), "error");
      return;
    }

    if ((d.breakStart && !d.breakEnd) || (!d.breakStart && d.breakEnd)) {
      swal(t("common.error"), t("online_status.swal.err_break"), "error");
      return;
    }

    setIsSaving(true);
    try {
      if (!d.open && !d.close) {
        await dispatch(
          updateRegularHoursThunk(id, day, "CLOSED", "CLOSED", "", "", "CLOSED"),
        );
      } else {
        let timeString = `${d.open}-${d.close}`;
        if (d.breakStart && d.breakEnd) {
          timeString += `|${d.breakStart}-${d.breakEnd}`;
        }

        await dispatch(
          updateRegularHoursThunk(
            id,
            day,
            d.open,
            d.close,
            d.breakStart || "",
            d.breakEnd || "",
            timeString,
          ),
        );
      }

      swal(t("common.success"), t("online_status.swal.success_update"), "success");
    } catch (error) {
      console.error("Update failed", error);
      swal(t("common.error"), t("online_status.swal.err_update"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async (day) => {
    setIsSaving(true);
    try {
      await dispatch(
        updateRegularHoursThunk(id, day, "CLOSED", "CLOSED", "", "", "CLOSED"),
      );
      setHourData((prev) => ({
        ...prev,
        [day]: {
          open: "",
          close: "",
          breakStart: "",
          breakEnd: "",
        },
      }));
      swal(t("common.success"), t("online_status.swal.success_update"), "success");
    } catch (error) {
      swal(t("common.error"), t("online_status.swal.err_update"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const copyMondayToAll = async () => {
    const base = hourData["monday"];
    if (!base.open || !base.close) {
      swal(t("common.error"), t("online_status.swal.err_monday"), "error");
      return;
    }

    setIsSaving(true);
    const string =
      `${base.open}-${base.close}` +
      (base.breakStart && base.breakEnd ? `|${base.breakStart}-${base.breakEnd}` : "");

    try {
      const updates = {};
      for (const day of daysOfWeek) {
        if (day !== "monday") {
          updates[day] = { ...base };
          await dispatch(
            updateRegularHoursThunk(
              id,
              day,
              base.open,
              base.close,
              base.breakStart || "",
              base.breakEnd || "",
              string,
            ),
          );
        }
      }
      setHourData((prev) => ({ ...prev, ...updates }));
      swal(t("common.success"), t("online_status.swal.success_copy"), "success");
    } catch (err) {
      swal(t("common.error"), t("online_status.swal.err_copy"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeZoneChange = async (value) => {
    if (!value || value === savedTimeZone) return;
    setIsSaving(true);
    try {
      setTimeZone(value);
      await dispatch(updateTimezoneThunk(id, value));
      swal(t("common.success"), t("online_status.swal.success_tz"), "success");
    } catch (error) {
      swal(t("common.error"), t("online_status.swal.err_tz"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      {isSaving && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("common.saving")}</span>
          </div>
        </div>
      )}
      <Card className="text-center shadow border-0 mt-4">
        <Alert variant={manualStopOrder ? "danger" : "secondary"}>
          <strong>{t("online_status.manual_stop.note_label")}</strong>{" "}
          {t("online_status.manual_stop.note_desc")}
        </Alert>
        <Card.Body>
          <Card.Title className={manualStopOrder ? "text-danger" : "text-dark"}>
            {manualStopOrder
              ? t("online_status.manual_stop.status_stopped")
              : t("online_status.manual_stop.status_active")}
          </Card.Title>
          {manualStopOrder && (
            <div className="text-muted">{t("online_status.manual_stop.resume_manual")}</div>
          )}
          <Button
            variant={manualStopOrder ? "outline-success" : "outline-danger"}
            onClick={handleManualStopToggle}
            className="mt-3 fw-semibold"
            disabled={manualStopSaving}
          >
            {manualStopSaving
              ? t("common.saving")
              : manualStopOrder
                ? t("online_status.manual_stop.btn_resume")
                : t("online_status.manual_stop.btn_stop")}
          </Button>
        </Card.Body>
      </Card>

      <Card className={`text-center shadow border-0 mt-4 ${manualStopOrder ? "opacity-50" : ""}`}>
        <Alert variant="warning">
          <strong>{t("online_status.note_label")}</strong> {t("online_status.note_desc")}
        </Alert>

        <Card.Body>
          <Card.Title className={stoppedOrdering || manualStopOrder ? "text-danger" : "text-success"}>
            {manualStopOrder
              ? t("online_status.manual_stop.blocked_by_manual")
              : stoppedOrdering
              ? t("online_status.status_offline")
              : t("online_status.status_online")}
          </Card.Title>
          {stoppedOrdering && !manualStopOrder && (
            <div className="text-muted">
              {t("online_status.resume_on")}<strong>{tomorrowDate}</strong>.
            </div>
          )}
          <Button
            variant={stoppedOrdering ? "outline-danger" : "outline-success"}
            onClick={stoppedOrdering ? handleGoOnline : handleGoOffline}
            className="mt-3 fw-semibold"
            disabled={manualStopOrder}
          >
            {stoppedOrdering ? t("online_status.btn_enable") : t("online_status.btn_pause")}
          </Button>
          {manualStopOrder && (
            <div className="small text-muted mt-2">{t("online_status.manual_stop.pause_disabled")}</div>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow">
        <Card.Header className="bg-white">
          <h4 className="fw-bold mb-2">{t("online_status.title_hours")}</h4>

          <RestaurantTimeZonePanel
            savedTimeZone={savedTimeZone}
            onTimeZoneChange={handleTimeZoneChange}
            disabled={isSaving || (!savedTimeZone && !hours)}
          />

          <Button variant="outline-primary" size="sm" className="mt-3" onClick={copyMondayToAll}>
            {t("online_status.btn_copy")}
          </Button>
        </Card.Header>

        <Card.Body>
          <Accordion defaultActiveKey="0">
            {daysOfWeek.map((day, i) => (
              <Accordion.Item key={day} eventKey={`${i}`}>
                <Accordion.Header>
                  <div className="w-100 d-flex flex-column justify-content-between">
                    <span className="text-capitalize fw-semibold">{t(`online_status.days.${day}`)}</span>
                    <span className="text-muted small">
                      {hourData[day]?.open || t("online_status.closed")} - {hourData[day]?.close || t("online_status.closed")}
                    </span>
                  </div>
                </Accordion.Header>

                <Accordion.Body>
                  <Row className="mb-3">
                    <Col md={6} lg={3}>
                      <Form.Label>{t("online_status.open_label")}</Form.Label>
                      <Form.Control
                        type="time"
                        value={hourData[day]?.open || ""}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) => handleChange(day, "open", e.target.value)}
                      />
                    </Col>
                    <Col md={6} lg={3}>
                      <Form.Label>{t("online_status.close_label")}</Form.Label>
                      <Form.Control
                        type="time"
                        value={hourData[day]?.close || ""}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) => handleChange(day, "close", e.target.value)}
                      />
                    </Col>
                    <Col md={6} lg={3}>
                      <Form.Label>{t("online_status.break_start")}</Form.Label>
                      <Form.Control
                        type="time"
                        value={hourData[day]?.breakStart || ""}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) => handleChange(day, "breakStart", e.target.value)}
                      />
                    </Col>
                    <Col md={6} lg={3}>
                      <Form.Label>{t("online_status.break_end")}</Form.Label>
                      <Form.Control
                        type="time"
                        value={hourData[day]?.breakEnd || ""}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) => handleChange(day, "breakEnd", e.target.value)}
                      />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => handleSave(day)}>
                      {t("common.save")}
                    </Button>
                    <Button variant="outline-danger" onClick={() => handleClose(day)}>
                      {t("online_status.btn_close_today")}
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Hours;
