import React from "react";
import { useTranslation } from "react-i18next";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/** Shared SEO score fields — keep in sync with WebsiteSEO score. */
export const SEO_SCORE_FIELDS = [
  { field: "meta_title", importance: "very" },
  { field: "meta_description", importance: "very" },
  { field: "meta_keywords", importance: "low" },
  { field: "og_title", importance: "important" },
  { field: "og_description", importance: "important" },
  { field: "geo_street_address", importance: "very" },
  { field: "geo_address_locality", importance: "very" },
  { field: "geo_address_region", importance: "important" },
  { field: "geo_address_country", importance: "low" },
  { field: "geo_latitude", importance: "very" },
  { field: "geo_longitude", importance: "very" },
  { field: "opening_hours", importance: "important" },
  { field: "menu_url", importance: "important" },
  { field: "built_in_faq", importance: "very" },
  { field: "seo_paragraph", importance: "very" },
  { field: "h1_text", importance: "very" },
  { field: "h2_sections", importance: "important" },
  { field: "internal_links", importance: "important" },
  { field: "seo_main_cuisine", importance: "important" },
  { field: "seo_cuisine_tags", importance: "important" },
  { field: "seo_nearby_cities", importance: "important" },
  // Optional — missing hero should not block a 100 score
  { field: "seo_landing_hero_url", importance: "low" },
];

const importanceMap = {
  very: "critical",
  important: "warning",
  low: "passed",
};

function hasValue(v) {
  if (v == null) return false;
  if (typeof v === "string") {
    const t = v.trim();
    return t !== "" && t !== "[]" && t !== "{}";
  }
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

/**
 * Score only from critical/warning fields.
 * When nothing critical or warning is missing → 100.
 * Low-importance gaps (keywords, hero, country) do not reduce the score.
 */
export function computeSeoScoreBreakdown(seo) {
  let critical = 0;
  let warning = 0;
  let passed = 0;

  SEO_SCORE_FIELDS.forEach(({ field, importance }) => {
    const bucket = importanceMap[importance] || "passed";
    if (hasValue(seo?.[field])) {
      passed += 1;
      return;
    }
    if (bucket === "critical") critical += 1;
    else if (bucket === "warning") warning += 1;
    // low missing: ignored for score + issue counts
  });

  const scoredTotal = critical + warning + passed;
  const score =
    critical + warning === 0
      ? 100
      : scoredTotal > 0
        ? Math.round((passed / scoredTotal) * 100)
        : 0;

  return { score, critical, warning, passed };
}

export default function SEOSummaryCard({ seo, score: scoreProp }) {
  const { t } = useTranslation();
  const { score, critical, warning, passed } = computeSeoScoreBreakdown(seo);
  const displayScore = typeof scoreProp === "number" ? scoreProp : score;
  const pathColor = displayScore >= 80 ? "#059669" : displayScore >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="seo-score-card">
      <div className="seo-score-ring">
        <div style={{ width: 112, height: 112 }}>
          <CircularProgressbarWithChildren
            value={displayScore}
            maxValue={100}
            styles={buildStyles({
              pathColor,
              trailColor: "#f3f4f6",
              strokeLinecap: "round",
              pathTransitionDuration: 0.5,
            })}
          >
            <div className="seo-score-num">{displayScore}</div>
            <div className="seo-score-of">{t("website.seo.summary.score_of")}</div>
          </CircularProgressbarWithChildren>
        </div>
      </div>

      <div className="seo-score-body">
        <p className="seo-score-headline">
          {t("website.seo.summary.text", {
            score: displayScore,
            critical,
            warning,
          })}
        </p>
        <div className="seo-stat-row">
          <div className="seo-stat seo-stat-critical">
            <span className="seo-stat-n">{critical}</span>
            <span className="seo-stat-l">{t("website.seo.summary.critical")}</span>
          </div>
          <div className="seo-stat seo-stat-warn">
            <span className="seo-stat-n">{warning}</span>
            <span className="seo-stat-l">{t("website.seo.summary.warnings")}</span>
          </div>
          <div className="seo-stat seo-stat-ok">
            <span className="seo-stat-n">{passed}</span>
            <span className="seo-stat-l">{t("website.seo.summary.passed")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
