import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAttributeThunk,
  createOptionTagThunk,
  deleteOptionTagThunk,
  updateOptionTagThunk,
  createItemAttributeThunk,
  deleteAttributeThunk,
  deleteItemAttributeThunk,
  duplicateAttributeThunk,
  getAllAttributesThunk,
  getOptionTagsThunk,
  updateAttributeThunk,
  updateItemAttributeThunk,
  mergeAttributeOptions,
} from "../../../store/attributes";
import { Modal, ModalBody } from "react-bootstrap";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";

function AllAttributes() {
  const dispatch = useDispatch();
  const attributes = useSelector((state) => state.attributes.attributes);
  const optionTags = useSelector((state) => state.attributes.optionTags || []);
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [require_number, setRequireNumber] = useState(0);
  const [attributeOptions, setAttributeOptions] = useState({
    name: "",
    chinese_name: "",
    price_modifier: 0,
    index: "",
    option_tag_id: "",
    image: null,
  });
  const [editAttributeOptions, setEditAttributeOptions] = useState({
    name: "",
    chinese_name: "",
    price_modifier: 0,
    index: "",
    option_tag_id: "",
    image: null,
    remove_image: false,
  });

  // State to manage the visibility of the modal and the selected attribute
  const [showModal, setShowModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [max_number, setMaxNumber] = useState(0);
  const [muti_allow, setMutiAllow] = useState(false);
  const [newOptionTagName, setNewOptionTagName] = useState("");
  const [newOptionTagIndex, setNewOptionTagIndex] = useState("");
  const [editingOptionTagId, setEditingOptionTagId] = useState(null);
  const [editingOptionTagName, setEditingOptionTagName] = useState("");
  const [editingOptionTagIndex, setEditingOptionTagIndex] = useState("");
  const [highlightedRows, setHighlightedRows] = useState({});
  const selectedAttributeOptionTags = optionTags
    .filter((tag) => Number(tag.item_attribute_id) === Number(selectedAttribute?.id))
    .sort((a, b) => {
      const aIndex = Number.isFinite(Number(a.index)) ? Number(a.index) : 0;
      const bIndex = Number.isFinite(Number(b.index)) ? Number(b.index) : 0;
      if (aIndex !== bIndex) return aIndex - bIndex;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  const sortedAttributeOptions = [...(selectedAttribute?.Item_Attribute_Options || [])].sort((a, b) => {
    const aIndex = Number.isFinite(Number(a.index)) ? Number(a.index) : 0;
    const bIndex = Number.isFinite(Number(b.index)) ? Number(b.index) : 0;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  useEffect(() => {
    dispatch(getAllAttributesThunk());
    dispatch(getOptionTagsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedAttribute?.id || !attributes?.length) return;
    const fresh = attributes.find(
      (attr) => Number(attr.id) === Number(selectedAttribute.id),
    );
    if (!fresh) return;

    setSelectedAttribute((prev) => {
      if (!prev || Number(prev.id) !== Number(fresh.id)) return fresh;

      return {
        ...fresh,
        Item_Attribute_Options: mergeAttributeOptions(
          prev.Item_Attribute_Options || [],
          fresh.Item_Attribute_Options || [],
        ),
      };
    });
  }, [attributes, selectedAttribute?.id]);

  const flashRow = (type, id) => {
    if (!id) return;

    const key = `${type}-${id}`;
    setHighlightedRows((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setHighlightedRows((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 1000);
  };

  // Function to handle the click event and show the modal with attribute options
  const handleAttributeClick = (attribute) => {
    if (showModal && Number(selectedAttribute?.id) === Number(attribute.id)) {
      setShowModal(false);
      return;
    }

    setSelectedAttribute(attribute);
    dispatch(getOptionTagsThunk(attribute.id));
    setShowModal(true);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowOptionModal(true);
    setEditAttributeOptions({
      ...option,
      option_tag_id: option.option_tag_id || "",
      image: null,
      remove_image: false,
    });
  };

  //handle add new attribute options
  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      const newOption = await dispatch(
        createItemAttributeThunk(selectedAttribute.id, attributeOptions),
      );
      if (newOption) {
        flashRow("option", newOption.id);
        setAttributeOptions({
          name: "",
          chinese_name: "",
          price_modifier: 0,
          index: "",
          option_tag_id: "",
          image: null,
        });

        // 🔁 Live update the modal
        setSelectedAttribute((prev) => ({
          ...prev,
          Item_Attribute_Options: [
            ...(prev.Item_Attribute_Options || []),
            newOption,
          ],
        }));
      } else {
        swal("Error", t("all_attr.alerts.fail_add_option"), "error");
      }
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_add_option"), "error");
    }
  };

  const handleAddOptionTag = async (e) => {
    e.preventDefault();
    const trimmed = newOptionTagName.trim();
    if (!trimmed || !selectedAttribute?.id) return;
    try {
      const newTag = await dispatch(createOptionTagThunk(trimmed, selectedAttribute.id, newOptionTagIndex));
      if (newTag?.id) {
        flashRow("tag", newTag.id);
        setNewOptionTagName("");
        setNewOptionTagIndex("");
        setAttributeOptions((prev) => ({
          ...prev,
          option_tag_id: newTag.id,
        }));
      }
    } catch (err) {
      swal("Error", "Failed to add option tag", "error");
    }
  };

  const handleDeleteOptionTag = async (tag, event) => {
    event.preventDefault();
    event.stopPropagation();

    swal({
      title: "Delete option tag?",
      text: `Options using "${tag.name}" will keep the option, but the tag will be removed.`,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (!willDelete) return;

      try {
        await dispatch(deleteOptionTagThunk(tag.id, selectedAttribute.id));
        await dispatch(getOptionTagsThunk(selectedAttribute.id));

        setAttributeOptions((prev) => ({
          ...prev,
          option_tag_id: Number(prev.option_tag_id) === Number(tag.id) ? "" : prev.option_tag_id,
        }));
        setEditAttributeOptions((prev) => ({
          ...prev,
          option_tag_id: Number(prev.option_tag_id) === Number(tag.id) ? "" : prev.option_tag_id,
        }));
        setSelectedAttribute((prev) => ({
          ...prev,
          Item_Attribute_Options: (prev.Item_Attribute_Options || []).map((option) =>
            Number(option.option_tag_id) === Number(tag.id)
              ? { ...option, option_tag_id: null, OptionTag: null }
              : option,
          ),
        }));
      } catch (err) {
        swal("Error", "Failed to delete option tag", "error");
      }
    });
  };

  const handleStartEditOptionTag = (tag, event) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingOptionTagId(tag.id);
    setEditingOptionTagName(tag.name);
    setEditingOptionTagIndex(tag.index ?? "");
  };

  const handleSaveOptionTag = async (tag, event) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmed = editingOptionTagName.trim();
    if (!trimmed) return;

    try {
      const updatedTag = await dispatch(updateOptionTagThunk(tag.id, trimmed, selectedAttribute.id, editingOptionTagIndex));
      flashRow("tag", updatedTag?.id || tag.id);
      setSelectedAttribute((prev) => ({
        ...prev,
        Item_Attribute_Options: (prev.Item_Attribute_Options || []).map((option) =>
          Number(option.option_tag_id) === Number(tag.id)
            ? { ...option, OptionTag: updatedTag }
            : option,
        ),
      }));
      setEditingOptionTagId(null);
      setEditingOptionTagName("");
      setEditingOptionTagIndex("");
    } catch (err) {
      swal("Error", "Failed to update option tag", "error");
    }
  };

  const handleDeleteOption = async (optionToDelete = selectedOption) => {
    if (!optionToDelete) return;

    try {
      swal({
        title: "Delete attribute option?",
        text: `Are you sure you want to delete "${optionToDelete.name}"? This cannot be undone.`,
        icon: "warning",
        buttons: ["Cancel", "Delete"],
        dangerMode: true,
      }).then(async (willDelete) => {
        if (willDelete) {
          await dispatch(
            deleteItemAttributeThunk(selectedAttribute.id, optionToDelete.id),
          );

          // Remove deleted option from local state
          setSelectedAttribute((prev) => ({
            ...prev,
            Item_Attribute_Options: prev.Item_Attribute_Options.filter(
              (opt) => opt.id !== optionToDelete.id,
            ),
          }));

          swal(t("all_attr.swal.deleted_title"), t("all_attr.swal.deleted_desc"), "success");
          if (selectedOption?.id === optionToDelete.id) {
            setShowOptionModal(false);
          }
        }
      });
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_del_option"), "error");
    }
  };

  const handleEditOption = async () => {
    try {
      const updatedOption = await dispatch(
        updateItemAttributeThunk(
          selectedAttribute.id,
          selectedOption.id,
          editAttributeOptions,
        ),
      );

      if (updatedOption) {
        flashRow("option", updatedOption.id);
        swal("Success", t("all_attr.alerts.success_update_option"), "success");

        // Update selectedAttribute with the updated option
        setSelectedAttribute((prev) => ({
          ...prev,
          Item_Attribute_Options: prev.Item_Attribute_Options.map((opt) =>
            opt.id === updatedOption.id ? updatedOption : opt,
          ),
        }));

        setShowOptionModal(false);
      } else {
        swal("Error", t("all_attr.alerts.fail_update_option"), "error");
      }
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_update_option"), "error");
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    try {
      let newAttribute = await dispatch(createAttributeThunk({ name }));
      if (newAttribute) {
        flashRow("attribute", newAttribute.id);
        setSelectedAttribute(newAttribute);
        setShowModal(true);
        dispatch(getOptionTagsThunk(newAttribute.id));
        swal("Success", t("all_attr.alerts.success_add_attr"), "success");
        setName("");
      } else {
        swal("Error", t("all_attr.alerts.fail_add_attr"), "error");
      }
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_add_attr"), "error");
    }
  };

  const handleDuplicateAttribute = async (e, attribute) => {
    e.stopPropagation();
    try {
      const duplicated = await dispatch(duplicateAttributeThunk(attribute.id));
      if (duplicated) {
        flashRow("attribute", duplicated.id);
        setSelectedAttribute(duplicated);
        setShowModal(true);
        await dispatch(getOptionTagsThunk(duplicated.id));
        swal("Success", "Modifier group duplicated.", "success");
      }
    } catch (err) {
      swal("Error", err.message || "Failed to duplicate attribute", "error");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      swal({
        title: t("all_attr.swal.sure"),
        text: t("all_attr.swal.del_attr_desc"),
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then(async (willDelete) => {
        if (willDelete) {
          dispatch(deleteAttributeThunk(id));
          swal(t("all_attr.swal.attr_deleted"), {
            icon: "success",
          });
        } else {
          swal(t("all_attr.swal.attr_safe"));
        }
      });
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_del_attr"), "error");
    }
  };
  const handleEditAttribute = (e, attribute) => {
    e.stopPropagation();
    setName(attribute.name);
    setRequireNumber(attribute.require_number);
    setMaxNumber(attribute.max_number);
    setMutiAllow(attribute.muti_allow);
    setShowEditModal(true);
    setSelectedAttribute(attribute);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setName("");
    setRequireNumber(0);
    setMaxNumber(0);
    setMutiAllow(false);
  }

  const handleSubmitEditAttribute = async (e) => {
    e.preventDefault();
    try {
      let updatedAttribute = await dispatch(
        updateAttributeThunk(
          name,
          require_number,
          selectedAttribute.id,
          max_number,
          muti_allow,
        ),
      );
      if (updatedAttribute) {
        flashRow("attribute", updatedAttribute.id || selectedAttribute.id);
        setSelectedAttribute((prev) => ({
          ...prev,
          ...updatedAttribute,
          Item_Attribute_Options:
            updatedAttribute.Item_Attribute_Options || prev?.Item_Attribute_Options || [],
        }));
        swal("Success", t("all_attr.alerts.success_update_attr"), "success");
        setShowEditModal(false);
        setName("");
        setRequireNumber(0);
        setMaxNumber(0);
        setMutiAllow(false);
      } else {
        swal("Error", t("all_attr.alerts.fail_update_attr"), "error");
      }
    } catch (err) {
      swal("Error", t("all_attr.alerts.fail_update_attr"), "error");
    }
  };

  const renderChildTable = () => {
    if (!selectedAttribute) return null;

    return (
      <div className="modifier-child-panel bg-white border-start border-4 border-primary">
        <div className="modifier-child-heading d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small text-uppercase">Child records</div>
            <h5 className="mb-0">{selectedAttribute.name} Options</h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Collapse
          </button>
        </div>

        <div className="modifier-tag-panel">
          <span className="modifier-tag-title">Filter Tags</span>
          <div className="modifier-tag-add">
            <input
              type="number"
              className="form-control form-control-sm modifier-tag-index-input"
              placeholder="#"
              value={newOptionTagIndex}
              onChange={(e) => setNewOptionTagIndex(e.target.value)}
            />
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Add tag, e.g. Mild"
              value={newOptionTagName}
              onChange={(e) => setNewOptionTagName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleAddOptionTag}
            >
              Add
            </button>
          </div>
          <div className="modifier-tag-list">
            {selectedAttributeOptionTags.length > 0 ? (
              selectedAttributeOptionTags.map((tag) => (
                <span
                  key={tag.id}
                  className={`modifier-tag-chip ${highlightedRows[`tag-${tag.id}`] ? "modifier-chip-flash" : ""}`}
                >
                  {Number(editingOptionTagId) === Number(tag.id) ? (
                    <>
                      <input
                        type="number"
                        className="form-control form-control-sm modifier-tag-index-input"
                        value={editingOptionTagIndex}
                        onChange={(event) => setEditingOptionTagIndex(event.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editingOptionTagName}
                        onChange={(event) => setEditingOptionTagName(event.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={(event) => handleSaveOptionTag(tag, event)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setEditingOptionTagId(null);
                          setEditingOptionTagName("");
                          setEditingOptionTagIndex("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="modifier-tag-index">#{tag.index ?? 0}</span>
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0"
                        onClick={(event) => handleStartEditOptionTag(tag, event)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={(event) => handleDeleteOptionTag(tag, event)}
                      >
                        ×
                      </button>
                    </>
                  )}
                </span>
              ))
            ) : (
              <span className="modifier-tag-empty">No tags yet. Add tags only when this attribute needs filtering.</span>
            )}
          </div>
        </div>

        <form onSubmit={handleAddOption}>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 64 }}>Index</th>
                  <th style={{ width: 130 }}>Image</th>
                  <th>Name</th>
                  <th>Secondary Name</th>
                  <th>Tag</th>
                  <th style={{ width: 150, minWidth: 150 }} className="text-end">Price</th>
                  <th className="text-end" style={{ minWidth: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-active">
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="1"
                      value={attributeOptions.index}
                      onChange={(e) =>
                        setAttributeOptions({
                          ...attributeOptions,
                          index: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) =>
                        setAttributeOptions({
                          ...attributeOptions,
                          image: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={t("all_attr.modal_add.ph_name")}
                      value={attributeOptions.name}
                      onChange={(e) =>
                        setAttributeOptions({
                          ...attributeOptions,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={t("all_attr.modal_add.ph_chinese")}
                      value={attributeOptions.chinese_name}
                      onChange={(e) =>
                        setAttributeOptions({
                          ...attributeOptions,
                          chinese_name: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={attributeOptions.option_tag_id}
                      onChange={(e) =>
                        setAttributeOptions({
                          ...attributeOptions,
                          option_tag_id: e.target.value,
                        })
                      }
                    >
                      <option value="">No tag</option>
                      {selectedAttributeOptionTags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <div className="input-group input-group-sm modifier-price-input">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control text-end"
                        placeholder={t("all_attr.modal_add.ph_cost")}
                        value={attributeOptions.price_modifier}
                        onChange={(e) =>
                          setAttributeOptions({
                            ...attributeOptions,
                            price_modifier: e.target.value,
                          })
                        }
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </td>
                  <td className="text-end">
                    <button type="submit" className="btn btn-sm btn-primary">
                      Add Option
                    </button>
                  </td>
                </tr>

                {sortedAttributeOptions.length > 0 ? (
                  sortedAttributeOptions.map((option) => (
                    <tr
                      key={option.id}
                      className={highlightedRows[`option-${option.id}`] ? "modifier-row-flash" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOptionClick(option)}
                    >
                      <td className="fw-semibold">{option.index ?? 0}</td>
                      <td>
                        {option.image_url ? (
                          <img
                            src={option.image_url}
                            alt={option.name}
                            className="modifier-thumb rounded border"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </td>
                      <td className="fw-semibold">{option.name}</td>
                      <td className="text-muted">{option.chinese_name || "-"}</td>
                      <td>
                        {option.option_tag_id ? (
                          <span className="badge bg-light text-dark border">
                            {option.OptionTag?.name || selectedAttributeOptionTags.find((tag) => Number(tag.id) === Number(option.option_tag_id))?.name || "Tagged"}
                          </span>
                        ) : (
                          <span className="text-muted small">No tag</span>
                        )}
                      </td>
                      <td className="text-end text-danger fw-bold">${option.price_modifier}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOptionClick(option);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteOption(option);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No options yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    );
  };

  return (
    <Fragment>
      <style>
        {`
          .modifier-manager-compact {
            font-size: 0.82rem;
          }
          .modifier-manager-compact h3 {
            font-size: 1.2rem;
            margin-bottom: 0.6rem !important;
          }
          .modifier-manager-compact h5 {
            font-size: 0.96rem;
          }
          .modifier-manager-compact .card-header {
            padding: 0.5rem 0.75rem;
          }
          .modifier-manager-compact .table {
            margin-bottom: 0;
          }
          .modifier-manager-compact .table > :not(caption) > * > * {
            padding: 0.28rem 0.42rem;
            vertical-align: middle;
          }
          .modifier-manager-compact .form-label {
            font-size: 0.72rem;
            margin-bottom: 0.2rem;
          }
          .modifier-manager-compact .form-control,
          .modifier-manager-compact .form-select,
          .modifier-manager-compact .input-group-text {
            min-height: 28px;
            padding: 0.18rem 0.4rem;
            font-size: 0.78rem;
          }
          .modifier-manager-compact .modifier-price-input {
            min-width: 130px;
            width: 100%;
            flex-wrap: nowrap;
          }
          .modifier-manager-compact .modifier-price-input .form-control {
            min-width: 88px;
            flex: 1 1 auto;
          }
          .modifier-manager-compact .modifier-price-input .input-group-text {
            flex: 0 0 auto;
          }
          .modifier-manager-compact .btn {
            padding: 0.18rem 0.45rem;
            font-size: 0.76rem;
            line-height: 1.25;
          }
          .modifier-manager-compact .btn-group-sm > .btn,
          .modifier-manager-compact .btn-sm {
            padding: 0.15rem 0.38rem;
            font-size: 0.72rem;
          }
          .modifier-manager-compact .badge {
            padding: 0.22rem 0.38rem;
            font-size: 0.68rem;
            font-weight: 600;
          }
          .modifier-manager-compact .modifier-child-panel {
            padding: 0.55rem !important;
          }
          .modifier-manager-compact .modifier-child-heading {
            margin-bottom: 0.45rem !important;
          }
          .modifier-manager-compact .modifier-tag-table {
            margin-bottom: 0.55rem !important;
          }
          .modifier-manager-compact .modifier-tag-panel {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            flex-wrap: wrap;
            padding: 0.38rem 0.45rem;
            margin-bottom: 0.55rem;
            background: #f8f9fb;
            border: 1px solid #e6e8ee;
            border-radius: 6px;
          }
          .modifier-manager-compact .modifier-tag-title {
            font-size: 0.68rem;
            font-weight: 700;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .modifier-manager-compact .modifier-tag-add {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            min-width: 220px;
          }
          .modifier-manager-compact .modifier-tag-list {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            flex-wrap: wrap;
            flex: 1;
          }
          .modifier-manager-compact .modifier-tag-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.16rem 0.25rem 0.16rem 0.45rem;
            background: #ffffff;
            border: 1px solid #d8dce5;
            border-radius: 999px;
            color: #2f3747;
            font-size: 0.72rem;
            line-height: 1.2;
          }
          .modifier-manager-compact .modifier-tag-chip input {
            width: 110px;
            height: 24px;
          }
          .modifier-manager-compact .modifier-tag-index-input {
            width: 56px !important;
            min-width: 56px;
          }
          .modifier-manager-compact .modifier-tag-index {
            color: #8a91a0;
            font-size: 0.68rem;
            font-weight: 700;
          }
          .modifier-manager-compact .modifier-tag-empty {
            color: #8a91a0;
            font-size: 0.72rem;
          }
          .modifier-manager-compact .modifier-row-flash,
          .modifier-manager-compact .modifier-row-flash > td {
            background-color: #fff3bf !important;
            transition: background-color 0.25s ease;
          }
          .modifier-manager-compact .modifier-chip-flash {
            background-color: #fff3bf !important;
            border-color: #f0c36d !important;
            box-shadow: 0 0 0 2px rgba(240, 195, 109, 0.25);
            transition: background-color 0.25s ease, box-shadow 0.25s ease;
          }
          .modifier-manager-compact .modifier-thumb {
            width: 34px !important;
            height: 34px !important;
          }
          .modifier-manager-compact .modifier-add-attr-form {
            margin-bottom: 0.75rem !important;
          }
          .modifier-manager-compact .text-muted.small {
            font-size: 0.72rem;
          }
        `}
      </style>
      <div className="container-fluid modifier-manager-compact">
        <h3>{t("all_attr.page.title")}</h3>

        <form
          className="row align-items-end modifier-add-attr-form"
          onSubmit={handleAddAttribute}
        >
          <div className="col-md-8">
            <label htmlFor="newAttr" className="form-label">
              Add New Attribute
            </label>
            <input
              type="text"
              className="form-control"
              id="newAttr"
              placeholder={t("all_attr.form.ph_new")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              Add Attribute
            </button>
          </div>
        </form>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">Modifier Attributes</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Attribute</th>
                  <th>Rules</th>
                  <th className="text-center">Options</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributes?.length > 0 ? (
                  attributes.map((attribute) => {
                    const isSelected = Number(selectedAttribute?.id) === Number(attribute.id);
                    return (
                      <Fragment key={attribute.id}>
                        <tr
                          className={`${isSelected ? "table-primary" : ""} ${highlightedRows[`attribute-${attribute.id}`] ? "modifier-row-flash" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleAttributeClick(attribute)}
                        >
                          <td className="fw-semibold">
                            <span className="me-2">{isSelected ? "▾" : "▸"}</span>
                            {attribute?.name}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border me-2">
                              Required: {attribute.require_number || 0}
                            </span>
                            <span className="badge bg-light text-dark border me-2">
                              Max: {attribute.max_number || 0}
                            </span>
                            <span className="badge bg-light text-dark border">
                              Multi: {attribute.muti_allow ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="text-center">
                            {(attribute.Item_Attribute_Options || []).length}
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAttributeClick(attribute);
                                }}
                              >
                                {isSelected ? "Close" : "Open"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={(e) => handleEditAttribute(e, attribute)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={(e) => handleDuplicateAttribute(e, attribute)}
                              >
                                Duplicate
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swal({
                                    title: t("all_attr.swal.sure"),
                                    text: "Once deleted, you will not be able to recover this attribute!",
                                    icon: "warning",
                                    buttons: [t("common.cancel"), t("all_attr.swal.btn_del")],
                                    dangerMode: true,
                                  }).then((willDelete) => {
                                    if (willDelete) {
                                      handleDelete(e, attribute.id);
                                    }
                                  });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isSelected && showModal ? (
                          <tr>
                            <td colSpan="4" className="p-0">
                              {renderChildTable()}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No modifier attributes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Edit Option */}
      <Modal
        centered
        show={showOptionModal}
        onHide={() => setShowOptionModal(false)}
        size="lg"
        className="modifier-manager-compact"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("all_attr.modal_edit.title")}</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <form className="mb-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">{t("all_attr.modal_edit.label_name")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={editAttributeOptions.name}
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Secondary Language (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={editAttributeOptions.chinese_name}
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      chinese_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t("all_attr.modal_edit.label_cost")}</label>
                <input
                  type="number"
                  className="form-control"
                  value={editAttributeOptions.price_modifier}
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      price_modifier: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Display Index</label>
                <input
                  type="number"
                  className="form-control"
                  value={editAttributeOptions.index ?? ""}
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      index: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Option Tag</label>
                <select
                  className="form-select"
                  value={editAttributeOptions.option_tag_id || ""}
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      option_tag_id: e.target.value,
                    })
                  }
                >
                  <option value="">No tag</option>
                  {selectedAttributeOptionTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Option Image</label>
                {selectedOption?.image_url && !editAttributeOptions.remove_image ? (
                  <div className="mb-2">
                    <img
                      src={selectedOption.image_url}
                      alt={selectedOption.name}
                      className="rounded border"
                      style={{ width: 96, height: 96, objectFit: "cover" }}
                    />
                  </div>
                ) : null}
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setEditAttributeOptions({
                      ...editAttributeOptions,
                      image: e.target.files?.[0] || null,
                      remove_image: false,
                    })
                  }
                />
                {selectedOption?.image_url ? (
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="removeOptionImage"
                      checked={!!editAttributeOptions.remove_image}
                      onChange={(e) =>
                        setEditAttributeOptions({
                          ...editAttributeOptions,
                          remove_image: e.target.checked,
                          image: null,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="removeOptionImage">
                      Remove current image
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          </form>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleEditOption}>
              Save
            </button>
            <button className="btn btn-danger" onClick={handleDeleteOption}>
              Delete
            </button>
          </div>
        </ModalBody>
      </Modal>

      {/* Modal: Edit Attribute Settings */}
      <Modal
        centered
        show={showEditModal}
        onHide={() => handleCloseEditModal()}
        size="lg"
        className="modifier-manager-compact"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("all_attr.modal_settings.title")}</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <form onSubmit={handleSubmitEditAttribute} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">{t("all_attr.modal_settings.label_name")}</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                How many options MUST be selected?
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 1"
                value={require_number}
                onChange={(e) => setRequireNumber(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                What’s the MAX options user can pick?
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 3"
                value={max_number}
                onChange={(e) => setMaxNumber(e.target.value)}
              />
            </div>
            <div className="col-md-6 form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={muti_allow}
                onChange={(e) => setMutiAllow(e.target.checked)}
                id="mutiAllowCheck"
              />
              <label className="form-check-label" htmlFor="mutiAllowCheck">
                Allow users to select the same option multiple times
              </label>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">
                Save Modify
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
}

export default AllAttributes;
