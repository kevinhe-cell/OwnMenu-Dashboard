import { useCallback, useRef, useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import swal from "sweetalert";
import {
  downloadMenuTemplate,
  previewMenuExcel,
  commitMenuExcel,
} from "../../../store/menuExcelImport";

const SKIP_REASON_KEYS = {
  "Item already exists in this category": "excel_menu.skip_reasons.item_exists",
  "Duplicate row in file": "excel_menu.skip_reasons.duplicate_row",
  "Option already exists on this attribute": "excel_menu.skip_reasons.option_exists",
  "Duplicate option in file": "excel_menu.skip_reasons.duplicate_option",
  "Duplicate modifier link in file": "excel_menu.skip_reasons.duplicate_link",
  "Modifier already attached to item": "excel_menu.skip_reasons.link_exists",
};

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function translateSkipReason(t, reason) {
  const key = SKIP_REASON_KEYS[reason];
  return key ? t(key) : reason;
}

function Stat({ value, label, tone = "default" }) {
  const tones = {
    default: { bg: "#f8fafc", color: "#0f172a", border: "#e2e8f0" },
    success: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
    warn: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    danger: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    muted: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  };
  const style = tones[tone] || tones.default;
  return (
    <div
      className="emi-stat"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      <div className="emi-stat-value">{value}</div>
      <div className="emi-stat-label">{label}</div>
    </div>
  );
}

function Step({ n, label, active, done }) {
  return (
    <div className={`emi-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
      <span className="emi-step-num">{done ? <CheckCircle2 size={14} /> : n}</span>
      <span className="emi-step-label">{label}</span>
    </div>
  );
}

function IssuesList({ errors = [], skips = [] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(errors.length > 0);
  const total = errors.length + skips.length;
  if (!total) return null;

  const errorLabel =
    errors.length > 0
      ? t(
          errors.length === 1
            ? "excel_menu.issues.row_errors_one"
            : "excel_menu.issues.row_errors_other",
          { count: errors.length },
        )
      : t("excel_menu.issues.no_errors");

  return (
    <div className="emi-issues">
      <button type="button" className="emi-issues-toggle" onClick={() => setOpen((v) => !v)}>
        <AlertTriangle size={16} />
        <span>
          {errorLabel}
          {skips.length > 0
            ? t("excel_menu.issues.skipped_suffix", { count: skips.length })
            : ""}
        </span>
        <span className="emi-issues-chevron">
          {open ? t("excel_menu.issues.hide") : t("excel_menu.issues.show")}
        </span>
      </button>
      {open && (
        <div className="emi-issues-body">
          {errors.map((e, idx) => (
            <div key={`e-${e.rowNum}-${idx}`} className="emi-issue is-error">
              <span className="emi-issue-row">
                {t("excel_menu.issues.row", { num: e.rowNum })}
              </span>
              <span>
                {(e.errors || []).join("; ")}
                {e.itemName ? ` — ${e.itemName}` : ""}
                {e.optionName ? ` — ${e.attributeName} / ${e.optionName}` : ""}
                {!e.optionName && e.attributeName && e.itemName
                  ? ` → ${e.attributeName}`
                  : ""}
              </span>
            </div>
          ))}
          {skips.map((e, idx) => (
            <div key={`s-${e.rowNum}-${idx}`} className="emi-issue is-skip">
              <span className="emi-issue-row">
                {t("excel_menu.issues.row", { num: e.rowNum })}
              </span>
              <span>
                {translateSkipReason(t, e.reason)}
                {e.itemName ? ` — ${e.itemName}` : ""}
                {e.optionName ? ` — ${e.attributeName} / ${e.optionName}` : ""}
                {!e.optionName && e.attributeName && e.itemName
                  ? ` → ${e.attributeName}`
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuPreview({ preview }) {
  const { t } = useTranslation();
  const s = preview.summary || {};
  const itemCreates = preview.items?.creates || preview.creates || [];
  const optionCreates = preview.modifiers?.creates || [];
  const linkCreates = preview.links?.creates || [];

  return (
    <div className="emi-preview">
      <div className="emi-stats">
        <Stat value={s.itemsToCreate || 0} label={t("excel_menu.stats.items")} tone="success" />
        <Stat
          value={s.optionsToCreate || 0}
          label={t("excel_menu.stats.options")}
          tone="success"
        />
        <Stat
          value={s.linksToCreate || 0}
          label={t("excel_menu.stats.links")}
          tone="success"
        />
        <Stat
          value={s.attributesToCreate || 0}
          label={t("excel_menu.stats.new_attributes")}
        />
        <Stat value={s.categoriesToCreate || 0} label={t("excel_menu.stats.categories")} />
        <Stat value={s.skipped || 0} label={t("excel_menu.stats.skipped")} tone="muted" />
        <Stat
          value={s.errors || 0}
          label={t("excel_menu.stats.errors")}
          tone={s.errors ? "danger" : "muted"}
        />
      </div>

      {s.overLimit && (
        <Alert variant="danger" className="emi-alert">
          {t("excel_menu.preview.over_limit", {
            projected: s.projectedItems,
            limit: s.itemLimit,
          })}
        </Alert>
      )}

      {preview.plannedCategories?.length > 0 && (
        <div className="emi-chip-block">
          <div className="emi-chip-label">{t("excel_menu.preview.new_categories")}</div>
          <div className="emi-chips">
            {preview.plannedCategories.map((c) => (
              <span key={c} className="emi-chip">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {itemCreates.length > 0 && (
        <div className="emi-table-wrap">
          <div className="emi-section-label">{t("excel_menu.preview.section_items")}</div>
          <Table className="emi-table mb-0">
            <thead>
              <tr>
                <th>{t("excel_menu.preview.th_row")}</th>
                <th>{t("excel_menu.preview.th_main")}</th>
                <th>{t("excel_menu.preview.th_category")}</th>
                <th>{t("excel_menu.preview.th_category_desc")}</th>
                <th>{t("excel_menu.preview.th_item")}</th>
                <th>{t("excel_menu.preview.th_modifiers")}</th>
                <th className="text-end">{t("excel_menu.preview.th_price")}</th>
              </tr>
            </thead>
            <tbody>
              {itemCreates.slice(0, 40).map((row) => (
                <tr key={`i-${row.rowNum}`}>
                  <td className="text-muted">{row.rowNum}</td>
                  <td>{row.mainCategory || "—"}</td>
                  <td>{row.category}</td>
                  <td className="text-muted">{row.categoryDescription || "—"}</td>
                  <td className="fw-medium">{row.itemName}</td>
                  <td className="text-muted">
                    {(row.modifierNames || []).join("; ") || "—"}
                  </td>
                  <td className="text-end">${Number(row.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {itemCreates.length > 40 && (
            <div className="emi-table-foot">
              {t("excel_menu.preview.showing_items", { count: itemCreates.length })}
            </div>
          )}
        </div>
      )}

      {optionCreates.length > 0 && (
        <div className="emi-table-wrap">
          <div className="emi-section-label">{t("excel_menu.preview.section_modifiers")}</div>
          <Table className="emi-table mb-0">
            <thead>
              <tr>
                <th>{t("excel_menu.preview.th_row")}</th>
                <th>{t("excel_menu.preview.th_attribute")}</th>
                <th>{t("excel_menu.preview.th_option")}</th>
                <th className="text-end">{t("excel_menu.preview.th_price")}</th>
              </tr>
            </thead>
            <tbody>
              {optionCreates.slice(0, 40).map((row) => (
                <tr key={`o-${row.rowNum}`}>
                  <td className="text-muted">{row.rowNum}</td>
                  <td>
                    {row.attributeName}
                    {row.attributeIsNew && (
                      <span className="emi-new-tag">{t("excel_menu.preview.tag_new")}</span>
                    )}
                  </td>
                  <td className="fw-medium">{row.optionName}</td>
                  <td className="text-end">
                    {Number(row.priceModifier) === 0
                      ? "—"
                      : `+$${Number(row.priceModifier).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {optionCreates.length > 40 && (
            <div className="emi-table-foot">
              {t("excel_menu.preview.showing_options", { count: optionCreates.length })}
            </div>
          )}
        </div>
      )}

      {linkCreates.length > 0 && (
        <div className="emi-table-wrap">
          <div className="emi-section-label">{t("excel_menu.preview.section_links")}</div>
          <Table className="emi-table mb-0">
            <thead>
              <tr>
                <th>{t("excel_menu.preview.th_row")}</th>
                <th>{t("excel_menu.preview.th_item")}</th>
                <th>{t("excel_menu.preview.th_attribute")}</th>
              </tr>
            </thead>
            <tbody>
              {linkCreates.slice(0, 40).map((row, idx) => (
                <tr key={`l-${row.rowNum}-${row.attributeName}-${idx}`}>
                  <td className="text-muted">{row.rowNum}</td>
                  <td className="fw-medium">{row.itemName}</td>
                  <td>{row.attributeName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {linkCreates.length > 40 && (
            <div className="emi-table-foot">
              {t("excel_menu.preview.showing_links", { count: linkCreates.length })}
            </div>
          )}
        </div>
      )}

      <IssuesList errors={preview.errors} skips={preview.skips} />
    </div>
  );
}

export default function ExcelMenuImport() {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState(null);

  const resetAll = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError("");
    setResult(null);
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const runPreview = async (f) => {
    if (!f) return;
    setLoadingPreview(true);
    setError("");
    setResult(null);
    setPreview(null);
    try {
      const data = await previewMenuExcel(f);
      setPreview(data);
    } catch (err) {
      setError(err.message || t("excel_menu.errors.read_failed"));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const name = String(f.name || "").toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
      setError(t("excel_menu.errors.invalid_file"));
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
    runPreview(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  };

  const handleDownload = async () => {
    try {
      await downloadMenuTemplate();
    } catch (err) {
      swal({
        title: t("excel_menu.errors.download_failed"),
        text: err.message,
        icon: "error",
      });
    }
  };

  const workCount = (preview) =>
    (preview?.summary?.itemsToCreate || 0) +
    (preview?.summary?.optionsToCreate || 0) +
    (preview?.summary?.linksToCreate || 0);

  const handleCommit = async () => {
    if (!file || !preview) return;
    const createCount = workCount(preview);

    if (createCount === 0) {
      swal({
        title: t("excel_menu.swal.nothing_title"),
        text: t("excel_menu.swal.nothing_text"),
        icon: "info",
      });
      return;
    }

    const ok = await swal({
      title: t(
        createCount === 1
          ? "excel_menu.swal.confirm_menu_one"
          : "excel_menu.swal.confirm_menu_other",
        { count: createCount },
      ),
      text: t("excel_menu.swal.confirm_text"),
      icon: "warning",
      buttons: [t("excel_menu.swal.btn_cancel"), t("excel_menu.swal.btn_import")],
    });
    if (!ok) return;

    setCommitting(true);
    setError("");
    try {
      const data = await commitMenuExcel(file);
      setResult(data);
      const created = data.created || {};
      await swal({
        title: t("excel_menu.swal.complete_title"),
        text: t("excel_menu.swal.complete_menu", {
          items: created.items || 0,
          options: created.options || 0,
          links: created.links || 0,
          attributes: created.attributes || 0,
          categories: created.categories || 0,
        }),
        icon: "success",
      });
    } catch (err) {
      setError(err.message || t("excel_menu.errors.import_failed"));
    } finally {
      setCommitting(false);
    }
  };

  const canImport =
    preview && !committing && !preview.summary?.overLimit && workCount(preview) > 0;

  const skippedPart = result?.skipped
    ? t("excel_menu.success.skipped_part", { count: result.skipped })
    : "";

  return (
    <>
      <style>{`
        .emi-page { max-width: 920px; margin: 0 auto; padding: 1.75rem 1.25rem 3rem; }
        .emi-header { margin-bottom: 1.5rem; }
        .emi-header h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
        .emi-header p { margin: 0; color: #64748b; font-size: 0.9375rem; line-height: 1.5; max-width: 40rem; }

        .emi-steps { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-bottom: 1.25rem; }
        .emi-step { display: flex; align-items: center; gap: 0.45rem; color: #94a3b8; font-size: 0.8125rem; font-weight: 500; }
        .emi-step-num { width: 22px; height: 22px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: #e2e8f0; color: #64748b; font-size: 0.7rem; font-weight: 700; }
        .emi-step.is-active { color: #0f172a; }
        .emi-step.is-active .emi-step-num { background: #dd2f6e; color: #fff; }
        .emi-step.is-done { color: #059669; }
        .emi-step.is-done .emi-step-num { background: #d1fae5; color: #047857; }

        .emi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
        .emi-card-top { padding: 1.25rem 1.35rem; border-bottom: 1px solid #f1f5f9; display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .emi-card-title { display: flex; align-items: center; gap: 0.6rem; font-weight: 650; font-size: 1.05rem; color: #0f172a; margin: 0 0 0.25rem; }
        .emi-card-desc { margin: 0; color: #64748b; font-size: 0.875rem; max-width: 32rem; line-height: 1.45; }
        .emi-btn-ghost { display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid #e2e8f0; background: #fff; color: #0f172a; border-radius: 10px; padding: 0.55rem 0.9rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: 0.15s ease; }
        .emi-btn-ghost:hover { border-color: #cbd5e1; background: #f8fafc; }

        .emi-body { padding: 1.25rem 1.35rem 1.5rem; }
        .emi-drop { border: 1.5px dashed #cbd5e1; border-radius: 14px; padding: 2rem 1.25rem; text-align: center; background: #fafbfc; cursor: pointer; transition: 0.15s ease; }
        .emi-drop:hover, .emi-drop.is-drag { border-color: #94a3b8; background: #f8fafc; }
        .emi-drop-icon { width: 48px; height: 48px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; display: inline-flex; align-items: center; justify-content: center; color: #0f172a; margin-bottom: 0.85rem; }
        .emi-drop-title { font-weight: 600; color: #0f172a; margin-bottom: 0.25rem; }
        .emi-drop-hint { color: #94a3b8; font-size: 0.8125rem; }

        .emi-file { margin-top: 0.85rem; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0.9rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .emi-file-icon { width: 40px; height: 40px; border-radius: 10px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .emi-file-meta { flex: 1; min-width: 0; text-align: left; }
        .emi-file-name { font-weight: 600; font-size: 0.875rem; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .emi-file-size { font-size: 0.75rem; color: #94a3b8; }
        .emi-file-x { border: none; background: transparent; color: #94a3b8; padding: 0.35rem; border-radius: 8px; cursor: pointer; }
        .emi-file-x:hover { background: #f1f5f9; color: #ef4444; }

        .emi-alert { border-radius: 10px; margin-top: 1rem; margin-bottom: 0; font-size: 0.875rem; }
        .emi-loading { display: flex; align-items: center; justify-content: center; gap: 0.65rem; padding: 2rem; color: #64748b; font-size: 0.9rem; }

        .emi-preview { margin-top: 1.25rem; }
        .emi-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.6rem; margin-bottom: 1rem; }
        .emi-stat { border: 1px solid; border-radius: 12px; padding: 0.7rem 0.85rem; }
        .emi-stat-value { font-size: 1.25rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
        .emi-stat-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.8; margin-top: 0.2rem; }

        .emi-chip-block { margin-bottom: 1rem; }
        .emi-chip-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.45rem; }
        .emi-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .emi-chip { background: #f1f5f9; color: #334155; border-radius: 999px; padding: 0.25rem 0.65rem; font-size: 0.75rem; font-weight: 500; }

        .emi-section-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.55rem 0.85rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .emi-table-wrap { border: 1px solid #e2e8f0; border-radius: 12px; overflow: auto; max-height: 300px; margin-bottom: 1rem; }
        .emi-table { font-size: 0.8125rem; }
        .emi-table thead th { position: sticky; top: 0; background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
        .emi-table td { vertical-align: middle; border-color: #f1f5f9; }
        .emi-table-foot { padding: 0.5rem 0.85rem; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafbfc; }
        .emi-new-tag { margin-left: 0.4rem; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #059669; background: #d1fae5; padding: 0.1rem 0.4rem; border-radius: 999px; }

        .emi-issues { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .emi-issues-toggle { width: 100%; display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border: none; background: #fffbeb; color: #92400e; font-size: 0.8125rem; font-weight: 600; cursor: pointer; text-align: left; }
        .emi-issues-chevron { margin-left: auto; color: #b45309; font-weight: 500; font-size: 0.75rem; }
        .emi-issues-body { max-height: 180px; overflow: auto; border-top: 1px solid #fde68a; }
        .emi-issue { display: flex; gap: 0.75rem; padding: 0.55rem 0.9rem; font-size: 0.8125rem; border-bottom: 1px solid #f8fafc; }
        .emi-issue:last-child { border-bottom: none; }
        .emi-issue-row { flex-shrink: 0; font-weight: 600; color: #64748b; min-width: 3.5rem; }
        .emi-issue.is-error { color: #b91c1c; background: #fff; }
        .emi-issue.is-skip { color: #64748b; background: #fff; }

        .emi-actions { margin-top: 1.25rem; padding-top: 1.15rem; border-top: 1px solid #f1f5f9; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; }
        .emi-actions-hint { font-size: 0.8125rem; color: #94a3b8; }
        .emi-btn-primary { display: inline-flex; align-items: center; gap: 0.45rem; border: none; background: #dd2f6e; color: #fff; border-radius: 10px; padding: 0.7rem 1.15rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.15s ease; }
        .emi-btn-primary:hover:not(:disabled) { background: #c0265c; }
        .emi-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .emi-success { margin-top: 1rem; display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.85rem 1rem; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; color: #047857; font-size: 0.875rem; font-weight: 500; }

        @media (max-width: 640px) {
          .emi-card-top { flex-direction: column; }
        }
      `}</style>

      <div className="emi-page">
        <header className="emi-header">
          <h1>{t("excel_menu.page.title")}</h1>
          <p>{t("excel_menu.page.desc")}</p>
        </header>

        <div className="emi-steps">
          <Step
            n={1}
            label={t("excel_menu.steps.download")}
            done={!!file || !!preview}
            active={!file}
          />
          <Step
            n={2}
            label={t("excel_menu.steps.upload")}
            done={!!preview}
            active={!!file && !preview && !error}
          />
          <Step
            n={3}
            label={t("excel_menu.steps.review")}
            done={!!result}
            active={!!preview && !result}
          />
        </div>

        <div className="emi-card">
          <div className="emi-card-top">
            <div>
              <h2 className="emi-card-title">
                <FileSpreadsheet size={20} />
                {t("excel_menu.card.import_menu")}
              </h2>
              <p className="emi-card-desc">{t("excel_menu.card.columns_menu")}</p>
            </div>
            <button type="button" className="emi-btn-ghost" onClick={handleDownload}>
              <Download size={16} />
              {t("excel_menu.card.download_template")}
            </button>
          </div>

          <div className="emi-body">
            <div
              className={`emi-drop ${dragActive ? "is-drag" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={onDrop}
            >
              <div className="emi-drop-icon">
                <Upload size={22} />
              </div>
              <div className="emi-drop-title">{t("excel_menu.dropzone.title")}</div>
              <div className="emi-drop-hint">{t("excel_menu.dropzone.hint")}</div>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </div>

            {file && (
              <div className="emi-file">
                <div className="emi-file-icon">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="emi-file-meta">
                  <div className="emi-file-name">{file.name}</div>
                  <div className="emi-file-size">{formatBytes(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="emi-file-x"
                  aria-label={t("excel_menu.file.remove")}
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAll();
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="emi-alert">
                {error}
              </Alert>
            )}

            {loadingPreview && (
              <div className="emi-loading">
                <Spinner animation="border" size="sm" />
                {t("excel_menu.loading")}
              </div>
            )}

            {result && (
              <div className="emi-success">
                <CheckCircle2 size={18} className="mt-1 flex-shrink-0" />
                <div>
                  {t("excel_menu.success.fallback")}
                  {result.created && (
                    <div className="mt-1" style={{ fontWeight: 400 }}>
                      {t("excel_menu.success.menu_detail", {
                        items: result.created.items || 0,
                        options: result.created.options || 0,
                        links: result.created.links || 0,
                        skipped: skippedPart,
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loadingPreview && preview && <MenuPreview preview={preview} />}

            {preview && !loadingPreview && (
              <div className="emi-actions">
                <div className="emi-actions-hint">
                  {canImport
                    ? t("excel_menu.actions.hint_ready")
                    : preview.summary?.overLimit
                      ? t("excel_menu.actions.hint_limit")
                      : t("excel_menu.actions.hint_empty")}
                </div>
                <button
                  type="button"
                  className="emi-btn-primary"
                  disabled={!canImport}
                  onClick={handleCommit}
                >
                  {committing ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      {t("excel_menu.actions.importing")}
                    </>
                  ) : (
                    <>
                      {t("excel_menu.actions.confirm")}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
