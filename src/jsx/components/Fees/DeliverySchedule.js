import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Accordion,
  Form,
  Button,
  Alert,
  Modal,
  Badge,
} from "react-bootstrap";
import swal from "sweetalert";
import {
  getFeesThunk,
  updateAutoDeliveryEnabledThunk,
  updateAutoDeliveryFeesThunk,
  updateDeliveryScheduleDayThunk,
  updateDeliveryTimezoneThunk,
  replaceDeliveryScheduleThunk,
} from "../../../store/fees";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_ZONES = ["EST", "CST", "PST", "MST"];

const emptySlot = () => ({ start: "", end: "" });

const buildEmptySchedule = () => {
  const out = {};
  for (let i = 0; i <= 6; i++) out[String(i)] = emptySlot();
  return out;
};

function DoordashFeesModal({ show, onClose, initial, onSave, isSaving }) {
  const [deliveryFee, setDeliveryFee] = useState(initial.deliveryFee);
  const [serviceFee, setServiceFee] = useState(initial.serviceFee);

  useEffect(() => {
    setDeliveryFee(initial.deliveryFee);
    setServiceFee(initial.serviceFee);
  }, [initial, show]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Doordash Fees</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-3">
          These fees are applied while the schedule is in a Doordash window.
          Self-delivery fees are saved automatically when switching to Doordash
          and restored when switching back.
        </p>
        <Row className="g-3">
          <Col xs={12}>
            <Form.Label className="small mb-1">Delivery fee ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 7.00"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <Form.Label className="small mb-1">
              Service fee (decimal, 0 = 0%, 0.1 = 10%)
            </Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="e.g. 0"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onSave({ deliveryFee, serviceFee })}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save Fees"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function DeliverySchedule() {
  const dispatch = useDispatch();
  const fees = useSelector((state) => state.fees?.fees);

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [timezone, setTimezone] = useState("EST");
  const [scheduleData, setScheduleData] = useState(buildEmptySchedule());
  const [doordashDeliveryFee, setDoordashDeliveryFee] = useState("");
  const [doordashServiceFee, setDoordashServiceFee] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);

  useEffect(() => {
    if (!fees || fees.message) return;
    setAutoEnabled(!!fees.auto_delivery_switch_enabled);
    setTimezone(fees.delivery_time_zone || "EST");
    const incoming = fees.auto_delivery_schedule || {};
    const next = buildEmptySchedule();
    for (let i = 0; i <= 6; i++) {
      const key = String(i);
      const slot = incoming[key];
      if (slot && typeof slot === "object") {
        next[key] = {
          start: slot.start || "",
          end: slot.end || "",
        };
      }
    }
    setScheduleData(next);
    setDoordashDeliveryFee(
      fees.auto_delivery_doordash_delivery_fee != null
        ? String(fees.auto_delivery_doordash_delivery_fee)
        : "",
    );
    setDoordashServiceFee(
      fees.auto_delivery_doordash_service_fee != null
        ? String(fees.auto_delivery_doordash_service_fee)
        : "",
    );
  }, [fees]);

  useEffect(() => {
    if (!fees || fees.message) {
      dispatch(getFeesThunk());
    }
  }, [dispatch, fees]);

  const setDayField = (dayKey, field, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || emptySlot()),
        [field]: value,
      },
    }));
  };

  const handleToggleAuto = async (e) => {
    const enabled = e.target.checked;
    setIsSaving(true);
    try {
      await dispatch(updateAutoDeliveryEnabledThunk(enabled));
      setAutoEnabled(enabled);
      swal(
        "Success",
        enabled
          ? "Automatic delivery switch enabled."
          : "Automatic delivery switch disabled.",
        "success",
      );
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to update.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimezoneChange = async (e) => {
    const value = e.target.value;
    setIsSaving(true);
    try {
      setTimezone(value);
      await dispatch(updateDeliveryTimezoneThunk(value));
      swal("Success", "Updated delivery time zone!", "success");
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to update time zone.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const validateSlot = (slot) => {
    const start = slot?.start || "";
    const end = slot?.end || "";
    if (!start && !end) return null;
    if (!start || !end) {
      return "Both Doordash start and end times must be set (or both empty).";
    }
    if (start === end) return "Start and end must differ.";
    return null;
  };

  const handleSaveDay = async (dayKey) => {
    const slot = scheduleData[dayKey] || emptySlot();
    const error = validateSlot(slot);
    if (error) {
      swal("Error", error, "error");
      return;
    }
    setIsSaving(true);
    try {
      await dispatch(
        updateDeliveryScheduleDayThunk(dayKey, slot.start, slot.end),
      );
      swal("Success", "Schedule updated successfully!", "success");
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to save schedule.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDay = async (dayKey) => {
    setIsSaving(true);
    try {
      setScheduleData((prev) => ({ ...prev, [dayKey]: emptySlot() }));
      await dispatch(updateDeliveryScheduleDayThunk(dayKey, "", ""));
      swal("Success", "Set to all-day Self delivery.", "success");
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to update.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySundayToAll = async () => {
    const base = scheduleData["0"] || emptySlot();
    const error = validateSlot(base);
    if (error) {
      swal("Error", `Sunday is invalid: ${error}`, "error");
      return;
    }
    setIsSaving(true);
    try {
      const next = {};
      for (let i = 0; i <= 6; i++) {
        next[String(i)] = { start: base.start || "", end: base.end || "" };
      }
      setScheduleData(next);
      await dispatch(replaceDeliveryScheduleThunk(next));
      swal("Success", "Copied Sunday's window to all days!", "success");
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to copy.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFees = async ({ deliveryFee, serviceFee }) => {
    setIsSaving(true);
    try {
      const payload = {};
      if (deliveryFee !== "") payload.doordashDeliveryFee = deliveryFee;
      if (serviceFee !== "") payload.doordashServiceFee = serviceFee;
      await dispatch(updateAutoDeliveryFeesThunk(payload));
      setShowFeesModal(false);
      swal("Success", "Doordash fees updated!", "success");
    } catch (err) {
      console.error(err);
      swal("Error", err.message || "Failed to save fees.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const activeDayCount = Object.values(scheduleData).filter(
    (s) => s.start && s.end,
  ).length;

  return (
    <Card className="shadow-sm border-0 mb-3">
      {isSaving && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Saving...</span>
          </div>
        </div>
      )}

      <Card.Header className="bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h4 className="mb-0 fw-bold">Auto Delivery Schedule</h4>
            {autoEnabled ? (
              <Badge bg="success">Active</Badge>
            ) : (
              <Badge bg="secondary">Disabled</Badge>
            )}
            {autoEnabled && activeDayCount > 0 && (
              <Badge bg="info">{activeDayCount}/7 days</Badge>
            )}
          </div>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoDeliveryScheduleToggle"
              checked={autoEnabled}
              onChange={handleToggleAuto}
              disabled={isSaving}
            />
            <label
              className="form-check-label fw-semibold"
              htmlFor="autoDeliveryScheduleToggle"
            >
              Enable
            </label>
          </div>
        </div>

        <Row className="g-2 align-items-end mt-2">
          <Col xs={12} sm={4} md={3}>
            <Form.Label className="small mb-1 text-muted">Time Zone</Form.Label>
            <Form.Select
              value={timezone}
              onChange={handleTimezoneChange}
              disabled={isSaving || !autoEnabled}
              size="sm"
            >
              {TIME_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleCopySundayToAll}
              disabled={isSaving || !autoEnabled}
            >
              Copy Sunday to all days
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowFeesModal(true)}
              disabled={isSaving}
            >
              Edit Doordash fees
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {!autoEnabled && (
          <Alert variant="info" className="small mb-3">
            Configure a weekly schedule of Doordash windows. Outside those
            windows, orders fall back to Self delivery. The cron job runs every
            5 minutes to apply the change. Enable the switch above to activate
            the schedule.
          </Alert>
        )}

        <Accordion defaultActiveKey="0">
          {DAY_NAMES.map((name, i) => {
            const key = String(i);
            const slot = scheduleData[key] || emptySlot();
            const allSelf = !slot.start && !slot.end;
            return (
              <Accordion.Item key={key} eventKey={key}>
                <Accordion.Header>
                  <div className="w-100 d-flex justify-content-between align-items-center pe-3">
                    <span className="fw-semibold">{name}</span>
                    <span className="text-muted small">
                      {allSelf ? (
                        <Badge bg="light" text="dark">
                          All-day Self
                        </Badge>
                      ) : (
                        <Badge bg="primary">
                          Doordash {slot.start} – {slot.end}
                        </Badge>
                      )}
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row className="g-3 mb-2">
                    <Col xs={6} md={4}>
                      <Form.Label className="small mb-1">
                        Doordash Start
                      </Form.Label>
                      <Form.Control
                        type="time"
                        value={slot.start}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) =>
                          setDayField(key, "start", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6} md={4}>
                      <Form.Label className="small mb-1">
                        Doordash End
                      </Form.Label>
                      <Form.Control
                        type="time"
                        value={slot.end}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) =>
                          setDayField(key, "end", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                  <Form.Text muted className="d-block mb-2">
                    Tip: end can be earlier than start to span across midnight
                    (e.g. 22:00 – 02:00).
                  </Form.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveDay(key)}
                      disabled={isSaving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleClearDay(key)}
                      disabled={isSaving}
                    >
                      Mark all-day Self
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Card.Body>

      <DoordashFeesModal
        show={showFeesModal}
        onClose={() => setShowFeesModal(false)}
        initial={{
          deliveryFee: doordashDeliveryFee,
          serviceFee: doordashServiceFee,
        }}
        onSave={handleSaveFees}
        isSaving={isSaving}
      />
    </Card>
  );
}

export default DeliverySchedule;
