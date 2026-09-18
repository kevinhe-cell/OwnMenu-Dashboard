import { useEffect, useState } from "react";
import { Button, Form, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { editItemThunk, updateDisableItemThunk, uploadSecondaryImageThunk, deleteSecondaryImageThunk } from "../../../store/items";
import { getCategoriesThunk } from "../../../store/categories";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
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

function EditProducts({
  showEditModal,
  selectedEditOption,
  selectEditItem,
  setShowEditModal,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: null,
    chinese_name: "",
    imageAction: "noChange",
    index: null
  });
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
  const [itemFlags, setItemFlags] = useState([]);
  
  // New state for ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]); // IDs
  const [selectedIngredientObjects, setSelectedIngredientObjects] = useState([]); // Full objects for display
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const categories = useSelector((state) => state.categories.categories);

  useEffect(() => {
    if (showEditModal && selectEditItem) {
      setFormData({
        name: selectEditItem.name,
        description: selectEditItem.description === "null" ? "" : (selectEditItem.description || ""),
        price: selectEditItem.price,
        category_id: selectEditItem.Category?.id ?? selectEditItem.category_id,
        chinese_name: selectEditItem.chinese_name === "null" ? "" : (selectEditItem.chinese_name || ""),
        image: null,
        index: selectEditItem.index
      });

      if (selectEditItem?.image_url) {
        setImagePreview(selectEditItem?.image_url);
      }

      if (selectEditItem?.flags && selectEditItem.flags.length > 0) {
        setItemFlags(selectEditItem.flags);
      } else {
        setItemFlags([]);
      }

      // ✅ Initialize selected ingredients
      if (selectEditItem?.Ingredients) {
        setSelectedIngredients(selectEditItem.Ingredients.map(ing => ing.id));
        setSelectedIngredientObjects(selectEditItem.Ingredients);
      } else {
        setSelectedIngredients([]);
        setSelectedIngredientObjects([]);
      }
      setSecondarySlots({
        1: { url: selectEditItem.secondary_image_url_1 || null, file: null, remove: false },
        2: { url: selectEditItem.secondary_image_url_2 || null, file: null, remove: false },
        3: { url: selectEditItem.secondary_image_url_3 || null, file: null, remove: false },
      });
      setSecondaryPreviews({ 1: null, 2: null, 3: null });

    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image: null,
        chinese_name: "",
        index: null
      });
      setSecondarySlots({ 1: { url: null, file: null, remove: false }, 2: { url: null, file: null, remove: false }, 3: { url: null, file: null, remove: false } });
      setSecondaryPreviews({ 1: null, 2: null, 3: null });
      setSelectedIngredients([]);
      setSelectedIngredientObjects([]);
    }
  }, [showEditModal, selectEditItem]);

  useEffect(() => {
    dispatch(getCategoriesThunk());
  }, [dispatch]);

  const [imagePreview, setImagePreview] = useState(null);
  // Per-slot state: { url (current), file (new file to upload on save), remove (mark for delete on save) }
  const [secondarySlots, setSecondarySlots] = useState({ 1: { url: null, file: null, remove: false }, 2: { url: null, file: null, remove: false }, 3: { url: null, file: null, remove: false } });
  const [secondaryPreviews, setSecondaryPreviews] = useState({ 1: null, 2: null, 3: null });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    warnImageSizeIfNeeded(file);
    setFormData((prevData) => ({
      ...prevData,
      image: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setFormData((prevData) => ({
      ...prevData,
      image: null,
      imageAction: "deleteImage",
    }));
    setImagePreview(null);
  };

  const setSecondarySlot = (slot, update) => {
    if (update.file !== undefined) warnImageSizeIfNeeded(update.file);
    setSecondarySlots((prev) => ({ ...prev, [slot]: { ...prev[slot], ...update } }));
    if (update.file !== undefined) {
      if (update.file) {
        const reader = new FileReader();
        reader.onloadend = () => setSecondaryPreviews((p) => ({ ...p, [slot]: reader.result }));
        reader.readAsDataURL(update.file);
      } else {
        setSecondaryPreviews((p) => ({ ...p, [slot]: null }));
      }
    }
  };
  const handleSaveIngredients = (newSelectedIds, newSelectedObjects) => {
    setSelectedIngredients(newSelectedIds);
    // Note: IngredientSelectorModal might not return full objects for all IDs if they weren't on the current page.
    // But for now, we rely on what it returns or what we already had.
    // A robust solution would be to fetch details for these IDs if objects are missing, 
    // but for simplicity, we'll try to merge with existing known objects.
    
    // Actually, since we only need to display them, and the modal (in my previous implementation) 
    // didn't strictly return all objects, we might have a display issue for newly added items 
    // if we don't fetch them.
    // Let's assume for now we just display IDs or fetch them.
    // To fix the display issue properly:
    // We can fetch all ingredients once (like AddProducts did) OR fetch specific IDs.
    // Let's fetch all ingredients once here too, just for display lookup.
    
    // Wait, I removed the fetch all logic. Let's add it back just for lookup map.
  };
  
  // Fetch all ingredients for lookup map (to display names of selected IDs)
  const [allIngredientsMap, setAllIngredientsMap] = useState({});
  useEffect(() => {
      fetch("/api/ingredients?limit=9999")
        .then(res => res.json())
        .then(data => {
            if(data.data) {
                const map = {};
                data.data.forEach(ing => map[ing.id] = ing);
                setAllIngredientsMap(map);
            }
        })
        .catch(err => console.error(err));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await dispatch(
        editItemThunk(selectEditItem.id, formData, itemFlags, selectedIngredients),
      );
      if (response && response.status === 200) {
        const itemId = selectEditItem.id;
        for (const slot of [1, 2, 3]) {
          const s = secondarySlots[slot];
          if (s.remove && s.url) {
            await dispatch(deleteSecondaryImageThunk(itemId, String(slot)));
          } else if (s.file) {
            await dispatch(uploadSecondaryImageThunk(itemId, String(slot), s.file));
          }
        }
        swal("Item updated successfully", { icon: "success" });
        setShowEditModal(false);
      } else {
        swal("Failed to update item", { icon: "error" });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      swal("Failed to update item", { icon: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (name) => {
    try {
      if (name === "marketprice") {
        if (!selectEditItem.market_price && !selectEditItem.menu_only) {
          throw new Error(
            "Menu Only must be enabled when Market Price is enabled.",
          );
        }
      }
      if (name === "menuonly") {
        if (selectEditItem.menu_only && selectEditItem.market_price) {
          throw new Error(
            "You cannot disable 'Menu Only' while 'Market Price' is enabled.",
          );
        }
        if (+selectEditItem.price <= 0) {
          throw new Error(
            "Price is 0 or less. Please update the price to a value greater than 0 before disabling 'Menu Only'.",
          );
        }
      }

      await dispatch(updateDisableItemThunk(selectEditItem.id, name));
      swal(`Success! Item ${name} toggled.`);
      setShowEditModal(false);
    } catch (error) {
      console.error("Toggle failed:", error);
      swal(
        "Error!",
        error.message || `Failed to toggle item ${name}. Please try again.`,
        "error",
      );
    }
  };

  const infoDescriptions = {
    disable: "Hides this item from your storefront. It won’t appear to customers.",
    soldout: "Marks the item as sold out—visible but not available for order.",
    menuonly: "Shows on the menu only (not orderable).",
    marketprice: "Price varies based on market availability.",
    hot: "Shows at the top of its category.",
    popular: "Appears in the Popular category on your menu.",
    newitem: "Marks the item as a new arrival.",
    mustorder: "Marks the item as a highly recommended signature dish."
  };

  const toggles = [
    ["Market Price", selectEditItem?.market_price, "marketprice"],
    ["Hide Item", selectEditItem?.hidden, "disable"],
    ["Sold Out", selectEditItem?.sold_out, "soldout"],
    ["Menu Only", selectEditItem?.menu_only, "menuonly"],
    ["Hot Item", selectEditItem?.hot_item, "hot"],
    ["Popular", selectEditItem?.popular_category, "popular"],
    ["New Item", selectEditItem?.new_item, "newitem"],
    ["Must Order", selectEditItem?.must_order, "mustorder"],
  ];

  const renderToggle = (label, checked, name) => (
    <div key={name} className="edit-modal__toggle">
      <Form.Check
        type="switch"
        id={`switch-${name}`}
        label={label}
        checked={checked}
        onChange={() => handleToggle(name)}
        className="edit-modal__switch"
      />
      <OverlayTrigger placement="top" overlay={<Tooltip id={`tip-${name}`}>{infoDescriptions[name]}</Tooltip>}>
        <span className="edit-modal__info-icon" aria-label="Info"><FaInfoCircle /></span>
      </OverlayTrigger>
    </div>
  );

  return (
    <>
      <style>{`
        .edit-modal .modal-content { border: none; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
        .edit-modal .modal-header { border-bottom: 1px solid #eef0f2; padding: 1rem 1.25rem; }
        .edit-modal .modal-title { font-size: 1.125rem; font-weight: 600; color: #1e293b; }
        .edit-modal .modal-body { padding: 0; max-height: min(85vh, 640px); overflow-y: auto; }
        .edit-modal .modal-footer { border-top: 1px solid #eef0f2; padding: 0.75rem 1.25rem; background: #f8fafc; }
        .edit-modal__section { padding: 1rem 1.25rem; border-bottom: 1px solid #eef0f2; }
        .edit-modal__section:last-of-type { border-bottom: none; }
        .edit-modal__section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 0.75rem; }
        .edit-modal__toggles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem 1rem; }
        @media (min-width: 576px) { .edit-modal__toggles { grid-template-columns: repeat(3, 1fr); } }
        .edit-modal__toggle { display: flex; align-items: center; gap: 0.35rem; }
        .edit-modal__switch { margin-bottom: 0; }
        .edit-modal__info-icon { color: #94a3b8; font-size: 0.875rem; cursor: help; }
        .edit-modal__label { font-size: 0.8125rem; font-weight: 500; color: #334155; margin-bottom: 0.35rem; display: block; }
        .edit-modal__input, .edit-modal__select, .edit-modal__textarea { border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9375rem; }
        .edit-modal__input:focus, .edit-modal__select:focus, .edit-modal__textarea:focus { border-color: #dd2f6e; box-shadow: 0 0 0 3px rgba(221,47,110,0.15); }
        .edit-modal__textarea { min-height: 80px; resize: vertical; }
        .edit-modal__hint { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
        .edit-modal__img-wrap { width: 88px; height: 88px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .edit-modal__img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .edit-modal__img-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .edit-modal__img-actions { display: flex; flex-direction: column; gap: 0.35rem; }
        .edit-modal__secondary-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .edit-modal__secondary-row:last-child { margin-bottom: 0; }
        .edit-modal__secondary-slot { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .edit-modal__secondary-slot img { width: 100%; height: 100%; object-fit: cover; }
        .edit-modal__flags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .edit-modal__flag { padding: 0.4rem 0.75rem; border-radius: 999px; font-size: 0.8125rem; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: all 0.15s; }
        .edit-modal__flag:hover { border-color: #cbd5e1; background: #f8fafc; }
        .edit-modal__flag.selected { background: #dd2f6e; border-color: #dd2f6e; color: #fff; }
        .edit-modal__btn-save { min-width: 140px; font-weight: 500; border-radius: 8px; }
      `}</style>
      <Modal show={showEditModal} onHide={selectedEditOption} centered className="edit-modal" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit menu item</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} id="edit-product-form">
            {/* Visibility & status */}
            <div className="edit-modal__section">
              <div className="edit-modal__section-title">Visibility &amp; status</div>
              <div className="edit-modal__toggles">
                {toggles.map(([label, checked, name]) => renderToggle(label, checked, name))}
              </div>
            </div>

            {/* Basic info */}
            <div className="edit-modal__section">
              <div className="edit-modal__section-title">Basic information</div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="edit-modal__label">Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control edit-modal__input" placeholder="e.g. Spring Roll" value={formData.name} name="name" onChange={handleInputChange} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="edit-modal__label">Price <span className="text-danger">*</span></label>
                  <input type="number" className="form-control edit-modal__input" placeholder="0.00" value={formData.price} name="price" onChange={handleInputChange} min="0" step="0.01" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="edit-modal__label">Category <span className="text-danger">*</span></label>
                  <select className="form-select edit-modal__select" value={formData.category_id} name="category_id" onChange={handleInputChange} required>
                    <option value="">Select category</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="edit-modal__label">Second language name (optional)</label>
                  <input type="text" className="form-control edit-modal__input" placeholder="e.g. 春卷" value={formData.chinese_name} name="chinese_name" onChange={handleInputChange} />
                </div>
                <div className="col-12">
                  <label className="edit-modal__label">Description</label>
                  <textarea className="form-control edit-modal__textarea" placeholder="Short description for the menu" value={formData.description} name="description" onChange={handleInputChange} rows={3} />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="edit-modal__label" htmlFor="edit-index">Display order</label>
                  <input type="number" id="edit-index" className="form-control edit-modal__input" placeholder="0" value={formData.index} name="index" onChange={handleInputChange} min="0" max="1000" step="1" required />
                  <span className="edit-modal__hint">Lower numbers appear first in the menu. Items with the same number are sorted alphabetically.</span>
                </div>
              </div>
            </div>

            {/* Main image */}
            <div className="edit-modal__section">
              <div className="edit-modal__section-title">Main image</div>
              <p className="edit-modal__hint mb-2 small text-muted">We recommend images under 800KB for best performance.</p>
              <div className="edit-modal__img-row">
                {imagePreview && (
                  <>
                    <div className="edit-modal__img-wrap">
                      <img src={imagePreview} alt="Current" />
                    </div>
                    <div className="edit-modal__img-actions">
                      {formData.image && (
                        <p className="small text-muted mb-1">Size: {formatImageSize(formData.image.size)}</p>
                      )}
                      <input type="file" className="form-control form-control-sm" accept="image/*" name="image" onChange={handleImageChange} />
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeImage}>Remove image</button>
                    </div>
                  </>
                )}
                {!imagePreview && (
                  <input type="file" className="form-control edit-modal__input" style={{ maxWidth: 260 }} accept="image/*" name="image" onChange={handleImageChange} />
                )}
              </div>
            </div>

            {/* Extra images */}
            <div className="edit-modal__section">
              <div className="edit-modal__section-title">Extra images (optional)</div>
              <p className="edit-modal__hint mb-2">Up to 3 additional images. Changes apply when you save. We recommend under 800KB per image.</p>
              {[1, 2, 3].map((slot) => {
                const s = secondarySlots[slot];
                const showUrl = s.url && !s.remove && !s.file;
                const showPreview = s.file && secondaryPreviews[slot];
                return (
                  <div key={slot} className="edit-modal__secondary-row">
                    <span className="text-muted" style={{ width: 72, fontSize: "0.8125rem" }}>Image {slot}</span>
                    {(showUrl || showPreview) && (
                      <div className="edit-modal__secondary-slot">
                        <img src={showPreview ? secondaryPreviews[slot] : s.url} alt={showPreview ? "New" : "Current"} />
                      </div>
                    )}
                    {!showUrl && !showPreview && <span className="text-muted small">No image</span>}
                    {s.file && <span className="small text-muted">Size: {formatImageSize(s.file.size)}</span>}
                    {(s.url || s.file) && !s.remove && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setSecondarySlot(slot, { file: null, remove: true })}>Remove</button>
                    )}
                    {s.remove && s.url && <span className="text-muted small">(removed on save)</span>}
                    <input type="file" className="form-control form-control-sm edit-modal__input" accept="image/*" style={{ maxWidth: 200 }} onChange={(e) => { const f = e.target.files?.[0]; setSecondarySlot(slot, { file: f || null, remove: false }); e.target.value = ""; }} />
                  </div>
                );
              })}
            </div>

            {/* Dietary & allergens */}
            <div className="edit-modal__section">
              <div className="edit-modal__section-title">Dietary &amp; allergens</div>
              <div className="edit-modal__flags">
                {availableFlags.map((flag) => {
                  const isSelected = itemFlags.includes(flag.id);
                  return (
                    <button key={flag.id} type="button" className={`edit-modal__flag ${isSelected ? "selected" : ""}`} onClick={() => setItemFlags((prev) => (isSelected ? prev.filter((f) => f !== flag.id) : [...prev, flag.id]))}>
                      {flag.icon} {flag.name}
                    </button>
                  );
                })}
              

                  {/* Ingredients Selection UI */}
                

              </div>
                <div className="mb-3">
                    <label className="mb-2">Ingredients / Tags</label>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {selectedIngredients.map((id) => {
                        const ing = allIngredientsMap[id];
                        if (!ing) return null;
                        return (
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
                              style={{ lineHeight: 1, fontSize: '0.8em' }}
                              onClick={() => setSelectedIngredients(prev => prev.filter(pid => pid !== ing.id))}
                            >
                              &times;
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => setShowIngredientModal(true)}
                      >
                        <FaPlus className="me-1" /> Add Ingredients
                      </Button>
                    </div>
                  </div>
            </div>
            </form>
      
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={selectedEditOption}>Cancel</Button>
          <Button type="submit" form="edit-product-form" className="edit-modal__btn-save" variant="primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </Modal.Footer>
    </Modal>

    {/* Ingredient Selector Modal */}
    <IngredientSelectorModal
        show={showIngredientModal}
        onHide={() => setShowIngredientModal(false)}
        onSave={(ids) => setSelectedIngredients(ids)}
        initialSelectedIds={selectedIngredients}
    />
    </>
  );
}

export default EditProducts;
