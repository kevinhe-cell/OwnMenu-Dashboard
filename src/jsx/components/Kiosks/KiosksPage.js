import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  createKioskThunk,
  getKiosksThunk,
  regenerateKioskCodeThunk,
  refreshKioskThunk,
  goHomeKioskThunk,
  requestKioskAppDiagThunk,
  logoutKioskThunk,
  updateKioskOrientationThunk,
  updateKioskActiveThunk,
  updateKioskSettingsThunk,
  uploadKioskAttractImageThunk,
  deleteKioskThunk,
  getKioskFeesThunk,
  updateKioskFeesThunk,
} from "../../../store/kiosks";
import { Button, Modal, Form, Spinner, Collapse } from "react-bootstrap";
import swal from "sweetalert";
import {
  MonitorSmartphone,
  Plus,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import KioskAttractPreview, { DEFAULT_ACCENT } from "./KioskAttractPreview";
import KioskDeviceStudio, { previewVariant } from "./KioskDeviceStudio";
import { KioskSyncBanner } from "./KioskSyncBadge";
import "./KiosksStudio.css";

const DASHBOARD_POLL_MS = 15_000;

export default function KiosksPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { devices, loading, fees } = useSelector((state) => state.kiosks);
  const restaurant = useSelector((state) => state.restaurant?.restaurant);

  const restaurantName = restaurant?.name || t("kiosks_page.preview_restaurant_fallback");
  const themeColor =
    restaurant?.theme_color || restaurant?.themeColor || DEFAULT_ACCENT;

  const [createOpen, setCreateOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [orientation, setOrientation] = useState("portrait");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [taxPct, setTaxPct] = useState("");
  const [processingPct, setProcessingPct] = useState("");
  const [savingFees, setSavingFees] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [feesOpen, setFeesOpen] = useState(false);
  const [tipDrafts, setTipDrafts] = useState({});

  const pairedCount = useMemo(
    () => (devices || []).filter((d) => d.isPaired && d.isActive).length,
    [devices]
  );
  const waitingCount = useMemo(
    () => (devices || []).filter((d) => !d.isPaired && d.isActive).length,
    [devices]
  );
  const disabledCount = useMemo(
    () => (devices || []).filter((d) => !d.isActive).length,
    [devices]
  );

  const selectedDevice = useMemo(
    () => (devices || []).find((d) => d.deviceId === selectedId) || null,
    [devices, selectedId]
  );

  useEffect(() => {
    dispatch(getKiosksThunk());
    dispatch(getKioskFeesThunk());
  }, [dispatch]);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch(getKiosksThunk());
    }, DASHBOARD_POLL_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    if (!fees) return;
    setTaxPct(String(Number(((Number(fees.tax) || 0) * 100).toFixed(4))));
    setProcessingPct(
      String(Number(((Number(fees.processing_fee) || 0) * 100).toFixed(4)))
    );
  }, [fees]);

  useEffect(() => {
    if (!devices?.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !devices.some((d) => d.deviceId === selectedId)) {
      setSelectedId(devices[0].deviceId);
    }
  }, [devices, selectedId]);

  const showErr = (text) =>
    swal({
      title: t("kiosks_page.err_title"),
      text,
      icon: "error",
      button: t("common.ok"),
    });

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    const name = deviceName.trim();
    if (!name) {
      showErr(t("kiosks_page.err_name_required"));
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      createKioskThunk({ deviceName: name, orientation })
    );
    setSubmitting(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    setCreateOpen(false);
    setDeviceName("");
    setOrientation("portrait");
    if (result?.device?.deviceId) {
      setSelectedId(result.device.deviceId);
    }
  };

  const handleSaveFees = async (e) => {
    e?.preventDefault?.();
    const taxNum = Number(taxPct);
    const procNum = Number(processingPct);
    if (!Number.isFinite(taxNum) || taxNum < 0 || taxNum > 100) {
      showErr(t("kiosks_page.fees_err_range"));
      return;
    }
    if (!Number.isFinite(procNum) || procNum < 0 || procNum > 100) {
      showErr(t("kiosks_page.fees_err_range"));
      return;
    }
    setSavingFees(true);
    const result = await dispatch(
      updateKioskFeesThunk({
        tax: taxNum / 100,
        processing_fee: procNum / 100,
      })
    );
    setSavingFees(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    swal({
      title: t("common.success"),
      text: t("kiosks_page.fees_saved"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleRegenerate = async (device) => {
    const confirmed = await swal({
      title: t("kiosks_page.regenerate_confirm_title"),
      text: t("kiosks_page.regenerate_confirm_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("kiosks_page.regenerate_btn")],
      dangerMode: true,
    });
    if (!confirmed) return;
    setSubmitting(true);
    const result = await dispatch(regenerateKioskCodeThunk(device.deviceId));
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleRefresh = async (device) => {
    setSubmitting(true);
    const result = await dispatch(refreshKioskThunk(device.deviceId));
    setSubmitting(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    swal({
      title: t("common.success"),
      text: t("kiosks_page.refresh_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleGoHome = async (device) => {
    const confirmed = await swal({
      title: t("kiosks_page.go_home_confirm_title"),
      text: t("kiosks_page.go_home_confirm_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("kiosks_page.go_home_btn")],
    });
    if (!confirmed) return;
    setSubmitting(true);
    const result = await dispatch(goHomeKioskThunk(device.deviceId));
    setSubmitting(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    swal({
      title: t("common.success"),
      text: t("kiosks_page.go_home_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleAppDiag = async (device, action) => {
    const isDisable = action === "disable_verifier";
    const confirmed = await swal({
      title: isDisable
        ? "Test: disable Play Protect?"
        : "Test: auto-update readiness?",
      text: isDisable
        ? "Asks the tablet to turn off install verifiers (no APK install). Results appear after the next sync (~15s)."
        : "Asks the tablet to report version + Device Owner / Play Protect readiness. No APK is downloaded or installed.",
      icon: "info",
      buttons: [t("common.cancel"), "Run test"],
    });
    if (!confirmed) return;
    setSubmitting(true);
    const result = await dispatch(
      requestKioskAppDiagThunk(device.deviceId, action)
    );
    setSubmitting(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    swal({
      title: t("common.success"),
      text: "Request sent. Refresh this page in ~15–30s to see the result.",
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleLogout = async (device) => {
    const confirmed = await swal({
      title: t("kiosks_page.logout_confirm_title"),
      text: t("kiosks_page.logout_confirm_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("kiosks_page.logout_btn")],
      dangerMode: true,
    });
    if (!confirmed) return;
    setSubmitting(true);
    const result = await dispatch(logoutKioskThunk(device.deviceId));
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleDelete = async (device) => {
    const confirmed = await swal({
      title: t("kiosks_page.delete_confirm_title"),
      text: t("kiosks_page.delete_confirm_text", { name: device.deviceName }),
      icon: "warning",
      buttons: [t("common.cancel"), t("kiosks_page.delete_btn")],
      dangerMode: true,
    });
    if (!confirmed) return;
    setSubmitting(true);
    const result = await dispatch(deleteKioskThunk(device.deviceId));
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleToggleActive = async (device) => {
    const next = !device.isActive;
    if (!next) {
      const confirmed = await swal({
        title: t("kiosks_page.disable_confirm_title"),
        text: t("kiosks_page.disable_confirm_text", { name: device.deviceName }),
        icon: "warning",
        buttons: [t("common.cancel"), t("kiosks_page.disable_btn")],
        dangerMode: true,
      });
      if (!confirmed) return;
    }
    setSubmitting(true);
    const result = await dispatch(
      updateKioskActiveThunk(device.deviceId, next)
    );
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleOrientationChange = async (device, next) => {
    if ((device.orientation || "portrait") === next) return;
    setSubmitting(true);
    const result = await dispatch(
      updateKioskOrientationThunk(device.deviceId, next)
    );
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleOrderModeChange = async (device, field, checked) => {
    const settings = device.settings || {};
    const next = {
      enableDineIn:
        field === "enableDineIn" ? checked : settings.enableDineIn !== false,
      enableTakeout:
        field === "enableTakeout" ? checked : settings.enableTakeout !== false,
    };
    if (!next.enableDineIn && !next.enableTakeout) {
      showErr(t("kiosks_page.order_mode_err"));
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      updateKioskSettingsThunk(device.deviceId, next)
    );
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleLanguageToggleChange = async (device, checked) => {
    setSubmitting(true);
    const result = await dispatch(
      updateKioskSettingsThunk(device.deviceId, {
        showLanguageToggle: !!checked,
      })
    );
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const handleAttractUpload = async (device, slot, file) => {
    if (!file) return;
    const key = `${device.deviceId}-${slot}`;
    setUploadingKey(key);
    const result = await dispatch(
      uploadKioskAttractImageThunk(device.deviceId, file, slot)
    );
    setUploadingKey(null);
    if (result?.error) showErr(result.error);
  };

  const handleClearAttract = async (device, slot) => {
    setSubmitting(true);
    const result = await dispatch(
      updateKioskSettingsThunk(device.deviceId, {
        clearAttractPortrait: slot === "portrait",
        clearAttractLandscape: slot === "landscape",
      })
    );
    setSubmitting(false);
    if (result?.error) showErr(result.error);
  };

  const tipDraftFor = (device) => {
    const draft = tipDrafts[device.deviceId];
    if (draft) return draft;
    const s = device.settings || {};
    const percents =
      Array.isArray(s.tipPercents) && s.tipPercents.length >= 3
        ? s.tipPercents.slice(0, 3).map((n) => Number(n))
        : [10, 15, 20];
    return {
      tipEnabled: s.tipEnabled !== false,
      tipAllowCustom: s.tipAllowCustom !== false,
      tipPercents: percents,
      tipDefaultPercent:
        s.tipDefaultPercent === 0 || Number.isFinite(Number(s.tipDefaultPercent))
          ? Number(s.tipDefaultPercent)
          : percents[1] ?? 15,
    };
  };

  const setTipDraft = (device, patch) => {
    setTipDrafts((prev) => {
      const existing = prev[device.deviceId];
      const s = device.settings || {};
      const percents =
        Array.isArray(s.tipPercents) && s.tipPercents.length >= 3
          ? s.tipPercents.slice(0, 3).map((n) => Number(n))
          : [10, 15, 20];
      const base = existing || {
        tipEnabled: s.tipEnabled !== false,
        tipAllowCustom: s.tipAllowCustom !== false,
        tipPercents: percents,
        tipDefaultPercent:
          s.tipDefaultPercent === 0 ||
          Number.isFinite(Number(s.tipDefaultPercent))
            ? Number(s.tipDefaultPercent)
            : percents[1] ?? 15,
      };
      const next = { ...base, ...patch };
      if (patch.tipPercents) {
        next.tipPercents = patch.tipPercents;
        if (
          next.tipDefaultPercent !== 0 &&
          !next.tipPercents.some(
            (p) => Number(p) === Number(next.tipDefaultPercent)
          )
        ) {
          next.tipDefaultPercent = next.tipPercents[1] ?? next.tipPercents[0];
        }
      }
      return { ...prev, [device.deviceId]: next };
    });
  };

  const handleSaveTips = async (device) => {
    const draft = tipDraftFor(device);
    const percents = (draft.tipPercents || []).map((n) => Number(n));
    if (
      draft.tipEnabled &&
      (percents.length < 3 ||
        percents.some((n) => !Number.isFinite(n) || n < 1 || n > 100))
    ) {
      showErr(t("kiosks_page.tip_err_percent"));
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      updateKioskSettingsThunk(device.deviceId, {
        tipEnabled: !!draft.tipEnabled,
        tipAllowCustom: !!draft.tipAllowCustom,
        tipPercents: percents,
        tipDefaultPercent: Number(draft.tipDefaultPercent),
      })
    );
    setSubmitting(false);
    if (result?.error) {
      showErr(result.error);
      return;
    }
    setTipDrafts((prev) => {
      const next = { ...prev };
      delete next[device.deviceId];
      return next;
    });
    swal({
      title: t("kiosks_page.tip_saved"),
      icon: "success",
      button: t("common.ok"),
      timer: 2800,
    });
  };

  const handleCopy = async (device) => {
    if (!device.pairingCode) return;
    try {
      await navigator.clipboard.writeText(device.pairingCode);
      setCopiedId(device.deviceId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showErr(t("kiosks_page.err_copy"));
    }
  };

  const statCards = [
    {
      label: t("kiosks_page.total_kiosks"),
      value: loading ? "…" : devices.length,
      dot: "#94a3b8",
    },
    {
      label: t("kiosks_page.paired_kiosks"),
      value: loading ? "…" : pairedCount,
      dot: "#10b981",
      icon: Wifi,
    },
    {
      label: t("kiosks_page.waiting_kiosks"),
      value: loading ? "…" : waitingCount,
      dot: "#f59e0b",
      icon: Clock,
    },
    ...(disabledCount > 0
      ? [
          {
            label: t("kiosks_page.status_disabled"),
            value: disabledCount,
            dot: "#ef4444",
            icon: WifiOff,
          },
        ]
      : []),
  ];

  const pageAccentVars = {
    "--kiosk-accent": themeColor,
    "--kiosk-accent-soft": `${themeColor}14`,
    "--kiosk-accent-border": `${themeColor}55`,
  };

  const statusTone = (device) => {
    if (!device.isActive) return { bg: "#fef2f2", color: "#b91c1c" };
    if (device.isPaired) return { bg: "#ecfdf5", color: "#047857" };
    return { bg: "#fff7ed", color: "#c2410c" };
  };

  const statusText = (device) => {
    if (previewVariant(device) === "setup") return t("kiosks_page.status_waiting");
    if (previewVariant(device) === "disabled") return t("kiosks_page.status_disabled");
    return t("kiosks_page.status_paired");
  };

  return (
    <div
      className="container-fluid py-4 px-3 px-lg-4 kiosk-page"
      style={pageAccentVars}
    >
      <div className="kiosk-page-header d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h2 className="kiosk-page-title">{t("kiosks_page.title")}</h2>
          <p className="kiosk-page-desc">{t("kiosks_page.desc_studio")}</p>
          <div className="kiosk-stat-row">
            {statCards.map((card) => (
              <span key={card.label} className="kiosk-stat-chip">
                <span className="kiosk-stat-dot" style={{ background: card.dot }} />
                <strong>{card.value}</strong> {card.label}
              </span>
            ))}
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="d-inline-flex align-items-center kiosk-btn-primary"
        >
          <Plus size={16} className="me-1" />
          {t("kiosks_page.create_btn")}
        </Button>
      </div>

      <KioskSyncBanner />

      <div className="kiosk-fees-card">
        <button
          type="button"
          className="kiosk-fees-toggle"
          onClick={() => setFeesOpen((v) => !v)}
        >
          <span>{t("kiosks_page.fees_title")}</span>
          {feesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <Collapse in={feesOpen}>
          <div className="px-3 pb-3">
            <Form onSubmit={handleSaveFees}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="small fw-medium mb-1 text-muted">
                    {t("kiosks_page.fees_tax")}
                  </div>
                  <Form.Control
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div className="small fw-medium mb-1 text-muted">
                    {t("kiosks_page.fees_processing")}
                  </div>
                  <Form.Control
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={processingPct}
                    onChange={(e) => setProcessingPct(e.target.value)}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Button
                    type="submit"
                    disabled={savingFees}
                    variant="outline-secondary"
                    className="w-100 w-md-auto kiosk-action-btn"
                  >
                    {savingFees ? t("common.saving") : t("kiosks_page.fees_save")}
                  </Button>
                </div>
              </div>
              <div className="small mt-2 text-muted">{t("kiosks_page.fees_desc")}</div>
            </Form>
          </div>
        </Collapse>
      </div>

      {loading && !devices.length ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
        </div>
      ) : !devices.length ? (
        <div className="kiosk-empty">
          <div className="mb-4 d-flex justify-content-center">
            <KioskAttractPreview
              restaurantName={restaurantName}
              themeColor={themeColor}
              orientation="portrait"
              variant="attract"
              compact
            />
          </div>
          <MonitorSmartphone size={28} className="mb-2 text-muted" />
          <h5 className="fw-bold mb-1">{t("kiosks_page.empty_title")}</h5>
          <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: 400 }}>
            {t("kiosks_page.empty")}
          </p>
          <Button onClick={() => setCreateOpen(true)} className="kiosk-btn-primary">
            <Plus size={14} className="me-1" />
            {t("kiosks_page.create_btn")}
          </Button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <div className="kiosk-rail">
              {(devices || []).map((device) => {
                const active = selectedId === device.deviceId;
                const tone = statusTone(device);
                return (
                  <button
                    key={device.deviceId}
                    type="button"
                    className={`kiosk-rail-item${active ? " is-active" : ""}`}
                    onClick={() => setSelectedId(device.deviceId)}
                  >
                    <KioskAttractPreview
                      restaurantName={restaurantName}
                      themeColor={themeColor}
                      orientation={device.orientation || "portrait"}
                      settings={device.settings}
                      variant={previewVariant(device)}
                      pairingCode={device.pairingCode}
                      deviceName={device.deviceName}
                      showLanguageToggle={device.settings?.showLanguageToggle !== false}
                      compact
                    />
                    <div className="kiosk-rail-meta">
                      <span className="kiosk-rail-name">{device.deviceName}</span>
                      <span
                        className="kiosk-rail-status"
                        style={{ background: tone.bg, color: tone.color }}
                      >
                        {statusText(device)}
                      </span>
                      {device.appStatus?.versionCode != null ? (
                        <span
                          className="kiosk-rail-status"
                          style={{ background: "#f1f5f9", color: "#475569" }}
                        >
                          v{device.appStatus.versionCode}
                        </span>
                      ) : null}
                      {device.isPaired && device.readerStatus ? (
                        <span
                          className="kiosk-rail-status"
                          style={{
                            background: device.readerStatus.connected
                              ? "#ecfdf5"
                              : "#fef2f2",
                            color: device.readerStatus.connected
                              ? "#047857"
                              : "#b91c1c",
                          }}
                        >
                          {device.readerStatus.connected
                            ? t("kiosks_page.reader_status_connected")
                            : t("kiosks_page.reader_status_disconnected")}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                className="kiosk-rail-item kiosk-rail-item-add"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={18} className="mb-1" />
                {t("kiosks_page.create_btn")}
              </button>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            {selectedDevice ? (
              <KioskDeviceStudio
                device={selectedDevice}
                restaurantName={restaurantName}
                themeColor={themeColor}
                submitting={submitting}
                uploadingKey={uploadingKey}
                copiedId={copiedId}
                tipDraftFor={tipDraftFor}
                setTipDraft={setTipDraft}
                onRefresh={handleRefresh}
                onGoHome={handleGoHome}
                onAppDiag={handleAppDiag}
                onLogout={handleLogout}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onOrientationChange={handleOrientationChange}
                onOrderModeChange={handleOrderModeChange}
                onLanguageToggleChange={handleLanguageToggleChange}
                onAttractUpload={handleAttractUpload}
                onClearAttract={handleClearAttract}
                onSaveTips={handleSaveTips}
                onCopy={handleCopy}
                onRegenerate={handleRegenerate}
              />
            ) : (
              <div className="text-muted text-center py-5">
                {t("kiosks_page.select_kiosk")}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        show={createOpen}
        onHide={() => !submitting && setCreateOpen(false)}
        centered
      >
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
              {t("kiosks_page.create_title")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium small">
                {t("kiosks_page.field_name")}
              </Form.Label>
              <Form.Control
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder={t("kiosks_page.field_name_placeholder")}
                autoFocus
                maxLength={120}
                disabled={submitting}
                style={{ borderRadius: 10 }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="fw-medium small">
                {t("kiosks_page.field_orientation")}
              </Form.Label>
              <Form.Select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                disabled={submitting}
                style={{ borderRadius: 10 }}
              >
                <option value="portrait">
                  {t("kiosks_page.orientation_portrait")}
                </option>
                <option value="landscape">
                  {t("kiosks_page.orientation_landscape")}
                </option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              style={{ borderRadius: 10 }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="kiosk-btn-primary"
            >
              {submitting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                t("kiosks_page.create_submit")
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
