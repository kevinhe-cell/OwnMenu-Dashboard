import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Tab, Tabs, Badge, Alert, Spinner } from "react-bootstrap";
import { Settings, Play, History, BarChart3, Sparkles, Zap, Brain, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import SettingsTab from "./SettingsTab";
import RulesTab from "./RulesTab";
import StatusTab from "./StatusTab";
import SentHistoryTab from "./SentHistoryTab";
import Swal from "sweetalert2";

const AutomatedMarketing = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/automated-marketing/settings", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        // Trigger rules refresh when settings change (so templates reflect discount status)
        window.dispatchEvent(new Event("settingsUpdated"));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleTrigger = async () => {
    // 1. First, Alert the user about the test/live behavior
    const confirmation = await Swal.fire({
      title: t("marketing.autopilot.swal.run_trigger_title"),
      html: `
        <div class="text-start small text-muted">
          <p><strong>Note:</strong> ${t("marketing.autopilot.swal.run_trigger_html")}</p>
          <p class="mb-0">In <span class="text-success fw-bold">Live Mode</span>, ${t("marketing.autopilot.swal.run_trigger_live_note")}</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("marketing.autopilot.swal.run_now_btn"),
      cancelButtonText: t("common.cancel"),
      customClass: {
        popup: 'rounded-4 border-0 shadow',
        confirmButton: 'btn btn-primary px-4 rounded-3 me-2',
        cancelButton: 'btn btn-outline-secondary px-4 rounded-3'
      },
      buttonsStyling: false
    });
  
    // 2. If the user clicks "Cancel", stop here
    if (!confirmation.isConfirmed) return;
  
    // 3. Proceed with original logic
    try {
      Swal.fire({
        title: t("marketing.autopilot.swal.init_ai_title"),
        html: `<div class="py-3"><div class="spinner-border text-primary" role="status"></div><p class="mt-3 text-secondary">${t("marketing.autopilot.swal.init_ai_html")}</p></div>`,
        showConfirmButton: false,
        allowOutsideClick: false, // Prevent closing during execution
        customClass: { popup: 'rounded-4 border-0 shadow' }
      });
  
      const res = await fetch("/api/automated-marketing/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
  
      const result = await res.json();
  
      if (res.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: t("marketing.autopilot.swal.engine_started_title"),
          text: t("marketing.autopilot.swal.engine_started_msg", { count: result.results?.length || 0 }),
          customClass: { 
            popup: 'rounded-4 border-0 shadow',
            confirmButton: 'btn btn-primary px-4 rounded-3' 
          },
          buttonsStyling: false
        });
        if (activeTab === "status") window.location.reload();
      } else {
         throw new Error(result.message || "Failed to trigger");
      }
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: t("marketing.autopilot.swal.execution_failed_title"), 
        text: t("marketing.autopilot.swal.execution_failed_msg"),
        customClass: { popup: 'rounded-4 border-0 shadow' }
      });
    }
  };

  // Professional Style Object
  const theme = {
    bg: "#f9fafb",
    card: "#ffffff",
    primary: "#dd2f6e",
    textMain: "#111827",
    textMuted: "#6b7280",
    border: "#f3f4f6",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="grow" variant="primary" size="sm" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" >
      <>
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
          <div>
    
            <h2 className="fw-bold mb-1" style={{ color: theme.textMain, letterSpacing: "-0.025em" }}>
              {t("marketing.autopilot.title")}
            </h2>
            <p className="text-muted mb-0">
              {t("marketing.autopilot.desc")}
            </p>
          </div>

          <div className="d-flex gap-2">
            {settings?.enabled && (
              <Button
                onClick={handleTrigger}
                className="d-flex align-items-center shadow-sm"
                style={{
                  background: theme.primary,
                  border: "none",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "10px",
                  fontWeight: "500",
                }}
              >
                <Zap size={16} className="me-2" />
                {t("marketing.autopilot.run_test_btn")}
                
              </Button>

            )}
            <div 
              className="d-flex align-items-center px-3" 
              style={{ 
                background: settings?.enabled ? "#ecfdf5" : "#f3f4f6",
                color: settings?.enabled ? "#059669" : "#6b7280",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: "600",
                border: `1px solid ${settings?.enabled ? "#10b98133" : "#e5e7eb"}`
              }}
            >
              <div 
                style={{ 
                  width: 8, height: 8, borderRadius: "50%", 
                  background: settings?.enabled ? "#10b981" : "#9ca3af",
                  marginRight: 8
                }} 
              />
              {settings?.enabled ? t("marketing.autopilot.engine_active") : t("marketing.autopilot.engine_paused")}
            </div>
          </div>
        </div>

        {/* Info Alert */}
        {!settings?.enabled && (
          <Alert className="border-0 shadow-sm mb-4" style={{ background: "#eff6ff", borderRadius: "12px" }}>
            <div className="d-flex align-items-center">
              <Brain size={20} className="text-primary me-3" />
              <div className="small text-dark">
                <strong>{t("marketing.autopilot.system_offline_title")}</strong> {t("marketing.autopilot.system_offline_msg")}
              </div>
            </div>
          </Alert>
        )}

        {/* Main Interface */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="px-4 pt-3 custom-tabs"
              style={{ background: theme.card, borderBottom: `1px solid ${theme.border}` }}
            >
              <Tab
                eventKey="overview"
                title={<TabLabel icon={<BarChart3 size={18}/>} label={t("marketing.autopilot.tab_overview")} />}
              >
                <TabWrapper><StatusTab /></TabWrapper>
              </Tab>
              <Tab
                eventKey="rules"
                title={<TabLabel icon={<Sparkles size={18}/>} label={t("marketing.autopilot.tab_strategies")} />}
              >
                <TabWrapper><RulesTab /></TabWrapper>
              </Tab>
              <Tab
                eventKey="history"
                title={<TabLabel icon={<History size={18}/>} label={t("marketing.autopilot.tab_delivery_logs")} />}
              >
                <TabWrapper><SentHistoryTab /></TabWrapper>
              </Tab>
              <Tab
                eventKey="settings"
                title={<TabLabel icon={<Settings size={18}/>} label={t("marketing.autopilot.tab_configuration")} />}
              >
                <TabWrapper>
                  <SettingsTab settings={settings} onUpdate={fetchSettings} />
                </TabWrapper>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </>

      <style>{`
        .custom-tabs .nav-link {
          border: none !important;
          color: #6b7280 !important;
          padding: 1rem 1.25rem !important;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
        }
        .custom-tabs .nav-link.active {
          background: transparent !important;
          color: #dd2f6e !important;
        }
        .custom-tabs .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 1.25rem;
          right: 1.25rem;
          height: 2px;
          background: #dd2f6e;
        }
        .custom-tabs .nav-link:hover:not(.active) {
          color: #111827 !important;
        }
      `}</style>
    </div>
  );
};

// Helper Components for Cleaner JSX
const TabLabel = ({ icon, label }) => (
  <div className="d-flex align-items-center gap-2 py-1">
    {icon}
    <span>{label}</span>
  </div>
);

const TabWrapper = ({ children }) => (
  <div style={{ padding: "2.5rem", minHeight: "400px" }}>
    {children}
  </div>
);

export default AutomatedMarketing;