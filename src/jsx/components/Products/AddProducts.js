import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCategoriesThunk } from "../../../store/categories";
import { addItemThunk, uploadSecondaryImageThunk } from "../../../store/items";
import { getAllAttributesThunk } from "../../../store/attributes";
import swal from "sweetalert";
import { FaPlus } from "react-icons/fa";
import IngredientSelectorModal from "./IngredientSelectorModal";

const IMAGE_SIZE_WARNING_BYTES = 800 * 1024; // 800KB
function formatImageSize(bytes) {
  if (bytes == null || bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
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

const availableFlags = [
  { id: "mild", name: "Mild (Spicy)", icon: "🌶️" },
  { id: "hot", name: "Medium (Spicy)", icon: "🌶️🌶️" },
  { id: "extrahot", name: "Hot (Spicy)", icon: "🌶️🌶️🌶️" },
  { id: "raw", name: "Raw", icon: "🐟" },
  { id: "nut_free", name: "Nut Free", icon: "🥜" },
  { id: "gluten_free", name: "Gluten Free", icon: "🫓" },
  { id: "dairy_free", name: "Dairy Free", icon: "🥛" },
  { id: "vegan", name: "Vegan", icon: "🌿" },
  { id: "vegetarian", name: "Vegetarian", icon: "🥦" },
  { id: "halal", name: "Halal", icon: "🕌" },
];

const defaultForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image: null,
  chinese_name: "",
};

function AddProducts({ show, onHide, onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.categories) || [];
  const attributes = useSelector((state) => state.attributes.attributes) || [];

  const [formData, setFormData] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [itemFlags, setItemFlags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [secondaryFiles, setSecondaryFiles] = useState({ 1: null, 2: null, 3: null });
  const [secondaryPreviews, setSecondaryPreviews] = useState({ 1: null, 2: null, 3: null });
  const [allIngredients, setAllIngredients] = useState([]); // Store all available ingredients for display
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]); // Store selected ingredient IDs
  const [showIngredientModal, setShowIngredientModal] = useState(false); // State for modal visibility

  useEffect(() => {
    if (show) {
      dispatch(getCategoriesThunk());
      dispatch(getAllAttributesThunk());
    }
  }, [show, dispatch]);

  useEffect(() => {
    if (!show) {
      setFormData(defaultForm);
      setImagePreview(null);
      setSelectedAttributes([]);
      setItemFlags([]);
      setSelectedIngredientIds([]);
      setSecondaryFiles({ 1: null, 2: null, 3: null });
      setSecondaryPreviews({ 1: null, 2: null, 3: null });
    }
  }, [show]);

  useEffect(() => {
    fetch("/api/ingredients?limit=9999")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setAllIngredients(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch all ingredients", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    warnImageSizeIfNeeded(file);
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const setSecondarySlot = (slot, file) => {
    warnImageSizeIfNeeded(file);
    setSecondaryFiles((prev) => ({ ...prev, [slot]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSecondaryPreviews((prev) => ({ ...prev, [slot]: reader.result }));
      reader.readAsDataURL(file);
    } else {
      setSecondaryPreviews((prev) => ({ ...prev, [slot]: null }));
    }
  };

  const handleSaveIngredients = (newSelectedIds) => {
    setSelectedIngredientIds(newSelectedIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newItem = await dispatch(
        addItemThunk(formData, selectedAttributes, itemFlags, selectedIngredientIds),
      );
      if (newItem && newItem.id) {
        for (const slot of [1, 2, 3]) {
          const file = secondaryFiles[slot];
          if (file) {
            await dispatch(uploadSecondaryImageThunk(newItem.id, String(slot), file));
          }
        }
        swal("Success!", "New product added.", "success");
        onSuccess?.();
        onHide?.();
      } else {
        swal("Error!", "Product not added. Try again.", "error");
      }
    } catch (err) {
      console.error(err);
      swal("Error!", "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedIngredientObjects = allIngredients.filter((ing) =>
    selectedIngredientIds.includes(ing.id),
  );

  return (
    <>
      <style>{`
        .add-modal .modal-content { border: none; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
        .add-modal .modal-header { border-bottom: 1px solid #eef0f2; padding: 1rem 1.25rem; }
        .add-modal .modal-title { font-size: 1.125rem; font-weight: 600; color: #1e293b; }
        .add-modal .modal-body { padding: 0; max-height: min(85vh, 640px); overflow-y: auto; }
        .add-modal .modal-footer { border-top: 1px solid #eef0f2; padding: 0.75rem 1.25rem; background: #f8fafc; }
        .add-modal__section { padding: 1rem 1.25rem; border-bottom: 1px solid #eef0f2; }
        .add-modal__section:last-of-type { border-bottom: none; }
        .add-modal__section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 0.75rem; }
        .add-modal__label { font-size: 0.8125rem; font-weight: 500; color: #334155; margin-bottom: 0.35rem; display: block; }
        .add-modal__input, .add-modal__select, .add-modal__textarea { border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9375rem; }
        .add-modal__input:focus, .add-modal__select:focus, .add-modal__textarea:focus { border-color: #dd2f6e; box-shadow: 0 0 0 3px rgba(221,47,110,0.15); }
        .add-modal__textarea { min-height: 80px; resize: vertical; }
        .add-modal__hint { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
        .add-modal__img-wrap { width: 88px; height: 88px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .add-modal__img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .add-modal__img-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .add-modal__secondary-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .add-modal__secondary-row:last-child { margin-bottom: 0; }
        .add-modal__secondary-slot { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .add-modal__secondary-slot img { width: 100%; height: 100%; object-fit: cover; }
        .add-modal__flags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .add-modal__flag { padding: 0.4rem 0.75rem; border-radius: 999px; font-size: 0.8125rem; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: all 0.15s; }
        .add-modal__flag:hover { border-color: #cbd5e1; background: #f8fafc; }
        .add-modal__flag.selected { background: #dd2f6e; border-color: #dd2f6e; color: #fff; }
        .add-modal__attr { padding: 0.4rem 0.75rem; border-radius: 999px; font-size: 0.8125rem; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: all 0.15s; }
        .add-modal__attr:hover { border-color: #cbd5e1; background: #f8fafc; }
        .add-modal__attr.selected { background: #dd2f6e; border-color: #dd2f6e; color: #fff; }
        .add-modal__btn-save { min-width: 140px; font-weight: 500; border-radius: 8px; }
      `}</style>
      <Modal show={show} onHide={onHide} centered className="add-modal" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add menu item</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit} id="add-product-form">
          <Modal.Body>
            <div className="add-modal__section">
              <div className="add-modal__section-title">Basic information</div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="add-modal__label">Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control add-modal__input" placeholder="e.g. Spring Roll" value={formData.name} name="name" onChange={handleInputChange} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="add-modal__label">Price <span className="text-danger">*</span></label>
                  <input type="number" className="form-control add-modal__input" placeholder="0.00" value={formData.price} name="price" onChange={handleInputChange} min="0" step="0.01" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="add-modal__label">Category <span className="text-danger">*</span></label>
                  <select className="form-select add-modal__select" value={formData.category_id} name="category_id" onChange={handleInputChange} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="add-modal__label">Second language name (optional)</label>
                  <input type="text" className="form-control add-modal__input" placeholder="e.g. 春卷" value={formData.chinese_name} name="chinese_name" onChange={handleInputChange} />
                </div>
                <div className="col-12">
                  <label className="add-modal__label">Description (optional)</label>
                  <textarea className="form-control add-modal__textarea" placeholder="Short description for the menu" value={formData.description} name="description" onChange={handleInputChange} rows={3} />
                </div>
              </div>
            </div>

            <div className="add-modal__section">
              <div className="add-modal__section-title">Main image (optional)</div>
              <p className="add-modal__hint mb-2 small text-muted">We recommend images under 800KB for best performance.</p>
              <div className="add-modal__img-row">
                {imagePreview && (
                  <>
                    <div className="add-modal__img-wrap"><img src={imagePreview} alt="Preview" /></div>
                    <div>
                      {formData.image && (
                        <p className="small text-muted mb-1">Size: {formatImageSize(formData.image.size)}</p>
                      )}
                      <input type="file" className="form-control form-control-sm mb-1" accept="image/*" onChange={handleImageChange} />
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeImage}>Remove</button>
                    </div>
                  </>
                )}
                {!imagePreview && (
                  <input type="file" className="form-control add-modal__input" style={{ maxWidth: 260 }} accept="image/*" onChange={handleImageChange} />
                )}
              </div>
            </div>

            <div className="add-modal__section">
              <div className="add-modal__section-title">Extra images (optional)</div>
              <p className="add-modal__hint mb-2">Up to 3 additional images. We recommend under 800KB per image.</p>
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="add-modal__secondary-row">
                  <span className="text-muted" style={{ width: 72, fontSize: "0.8125rem" }}>Image {slot}</span>
                  {secondaryPreviews[slot] && (
                    <div className="add-modal__secondary-slot"><img src={secondaryPreviews[slot]} alt="" /></div>
                  )}
                  {!secondaryPreviews[slot] && <span className="text-muted small">No image</span>}
                  {secondaryFiles[slot] && (
                    <>
                      <span className="small text-muted">Size: {formatImageSize(secondaryFiles[slot].size)}</span>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setSecondarySlot(slot, null)}>Remove</button>
                    </>
                  )}
                  <input type="file" className="form-control form-control-sm add-modal__input" accept="image/*" style={{ maxWidth: 200 }} onChange={(e) => setSecondarySlot(slot, e.target.files?.[0] || null)} />
                </div>
              ))}
            </div>

            <div className="add-modal__section">
              <div className="add-modal__section-title">Dietary &amp; allergens</div>
              <div className="add-modal__flags">
                {availableFlags.map((flag) => {
                  const isSelected = itemFlags.includes(flag.id);
                  return (
                    <button key={flag.id} type="button" className={`add-modal__flag ${isSelected ? "selected" : ""}`} onClick={() => setItemFlags((prev) => (isSelected ? prev.filter((f) => f !== flag.id) : [...prev, flag.id]))}>
                      {flag.icon} {flag.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="add-modal__section">
              <div className="add-modal__section-title">Ingredients / tags (optional)</div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {selectedIngredientObjects.map((ing) => (
                  <div
                    key={ing.id}
                    className="badge p-2 rounded-pill bg-info text-white d-flex align-items-center"
                    title={ing.description}
                  >
                    <span className="me-1">{ing.icon}</span>
                    {ing.name}
                    <Button
                      variant="link"
                      className="text-white p-0 ms-1"
                      style={{ lineHeight: 1, fontSize: "0.8em" }}
                      onClick={() =>
                        setSelectedIngredientIds((prev) => prev.filter((id) => id !== ing.id))
                      }
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => setShowIngredientModal(true)}
                >
                  <FaPlus className="me-1" /> Add ingredients
                </Button>
              </div>
            </div>

            <div className="add-modal__section">
              <div className="add-modal__section-title">Attributes (optional)</div>
              {attributes.length === 0 ? (
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => navigate("/attributes")}>
                  Add attributes first
                </button>
              ) : (
                <div className="add-modal__flags">
                  {attributes.map((attr) => {
                    const isSelected = selectedAttributes.includes(attr.id);
                    return (
                      <button
                        key={attr.id}
                        type="button"
                        className={`add-modal__attr ${isSelected ? "selected" : ""}`}
                        onClick={() =>
                          setSelectedAttributes((prev) =>
                            isSelected ? prev.filter((id) => id !== attr.id) : [...prev, attr.id],
                          )
                        }
                      >
                        {attr.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" form="add-product-form" className="add-modal__btn-save" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Adding…
                </>
              ) : (
                "Add to menu"
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <IngredientSelectorModal
        show={showIngredientModal}
        onHide={() => setShowIngredientModal(false)}
        onSave={handleSaveIngredients}
        initialSelectedIds={selectedIngredientIds}
      />
    </>
  );
}

export default AddProducts;
