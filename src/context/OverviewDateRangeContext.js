import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeForPreset(preset) {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case "Month":
      start.setDate(1);
      break;
    case "3M":
      start.setMonth(end.getMonth() - 3);
      start.setDate(start.getDate() + 1);
      break;
    case "12M":
      start.setFullYear(end.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      break;
    case "Lifetime":
      start.setFullYear(end.getFullYear() - 5);
      start.setMonth(0, 1);
      break;
    case "30D":
    default:
      start.setDate(end.getDate() - 29);
      break;
  }
  return { start: toIso(start), end: toIso(end), preset };
}

const OverviewDateRangeContext = createContext(null);

export function OverviewDateRangeProvider({ children }) {
  const [range, setRangeState] = useState(() => rangeForPreset("3M"));

  const setPreset = useCallback((preset) => {
    setRangeState(rangeForPreset(preset));
  }, []);

  const setCustomRange = useCallback((start, end) => {
    setRangeState({
      start,
      end,
      preset: "custom",
    });
  }, []);

  const value = useMemo(
    () => ({
      start: range.start,
      end: range.end,
      preset: range.preset,
      setPreset,
      setCustomRange,
    }),
    [range, setPreset, setCustomRange]
  );

  return (
    <OverviewDateRangeContext.Provider value={value}>
      {children}
    </OverviewDateRangeContext.Provider>
  );
}

export function useOverviewDateRange() {
  const ctx = useContext(OverviewDateRangeContext);
  if (!ctx) {
    throw new Error(
      "useOverviewDateRange must be used within OverviewDateRangeProvider"
    );
  }
  return ctx;
}

export { rangeForPreset };
