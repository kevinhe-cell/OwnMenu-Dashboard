import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getItemsThunk } from "../../../store/items";
import { getToken } from "../../../store/utlits";

function IndeterminateSwitch({ id, checked, indeterminate, label, onChange, disabled, loading }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <div className="form-check form-switch m-0">
      <input
        ref={ref}
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="form-check-label small d-flex align-items-center gap-1" htmlFor={id}>
        {label}
        {loading && <div className="spinner-border spinner-border-sm text-secondary" role="status" />}
      </label>
    </div>
  );
}

export default function Upsell() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const items = useSelector((s) => s.items.items || []);
  const [localItems, setLocalItems] = useState([]);
  const [openCats, setOpenCats] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState({}); // track per-item and per-category loading

  useEffect(() => {
    dispatch(getItemsThunk());
  }, [dispatch]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();
    for (const it of localItems) {
      if (q) {
        const hay = `${it?.name || ""} ${it?.Category?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const key = String(it.category_id ?? "uncat");
      const cat = map.get(key) || {
        id: key,
        name: it?.Category?.name || t("upsell.category_uncategorized"),
        items: [],
      };
      cat.items.push(it);
      map.set(key, cat);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [localItems, query]);

  const toggleCatOpen = (catId) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const expandAll = () => setOpenCats(new Set(grouped.map((c) => c.id)));
  const collapseAll = () => setOpenCats(new Set());

  const mutateItems = (mutator) => setLocalItems((prev) => prev.map(mutator));

  const withRollback = async (doRequest, rollback, key) => {
    setLoadingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await doRequest();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.error(e);
      rollback?.();
      window.alert(t("upsell.save_failed"));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCategoryToggle = (categoryId, field, value) => {
    const before = localItems;
    mutateItems((it) =>
      String(it.category_id ?? "uncat") === String(categoryId) ? { ...it, [field]: value } : it
    );
    withRollback(
      () =>
        fetch(`/api/items/categories/${categoryId}/upsell`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ field, value }),
        }),
      () => setLocalItems(before),
      `cat-${categoryId}-${field}`
    );
  };

  const handleItemToggle = (itemId, field, value) => {
    const before = localItems;
    mutateItems((it) => (it.id === itemId ? { ...it, [field]: value } : it));
    withRollback(
      () =>
        fetch(`/api/items/items/${itemId}/upsell`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ field, value }),
        }),
      () => setLocalItems(before),
      `item-${itemId}-${field}`
    );
  };

  const getCatSwitchState = (catItems, field) => {
    const total = catItems.length;
    const enabled = catItems.filter((i) => !!i[field]).length;
    return {
      checked: enabled === total && total > 0,
      indeterminate: enabled > 0 && enabled < total,
      count: enabled,
      total,
    };
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="mb-3">
        <h2 className="fw-bold mb-1">{t("upsell.title")}</h2>
        <p className="text-muted small mb-0">
          {t("upsell.desc")}
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-3">
        <div className="card-body d-flex flex-column flex-md-row gap-2 align-items-start align-items-md-center">
          <input
            type="search"
            className="form-control"
            placeholder={t("upsell.search_placeholder")}
            style={{ maxWidth: 360 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="d-flex gap-2 ms-md-auto w-100 w-md-auto">
            <button
              className="btn btn-outline-secondary flex-fill flex-md-grow-0"
              onClick={expandAll}
            >
              {t("upsell.expand_all")}
            </button>
            <button
              className="btn btn-outline-secondary flex-fill flex-md-grow-0"
              onClick={collapseAll}
            >
              {t("upsell.collapse_all")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {grouped.length === 0 ? (
        <div className="alert alert-light border text-muted">
          {t("upsell.no_items")}
        </div>
      ) : (
        grouped.map((cat) => {
          const orderState = getCatSwitchState(cat.items, "order_upsell");
          const checkoutState = getCatSwitchState(cat.items, "checkout_upsell");
          const open = openCats.has(cat.id);

          return (
            <div key={cat.id} className="card mb-2 shadow-sm">
              {/* Category header */}
              <div
                className="card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
                role="button"
                tabIndex={0}
                onClick={() => toggleCatOpen(cat.id)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && toggleCatOpen(cat.id)
                }
              >
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <span className="fw-bold">{open ? "▾" : "▸"}</span>
                  <h5 className="mb-0">{cat.name}</h5>
                  <span className="badge bg-primary">
                    {orderState.count}/{orderState.total} {t("upsell.order_label")}
                  </span>
                  <span className="badge bg-success">
                    {checkoutState.count}/{checkoutState.total} {t("upsell.checkout_label")}
                  </span>
                </div>

                <div
                  className="d-flex flex-wrap gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IndeterminateSwitch
                    id={`order-cat-${cat.id}`}
                    checked={orderState.checked}
                    indeterminate={orderState.indeterminate}
                    label={t("upsell.order_label")}
                    onChange={(val) =>
                      handleCategoryToggle(cat.id, "order_upsell", val)
                    }
                    disabled={loadingMap[`cat-${cat.id}-order_upsell`]}
                    loading={loadingMap[`cat-${cat.id}-order_upsell`]}
                  />
                  <IndeterminateSwitch
                    id={`checkout-cat-${cat.id}`}
                    checked={checkoutState.checked}
                    indeterminate={checkoutState.indeterminate}
                    label={t("upsell.checkout_label")}
                    onChange={(val) =>
                      handleCategoryToggle(cat.id, "checkout_upsell", val)
                    }
                    disabled={loadingMap[`cat-${cat.id}-checkout_upsell`]}
                    loading={loadingMap[`cat-${cat.id}-checkout_upsell`]}
                  />
                </div>
              </div>

              {/* Item list */}
              {open && (
                <div className="list-group list-group-flush">
                  {cat.items.map((it) => (
                    <div
                      key={it.id}
                      className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center"
                    >
                      <div className="d-flex flex-column mb-2 mb-sm-0">
                        <span className="fw-semibold">{it.name}</span>
                        <small className="text-muted">
                          {cat.name} • {t("upsell.id_label")} #{it.id}
                        </small>
                      </div>
                      <div className="d-flex gap-3">
                        <IndeterminateSwitch
                          id={`order-item-${it.id}`}
                          checked={!!it.order_upsell}
                          label={t("upsell.order_label")}
                          onChange={(val) =>
                            handleItemToggle(it.id, "order_upsell", val)
                          }
                          disabled={loadingMap[`item-${it.id}-order_upsell`]}
                          loading={loadingMap[`item-${it.id}-order_upsell`]}
                        />
                        <IndeterminateSwitch
                          id={`checkout-item-${it.id}`}
                          checked={!!it.checkout_upsell}
                          label={t("upsell.checkout_label")}
                          onChange={(val) =>
                            handleItemToggle(it.id, "checkout_upsell", val)
                          }
                          disabled={loadingMap[`item-${it.id}-checkout_upsell`]}
                          loading={loadingMap[`item-${it.id}-checkout_upsell`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
