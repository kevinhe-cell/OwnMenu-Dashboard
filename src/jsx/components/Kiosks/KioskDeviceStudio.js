import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Spinner } from "react-bootstrap";
import { RefreshCw, LogOut, Home, Trash2, ImagePlus, X, Copy, Monitor, UtensilsCrossed, CreditCard, Settings2, Clock, Nfc } from "lucide-react";
import KioskAttractPreview from "./KioskAttractPreview";
import {
  KioskSyncBadge,
  KioskSectionHeader,
  KIOSK_TABLET_SYNC_SECONDS,
} from "./KioskSyncBadge";
import "./KiosksStudio.css";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function readerTone(readerStatus) {
  if (!readerStatus?.reportedAt) {
    return { color: "#64748b", bg: "#f1f5f9", key: "unknown" };
  }
  const status = String(readerStatus.status || "").toLowerCase();
  if (readerStatus.connected || status === "connected") {
    return { color: "#047857", bg: "#ecfdf5", key: "connected" };
  }
  if (status === "updating" || status === "connecting") {
    return { color: "#c2410c", bg: "#fff7ed", key: status };
  }
  return { color: "#b91c1c", bg: "#fef2f2", key: "disconnected" };
}

function previewVariant(device) {
  if (!device.isActive) return "disabled";
  if (device.pairingCode) return "setup";
  return "attract";
}

