import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import WebsiteAnalytics from "./WebsiteAnalytics";
import AppStoreAnalytics from "./AppStoreAnalytics";
import "./HomeDashboard.css";

/**
 * Website / App Store analytics (moved from Overview).
 */
export default function WebsiteAnalyticsPage() {
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const todayStr = today.toLocaleDateString("en-CA");
  const [activeTab, setActiveTab] = useState("website");

  return (
    <div className="vd-page">
      <header className="vd-header">
        <h1>{t("dashboard.analytics_title")}</h1>
        <p>
          {activeTab === "website"
            ? t("dashboard.subtitle")
            : t("dashboard.app_store.subtitle")}
        </p>
      </header>

      <div className="vd-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "website"}
          className={`vd-tab${activeTab === "website" ? " active" : ""}`}
          onClick={() => setActiveTab("website")}
        >
          {t("dashboard.tab_website")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "app_store"}
          className={`vd-tab${activeTab === "app_store" ? " active" : ""}`}
          onClick={() => setActiveTab("app_store")}
        >
          {t("dashboard.tab_app_store")}
        </button>
      </div>

      {activeTab === "website" ? (
        <WebsiteAnalytics today={today} todayStr={todayStr} />
      ) : (
        <AppStoreAnalytics today={today} todayStr={todayStr} />
      )}
    </div>
  );
}
