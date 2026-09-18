import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaClock, FaCalendarAlt, FaInfoCircle, FaRegEye, FaRegEyeSlash, FaChevronDown, FaChevronRight } from "react-icons/fa";
import * as categoryActions from "../../../store/categories";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";
import { sortByDisplayOrder } from "../../../utils/displayOrderSort";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryIconPicker } from "./CategoryIconPicker";

const IMAGE_SIZE_WARNING_BYTES = 800 * 1024;

function formatImageSize(bytes) {
  if (bytes == null || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function warnImageSizeIfNeeded(file) {
  if (file && file.size > IMAGE_SIZE_WARNING_BYTES) {
    swal({
      title: "Large image",
      text: `This image is ${formatImageSize(file.size)}. We recommend under 800KB for best performance. You can still use it.`,
      icon: "warning",
      timer: 5000,
      buttons: false,
    });
  }
}

function AllCategories() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isNewCategory, setNewCategory] = useState(false);
  const [expandedMainIds, setExpandedMainIds] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [editedCategory, setEditedCategory] = useState({
    name: "",
    chinese_name: "",
    index: 0,
    is_main: false,
    parent_id: null,
    display_start_time: "",
    display_end_time: "",
    display_days: [0, 1, 2, 3, 4, 5, 6],
    always_shown: true,
    image: null,
    imageAction: "noChange",
    image_url: "",
    icon: null,
    is_catering: false,
  });
  const mainCategories = categories?.filter((c) => c.is_main) || [];
  const topLevelCategories = useMemo(
    () =>
      sortByDisplayOrder(
        (categories || []).filter((c) => !c.parent_id),
        (c) => c.index,
        (c) => c.name,
      ),
    [categories],
  );
  const categoriesByMain = useMemo(() => {
    const grouped = {};
    (mainCategories || []).forEach((main) => {
      grouped[main.id] = categories
        .filter((cat) => !cat.is_main && cat.parent_id === main.id)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    });
    return grouped;
  }, [categories, mainCategories]);
  useEffect(() => {
    dispatch(categoryActions.getCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    const nextExpanded = {};
    (mainCategories || []).forEach((m) => {
      nextExpanded[m.id] = expandedMainIds[m.id] ?? true;
    });
    setExpandedMainIds(nextExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainCategories.length]);

  const convertTo12Hour = (time) => {
    if (!time || typeof time !== "string") return "";
    const normalized = time.trim();
    if (/\b(AM|PM)\b/i.test(normalized)) return normalized;
    // Accept both HH:MM and HH:MM:SS from API responses.
    const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return "";
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const convertTo24Hour = (time) => {
    if (!time || typeof time !== "string") return "";
    const normalized = time.trim();
    // If already in 24-hour format (HH:MM or HH:MM:SS without AM/PM), keep HH:MM.
    if (!/\b(AM|PM)\b/i.test(normalized)) {
      // Accept HH:MM, HH:MM:SS, HH:MM:SS.sss, HH:MM:SS+TZ, and datetime strings containing time.
      const match = normalized.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (!match) {
        const dt = new Date(normalized);
        if (Number.isNaN(dt.getTime())) return "";
        return `${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
      }
      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) return "";
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
    // Parse 12-hour format (e.g., "02:30 PM", "11:45 AM", with optional seconds).
    const match = normalized.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
    if (!match) return "";
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    
    if (ampm === "PM" && hour !== 12) {
      hour += 12;
    } else if (ampm === "AM" && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  const openModal = (category) => {
    setNewCategory(!category);
    setEditedCategory(category ? {
      id: category.id,
      name: category?.name || "",
      chinese_name: category?.chinese_name === "null" ? "" : (category?.chinese_name || ""),
      description: category?.description === "null" ? "" : (category?.description || ""),
      index: category?.index ?? 0,
      is_main: !!category?.is_main,
      is_catering: !!category?.is_catering,
      parent_id: category?.parent_id || null,
      display_days: category?.display_days || [0, 1, 2, 3, 4, 5, 6],
      always_shown: category?.always_shown ?? true,
      image: null,
      imageAction: "noChange",
      image_url: category?.image_url || "",
      icon: category?.icon || null,
      // Convert 12-hour format times back to 24-hour for time inputs
      display_start_time: category?.display_start_time ? convertTo24Hour(category.display_start_time) : "",
      display_end_time: category?.display_end_time ? convertTo24Hour(category.display_end_time) : "",
    } : {
      name: "",
      chinese_name: "",
      description: "",
      index: categories?.length || 0,
      is_main: false,
      is_catering: false,
      parent_id: null,
      display_days: [0, 1, 2, 3, 4, 5, 6],
      always_shown: true,
      image: null,
      imageAction: "noChange",
      image_url: "",
      icon: null,
      display_start_time: "",
      display_end_time: "",
    });
    setImagePreview(category?.image_url || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setImagePreview(null);
    setEditedCategory({});
  };

  const handleChange = (field, value) => {
    setEditedCategory((prev) => ({ ...prev, [field]: value }));
  };

  const handleDisplayDaysChange = (e) => {
    const val = parseInt(e.target.value);
    const updatedDays = editedCategory.display_days.includes(val)
      ? editedCategory.display_days.filter((d) => d !== val)
      : [...editedCategory.display_days, val];
    setEditedCategory({ ...editedCategory, display_days: updatedDays });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    warnImageSizeIfNeeded(file);
    setEditedCategory((prev) => ({
      ...prev,
      image: file,
      imageAction: file ? "replaceImage" : prev.imageAction,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEditedCategory((prev) => ({
      ...prev,
      image: null,
      imageAction: "deleteImage",
      image_url: "",
    }));
    setImagePreview(null);
  };

  const saveChanges = () => {
    if (!editedCategory.name?.trim()) return;
    if (!isNewCategory && (editedCategory.id == null || editedCategory.id === "")) {
      swal(t("common.error"), "Missing category id. Close and reopen the editor.", "error");
      return;
    }
    const defaultDays = [0, 1, 2, 3, 4, 5, 6];
    const isMain = !!editedCategory.is_main;

    // Normalize: empty string -> null. Never fall back to old values; if the
    // user clears the input, we want to actually clear it on the server.
    const startTime = editedCategory.display_start_time
      ? convertTo12Hour(editedCategory.display_start_time)
      : null;
    const endTime = editedCategory.display_end_time
      ? convertTo12Hour(editedCategory.display_end_time)
      : null;
    const daysArr =
      Array.isArray(editedCategory.display_days) && editedCategory.display_days.length
        ? [...editedCategory.display_days].sort()
        : defaultDays;
    const isFullWeek =
      JSON.stringify(daysArr) === JSON.stringify(defaultDays);

    // Category is time-restricted only when at least one time is set OR not
    // every day of the week is checked.
    const shouldBeLimited = !!(startTime || endTime) || !isFullWeek;

    const payload = {
      ...editedCategory,
      is_main: isMain,
      parent_id: isMain ? null : (editedCategory.parent_id || null),
      display_start_time: isMain ? null : startTime,
      display_end_time: isMain ? null : endTime,
      display_days: isMain ? defaultDays : daysArr,
      always_shown: isMain ? true : !shouldBeLimited,
      description: editedCategory.description?.trim() || null,
      chinese_name: editedCategory.chinese_name?.trim() || null,
      image: editedCategory.image || null,
      imageAction: editedCategory.imageAction || "noChange",
      is_catering: !!editedCategory.is_catering,
      icon: editedCategory.icon || null,
    };

    if (isNewCategory) {
      dispatch(categoryActions.addCategoryThunk(payload));
    } else {
      dispatch(categoryActions.editCategoryThunk(payload));
    }
    closeModal();
  };

  const resetScheduleToAlwaysShow = () => {
    setEditedCategory((prev) => ({
      ...prev,
      display_start_time: "",
      display_end_time: "",
      display_days: [0, 1, 2, 3, 4, 5, 6],
      always_shown: true,
    }));
  };

  const deleteCategory = async (categoryId) => {
    const willDelete = await swal({
      title: t("all_cat.swal.del_title"),
      text: t("all_cat.swal.del_desc"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (willDelete) {
      try {
        await dispatch(categoryActions.deleteCategoryThunk(categoryId));
        swal(t("all_cat.swal.deleted_title"), t("all_cat.swal.deleted_desc"), "success");
      } catch (error) {
        swal(t("common.error"), t("all_cat.swal.del_err_desc"), "error");
      }
    }
  };

  const dayLabels = [t("all_cat.days.0"), t("all_cat.days.1"), t("all_cat.days.2"), t("all_cat.days.3"), t("all_cat.days.4"), t("all_cat.days.5"), t("all_cat.days.6")];
  const toggleMain = (mainId) => {
    setExpandedMainIds((prev) => ({ ...prev, [mainId]: !prev[mainId] }));
  };

  const CategoryRow = ({ category, isSub = false }) => (
    <div
      className="d-flex align-items-center justify-content-between px-3 py-2 border rounded-3 bg-white mb-2"
      style={isSub ? { marginLeft: 28, borderLeft: "4px solid #e2e8f0" } : {}}
    >
      <div className="d-flex align-items-center gap-3 flex-wrap">
        {/* NOTE: 按需求隐藏列表左侧分类图片/占位图展示，保留代码结构 */}
        <div
          className="rounded-3 border bg-slate-50 overflow-hidden d-flex align-items-center justify-content-center d-none"
          style={{ width: 58, height: 58, display: "none" }}
        >
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span className="small text-muted">No image</span>
          )}
        </div>
        <Badge bg="light" text="dark" className="border px-2 py-1 rounded-3 fw-bold">
          #{category.index ?? 0}
        </Badge>
        {category.icon && (
          <div
            className="d-flex align-items-center justify-content-center bg-slate-50 border rounded-3 text-primary"
            style={{ width: 36, height: 36 }}
            title={`Icon: ${category.icon}`}
          >
            <CategoryIcon name={category.icon} size={20} />
          </div>
        )}
        <div>
          <div className="fw-bold text-slate-800 d-flex align-items-center gap-2">
            <span>{category.name}</span>
            {category.chinese_name && (
              <span className="text-muted fw-normal small">({category.chinese_name})</span>
            )}
            {category.is_main ? (
              <Badge bg="primary" className="rounded-pill">{t("all_cat.badge.main")}</Badge>
            ) : (
              <Badge bg="secondary" className="rounded-pill">{t("all_cat.badge.sub")}</Badge>
            )}
            {category.is_catering && (
              <Badge bg="success" className="rounded-pill text-white">Catering</Badge>
            )}
          </div>
          <div className="small text-muted">
            {category.is_main
              ? (category.description || t("all_cat.desc.main"))
              : `${categories?.find((c) => c.id === category.parent_id)?.name || t("all_cat.desc.no_parent")}${category.description ? ` - ${category.description}` : ""}`}
          </div>
          <div className="small mt-1">
            {category.is_main ? (
              <span className="text-muted">{t("all_cat.desc.controlled")}</span>
            ) : (
              <>
                <FaClock className="me-1 text-primary opacity-50" />
                {category.display_start_time && category.display_end_time
                  ? `${category.display_start_time} - ${category.display_end_time}`
                  : t("all_cat.desc.no_time")}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {!category.is_main && (
          category.always_shown ? (
            <Badge bg="success-soft" className="text-success rounded-pill px-2 py-1 fw-medium">
              <FaRegEye className="me-1" /> {t("all_cat.badge.always")}
            </Badge>
          ) : (
            <Badge bg="warning-soft" className="text-warning rounded-pill px-2 py-1 fw-medium">
              <FaRegEyeSlash className="me-1" /> {t("all_cat.badge.scheduled")}
            </Badge>
          )
        )}
        <Button size="sm" className="btn-action text-success" onClick={() => openModal(category)}>
          <FaEdit />
        </Button>
        <Button size="sm" className="btn-action text-danger" onClick={() => deleteCategory(category.id)}>
          <FaTrash />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <style>{`
        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .category-table thead th { background: #f1f5f9; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: none; padding: 16px; }
        .category-table tbody td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .day-chip { font-size: 0.65rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; margin: 1px; display: inline-block; border: 1px solid #e2e8f0; background: white; color: #dd2f6e; }
        .btn-action { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; transition: 0.2s; }
        .btn-action:hover { background: #f1f5f9; color: #1e293b; }
      `}</style>

      {/* Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-1">
        <div>
          <h3 className="fw-bold text-slate-800 mb-1">{t("all_cat.header.title")}</h3>
          <p className="text-muted small mb-0">{t("all_cat.header.desc")}</p>
        </div>
        <Button variant="primary" className="fw-bold shadow-sm px-4 rounded-pill" onClick={() => openModal(null)}>
          <FaPlus className="me-2" /> {t("all_cat.header.btn_add")}
        </Button>
      </div>

      {/* Alert / Instructions */}
      <div className="bg-white p-3 rounded-4 border border-slate-200 mb-4 d-flex align-items-center gap-3 shadow-sm">
        <div className="bg-indigo-soft p-2 rounded-3 text-primary">
          <FaInfoCircle />
        </div>
        <div className="small text-slate-600">
          <strong>{t("all_cat.tip.title")}</strong> {t("all_cat.tip.text1")} 
          <span dangerouslySetInnerHTML={{ __html: t("all_cat.tip.text2") }} />
        </div>
      </div>

      {/* Hierarchy View — top-level categories mixed by Index # */}
      <div className="table-container p-3">
        {topLevelCategories.map((category) => {
          if (category.is_main) {
            const subs = categoriesByMain[category.id] || [];
            const open = !!expandedMainIds[category.id];
            return (
              <div key={category.id} className="mb-3">
                <div
                  className="d-flex align-items-center justify-content-between px-3 py-2 border rounded-3 bg-slate-50"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleMain(category.id)}
                >
                  <div className="d-flex align-items-center gap-2 fw-bold">
                    {open ? <FaChevronDown /> : <FaChevronRight />}
                    <Badge bg="light" text="dark" className="border px-2 py-1 rounded-3 fw-bold">
                      #{category.index ?? 0}
                    </Badge>
                    {category.icon && (
                      <div
                        className="d-flex align-items-center justify-content-center bg-white border rounded-3 text-primary"
                        style={{ width: 34, height: 34 }}
                        title={`Icon: ${category.icon}`}
                      >
                        <CategoryIcon name={category.icon} size={18} />
                      </div>
                    )}
                    {/* NOTE: 按需求隐藏主分类图片展示，保留代码结构 */}
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="rounded-3 border d-none"
                        style={{ width: 42, height: 42, objectFit: "cover", display: "none" }}
                      />
                    )}
                    <span>{category.name}</span>
                    {category.chinese_name && (
                      <span className="text-muted fw-normal small">({category.chinese_name})</span>
                    )}
                    <Badge bg="primary" className="rounded-pill">{t("all_cat.badge.main")}</Badge>
                    {category.is_catering && (
                      <Badge bg="success" className="rounded-pill text-white">Catering</Badge>
                    )}
                    <Badge bg="light" text="dark" className="border rounded-pill">{subs.length} {t("all_cat.list.sub")}</Badge>
                  </div>
                  <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="btn-action text-success" onClick={() => openModal(category)}>
                      <FaEdit />
                    </Button>
                    <Button size="sm" className="btn-action text-danger" onClick={() => deleteCategory(category.id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="mt-2">
                    {subs.length === 0 ? (
                      <div className="text-muted small px-3 py-2" style={{ marginLeft: 28 }}>
                        {t("all_cat.list.empty_sub")}
                      </div>
                    ) : (
                      subs.map((sub) => <CategoryRow key={sub.id} category={sub} isSub />)
                    )}
                  </div>
                )}
              </div>
            );
          }

          return <CategoryRow key={category.id} category={category} />;
        })}
      </div>

      {/* Category Modal */}
      <Modal show={isModalOpen} onHide={closeModal} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            {isNewCategory ? t("all_cat.modal.title_new") : t("all_cat.modal.title_edit")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Label className="small fw-bold text-slate-600">{t("all_cat.modal.label_name")}</Form.Label>
                <Form.Control
                  type="text"
                  className="rounded-3 border-slate-200"
                  value={editedCategory.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-slate-600">{t("all_cat.modal.label_index")}</Form.Label>
                <Form.Control
                  type="number"
                  className="rounded-3 border-slate-200"
                  value={editedCategory.index}
                  onChange={(e) => handleChange("index", parseInt(e.target.value))}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-slate-600">
                Second language name (optional) / 中文名称
              </Form.Label>
              <Form.Control
                type="text"
                className="rounded-3 border-slate-200"
                value={editedCategory.chinese_name || ""}
                onChange={(e) => handleChange("chinese_name", e.target.value)}
                placeholder="e.g. 前菜 / 头盘"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6} className="d-flex flex-column gap-2 justify-content-center">
                <Form.Check
                  id="is-main-category"
                  type="checkbox"
                  label={t("all_cat.modal.label_main")}
                  checked={!!editedCategory.is_main}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEditedCategory((prev) => ({
                      ...prev,
                      is_main: checked,
                      parent_id: checked ? null : prev.parent_id,
                    }));
                  }}
                />
                <Form.Check
                  id="is-catering-category"
                  type="checkbox"
                  label="Catering Category"
                  checked={!!editedCategory.is_catering}
                  onChange={(e) => handleChange("is_catering", e.target.checked)}
                />
              </Col>
              {!editedCategory.is_main && (
                <Col md={6}>
                  <Form.Label className="small fw-bold text-slate-600">{t("all_cat.modal.label_parent")}</Form.Label>
                  <Form.Select
                    className="rounded-3 border-slate-200"
                    value={editedCategory.parent_id || ""}
                    onChange={(e) => handleChange("parent_id", e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">{t("all_cat.modal.opt_no_parent")}</option>
                    {mainCategories.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              )}
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-slate-600">{t("all_cat.modal.label_desc")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                className="rounded-3 border-slate-200"
                value={editedCategory.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("all_cat.modal.ph_desc")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-slate-600">分类图标 (Category Icon)</Form.Label>
              <CategoryIconPicker
                value={editedCategory.icon}
                onChange={(iconKey) => handleChange("icon", iconKey)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-slate-600">{t("all_cat.modal.label_image")}</Form.Label>
              <p className="small text-muted mb-2">{t("all_cat.modal.image_hint")}</p>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={editedCategory.name || t("all_cat.modal.label_image")}
                    className="rounded-3 border"
                    style={{ width: 96, height: 72, objectFit: "cover" }}
                  />
                )}
                <div>
                  {editedCategory.image && (
                    <p className="small text-muted mb-1">Size: {formatImageSize(editedCategory.image.size)}</p>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    className="rounded-3 border-slate-200"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      className="mt-2"
                      onClick={removeImage}
                    >
                      {t("all_cat.modal.btn_remove_image")}
                    </Button>
                  )}
                </div>
              </div>
            </Form.Group>

            {!editedCategory.is_main && (
            <div className="bg-slate-50 p-3 rounded-4 border border-slate-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-slate-700 mb-0 d-flex align-items-center gap-2">
                  <FaCalendarAlt className="text-primary" /> Availability Settings
                </h6>
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none p-0"
                  onClick={resetScheduleToAlwaysShow}
                  type="button"
                >
                  Reset (always show)
                </Button>
              </div>
              <p className="small text-muted mb-3">
                Leave time fields empty to show this category at all times.
                Set both fields to limit visibility to a window. Uncheck days
                to hide the category on those weekdays.
              </p>
              <Row className="mb-3">
                <Col>
                  <Form.Label className="smaller text-muted uppercase fw-bold">Visible From</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="time"
                      className="rounded-3 border-slate-200 shadow-none"
                      value={editedCategory.display_start_time || ""}
                      onChange={(e) => handleChange("display_start_time", e.target.value)}
                    />
                    {editedCategory.display_start_time && (
                      <Button
                        variant="light"
                        size="sm"
                        className="border"
                        onClick={() => handleChange("display_start_time", "")}
                        type="button"
                        title="Clear start time"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </Col>
                <Col>
                  <Form.Label className="smaller text-muted uppercase fw-bold">Visible Until</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="time"
                      className="rounded-3 border-slate-200 shadow-none"
                      value={editedCategory.display_end_time || ""}
                      onChange={(e) => handleChange("display_end_time", e.target.value)}
                    />
                    {editedCategory.display_end_time && (
                      <Button
                        variant="light"
                        size="sm"
                        className="border"
                        onClick={() => handleChange("display_end_time", "")}
                        type="button"
                        title="Clear end time"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
              <Form.Group>
                <Form.Label className="smaller text-muted uppercase fw-bold mb-2">{t("all_cat.modal.label_days")}</Form.Label>
                <div className="d-flex flex-wrap gap-2 py-2">
                  {dayLabels.map((label, i) => (
                    <Form.Check
                      key={i}
                      type="checkbox"
                      id={`day-modal-${i}`}
                      label={<span className="ms-1 small fw-medium">{label}</span>}
                      className="mb-0"
                      checked={editedCategory.display_days?.includes(i)}
                      onChange={handleDisplayDaysChange}
                      value={i}
                    />
                  ))}
                </div>
              </Form.Group>
            </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 p-4 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={closeModal}>{t("common.cancel")}</Button>
          <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" onClick={saveChanges}>{t("all_cat.modal.btn_save")}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AllCategories;
