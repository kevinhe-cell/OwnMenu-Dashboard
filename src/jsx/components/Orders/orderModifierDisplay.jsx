import React from "react";

/** Depth from option_scope_key segments (same idea as backend / receipt app). */
export function modifierScopeDepth(scopeKey) {
  if (scopeKey == null || scopeKey === "") return 0;
  return Math.max(0, String(scopeKey).split(">").length - 1);
}

/**
 * Renders Order_Item_Attributes with clear parent (root) vs nested child styling.
 * Expects attributes in API display order (do not re-sort here unless you pass sortedAttrs).
 */
export function OrderItemModifiersBlock({
  orderItem,
  sortedAttrs,
  compact = false,
}) {
  const attrs =
    sortedAttrs ?? orderItem?.Order_Item_Attributes ?? [];

  if (!attrs.length) return null;

  return (
    <div className={compact ? "mt-1" : "mt-0"}>
      {attrs.map((attribute) => {
        const depth = modifierScopeDepth(attribute.option_scope_key);
        const optName = attribute?.Item_Attribute_Option?.name || "";
        const qty = attribute?.quantity || 1;
        const chinese = attribute?.Item_Attribute_Option?.chinese_name;
        const price = attribute?.Item_Attribute_Option?.price_modifier;

        const isNested = depth > 0;

        if (isNested) {
          return (
            <div
              key={attribute.id}
              className={`${compact ? "small" : "small"} d-flex align-items-baseline gap-1 mb-1 ps-2`}
              style={{
                marginLeft: `${Math.min(depth, 5) * 10}px`,
                borderLeft: "2px solid var(--bs-secondary-bg-subtle, #e9ecef)",
                paddingLeft: "0.5rem",
              }}
            >
              <span
                className="text-muted flex-shrink-0"
                style={{ fontSize: compact ? "0.65rem" : "0.7rem" }}
                aria-hidden
              >
                └
              </span>
              <span className="text-secondary" style={{ fontSize: compact ? "0.68rem" : "0.78rem" }}>
                <span className="fw-semibold text-body">{optName}</span>
                {Number(price) > 0 ? (
                  <span className="badge bg-light text-dark border ms-1" style={{ fontSize: "0.65rem" }}>
                    +${price}
                  </span>
                ) : null}
              </span>
            </div>
          );
        }

        return (
          <div
            key={attribute.id}
            className={`d-flex align-items-baseline flex-wrap gap-1 mb-1 ${compact ? "small" : ""}`}
          >
            <span className="text-primary flex-shrink-0" aria-hidden>
              ●
            </span>
            <span className="fw-semibold text-dark" style={{ fontSize: compact ? "0.75rem" : "0.85rem" }}>
              <span>{optName}</span>
              {chinese ? (
                <span className="text-muted fw-normal ms-1">({chinese})</span>
              ) : null}
              {qty > 1 ? (
                <span className="text-muted fw-normal ms-1">×{qty}</span>
              ) : null}
              {Number(price) > 0 ? (
                <span className="badge bg-light text-dark border ms-1">
                  +${price}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
