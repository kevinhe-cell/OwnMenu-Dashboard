import React from "react";
import { Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/** App orders include an Expo push token; website orders set website_order or lack that token. */
export function isAppOrder(order) {
  if (order?.website_order === true) return false;
  return Boolean(
    order?.expo_push_token?.startsWith?.("ExponentPushToken"),
  );
}

export function OrderSourceBadge({ order, className = "" }) {
  const { t } = useTranslation();
  const fromApp = isAppOrder(order);

  return (
    <Badge
      bg={fromApp ? "dark" : "info"}
      className={className}
      title={fromApp ? t("orders.source_app") : t("orders.source_website")}
    >
      {fromApp ? t("orders.source_app") : t("orders.source_website")}
    </Badge>
  );
}
