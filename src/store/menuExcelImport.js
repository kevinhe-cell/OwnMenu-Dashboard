import { getToken } from "./utlits";

async function downloadTemplate(path, filename) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/menu-excel/${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to download template");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function postExcel(path, file) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/api/menu-excel/${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to ${path} Excel`);
  }
  return data;
}

export const downloadMenuTemplate = () =>
  downloadTemplate("template", "OwnMenu_Menu_Import_Template.xlsx");

export const previewMenuExcel = (file) => postExcel("preview", file);
export const commitMenuExcel = (file) => postExcel("commit", file);

// Legacy separate endpoints (kept for compatibility)
export const downloadItemsTemplate = () =>
  downloadTemplate("items/template", "OwnMenu_Items_Import_Template.xlsx");
export const downloadModifiersTemplate = () =>
  downloadTemplate(
    "modifiers/template",
    "OwnMenu_Modifiers_Import_Template.xlsx",
  );

export const previewItemsExcel = (file) => postExcel("items/preview", file);
export const commitItemsExcel = (file) => postExcel("items/commit", file);

export const previewModifiersExcel = (file) =>
  postExcel("modifiers/preview", file);
export const commitModifiersExcel = (file) =>
  postExcel("modifiers/commit", file);
