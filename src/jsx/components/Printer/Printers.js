import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategoryThunk,
  addItemPrintersThunk,
  deleteCategoryThunk,
  deleteItemPrintersThunk,
  getPrintersThunk,
} from "../../../store/printers";
import { Modal, Button, Collapse, Form, Spinner } from "react-bootstrap";
import { getItemsThunk } from "../../../store/items";
import { useTranslation } from "react-i18next";

function DisplayPrinter() {
  const dispatch = useDispatch();
  const printers = useSelector((state) => state.printers.printers);
  const user = useSelector((state) => state.session.user);
  const items = useSelector((state) => state.items.items);
  const { t } = useTranslation();

  const [editPrinterModal, setEditPrinterModal] = useState(false);
  const [openCategory, setOpenCategory] = useState({});
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchPrinter, setSearchPrinter] = useState("");
  const [searchItem, setSearchItem] = useState("");

  useEffect(() => {
    setLoading(true);
    dispatch(getPrintersThunk(user?.restaurant_id)).then(() =>
      setLoading(false),
    );
    if (!items.length) {
      setLoading(true);
      dispatch(getItemsThunk()).then(() => setLoading(false));
    }
  }, [dispatch, user?.restaurant_id, items.length]);

  useEffect(() => {
    if (currentPrinter) {
      const updatedPrinter = printers.find(
        (printer) => printer.id === currentPrinter.id,
      );
      if (updatedPrinter) {
        setCurrentPrinter(updatedPrinter);
      }
    }
  }, [printers]);

  // Filter printers by searchPrinter
  const filteredPrinters = printers.filter((printer) => {
    const term = searchPrinter.toLowerCase().trim();
    if (!term) return true;
    return (
      printer.name?.toLowerCase().includes(term) ||
      printer.ip?.toLowerCase().includes(term)
    );
  });

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const categoryName = item.Category?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  // Filter items in Modal by searchItem
  const filteredItemsByCategory = Object.keys(itemsByCategory).reduce((acc, category) => {
    const term = searchItem.toLowerCase().trim();
    if (!term) {
      acc[category] = itemsByCategory[category];
      return acc;
    }
    const matchingItems = itemsByCategory[category].filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(term);
      const chineseNameMatch = item.chinese_name?.toLowerCase().includes(term);
      const categoryMatch = category.toLowerCase().includes(term);
      return nameMatch || chineseNameMatch || categoryMatch;
    });
    if (matchingItems.length > 0) {
      acc[category] = matchingItems;
    }
    return acc;
  }, {});

  const getCategoryLanguageNames = (categoryName, firstItem) => {
    if (!categoryName) return { primary: "", secondary: "" };
    const parts = categoryName.split("/");
    if (parts.length > 1) {
      return {
        primary: parts[0].trim(),
        secondary: parts[1].trim(),
      };
    }
    return {
      primary: categoryName,
      secondary: firstItem?.Category?.description || "",
    };
  };

  const toggleCategory = (category) => {
    setOpenCategory((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  const handleSelectAllItemForCategory = async (id) => {
    setLoading(true);
    try {
      await dispatch(addCategoryThunk(currentPrinter.id, id))
        .then(() => {
          dispatch(getPrintersThunk(user?.restaurant_id));
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUnselectAllItemForCategory = async (id) => {
    setLoading(true);
    try {
      await dispatch(deleteCategoryThunk(currentPrinter.id, id))
        .then(() => {
          dispatch(getPrintersThunk(user?.restaurant_id));
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSelectAnItem = async (id) => {
    setLoading(true);
    try {
      await dispatch(addItemPrintersThunk(currentPrinter.id, id))
        .then(() => {
          dispatch(getPrintersThunk(user?.restaurant_id));
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUnselectAnItem = async (id) => {
    setLoading(true);
    try {
      await dispatch(deleteItemPrintersThunk(currentPrinter.id, id))
        .then(() => {
          dispatch(getPrintersThunk(user?.restaurant_id));
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleCheckAction = (itemId) => {
    if (isItemChecked(itemId)) {
      handleUnselectAnItem(itemId);
    } else {
      handleSelectAnItem(itemId);
    }
  };

  const isItemChecked = (itemId) => {
    return (
      currentPrinter && currentPrinter.Items.some((item) => item.id === itemId)
    );
  };

  const isAllSelected = (category) => {
    const itemsInCategory = itemsByCategory[category];
    return itemsInCategory.every((item) => isItemChecked(item.id));
  };

  const isNoneSelected = (category) => {
    const itemsInCategory = itemsByCategory[category];
    return itemsInCategory.every((item) => !isItemChecked(item.id));
  };

  const getSelectedCount = (category) => {
    const itemsInCategory = itemsByCategory[category];
    return itemsInCategory.filter((item) => isItemChecked(item.id)).length;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <h1 className="mb-0">{t("printers_setting.title")}</h1>
        <div style={{ maxWidth: "320px", width: "100%" }}>
          <Form.Control
            type="text"
            placeholder={t("printers_setting.search_placeholder") || "Search printer..."}
            value={searchPrinter}
            onChange={(e) => setSearchPrinter(e.target.value)}
          />
        </div>
      </div>

      {printers.length === 0 && (
        <>
          <span className="text-danger">{t("printers_setting.empty.title")}</span>
          <p>{t("printers_setting.empty.desc")}</p>
        </>
      )}

      {printers.length > 0 && filteredPrinters.length === 0 && (
        <p className="text-muted">{t("search_no_results") || "No matching printers found."}</p>
      )}

      <ul className="list-group">
        {filteredPrinters.map((printer) => (
          <li
            key={printer.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <h3 className="h5 mb-1">{printer.name}</h3>
              <p className="mb-0">{printer.ip}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setCurrentPrinter(printer);
                setEditPrinterModal(true);
              }}
            >
              Edit
            </Button>
          </li>
        ))}
      </ul>
      <Modal
        show={editPrinterModal}
        onHide={() => {
          setEditPrinterModal(false);
          setSearchItem("");
        }}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("printers_setting.modal.title_edit")}{currentPrinter?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder={t("printers_setting.modal.search_placeholder") || "Search items or categories..."}
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
          </div>

          {Object.keys(filteredItemsByCategory).length === 0 ? (
            <p className="text-muted text-center py-3">
              {searchItem ? (t("search_no_results") || "No matching items found.") : ""}
            </p>
          ) : (
            Object.keys(filteredItemsByCategory).map((category) => {
              const firstItem = itemsByCategory[category][0];
              const { primary, secondary } = getCategoryLanguageNames(category, firstItem);
              const isSearching = Boolean(searchItem.trim());
              const isOpen = isSearching || Boolean(openCategory[category]);
              return (
                <div key={category} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      onClick={() => toggleCategory(category)}
                      aria-controls={`collapse-${category}`}
                      aria-expanded={isOpen}
                      style={{ cursor: "pointer" }}
                    >
                      <h5 className="mb-0 fw-semibold">
                        {primary} ({getSelectedCount(category)} /{" "}
                        {itemsByCategory[category].length})
                      </h5>
                      {secondary && (
                        <div className="text-muted small mt-1">
                          {secondary}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <Button
                        variant="success"
                        onClick={() =>
                          handleSelectAllItemForCategory(
                            itemsByCategory[category][0].Category.id,
                          )
                        }
                        disabled={isAllSelected(category)}
                      >
                        {t("printers_setting.modal.btn_select_all") || "Select All"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleUnselectAllItemForCategory(
                            itemsByCategory[category][0].Category.id,
                          )
                        }
                        disabled={isNoneSelected(category)}
                      >
                        {t("printers_setting.modal.btn_unselect_all") || "Unselect All"}
                      </Button>
                    </div>
                  </div>
                  <Collapse in={isOpen}>
                    <div id={`collapse-${category}`}>
                      {filteredItemsByCategory[category].map((item) => (
                        <Form.Check
                          key={item.id}
                          type="checkbox"
                          label={item.chinese_name ? `${item.name} / ${item.chinese_name}` : item.name}
                          className="mb-2"
                          checked={isItemChecked(item.id)}
                          onChange={() => handleCheckAction(item.id)}
                        />
                      ))}
                    </div>
                  </Collapse>
                </div>
              );
            })
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setEditPrinterModal(false);
              setSearchItem("");
            }}
          >
            {loading ? (
              <div className="loading-overlay">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              "Close"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DisplayPrinter;
