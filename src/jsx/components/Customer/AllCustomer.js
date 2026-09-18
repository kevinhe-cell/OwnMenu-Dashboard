import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Pagination,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Collapse,
  Spinner,
} from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import {
  getCustomerThunk,
  updatePointsThunk,
  addCustomerThunk,
  updateCustomerTagsThunk,
  parseCustomerImport,
  confirmCustomerImport,
} from "../../../store/customers";
import {
  fetchBlockedPhonesThunk,
  blockPhoneThunk,
  unblockPhoneThunk,
} from "../../../store/blockedPhones";
import swal from "sweetalert2";
import { getToken } from "../../../store/utlits";
import CustomerProfileModal from "./CustomerProfileModal";

// Tag Configuration
// Layer 1 (mutually exclusive): new_customer, returning_customer, vip
// Layer 2 (multiple allowed): all other tags
function AllCustomers() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const TAG_CONFIG = useMemo(() => ({
    new_customer: { color: "#3b82f6", label: t('customers.tags.new_customer'), desc: t('customers.tags.desc.new_customer') },
    returning_customer: { color: "#10b981", label: t('customers.tags.returning_customer'), desc: t('customers.tags.desc.returning_customer') },
    vip: { color: "#f59e0b", label: t('customers.tags.vip'), desc: t('customers.tags.desc.vip') },
    at_risk: { color: "#ef4444", label: t('customers.tags.at_risk'), desc: t('customers.tags.desc.at_risk') },
    inactive_30: { color: "#64748b", label: t('customers.tags.inactive_30'), desc: t('customers.tags.desc.inactive_30') },
    inactive_60: { color: "#1e293b", label: t('customers.tags.inactive_60'), desc: t('customers.tags.desc.inactive_60') },
    brand_advocate: { color: "#8b5cf6", label: t('customers.tags.brand_advocate'), desc: t('customers.tags.desc.brand_advocate') },
    lapsed_vip: { color: "#d97706", label: t('customers.tags.lapsed_vip'), desc: t('customers.tags.desc.lapsed_vip') },
    one_time_buyer: { color: "#94a3b8", label: t('customers.tags.one_time_buyer'), desc: t('customers.tags.desc.one_time_buyer') },
    lunch_buyer: { color: "#06b6d4", label: t('customers.tags.lunch_buyer'), desc: t('customers.tags.desc.lunch_buyer') },
    dinner_buyer: { color: "#6366f1", label: t('customers.tags.dinner_buyer'), desc: t('customers.tags.desc.dinner_buyer') },
    late_night_owl: { color: "#4338ca", label: t('customers.tags.late_night_owl'), desc: t('customers.tags.desc.late_night_owl') },
    weekend_warrior: { color: "#0ea5e9", label: t('customers.tags.weekend_warrior'), desc: t('customers.tags.desc.weekend_warrior') },
    pickup_only: { color: "#14b8a6", label: t('customers.tags.pickup_only'), desc: t('customers.tags.desc.pickup_only') },
    delivery_only: { color: "#ec4899", label: t('customers.tags.delivery_only'), desc: t('customers.tags.desc.delivery_only') },
    promo_hunter: { color: "#be185d", label: t('customers.tags.promo_hunter'), desc: t('customers.tags.desc.promo_hunter') },
  }), [t]);
  const customers = useSelector((state) => state.customers.customers) || [];
  const stats = useSelector((state) => state.customers.stats) || {};
  const blockedPhones = useSelector((state) => state.blockedPhones?.items) || [];
  // UI States
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("ownmenu"); // ownmenu | clover | all
  const [cloverCustomers, setCloverCustomers] = useState([]);
  const [cloverLoading, setCloverLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [pointModal, setPointModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [tagModal, setTagModal] = useState(false);
  const [blockListModal, setBlockListModal] = useState(false);
  const [manualBlockPhone, setManualBlockPhone] = useState("");
  const [manualBlockReason, setManualBlockReason] = useState("");
  const [blockingPhone, setBlockingPhone] = useState(false);

  // Data States
  const [points, setPoints] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", points: 0, opt_in: false });
  const [editingCustomerTags, setEditingCustomerTags] = useState([]);
  const [savingTags, setSavingTags] = useState(false);
  const [tagStats, setTagStats] = useState({});
  const [loadingTagStats, setLoadingTagStats] = useState(false);
  const [updatingTags, setUpdatingTags] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importParsing, setImportParsing] = useState(false);
  const [importConfirming, setImportConfirming] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");

  const blockedPhoneSet = useMemo(() => {
    const s = new Set();
    blockedPhones.forEach((b) => s.add(String(b.phone || "").replace(/\D/g, "")));
    return s;
  }, [blockedPhones]);

  const isCustomerBlocked = (c) =>
    blockedPhoneSet.has(String(c?.phone || "").replace(/\D/g, ""));

  // Fetch tag statistics from backend
  const fetchTagStats = async () => {
    try {
      setLoadingTagStats(true);
      const token = getToken();
      const res = await fetch("/api/customer-tags/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTagStats(data.tagCounts || {});
      }
    } catch (err) {
      console.error("Failed to fetch tag statistics:", err);
    } finally {
      setLoadingTagStats(false);
    }
  };

  useEffect(() => {
    if (sourceFilter === "ownmenu") {
      dispatch(getCustomerThunk(currentPage, search));
      fetchTagStats();
    } else {
      fetchCloverSourceCustomers();
    }
  }, [dispatch, currentPage, search, sourceFilter]);

  const fetchCloverSourceCustomers = async () => {
    setCloverLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        source: sourceFilter,
        page: String(currentPage),
        pageSize: "50",
      });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/clover/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCloverCustomers(data.customers || []);
      } else {
        setCloverCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch Clover customers:", err);
      setCloverCustomers([]);
    } finally {
      setCloverLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchBlockedPhonesThunk());
  }, [dispatch]);

  const handleBlockCustomer = async (customer) => {
    const phone = String(customer?.phone || "").replace(/\D/g, "");
    if (phone.length !== 10) {
      return swal.fire("Invalid Phone", "Customer phone must be a 10-digit number.", "error");
    }

    const result = await swal.fire({
      title: `Block ${customer?.name || phone}?`,
      input: "text",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Why is this number being blocked?",
      showCancelButton: true,
      confirmButtonText: "Block",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(blockPhoneThunk(phone, result.value || ""));
      swal.fire({
        icon: "success",
        title: "Phone Blocked",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      swal.fire("Error", err.message || "Failed to block phone", "error");
    }
  };

  const handleUnblockCustomer = async (phone, label) => {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (!cleanPhone) return;

    const result = await swal.fire({
      title: `Unblock ${label || cleanPhone}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Unblock",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(unblockPhoneThunk({ phone: cleanPhone }));
      swal.fire({
        icon: "success",
        title: "Phone Unblocked",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      swal.fire("Error", err.message || "Failed to unblock", "error");
    }
  };

  const handleManualBlock = async (e) => {
    e.preventDefault();
    const cleanPhone = manualBlockPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return swal.fire("Invalid Phone", "Please enter a 10-digit phone number.", "error");
    }
    try {
      setBlockingPhone(true);
      await dispatch(blockPhoneThunk(cleanPhone, manualBlockReason));
      setManualBlockPhone("");
      setManualBlockReason("");
      swal.fire({
        icon: "success",
        title: "Phone Blocked",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      swal.fire("Error", err.message || "Failed to block phone", "error");
    } finally {
      setBlockingPhone(false);
    }
  };

  const handleUnblockById = async (item) => {
    const result = await swal.fire({
      title: `Unblock ${item.phone}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Unblock",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(unblockPhoneThunk({ id: item.id }));
    } catch (err) {
      swal.fire("Error", err.message || "Failed to unblock", "error");
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Metrics & chart data - total, new, returning, VIP
  const { metrics, chartData } = useMemo(() => {
    const vip = tagStats.vip || 0;
    const newC = tagStats.new_customer || 0;
    const returning = tagStats.returning_customer || 0;
    const total = stats.totalCustomers || 0;

    const data = [
      { name: t('customers.tags.new_customer'), value: newC, color: "#3b82f6" },
      { name: t('customers.tags.returning_customer'), value: returning, color: "#10b981" },
      { name: t('customers.tags.vip'), value: vip, color: "#f59e0b" },
    ].filter((d) => d.value > 0);

    return {
      metrics: { total, vip, new: newC, returning },
      chartData: data.length ? data : [{ name: "No segments", value: 1, color: "#e5e7eb" }],
    };
  }, [tagStats, stats.totalCustomers]);

  // Client-side tag filtering only (search is handled by backend)
  const displayCustomers = sourceFilter === "ownmenu" ? customers : cloverCustomers;
  const filteredCustomers = useMemo(() => {
    if (selectedTags.length === 0) return displayCustomers;

    return displayCustomers.filter(c => {
      const cTags = Array.isArray(c.tags) ? c.tags : [];
      return selectedTags.every(t => cTags.includes(t));
    });
  }, [displayCustomers, selectedTags]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || newCustomer.phone.length !== 10) {
      return swal.fire(t('customers.swal.invalid_input'), t('customers.swal.invalid_phone_msg'), "error");
    }
    await dispatch(addCustomerThunk(newCustomer));
    swal.fire(t('customers.swal.profile_created'), t('customers.swal.profile_added'), "success");
    setAddModal(false);
    setNewCustomer({ name: "", phone: "", email: "", points: 0, opt_in: false });
    dispatch(getCustomerThunk(currentPage, search));
  };

  const handleExportExcel = async () => {
    if (exportingExcel) return;
    setExportingExcel(true);
    try {
      const token = getToken();
      if (!token) return;

      const batchSize = 500;
      const maxRows = 50000;
      const list = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore && list.length < maxRows) {
        const params = new URLSearchParams({
          export: "1",
          limit: String(batchSize),
          offset: String(offset),
        });
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/rewards/all/user?${params.toString()}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to export customers");
        }

        const data = await res.json();
        const batch = data.data || [];
        list.push(...batch);
        hasMore = Boolean(data.hasMore) && batch.length > 0;
        offset += batch.length;
      }

      if (!list.length) {
        swal.fire({ icon: "info", title: "No customers to export" });
        return;
      }

      const rows = list.map((c) => ({
        Name: c.name || "",
        Phone: c.phone || "",
        Email: c.email || "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 36 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, `Customers_${new Date().toISOString().slice(0, 10)}.xlsx`);

      if (hasMore) {
        swal.fire({
          icon: "info",
          title: "Export limited",
          text: `Exported the first ${list.length} customers. Narrow your search if you need a smaller set.`,
        });
      }
    } catch (err) {
      swal.fire("Error", err.message || "Failed to export customers", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  const openImportModal = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportError("");
    setImportModal(true);
  };

  const handleParseImport = async () => {
    if (!importFile) {
      setImportError("Choose an Excel (.xlsx/.xls/.csv) or PDF file first.");
      return;
    }
    setImportError("");
    setImportParsing(true);
    setImportPreview(null);
    try {
      const data = await parseCustomerImport(importFile);
      setImportPreview(data);
      if (!data?.valid?.length) {
        setImportError(
          data?.summary?.invalid
            ? `No valid customers found (${data.summary.invalid} row(s) skipped — phone must be 10 digits).`
            : "No customers found in this file.",
        );
      }
    } catch (err) {
      setImportError(err.message || "Failed to parse file");
    } finally {
      setImportParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview?.valid?.length) return;
    setImportConfirming(true);
    setImportError("");
    try {
      const result = await confirmCustomerImport(importPreview.valid);
      setImportModal(false);
      setImportFile(null);
      setImportPreview(null);
      dispatch(getCustomerThunk(currentPage, search));
      fetchTagStats();
      const skipParts = [];
      if (result.skippedExisting) skipParts.push(`${result.skippedExisting} already existed`);
      if (result.skippedInvalid) skipParts.push(`${result.skippedInvalid} invalid`);
      await swal.fire({
        icon: "success",
        title: "Import complete",
        text: `Created ${result.created || 0} customer(s).${skipParts.length ? ` Skipped: ${skipParts.join(", ")}.` : ""}`,
      });
    } catch (err) {
      setImportError(err.message || "Import failed");
      swal.fire("Import failed", err.message || "Something went wrong", "error");
    } finally {
      setImportConfirming(false);
    }
  };

  const handleUpdatePoints = async () => {
    await dispatch(updatePointsThunk(selectedCustomerId, points));
    setPointModal(false);
    swal.fire({ title: t('customers.swal.points_synced'), icon: "success", toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
  };

  const handleOpenTagModal = (customer) => {
    setSelectedCustomerId(customer.id);
    setEditingCustomerTags(Array.isArray(customer.tags) ? [...customer.tags] : []);
    setTagModal(true);
  };

  const handleToggleTag = (tag) => {
    setEditingCustomerTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSaveTags = async () => {
    try {
      setSavingTags(true);
      await dispatch(updateCustomerTagsThunk(selectedCustomerId, editingCustomerTags));
      setTagModal(false);
      dispatch(getCustomerThunk(currentPage, search)); // Refresh list
      fetchTagStats(); // Refresh tag statistics
      swal.fire({ title: t('customers.swal.tags_updated'), icon: "success", toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    } catch (err) {
      swal.fire("Error", err.message || "Failed to update tags", "error");
    } finally {
      setSavingTags(false);
    }
  };

  const handleTagCustomers = async () => {
    const result = await swal.fire({
      title: t('customers.swal.calc_tags_title'),
      text: t('customers.swal.calc_tags_text'),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t('customers.swal.calc_confirm'),
      cancelButtonText: t('common.cancel'),
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingTags(true);
      const token = getToken();
      const res = await fetch("/api/customer-tags/update-restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        await swal.fire({
          title: t('customers.swal.tags_success'),
          text: t('customers.swal.tags_success_text', { updated: data.updated, total: data.total }),
          icon: "success",
        });
        // Refresh data
        dispatch(getCustomerThunk(currentPage, search));
        fetchTagStats();
      } else {
        const err = await res.json();
        throw new Error(err.message || "Failed to update tags");
      }
    } catch (err) {
      swal.fire("Error", err.message || "Failed to calculate tags", "error");
    } finally {
      setUpdatingTags(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-4" >
      <style>{`
        .intelligence-bar { background: white; border: 1px solid #eef0f2; border-radius: 12px; display: flex; align-items: center; padding: 20px; gap: 40px; margin-bottom: 30px; }
        .m-divider { width: 1px; height: 50px; background: #eee; }
        .m-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .m-count { font-size: 24px; font-weight: 800; color: #1e293b; }
        
        .tag-pill-filter { cursor: pointer; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0; background: #fff; color: #475569; transition: 0.1s; }
        .tag-pill-filter.active { background: #dd2f6e; color: #fff; border-color: #dd2f6e; }
        
        .ai-table thead th { background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 15px 20px; border: none; }
        .ai-table tbody td { padding: 15px 20px; border-top: 1px solid #f1f5f9; font-size: 14px; }
        
        .status-pill { background: white; border: 1px solid currentColor; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
      `}</style>

      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>{t('customers.title')}</h4>
          <p className="text-muted small mb-0">{t('customers.desc')}</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="link" className="text-muted text-decoration-none small" onClick={() => setShowGuide(!showGuide)}>
            <i className="fas fa-info-circle"></i> {t('customers.tag_label')}
          </Button>
          <Button 
            variant="outline-primary" 
            className="rounded-2 px-4 fw-bold shadow-none" 
            onClick={handleTagCustomers}
            disabled={updatingTags || loadingTagStats}
          >
            {updatingTags ? <><Spinner size="sm" className="me-2" /> {t('customers.calculating')}</> : t('customers.tag_customers')}
          </Button>
          <Button
            variant="outline-success"
            className="rounded-2 px-4 fw-bold shadow-none"
            onClick={handleExportExcel}
            disabled={exportingExcel}
          >
            {exportingExcel ? (
              <><Spinner size="sm" className="me-2" /> Exporting...</>
            ) : (
              <><i className="fas fa-file-excel me-1"></i> Export Excel</>
            )}
          </Button>
          <Button
            variant="outline-primary"
            className="rounded-2 px-4 fw-bold shadow-none"
            onClick={openImportModal}
            disabled={importParsing || importConfirming}
          >
            <i className="fas fa-file-upload me-1"></i> Import Customers
          </Button>
          <Button
            variant="outline-danger"
            className="rounded-2 px-4 fw-bold shadow-none"
            onClick={() => setBlockListModal(true)}
            title="Manage blocked phone numbers"
          >
            <i className="fas fa-ban me-1"></i>
            Block List
            {blockedPhones.length > 0 && (
              <Badge bg="danger" className="ms-2">{blockedPhones.length}</Badge>
            )}
          </Button>
          <Button variant="dark" className="rounded-2 px-4 fw-bold shadow-none" onClick={() => setAddModal(true)}>
            + {t('customers.add_profile')}
          </Button>
        </div>
      </div>

      {/* Overview Section - chart + 4 stats */}
      <div className="intelligence-bar shadow-sm">
        <div style={{ width: "140px", height: "140px", flexShrink: 0, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <span className="fw-bold d-block" style={{ fontSize: "1.25rem", color: "#1f2937" }}>
              {metrics.total}
            </span>
            <span className="text-muted d-block" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
              {t('customers.stats.total')}
            </span>
          </div>
        </div>
        <div className="flex-grow-1">
          <Row className="g-4">
            <Col xs={6} md={3}>
              <div>
                <div className="m-title" style={{ color: '#6b7280' }}>{t('customers.stats.all')}</div>
                <div className="m-count">{metrics.total}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div>
                <div className="m-title" style={{ color: '#3b82f6' }}>{t('customers.stats.new')}</div>
                <div className="m-count">{metrics.new}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div>
                <div className="m-title" style={{ color: '#10b981' }}>{t('customers.stats.returning')}</div>
                <div className="m-count">{metrics.returning}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div>
                <div className="m-title" style={{ color: '#f59e0b' }}>{t('customers.stats.vip')}</div>
                <div className="m-count">{metrics.vip}</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Guide Collapse */}
      <Collapse in={showGuide}>
        <div className="mb-4">
          <div className="p-4 border rounded-3 bg-white shadow-sm">
            <h6 className="fw-bold small mb-3 text-uppercase">{t('customers.tags.title')}</h6>
            <Row className="g-3">
              {Object.keys(TAG_CONFIG).map(k => (
                <Col key={k} md={3} xs={6}>
                  <div className="small fw-bold mb-1" style={{ color: TAG_CONFIG[k].color }}>{TAG_CONFIG[k].label}</div>
                  <div className="text-muted" style={{ fontSize: '11px', lineHeight: '1.2' }}>{TAG_CONFIG[k].desc}</div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </Collapse>

      {/* Filter Row */}
      <div className="mb-4">
        <Row className="g-3 align-items-center mb-2">
          <Col>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="small text-muted me-1">Source:</span>
              {[
                { id: "ownmenu", label: "OwnMenu" },
                { id: "clover", label: "Clover" },
                { id: "all", label: "All" },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={sourceFilter === opt.id ? "primary" : "outline-secondary"}
                  onClick={() => {
                    setSourceFilter(opt.id);
                    setCurrentPage(1);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
              {cloverLoading && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>
          </Col>
        </Row>
        <Row className="g-3 align-items-center">
          <Col lg={3}>
            <InputGroup className="bg-white border rounded-2 px-2 shadow-sm">
              <InputGroup.Text className="bg-transparent border-0 text-muted small"><i className="fas fa-search"></i></InputGroup.Text>
              <Form.Control className="border-0 shadow-none py-2 bg-transparent small" placeholder={t('customers.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </Col>
          <Col lg={9}>
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              {Object.keys(TAG_CONFIG).map(key => (
                <div
                  key={key}
                  className={`tag-pill-filter ${selectedTags.includes(key) ? 'active' : ''}`}
                  onClick={() => setSelectedTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key])}
                >
                  {TAG_CONFIG[key].label}
                </div>
              ))}
              {selectedTags.length > 0 && <Button variant="link" className="text-danger small p-0 ms-2" onClick={() => setSelectedTags([])}>{t('customers.reset')}</Button>}
            </div>
          </Col>
        </Row>
      </div>

      {/* Table Section */}
      <div className="bg-white border rounded-3 shadow-sm overflow-hidden">
        <Table responsive hover className="ai-table mb-0 align-middle">
          <thead>
            <tr>
              <th>{t('customers.table.name')}</th>
              <th>{t('customers.table.contact')}</th>
              <th>{t('customers.table.segments')}</th>
              <th>{t('customers.table.points')}</th>
              <th className="text-end">{t('customers.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => {
              const blocked = isCustomerBlocked(c);
              const rowId = c.ownmenu_id || c.id;
              const isCloverOnly = c.source === "clover";
              return (
                <tr
                  key={c.id}
                  onClick={() => {
                    if (isCloverOnly) return;
                    setSelectedCustomerId(rowId);
                    setShowProfile(true);
                  }}
                  style={blocked ? { backgroundColor: "#fef2f2" } : undefined}
                >
                  <td className="fw-bold text-dark">
                    {c.name}
                    {c.source === "clover" && (
                      <Badge bg="secondary" className="ms-2" style={{ fontSize: "10px" }}>Clover</Badge>
                    )}
                    {(c.linked || c.clover_customer_id) && c.source !== "clover" && (
                      <Badge bg="info" className="ms-2" style={{ fontSize: "10px" }}>
                        {c.linked ? "Linked" : "Clover"}
                      </Badge>
                    )}
                    {blocked && (
                      <Badge bg="danger" className="ms-2" style={{ fontSize: "10px" }}>
                        <i className="fas fa-ban me-1"></i>BLOCKED
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className="fw-semibold text-dark small">{c.phone}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{c.email || '—'}</div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {c.tags?.map(tagKey => (
                        <span key={tagKey} className="status-pill" style={{ color: TAG_CONFIG[tagKey]?.color || '#94a3b8' }}>
                          {TAG_CONFIG[tagKey]?.label || tagKey}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="fw-bold text-primary">{c.points ?? "—"}</td>
                  <td className="text-end" onClick={e => e.stopPropagation()}>
                    {isCloverOnly ? (
                      <span className="text-muted small">Clover only</span>
                    ) : (
                    <div className="d-flex gap-1 justify-content-end">
                      <Button variant="white" size="sm" className="border shadow-none py-1" onClick={() => handleOpenTagModal(c)} title="Edit Tags">
                        <i className="fas fa-tags text-primary"></i>
                      </Button>
                      <Button variant="white" size="sm" className="border shadow-none py-1" onClick={() => { setSelectedCustomerId(rowId); setPointModal(true); }} title="Edit Points">
                        <i className="fas fa-edit text-primary"></i>
                      </Button>
                      {blocked ? (
                        <Button
                          variant="white"
                          size="sm"
                          className="border shadow-none py-1"
                          onClick={() => handleUnblockCustomer(c.phone, c.name)}
                          title="Unblock customer"
                        >
                          <i className="fas fa-unlock text-success"></i>
                        </Button>
                      ) : (
                        <Button
                          variant="white"
                          size="sm"
                          className="border shadow-none py-1"
                          onClick={() => handleBlockCustomer(c)}
                          title="Block customer from placing orders"
                        >
                          <i className="fas fa-ban text-danger"></i>
                        </Button>
                      )}
                    </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {filteredCustomers.length === 0 && <div className="text-center py-5 text-muted small">{t('customers.table.no_profiles')}</div>}
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted small">
          {t('customers.pagination.showing', { page: currentPage })} {filteredCustomers.length > 0 && t('customers.pagination.customer_count', { count: filteredCustomers.length })}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-dark"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3"
          >
            <i className="fas fa-chevron-left me-1"></i> {t('customers.pagination.prev')}
          </Button>
          <Button
            variant="outline-dark"
            size="sm"
            disabled={filteredCustomers.length < 10}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3"
          >
            {t('customers.pagination.next')} <i className="fas fa-chevron-right ms-1"></i>
          </Button>
        </div>
      </div>

      {/* Add Profile Modal */}
      <Modal show={addModal} onHide={() => setAddModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{t('customers.modals.create.title')}</Modal.Title></Modal.Header>
        <Form onSubmit={handleAddCustomer}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('customers.modals.create.name')}</Form.Label>
              <Form.Control required type="text" className="rounded-2" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder={t('customers.modals.create.name_placeholder')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('customers.modals.create.phone')}</Form.Label>
              <Form.Control required type="text" maxLength={10} className="rounded-2" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value.replace(/\D/g, '') })} placeholder="5550001234" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">{t('customers.modals.create.email')}</Form.Label>
              <Form.Control type="email" className="rounded-2" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="name@example.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="opt-in-sms"
                label={t('customers.modals.create.opt_in_sms')}
                checked={!!newCustomer.opt_in}
                onChange={e => setNewCustomer({ ...newCustomer, opt_in: e.target.checked })}
                className="small"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="dark" type="submit" className="w-100 py-2 fw-bold">{t('customers.modals.create.submit')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Import Customers Modal */}
      <Modal
        show={importModal}
        onHide={() => !(importParsing || importConfirming) && setImportModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton={!(importParsing || importConfirming)} className="border-0">
          <Modal.Title className="fw-bold">
            <i className="fas fa-file-upload me-2"></i>Import Customers
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Upload Excel (.xlsx, .xls, .csv) or PDF. We extract <strong>phone</strong> (required, 10 digits),
            plus optional <strong>name</strong>, <strong>email</strong>, and <strong>points</strong>.
            Excel uses column matching; PDFs (and messy sheets) use AI.
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">File</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls,.csv,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              disabled={importParsing || importConfirming}
              onChange={(e) => {
                setImportFile(e.target.files?.[0] || null);
                setImportPreview(null);
                setImportError("");
              }}
            />
          </Form.Group>
          {importError && (
            <div className="alert alert-danger py-2 small">{importError}</div>
          )}
          {importPreview?.summary && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge bg="secondary">Found {importPreview.summary.found}</Badge>
              <Badge bg="success">Valid {importPreview.summary.valid}</Badge>
              <Badge bg="warning" text="dark">Invalid {importPreview.summary.invalid}</Badge>
              {importPreview.method && (
                <Badge bg="light" text="dark">via {importPreview.method}</Badge>
              )}
            </div>
          )}
          {importPreview?.valid?.length > 0 && (
            <div className="table-responsive mb-2" style={{ maxHeight: 280, overflowY: "auto" }}>
              <Table size="sm" hover className="mb-0">
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.valid.slice(0, 50).map((row) => (
                    <tr key={row.phone}>
                      <td>{row.phone}</td>
                      <td>{row.name || "—"}</td>
                      <td>{row.email || "—"}</td>
                      <td>{row.points ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {importPreview.valid.length > 50 && (
                <div className="small text-muted mt-1 px-1">
                  Showing first 50 of {importPreview.valid.length} valid rows.
                </div>
              )}
            </div>
          )}
          {importPreview?.invalid?.length > 0 && (
            <details className="small text-muted">
              <summary>{importPreview.invalid.length} invalid row(s)</summary>
              <ul className="mb-0 mt-2">
                {importPreview.invalid.slice(0, 20).map((row, i) => (
                  <li key={i}>
                    {row.phone || "(no phone)"}
                    {row.name ? ` — ${row.name}` : ""}: {row.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            disabled={importParsing || importConfirming}
            onClick={() => setImportModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline-primary"
            disabled={!importFile || importParsing || importConfirming}
            onClick={handleParseImport}
          >
            {importParsing ? (
              <><Spinner size="sm" className="me-2" />Analyzing…</>
            ) : (
              "Analyze file"
            )}
          </Button>
          <Button
            variant="dark"
            disabled={!importPreview?.valid?.length || importParsing || importConfirming}
            onClick={handleConfirmImport}
          >
            {importConfirming ? (
              <><Spinner size="sm" className="me-2" />Importing…</>
            ) : (
              `Import ${importPreview?.valid?.length || 0}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reuse Points & Profile Modals */}
      <CustomerProfileModal show={showProfile} onHide={() => setShowProfile(false)} customerId={selectedCustomerId} onTagsSaved={fetchTagStats} />

      <Modal show={pointModal} onHide={() => setPointModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold small">{t('customers.modals.points.title')}</Modal.Title></Modal.Header>
        <Modal.Body><Form.Control type="number" value={points} onChange={e => setPoints(e.target.value)} autoFocus className="rounded-2" /></Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="dark" className="w-100 py-2 fw-bold small" onClick={handleUpdatePoints}>{t('customers.modals.points.save')}</Button>
        </Modal.Footer>
      </Modal>

      {/* Manage Blocked Phones Modal */}
      <Modal show={blockListModal} onHide={() => setBlockListModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <i className="fas fa-ban text-danger me-2"></i>Blocked Phone Numbers
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Customers using these phone numbers will not be able to place online orders.
          </p>

          <Form onSubmit={handleManualBlock} className="mb-4">
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Phone Number (10 digits)</Form.Label>
                <Form.Control
                  required
                  type="text"
                  maxLength={10}
                  className="rounded-2"
                  value={manualBlockPhone}
                  onChange={(e) => setManualBlockPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="5550001234"
                />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Reason (optional)</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={255}
                  className="rounded-2"
                  value={manualBlockReason}
                  onChange={(e) => setManualBlockReason(e.target.value)}
                  placeholder="e.g. fraudulent orders"
                />
              </Col>
              <Col md={3}>
                <Button type="submit" variant="dark" className="w-100 fw-bold" disabled={blockingPhone}>
                  {blockingPhone ? <Spinner size="sm" /> : "Block Number"}
                </Button>
              </Col>
            </Row>
          </Form>

          <div className="border rounded-3">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-3 py-2 small fw-bold text-muted">PHONE</th>
                  <th className="py-2 small fw-bold text-muted">REASON</th>
                  <th className="py-2 small fw-bold text-muted">BLOCKED ON</th>
                  <th className="px-3 py-2 text-end small fw-bold text-muted">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {blockedPhones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted small py-4">
                      No blocked phone numbers yet.
                    </td>
                  </tr>
                ) : (
                  blockedPhones.map((b) => (
                    <tr key={b.id}>
                      <td className="px-3 fw-bold text-dark">{b.phone}</td>
                      <td className="text-muted small">{b.reason || "—"}</td>
                      <td className="text-muted small">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 text-end">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="rounded-2 fw-bold"
                          onClick={() => handleUnblockById(b)}
                        >
                          <i className="fas fa-unlock me-1"></i>Unblock
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setBlockListModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Tag Edit Modal */}
      <Modal show={tagModal} onHide={() => setTagModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{t('customers.modals.tags.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">{t('customers.modals.tags.desc')}</p>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(TAG_CONFIG).map(tagKey => (
              <Button
                key={tagKey}
                variant={editingCustomerTags.includes(tagKey) ? "primary" : "outline-secondary"}
                size="sm"
                className="rounded-pill"
                onClick={() => handleToggleTag(tagKey)}
                style={editingCustomerTags.includes(tagKey) ? { 
                  backgroundColor: TAG_CONFIG[tagKey]?.color || '#94a3b8',
                  borderColor: TAG_CONFIG[tagKey]?.color || '#94a3b8'
                } : {}}
              >
                <i className={`fas ${TAG_CONFIG[tagKey]?.icon || 'fa-tag'} me-1`}></i>
                {TAG_CONFIG[tagKey]?.label || tagKey}
              </Button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setTagModal(false)}>{t('common.cancel')}</Button>
          <Button variant="dark" onClick={handleSaveTags} disabled={savingTags}>
            {savingTags ? <><Spinner size="sm" className="me-2" /> {t('customers.modals.tags.saving')}</> : t('customers.modals.tags.save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AllCustomers;
