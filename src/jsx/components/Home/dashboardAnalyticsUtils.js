export const toISODate = (date) => date.toLocaleDateString("en-CA");

export const formatNumber = (num) => Number(num || 0).toLocaleString();

export const PeriodPills = ({ options, value, onChange }) => (
  <div className="vd-quick-pills">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`vd-pill${value === opt.value ? " active" : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const DateFilters = ({
  t,
  periodOptions,
  periodPreset,
  onPresetChange,
  startDate,
  endDate,
  todayStr,
  onStartChange,
  onEndChange,
  onSubmit,
  loading,
  periodLabel,
}) => (
  <div className="vd-filters">
    <div className="vd-filters-card">
      <PeriodPills options={periodOptions} value={periodPreset} onChange={onPresetChange} />
      <form className="vd-filters-grid" onSubmit={onSubmit}>
        <div className="vd-field">
          <label htmlFor="vd-start">{t("dashboard.start_date")}</label>
          <input
            id="vd-start"
            type="date"
            value={startDate}
            max={todayStr}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <div className="vd-field">
          <label htmlFor="vd-end">{t("dashboard.end_date")}</label>
          <input
            id="vd-end"
            type="date"
            value={endDate}
            max={todayStr}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
        <button type="submit" className="vd-btn-apply" disabled={loading}>
          {t("dashboard.apply_filter")}
        </button>
      </form>
      <span className="vd-period-badge">{periodLabel}</span>
    </div>
  </div>
);

export function usePeriodState(today, todayStr, t) {
  const periodOptions = [
    { value: "today", label: t("dashboard.period_today") },
    { value: "week", label: t("dashboard.period_week") },
    { value: "month", label: t("dashboard.period_month") },
  ];

  const applyPreset = (preset) => {
    if (preset === "today") {
      return { start: todayStr, end: todayStr, preset };
    }
    if (preset === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      return { start: toISODate(weekAgo), end: todayStr, preset };
    }
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toISODate(firstOfMonth), end: todayStr, preset };
  };

  return { periodOptions, applyPreset };
}

export function formatPeriodLabel(startDate, endDate, today, language) {
  const fmt = (d) => {
    const [yy, mm, dd] = d.split("-");
    return `${mm}/${dd}/${yy}`;
  };
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  return today.toLocaleDateString(language);
}
