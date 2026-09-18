import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Card, Button, Badge, Alert, Spinner, Modal } from "react-bootstrap";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Edit3,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import swal from "sweetalert";
import { getToken } from "../../../store/utlits";
import { useTranslation } from "react-i18next";

export default function AutomatedMenu() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [errors, setErrors] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const user = useSelector((state) => state.session.user);

  const ACCEPTED_FORMATS = {
    "application/pdf": [".pdf"],
    "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"],
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((file) => {
      const isValid = Object.keys(ACCEPTED_FORMATS).some((mime) => {
        if (mime === "image/*") {
          return file.type.startsWith("image/");
        }
        return file.type === mime;
      });
      return isValid;
    });

    if (validFiles.length === 0) {
      swal(t("automated_menu.swal.invalid_title"), t("automated_menu.swal.invalid_text"), "warning");
      return;
    }

    setFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const toggleCategory = (catIndex) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catIndex)) {
      newExpanded.delete(catIndex);
    } else {
      newExpanded.add(catIndex);
    }
    setExpandedCategories(newExpanded);
  };

  const handleUploadToGPT = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProcessingProgress({ current: 0, total: files.length });
    const token = getToken();

    const formData = new FormData();
    files.forEach((fileObj) => {
      formData.append("files", fileObj.file);
    });

    try {
      const res = await fetch("/api/items/parse-menu-bulk", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to parse menu");
      }

      const data = await res.json();
      
      // Expand all categories by default
      if (data.menu && Array.isArray(data.menu)) {
        setExpandedCategories(new Set(data.menu.map((_, idx) => idx)));
      }

      setMenuData(data.menu || []);
      
      // Show warnings for any errors
      if (data.errors && data.errors.length > 0) {
        swal({
          title: t("automated_menu.swal.errors_title"),
          text: t("automated_menu.swal.errors_text", { successful: data.successful, processed: data.processed, failed: data.errors.length }),
          icon: "warning",
          buttons: {
            confirm: { text: "OK", className: "btn btn-primary" }
          }
        });
      }

      // Clear files after successful parse
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error uploading to GPT:", err);
      swal(t("common.error"), err.message || t("automated_menu.errors.parse_failed"), "error");
    } finally {
      setIsUploading(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  const validatePrice = (value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const decimalMatch = cleaned.match(/^\d+(\.\d{0,2})?$/);
    return decimalMatch ? cleaned : "";
  };

  const handleInputChange = (catIndex, itemIndex, field, value) => {
    const updated = [...menuData];
    if (field === "price") {
      updated[catIndex].items[itemIndex][field] = validatePrice(value);
    } else {
      updated[catIndex].items[itemIndex][field] = value;
    }
    setMenuData(updated);
    // Clear error for this field
    const key = `item-${catIndex}-${itemIndex}-${field}`;
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const handleCategoryChange = (catIndex, value) => {
    const updated = [...menuData];
    updated[catIndex].category = value;
    setMenuData(updated);
    const key = `category-${catIndex}`;
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const addItem = (catIndex) => {
    const updated = [...menuData];
    updated[catIndex].items.push({
      name: "",
      chinese_name: "",
      description: "",
      price: "",
    });
    setMenuData(updated);
  };

  const removeItem = (catIndex, itemIndex) => {
    const updated = [...menuData];
    updated[catIndex].items.splice(itemIndex, 1);
    setMenuData(updated);
  };

  const removeCategory = (catIndex) => {
    const updated = menuData.filter((_, idx) => idx !== catIndex);
    setMenuData(updated);
    const newExpanded = new Set(expandedCategories);
    newExpanded.delete(catIndex);
    setExpandedCategories(newExpanded);
  };

  const validateBeforeSubmit = () => {
    const newErrors = {};
    menuData.forEach((cat, catIndex) => {
      if (!cat.category?.trim()) {
        newErrors[`category-${catIndex}`] = t("automated_menu.errors.req_category");
      }
      cat.items.forEach((item, itemIndex) => {
        const key = `item-${catIndex}-${itemIndex}`;
        if (!item.name?.trim()) {
          newErrors[`${key}-name`] = t("automated_menu.errors.req_item_name");
        }
        if (!item.price?.trim()) {
          newErrors[`${key}-price`] = t("automated_menu.errors.req_price");
        } else if (!validatePrice(item.price)) {
          newErrors[`${key}-price`] = t("automated_menu.errors.invalid_price");
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = async () => {
    if (!menuData || !validateBeforeSubmit()) {
      swal(t("automated_menu.swal.val_title"), t("automated_menu.swal.val_text"), "error");
      return;
    }

    const token = getToken();
    const cleanedMenu = menuData.map((cat) => ({
      ...cat,
      items: cat.items
        .filter((item) => item.name?.trim() && item.price?.trim())
        .map((item) => ({
          ...item,
          price: parseFloat(validatePrice(item.price)),
        })),
    })).filter((cat) => cat.items.length > 0);

    setSubmitLoading(true);

    try {
      const res = await fetch("/api/items/add-multiple-items", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cleanedMenu,
          restaurant_id: user?.restaurant_id,
        }),
      });

      if (!res.ok) {
        let errorMessage = t("automated_menu.errors.something_wrong");
        try {
          const errorData = await res.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
        } catch {
          errorMessage = res.status === 403 ? t("automated_menu.errors.no_permission") : errorMessage;
        }
        throw new Error(errorMessage);
      }

      swal(t("common.success"), t("automated_menu.swal.success_add"), "success");
      setMenuData(null);
      setFiles([]);
      setExpandedCategories(new Set());
    } catch (err) {
      console.error("Submit error:", err);
      swal(t("automated_menu.swal.fail_submit"), err.message || t("automated_menu.errors.add_failed"), "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, [files]);

  return (
    <>
      <style>{`
        .automated-menu-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .menu-header { text-align: center; margin-bottom: 2rem; }
        .menu-header h1 { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
        .menu-header p { color: #6c757d; font-size: 0.95rem; }
        .upload-section { margin-bottom: 2rem; }
        .drop-zone { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 3rem 2rem; text-align: center; background: #f8fafc; transition: all 0.3s ease; cursor: pointer; }
        .drop-zone:hover, .drop-zone.drag-active { border-color: #dd2f6e; background: #fef2f2; }
        .drop-zone-icon { color: #dd2f6e; margin-bottom: 1rem; }
        .drop-zone-text { font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
        .drop-zone-hint { color: #64748b; font-size: 0.875rem; }
        .file-list { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
        .file-item { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; max-width: 300px; }
        .file-item-preview { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        .file-item-info { flex: 1; min-width: 0; }
        .file-item-name { font-weight: 500; font-size: 0.875rem; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-item-size { font-size: 0.75rem; color: #64748b; }
        .file-item-remove { background: none; border: none; color: #dc3545; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; }
        .process-btn { background: linear-gradient(135deg, #dd2f6e 0%, #bb1e57 100%); border: none; color: white; padding: 0.875rem 2rem; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }
        .process-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(221, 47, 110, 0.3); }
        .process-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .menu-editor { margin-top: 2rem; }
        .category-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 1.5rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .category-header { padding: 1.25rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .category-header-left { display: flex; align-items: center; gap: 1rem; flex: 1; }
        .category-title-input { border: none; background: transparent; font-size: 1.125rem; font-weight: 600; color: #1e293b; flex: 1; padding: 0.25rem 0.5rem; border-radius: 6px; }
        .category-title-input:focus { outline: 2px solid #dd2f6e; outline-offset: 2px; background: white; }
        .category-badge { background: #fce7f0; color: #dd2f6e; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .category-actions { display: flex; gap: 0.5rem; }
        .category-content { padding: 1.5rem; }
        .item-row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; transition: all 0.2s ease; }
        .item-row:hover { border-color: #cbd5e1; background: white; }
        .item-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .item-row-number { font-weight: 600; color: #64748b; font-size: 0.875rem; }
        .item-row-remove { background: none; border: none; color: #dc3545; cursor: pointer; padding: 0.25rem; }
        .item-fields { display: grid; grid-template-columns: 2fr 1.5fr 2fr 1fr; gap: 1rem; }
        @media (max-width: 992px) { .item-fields { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
        .form-label .required { color: #dc3545; }
        .form-input { padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; transition: all 0.2s ease; }
        .form-input:focus { outline: none; border-color: #dd2f6e; box-shadow: 0 0 0 3px rgba(221, 47, 110, 0.1); }
        .form-input.error { border-color: #dc3545; }
        .error-message { font-size: 0.75rem; color: #dc3545; margin-top: 0.25rem; }
        .add-item-btn { background: #f1f5f9; border: 1px dashed #cbd5e1; color: #475569; padding: 0.75rem; border-radius: 10px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; }
        .add-item-btn:hover { background: #e2e8f0; border-color: #94a3b8; }
        .submit-section { margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; }
        .submit-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; padding: 1rem 2.5rem; border-radius: 12px; font-weight: 600; font-size: 1.125rem; width: 100%; transition: all 0.3s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
        .loading-content { background: white; border-radius: 20px; padding: 3rem; text-align: center; max-width: 500px; }
        .loading-spinner { width: 64px; height: 64px; margin: 0 auto 1.5rem; }
        .loading-text { font-size: 1.125rem; font-weight: 600; color: #1e293b; }
        .loading-subtext { color: #64748b; margin-top: 0.5rem; }
      `}</style>

      <div className="automated-menu-container">
        <div className="menu-header">
          <h1>
            <Sparkles size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            {t("automated_menu.page.title")}
          </h1>
          <p>{t("automated_menu.page.desc")}</p>
        </div>

        {!menuData && (
          <div className="upload-section">
            <div
              className={`drop-zone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="drop-zone-icon" />
              <div className="drop-zone-text">{t("automated_menu.dropzone.title")}</div>
              <div className="drop-zone-hint">{t("automated_menu.dropzone.hint")}</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
              style={{ display: "none" }}
            />

            {files.length > 0 && (
              <>
                <div className="file-list">
                  {files.map((fileObj) => (
                    <div key={fileObj.id} className="file-item">
                      {fileObj.preview && (
                        <img src={fileObj.preview} alt="" className="file-item-preview" />
                      )}
                      {!fileObj.preview && (
                        <FileText size={24} style={{ color: "#64748b", flexShrink: 0 }} />
                      )}
                      <div className="file-item-info">
                        <div className="file-item-name">{fileObj.name}</div>
                        <div className="file-item-size">{formatFileSize(fileObj.size)}</div>
                      </div>
                      <button
                        className="file-item-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(fileObj.id);
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <button
                    className="process-btn"
                    onClick={handleUploadToGPT}
                    disabled={isUploading || files.length === 0}
                  >
                    {isUploading ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        {t(files.length === 1 ? "automated_menu.btn.processing_one" : "automated_menu.btn.processing_other", { count: files.length })}
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        {t(files.length === 1 ? "automated_menu.btn.generate_one" : "automated_menu.btn.generate_other", { count: files.length })}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {menuData && menuData.length > 0 && (
          <div className="menu-editor">
            <Alert variant="info" className="mb-4 border-0" style={{ background: "#fce7f0", borderRadius: "12px" }}>
              <div className="d-flex align-items-start gap-2">
                <AlertCircle size={20} style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong>{t("automated_menu.editor.review_title")}</strong>
                  <div className="small mt-1">{t("automated_menu.editor.review_desc_pre")} <span className="text-danger">*</span> {t("automated_menu.editor.review_desc_post")}</div>
                </div>
              </div>
            </Alert>

            {menuData.map((cat, catIndex) => (
              <Card key={catIndex} className="category-card">
                <div className="category-header" onClick={() => toggleCategory(catIndex)}>
                  <div className="category-header-left">
                    {expandedCategories.has(catIndex) ? (
                      <ChevronUp size={20} style={{ color: "#64748b" }} />
                    ) : (
                      <ChevronDown size={20} style={{ color: "#64748b" }} />
                    )}
                    <input
                      type="text"
                      className={`category-title-input ${errors[`category-${catIndex}`] ? "error" : ""}`}
                      value={cat.category || ""}
                      onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={t("automated_menu.editor.cat_placeholder")}
                    />
                    <Badge bg="primary" className="category-badge">
                      {t(cat.items?.length === 1 ? "automated_menu.editor.items_one" : "automated_menu.editor.items_other", { count: cat.items?.length || 0 })}
                    </Badge>
                  </div>
                  <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => {
                        if (window.confirm(t("automated_menu.editor.confirm_del_cat", { category: cat.category }))) {
                          removeCategory(catIndex);
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>

                {expandedCategories.has(catIndex) && (
                  <div className="category-content">
                    {errors[`category-${catIndex}`] && (
                      <Alert variant="danger" className="mb-3 py-2">
                        {errors[`category-${catIndex}`]}
                      </Alert>
                    )}

                    {cat.items?.map((item, itemIndex) => {
                      const baseKey = `item-${catIndex}-${itemIndex}`;
                      return (
                        <div key={itemIndex} className="item-row">
                          <div className="item-row-header">
                            <span className="item-row-number">{t("automated_menu.editor.item_number", { number: itemIndex + 1 })}</span>
                            <button
                              className="item-row-remove"
                              onClick={() => removeItem(catIndex, itemIndex)}
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="item-fields">
                            <div className="form-group">
                              <label className="form-label">
                                {t("automated_menu.editor.item_name")} <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-input ${errors[`${baseKey}-name`] ? "error" : ""}`}
                                value={item.name || ""}
                                onChange={(e) => handleInputChange(catIndex, itemIndex, "name", e.target.value)}
                                placeholder={t("automated_menu.editor.item_name_placeholder")}
                              />
                              {errors[`${baseKey}-name`] && (
                                <div className="error-message">{errors[`${baseKey}-name`]}</div>
                              )}
                            </div>

                            <div className="form-group">
                              <label className="form-label">{t("automated_menu.editor.item_lang")}</label>
                              <input
                                type="text"
                                className="form-input"
                                value={item.chinese_name || ""}
                                onChange={(e) => handleInputChange(catIndex, itemIndex, "chinese_name", e.target.value)}
                                placeholder={t("automated_menu.editor.item_lang_placeholder")}
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">{t("automated_menu.editor.item_desc")}</label>
                              <input
                                type="text"
                                className="form-input"
                                value={item.description || ""}
                                onChange={(e) => handleInputChange(catIndex, itemIndex, "description", e.target.value)}
                                placeholder={t("automated_menu.editor.item_desc_placeholder")}
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">
                                {t("automated_menu.editor.item_price")} <span className="required">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-input ${errors[`${baseKey}-price`] ? "error" : ""}`}
                                value={item.price || ""}
                                onChange={(e) => handleInputChange(catIndex, itemIndex, "price", e.target.value)}
                                placeholder="9.99"
                              />
                              {errors[`${baseKey}-price`] && (
                                <div className="error-message">
                                  {errors[`${baseKey}-price`] === t("automated_menu.errors.invalid_price") 
                                    ? "Use format: 9.99" 
                                    : errors[`${baseKey}-price`]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="add-item-btn"
                      onClick={() => addItem(catIndex)}
                    >
                      <Plus size={18} />
                      Add Item
                    </button>
                  </div>
                )}
              </Card>
            ))}

            <div className="submit-section">
              <Button
                className="submit-btn"
                onClick={handleConfirmSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t("automated_menu.editor.adding_items")}
                  </>
                ) : (
                  <>
                    <Save size={20} className="me-2" />
                    {t("automated_menu.editor.btn_save_menu")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Spinner animation="border" variant="primary" className="loading-spinner" />
            <div className="loading-text">{t("automated_menu.loading.title")}</div>
            <div className="loading-subtext">
              {t(files.length === 1 ? "automated_menu.loading.desc_one" : "automated_menu.loading.desc_other", { count: files.length })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
