import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner, Tab, Tabs, Accordion } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getPagesThunk,
  createPageThunk,
  updateSectionThunk,
  createNewPageThunk,
  deleteSectionThunk,
  reorderSectionsThunk,
  deletePageThunk,
  createSectionThunk,
  buildWebsiteThunk,
} from "../../../store/pages";
import { motion, AnimatePresence } from "framer-motion";
import { Toast, ToastContainer } from "react-bootstrap";
import swal from "sweetalert";
import Lottie from "lottie-react";
import loader from "../../../json/advancedBuilding.json";
import { getToken } from "../../../store/utlits";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  deleteImageThunk,
  getHomepageThunk,
  updateHomepageThunk,
} from "../../../store/homepagesettings";
import ThemeDropdown from "./ThemeColor";
import RestyleModal from "./RestyleModal";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import { colorThemes, fontOptions } from "./ThemeColor";
import { useNavigate } from "react-router-dom";
import { getInstagramThunk } from "../../../store/instagram";
import SocialMediaLinksModal from "./SocialMediaLinkModal";
import HeaderTranslationToggle from "./HeaderTranslationToggle";
import HeaderMenuToggle from "./HeaderMenuToggle";
import HeaderStyleModal from "./HeaderStyleModal"; // Import the new modal
import TemplateSelectModal from "./TemplateSelectModal"; // 导入新创建的模板选择弹窗
import StyleEditorModal from "./StyleEditorModal"; // 导入样式编辑弹窗
import GallerySelectionModal from "./GallerySelectionModal"; // 导入图库选择弹窗
import { SECTION_TEMPLATES } from "./editorConfig"; // 导入配置以获取模板名称

