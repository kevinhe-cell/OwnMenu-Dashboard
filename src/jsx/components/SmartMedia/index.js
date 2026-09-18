import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Loader, 
  Search, 
  Filter,
  Sparkles,
  Grid3x3,
  List,
  X,
  CheckCircle2,
  FileImage,
  FileVideo,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  MoreVertical,
  Eye,
  Calendar,
  HardDrive,
  Link2,
  Instagram,
  Package
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 24;

const SmartMedia = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterInstagramUsage, setFilterInstagramUsage] = useState("all"); // all | used | unused
  const [filterMatchStatus, setFilterMatchStatus] = useState("all"); // all | pending | approved | rejected | none
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  console.log("SmartMedia: media", media);
  // Fetch media from API with pagination and filters (applies to all media server-side)
  useEffect(() => {
    fetchMedia(currentPage);
    setSelectedItems(new Set());
  }, [currentPage, filterInstagramUsage, filterMatchStatus, dateFrom, dateTo]);

  // Clear selection when filter or search changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [filterType, searchQuery]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedMedia) {
      // Save current scroll position
      scrollPositionRef.current = {
        x: window.pageXOffset || document.documentElement.scrollLeft || 0,
        y: window.pageYOffset || document.documentElement.scrollTop || 0
      };
      
      // Lock body scroll
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollPositionRef.current.y}px`;
      body.style.left = `-${scrollPositionRef.current.x}px`;
      body.style.width = '100%';
      
      return () => {
        // Restore body styles
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.width = '';
        
        // Restore scroll position after styles are removed
        const { x, y } = scrollPositionRef.current;
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          window.scrollTo(x, y);
        });
      };
    }
  }, [selectedMedia]);


  const fetchMedia = async (page = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      if (filterInstagramUsage && filterInstagramUsage !== "all") {
        params.set("instagram_usage", filterInstagramUsage);
      }
      if (filterMatchStatus && filterMatchStatus !== "all") {
        params.set("match_status", filterMatchStatus);
      }
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await fetch(`/api/smart-media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
        setPagination(data.pagination || {
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        });
      } else {
        const error = await res.json();
        Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: error.message || t("smart_media.swal.err_load"),
          customClass: {
            popup: 'rounded-4 border-0 shadow-lg',
            confirmButton: 'btn btn-primary px-4 rounded-3'
          },
          buttonsStyling: false
        });
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("smart_media.swal.err_load_gallery"),
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg',
          confirmButton: 'btn btn-primary px-4 rounded-3'
        },
        buttonsStyling: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for current page (search and filter)
  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesSearch = !searchQuery || 
        (item.file_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterType === "all" || item.file_type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [media, searchQuery, filterType]);

  // Use backend pagination info
  const totalPages = pagination.totalPages;
  const paginatedMedia = filteredMedia; // Already paginated from backend, just filter client-side

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const token = getToken();

    try {
      if (files.length === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append("file", files[0]);

        const res = await fetch("/api/smart-media", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const newMedia = await res.json();
          // Refresh the current page to show the new upload
          fetchMedia(currentPage);
          Swal.fire({
            icon: "success",
            title: t("common.success"),
            text: t("marketing.smart_media.swal.upload_success"),
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-4 border-0 shadow-lg',
            },
            buttonsStyling: false
          });
        } else {
          const error = await res.json();
          throw new Error(error.message || "Upload failed");
        }
      } else {
        // Multiple files upload
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const res = await fetch("/api/smart-media/bulk", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const newMedias = await res.json();
          // Refresh the current page to show the new uploads
          fetchMedia(currentPage);
          Swal.fire({
            icon: "success",
            title: t("common.success"),
            text: t("marketing.smart_media.swal.bulk_upload_success", { count: newMedias.length }),
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-4 border-0 shadow-lg',
            },
            buttonsStyling: false
          });
        } else {
          const error = await res.json();
          throw new Error(error.message || "Upload failed");
        }
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      Swal.fire({
        icon: "error",
        title: t("marketing.smart_media.swal.upload_failed"),
        text: error.message || t("marketing.smart_media.swal.err_upload"),
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg',
          confirmButton: 'btn btn-primary px-4 rounded-3'
        },
        buttonsStyling: false
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
    e.target.value = "";
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  }, []);

  const handleDelete = async (id, fileName) => {
    const result = await Swal.fire({
      title: t("marketing.smart_media.lightbox.delete_title"),
      text: t("marketing.smart_media.lightbox.delete_confirm", { name: fileName || t("marketing.smart_media.lightbox.this_media") }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("marketing.smart_media.lightbox.delete_yes"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#d33",
      customClass: {
        popup: 'rounded-4 border-0 shadow-lg',
        confirmButton: 'btn btn-danger px-4 rounded-3 me-2',
        cancelButton: 'btn btn-outline-secondary px-4 rounded-3'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    const token = getToken();

    try {
      const res = await fetch(`/api/smart-media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Refresh the current page after deletion
        fetchMedia(currentPage);
        if (selectedMedia && selectedMedia.id === id) {
          setSelectedMedia(null);
        }
        Swal.fire({
          icon: "success",
          title: t("common.success"),
          text: t("marketing.smart_media.swal.delete_success"),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4 border-0 shadow-lg',
          },
          buttonsStyling: false
        });
      } else {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      Swal.fire({
        icon: "error",
        title: t("marketing.smart_media.swal.delete_failed"),
        text: error.message || t("marketing.smart_media.swal.err_delete"),
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg',
          confirmButton: 'btn btn-primary px-4 rounded-3'
        },
        buttonsStyling: false
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === paginatedMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedMedia.map(item => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const result = await Swal.fire({
      title: t("marketing.smart_media.swal.bulk_delete_title"),
      text: t("marketing.smart_media.swal.bulk_delete_text", { count: selectedItems.size }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("marketing.smart_media.swal.bulk_delete_yes", { count: selectedItems.size }),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#d33",
      customClass: {
        popup: 'rounded-4 border-0 shadow-lg',
        confirmButton: 'btn btn-danger px-4 rounded-3 me-2',
        cancelButton: 'btn btn-outline-secondary px-4 rounded-3'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    setBulkDeleting(true);
    const token = getToken();

    try {
      const res = await fetch("/api/smart-media/bulk-delete", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      });

      if (res.ok) {
        const data = await res.json();
        const deletedCount = selectedItems.size;
        const wasSelectedMediaDeleted = selectedMedia && selectedItems.has(selectedMedia.id);
        setSelectedItems(new Set());
        fetchMedia(currentPage);
        if (wasSelectedMediaDeleted) {
          setSelectedMedia(null);
        }
        Swal.fire({
          icon: "success",
          title: t("common.success"),
          text: data.message || t("marketing.smart_media.swal.bulk_delete_success", { count: deletedCount }),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4 border-0 shadow-lg',
          },
          buttonsStyling: false
        });
      } else {
        const error = await res.json();
        throw new Error(error.message || "Bulk delete failed");
      }
    } catch (error) {
      console.error("Error bulk deleting media:", error);
      Swal.fire({
        icon: "error",
        title: t("marketing.smart_media.swal.delete_failed"),
        text: error.message || t("marketing.smart_media.swal.err_bulk_delete"),
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg',
          confirmButton: 'btn btn-primary px-4 rounded-3'
        },
        buttonsStyling: false
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to midnight for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today - dateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t("common.today");
    if (diffDays === 1) return t("common.yesterday");
    if (diffDays < 7) return t("common.days_ago", { count: diffDays });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };


  const MediaSkeleton = () => (
    <div className="media-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-text" />
      <div className="skeleton-text-small" />
    </div>
  );

  const Lightbox = ({ item, onClose }) => {
    const metadata = item.metadata || {};
    const menuMatch = metadata.menu_item_match || null;
    const instagramUsage = metadata.instagram_usage || null;

    return (
      <div className="lightbox" onClick={onClose}>
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <button className="lightbox-close" onClick={onClose}>
            <X size={24} />
          </button>
          
          <div className="lightbox-body">
            {/* Media Section - Left */}
            <div className="lightbox-media-section">
              <div className="lightbox-image-container">
                {item.file_type === 'image' ? (
                  <img src={item.file_url} alt={item.file_name} />
                ) : (
                  <div className="lightbox-video">
                    <Video size={64} />
                    <p>{t("marketing.smart_media.lightbox.video_preview")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Section - Right */}
            <div className="lightbox-info-section">
              <div className="lightbox-info">
                <div className="lightbox-info-header">
                <button className="icon-btn" onClick={() => handleDelete(item.id, item.file_name)}>
                      <Trash2 size={20} />
                    </button>
                  <h3>{item.file_name}</h3>
                  <div className="lightbox-actions">
                 
                  </div>
                </div>
                
                {/* Basic Metadata */}
                <div className="lightbox-meta">
                  <div className="meta-item">
                    <HardDrive size={16} />
                    <span>{formatFileSize(item.file_size)}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    {item.file_type === 'image' ? <FileImage size={16} /> : <FileVideo size={16} />}
                    <span>{item.file_type.toUpperCase()}</span>
                  </div>
                </div>

                {/* Menu Item Match Section */}
                {menuMatch && (
                  <div className="metadata-section">
                    <div className="metadata-section-header">
                      <Package size={18} />
                      <h4>{t("marketing.smart_media.lightbox.menu_match_title")}</h4>
                    </div>
                    <div className="metadata-section-content">
                      <div className="metadata-row">
                        <span className="metadata-label">{t("marketing.smart_media.lightbox.matched_item")}</span>
                        <span className="metadata-value">{menuMatch.item_name || `Item #${menuMatch.item_id}`}</span>
                      </div>
                      {menuMatch.match_confidence && (
                        <div className="metadata-row">
                          <span className="metadata-label">{t("marketing.smart_media.lightbox.confidence")}</span>
                          <span className="metadata-value">{(menuMatch.match_confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {menuMatch.matched_at && (
                        <div className="metadata-row">
                          <span className="metadata-label">{t("marketing.smart_media.lightbox.matched_at")}</span>
                          <span className="metadata-value">{formatDate(menuMatch.matched_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Instagram Usage Section */}
                {instagramUsage && (
                  <div className="metadata-section">
                    <div className="metadata-section-header">
                      <Instagram size={18} />
                      <h4>{t("marketing.smart_media.lightbox.instagram_usage_title")}</h4>
                    </div>
                    <div className="metadata-section-content">
                      <div className="metadata-row">
                        <span className="metadata-label">{t("marketing.smart_media.lightbox.times_used")}</span>
                        <span className="metadata-value">{instagramUsage.used_times || 0}</span>
                      </div>
                      {instagramUsage.last_used_date && (
                        <div className="metadata-row">
                          <span className="metadata-label">{t("marketing.smart_media.lightbox.last_used")}</span>
                          <span className="metadata-value">{formatDate(instagramUsage.last_used_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Metadata Message */}
                {!menuMatch && !instagramUsage && (
                  <div className="metadata-empty">
                    <p>{t("marketing.smart_media.lightbox.no_meta_msg")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="smart-media-container bg-white">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .smart-media-container {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .header-section {
          background: white;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 1.5rem 2rem;
    
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.95);
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-title {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h1 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .stats-row {
          display: flex;
          gap: 1.5rem;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .header-description {
          margin: 0.75rem 0 0;
          color: #6c757d;
          font-size: 0.875rem;
          line-height: 1.5;
          max-width: 800px;
        }

        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(221, 47, 110, 0.3);
        }

        .upload-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(221, 47, 110, 0.4);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .controls-section {
          max-width: 1600px;
          margin: 1.5rem auto;
          padding: 0 2rem;
        }

        .search-filter-bar {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .select-all-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-right: 1rem;
          border-right: 1px solid #e9ecef;
        }

        .select-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #dd2f6e;
        }

        .select-all-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #495057;
          cursor: pointer;
          user-select: none;
        }

        .bulk-action-bar {
          max-width: 1600px;
          margin: 1rem auto;
          padding: 0 2rem;
        }

        .bulk-action-content {
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(221, 47, 110, 0.3);
          color: white;
        }

        .bulk-action-text {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .bulk-action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .bulk-action-btn {
          padding: 0.6rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .bulk-action-btn.cancel {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .bulk-action-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .bulk-action-btn.delete {
          background: white;
          color: #dc3545;
        }

        .bulk-action-btn.delete:hover:not(:disabled) {
          background: #f8f9fa;
          transform: translateY(-1px);
        }

        .bulk-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .search-input:focus {
          outline: none;
          border-color: #dd2f6e;
          background: white;
          box-shadow: 0 0 0 4px rgba(221, 47, 110, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .filter-btn {
          padding: 0.6rem 1.25rem;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        .filter-btn:hover {
          border-color: #dd2f6e;
          background: rgba(221, 47, 110, 0.05);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          color: white;
          border-color: transparent;
        }

        .filter-btn .filter-badge {
          font-size: 0.65rem;
          background: #28a745;
          color: white;
          padding: 0.1rem 0.35rem;
          border-radius: 999px;
          margin-left: 0.2rem;
        }

        .extra-filters-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          margin-top: 0.5rem;
          border-top: 1px solid #e9ecef;
          width: 100%;
        }

        .extra-filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .extra-filter-label {
          font-size: 0.8rem;
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .extra-filter-select,
        .extra-filter-input {
          padding: 0.45rem 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.875rem;
          min-width: 140px;
        }

        .extra-filter-input {
          min-width: 150px;
        }

        .clear-extra-filters {
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          color: #6c757d;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          margin-left: auto;
        }

        .clear-extra-filters:hover {
          background: #e9ecef;
          color: #495057;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .upload-zone {
          max-width: 1600px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        .drop-area {
          background: lightgray;
          border: 3px dashed rgba(255,255,255,0.4);
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

      
        .drop-area h3 {
          margin: 1rem 0 0.5rem;
          font-size: 1.5rem;
        }

        .drop-area p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .media-grid {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 2rem 3rem;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .grid-container.compact {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .media-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          position: relative;
        }

        .media-card.selected {
          border: 2px solid #dd2f6e;
          box-shadow: 0 4px 16px rgba(221, 47, 110, 0.3);
        }

        .media-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }

        .media-card-checkbox {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 6px;
          padding: 0.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .media-card-checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #dd2f6e;
        }

        .media-card-image {
          aspect-ratio: 1;
          overflow: hidden;
          background: #f8f9fa;
          position: relative;
        }

        .media-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .media-card:hover .media-card-image img {
          transform: scale(1.05);
        }

        .video-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1rem;
        }

        .media-card:hover .media-overlay {
          opacity: 1;
        }

        .overlay-actions {
          display: flex;
          gap: 0.5rem;
        }

        .overlay-btn {
          flex: 1;
          padding: 0.6rem;
          background: rgba(255,255,255,0.95);
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .overlay-btn:hover {
          background: white;
          transform: translateY(-2px);
        }

        .overlay-btn.delete {
          background: rgba(220, 53, 69, 0.95);
          color: white;
        }

        .overlay-btn.delete:hover {
          background: #dc3545;
        }

        .media-card-info {
          padding: 1rem;
        }

        .media-card-title {
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0 0 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #212529;
        }

        .media-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #6c757d;
        }

        .pagination-section {
          max-width: 1600px;
          margin: 2rem auto 3rem;
          padding: 0 2rem;
        }

        .pagination-container {
          background: white;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .pagination-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .page-btn {
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #dd2f6e;
          background: rgba(221, 47, 110, 0.05);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-btn.active {
          background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%);
          color: white;
          border-color: transparent;
        }

        .page-ellipsis {
          padding: 0 0.5rem;
          color: #6c757d;
        }

        .empty-state {
          max-width: 600px;
          margin: 4rem auto;
          padding: 3rem 2rem;
          text-align: center;
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .empty-state-icon {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          margin: 0 0 0.75rem;
          color: #212529;
          font-size: 1.5rem;
        }

        .empty-state p {
          margin: 0;
          color: #6c757d;
          font-size: 1rem;
        }

        .media-skeleton {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-image {
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-text {
          height: 16px;
          background: #f0f0f0;
          border-radius: 4px;
          margin: 1rem 1rem 0.5rem;
        }

        .skeleton-text-small {
          height: 12px;
          background: #f0f0f0;
          border-radius: 4px;
          margin: 0 1rem 1rem;
          width: 60%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.2s ease;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-content {
          max-width: 1400px;
          width: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          position: relative;
        }

        .lightbox-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.2s ease;
        }

        .lightbox-close:hover {
          background: rgba(0,0,0,0.8);
        }

        .lightbox-body {
          display: flex;
          flex-direction: row;
          max-height: 90vh;
          overflow: hidden;
        }

        .lightbox-media-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          min-width: 0;
          overflow: hidden;
        }

        .lightbox-image-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .lightbox-image-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .lightbox-video {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #6c757d;
        }

        .lightbox-info-section {
          width: 400px;
          min-width: 350px;
          background: white;
          border-left: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          max-height: 90vh;
        }

        .lightbox-info {
          padding: 1.5rem;
          background: white;
        }

        .lightbox-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .lightbox-info-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .lightbox-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          border-color: #dd2f6e;
          background: rgba(221, 47, 110, 0.05);
        }

        .lightbox-meta {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .metadata-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 3px solid #dd2f6e;
        }

        .metadata-section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .metadata-section-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #212529;
        }

        .metadata-section-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .metadata-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .metadata-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .metadata-value {
          font-size: 0.875rem;
          color: #212529;
          font-weight: 600;
        }

        .metadata-empty {
          margin-top: 1.5rem;
          padding: 1.5rem;
          text-align: center;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px dashed #dee2e6;
        }

        .metadata-empty p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .header-section {
            padding: 1rem;
          }

          .header-content {
            gap: 1rem;
          }

          .header-title h1 {
            font-size: 1.5rem;
          }

          .stats-row {
            font-size: 0.8rem;
            gap: 1rem;
          }

          .controls-section {
            padding: 0 1rem;
          }

          .search-filter-bar {
            padding: 1rem;
          }

          .extra-filters-row {
            flex-direction: column;
            align-items: stretch;
          }

          .clear-extra-filters {
            margin-left: 0;
          }

          .grid-container {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }

          .media-grid {
            padding: 0 1rem 2rem;
          }

          .pagination-section {
            padding: 0 1rem;
          }

          .lightbox {
            padding: 1rem;
          }

          .lightbox-content {
            max-height: 95vh;
          }

          .lightbox-body {
            flex-direction: column;
            max-height: 95vh;
          }

          .lightbox-media-section {
            flex: 0 0 auto;
            min-height: 300px;
            max-height: 50vh;
          }

          .lightbox-info-section {
            width: 100%;
            min-width: 100%;
            border-left: none;
            border-top: 1px solid #e9ecef;
            max-height: 45vh;
          }

          .lightbox-image-container {
            padding: 1rem;
          }

          .lightbox-image-container img {
            max-height: 50vh;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-title">
            <div className="title-row">
              <h1>{t("marketing.smart_media.title")}</h1>
              <span className="ai-badge"><Sparkles size={12} /> {t("common.ai_powered")}</span>
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <FileImage size={14} />
                <span>{media.filter(m => m.file_type === "image").length} {t("marketing.smart_media.images")}</span>
              </div>
              <div className="stat-item">
                <FileVideo size={14} />
                <span>{media.filter(m => m.file_type === "video").length} {t("marketing.smart_media.videos")}</span>
              </div>
              <div className="stat-item">
                <span>{t("marketing.smart_media.stats_total", { count: pagination.total })}</span>
              </div>
            </div>
            <p className="header-description">
              {t("marketing.smart_media.description")}
            </p>
          </div>
          <div>
            <input
              type="file"
              id="fileUpload"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
            <button
              className="upload-btn"
              onClick={() => document.getElementById("fileUpload").click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader size={18} className="spin" /> {t("marketing.smart_media.uploading")}</>
              ) : (
                <><Upload size={18} /> {t("marketing.smart_media.upload_btn")}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="controls-section">
        <div className="search-filter-bar">
          {paginatedMedia.length > 0 && (
            <div className="select-all-group">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedItems.size === paginatedMedia.length && paginatedMedia.length > 0}
                onChange={toggleSelectAll}
                className="select-checkbox"
              />
              <label htmlFor="selectAll" className="select-all-label">
                {t("marketing.smart_media.select_all", { count: paginatedMedia.length })}
              </label>
            </div>
          )}
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder={t("marketing.smart_media.search_placeholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                <X size={18} />
              </button>
            )}
          </div>
          <div className="filter-group">
            <Filter size={18} style={{ color: '#6c757d' }} />
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
            >
              {t("marketing.smart_media.all")}
            </button>
            <button
              className={`filter-btn ${filterType === "image" ? "active" : ""}`}
              onClick={() => {
                setFilterType("image");
                setCurrentPage(1);
              }}
            >
              <ImageIcon size={14} />
              {t("marketing.smart_media.images")}
            </button>
            <button
              className={`filter-btn ${filterType === "video" ? "active" : ""}`}
              onClick={() => {
                setFilterType("video");
                setCurrentPage(1);
              }}
            >
              <Video size={14} />
              {t("marketing.smart_media.videos")}
            </button>
            <button
              className={`filter-btn more-filters-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
              title={t("marketing.smart_media.more_filters")}
            >
              <Filter size={14} />
              {t("marketing.smart_media.more_filters")}
              {(filterInstagramUsage !== "all" || filterMatchStatus !== "all" || dateFrom || dateTo) && (
                <span className="filter-badge">on</span>
              )}
            </button>
          </div>
          {showFilters && (
            <div className="extra-filters-row">
              <div className="extra-filter-group">
                <span className="extra-filter-label">
                  <Instagram size={14} />
                  {t("marketing.smart_media.instagram_usage")}
                </span>
                <select
                  className="extra-filter-select"
                  value={filterInstagramUsage}
                  onChange={(e) => {
                    setFilterInstagramUsage(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t("marketing.smart_media.all")}</option>
                  <option value="used">{t("marketing.smart_media.used_on_instagram")}</option>
                  <option value="unused">{t("marketing.smart_media.not_used")}</option>
                </select>
              </div>
              <div className="extra-filter-group">
                <span className="extra-filter-label">
                  <Package size={14} />
                  {t("marketing.smart_media.match_status")}
                </span>
                <select
                  className="extra-filter-select"
                  value={filterMatchStatus}
                  onChange={(e) => {
                    setFilterMatchStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t("marketing.smart_media.all")}</option>
                  <option value="pending">{t("marketing.smart_media.pending")}</option>
                  <option value="approved">{t("marketing.smart_media.approved")}</option>
                  <option value="rejected">{t("marketing.smart_media.rejected")}</option>
                  <option value="none">{t("marketing.smart_media.no_match")}</option>
                </select>
              </div>
              <div className="extra-filter-group">
                <span className="extra-filter-label">
                  <Calendar size={14} />
                  {t("marketing.smart_media.date_from")}
                </span>
                <input
                  type="date"
                  className="extra-filter-input"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="extra-filter-group">
                <span className="extra-filter-label">
                  <Calendar size={14} />
                  {t("marketing.smart_media.date_to")}
                </span>
                <input
                  type="date"
                  className="extra-filter-input"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                type="button"
                className="clear-extra-filters"
                onClick={() => {
                  setFilterInstagramUsage("all");
                  setFilterMatchStatus("all");
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }}
              >
                {t("marketing.smart_media.clear_filters")}
              </button>
            </div>
          )}
          <div className="view-toggle">
            <button
              className={`filter-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              className={`filter-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedItems.size > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-action-content">
            <span className="bulk-action-text">
              {t("marketing.smart_media.bulk_selected", { count: selectedItems.size })}
            </span>
            <div className="bulk-action-buttons">
              <button
                className="bulk-action-btn cancel"
                onClick={() => setSelectedItems(new Set())}
              >
                {t("marketing.smart_media.bulk_cancel_btn")}
              </button>
              <button
                className="bulk-action-btn delete"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? (
                  <>
                    <Loader size={16} className="spin" />
                    {t("marketing.smart_media.deleting")}
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {t("marketing.smart_media.delete_selected")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="media-grid">
        {loading ? (
          <div className={`grid-container ${viewMode === 'list' ? 'compact' : ''}`}>
            {[...Array(12)].map((_, i) => (
              <MediaSkeleton key={i} />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchQuery || filterType !== "all" ? (
                <Search size={48} />
              ) : (
                <ImageIcon size={48} />
              )}
            </div>
            <h3>
              {searchQuery || filterType !== "all" 
                ? t("marketing.smart_media.no_media_found")
                : t("marketing.smart_media.no_media_yet")}
            </h3>
            <p>
              {searchQuery || filterType !== "all"
                ? t("marketing.smart_media.try_adjusting")
                : t("marketing.smart_media.click_upload")}
            </p>
          </div>
        ) : (
          <div className={`grid-container ${viewMode === 'list' ? 'compact' : ''}`}>
            {paginatedMedia.map((item) => (
              <div 
                key={item.id} 
                className={`media-card ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => setSelectedMedia(item)}
              >
                <div className="media-card-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="media-card-image">
                  {item.file_type === "image" ? (
                    <img
                      src={item.file_url}
                      alt={item.file_name}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%)'
                    }}>
                      <Video size={48} color="white" />
                    </div>
                  )}
                  {item.file_type === "video" && (
                    <div className="video-badge">
                      <Video size={12} />
                      {t("marketing.smart_media.video_badge")}
                    </div>
                  )}
                  <div className="media-overlay">
                    <div className="overlay-actions">
                      <button 
                        className="overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMedia(item);
                        }}
                      >
                        <Eye size={16} />
                        {t("marketing.smart_media.view_btn")}
                      </button>
                      <button 
                        className="overlay-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id, item.file_name);
                        }}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <>
                            <Trash2 size={16} />
                            {t("marketing.smart_media.delete_btn")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="media-card-info">
                  <div className="media-card-title" title={item.file_name}>
                    {item.file_name}
                  </div>
                  <div className="media-card-meta">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} files
            </div>
            <div className="pagination-buttons">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="page-ellipsis">...</span>;
                }
                return null;
              })}
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <Lightbox item={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartMedia;