import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createToppingThunk, updateToppingThunk, deleteToppingThunk } from '../../../store/toppings';
import { getPizzasThunk } from '../../../store/customizablePizza';

const ToppingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toppingId } = useParams();
  const location = useLocation();

  // 获取从SpecialAttributes传递的数据
  const { selectedParentId, selectedParentName, toppingData } = location.state || {};

  const pizzas = useSelector((state) => state.customizablePizzas.allPizzas);
  const selectedParent = pizzas.find(p => p.id === selectedParentId) || {};

  const isEditing = !!toppingId;

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    detail: '',
    position: 'all',
    portion: 'normal',
    quantity: 1,
    isDefault: false,
    chinese: '',
    price: ''
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    dispatch(getPizzasThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isEditing && toppingData) {
      setFormData({
        name: toppingData.name || '',
        detail: toppingData.detail || '',
        position: toppingData.position || 'all',
        portion: toppingData.portion || 'normal',
        quantity: toppingData.quantity || 1,
        isDefault: toppingData.isDefault || false,
        chinese: toppingData.chinese || '',
        price: toppingData.price || ''
      });
    } else if (!isEditing && selectedParentId) {
      // 设置默认值
      setFormData({
        name: '',
        detail: '',
        position: 'all',
        portion: 'normal',
        quantity: 1,
        isDefault: false,
        chinese: '',
        price: ''
      });
    }
  }, [isEditing, toppingData, selectedParentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      detail: formData.detail,
      position: formData.position,
      portion: formData.portion,
      quantity: formData.quantity,
      isDefault: formData.isDefault,
      customizablePizzaId: parseInt(selectedParentId, 10),
      chinese: formData.chinese,
      price: formData.price
    };

    try {
      if (isEditing) {
        await dispatch(updateToppingThunk(toppingId, payload, image));
      } else {
        await dispatch(createToppingThunk(payload, image));
      }

      // 返回到SpecialAttributes页面
      navigate('/special-attributes');
    } catch (error) {
      console.error('Error saving topping:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this topping?')) {
      try {
        await dispatch(deleteToppingThunk(toppingId));
        // 返回到SpecialAttributes页面
        navigate('/special-attributes');
      } catch (error) {
        console.error('Error deleting topping:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/special-attributes');
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? 'Edit Topping' : 'Add New Topping'}</h2>
      </div>

      {selectedParentName && (
        <div className="alert alert-info">
          Adding topping for: <strong>{selectedParentName}</strong>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Topping Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Chinese Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="chinese"
                  value={formData.chinese}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Price Adjustment ($)</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
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
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Position</label>
                <select
                  className="form-select"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="all">All</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Portion</label>
                <select
                  className="form-select"
                  name="portion"
                  value={formData.portion}
                  onChange={handleChange}
                >
                  <option value="little">Little</option>
                  <option value="normal">Normal</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {isEditing && (
                <div className="form-text">If left empty, existing image is kept.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-control"
                name="detail"
                value={formData.detail}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label className="form-check-label">
                Set as Default Topping
              </label>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <div>
                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-danger me-2"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditing ? 'Update Topping' : 'Save Topping'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Toppings List */}
      {selectedParent.toppings && selectedParent.toppings.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">Toppings for {selectedParentName}</h5>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Chinese Name</th>
                    <th>Price</th>
                    <th>Details</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedParent.toppings.map((topping) => (
                    <tr key={topping.id}>
                      <td>
                        {topping.photo ? (
                          <img
                            src={topping.photo}
                            alt={topping.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <span className="text-muted small">No Img</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{topping.name}</span>
                          {topping.isDefault && <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem', width: 'fit-content' }}>Default</span>}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{topping.chinese}</span>
                          {topping.isDefault && <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem', width: 'fit-content' }}>Default</span>}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{topping.price}</span>
                          {topping.isDefault && <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem', width: 'fit-content' }}>Default</span>}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <span className="badge bg-info">Pos: {topping.position}</span>
                          <span className="badge bg-info">Port: {topping.portion}</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-link text-primary p-0 me-2"
                          onClick={() => {
                            // Navigate to edit this topping
                            navigate(`/topping-form/${topping.id}`, {
                              state: {
                                selectedParentId,
                                selectedParentName,
                                toppingData: topping
                              }
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this topping?')) {
                              try {
                                await dispatch(deleteToppingThunk(topping.id));
                                // Refresh the data
                                dispatch(getPizzasThunk());
                              } catch (error) {
                                console.error('Error deleting topping:', error);
                                alert('Failed to delete topping');
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingForm;