export default function KioskDeviceStudio({
  device,
  restaurantName,
  themeColor,
  submitting,
  uploadingKey,
  copiedId,
  tipDraftFor,
  setTipDraft,
  onRefresh,
  onGoHome,
  onAppDiag,
  onLogout,
  onDelete,
  onToggleActive,
  onOrientationChange,
  onOrderModeChange,
  onLanguageToggleChange,
  onAttractUpload,
  onClearAttract,
  onSaveTips,
  onCopy,
  onRegenerate,
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("display");

  const statusColor = !device.isActive
    ? "#b91c1c"
    : device.isPaired
      ? "#047857"
      : "#c2410c";

  const statusLabel = !device.isActive
    ? t("kiosks_page.status_disabled")
    : device.isPaired
      ? t("kiosks_page.status_paired")
      : t("kiosks_page.status_waiting");

  const tip = tipDraftFor(device);
  const variant = previewVariant(device);
  const reader = device.readerStatus || null;
  const readerUi = readerTone(reader);
  const app = device.appStatus || null;
  const updateReady = !!app?.updateReady;

  const tabs = [
    { key: "display", label: t("kiosks_page.tab_display"), icon: Monitor },
    { key: "orders", label: t("kiosks_page.tab_orders"), icon: UtensilsCrossed },
    { key: "checkout", label: t("kiosks_page.tab_checkout"), icon: CreditCard },
    { key: "device", label: t("kiosks_page.tab_device"), icon: Settings2 },
  ];

  const accentVars = {
    "--kiosk-accent": themeColor || "#dd2f6e",
    "--kiosk-accent-soft": `${themeColor || "#dd2f6e"}14`,
    "--kiosk-accent-border": `${themeColor || "#dd2f6e"}55`,
  };

  return (
    <div className="kiosk-studio" style={accentVars}>
      <div className="kiosk-studio-header">
        <div className="min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5
              className="mb-0 fw-bold text-truncate kiosk-section-title"
              style={{ fontSize: "1.05rem", letterSpacing: "-0.02em" }}
            >
              {device.deviceName}
            </h5>
            <span
              className="kiosk-rail-status"
              style={{
                background: `${statusColor}14`,
                color: statusColor,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="small mt-1" style={{ color: "#64748b" }}>
            {t("kiosks_page.col_last_seen")}: {formatDateTime(device.lastSeenAt)}
            {app?.versionCode != null ? (
              <>
                {" · "}
                App v{app.versionCode}
                {app.updateReady ? " · update ready" : ""}
              </>
            ) : null}
          </div>
          {device.isPaired ? (
            <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
              <span
                className="kiosk-rail-status"
                style={{
                  background: readerUi.bg,
                  color: readerUi.color,
                }}
              >
                <Nfc size={12} className="me-1" style={{ verticalAlign: "-1px" }} />
                {t(`kiosks_page.reader_status_${readerUi.key}`)}
              </span>
              {reader?.label || reader?.serialNumber ? (
                <span className="small" style={{ color: "#64748b" }}>
                  {reader.label || reader.serialNumber}
                  {reader?.connectionMethod === "usb"
                    ? " · USB"
                    : reader?.connectionMethod === "bluetooth"
                      ? " · Bluetooth"
                      : ""}
                </span>
              ) : reader?.connectionMethod ? (
                <span className="small" style={{ color: "#64748b" }}>
                  {reader.connectionMethod === "usb" ? "USB" : "Bluetooth"}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          {device.isPaired ? (
            <>
              <Button
                size="sm"
                variant="outline-secondary"
                className="kiosk-action-btn"
                disabled={submitting}
                onClick={() => onRefresh(device)}
              >
                <RefreshCw size={14} className="me-1" />
                {t("kiosks_page.refresh_btn")}
              </Button>
              <KioskSyncBadge type="refresh" compact />
              <Button
                size="sm"
                variant="outline-secondary"
                className="kiosk-action-btn"
                disabled={submitting}
                onClick={() => onGoHome(device)}
              >
                <Home size={14} className="me-1" />
                {t("kiosks_page.go_home_btn")}
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                className="kiosk-action-btn"
                disabled={submitting}
                onClick={() => onLogout(device)}
              >
                <LogOut size={14} className="me-1" />
                {t("kiosks_page.logout_btn")}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline-secondary"
              className="kiosk-action-btn"
              disabled={submitting}
              onClick={() => onRegenerate(device)}
            >
              <RefreshCw size={14} className="me-1" />
              {t("kiosks_page.regenerate_btn")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline-danger"
            className="kiosk-action-btn"
            disabled={submitting}
            onClick={() => onDelete(device)}
          >
            <Trash2 size={14} className="me-1" />
            {t("kiosks_page.delete_btn")}
          </Button>
        </div>
      </div>

      <div className="row g-0">
        <div className="col-12 col-lg-4 col-xl-5 kiosk-studio-preview-col" style={accentVars}>
          <KioskAttractPreview
            restaurantName={restaurantName}
            themeColor={themeColor}
            orientation={device.orientation || "portrait"}
            settings={device.settings}
            variant={variant}
            pairingCode={device.pairingCode}
            deviceName={device.deviceName}
            showLanguageToggle={device.settings?.showLanguageToggle !== false}
          />
          {device.pairingCode ? (
            <Button
              size="sm"
              className="mt-3 d-inline-flex align-items-center kiosk-btn-primary"
              onClick={() => onCopy(device)}
            >
              <Copy size={14} className="me-1" />
              {copiedId === device.deviceId
                ? t("kiosks_page.copied")
                : t("kiosks_page.copy_code")}
            </Button>
          ) : null}
          <div className="kiosk-preview-sync-note">
            <Clock size={12} />
            {t("kiosks_page.preview_sync_note", {
              seconds: KIOSK_TABLET_SYNC_SECONDS,
            })}
          </div>
        </div>

        <div className="col-12 col-lg-8 col-xl-7">
          <div className="kiosk-studio-tabs" style={accentVars}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`kiosk-studio-tab${tab === key ? " is-active" : ""}`}
                onClick={() => setTab(key)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="kiosk-studio-body">
            {tab === "display" ? (
              <>
                <KioskSectionHeader
                  title={t("kiosks_page.attract_title")}
                  description={t("kiosks_page.attract_desc")}
                  syncType="auto"
                />
                <div className="row g-3 mb-4">
                  {[
                    {
                      key: "portrait",
                      label: t("kiosks_page.attract_portrait"),
                      url: device.settings?.attractBackgroundPortraitUrl,
                    },
                    {
                      key: "landscape",
                      label: t("kiosks_page.attract_landscape"),
                      url: device.settings?.attractBackgroundLandscapeUrl,
                    },
                  ].map((slot) => {
                    const busy = uploadingKey === `${device.deviceId}-${slot.key}`;
                    const inputId = `attract-${device.deviceId}-${slot.key}`;
                    return (
                      <div className="col-6" key={slot.key}>
                        <div className="small text-muted mb-1">{slot.label}</div>
                        <div
                          className="position-relative rounded-3 overflow-hidden mb-2"
                          style={{
                            aspectRatio: slot.key === "portrait" ? "3/4" : "16/9",
                            background: "#f3f4f6",
                            maxHeight: 140,
                          }}
                        >
                          {slot.url ? (
                            <img
                              src={slot.url}
                              alt={slot.label}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                              {t("kiosks_page.attract_empty")}
                            </div>
                          )}
                          {slot.url ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-light position-absolute top-0 end-0 m-1 p-1"
                              style={{ borderRadius: 6, lineHeight: 1 }}
                              disabled={submitting || busy}
                              onClick={() => onClearAttract(device, slot.key)}
                            >
                              <X size={12} />
                            </button>
                          ) : null}
                        </div>
                        <input
                          id={inputId}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="d-none"
                          disabled={submitting || busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            onAttractUpload(device, slot.key, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="w-100 d-inline-flex align-items-center justify-content-center"
                          style={{ borderRadius: 10 }}
                          disabled={submitting || busy}
                          onClick={() => document.getElementById(inputId)?.click()}
                        >
                          {busy ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <ImagePlus size={13} className="me-1" />
                              {slot.url
                                ? t("kiosks_page.attract_replace")
                                : t("kiosks_page.attract_upload")}
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="small fw-medium mb-1" style={{ color: "#374151" }}>
                      {t("kiosks_page.field_orientation")}
                    </div>
                    <Form.Select
                      size="sm"
                      value={device.orientation || "portrait"}
                      disabled={submitting}
                      style={{ borderRadius: 10 }}
                      onChange={(e) => onOrientationChange(device, e.target.value)}
                    >
                      <option value="portrait">{t("kiosks_page.orientation_portrait")}</option>
                      <option value="landscape">{t("kiosks_page.orientation_landscape")}</option>
                    </Form.Select>
                    <div className="small text-muted mt-1">
                      {t("kiosks_page.orientation_hint")}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <Form.Check
                      type="switch"
                      id={`lang-toggle-${device.deviceId}`}
                      className="mt-md-4"
                      label={t("kiosks_page.show_language_toggle")}
                      checked={device.settings?.showLanguageToggle !== false}
                      disabled={submitting}
                      onChange={(e) =>
                        onLanguageToggleChange(device, e.target.checked)
                      }
                    />
                    <div className="small text-muted mt-1">
                      {t("kiosks_page.language_toggle_desc_short")}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {tab === "orders" ? (
              <>
                <KioskSectionHeader
                  title={t("kiosks_page.order_modes_title")}
                  description={t("kiosks_page.order_modes_desc")}
                  syncType="auto"
                />
                <div className="d-flex flex-column gap-2">
                  <Form.Check
                    type="switch"
                    id={`dine-${device.deviceId}`}
                    label={t("kiosks_page.enable_dine_in")}
                    checked={device.settings?.enableDineIn !== false}
                    disabled={submitting}
                    onChange={(e) =>
                      onOrderModeChange(device, "enableDineIn", e.target.checked)
                    }
                  />
                  <Form.Check
                    type="switch"
                    id={`takeout-${device.deviceId}`}
                    label={t("kiosks_page.enable_takeout")}
                    checked={device.settings?.enableTakeout !== false}
                    disabled={submitting}
                    onChange={(e) =>
                      onOrderModeChange(device, "enableTakeout", e.target.checked)
                    }
                  />
                </div>
              </>
            ) : null}

            {tab === "checkout" ? (
              <>
                <KioskSectionHeader
                  title={t("kiosks_page.tip_title")}
                  description={t("kiosks_page.tip_desc")}
                  syncType="refresh"
                />
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <Form.Check
                    type="switch"
                    id={`tip-on-${device.deviceId}`}
                    label={t("kiosks_page.tip_show")}
                    checked={!!tip.tipEnabled}
                    disabled={submitting}
                    onChange={(e) =>
                      setTipDraft(device, { tipEnabled: e.target.checked })
                    }
                  />
                  <Form.Check
                    type="switch"
                    id={`tip-custom-${device.deviceId}`}
                    label={t("kiosks_page.tip_custom")}
                    checked={!!tip.tipAllowCustom}
                    disabled={submitting || !tip.tipEnabled}
                    onChange={(e) =>
                      setTipDraft(device, { tipAllowCustom: e.target.checked })
                    }
                  />
                </div>
                <div className="small text-muted mb-1">{t("kiosks_page.tip_percents")}</div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {[0, 1, 2].map((idx) => (
                    <Form.Control
                      key={idx}
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      value={tip.tipPercents[idx] ?? ""}
                      disabled={submitting || !tip.tipEnabled}
                      style={{ width: 88, borderRadius: 10 }}
                      onChange={(e) => {
                        const next = [...tip.tipPercents];
                        next[idx] = e.target.value;
                        setTipDraft(device, { tipPercents: next });
                      }}
                    />
                  ))}
                  <span className="align-self-center text-muted small">%</span>
                </div>
                <div className="small text-muted mb-1">{t("kiosks_page.tip_default")}</div>
                <div className="d-flex flex-wrap gap-2">
                  <Form.Select
                    value={String(tip.tipDefaultPercent)}
                    disabled={submitting || !tip.tipEnabled}
                    style={{ maxWidth: 200, borderRadius: 10 }}
                    onChange={(e) =>
                      setTipDraft(device, {
                        tipDefaultPercent: Number(e.target.value),
                      })
                    }
                  >
                    <option value="0">{t("kiosks_page.tip_default_none")}</option>
                    {tip.tipPercents.map((p, i) => (
                      <option key={`${p}-${i}`} value={String(p)}>
                        {p}%
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    size="sm"
                    className="kiosk-btn-primary"
                    disabled={submitting}
                    onClick={() => onSaveTips(device)}
                  >
                    {t("kiosks_page.tip_save")}
                  </Button>
                </div>
              </>
            ) : null}

            {tab === "device" ? (
              <>
                <KioskSectionHeader
                  title={t("kiosks_page.tab_device_status")}
                  description={t("kiosks_page.device_tab_desc")}
                  syncType="auto"
                />
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="small text-muted">
                    {t("kiosks_page.col_paired")}: {formatDateTime(device.pairedAt)}
                  </div>
                  <Form.Check
                    type="switch"
                    id={`active-${device.deviceId}`}
                    label={
                      device.isActive
                        ? t("kiosks_page.enabled")
                        : t("kiosks_page.disabled")
                    }
                    checked={!!device.isActive}
                    disabled={submitting}
                    onChange={() => onToggleActive(device)}
                  />
                </div>

                <div
                  className="p-3 rounded-3 mb-3"
                  style={{
                    background: readerUi.bg,
                    border: `1px solid ${readerUi.color}33`,
                  }}
                >
                  <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: 36,
                          height: 36,
                          background: "#fff",
                          color: readerUi.color,
                          border: `1px solid ${readerUi.color}33`,
                        }}
                      >
                        <Nfc size={18} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                          {t("kiosks_page.reader_title")}
                        </div>
                        <div className="small fw-semibold" style={{ color: readerUi.color }}>
                          {t(`kiosks_page.reader_status_${readerUi.key}`)}
                        </div>
                      </div>
                    </div>
                    <KioskSyncBadge type="auto" compact />
                  </div>

                  <div className="row g-2 small">
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_label")}</div>
                      <div className="fw-semibold text-break">
                        {reader?.label || "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_serial")}</div>
                      <div className="fw-semibold text-break">
                        {reader?.serialNumber || "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_type")}</div>
                      <div className="fw-semibold">
                        {reader?.deviceType || t("kiosks_page.reader_type_m2")}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">Connection</div>
                      <div className="fw-semibold">
                        {reader?.connectionMethod === "usb"
                          ? "USB"
                          : reader?.connectionMethod === "bluetooth"
                            ? "Bluetooth"
                            : "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_battery")}</div>
                      <div className="fw-semibold">
                        {reader?.batteryLevel != null
                          ? `${Math.round(Number(reader.batteryLevel) * (Number(reader.batteryLevel) <= 1 ? 100 : 1))}%`
                          : "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_location")}</div>
                      <div className="fw-semibold text-break" style={{ fontSize: "0.8rem" }}>
                        {device.stripeTerminalLocationId ||
                          reader?.locationId ||
                          "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">{t("kiosks_page.reader_reported")}</div>
                      <div className="fw-semibold">
                        {formatDateTime(reader?.reportedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="small text-muted mt-2">
                    {t("kiosks_page.reader_hint")}
                  </div>
                </div>

                <div
                  className="p-3 rounded-3 mb-3"
                  style={{
                    background: updateReady ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${updateReady ? "#04785733" : "#e2e8f0"}`,
                  }}
                >
                  <div className="fw-bold mb-2" style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                    App & silent update
                  </div>
                  <div className="row g-2 small mb-3">
                    <div className="col-sm-6">
                      <div className="text-muted">Installed version</div>
                      <div className="fw-semibold">
                        {app?.versionCode != null ? `v${app.versionCode}` : "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">Update ready</div>
                      <div
                        className="fw-semibold"
                        style={{ color: updateReady ? "#047857" : "#b91c1c" }}
                      >
                        {app?.checkedAt
                          ? updateReady
                            ? "Yes"
                            : "No"
                          : "Not reported yet"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">Device Owner</div>
                      <div className="fw-semibold">
                        {app?.checkedAt
                          ? app.isDeviceOwner
                            ? "Yes"
                            : "No"
                          : "—"}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-muted">Play Protect / verifier</div>
                      <div className="fw-semibold">
                        {app?.checkedAt
                          ? app.playProtectLikelyOff
                            ? "Off"
                            : "On / unknown"
                          : "—"}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted">Last check</div>
                      <div className="fw-semibold">
                        {formatDateTime(app?.checkedAt)}
                        {app?.lastActionMessage ? (
                          <span className="text-muted fw-normal">
                            {" "}
                            — {app.lastActionMessage}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {device.isPaired ? (
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="kiosk-action-btn"
                        disabled={submitting}
                        onClick={() => onAppDiag?.(device, "check")}
                      >
                        Test auto-update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="kiosk-action-btn"
                        disabled={submitting}
                        onClick={() => onAppDiag?.(device, "disable_verifier")}
                      >
                        Test Play Protect disable
                      </Button>
                    </div>
                  ) : null}
                  <div className="small text-muted mt-2">
                    These tests do not download or install an APK — they only
                    check (or prepare) silent-update readiness on the tablet.
                  </div>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="small text-muted">{t("kiosks_page.remote_actions_label")}</span>
                  <KioskSyncBadge type="remote" compact />
                </div>

                {device.pairingCode ? (
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    <div className="small fw-medium text-muted mb-1">
                      {t("kiosks_page.col_code")}
                    </div>
                    <code
                      style={{
                        fontSize: "1.35rem",
                        letterSpacing: "0.14em",
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {device.pairingCode}
                    </code>
                    <div className="small text-muted mt-2">
                      {t("kiosks_page.preview_setup_hint")}
                    </div>
                  </div>
                ) : device.isPaired ? (
                  <div
                    className="p-3 rounded-3 small"
                    style={{ background: "#ecfdf5", color: "#047857" }}
                  >
                    {t("kiosks_page.code_paired_hint")}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { previewVariant, formatDateTime };
