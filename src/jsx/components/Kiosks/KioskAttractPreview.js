import { useTranslation } from "react-i18next";

const DEFAULT_ACCENT = "#dd2f6e";

function resolveBackgroundUrl(settings, orientation) {
  const s = settings || {};
  if (orientation === "landscape") {
    return s.attractBackgroundLandscapeUrl || s.attractBackgroundPortraitUrl || null;
  }
  return s.attractBackgroundPortraitUrl || s.attractBackgroundLandscapeUrl || null;
}

export default function KioskAttractPreview({
  restaurantName = "Restaurant",
  themeColor = DEFAULT_ACCENT,
  orientation = "portrait",
  settings,
  variant = "attract",
  pairingCode,
  deviceName,
  showLanguageToggle = true,
  compact = false,
}) {
  const { t } = useTranslation();
  const accent = themeColor || DEFAULT_ACCENT;
  const isLandscape = orientation === "landscape";
  const bgUrl = resolveBackgroundUrl(settings, orientation);

  const screenStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#fff",
    backgroundColor: bgUrl ? "#111" : accent,
    backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const scrim = bgUrl ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.12)";

  const bezelPad = compact ? 6 : 10;
  const bezelRadius = compact ? 16 : 22;
  const screenRadius = compact ? 10 : 14;

  return (
    <div
      className="kiosk-preview-root"
      style={{
        width: "100%",
        maxWidth: isLandscape ? (compact ? 320 : 520) : compact ? 200 : 280,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
          borderRadius: bezelRadius,
          padding: bezelPad,
          border: "1px solid #cbd5e1",
          boxShadow:
            "0 16px 40px -20px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
        className="kiosk-preview-bezel-light"
      >
        <div
          className="kiosk-preview-screen"
          style={{
            position: "relative",
            aspectRatio: isLandscape ? "16 / 10" : "3 / 4",
            borderRadius: screenRadius,
            overflow: "hidden",
            background: "#000",
          }}
        >
          {variant === "setup" ? (
            <div
              style={{
                ...screenStyle,
                backgroundImage: undefined,
                backgroundColor: "#f8fafc",
                color: "#111827",
                padding: compact ? 12 : 20,
              }}
            >
              <div
                style={{
                  fontSize: compact ? 9 : 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: accent,
                  marginBottom: compact ? 6 : 10,
                }}
              >
                OWN MENU
              </div>
              <div
                style={{
                  fontSize: compact ? 11 : 14,
                  fontWeight: 700,
                  marginBottom: compact ? 8 : 14,
                }}
              >
                {t("kiosks_page.preview_setup_title")}
              </div>
              {pairingCode ? (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: compact ? "8px 10px" : "12px 14px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: compact ? 8 : 10,
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    {t("kiosks_page.col_code")}
                  </div>
                  <code
                    style={{
                      fontSize: compact ? 13 : 17,
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      color: "#111827",
                    }}
                  >
                    {pairingCode}
                  </code>
                </div>
              ) : null}
            </div>
          ) : variant === "disabled" ? (
            <div
              style={{
                ...screenStyle,
                backgroundImage: bgUrl ? screenStyle.backgroundImage : undefined,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: scrim,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: 16,
                  background: "rgba(185,28,28,0.92)",
                  borderRadius: 12,
                  maxWidth: "85%",
                }}
              >
                <div style={{ fontSize: compact ? 11 : 14, fontWeight: 800 }}>
                  {t("kiosks_page.preview_disabled_title")}
                </div>
                <div
                  style={{
                    fontSize: compact ? 9 : 11,
                    marginTop: 6,
                    opacity: 0.9,
                  }}
                >
                  {deviceName}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={screenStyle}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: scrim,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    padding: compact ? "12px 10px" : "20px 16px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: compact ? 8 : 11,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: compact ? 6 : 12,
                    }}
                  >
                    {t("kiosks_page.preview_kiosk_label")}
                  </div>
                  <div
                    style={{
                      fontSize: compact
                        ? isLandscape
                          ? 14
                          : 16
                        : isLandscape
                          ? 22
                          : 26,
                      fontWeight: 800,
                      lineHeight: 1.15,
                      textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                      marginBottom: compact ? 10 : 18,
                      padding: "0 4px",
                    }}
                  >
                    {restaurantName}
                  </div>
                  <div className="kiosk-preview-cta">
                    <div
                      style={{
                        width: compact ? 28 : 40,
                        height: 3,
                        borderRadius: 2,
                        background: accent,
                        margin: "0 auto 10px",
                        opacity: 0.9,
                      }}
                    />
                    <div
                      style={{
                        fontSize: compact ? 10 : 14,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.95)",
                      }}
                    >
                      {t("kiosks_page.preview_cta")}
                    </div>
                  </div>
                </div>
              </div>
              {showLanguageToggle ? (
                <div
                  style={{
                    position: "absolute",
                    top: compact ? 8 : 12,
                    right: compact ? 8 : 12,
                    display: "flex",
                    background: "rgba(248,250,252,0.92)",
                    borderRadius: 8,
                    padding: 2,
                    fontSize: compact ? 8 : 10,
                    fontWeight: 700,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      padding: "3px 6px",
                      borderRadius: 6,
                      background: "#fff",
                      color: "#111827",
                    }}
                  >
                    EN
                  </span>
                  <span style={{ padding: "3px 6px", color: "#9ca3af" }}>
                    中文
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
      {!compact ? (
        <div
          className="text-center mt-2 small"
          style={{ color: "#9ca3af", fontSize: "0.75rem" }}
        >
          {t("kiosks_page.preview_label")} ·{" "}
          {isLandscape
            ? t("kiosks_page.orientation_landscape")
            : t("kiosks_page.orientation_portrait")}
        </div>
      ) : null}
      <style>{`
        .kiosk-preview-cta {
          animation: kioskCtaPulse 3s ease-in-out infinite;
        }
        @keyframes kioskCtaPulse {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

export { resolveBackgroundUrl, DEFAULT_ACCENT };
