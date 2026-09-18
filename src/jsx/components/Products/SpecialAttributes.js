import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPizzasThunk,
  createPizzaThunk,
  updatePizzaThunk,
  deletePizzaThunk
} from '../../../store/customizablePizza';
import {
  createCrustThunk,
  updateCrustThunk,
  deleteCrustThunk
} from '../../../store/crustTypes';
import {
  createToppingThunk,
  updateToppingThunk,
  deleteToppingThunk
} from '../../../store/toppings';

const SpecialAttributes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Select data from Redux store
  const pizzas = useSelector((state) => state.customizablePizzas.allPizzas);

  // --- Main Page State ---
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('selection'); // 'selection' or 'form'
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedParentName, setSelectedParentName] = useState('');
  const [optionType, setOptionType] = useState('crust'); // 'crust' or 'topping'

  // Helper to get the specific parent object (to access its nested crustTypes/options)
  const selectedParent = pizzas.find(p => p.id === selectedParentId);

  // --- Option Form State ---
  const [isEditingOption, setIsEditingOption] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [optionFormData, setOptionFormData] = useState({
    name: '',
    chinese: '',
    detail: '',
    quantity: 1,
    isDefault: false
  });
  const [optionImage, setOptionImage] = useState(null);
  // --- Main Pizza Form State ---
  const [formData, setFormData] = useState({
    name: '',
    detail: '',
    maxSelections: '',
    minSelections: '',
    allowMultiple: false,
    freeItems: 0
  });

  // Fetch data on load
  useEffect(() => {
    dispatch(getPizzasThunk());
  }, [dispatch]);

  // --- Main Form Handlers (Parent Item) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      maxSelections: formData.maxSelections === '' ? null : parseInt(formData.maxSelections),
      minSelections: formData.minSelections === '' ? null : parseInt(formData.minSelections),
      freeItems: parseInt(formData.freeItems) || 0
    };

    if (isEditing) {
      await dispatch(updatePizzaThunk(editId, payload));
    } else {
      await dispatch(createPizzaThunk(payload));
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm(t("special_attr.swal.del_config"))) {
      dispatch(deletePizzaThunk(id));
    }
  };

  const handleEditClick = (item) => {
    setFormData({
      name: item.name,
      detail: item.detail || '',
      maxSelections: item.maxSelections || '',
      minSelections: item.minSelections || '',
      allowMultiple: item.allowMultiple,
      freeItems: item.freeItems || 0
    });
    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      detail: '',
      maxSelections: '',
      minSelections: '',
      allowMultiple: false,
      freeItems: 0
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // --- Modal & Option Handlers ---

  const openManageModal = (item) => {
    setSelectedParentId(item.id);
    setSelectedParentName(item.name);
    setModalStep('selection');
    resetOptionForm();
    setShowModal(true);
  };

  const closeManageModal = () => {
    setShowModal(false);
    setSelectedParentId(null);
    resetOptionForm();
  };

  const resetOptionForm = () => {
    setOptionFormData({
      name: '',
      detail: '',
      price: '',
      quantity: 1,
      isDefault: false,
      position: 'all',
      portion: 'normal'
    });
    setOptionImage(null);
    setIsEditingOption(false);
    setEditingOptionId(null);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptionFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setOptionImage(e.target.files[0]);
    }
  };

  // Switch to Form Mode for Creating Crust
  const startCreateCrust = () => {
    resetOptionForm();
    setOptionType('crust');
    setModalStep('form');
  };

  // Navigate to Topping Form Page for Creating Topping
  const startCreateTopping = () => {
    navigate('/topping-form', {
      state: {
        selectedParentId,
        selectedParentName
      }
    });
  };

  // Switch to Form Mode for Editing Crust
  const startEditCrust = (option) => {
    setOptionFormData({
      name: option.name,
      chinese: option.chinese || '',
      detail: option.detail || '',
      price: option.price,
      quantity: option.quantity || 1,
      isDefault: option.isDefault,
      position: 'all',
      portion: 'normal'
    });
    setOptionType('crust');
    setOptionImage(null); // Reset image input (user must re-upload if they want to change it)
    setEditingOptionId(option.id);
    setIsEditingOption(true);
    setModalStep('form');
  };

  const handleDeleteOption = async (optionId, type) => {
    if (window.confirm(t("special_attr.swal.del_option"))) {
      if (type === 'topping') {
        await dispatch(deleteToppingThunk(optionId));
      } else {
        await dispatch(deleteCrustThunk(optionId));
      }
      // Refresh parent data to reflect changes in UI
      dispatch(getPizzasThunk());
    }
  };

  // Handle Option Submit
  const handleOptionSubmit = async (e) => {
    e.preventDefault();

    // 根据选项类型构建合适的载荷
    let payload;
    if (optionType === 'topping') {
      payload = {
        name: optionFormData.name,
        chinese: optionFormData.chinese,
        detail: optionFormData.detail,
        position: optionFormData.position,
        portion: optionFormData.portion,
        quantity: optionFormData.quantity,
        isDefault: optionFormData.isDefault,
        // 确保 customizablePizzaId 是整数类型
        customizablePizzaId: parseInt(selectedParentId, 10)
      };
    } else {
      payload = {
        name: optionFormData.name,
        chinese: optionFormData.chinese,
        detail: optionFormData.detail,
        price: optionFormData.price,
        quantity: optionFormData.quantity,
        isDefault: optionFormData.isDefault,
        // 确保 customizablePizzaId 是整数类型
        customizablePizzaId: parseInt(selectedParentId, 10)
      };
    }

    // 确保必需字段存在
    if (!payload.name || payload.name.trim() === '') {
      alert('Name is required');
      return;
    }

    if (!payload.customizablePizzaId) {
      alert('Customizable pizza ID is required');
      return;
    }

    // 对于两种类型，确保价格存在
    if (optionType !== 'topping') {
      if (payload.price === undefined || payload.price === null || payload.price === '') {
        alert('Price is required');
        return;
      }
    }

    try {
      if (isEditingOption) {
        if (optionType === 'topping') {
          await dispatch(updateToppingThunk(editingOptionId, payload, optionImage));
        } else {
          await dispatch(updateCrustThunk(editingOptionId, payload, optionImage));
        }
      } else {
        if (optionType === 'topping') {
          await dispatch(createToppingThunk(payload, optionImage));
        } else {
          await dispatch(createCrustThunk(payload, optionImage));
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message}`);
      return;
    }

    // Refresh parent list so the new/updated option appears immediately
    dispatch(getPizzasThunk());

    // Go back to list view
    setModalStep('selection');
    resetOptionForm();
  };

  return (
    <div className="container mt-5 mb-5 relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t("special_attr.page.title")}</h2>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            {t("special_attr.page.btn_create")}
          </button>
        )}
      </div>

      {/* --- MAIN FORM SECTION --- */}
      {showForm && (
        <div className="card shadow-sm mb-5">
          <div className="card-header bg-light">
            <h5 className="mb-0">{isEditing ? 'Edit Special Modify' : '{t("special_attr.page.btn_create")}'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Same Parent Form inputs as before */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("special_attr.form.label_name")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("special_attr.form.ph_name")}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{t("special_attr.form.label_desc")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="detail"
                    value={formData.detail}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">{t("special_attr.form.label_min")}</label>
                  <input
                    type="number"
                    className="form-control"
                    name="minSelections"
                    value={formData.minSelections}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">{t("special_attr.form.label_max")}</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxSelections"
                    value={formData.maxSelections}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">{t("special_attr.form.label_free")}</label>
                  <input
                    type="number"
                    className="form-control"
                    name="freeItems"
                    value={formData.freeItems}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="allowMultiple"
                      id="allowMultipleCheck"
                      checked={formData.allowMultiple}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="allowMultipleCheck">
                      {t("special_attr.form.allow_multi")}
                    </label>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>{t("common.cancel")}</button>
                <button type="submit" className="btn btn-primary">{isEditing ? t('special_attr.form.btn_update') : t('special_attr.form.btn_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIST SECTION --- */}
      <div className="row g-4">
        {pizzas && pizzas.length > 0 ? (
          pizzas.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title text-primary">{item.name}</h5>
                    <span className="badge bg-secondary">ID: {item.id}</span>
                  </div>
                  <p className="card-text text-muted small">{item.detail || t("special_attr.card.no_desc")}</p>
                  <hr />
                  <ul className="list-group list-group-flush small mb-3">
                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>{t("special_attr.card.range")}</span><strong>{item.minSelections || 0} - {item.maxSelections || '∞'}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>{t("special_attr.card.free")}</span><strong>{item.freeItems}</strong>
                    </li>
                  </ul>
                  <div className="d-flex gap-2 mb-3">
                     <span className="badge bg-info text-white">{(item.crustTypes?.length || 0) + (item.toppings?.length || 0)} {t("special_attr.card.options")}</span>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0 d-flex gap-2 flex-wrap">
                  <button className="btn btn-outline-dark btn-sm w-100 mb-2" onClick={() => openManageModal(item)}>
                    <i className="bi bi-gear me-1"></i> {t("special_attr.card.btn_manage")}
                  </button>
                  <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => handleEditClick(item)}>{t("common.edit")}</button>
                  <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5"><p className="text-muted">{t("special_attr.card.empty")}</p></div>
        )}
      </div>

      {/* --- MODAL FOR MANAGING OPTIONS --- */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                     {modalStep === 'form'
                        ? (isEditingOption ? t('special_attr.modal.title_edit') : t('special_attr.modal.title_new'))
                        : t("special_attr.modal.title_manage", { name: selectedParentName })
                     }
                  </h5>
                  <button type="button" className="btn-close" onClick={closeManageModal}></button>
                </div>
                <div className="modal-body">

                  {/* Step 1: Selection & List View */}
                  {modalStep === 'selection' && (
                    <>
                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mb-4">
                        <button
                          className="btn btn-outline-primary flex-grow-1"
                          onClick={startCreateCrust}
                        >
                          <i className="bi bi-fonts me-2"></i>
                          {t("special_attr.modal.btn_add_img")}
                        </button>
                        <button
                          className="btn btn-outline-primary flex-grow-1"
                          onClick={startCreateTopping}
                        >
                          <i className="bi bi-ui-checks me-2"></i>
                          {t("special_attr.modal.btn_add_topping")}
                        </button>
                      </div>

                      {/* Existing Options List */}

                      {selectedParent && (
                        <>
                          {/* Render Crust Types in Separate Table */}
                          {selectedParent.crustTypes && selectedParent.crustTypes.length > 0 &&
                           (
                            <>
                              <h6 className="border-bottom pb-2 mb-3">{t("special_attr.modal.table_img_title")}</h6>
                              <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                  <thead className="table-light">
                                    <tr>
                                      <th>{t("special_attr.modal.th_image")}</th>
                                      <th>{t("special_attr.modal.th_name")}</th>
                                      <th>{t("special_attr.modal.th_chinese")}</th>
                                      <th>{t("special_attr.modal.th_price")}</th>
                                      <th className="text-end">{t("special_attr.modal.th_actions")}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedParent.crustTypes.map((opt) => (
                                      <tr key={opt.id}>
                                        <td>
                                          {opt.photo ? (
                                            <img
                                              src={opt.photo}
                                              alt={opt.name}
                                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                          ) : (
                                            <span className="text-muted small">{t("special_attr.modal.no_img")}</span>
                                          )}
                                        </td>
                                        <td>
                                          <div className="d-flex flex-column">
                                            <span>{opt.name}</span>
                                            {opt.isDefault && <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem', width: 'fit-content' }}>{t("special_attr.modal.default")}</span>}
                                          </div>
                                        </td>
                                        <td>
                                          <div className="d-flex flex-column">
                                            <span>{opt.chinese}</span>
                                            {opt.isDefault && <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem', width: 'fit-content' }}>{t("special_attr.modal.default")}</span>}
                                          </div>
                                        </td>
                                        <td>${Number(opt.price || 0).toFixed(2)}</td>
                                        <td className="text-end">
                                          <button
                                            className="btn btn-sm btn-link text-primary p-0 me-2"
                                            onClick={() => startEditCrust(opt)}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            className="btn btn-sm btn-link text-danger p-0"
                                            onClick={() => handleDeleteOption(opt.id, 'crust')}
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {/* Render Toppings in Separate Table */}
{selectedParent.toppings && selectedParent.toppings.length > 0 && (
  <>
    <h6 className="border-bottom pb-2 mb-3 mt-4">{t("special_attr.modal.table_topping_title")}</h6>
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>{t("special_attr.modal.th_image")}</th>
            <th>{t("special_attr.modal.th_name")}</th>
            <th>{t("special_attr.modal.th_details")}</th>
            <th>{t("special_attr.modal.th_portion")}</th>
            <th>{t("special_attr.modal.th_price")}</th>
            <th className="text-end">{t("special_attr.modal.th_actions")}</th>
          </tr>
        </thead>
        <tbody>
          {selectedParent.toppings.map((top) => (
            <tr key={top.id}>
              <td>
                {top.photo ? (
                  <img
                    src={top.photo}
                    alt={top.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  <span className="text-muted small">{t("special_attr.modal.no_img")}</span>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-bold">{top.name}</span>
                  {top.chinese && <span className="text-muted small">{top.chinese}</span>}
                </div>
              </td>
              <td style={{ maxWidth: '200px' }}>
                <small className="text-truncate d-block">{top.detail || '{t("special_attr.modal.no_desc")}'}</small>
              </td>
              <td>
                <span className="badge bg-info me-1">{top.portion}</span>
                <span className="badge bg-secondary">{top.position}</span>
              </td>
              <td>${Number(top.price || 0).toFixed(2)}</td>
              <td className="text-end">
                {/* <button
                  className="btn btn-sm btn-link text-primary p-0 me-2"
                  // onClick={() => startEditTopping(top)} // Assuming you have an edit function for toppings
                >
                  Edit
                </button> */}
                <button
                  className="btn btn-sm btn-link text-danger p-0"
                  onClick={() => handleDeleteOption(top.id, 'topping')}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

{/* Updated Empty State Logic */}
{(!selectedParent.crustTypes?.length && !selectedParent.toppings?.length) && (
  <div className="text-center py-3 text-muted">
    {t("special_attr.modal.empty")}
  </div>
)}
                       

                          {/* Show message if no options exist */}
                          {(!selectedParent.crustTypes || selectedParent.crustTypes.length === 0) &&
                           (!selectedParent.toppings || selectedParent.toppings.length === 0) && (
                            <div className="text-center py-3 text-muted">
                              {t("special_attr.modal.empty")}
                            </div>
                          )}
                         
                        </>
                      )}
                    </>
                  )}

                  {/* Step 2: Form for Add/Edit Option */}
                  {modalStep === 'form' && optionType !== 'topping' && (
                    <form onSubmit={handleOptionSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">{t("special_attr.modal.form_name")}</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={optionFormData.name}
                            onChange={handleOptionChange}
                            required
                          />                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Chinese Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="chinese"
                            value={optionFormData.chinese}
                            onChange={handleOptionChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label className="form-label">{t("special_attr.modal.form_price")}</label>
                          <input
                            type="number"
                            className="form-control"
                            name="price"
                            value={optionFormData.price}
                            onChange={handleOptionChange}
                            step="0.01"
                            min="0"
                            onInput={(e) => {
                              let value = e.target.value;
                              if (value.includes('.')) {
                                const parts = value.split('.');
                                if (parts[1].length > 2) {
                                  e.target.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                                }
                              }
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">{t("special_attr.modal.th_image")} {isEditingOption && t("special_attr.modal.form_img_edit")}</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {isEditingOption && !optionImage && (
                           <div className="form-text">{t("special_attr.modal.form_img_hint")}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">{t("special_attr.form.label_desc")}</label>
                        <textarea
                          className="form-control"
                          name="detail"
                          value={optionFormData.detail}
                          onChange={handleOptionChange}
                          rows="2"
                        ></textarea>
                      </div>

                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isDefault"
                          checked={optionFormData.isDefault}
                          onChange={handleOptionChange}
                        />
                        <label className="form-check-label">
                          {t("special_attr.modal.form_default")}
                        </label>
                      </div>

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none"
                          onClick={() => setModalStep('selection')}
                        >
                          {t("special_attr.modal.btn_back")}
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {isEditingOption ? t('special_attr.modal.btn_update') : t('special_attr.modal.btn_save')}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpecialAttributes;