function mapPageSectionsFromApi(sections) {
  const rows = (sections || []).map((s) => ({
    id: s.id,
    type: s.type,
    template: s.template,
    order_index: s.order_index,
    content: s.SectionContent?.content_json || {},
    style_json: s.style_json || {},
  }));
  return rows.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

const RESERVED_SLUGS = ["order", "menu", "checkout"];
const CONTENT_SECTION_TYPES = [
  "hero",
  "about",
  "gallery",
  "info",
  "mission",
  "intro",
  "instagram",
  "popular",
  "testimonials", // 🟢 新增
  "promotion",
];
const FORM_SECTION_TYPES = ["reservation", "feedback", "contact", "catering", "career"];
const POP_OUT_SECTION_TYPES = ["modal"];

const homepageContent = {
  hero: {
    title: "Welcome to Our Restaurant",
    subtitle:
      "Experience authentic flavors, warm hospitality, and memorable dining in every bite.",
    image_url: "",
    video_url: ""
  },
  about: {
    title: "Our Story",
    description: `Founded with a passion for authentic flavors and a love for community, our restaurant brings together traditional recipes and modern hospitality. Whether you're here for a quick lunch or a special gathering, we’re dedicated to making every visit memorable.`,
    image_url: "",
  },
  gallery: {
    title: "A Glimpse Into Our Restaurant",
    image_url1: "",
    image_url2: "",
    image_url3: "",
    image_url4: "",
    image_url5: "",
    image_url6: "",
  },
  info: {
    title: "Visit Us",
    address:
      "Please Enter by street, city, state, zip in order for map to show up correctly. ",
    phone: "(303) 123-4567",
    email: "contact@ourrestaurant.com",
    Monday: '10:00 AM - 9:00 PM',
    Tuesday: '10:00 AM - 9:00 PM',
    Wednesday: '10:00 AM - 1:00PM & 4:00 PM - 9:00 PM',
    Thursday: '10:00 AM - 9:00 PM',
    Friday: '10:00 AM - 9:00 PM',
    Saturday: '10:00 AM - 9:00 PM',
    Sunday: 'CLOSED',
  },
  intro: {
    title: "Who We Are",
    description: `We’re more than just a restaurant — we’re a story of tradition, passion, and community. From humble beginnings to a beloved local destination, our journey has always been rooted in authenticity.`,
    image_url: "",
  },
  mission: {
    title: "Our Mission",
    description: `To serve our guests with heart, soul, and flavor — preserving timeless recipes while embracing modern hospitality.`,
  },
  catering: {
    title: "Catering Request",
    subtitle:
      "Let us help you cater your next event. Tell us about your plans below.",
    email: "",
  },
  contact: {
    title: "Contact Us",
    subtitle: "Have questions or comments? Reach out to us.",
    email: "",
  },
  reservation: {
    title: "Reserve a Table",
    subtitle:
      "Book your table in advance and let us know any special requests.",
    email: "",
  },
  feedback: {
    title: "We’d Love Your Feedback",
    subtitle: "Tell us about your experience. Your input helps us grow!",
    email: "",
  },
  modal: {
    title: "Important Notice",
    subtitle: "Alert We are closed next tuesday!",
    image_url: "",
  },
  instagram: {
    title: "Important Notice",
    subtitle: "Alert We are closed next tuesday!",
    image_url: "",
  },
  popular: {

  },
  // 🟢 新增 Testimonials 默认内容
  testimonials: {
    title: "What Our Guests Say",
    subtitle: "Read reviews from our happy customers.",
    review1: "Amazing food and service!",
    author1: "John Doe",
    review2: "Best dining experience ever.",
    author2: "Jane Smith",
    review3: "Highly recommended!",
    author3: "Mike Johnson"
  },
  career: {
    title: "Join Our Team",
    subtitle: "We are always looking for passionate individuals to join our kitchen and service teams.",
    email: "",
  },
  promotion: {
    title: "Special Offers",
    subtitle: "Check out our latest promotions and discounts.",
    coupons: [
      { title: "Free Egg Roll", condition: "for ordering over $35", description: "Free Egg Roll for ordering over $35 on orders greater than $35.00" },
      { title: "Free Spring Roll", condition: "for ordering over $35", description: "Free Spring Roll for ordering over $35 on orders greater than $35.00" },
      { title: "Free Fried Donut", condition: "for ordering over $40", description: "Free Fried Donut for ordering over $40 on orders greater than $40.00" },
      { title: "Free Cheese Wonton", condition: "for ordering over $45", description: "Free Cheese Wonton for ordering over $45 on orders greater than $45.00" },
      { title: "Free Chicken Fried Rice", condition: "for ordering over $50", description: "Free Chicken Fried Rice for ordering over $50 on orders greater than $50.00" }
    ]
  }
};

const defaultContentMap = {
  home: {
    hero: homepageContent.hero,
    about: homepageContent.about,
    gallery: homepageContent.gallery,
    info: homepageContent.info,
    intro: homepageContent.intro,
    mission: homepageContent.mission,
    feedback: homepageContent.feedback,
    reservation: homepageContent.reservation,
    contact: homepageContent.contact,
    catering: homepageContent.catering,
    modal: homepageContent.modal,
    instagram: homepageContent.instagram,
    popular: homepageContent.popular,
    testimonials: homepageContent.testimonials,
    career: homepageContent.career,
    promotion: homepageContent.promotion
  },
};
const SECTION_PREVIEWS = {
  hero: {
    label: "Banner",
    image: "/thumbnails/hero.png",
  },
  about: {
    label: "About",
    image: "/thumbnails/about.png",
  },
  gallery: {
    label: "Gallery",
    image: "/thumbnails/gallery.png",
  },
  mission: {
    label: "Mission",
    image: "/thumbnails/mission.png",
  },
  info: {
    label: "Contact",
    image: "/thumbnails/info.png",
  },
  intro: {
    label: "Intro",
    image: "/thumbnails/newabout.png",
  },
  reservation: {
    label: "Reservation Form",
    image: "/thumbnails/form.png",
  },
  catering: {
    label: "Catering Form",
    image: "/thumbnails/form.png",
  },
  feedback: {
    label: "Feedabck Form",
    image: "/thumbnails/form.png",
  },
  contact: {
    label: "Contact Form",
    image: "/thumbnails/form.png",
  },
  modal: {
    label: "POP-OUTS",
    image: "/thumbnails/form.png",
  },
  instagram: {
    label: "Instagram",
    image: "/thumbnails/gallery.png",
  },
  popular: {
    label: "(AI)Popular Items",
    image: "/thumbnails/gallery.png"
  },
  // 🟢 新增预览图配置
  testimonials: {
    label: "Testimonials",
    image: "/thumbnails/testimonials.png" // 确保有这张图，或者用 gallery.png 暂代
  },
  career: {
    label: "Career Form",
    image: "/thumbnails/career/career-1.png"
  },
  promotion: {
    label: "Promotion",
    image: "/thumbnails/promotion/promotion-1.png"
  }
};
const LOADING_MESSAGES = [
  "🧠 Analyzing your brand...",
  "🎨 Matching with the best design...",
  "✍️ Writing your brand story with AI...",
  "🔧 Assembling your new website...",
  "🚀 Finalizing... Almost there!",
];

export const themeGroups = [
  {
    themeName: "Basic Modern",
    colorThemes: [
      "Pure Noir",
      "Smokehouse Blue",
      "Charcoal & Gold",
      "Monochrome Mist",
      "Ashen Blue",
    ],
    fontOptions: ["Inter", "Poppins", "Work Sans", "Manrope"],
  },
  // {
  //   themeName: "SpotHopper View",
  //   colorThemes: [
  //     "Charcoal & Gold",
  //     "Plum Wine",
  //     "Avocado Toast",
  //     "Crimson Jade",
  //     "Golden Bamboo",
  //   ],
  //   fontOptions: ["Mukta", "Cinzel", "Zen Old Mincho", "Noto Sans TC"],
  // },
  {
    themeName: "Professional Theme",
    colorThemes: [
      "Charcoal & Gold",
      "Plum Wine",
      "Midnight Copper",
      "Champagne Gold",
      "Silver Pearl",
    ],
    fontOptions: [
      "Playfair Display",
      "Lora",
      "Cormorant Garamond",
      "Della Respira",
    ],
  },
];

const themeOptions = themeGroups.map((t) => t.themeName);
export default function AdvancedEditor({
  show,
  onClose,
  restaurantId,
  restaurantName,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pages } = useSelector((state) => state.pages);
  const [restyling, setRestyling] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // default is empty
  const [viewMode, setViewMode] = useState("preview"); //editor or preview
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: restaurantName,
    cuisine: "",
    location: "",
    websiteType: "",
    logo: null,
    restaurantImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [localSections, setLocalSections] = useState({});
  const [editMode, setEditMode] = useState({});
  const [previewSize, setPreviewSize] = useState("desktop"); // 'desktop' or 'mobile'
  const [showAddSelector, setShowAddSelector] = useState(false);
  const modalBodyRef = useRef(null);
  const sectionRefs = useRef({});
  const [addingSection, setAddingSection] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const pageNames = pages.map((p) => p.name);
  const [showAddPageInput, setShowAddPageInput] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [pageError, setPageError] = useState("");
  // --- Page Reordering States ---
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [tempPages, setTempPages] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [aiLoadingSectionId, setAiLoadingSectionId] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingSectionType, setPendingSectionType] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [uploadingImageSectionId, setUploadingImageSectionId] = useState(null);
  const [showMissingAIModal, setShowMissingAIModal] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [restyleModal, setRestyleModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themeOptions[0]);
  const [firstTimeReDesignTheme, setFirstTimeRedesignTheme] = useState(
    themeOptions[0],
  );
  const homepagesetting = useSelector((state) => state.homepage.homepage);
  const [restylingSite, setRestylingSite] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const account = useSelector((state) => state.instagram.account);
  const plan = useSelector((state) => state.session.userPlan);
  const [mainFrameKey, setMainFrameKey] = useState(0);
  const [aiform, setaiForm] = useState({
    ai_name: "",
    cuisine: "",
    ai_location: "",
  });
  const [showHeaderModal, setShowHeaderModal] = useState(false);

  // --- 新增状态 ---
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeSectionForTemplateChange, setActiveSectionForTemplateChange] = useState(null);
  const [templateModalPageHistory, setTemplateModalPageHistory] = useState({}); // { sectionId: pageNumber }
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [activeSectionForStyle, setActiveSectionForStyle] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState(null);
  // ----------------

  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? `https://${plan?.domain}.ownmenu.com` : 'http://localhost:3001';


  const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);
  const socialLinks = {
    instagram: homepagesetting?.ig_link || "",
    facebook: homepagesetting?.fb_link || "",
    google: homepagesetting?.g_link || "",
    tiktok: homepagesetting?.tiktok_link || "",
  };
  const handleOpenSocialModal = () => setShowSocialLinksModal(true);
  const handleCloseSocialModal = () => setShowSocialLinksModal(false);

  const handleSaveSocialLinks = async (newLinks) => {
    try {
      const response = await fetch("/api/pages/update-social-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ig_link: newLinks.instagram,
          fb_link: newLinks.facebook,
          g_link: newLinks.google,
          tiktok_link: newLinks.tiktok,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Update failed:", result.error || result);
        alert("Failed to update social links.");
        return;
      }
      setToastMessage(`Updated Social Media Links Successfuly Refresh your site to see updates`);
      setShowToast(true);

      setShowSocialLinksModal(false);

      dispatch(getHomepageThunk(restaurantId))


    } catch (err) {
      console.error("Error saving social links:", err);
      alert("An error occurred while saving social links.");
    }
  };



  const [usedTemplates, setUsedTemplates] = useState({
    hero: new Set(),
    about: new Set(),
    gallery: new Set(),
    info: new Set(),
    intro: new Set(),
    mission: new Set(),
    catering: new Set(),
    contact: new Set(),
    reservation: new Set(),
    feedback: new Set(),
    modal: new Set(),
    testimonials: new Set(),
    career: new Set(),
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = modalBodyRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowScrollTop(el.scrollTop > 300);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [modalBodyRef]);

  useEffect(() => {
    if (loading) {
      let i = 0;
      const interval = setInterval(() => {
        setLoadingStep((prev) => prev + 1);
        i++;
        if (i >= LOADING_MESSAGES.length) clearInterval(interval);
      }, 4000); // evenly split: 5 steps x 3s = 15s
    }
  }, [loading]);
  useEffect(() => {
    if (show) dispatch(getPagesThunk());
  }, [dispatch, show]);

  useEffect(() => {
    if (pages.length > 0) {
      setStep(2);
      const mapped = {};
      const editing = {};
      pages.forEach((p) => {
        const sections = Array.isArray(p.Sections) ? p.Sections : []; // fallback
        mapped[p.name] = mapPageSectionsFromApi(sections);
        editing[p.name] = {};
      });
      setLocalSections(mapped);
      setEditMode(editing);
    }
  }, [pages]);
  function generateFinalTheme(themeGroup, colorThemes, fontOptions) {
    // Filter the actual color theme objects by name

    const matchedColors = colorThemes.filter((ct) =>
      themeGroup.colorThemes.includes(ct.name),
    );

    // Randomly select one
    const selectedColor =
      matchedColors[Math.floor(Math.random() * matchedColors.length)];
    // Filter actual font objects
    const matchedFonts = fontOptions.filter((ft) =>
      themeGroup.fontOptions.includes(ft.name),
    );

    const selectedFont =
      matchedFonts[Math.floor(Math.random() * matchedFonts.length)];

    return {
      primary: selectedColor.primaryColor,
      secondary: selectedColor.secondaryColor,
      text: selectedColor.textColor,
      name: selectedFont.name,
    };
  }

  const templatePool = {
    hero: Array.from({ length: 84 }, (_, i) => `hero-${i + 1}`),
    about: Array.from({ length: 45 }, (_, i) => `about-${i + 1}`),
    gallery: Array.from({ length: 60 }, (_, i) => `gallery-${i + 1}`),
    info: Array.from({ length: 19 }, (_, i) => `info-${i + 1}`),
    intro: Array.from({ length: 5 }, (_, i) => `intro-${i + 1}`),
    mission: Array.from({ length: 5 }, (_, i) => `mission-${i + 1}`),
    feedback: Array.from({ length: 5 }, (_, i) => `feedback-${i + 1}`),
    reservation: Array.from({ length: 15 }, (_, i) => `reservation-${i + 1}`),
    contact: Array.from({ length: 8 }, (_, i) => `contact-${i + 1}`),
    catering: Array.from({ length: 5 }, (_, i) => `catering-${i + 1}`),
    modal: Array.from({ length: 10 }, (_, i) => `modal-${i + 1}`),
    instagram: Array.from({ length: 1 }, (_, i) => `instagram-1`),
    popular: Array.from({ length: 1 }, (_, i) => `popular-1`),
    testimonials: Array.from({ length: 7 }, (_, i) => `testimonials-${i + 1}`),
    career: Array.from({ length: 3 }, (_, i) => `career-${i + 1}`),
    promotion: Array.from({ length: 1 }, (_, i) => `promotion-${i + 1}`),
  };

  const restyleSingleSection = async (page, sectionId) => {
    try {
      setIframeLoaded(false);
      setUploadingImageSectionId(sectionId);

      const section = localSections[page].find((s) => s.id === sectionId);
      if (!section) throw new Error("Section not found");

      const newTemplate = getNextTemplate(section.type);

      // 1. 先调用 API 保存
      await dispatch(
        updateSectionThunk(section.id, {
          template: newTemplate,
          content_json: section.content,
        }),
      );

      // 2. 重新获取完整数据 (这会自动更新 localSections)
      await dispatch(getPagesThunk());

      // 3. 强制刷新 Iframe
      setIframeKey(prev => prev + 1);

      setTimeout(() => {
        setUploadingImageSectionId(null);
        setToastMessage(`Section "${section.type}" restyled successfully!`);
        setShowToast(true);
      }, 1000);
    } catch (error) {
      console.error("Error restyling section:", error);
      setUploadingImageSectionId(null);
      setToastMessage(`❌ Failed to restyle section: ${error.message}`);
      setShowToast(true);
    }
  };

  // --- 新增函数：处理手动更换模板 ---
  const handleChangeTemplate = async (newTemplateKey) => {
    if (!activeSectionForTemplateChange) return;

    const { page, sectionId, type: oldType } = activeSectionForTemplateChange;
    const newType = newTemplateKey.split('-')[0];

    try {
      setIframeLoaded(false);
      setUploadingImageSectionId(sectionId);
      setShowTemplateModal(false);

      const updatePayload = { template: newTemplateKey };
      
      // 如果类型发生改变，需要更新 type 并重置为该类型的默认内容
      if (newType !== oldType) {
        updatePayload.type = newType;
        updatePayload.content_json = defaultContentMap?.home?.[newType] || {};
      }

      // 1. 先调用 API 保存
      await dispatch(updateSectionThunk(sectionId, updatePayload));

      // 2. 重新获取完整数据
      await dispatch(getPagesThunk());

      // 3. 强制刷新 Iframe
      setIframeKey(prev => prev + 1);

      setTimeout(() => {
        setUploadingImageSectionId(null);
        setToastMessage(`Template changed to ${newTemplateKey}${newType !== oldType ? ' (Category updated)' : ''}`);
        setShowToast(true);
      }, 1000);

    } catch (error) {
      console.error("Error changing template:", error);
      setUploadingImageSectionId(null);
      setToastMessage(`❌ Failed to change template: ${error.message}`);
      setShowToast(true);
    } finally {
      setActiveSectionForTemplateChange(null);
    }
  };

  const handleSaveStyles = async (newStyles) => {
    if (!activeSectionForStyle) return;

    const { page, sectionId } = activeSectionForStyle;

    try {
      setIframeLoaded(false);
      setUploadingImageSectionId(sectionId);
      setShowStyleModal(false);

      // 1. API update
      await dispatch(updateSectionThunk(sectionId, {
        style_json: newStyles
      }));

      // 2. Refresh data
      await dispatch(getPagesThunk());

      // 3. Force iframe refresh
      setIframeKey(prev => prev + 1);

      setTimeout(() => {
        setUploadingImageSectionId(null);
        setToastMessage(`Styles updated successfully!`);
        setShowToast(true);
      }, 1000);

    } catch (error) {
      console.error("Error updating styles:", error);
      setUploadingImageSectionId(null);
      setToastMessage(`❌ Failed to update styles: ${error.message}`);
      setShowToast(true);
    } finally {
      setActiveSectionForStyle(null);
    }
  };
  // ------------------------------------

  const getNextTemplate = (type) => {
    const pool = templatePool[type];
    const used = new Set(usedTemplates[type]);
    const unused = pool.filter((t) => !used.has(t));
    let chosen;

    if (unused.length === 0) {
      used.clear();
      chosen = pool[Math.floor(Math.random() * pool.length)];
    } else {
      chosen = unused[Math.floor(Math.random() * unused.length)];
    }

    used.add(chosen);
    setUsedTemplates((prev) => ({ ...prev, [type]: used }));
    return chosen;
  };

  const handleAddNewSection = async (type) => {
    setAddingSection(true);

    if (type === "instagram") {
      await dispatch(getInstagramThunk());

      if (!account) {
        navigate("/automated-instagram");
      }
    }

    const existingTemplates =
      localSections[activePage]
        ?.filter((s) => s.type === type)
        .map((s) => parseInt(s.template.split("-")[1])) || [];

    const pool = templatePool[type] || [];
    const totalTemplates = pool.length;
    const allTemplates = Array.from(
      { length: totalTemplates },
      (_, i) => i + 1,
    );
    const availableTemplates = allTemplates.filter(
      (num) => !existingTemplates.includes(num),
    );

    const templateNumber =
      availableTemplates.length > 0
        ? availableTemplates[
        Math.floor(Math.random() * availableTemplates.length)
        ]
        : Math.ceil(Math.random() * totalTemplates);

    const template = `${type}-${templateNumber}`;
    const defaultContent = defaultContentMap?.home?.[type] ?? {};

    if (type === "modal") {
      const hasModal = localSections[activePage]?.some(
        (s) => s.type === "modal",
      );
      if (hasModal) {
        setAddingSection(false);
        swal({
          title: "Limit Reached",
          text: "Only one pop-out modal is allowed per page for performance reasons. Delete the other one first.",
          icon: "warning",
          buttons: false,
          timer: 5000,
        });
        return;
      }
    }

    const formTypes = ["reservation", "feedback", "contact", "catering"];

    if (formTypes.includes(type)) {
      setPendingSectionType(type);
      setEmailInput("");
      setShowEmailModal(true);
      setAddingSection(false); // wait for email before creating
      return;
    }

    const currentSections = localSections[activePage] || [];

    const maxOrderIndex = currentSections.reduce(
      (max, section) => Math.max(max, section.order_index ?? 0),
      -1,
    );

    const newOrderIndex = maxOrderIndex + 1;

    const response = await dispatch(
      createSectionThunk({
        page: activePage,
        type,
        template,
        order_index: newOrderIndex,
        content_json: defaultContent,
      }),
    );

    if (!response) {
      setToastMessage("Max of 10 sections reached for this page.");
      setShowToast(true);
      setAddingSection(false); // lock

      return;
    }

    await dispatch(getPagesThunk());

    // 🔥 Rehydrate localSections manually
    const newPages = await dispatch(getPagesThunk());
    const mapped = {};
    const editing = {};

    newPages.forEach((p) => {
      mapped[p.name] = mapPageSectionsFromApi(p.Sections);
      editing[p.name] = {};
    });

    setLocalSections(mapped);
    setEditMode(editing);
    setShowAddSelector(false);
    setAddingSection(false); // lock
  };

  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setAddingSection(true);
    setShowEmailModal(false);

    try {
      const existingTemplates =
        localSections[activePage]
          ?.filter((s) => s.type === pendingSectionType)
          .map((s) => parseInt(s.template.split("-")[1])) || [];

      const pool = templatePool[pendingSectionType] || [];
      const totalTemplates = pool.length;
      const allTemplates = Array.from(
        { length: totalTemplates },
        (_, i) => i + 1,
      );
      const availableTemplates = allTemplates.filter(
        (num) => !existingTemplates.includes(num),
      );

      const templateNumber =
        availableTemplates.length > 0
          ? availableTemplates[
          Math.floor(Math.random() * availableTemplates.length)
          ]
          : Math.ceil(Math.random() * totalTemplates);

      const template = `${pendingSectionType}-${templateNumber}`;
      const defaultContent = { ...(defaultContentMap?.home?.[pendingSectionType] || {}) };
      defaultContent.email = emailInput;

      const currentSections = localSections[activePage] || [];
      const maxOrderIndex = currentSections.reduce(
        (max, section) => Math.max(max, section.order_index ?? 0),
        -1,
      );
      const newOrderIndex = maxOrderIndex + 1;

      const response = await dispatch(
        createSectionThunk({
          page: activePage,
          type: pendingSectionType,
          template,
          order_index: newOrderIndex,
          content_json: defaultContent,
        }),
      );

      if (!response) {
        setToastMessage("Max of 10 sections reached for this page.");
        setShowToast(true);
        setAddingSection(false); // lock
        return;
      }

      await dispatch(getPagesThunk());

    } catch (err) {
      console.error("Error creating section with email", err);
    } finally {
      setAddingSection(false);
      setPendingSectionType(null);
      setEmailInput("");
    }
  };

  const restyleSections = async (page) => {
    setRestyling(true);
    try {
      const updatedSections = localSections[page].map((section) => {
        const newTemplate = getNextTemplate(section.type);

        return { ...section, template: newTemplate, version: Date.now() };
      });

      const sorted = [...updatedSections].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
      );
      setLocalSections((prev) => ({ ...prev, [page]: sorted }));

      await Promise.all(
        sorted.map((section) =>
          dispatch(
            updateSectionThunk(section.id, {
              template: section.template,
              content_json: section.content,
            }),
          ),
        ),
      );
    } catch (err) {
      console.error("Failed to restyle:", err);
    } finally {
      setTimeout(() => {
        setRestyling(false);
        setToastMessage(`Page "${page}" restyled successfully!`);
        setShowToast(true);
      }, [3000]);
    }
  };
  const getLayoutIdFromThemeName = (themeName) => {
    switch (themeName) {
      case "Basic Modern":
        return 1;
      case "SpotHopper View":
        return 2;
      case "Professional Theme":
        return 3;
      default:
        return 1; // fallback layout
    }
  };
  const restyleEntireSite = async () => {
    setRestyleModal(false);
    setRestylingSite(true);

    const token = getToken();
    const layoutId = getLayoutIdFromThemeName(selectedTheme);

    try {
      // Call the new restyle route using selectedTheme as layoutId (1, 2, or 3)
      await fetch(`/api/pages/restyle/site/${layoutId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Optionally, reload pages or trigger state refresh
      await dispatch(getPagesThunk());

      setViewMode("preview");
    } catch (err) {
      console.error("Failed to restyle entire site:", err);
      setToastMessage("❌ Failed to restyle entire site.");
      setShowToast(true);
    } finally {
      setTimeout(() => {
        setRestylingSite(false);
        setMainFrameKey((prev) => prev + 1);
        setShowToast(true);
        setToastMessage("🎨 Entire site restyled successfully!");
      }, 5000);
    }
  };


  const handleFileChange = (e) => {
    setForm({ ...form, logo: e.target.files[0] });
  };

  const handleRestaurantImageChange = (e) => {
    setForm({ ...form, restaurantImage: e.target.files[0] });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("restaurantId", restaurantId);
      formData.append("name", form.name);
      formData.append("cuisine", form.cuisine);
      formData.append("location", form.location);
      formData.append("websiteType", form.websiteType);

      if (form.logo) {
        formData.append("logo", form.logo);
      }

      if (form.restaurantImage) {
        formData.append("restaurantImage", form.restaurantImage);
      }

      await dispatch(buildWebsiteThunk(formData));

      await dispatch(getHomepageThunk(restaurantId));

      setStep(2);
    } catch (err) {
      console.error("Failed to build website:", err);
      swal("Error", `Failed to build website: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = (page, sectionId, key, value) => {
    const updatedPageSections = [...(localSections[page] || [])].map((sec) =>
      sec.id === sectionId
        ? { ...sec, content: { ...sec.content, [key]: value } }
        : sec,
    );
    setLocalSections({ ...localSections, [page]: updatedPageSections });
  };

  const handleSaveSection = async (page, sectionId) => {
    try {
      setSavingSection(true); // Start spinner

      const section = localSections[page].find((s) => s.id === sectionId);
      if (!section) throw new Error("Section not found");

      await dispatch(
        updateSectionThunk(section.id, {
          template: section.template,
          content_json: section.content,
        }),
      );
      await dispatch(getPagesThunk());
      setIframeLoaded(false);
      setIframeKey((prev) => prev + 1);
      setMainFrameKey((prev) => prev + 1);

      setEditMode((prev) => ({
        ...prev,
        [page]: { ...prev[page], [sectionId]: false },
      }));

      setToastMessage("Section updated successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("handleSaveSection error:", error);
      setToastMessage(`Error saving section: ${error.message || error}`);
      setShowToast(true);
    } finally {
      setSavingSection(false); // Ensure spinner is hidden
    }
  };

  const toggleEdit = (page, sectionId) => {
    setEditMode({
      ...editMode,
      [page]: { ...editMode[page], [sectionId]: !editMode[page][sectionId] },
    });
  };

  const moveSection = async (page, index, direction) => {
    try {
      setSavingSection(true); // Show spinner

      const current = [...localSections[page]];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= current.length) {
        return;
      }

      const movedSectionId = current[index].id;

      // Swap
      [current[index], current[newIndex]] = [current[newIndex], current[index]];

      const swapped = current.map((sec, idx) => ({
        ...sec,
        order_index: idx,
      }));
      setLocalSections({ ...localSections, [page]: swapped });

      const orderPayload = swapped.map((s) => ({
        id: s.id,
        order_index: s.order_index,
      }));
      await dispatch(reorderSectionsThunk(orderPayload));

      // Scroll to moved section
      const scrollIndex = swapped.findIndex((s) => s.id === movedSectionId);
      const movedSection = scrollIndex >= 0 ? swapped[scrollIndex] : swapped[newIndex];
      const element = sectionRefs.current[movedSection.id];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100); // slight delay to ensure DOM re-render
      }

      setToastMessage("Moved Section");
      setShowToast(true);
    } catch (error) {
      console.error("Error moving section:", error);
      setToastMessage("An error occurred while moving the section.");
      setShowToast(true);
    } finally {
      setSavingSection(false); // Always hide spinner
    }
  };

  const handleDeleteSection = async (page, sectionId) => {
    try {
      swal({
        title: "Are you sure?",
        text: "This section will be permanently deleted.",
        icon: "warning",
        buttons: ["Cancel", "Delete"],
        dangerMode: true,
      })
        .then(async (willDelete) => {
          if (willDelete) {
            setSavingSection(true); // Show the spinner
            await dispatch(deleteSectionThunk(sectionId));
            await dispatch(getPagesThunk());
            setToastMessage("Section deleted successfully!");
            setShowToast(true);
          }
        })
        .finally(() => {
          setSavingSection(false); // Hide the spinner no matter what
        });
    } catch (error) {
      console.error("Error deleting section:", error);
      setToastMessage("An error occurred while deleting the section.");
      setShowToast(true);
      setSavingSection(false);
    }
  };

  const handleAddSectionClick = () => {
    setShowAddSelector(true);
    setTimeout(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTo({
          top: modalBodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleDeletePage = async (page) => {
    try {
      setSavingSection(true);

      if (page.toLowerCase() === "home") {
        swal("Action Blocked", "The Home page cannot be deleted.", "error");
        setSavingSection(false);
        return;
      }

      const willDelete = await swal({
        title: `Delete ${page} page?`,
        text: `This will permanently remove the "${page}" page and all of its sections.`,
        icon: "warning",
        buttons: ["Cancel", "Delete"],
        dangerMode: true,
      });

      if (willDelete) {
        await dispatch(deletePageThunk(page));
        const updatedPages = await dispatch(getPagesThunk());
        const validPage = updatedPages.find((p) => p.name !== page);
        setActivePage(validPage?.name || "home");
        setToastMessage(`Page "${page}" deleted successfully.`);
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      setToastMessage("Something went wrong. Please try again.");
      setShowToast(true);
    } finally {
      setSavingSection(false);
    }
  };

  const generateAIContent = async (page, sectionId) => {
    const section = localSections[page].find((s) => s.id === sectionId);
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
          currentContent: section.content,
        }),
      });

      if (!res.ok) {
        const error = await res.json();

        if (error.message === "Missing restaurant AI fields") {
          // ⛔ AI content generation failed because restaurant info is missing
          setShowMissingAIModal(true); // 👈 Show modal to collect missing ai_name, cuisine, location
          return;
        }

        throw new Error(error.message || "Failed to generate AI content");
      }

      const data = await res.json();

      const updatedPageSections = localSections[page].map((sec) =>
        sec.id === sectionId ? { ...sec, content: data.content } : sec,
      );

      setLocalSections({
        ...localSections,
        [page]: updatedPageSections,
      });
      setToastMessage(`✨ AI content generated for "${section.type}"`);
    } catch (err) {
      console.error(err);
      setToastMessage("⚠️ Error generating AI content");
    } finally {
      setAiLoadingSectionId(null);
      setShowToast(true);
    }
  };

  const handleImageUpload = async (sectionId, key, file) => {
    setUploadingImageSectionId(sectionId);

    const formData = new FormData();
    formData.append("images", file);
    formData.append("key", key);

    const token = getToken();
    const response = await fetch(`/api/pages/sections/${sectionId}/image`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      await dispatch(getPagesThunk());
      setEditMode((prev) => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          [sectionId]: true,
        },
      }));
      setToastMessage("🖼️ Image uploaded successfully");
    } else {
      setToastMessage("❌ Failed to upload image");
    }

    setShowToast(true);
    setUploadingImageSectionId(null);
  };

  //check if video is with 30 seocnds
  const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => reject("Failed to load video metadata");
      video.src = URL.createObjectURL(file);
    });
  };
  const handleVideoUpload = async (sectionId, key, file) => {
    setUploadingImageSectionId(sectionId);

    try {
      const duration = await checkVideoDuration(file);
      if (duration > 30) {
        setToastMessage("⚠️ Please upload a video under 30 seconds.");
        setShowToast(true);
        setUploadingImageSectionId(null);
        return;
      }
    } catch (err) {
      console.error("Video metadata check failed:", err);
      setToastMessage("❌ Unable to verify video duration");
      setShowToast(true);
      setUploadingImageSectionId(null);
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("key", key);

    const token = getToken();
    const response = await fetch(`/api/pages/sections/${sectionId}/video`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      await dispatch(getPagesThunk());
      setEditMode((prev) => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          [sectionId]: true,
        },
      }));
      setToastMessage("🎥 Video uploaded successfully");
    } else {
      setToastMessage("❌ Failed to upload video");
    }

    setShowToast(true);
    setUploadingImageSectionId(null);
  };


  const handleDeleteImage = async (sectionId, key, imageUrl) => {
    setUploadingImageSectionId(sectionId);

    const token = getToken();
    const res = await fetch(`/api/pages/sections/${sectionId}/delete-image`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key, imageUrl }),
    });

    if (res.ok) {
      await dispatch(getPagesThunk());
      setEditMode((prev) => ({
        ...prev,
        [activePage]: {
          ...prev[activePage],
          [sectionId]: true,
        },
      }));
      setToastMessage("🗑️ Image deleted successfully");
    } else {
      setToastMessage("❌ Failed to delete image");
    }

    setShowToast(true);
    setUploadingImageSectionId(null);
  };

  // --- Page Reordering Handlers ---
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...tempPages];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(null);
    setTempPages(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...tempPages];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setTempPages(updated);
  };

  const handleMoveDown = (index) => {
    if (index === tempPages.length - 1) return;
    const updated = [...tempPages];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setTempPages(updated);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const token = getToken();
      const pageIds = tempPages.map((p) => p.id);
      const response = await fetch("/api/pages/reorder-pages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to save page order");
      }

      await dispatch(getPagesThunk());
      setShowToast(true);
      setToastMessage("Pages reordered successfully");
      setShowReorderModal(false);
    } catch (error) {
      console.error("Error saving page order:", error);
    } finally {
      setSavingOrder(false);
    }
  };

  const saveAIInfoAndRetry = async ({ ai_name, cuisine, ai_location }) => {
    const token = getToken();

    try {
      await fetch("/api/restaurants/ai-info", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ai_name, cuisine, ai_location }),
      });

      setShowMissingAIModal(false);

      // Friendly toast after saving
      setToastMessage("✅ AI has memorized your info!");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to save AI info:", err);
      setToastMessage(
        "❌ Something went wrong while saving. Please try again.",
      );
      setShowToast(true);
    }
  };

  const handleThemeSelect = async (theme) => {
    setRestyling(true);
    const token = getToken();
    const payload = {
      colors: {
        primary: theme.primaryColor,
        secondary: theme.secondaryColor,
        text: theme.textColor,
      },
    };

    try {
      const res = await fetch(
        `/api/homepage-settings/update-themecolor/${restaurantId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        dispatch(getHomepageThunk(restaurantId));
        setIframeKey((prev) => prev + 1); // ✅ force iframe refresh
        setRestyling(false);
        setToastMessage("✅ Theme color updated");
        setShowToast(true);
      } else {
        console.error("Failed to update theme:", await res.text());
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };
  const handFontStyleSelect = async (font) => {
    setRestyling(true);
    const token = getToken();
    try {
      const res = await fetch(
        `/api/homepage-settings/update-fontstyle/${restaurantId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fontStyle: font.name }),
        },
      );

      if (res.ok) {
        dispatch(getHomepageThunk(restaurantId));
        setIframeKey((prev) => prev + 1); // ✅ force iframe refresh
        setRestyling(false);
        setToastMessage("✅ Font Style updated");
        setShowToast(true);
      } else {
        console.error("Failed to update font style:", await res.text());
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };
  const handleColorLayoutSelect = async () => {
    setRestyling(true);
    const token = getToken();
    try {
      const res = await fetch(
        `/api/homepage-settings/toggle-layout-style/${restaurantId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        setViewMode("preview");
        dispatch(getHomepageThunk(restaurantId));
        setMainFrameKey((pre) => pre + 1);
        setToastMessage("✅Mix & Match enabled");
        setShowToast(true);
        setRestyling(false);
      } else {
        console.error("Failed to set mix & match:", await res.text());
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const handleHeaderChange = async (headerId) => {
    const token = getToken();
    try {
      const res = await fetch('/api/pages/header', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ headerId }),
      });

      if (res.ok) {
        await dispatch(getPagesThunk()); // ✅ Sync local state with server
        setToastMessage('Header style updated successfully!');
        setShowToast(true);
        setMainFrameKey(prev => prev + 1); // Refresh iframe
      } else {
        throw new Error('Failed to update header style');
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ Error updating header.');
      setShowToast(true);
    }
  };

  // Custom styles for AI look
  const aiStyles = {
    container: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      minHeight: "80vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "16px",
      padding: "2rem",
      color: "#fff",
    },
    card: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "24px",
      padding: "3rem",
      width: "100%",
      maxWidth: "600px",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    },
    input: {
      background: "rgba(255, 255, 255, 0.1)",
      border: "none",
      borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      color: "#fff",
      padding: "12px",
      transition: "all 0.3s ease",
    },
    label: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.9rem",
      marginBottom: "8px",
      fontWeight: "500",
    },
    button: {
      background: "linear-gradient(90deg, #ff00cc 0%, #333399 100%)",
      border: "none",
      padding: "12px 32px",
      borderRadius: "50px",
      fontWeight: "bold",
      letterSpacing: "1px",
      boxShadow: "0 0 20px rgba(255, 0, 204, 0.5)",
      transition: "transform 0.2s ease",
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      fullscreen
      animation={false}
    >
      <HeaderStyleModal
        show={showHeaderModal}
        onHide={() => setShowHeaderModal(false)}
        onSelect={handleHeaderChange}
        currentHeaderId={pages[0]?.header || 1}
      />
      {/* --- 新增模板选择弹窗 --- */}
      {activeSectionForTemplateChange && (
        <TemplateSelectModal
          show={showTemplateModal}
          onHide={() => setShowTemplateModal(false)}
          sectionType={activeSectionForTemplateChange.type}
          currentTemplate={activeSectionForTemplateChange.template}
          onSelect={handleChangeTemplate}
          initialPage={templateModalPageHistory[activeSectionForTemplateChange.sectionId] || 1}
          onPageChange={(page) => {
            setTemplateModalPageHistory(prev => ({
              ...prev,
              [activeSectionForTemplateChange.sectionId]: page
            }));
          }}
        />
      )}
      {/* -------------------- */}

      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-semibold">
          OwnMenu Website Editor
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-white px-3" ref={modalBodyRef}>
        {pages.length === 0 ? (
          loading ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: "70vh" }}
            >
              <div style={{ maxWidth: 260 }}>
                <Lottie animationData={loader} loop autoplay />
              </div>
              <p className="text-muted mt-4 fw-semibold">
                {LOADING_MESSAGES[loadingStep] || "Almost done..."}
              </p>
            </div>
          ) : (
            <div style={aiStyles.container}>
              <motion.div
                style={aiStyles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-5">
                  <h2 className="fw-bold mb-2" style={{
                    background: "linear-gradient(to right, #fff, #a5a5a5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    AI Website Architect
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.6)" }}>
                    Design your perfect restaurant presence in seconds.
                  </p>
                </div>

                <Form>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Restaurant Name</Form.Label>
                        <Form.Control
                          style={aiStyles.input}
                          name="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="ai-input"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Cuisine Type</Form.Label>
                        <Form.Control
                          style={aiStyles.input}
                          name="cuisine"
                          value={form.cuisine}
                          onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                          placeholder="e.g. Sushi, Italian"
                          className="ai-input"
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Location</Form.Label>
                        <Form.Control
                          style={aiStyles.input}
                          name="location"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="City, State"
                          className="ai-input"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Theme Layout</Form.Label>
                        <Form.Select
                          style={{ ...aiStyles.input, cursor: 'pointer' }}
                          value={firstTimeReDesignTheme}
                          onChange={(e) => setFirstTimeRedesignTheme(e.target.value)}
                          className="ai-input"
                        >
                          {themeOptions.map((themeName) => (
                            <option key={themeName} value={themeName} style={{ color: '#333' }}>{themeName}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label style={aiStyles.label}>Website Vibe (Optional)</Form.Label>
                    <Form.Control
                      style={aiStyles.input}
                      name="websiteType"
                      value={form.websiteType}
                      onChange={(e) => setForm({ ...form, websiteType: e.target.value })}
                      placeholder="e.g. Modern, Dark, Cozy, Luxury"
                      className="ai-input"
                    />
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Logo (Optional)</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ ...aiStyles.input, padding: '8px' }}
                          className="ai-input"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-4">
                      <Form.Group>
                        <Form.Label style={aiStyles.label}>Hero Image (Optional)</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleRestaurantImageChange}
                          style={{ ...aiStyles.input, padding: '8px' }}
                          className="ai-input"
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      disabled={loading}
                      style={aiStyles.button}
                    >
                      ✨ GENERATE WEBSITE
                    </motion.button>
                  </div>
                </Form>
              </motion.div>
            </div>
          )
        ) : (
          <>
            <ToastContainer
              position="middle-start"
              className="p-3"
              style={{
                position: "fixed",
                bottom: "1rem",
                right: "1rem",
                zIndex: 9999,
              }}
            >
              <Toast
                bg="success"
                show={showToast}
                delay={3000}
                autohide
                onClose={() => setShowToast(false)}
              >
                <Toast.Body className="text-white">{toastMessage}</Toast.Body>
              </Toast>
            </ToastContainer>

            <div className="container mb-4">
              <div className="container mb-4">
                {/* Top Section - Page Info + Mode */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                  <div className="text-muted small">
                    {viewMode === "editor" ? (
                      <>
                        You're editing:{" "}
                        <strong className="text-uppercase text-dark">
                          {activePage}
                        </strong>
                      </>
                    ) : (
                      <>Previewing live site</>
                    )}
                  </div>

                  <div className="btn-group">
                    <Button
                      variant={
                        viewMode === "editor" ? "dark" : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => {
                        setViewMode("editor");
                        setShowSkeleton(true);
                        setShowSkeleton(false);
                      }}
                    >
                      ✏️ Editor
                    </Button>
                    <Button
                      variant={
                        viewMode === "preview" ? "dark" : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => {
                        setViewMode("preview");
                        setShowSkeleton(true);
                        setShowSkeleton(false);
                      }}
                    >
                      👁 Preview
                    </Button>
                  </div>
                </div>

                {/* Tabs (only in editor mode) */}
                {viewMode === "editor" && (
                  <>
                    <div className="mb-2 text-center text-muted small">
                      ⚠️ Reserved pages <strong>order</strong>,{" "}
                      <strong>menu</strong>, and <strong>checkout</strong>{" "}
                      already exist by default and cannot be created.
                    </div>

                    <div className="d-flex align-items-center flex-wrap justify-content-between gap-2 mb-3">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <Tabs
                          id="page-tabs"
                          activeKey={activePage}
                          onSelect={(k) => {
                            setActivePage(k);
                            setShowSkeleton(true);
                            setShowSkeleton(false);
                          }}
                          className="flex-wrap"
                          justify
                        >
                          {pageNames.map((page) => (
                            <Tab
                              key={page}
                              eventKey={page}
                              title={
                                page.charAt(0).toUpperCase() + page.slice(1)
                              }
                            />
                          ))}
                        </Tabs>
                      </div>

                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ minWidth: "300px" }}
                      >
                        {pages.length >= 5 && (
                          <span className="text-muted small">
                            Maximum 5 pages
                          </span>
                        )}

                        {!showAddPageInput ? (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setTempPages([...pages]);
                                setShowReorderModal(true);
                              }}
                            >
                              ↕️ Reorder
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setShowAddPageInput(true)}
                            >
                              ➕ Add Page
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Form.Control
                              type="text"
                              size="sm"
                              placeholder="New page name"
                              className="shadow-sm"
                              style={{ maxWidth: "180px" }}
                              value={newPageName}
                              onChange={(e) => {
                                setNewPageName(e.target.value);
                                setPageError("");
                              }}
                            />
                            <Button
                              size="sm"
                              variant="success"
                              onClick={async () => {
                                const trimmed = newPageName
                                  .trim()
                                  .toLowerCase();
                                if (!trimmed)
                                  return setPageError("Page name required.");
                                if (RESERVED_SLUGS.includes(trimmed))
                                  return setPageError(
                                    `"${trimmed}" is a reserved page.`,
                                  );
                                if (trimmed.length > 15)
                                  return setPageError("Max 15 characters.");
                                if (pageNames.includes(trimmed))
                                  return setPageError("Page already exists.");
                                if (pages.length >= 5)
                                  return setPageError(
                                    "Only 5 pages for best performance.",
                                  );

                                setSavingSection(true); // Start spinner overlay

                                try {
                                  await dispatch(
                                    createNewPageThunk({ name: trimmed }),
                                  );
                                  await dispatch(getPagesThunk());

                                  setNewPageName("");
                                  setShowAddPageInput(false);
                                  setShowToast(true);
                                  setToastMessage("Added New Page");
                                } catch (error) {
                                  console.error("Error adding page:", error);
                                  setPageError(
                                    "Something went wrong. Please try again.",
                                  );
                                } finally {
                                  setSavingSection(false); // End spinner overlay
                                }
                              }}
                            >
                              ✅
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setShowAddPageInput(false);
                                setNewPageName("");
                                setPageError("");
                              }}
                            >
                              ✖
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {pageError && (
                      <div
                        className="text-danger small mb-3 text-end"
                        style={{ maxWidth: "300px", marginLeft: "auto" }}
                      >
                        {pageError}
                      </div>
                    )}

                    {/* Page-level Actions */}
                    <div className="d-flex flex-column align-items-center gap-3 mb-3 w-100">
                      {/* Configuration Row (Pill Bar) */}
                      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 py-2 px-4 bg-light rounded-pill border shadow-sm">
                        <HeaderTranslationToggle defaultToggle={homepagesetting?.show_translation} restaurantId={restaurantId} />
                        <div className="vr text-muted d-none d-md-block" style={{ height: '22px' }}></div>
                        <HeaderMenuToggle defaultToggle={homepagesetting?.show_menu_link} restaurantId={restaurantId} />
                        <div className="vr text-muted d-none d-md-block" style={{ height: '22px' }}></div>
                        <ThemeDropdown
                          onSelect={(theme) => handleThemeSelect(theme)}
                          onSelecteFontStyle={(font) => handFontStyleSelect(font)}
                          onToggleColorLayout={() => handleColorLayoutSelect()}
                        />
                      </div>

                      {/* Actions Row */}
                      <div className="d-flex flex-wrap justify-content-center gap-2 align-items-center">
                        <Button variant="primary" size="sm" onClick={handleOpenSocialModal}>
                          Social Media Links
                        </Button>
                        <SocialMediaLinksModal
                          show={showSocialLinksModal}
                          onHide={handleCloseSocialModal}
                          onSave={handleSaveSocialLinks}
                          initialLinks={socialLinks}
                        />

                        <Button variant="info" size="sm" onClick={() => setShowHeaderModal(true)}>
                          Change Header
                        </Button>

                        {activePage !== "home" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePage(activePage)}
                          >
                            🗑 Delete Page
                          </Button>
                        )}

                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={handleAddSectionClick}
                        >
                          ➕ Add Section
                        </Button>
                        {restyling ? (
                          <Button variant="primary" size="sm" disabled>
                            <Spinner as="span" animation="border" size="sm" />
                            <span className="ms-2">Restyling...</span>
                          </Button>
                        ) : (
                          localSections[activePage]?.length > 0 && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => restyleSections(activePage)}
                            >
                              ✨ AI Restyle Page
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}

                <hr />

                {/* Live Link - Always Show */}
                <div className="text-center mt-2 small text-muted">
                  <span className="me-1">Live site:</span>
                  <a
                    href={baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    {baseUrl}
                  </a>
                </div>
              </div>
            </div>

            {viewMode === "editor" ? (
              <div className="d-flex flex-column gap-4">
                {localSections[activePage]?.map((section, index) => {
                  const isEditing = editMode[activePage]?.[section.id];

                  return (
                    <motion.div
                      key={section.id}
                      className="card border shadow-sm overflow-hidden"
                      style={{
                        maxWidth: "1360px",
                        width: "95%",
                        margin: "0 auto",
                        borderRadius: "12px",
                      }}
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      ref={(el) => (sectionRefs.current[section.id] = el)}
                    >
                      {uploadingImageSectionId === section.id && (
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.6)",
                            zIndex: 999,
                          }}
                        >
                          <div className="text-center">
                            <div
                              className="spinner-border text-primary mb-3"
                              role="status"
                            />
                            <div className="fw-semibold text-dark">
                              Updating...
                            </div>
                          </div>
                        </div>
                      )}

                      {!isEditing ? (
                        <div className="position-relative">
                          <div
                            className="position-relative"
                            style={{
                              width: "100%",
                              height: "516px" /* 460 + ~56 */,
                            }}
                          >
                            {(showSkeleton || restyling) && (
                              <div
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{
                                  zIndex: 10,
                                  backgroundColor: "#fff",
                                }}
                              >
                                <Skeleton
                                  height={516}
                                  width="100%"
                                  borderRadius={0}
                                  duration={0.7}
                                />
                              </div>
                            )}

                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "460px",
                              }}
                            >
                              {/* ✅ Modal Warning as overlay */}
                              {section.template.startsWith("modal-") && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 10,
                                    backgroundColor: "#fffbe6",
                                    color: "#8a6d3b",
                                    borderBottom: "1px solid #faebcc",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    textAlign: "center",
                                    pointerEvents: "none",
                                  }}
                                >
                                  ⚠️ This is a pop-out section. It will not
                                  appear as in-page content but will display as
                                  a pop-up when the page loads.
                                </div>
                              )}
                              {/* 🔒 Keep your original iframe styling untouched */}

                              <>
                                {!iframeLoaded && (
                                  <div
                                    className="w-100 h-100 d-flex justify-content-center align-items-center position-absolute top-0 start-0"
                                    style={{
                                      background: "#fff",
                                      borderRadius: "1.5rem",
                                      zIndex: 1,
                                    }}
                                  >
                                    <Skeleton
                                      height="100%"
                                      width="100%"
                                      borderRadius="1.5rem"
                                    />
                                  </div>
                                )}

                                <iframe
                                  src={`${baseUrl}/preview?sectionId=${section.id}&v=${section.version || 0}&restaurantName=${encodeURIComponent(restaurantName || "")}`}
                                  key={iframeKey}
                                  title={`section-${section.id}`}
                                  onLoad={() => setIframeLoaded(true)}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    borderBottom: "1px solid #eee",
                                    borderRadius: "1.5rem",
                                  }}
                                />
                              </>
                            </div>

                            {/* Button row (below iframe) */}
                            <div
                              className="d-flex justify-content-between align-items-center py-2 px-1 border-top flex-wrap"
                              style={{
                                backgroundColor: "#f9f9fb",
                                boxShadow:
                                  "inset 0 1px 0 rgba(190, 32, 98, 0.05)",
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 10,
                              }}
                            >
                              <div>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    handleDeleteSection(activePage, section.id)
                                  }
                                >
                                  Delete
                                </Button>
                                {/* --- 新增：显示 Section 名称 --- */}
                                <span className="text-danger fw-bold ms-2 small">
                                  {SECTION_TEMPLATES[section.template]?.name || section.template}
                                </span>
                                {/* --------------------------- */}
                              </div>

                              <div className="d-flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => {
                                    setActiveSectionForStyle({
                                      page: activePage,
                                      sectionId: section.id,
                                      style_json: section.style_json,
                                      template: section.template
                                    });
                                    setShowStyleModal(true);
                                  }}
                                >
                                  Edit Style
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-dark"
                                  onClick={() =>
                                    toggleEdit(activePage, section.id)
                                  }
                                >
                                  Edit Section
                                </Button>
                                {/* --- 新增按钮 --- */}
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  disabled={['instagram', 'popular'].includes(section.type)}
                                  onClick={() => {
                                    setActiveSectionForTemplateChange({ 
                                      page: activePage, 
                                      sectionId: section.id, 
                                      type: section.type, 
                                      template: section.template 
                                    });
                                    setShowTemplateModal(true);
                                  }}
                                >
                                  Change Template
                                </Button>
                                {/* ---------------- */}
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={['instagram', 'popular'].includes(section.type)}
                                  onClick={() => restyleSingleSection(activePage, section.id)}
                                >
                                  ✨ AI Restyle
                                </Button>

                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          className="p-3"
                          initial={{ x: 300 }}
                          animate={{ x: 0 }}
                          exit={{ x: 300 }}
                          transition={{ duration: 0.3 }}
                        >


                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-semibold mb-0">
                              Editing: {section.type}
                            </h6>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => toggleEdit(activePage, section.id)}
                            >
                              ✖ Cancel
                            </Button>
                          </div>
                          {section.type === 'popular' && (
                            <div className="alert alert-warning" role="alert">
                              <strong>AI-Controlled Section:</strong> This section cannot be edited directly.
                              It is managed by OwnMenu's AI based on your most popular items. To influence what appears here,
                              update the <strong>Popular Item</strong> tags and ensure your items have images.
                            </div>
                          )}
                          <Form className="mt-3">
                            <div className="row">
                              {Object.keys(section.content).some(key => key.includes("video_url")) && (
                                <div className="col-md-12">
                                  <div className="alert alert-info py-2 small">
                                    <strong>Note:</strong>Video upload is optional and only shown for hero sections that support it.
                                    <br />
                                    "If the section supports video, the image will be used as a fallback poster if the video can't load."

                                  </div>
                                </div>
                              )}

                              {/* 🟢 核心修复：使用 SECTION_TEMPLATES 生成表单 */}
                              {(() => {
                                const templateConfig = SECTION_TEMPLATES[section.template];
                                if (!templateConfig) {
                                  return <div className="alert alert-warning">Configuration not found for {section.template}</div>;
                                }
                                return templateConfig.fields.map((fieldConfig) => {
                                  const value = section.content[fieldConfig.key] || "";
                                  return (
                                    <Form.Group key={fieldConfig.key} className="mb-3 col-md-12">
                                      <Form.Label className="fw-semibold text-capitalize">
                                        {fieldConfig.label}
                                      </Form.Label>

                                      {fieldConfig.type === 'image' || fieldConfig.type === 'media' || fieldConfig.key.includes("video_url") ? (
                                        <>
                                          {value && (
                                            <div className="d-flex flex-wrap align-items-start gap-3 mb-2">
                                              <div className="position-relative border rounded" style={{ maxWidth: "200px" }}>
                                                {(() => {
                                                  if (fieldConfig.type === 'image') return true;
                                                  if (fieldConfig.type === 'media' && value) {
                                                    const urlPath = value.split('?')[0].toLowerCase();
                                                    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].some(ext => urlPath.endsWith(ext));
                                                  }
                                                  return false;
                                                })() ? (
                                                  <img
                                                    src={value}
                                                    alt="preview"
                                                    className="img-fluid rounded w-100"
                                                    style={{ maxHeight: 140, objectFit: "cover" }}
                                                  />
                                                ) : (
                                                  <video
                                                    src={value}
                                                    controls
                                                    className="rounded w-100"
                                                    style={{ maxHeight: 180, objectFit: "cover" }}
                                                  />
                                                )}
                                                <Button
                                                  variant="danger"
                                                  size="sm"
                                                  className="position-absolute top-0 end-0 m-1 px-2 py-1"
                                                  onClick={() => handleDeleteImage(section.id, fieldConfig.key, value)}
                                                >
                                                  🗑
                                                </Button>
                                              </div>
                                            </div>
                                          )}

                                          <div className="d-flex gap-2 w-100">
                                            <Form.Control
                                              size="sm"
                                              type="file"
                                              accept={fieldConfig.type === 'image' ? "image/*" : fieldConfig.type === 'media' ? "image/*,.mp4,.mov,.avi,.mkv,.webm" : "video/*"}
                                              disabled={!!value}
                                              className="form-control-sm"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // For media type, detect file type and choose appropriate handler
                                                if (fieldConfig.type === 'media') {
                                                  const mimeType = file.type;
                                                  const isVideo = mimeType.startsWith('video/') || ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'].some(ext => file.name.toLowerCase().endsWith(ext));
                                                  const isImage = mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => file.name.toLowerCase().endsWith(ext));

                                                  if (isVideo) {
                                                    handleVideoUpload(section.id, fieldConfig.key, file);
                                                  } else if (isImage) {
                                                    handleImageUpload(section.id, fieldConfig.key, file);
                                                  } else {
                                                    // For other file types, default to image upload
                                                    handleImageUpload(section.id, fieldConfig.key, file);
                                                  }
                                                } else if (fieldConfig.key.includes("video_url")) {
                                                  handleVideoUpload(section.id, fieldConfig.key, file);
                                                } else {
                                                  handleImageUpload(section.id, fieldConfig.key, file);
                                                }
                                              }}
                                            />
                                            {(fieldConfig.type === 'image' || fieldConfig.type === 'media' || fieldConfig.key.includes("video_url")) && (
                                              <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="text-nowrap"
                                                disabled={!!value}
                                                onClick={() => {
                                                  setGalleryTarget({
                                                    page: activePage,
                                                    sectionId: section.id,
                                                    fieldKey: fieldConfig.key,
                                                    type: 'main'
                                                  });
                                                  setShowGalleryModal(true);
                                                }}
                                              >
                                                🖼 From Gallery
                                              </Button>
                                            )}
                                          </div>
                                        </>
                                      ) : fieldConfig.type === 'array' ? (
                                        <div className="border rounded p-3 bg-light">
                                          <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-primary">{fieldConfig.label}</span>
                                            <Button
                                              variant="primary"
                                              size="sm"
                                              onClick={() => {
                                                const currentItems = Array.isArray(value) ? value : [];
                                                const newItem = {};
                                                fieldConfig.fields.forEach(f => newItem[f.key] = "");
                                                updateSectionContent(activePage, section.id, fieldConfig.key, [...currentItems, newItem]);
                                              }}
                                            >
                                              + Add {fieldConfig.label.slice(0, -1) || 'Item'}
                                            </Button>
                                          </div>
                                          
                                          <Accordion defaultActiveKey="0">
                                            {(Array.isArray(value) ? value : []).map((item, idx) => (
                                              <Accordion.Item eventKey={String(idx)} key={idx} className="mb-2 shadow-sm border rounded overflow-hidden">
                                                <Accordion.Header className="bg-white">
                                                  <div className="d-flex justify-content-between w-100 align-items-center pe-3">
                                                    <span>#{idx + 1} {item.label || item.name || item.year || fieldConfig.label.slice(0, -1)}</span>
                                                    <Button
                                                      variant="link"
                                                      className="text-danger p-0 ms-auto"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newItems = value.filter((_, i) => i !== idx);
                                                        updateSectionContent(activePage, section.id, fieldConfig.key, newItems);
                                                      }}
                                                    >
                                                      Remove
                                                    </Button>
                                                  </div>
                                                </Accordion.Header>
                                                <Accordion.Body className="bg-white p-3">
                                                  {fieldConfig.fields.map((subField) => (
                                                    <Form.Group key={subField.key} className="mb-2">
                                                      <Form.Label className="small fw-semibold">{subField.label}</Form.Label>
                                                      {subField.type === 'textarea' ? (
                                                        <Form.Control
                                                          as="textarea"
                                                          rows={2}
                                                          size="sm"
                                                          value={item[subField.key] || ""}
                                                          onChange={(e) => {
                                                            const newItems = [...value];
                                                            newItems[idx] = { ...newItems[idx], [subField.key]: e.target.value };
                                                            updateSectionContent(activePage, section.id, fieldConfig.key, newItems);
                                                          }}
                                                        />
                                                      ) : subField.type === 'image' ? (
                                                        <div className="d-flex flex-column gap-2">
                                                          {item[subField.key] && (
                                                            <img src={item[subField.key]} alt="preview" className="img-thumbnail" style={{ height: '80px', width: '80px', objectFit: 'cover' }} />
                                                          )}
                                                          <div className="d-flex gap-2 align-items-center w-100">
                                                            <Form.Control
                                                              type="file"
                                                              size="sm"
                                                              onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;

                                                                const formData = new FormData();
                                                                formData.append("image", file);

                                                                try {
                                                                  setUploadingImageSectionId(section.id);
                                                                  const token = getToken();
                                                                  const res = await fetch("/api/pages/upload-image", {
                                                                    method: "POST",
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                    body: formData,
                                                                  });
                                                                  const data = await res.json();
                                                                  if (data.imageUrl) {
                                                                    const newItems = [...value];
                                                                    newItems[idx] = { ...newItems[idx], [subField.key]: data.imageUrl };
                                                                    updateSectionContent(activePage, section.id, fieldConfig.key, newItems);
                                                                    setToastMessage("🖼️ Image uploaded successfully");
                                                                  } else {
                                                                    setToastMessage("❌ Failed to upload image");
                                                                  }
                                                                  setShowToast(true);
                                                                } catch (err) {
                                                                  console.error("Upload error", err);
                                                                  setToastMessage("❌ Upload error");
                                                                  setShowToast(true);
                                                                } finally {
                                                                  setUploadingImageSectionId(null);
                                                                }
                                                              }}
                                                            />
                                                            <Button
                                                              variant="outline-primary"
                                                              size="sm"
                                                              className="text-nowrap"
                                                              onClick={() => {
                                                                setGalleryTarget({
                                                                  page: activePage,
                                                                  sectionId: section.id,
                                                                  fieldKey: fieldConfig.key,
                                                                  idx,
                                                                  subFieldKey: subField.key,
                                                                  type: 'array',
                                                                  currentValue: value
                                                                });
                                                                setShowGalleryModal(true);
                                                              }}
                                                            >
                                                              🖼 From Gallery
                                                            </Button>
                                                          </div>
                                                          {uploadingImageSectionId === section.id && (
                                                            <div className="small text-muted mt-1">
                                                              <Spinner animation="border" size="sm" className="me-2" />
                                                              Uploading...
                                                            </div>
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <Form.Control
                                                          type="text"
                                                          size="sm"
                                                          value={item[subField.key] || ""}
                                                          onChange={(e) => {
                                                            const newItems = [...value];
                                                            newItems[idx] = { ...newItems[idx], [subField.key]: e.target.value };
                                                            updateSectionContent(activePage, section.id, fieldConfig.key, newItems);
                                                          }}
                                                        />
                                                      )}
                                                    </Form.Group>
                                                  ))}
                                                </Accordion.Body>
                                              </Accordion.Item>
                                            ))}
                                          </Accordion>
                                        </div>
                                      ) : fieldConfig.type === 'textarea' ? (
                                        <Form.Control
                                          as="textarea"
                                          rows={4}
                                          placeholder={`Enter ${fieldConfig.label}`}
                                          value={value}
                                          className="shadow-sm"
                                          onChange={(e) =>
                                            updateSectionContent(activePage, section.id, fieldConfig.key, e.target.value)
                                          }
                                        />
                                      ) : fieldConfig.type === 'select' ? (
                                        <Form.Select
                                          size="sm"
                                          value={value}
                                          className="shadow-sm"
                                          onChange={(e) =>
                                            updateSectionContent(activePage, section.id, fieldConfig.key, e.target.value)
                                          }
                                        >
                                          {fieldConfig.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      ) : (
                                        <Form.Control
                                          size="sm"
                                          type="text"
                                          placeholder={`Enter ${fieldConfig.label}`}
                                          value={value}
                                          className="shadow-sm"
                                          onChange={(e) =>
                                            updateSectionContent(activePage, section.id, fieldConfig.key, e.target.value)
                                          }
                                        />
                                      )}
                                    </Form.Group>
                                  );
                                });
                              })()}
                              {/* ------------------------------------------------ */}
                            </div>



                            <div className="d-flex justify-content-between mt-4 flex-wrap align-items-center">
                              <div className="d-inline-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "15px",
                                  }}
                                  onClick={() =>
                                    moveSection(activePage, index, -1)
                                  }
                                  title="Move Up"
                                >
                                  <BsArrowUp size={16} />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  className="p-1 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "15px",
                                  }}
                                  onClick={() =>
                                    moveSection(activePage, index, 1)
                                  }
                                  title="Move Down"
                                >
                                  <BsArrowDown size={16} />
                                </Button>
                              </div>

                              <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                                {[
                                  "info",
                                  "gallery",
                                  "contact",
                                  "feedback",
                                  "catering",
                                  "reservation",
                                  "modal",
                                  "popular",
                                  "career"
                                ].includes(section.type) ? (
                                  <div
                                    className="text-muted small d-flex align-items-center"
                                    title="AI content generation is not supported for this section type."
                                    style={{
                                      padding: "0.375rem 0.75rem",
                                      border: "1px solid #ced4da",
                                      borderRadius: "0.25rem",
                                      backgroundColor: "#f8f9fa",
                                      cursor: "not-allowed",
                                    }}
                                  >
                                    ✨ AI Generate Content (Unavailable)
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="fw-semibold px-3 py-3"
                                    onClick={() =>
                                      generateAIContent(activePage, section.id)
                                    }
                                    disabled={aiLoadingSectionId === section.id}
                                  >
                                    {aiLoadingSectionId === section.id ? (
                                      <>
                                        <span
                                          className="spinner-border spinner-border-sm me-2"
                                          role="status"
                                        />
                                        Generating...
                                      </>
                                    ) : (
                                      "✨ AI Generate Content"
                                    )}
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="success"
                                  className="fw-semibold px-3 py-3 d-flex align-items-center gap-2"
                                  onClick={() =>
                                    handleSaveSection(activePage, section.id)
                                  }
                                >
                                  📑 Save Content
                                </Button>
                              </div>
                            </div>
                          </Form>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                <>
                  {showAddSelector ? (
                    <div
                      className="card border shadow-sm  text-center p-4"
                      style={{
                        maxWidth: "1360px",
                        width: "95%",
                        margin: "0 auto",
                        borderRadius: "12px",
                        backgroundColor: "#f9f9fb",
                        boxShadow: "inset 0 1px 0 rgba(190, 32, 98, 0.05)",
                      }}
                    >
                      <h6 className="mb-2 fw-semibold">
                        Let AI help you add a new section. Choose the section
                        type you'd like to insert below.
                      </h6>
                      <div className="px-3 py-4">
                        {/* Content Sections */}
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-uppercase mb-0">
                              Content Sections
                            </h6>
                            <hr className="flex-grow-1 ms-2 border-top border-secondary" />
                          </div>
                          <div className="row g-3">
                            {CONTENT_SECTION_TYPES.map((type) => {
                              const { label, image } = SECTION_PREVIEWS[type];
                              return (
                                <div
                                  key={type}
                                  className="col-6 col-md-2 d-flex justify-content-center"
                                >
                                  <Button
                                    variant="outline-dark"
                                    size="sm"
                                    className="section-card-button d-flex flex-column align-items-center w-100"
                                    style={{
                                      padding: "12px",
                                      borderRadius: "8px",
                                      backgroundColor: "#fff",
                                      border: "1px solid #dee2e6",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onClick={() => handleAddNewSection(type)}
                                  >
                                    <img
                                      src={image}
                                      alt={label}
                                      className="w-100 object-fit-cover rounded mb-2"
                                      style={{ height: "100px" }}
                                    />
                                    <span className="small fw-bold">
                                      {label}
                                    </span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Form Sections */}
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-uppercase mb-0">
                              Form Sections
                            </h6>
                            <hr className="flex-grow-1 ms-3 border-top border-secondary" />
                          </div>
                          <div className="row g-3">
                            {FORM_SECTION_TYPES.map((type) => {
                              const { label, image } = SECTION_PREVIEWS[type];
                              return (
                                <div
                                  key={type}
                                  className="col-6 col-md-2 d-flex justify-content-center"
                                >
                                  <Button
                                    variant="outline-dark"
                                    size="sm"
                                    className="section-card-button d-flex flex-column align-items-center w-100"
                                    style={{
                                      padding: "12px",
                                      borderRadius: "8px",
                                      backgroundColor: "#fff",
                                      border: "1px solid #dee2e6",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onClick={() => handleAddNewSection(type)}
                                  >
                                    <img
                                      src={image}
                                      alt={label}
                                      className="w-100 object-fit-cover rounded mb-2"
                                      style={{ height: "100px" }}
                                    />
                                    <span className="small fw-bold">
                                      {label}
                                    </span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-bold text-uppercase mb-0">
                              ON SCREEN POP-OUT Sections
                            </h6>
                            <hr className="flex-grow-1 ms-3 border-top border-secondary" />
                          </div>
                          <div className="row g-3">
                            {POP_OUT_SECTION_TYPES.map((type) => {
                              const { label, image } = SECTION_PREVIEWS[type];
                              return (
                                <div
                                  key={type}
                                  className="col-6 col-md-2 d-flex justify-content-center"
                                >
                                  <Button
                                    variant="outline-dark"
                                    size="sm"
                                    className="section-card-button d-flex flex-column align-items-center w-100"
                                    style={{
                                      padding: "12px",
                                      borderRadius: "8px",
                                      backgroundColor: "#fff",
                                      border: "1px solid #dee2e6",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onClick={() => handleAddNewSection(type)}
                                  >
                                    <img
                                      src={image}
                                      alt={label}
                                      className="w-100 object-fit-cover rounded mb-2"
                                      style={{ height: "100px" }}
                                    />
                                    <span className="small fw-bold">
                                      {label}
                                    </span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setShowAddSelector(false)}
                        >
                          ✖ Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      className="d-flex justify-content-center align-items-center mx-auto px-4 py-3"
                      style={{
                        minWidth: "300px",
                        fontWeight: "500",
                        borderRadius: "8px",
                      }}
                      onClick={handleAddSectionClick}
                    >
                      ➕ Add Section
                    </Button>
                  )}
                </>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.6 }}
                style={{
                  maxWidth: "1360px",
                  margin: "0 auto",
                  borderRadius: "12px",
                  width: previewSize === "mobile" ? "456px" : "100%",
                }}
              >
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                  <span className="small text-muted">View:</span>
                  <Button
                    variant={
                      previewSize === "desktop" ? "dark" : "outline-secondary"
                    }
                    size="sm"
                    onClick={() => setPreviewSize("desktop")}
                  >
                    🖥 Desktop
                  </Button>
                  <Button
                    variant={
                      previewSize === "mobile" ? "dark" : "outline-secondary"
                    }
                    size="sm"
                    onClick={() => setPreviewSize("mobile")}
                  >
                    📱 Mobile
                  </Button>
                  {restyling ? (
                    <Button variant="primary" size="sm" disabled>
                      <Spinner as="span" animation="border" size="sm" />
                      <span className="ms-2">Restyling...</span>
                    </Button>
                  ) : (
                    localSections[activePage]?.length > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setRestyleModal(true)}
                      >
                        ✨ AI Restyle Entire Site
                      </Button>
                    )
                  )}
                </div>

                {showSkeleton ? (
                  <div className="w-100 h-100">
                    <div
                      className="w-100"
                      style={{
                        height: "80vh",
                        borderRadius: "1.5rem",
                        overflow: "hidden",
                      }}
                    >
                      <Skeleton
                        height="100%"
                        width="100%"
                        borderRadius="1.5rem"
                        duration={0.7}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {!iframeLoaded && (
                      <div
                        className="d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100 bg-white"
                        style={{ zIndex: 1 }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />
                      </div>
                    )}
                    <iframe
                      key={mainFrameKey}
                      src={baseUrl}
                      onLoad={() => setIframeLoaded(true)}
                      style={{
                        width: "100%",
                        height: "80vh",
                        border: "1px solid #ccc",
                        borderRadius: "1.5rem",
                      }}
                      title="Live Site Preview"
                    />
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </Modal.Body>

      {/* Missing AI Info Modal */}
      <Modal show={showMissingAIModal} onHide={() => setShowMissingAIModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🧠 Help AI Know Your Restaurant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            To generate the best content, our AI needs a few details about your restaurant.
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Restaurant Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. The Golden Spoon"
                value={aiform.ai_name}
                onChange={(e) => setaiForm({ ...aiform, ai_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cuisine Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Italian, Sushi, Vegan"
                value={aiform.cuisine}
                onChange={(e) => setaiForm({ ...aiform, cuisine: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location (City, State)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. New York, NY"
                value={aiform.ai_location}
                onChange={(e) => setaiForm({ ...aiform, ai_location: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMissingAIModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => saveAIInfoAndRetry(aiform)}
            disabled={!aiform.ai_name || !aiform.cuisine || !aiform.ai_location}
          >
            Save & Retry
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Reordering Modal */}
      <Modal show={showReorderModal} onHide={() => setShowReorderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>↕️ Reorder Pages</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Drag and drop page items, or use the 🔼/🔽 buttons to customize the order.
          </p>
          <div className="list-group">
            {tempPages.map((page, index) => (
              <div
                key={page.id}
                className="list-group-item d-flex align-items-center justify-content-between py-2 px-3 border border-light-subtle rounded mb-2 shadow-sm bg-white"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                style={{ cursor: "grab", transition: "all 0.2s ease" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted fs-5" style={{ cursor: "grab", userSelect: "none" }}>☰</span>
                  <span className="fw-semibold text-capitalize text-dark">{page.name}</span>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    className="border"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                  >
                    🔼
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    className="border"
                    disabled={index === tempPages.length - 1}
                    onClick={() => handleMoveDown(index)}
                  >
                    🔽
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReorderModal(false)} disabled={savingOrder}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveOrder} disabled={savingOrder}>
            {savingOrder ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save Order"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Collection Modal for Forms */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Where should we send submissions?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Please enter the email address where you would like to receive notifications
            when a customer submits this {pendingSectionType}.
          </p>
          <Form.Group>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="e.g. contact@yourrestaurant.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEmailSubmit();
                }
              }}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEmailSubmit}
            disabled={!emailInput || !emailInput.includes('@')}
          >
            Add Form Section
          </Button>
        </Modal.Footer>
      </Modal>
      <StyleEditorModal
        show={showStyleModal}
        onHide={() => setShowStyleModal(false)}
        section={activeSectionForStyle}
        onSave={handleSaveStyles}
      />
      <GallerySelectionModal
        show={showGalleryModal}
        onHide={() => setShowGalleryModal(false)}
        onSelectImage={async (publicUrl) => {
          if (!galleryTarget) return;
          const { page, sectionId, fieldKey, type, idx, subFieldKey, currentValue } = galleryTarget;
          
          try {
            setUploadingImageSectionId(sectionId);
            
            // 1. Get current section content
            const section = localSections[page].find((s) => s.id === sectionId);
            if (!section) throw new Error("Section not found");
            
            let updatedContent = { ...section.content };
            if (type === 'main') {
              updatedContent[fieldKey] = publicUrl;
            } else if (type === 'array') {
              const currentArray = Array.isArray(section.content[fieldKey]) ? section.content[fieldKey] : [];
              const newItems = [...currentArray];
              newItems[idx] = { ...newItems[idx], [subFieldKey]: publicUrl };
              updatedContent[fieldKey] = newItems;
            }
            
            // 2. Save directly to backend
            await dispatch(
              updateSectionThunk(section.id, {
                template: section.template,
                content_json: updatedContent,
              }),
            );
            
            // 3. Sync Redux state & refresh UI
            await dispatch(getPagesThunk());
            
            // Keep editor section expanded
            setEditMode((prev) => ({
              ...prev,
              [page]: {
                ...prev[page],
                [sectionId]: true,
              },
            }));
            
            setToastMessage("🖼️ Image selected from gallery");
            setShowToast(true);
          } catch (err) {
            console.error("Gallery select save error:", err);
            setToastMessage("❌ Failed to save selected image");
            setShowToast(true);
          } finally {
            setUploadingImageSectionId(null);
            setShowGalleryModal(false);
          }
        }}
      />
    </Modal>
  );
}
