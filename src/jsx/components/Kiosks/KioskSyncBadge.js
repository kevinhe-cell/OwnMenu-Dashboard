import { useTranslation } from "react-i18next";
import { Clock, RefreshCw, Zap } from "lucide-react";

export const KIOSK_TABLET_SYNC_SECONDS = 15;

const BADGE_META = {
  auto: { Icon: Clock, className: "kiosk-sync-badge-auto" },
  refresh: { Icon: RefreshCw, className: "kiosk-sync-badge-refresh" },
  remote: { Icon: Zap, className: "kiosk-sync-badge-remote" },
};

export function KioskSyncBadge({ type = "auto", compact = false }) {
  const { t } = useTranslation();
  const meta = BADGE_META[type] || BADGE_META.auto;
  const { Icon, className } = meta;

  const label =
    type === "refresh"
      ? compact
        ? t("kiosks_page.sync_badge_refresh_short")
        : t("kiosks_page.sync_badge_refresh")
      : type === "remote"
        ? t("kiosks_page.sync_badge_remote", {
            seconds: KIOSK_TABLET_SYNC_SECONDS,
          })
        : t("kiosks_page.sync_badge_auto", {
            seconds: KIOSK_TABLET_SYNC_SECONDS,
          });

  return (
    <span className={`kiosk-sync-badge ${className}`}>
      <Icon size={compact ? 11 : 12} className="kiosk-sync-badge-icon" />
      {label}
    </span>
  );
}

export function KioskSyncBanner() {
  const { t } = useTranslation();

  return (
    <div className="kiosk-sync-banner" role="note">
      <div className="kiosk-sync-banner-copy">
        <div className="kiosk-sync-banner-title">
          {t("kiosks_page.sync_notice_title")}
        </div>
        <p className="kiosk-sync-banner-text mb-0">
          {t("kiosks_page.sync_notice", {
            seconds: KIOSK_TABLET_SYNC_SECONDS,
          })}
        </p>
      </div>
      <div className="kiosk-sync-banner-legend">
        <KioskSyncBadge type="auto" compact />
        <KioskSyncBadge type="refresh" compact />
      </div>
    </div>
  );
}

export function KioskSectionHeader({ title, description, syncType }) {
  return (
    <div className="kiosk-section-head mb-3">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <div className="kiosk-section-title mb-0">{title}</div>
        {syncType ? <KioskSyncBadge type={syncType} compact /> : null}
      </div>
      {description ? (
        <p className="text-muted small mb-0">{description}</p>
      ) : null}
    </div>
  );
}
