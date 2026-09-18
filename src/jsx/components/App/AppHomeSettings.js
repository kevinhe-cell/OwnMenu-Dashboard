import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { getToken } from "../../../store/utlits";
import { FaArrowUp, FaArrowDown, FaTrash, FaPlus } from "react-icons/fa";

const LAYOUTS = [
  { id: "default", label: "Default", description: "Header, hero carousel, order CTA, 2 featured cards" },
  { id: "compact", label: "Compact", description: "Tighter carousel and single row of featured cards" },
  { id: "minimal", label: "Minimal", description: "No carousel; prominent order CTA; optional featured block" },
];

const MAX_CAROUSEL = 5;

export default function AppHomeSettings() {
  const restaurantId = useSelector((state) => state.session.user?.restaurant_id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layoutId, setLayoutId] = useState("default");
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselSlideTexts, setCarouselSlideTexts] = useState([]);
  const [featuredCard1Image, setFeaturedCard1Image] = useState("");
  const [card1Title, setCard1Title] = useState("");
  const [card1Subtitle, setCard1Subtitle] = useState("");
  const [featuredCard2Image, setFeaturedCard2Image] = useState("");
  const [card2Title, setCard2Title] = useState("");
  const [card2Subtitle, setCard2Subtitle] = useState("");
  const [carouselFiles, setCarouselFiles] = useState({});
  const [featuredCard1File, setFeaturedCard1File] = useState(null);
  const [featuredCard2File, setFeaturedCard2File] = useState(null);
  const [carouselPreviewUrls, setCarouselPreviewUrls] = useState({});
  const [featured1PreviewUrl, setFeatured1PreviewUrl] = useState(null);
  const [featured2PreviewUrl, setFeatured2PreviewUrl] = useState(null);
  const carouselUrlRefs = useRef({});

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetch(`/api/app-home-settings/${restaurantId}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        if (data) {
          const images = Array.isArray(data.carousel_images) ? data.carousel_images : [];
          setLayoutId(data.layout_id || "default");
          setCarouselImages(images);
          const slideTexts = Array.isArray(data.carousel_slide_texts) ? data.carousel_slide_texts : [];
          const defaultTitle = data.carousel_title || "";
          const defaultSubtitle = data.carousel_subtitle || "";
          const texts = images.length > 0
            ? images.map((_, i) => slideTexts[i] ? { title: slideTexts[i].title || "", subtitle: slideTexts[i].subtitle || "" } : { title: defaultTitle, subtitle: defaultSubtitle })
            : [];
          setCarouselSlideTexts(texts);
          setFeaturedCard1Image(data.featured_card1_image || "");
          setCard1Title(data.card1_title || "");
          setCard1Subtitle(data.card1_subtitle || "");
          setFeaturedCard2Image(data.featured_card2_image || "");
          setCard2Title(data.card2_title || "");
          setCard2Subtitle(data.card2_subtitle || "");
        } else {
          setLayoutId("default");
          setCarouselImages([]);
          setCarouselSlideTexts([]);
          setFeaturedCard1Image("");
          setCard1Title("");
          setCard1Subtitle("");
          setFeaturedCard2Image("");
          setCard2Title("");
          setCard2Subtitle("");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Could not load app home settings.");
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // Carousel file preview URLs: create/revoke when files change
  useEffect(() => {
    const refs = carouselUrlRefs.current;
    Object.values(refs).forEach((u) => URL.revokeObjectURL(u));
    const next = {};
    for (let i = 0; i < carouselImages.length; i++) {
      const file = carouselFiles[i];
      if (file) next[i] = URL.createObjectURL(file);
    }
    carouselUrlRefs.current = next;
    setCarouselPreviewUrls(next);
    return () => Object.values(next).forEach((u) => URL.revokeObjectURL(u));
  }, [carouselFiles, carouselImages.length]);

  // Featured card file preview URLs (revoke on clear/unmount)
  useEffect(() => {
    if (!featuredCard1File) {
      setFeatured1PreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(featuredCard1File);
    setFeatured1PreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredCard1File]);

  useEffect(() => {
    if (!featuredCard2File) {
      setFeatured2PreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(featuredCard2File);
    setFeatured2PreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredCard2File]);

  const hasFiles =
    Object.keys(carouselFiles).length > 0 || featuredCard1File || featuredCard2File;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("No restaurant selected.");
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      if (hasFiles) {
        const formData = new FormData();
        formData.append("layout_id", layoutId);
        formData.append("carousel_images", JSON.stringify(carouselImages));
        formData.append("carousel_slide_texts", JSON.stringify(carouselSlideTexts));
        formData.append("featured_card1_image", featuredCard1Image);
        formData.append("card1_title", card1Title);
        formData.append("card1_subtitle", card1Subtitle);
        formData.append("featured_card2_image", featuredCard2Image);
        formData.append("card2_title", card2Title);
        formData.append("card2_subtitle", card2Subtitle);
        const carouselIndices = [];
        const carouselFileList = [];
        Object.keys(carouselFiles)
          .map(Number)
          .sort((a, b) => a - b)
          .forEach((i) => {
            if (carouselFiles[i]) {
              carouselIndices.push(i);
              carouselFileList.push(carouselFiles[i]);
            }
          });
        formData.append("carouselImageIndices", carouselIndices.join(","));
        carouselFileList.forEach((file) => formData.append("carouselImages", file));
        if (featuredCard1File) formData.append("featuredCard1", featuredCard1File);
        if (featuredCard2File) formData.append("featuredCard2", featuredCard2File);

        const res = await fetch(`/api/app-home-settings/${restaurantId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.error || errData.message || `Save failed (${res.status})`;
          throw new Error(msg);
        }
        const updated = await res.json();
        const upImages = Array.isArray(updated.carousel_images) ? updated.carousel_images : [];
        setCarouselImages(upImages);
        const upTexts = Array.isArray(updated.carousel_slide_texts) ? updated.carousel_slide_texts : [];
        setCarouselSlideTexts(upImages.map((_, i) => upTexts[i] ? { title: upTexts[i].title || "", subtitle: upTexts[i].subtitle || "" } : { title: "", subtitle: "" }));
        setFeaturedCard1Image(updated.featured_card1_image || "");
        setCard1Title(updated.card1_title || "");
        setCard1Subtitle(updated.card1_subtitle || "");
        setFeaturedCard2Image(updated.featured_card2_image || "");
        setCard2Title(updated.card2_title || "");
        setCard2Subtitle(updated.card2_subtitle || "");
        setCarouselFiles({});
        setFeaturedCard1File(null);
        setFeaturedCard2File(null);
      } else {
        const res = await fetch(`/api/app-home-settings/${restaurantId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            layout_id: layoutId,
            carousel_images: carouselImages,
            carousel_slide_texts: carouselSlideTexts,
            featured_card1_image: featuredCard1Image || null,
            card1_title: card1Title || null,
            card1_subtitle: card1Subtitle || null,
            featured_card2_image: featuredCard2Image || null,
            card2_title: card2Title || null,
            card2_subtitle: card2Subtitle || null,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.error || errData.message || `Save failed (${res.status})`;
          throw new Error(msg);
        }
      }
      toast.success("App home settings saved.");
    } catch (err) {
      const message = err.message || "Failed to save.";
      toast.error(message);
      console.error("App home settings save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const moveCarousel = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= carouselImages.length) return;
    const arr = [...carouselImages];
    const texts = [...carouselSlideTexts];
    const files = { ...carouselFiles };
    [arr[index], arr[next]] = [arr[next], arr[index]];
    [texts[index], texts[next]] = [texts[next], texts[index]];
    [files[index], files[next]] = [files[next], files[index]];
    setCarouselImages(arr);
    setCarouselSlideTexts(texts);
    setCarouselFiles(files);
  };

  const setCarouselFile = (index, file) => {
    if (!file) {
      const f = { ...carouselFiles };
      delete f[index];
      setCarouselFiles(f);
      return;
    }
    setCarouselFiles((prev) => ({ ...prev, [index]: file }));
  };

  const removeCarouselSlot = (index) => {
    setCarouselImages((prev) => prev.filter((_, i) => i !== index));
    setCarouselSlideTexts((prev) => prev.filter((_, i) => i !== index));
    setCarouselFiles((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const i = parseInt(k, 10);
        if (i < index) next[i] = prev[k];
        if (i > index) next[i - 1] = prev[k];
      });
      return next;
    });
  };

  const addCarouselSlot = () => {
    if (carouselImages.length >= MAX_CAROUSEL) return;
    setCarouselImages((prev) => [...prev, ""]);
    setCarouselSlideTexts((prev) => [...prev, { title: "", subtitle: "" }]);
  };

  const setSlideText = (index, field, value) => {
    setCarouselSlideTexts((prev) => {
      const next = prev.slice();
      if (!next[index]) next[index] = { title: "", subtitle: "" };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getCarouselPreviewUrl = (index) => {
    if (carouselFiles[index] && carouselPreviewUrls[index]) return carouselPreviewUrls[index];
    return carouselImages[index] || null;
  };

  if (!restaurantId) {
    return (
      <div className="container mt-4">
        <Card>
          <Card.Body>Please log in with a restaurant account to manage app home settings.</Card.Body>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <p className="text-muted">Loading app home settings…</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-4 fw-bold border-bottom pb-2">App Home Screen</h4>
      <p className="text-muted mb-4">
        Configure the home screen shown in the Nori app: layout and images. Upload images only (no links).
      </p>

      <Form onSubmit={handleSave}>
        <Card className="mb-4">
          <Card.Header className="fw-bold">Layout</Card.Header>
          <Card.Body>
            <Row>
              {LAYOUTS.map((layout) => (
                <Col key={layout.id} md={4} className="mb-2">
                  <Form.Check
                    type="radio"
                    id={`layout-${layout.id}`}
                    name="layout"
                    label={
                      <>
                        <strong>{layout.label}</strong>
                        <br />
                        <small className="text-muted">{layout.description}</small>
                      </>
                    }
                    checked={layoutId === layout.id}
                    onChange={() => setLayoutId(layout.id)}
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="fw-bold">Carousel (each slide has its own title & subtitle)</Card.Header>
          <Card.Body>
            {carouselImages.map((url, index) => {
              const preview = getCarouselPreviewUrl(index);
              const slideText = carouselSlideTexts[index] || { title: "", subtitle: "" };
              return (
                <div key={index} className="mb-4 p-3 border rounded">
                  <div className="small text-muted mb-2">Slide {index + 1}</div>
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <div className="flex-shrink-0" style={{ width: 160, height: 100, borderRadius: 8, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                      {preview ? (
                        <img src={preview} alt={`Slide ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No image</div>
                      )}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 220 }}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small mb-0">Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Authentic Japanese"
                          value={slideText.title}
                          onChange={(e) => setSlideText(index, "title", e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label className="small mb-0">Subtitle</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Fresh ingredients, made to order."
                          value={slideText.subtitle}
                          onChange={(e) => setSlideText(index, "subtitle", e.target.value)}
                        />
                      </Form.Group>
                      <Form.Label className="small mb-1">Upload image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCarouselFile(index, e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="d-flex gap-1 flex-shrink-0">
                      <Button variant="outline-secondary" size="sm" onClick={() => moveCarousel(index, -1)} disabled={index === 0}>
                        <FaArrowUp />
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => moveCarousel(index, 1)} disabled={index === carouselImages.length - 1}>
                        <FaArrowDown />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => removeCarouselSlot(index)}>
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {carouselImages.length < MAX_CAROUSEL && (
              <Button variant="outline-primary" size="sm" onClick={addCarouselSlot}>
                <FaPlus /> Add slide
              </Button>
            )}
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="fw-bold">Featured cards</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Card 1</Form.Label>
                  <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Title (e.g. Fresh Daily Specials)"
                    value={card1Title}
                    onChange={(e) => setCard1Title(e.target.value)}
                  />
                  <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Subtitle / description"
                    value={card1Subtitle}
                    onChange={(e) => setCard1Subtitle(e.target.value)}
                  />
                  <div className="mb-2" style={{ width: "100%", height: 120, borderRadius: 8, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                    {(featured1PreviewUrl || featuredCard1Image) ? (
                      <img
                        src={featured1PreviewUrl || featuredCard1Image}
                        alt="Card 1"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No image</div>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeaturedCard1File(e.target.files?.[0] || null)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Card 2</Form.Label>
                  <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Title (e.g. Our Story)"
                    value={card2Title}
                    onChange={(e) => setCard2Title(e.target.value)}
                  />
                  <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Subtitle / description"
                    value={card2Subtitle}
                    onChange={(e) => setCard2Subtitle(e.target.value)}
                  />
                  <div className="mb-2" style={{ width: "100%", height: 120, borderRadius: 8, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
                    {(featured2PreviewUrl || featuredCard2Image) ? (
                      <img
                        src={featured2PreviewUrl || featuredCard2Image}
                        alt="Card 2"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No image</div>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeaturedCard2File(e.target.files?.[0] || null)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </Form>
    </div>
  );
}
