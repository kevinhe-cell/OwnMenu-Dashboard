const NULL_INDEX = Number.MAX_SAFE_INTEGER;

export function normalizeIndex(value) {
  if (value === null || value === undefined || value === "") return NULL_INDEX;
  const n = Number(value);
  return Number.isFinite(n) ? n : NULL_INDEX;
}

/**
 * Compare two entities by display order (index ASC), then name (localeCompare).
 */
export function compareDisplayOrder(a, b, getIndex = (x) => x?.index, getName = (x) => x?.name) {
  const ia = normalizeIndex(getIndex(a));
  const ib = normalizeIndex(getIndex(b));
  if (ia !== ib) return ia - ib;
  return String(getName(a) || "").localeCompare(String(getName(b) || ""), undefined, {
    sensitivity: "base",
  });
}

export function sortByDisplayOrder(list, getIndex, getName) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => compareDisplayOrder(a, b, getIndex, getName));
}

export function inferGroupCategoryId(itemIds, itemsById) {
  const ids = Array.isArray(itemIds) ? itemIds : [];
  for (const rawId of ids) {
    const item = itemsById.get(Number(rawId));
    if (item?.Category?.id != null) return item.Category.id;
    if (item?.category_id != null) return item.category_id;
  }
  return null;
}
