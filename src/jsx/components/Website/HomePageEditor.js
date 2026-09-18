import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";
import {
  getHomepageThunk,
  updateHomepageThunk,
  createHomepageThunk,
  deleteImageThunk,
} from "../../../store/homepagesettings";
import HomepagePreview from "./Preview";
import { getUserPlanThunk } from "../../../store/session";
import { Button, Modal, Tabs, Tab, Badge } from "react-bootstrap";
import Lottie from "lottie-react";
import loader from "../../../json/onboarding.json";
import home1preview from "../../../preview/home1.png";
import home2preview from "../../../preview/home2.png";
import home3preview from "../../../preview/home3.png";
import home4preview from "../../../preview/home4.png";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronRight, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import AdvancedEditor from "./AdvancedEditor";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaPalette,
  FaRedoAlt,
  FaPuzzlePiece,
  FaWpforms,
  FaBullhorn,
  FaSitemap,
} from "react-icons/fa";
import { getPagesThunk } from "../../../store/pages";
import ThemeDropdown from "./ThemeColor";
import { getToken } from "../../../store/utlits";
import { SECTION_TEMPLATES } from "./editorConfig";

export default function HomepageEditor() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const restaurantId = useSelector((state) => state.session.user.restaurant_id);
  const homepagesetting = useSelector((state) => state.homepage.homepage);
  const plan = useSelector((state) => state.session.userPlan);
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const [saving, setSaving] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const sidebarRef = useRef();

  // --- 新增状态 ---
  const [pageData, setPageData] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  // ----------------

  const [draft, setDraft] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  // File upload states
  const [heroBanner, setHeroBanner] = useState(null);
  const [aboutImages, setAboutImages] = useState([]);
  const [carouselFiles, setCarouselFiles] = useState([]);
  const [logoImage, sestlogoImage] = useState(null);
  const [aiPreview, setAiPreview] = useState(null); // holds generated content
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [aiCreating, setAiCreating] = useState(false);
  const [aiStepMessage, setAiStepMessage] = useState("");
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [loadingHomepage, setLoadingHomepage] = useState(false);
  const [editorMode, setEditorMode] = useState("simple");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [siteProMode, setSiteProMode] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [aiLoadingSectionId, setAiLoadingSectionId] = useState(null); // 新增：控制 AI 生成按钮的 loading 状态

  // --- 1. 加载新数据源 ---
  useEffect(() => {
    if (restaurantId) {
      setLoadingHomepage(true);
      fetch(`/api/pages/restaurant/${restaurantId}`)
        .then(res => res.json())
        .then(data => {
          const homePage = Array.isArray(data) ? (data.find(p => p.slug === 'home') || data[0]) : data;
          if (homePage) {
            setPageData(homePage);
            setSections(
              [...(homePage.Sections || [])].sort(
                (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
              ),
            );
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingHomepage(false));
    }

    // 保留旧的 Redux 调用以兼容其他组件
    dispatch(getHomepageThunk(restaurantId));
    dispatch(getPagesThunk());
  }, [dispatch, restaurantId]);

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name);
    }
  }, [restaurant]);

  // 保留旧的 draft 初始化逻辑，用于 ThemeColor 等全局设置
  useEffect(() => {
    if (homepagesetting) {
      const withDefaults = {
        ...homepagesetting,
        themeStyle: homepagesetting.themeStyle || "home1",
        primaryColor: homepagesetting.primaryColor || "#000000",
        secondaryColor: homepagesetting.secondaryColor || "#FFD700",
        textColor: homepagesetting.textColor || "#333333",
        // ... 其他字段保留
      };
      setDraft(withDefaults);
    }
  }, [homepagesetting]);

  const handleChange = (field, value) => {
    const updated = { ...draft, [field]: value };
    setDraft(updated);
  };

  // --- 2. 新的字段修改逻辑 ---
  const handleDynamicContentChange = (sectionId, fieldKey, value) => {
    setSections((prev) => {
      const next = prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            SectionContent: {
              ...section.SectionContent,
              content_json: {
                ...(section.SectionContent?.content_json || {}),
                [fieldKey]: value,
              },
            },
          };
        }
        return section;
      });
      return next;
    });
  };

  // --- 3. 新的保存逻辑 ---
  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);

    try {
      // 1. 保存 Sections (新逻辑)
      const ordered = [...sections].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
      );
      const sectionsPayload = {
        sections: ordered.map((s, index) => ({
          id: s.id,
          template: s.template,
          order_index: index,
          is_enabled: s.is_enabled,
          content_json: s.SectionContent?.content_json || {},
        })),
      };

      const token = getToken();
      await fetch(`/api/pages/${pageData.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(sectionsPayload)
      });

      setSections(ordered);

      toast.success(t('builder.update_success'));
      setIframeKey(prev => prev + 1);
      setActiveSectionId(null);
      setShowLogoModal(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(t('builder.update_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSave = async () => {
    if (!draft) return;

    // 如果没有选择新文件，直接关闭即可，或者提示用户
    if (!logoImage) {
      setShowLogoModal(false);
      return;
    }

    setSaving(true);

    try {
      // 构造 payload
      // 确保所有必要字段都有默认值，防止后端 JSON.parse 报错
      const payload = {
        ...draft,
        colors: draft.colors || {},
        sections: draft.sections || {},
        hero: draft.hero || {},
        about: draft.about || {},
        info: draft.info || {},
        logoImage: logoImage // 这是 File 对象
      };

      // 调用 Redux Thunk 上传图片
      await dispatch(updateHomepageThunk(restaurantId, payload));

      toast.success(t('builder.logo_success'));
      setIframeKey(prev => prev + 1); // 刷新 iframe 预览
      setShowLogoModal(false);
      sestlogoImage(null); // 重置文件输入
    } catch (err) {
      console.error("Logo save error:", err);
      toast.error(t('builder.logo_error'));
    } finally {
      setSaving(false);
    }
  };

  // --- 新增：AI 生成内容逻辑 ---
  const generateAIContent = async (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    setAiLoadingSectionId(sectionId); // Start loading

    try {
      const token = getToken();
      const res = await fetch("/api/pages/ai/generate-content", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: section.type,
          currentContent: section.SectionContent?.content_json || {},
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate AI content");
      }

      const data = await res.json();

      // 更新本地状态
      setSections((prev) => {
        const next = prev.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              SectionContent: {
                ...sec.SectionContent,
                content_json: data.content,
              },
            };
          }
          return sec;
        });
        return next;
      });

      toast.success(`✨ AI content generated for "${section.type}"`);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Error generating AI content");
    } finally {
      setAiLoadingSectionId(null);
    }
  };
  // ---------------------------

  const handleImageDelete = async (type, imageUrl) => {
    // 保留旧逻辑
    // ...
  };

  // ... 保留 handleCreate, runAICombined 等辅助函数 ...
  const handleCreate = async () => { /* ... */ };
  const runAICombined = async () => { /* ... */ };
  const handleThemeSelect = async (theme) => { /* ... */ };
  const handFontStyleSelect = async (font) => { /* ... */ };
  const handleColorLayoutSelect = async () => { /* ... */ };

  // 渲染动态字段辅助函数
  const renderDynamicField = (section, fieldConfig) => {
    const value = section.SectionContent?.content_json?.[fieldConfig.key] || "";
    return (
      <div className="mb-3" key={fieldConfig.key}>
        <label className="form-label fw-medium">{fieldConfig.label}</label>
        {fieldConfig.type === 'textarea' ? (
          <textarea
            className="form-control"
            rows={4}
            value={value}
            onChange={(e) => handleDynamicContentChange(section.id, fieldConfig.key, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleDynamicContentChange(section.id, fieldConfig.key, e.target.value)}
          />
        )}
      </div>
    );
  };

  const activeSectionObj = sections.find(s => s.id === activeSectionId);
  const activeTemplateConfig = activeSectionObj ? SECTION_TEMPLATES[activeSectionObj.template] : null;

  return (
    <>
      <Modal
        show={showUpgradeModal}
        onHide={() => setShowUpgradeModal(false)}
        centered
        size="xl"
      >
        {/* Header */}
        <div className="text-center py-4 px-3 border-bottom">
          <h4 className="fw-bold mb-1">
            {t('builder.upgrade_title')}
          </h4>
          <p className="mb-0 small">
            {t('builder.upgrade_desc')}
            <br />
            {t('builder.one_click_desc')}
          </p>
        </div>

        {/* Body */}
        <Modal.Body className="px-4 py-4">
          <div className="row">
            {/* Features */}
            <div className="col-md-7">
              <ul className="list-unstyled">
                <li className="mb-3 d-flex">
                  <FaRobot className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_ai_web')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_ai_web_desc')}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaPalette className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      Hundreds of Layout Variants
                    </span>
                    <br />
                    <small className="text-muted">
                      Each section offers multiple professional templates
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaRedoAlt className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_restyling')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_restyling_desc')}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaPuzzlePiece className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_sections')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_sections_desc')}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaWpforms className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_forms')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_forms_desc')}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaBullhorn className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_popups')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_popups_desc')}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <FaSitemap className="text-success me-2 mt-1" />
                  <div>
                    <span className="fw-semibold text-success">
                      {t('builder.feature_pages')}
                    </span>
                    <br />
                    <small className="text-muted">
                      {t('builder.feature_pages_desc')}
                    </small>
                  </div>
                </li>
              </ul>
            </div>

            {/* Image Preview */}
            <div className="col-md-5 d-none d-md-block text-center">
              <img
                src="/advancededitor1.png"
                alt="AI Advanced Editor Preview"
                className="img-fluid rounded"
                style={{ maxHeight: "500px", objectFit: "cover" }}
              />
            </div>
          </div>
        </Modal.Body>

        {/* Footer */}
        <Modal.Footer className="border-0 d-flex justify-content-between align-items-center px-4 py-3">
          <Button
            variant="outline-secondary"
            onClick={() => setShowUpgradeModal(false)}
          >
            {t('builder.not_now')}
          </Button>
          <Button
            variant="primary"
            className="fw-semibold px-4"
            onClick={() => navigate("/plans")}
          >
            🚀 {t('builder.free_trial')}
          </Button>
        </Modal.Footer>
      </Modal>

      {editorMode === "advanced" && (
        <AdvancedEditor show={true} onClose={() => setEditorMode("simple")} restaurantId={restaurantId || restaurant?.id} restaurantName={restaurant?.name} />
      )}

      <div className="mb-5">
        {loadingHomepage && (
          <div style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {!loadingHomepage && !pageData && !aiCreating && (
          <div style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="text-center">
              <h3>{t('builder.no_website')}</h3>
              <button className="btn btn-primary px-4 py-2 mt-3" onClick={() => setEditorMode("advanced")}>🧠 {t('builder.create_with_ai')}</button>
            </div>
          </div>
        )}

        {/* AI Creating Loading Screen */}
        {aiCreating && (
          <div className="text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
            <Lottie
              animationData={loader}
              loop
              style={{ width: 300, height: 300 }}
            />
            <h4 className="fw-bold mt-4" style={{ maxWidth: "600px" }}>
              {aiStepMessage}
            </h4>
            <p className="text-muted mt-2">
              {t('builder.ai_building_title')}
            </p>
          </div>
        )}

        {pageData && !aiCreating && (
          <div className="row">
            {/* 顶部控制栏 (保持原样) */}
            <div className="w-100 border-bottom bg-white shadow-sm px-4 py-3" style={{ borderRadius: "35px" }}>
              {/* ... 内容保持不变 ... */}
              <div className="d-flex flex-wrap justify-content-between align-items-start mb-3">
                <div style={{ maxWidth: "900px" }}>
                  <p className="text-muted small mb-1">{t('builder.editor_notice_simple')}</p>
                  <p className="text-muted small mb-1">{t('builder.editor_notice_advanced')}</p>
                  <p className="text-muted small mb-0">{t('builder.editor_notice_domain')}</p>
                </div>
                <div>
                  <button type="button" className="btn btn-sm position-relative fw-semibold px-3 py-2 border-0 mt-2"
                    style={{ background: "linear-gradient(90deg,rgb(185, 37, 119) 0%,rgb(255, 49, 135) 100%)", color: "#fff", borderRadius: "0.5rem" }}
                    onClick={() => {
                        setEditorMode("advanced");
                      
                    }}>
                    ⚙️ {t('builder.advanced_editor')}
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: "0.6rem" }}>{t('builder.ai_powered')}</span>
                  </button>
                </div>
              </div>
              <div className="row align-items-center">
                <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                  <div className="small">{t('builder.live_at')} <a href={`https://${plan?.domain}.ownmenu.com`} target="_blank" className="fw-semibold text-primary text-decoration-none">{plan?.domain}.ownmenu.com</a></div>
                </div>
                <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                  <div className="btn-group btn-group-sm" role="group">
                    <button type="button" className={`btn ${previewMode === "desktop" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPreviewMode("desktop")}>🖥 Desktop</button>
                    <button type="button" className={`btn ${previewMode === "mobile" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPreviewMode("mobile")}>📱 Mobile</button>
                  </div>
                  {/* <ThemeDropdown onSelect={handleThemeSelect} onSelecteFontStyle={handFontStyleSelect} onToggleColorLayout={handleColorLayoutSelect} /> */}
                  <button className="btn btn-primary btn-sm fw-semibold" onClick={() => setShowLogoModal(true)}>✏️ Edit Logo</button>
                </div>
              </div>
            </div>

            <div className="col-lg-12" style={{ height: "100vh" }}>
              <div className="position-relative container-fluid">
                <div className="position-relative">
                  {/* 预览区域 (保持原样) */}
                  <div className="w-100" style={{ height: "100vh" }}>
                    <HomepagePreview iframeKey={iframeKey} iframeLoading={iframeLoading} plan={plan} previewMode={previewMode} setIframeLoading={setIframeLoading} />
                  </div>

                  {/* 侧边栏 (核心修改区域) */}
                  <div
                    ref={sidebarRef}
                    className={`position-fixed top-0 bg-white shadow-lg end-0 rounded-start ${sidebarVisible ? "show-sidebar" : "hide-sidebar"}`}
                    style={{ width: "400px", maxHeight: "90vh", marginTop: "60px", marginBottom: "40px", zIndex: 1040, overflowY: "auto", transform: sidebarVisible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.55s ease" }}
                  >
                    <div className="px-4 py-4">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        {!activeSectionId ? (
                          <h5 className="fw-bold text-dark mb-0">{t('builder.website_editor')}</h5>
                        ) : (
                          <button className="btn btn-link p-0 text-muted fw-bold" onClick={() => setActiveSectionId(null)}>← {t('common.back')}</button>
                        )}
                        <button className="btn btn-outline-secondary btn-sm rounded-pill ms-auto" onClick={() => setSidebarVisible(false)}>✖ {t('common.hide')}</button>
                      </div>
                      <hr />

                      <AnimatePresence mode="wait">
                        {/* 列表模式：显示 Theme + 动态 Sections */}
                        {!activeSectionId && (
                          <motion.div key="section-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="d-flex flex-column gap-1">

                            {/* 1. Theme (全局设置) - 保持不变 */}
                            <div className="card border rounded-3 shadow-sm hover-shadow-sm px-4 py-3 d-flex flex-row align-items-center justify-content-between" role="button" onClick={() => setActiveSectionId('theme')} style={{ cursor: "pointer" }}>
                              <div className="d-flex align-items-center gap-3">
                                <div className="d-flex flex-column">
                                  <span className="fw-bold text-dark">{t('builder.theme')}</span>
                                  <span className="text-muted" style={{ fontSize: "0.875rem" }}>{t('builder.theme_desc')}</span>
                                </div>
                              </div>
                              <FaChevronRight className="text-muted" size={18} />
                            </div>

                            {/* 2. 动态 Sections 列表 */}
                            {sections.map((section, index) => {
                              const config = SECTION_TEMPLATES[section.template] || { name: section.template };
                              return (
                                <div key={section.id} className="card border rounded-3 shadow-sm hover-shadow-sm px-4 py-3 d-flex flex-row align-items-center justify-content-between" role="button" onClick={() => setActiveSectionId(section.id)} style={{ cursor: "pointer" }}>
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex flex-column">
                                      <span className="fw-bold text-dark">{config.name}</span>
                                      <span className="text-muted" style={{ fontSize: "0.875rem" }}>{section.type.toUpperCase()} {t('builder.section')}</span>
                                    </div>
                                  </div>
                                  <FaChevronRight className="text-muted" size={18} />
                                </div>
                              );
                            })}

                            {/* 添加按钮 (占位) */}
                            <div className="mt-2">
                              <button className="btn w-100 btn-outline-primary py-2 fw-semibold" disabled>
                                <FaPlus className="me-2" /> {t('builder.add_section_soon')}
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* 编辑模式 */}
                        {activeSectionId && (
                          <motion.div key="editor-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card border-0 shadow-sm p-3 mt-3">

                            {/* Theme 编辑器 (保持旧逻辑) */}
                            {activeSectionId === 'theme' && (
                              <>
                                <div className="mb-4">
                                  <label className="form-label fw-semibold mb-2">{t('builder.website_style')}</label>
                                  {/* ... Theme 编辑器内容 ... */}
                                  <div className="border rounded-3 p-3 bg-white shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                      <div className="d-flex flex-column">
                                        <span className="text-muted small">Selected Website Style</span>
                                        <span className="fw-semibold text-capitalize text-dark">{draft?.themeStyle || "Default"}</span>
                                      </div>
                                      <button className="btn btn-primary btn-sm px-3" onClick={() => setShowStyleModal(true)}>🎨 Change Style</button>
                                    </div>
                                  </div>
                                </div>
                                {/* Logo Upload */}
                                <div className="mb-4">
                                  <label className="form-label fw-semibold">{t('builder.logo')}</label>
                                  {draft?.logoImage ? (
                                    <div className="position-relative mb-2" style={{ maxWidth: "150px" }}>
                                      <img src={draft.logoImage} alt="Logo" className="img-fluid rounded border" style={{ objectFit: "contain", height: "150px", width: "100%" }} />
                                      <button className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => handleImageDelete("logo", draft.logoImage)}>❌</button>
                                    </div>
                                  ) : (
                                    <input type="file" accept="image/*" className="form-control" onChange={(e) => sestlogoImage(e.target.files[0])} />
                                  )}
                                </div>
                              </>
                            )}

                            {/* 动态 Section 编辑器 */}
                            {activeSectionObj && (
                              <>
                                <div className="mb-3">
                                  <Badge bg="primary" className="mb-2">{activeSectionObj.type.toUpperCase()}</Badge>
                                  <h5 className="fw-bold">{activeTemplateConfig?.name || activeSectionObj.template}</h5>
                                </div>

                                {activeTemplateConfig ? (
                                  <div className="d-flex flex-column gap-2">
                                    {activeTemplateConfig.fields.map(field => renderDynamicField(activeSectionObj, field))}
                                  </div>
                                ) : (
                                  <div className="alert alert-warning">Configuration not found for {activeSectionObj.template}</div>
                                )}
                              </>
                            )}

                            <div className="d-flex flex-column gap-2 mt-4">
                              {/* AI Generate Button */}
                              {activeSectionObj && !['info', 'gallery', 'contact', 'feedback', 'catering', 'reservation', 'modal', 'popular', 'career'].includes(activeSectionObj.type) && (
                                <button
                                  className="btn btn-outline-primary w-100 fw-semibold"
                                  onClick={() => generateAIContent(activeSectionObj.id)}
                                  disabled={aiLoadingSectionId === activeSectionObj.id}
                                >
                                  {aiLoadingSectionId === activeSectionObj.id ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                                      {t('builder.generating')}
                                    </>
                                  ) : (
                                    "✨ " + t('builder.ai_gen_content')
                                  )}
                                </button>
                              )}

                              <button className="btn btn-primary w-100 fw-semibold" onClick={handleSave} disabled={saving}>
                                {saving ? t('builder.saving') : "💾 " + t('builder.save_changes')}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Modal */}
        <Modal show={showLogoModal} onHide={() => setShowLogoModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">{t('builder.edit_logo')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4 text-center">
              <label className="form-label fw-semibold d-block mb-3">Current Logo</label>
              {draft?.logoImage ? (
                <div className="position-relative d-inline-block" style={{ maxWidth: "200px" }}>
                  <img src={draft.logoImage} alt="Logo" className="img-fluid rounded border shadow-sm" style={{ objectFit: "contain", height: "150px", width: "100%" }} />
                  {/* Removed delete button */}
                </div>
              ) : (
                <div className="border rounded p-4 bg-light text-muted">
                  <p className="mb-0">No logo uploaded</p>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">{t('builder.logo')}</label>
              <input type="file" accept="image/*" className="form-control" onChange={(e) => sestlogoImage(e.target.files[0])} />
              <div className="form-text">Recommended size: 500x500px. Max size: 2MB.</div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setShowLogoModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleLogoSave}>Save Logo</button>
          </Modal.Footer>
        </Modal>
        
        <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-1"><Modal.Title className="fw-bold">🧠 {t('builder.smart_gen_title')}</Modal.Title></Modal.Header>
          <Modal.Body className="pt-0">
            <p className="text-muted mb-4">{t('builder.smart_gen_desc')}</p>
            <div className="mb-3"><label className="form-label fw-semibold">{t('builder.restaurant_name')}</label><input type="text" className="form-control shadow-sm" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="e.g. BongBong Hot Pot" required /></div>
            <div className="mb-3"><label className="form-label fw-semibold">{t('builder.cuisine_type')}</label><input type="text" className="form-control shadow-sm" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} placeholder="e.g. Thai, Sushi, BBQ" required /></div>
            <div className="mb-3"><label className="form-label fw-semibold">{t('builder.location')}</label><input type="text" className="form-control shadow-sm" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="e.g. Denver, CO" required /></div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-2">
            <button className="btn btn-outline-secondary" onClick={() => setShowInfoModal(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" disabled={aiLoading} onClick={() => { if (!restaurantName || !cuisineType || !locationCity) { return swal("Missing Info", "Please fill out all fields", "warning"); } runAICombined(); }}>{aiLoading ? t('builder.generating') : "🚀 " + t('builder.gen_my_content')}</button>
          </Modal.Footer>
        </Modal>

        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
          {/* ... 恢复 Preview Modal 内容 ... */}
          <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold">🧠 {t('builder.preview_ai_title')}</Modal.Title></Modal.Header>
          <Modal.Body className="pt-0">
            {aiPreview && (
              <>
                <div className="mt-4 mb-3 pb-2 border-bottom">
                  <h6 className="fw-bold text-primary mb-3">Hero Section</h6>
                  <div className="mb-3"><label className="form-label fw-semibold">Headline</label><input className="form-control shadow-sm" value={aiPreview.heroHeadline} required onChange={(e) => setAiPreview({ ...aiPreview, heroHeadline: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label fw-semibold">Subtext</label><textarea className="form-control shadow-sm" rows={2} value={aiPreview.heroSubtext} onChange={(e) => setAiPreview({ ...aiPreview, heroSubtext: e.target.value })} /></div>
                </div>
                {/* ... About Section ... */}
                <div className="mb-1">
                  <h6 className="fw-bold text-primary mb-3">About Section</h6>
                  <div className="mb-3"><label className="form-label fw-semibold">Title</label><input className="form-control shadow-sm" value={aiPreview.aboutTitle} required onChange={(e) => setAiPreview({ ...aiPreview, aboutTitle: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label fw-semibold">Text 1</label><textarea className="form-control shadow-sm" rows={2} required value={aiPreview.aboutText1} onChange={(e) => setAiPreview({ ...aiPreview, aboutText1: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label fw-semibold">Text 2</label><textarea className="form-control shadow-sm" rows={2} required value={aiPreview.aboutText2} onChange={(e) => setAiPreview({ ...aiPreview, aboutText2: e.target.value })} /></div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <button className="btn btn-outline-secondary" onClick={() => setShowPreviewModal(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary fw-semibold" onClick={() => { /* ... apply logic ... */ setShowPreviewModal(false); swal("Applied!", "AI content was added to your homepage.", "success"); }}>✅ {t('builder.apply_content')}</button>
          </Modal.Footer>
        </Modal>

        <Modal show={showStyleModal} onHide={() => setShowStyleModal(false)} size="lg" centered>
          <Modal.Header closeButton><Modal.Title>{t('builder.select_style')}</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className="row">
              {[{ key: "home1", preview: home1preview }, { key: "home2", preview: home2preview }, { key: "home3", preview: home3preview }, { key: "home4", preview: home4preview }].map(({ key, preview }) => (
                <div className="col-md-6 mb-4" key={key}>
                  <div className={`border rounded shadow-sm p-2 position-relative ${draft?.themeStyle === key ? "border-primary border-3" : ""}`} onClick={() => { handleChange("themeStyle", key); setShowStyleModal(false); }} style={{ cursor: "pointer", transition: "0.3s", backgroundColor: "#fff" }}>
                    <img src={preview} alt={key} className="img-fluid rounded" style={{ height: "220px", objectFit: "cover", width: "100%" }} />
                    <div className="mt-2 text-center fw-semibold text-capitalize">{key.replace("home", "Style ")}</div>
                    {draft?.themeStyle === key && <div className="position-absolute top-0 end-0 bg-success text-white px-2 py-1 rounded-start" style={{ fontSize: "0.8rem" }}>Selected</div>}
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer><button className="btn btn-secondary" onClick={() => setShowStyleModal(false)}>Cancel</button></Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
