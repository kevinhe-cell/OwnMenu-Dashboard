import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "../Home/Home";
import { fetchChainRestaurantsThunk } from "../../../store/chainDashboard";

const DashboardLanding = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { chain, restaurants, restaurantsLoading } = useSelector(
    (state) => state.chainDashboard
  );
  const [checkedChain, setCheckedChain] = useState(false);

  useEffect(() => {
    let mounted = true;
    dispatch(fetchChainRestaurantsThunk())
      .catch(() => null)
      .finally(() => {
        if (mounted) setCheckedChain(true);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (!checkedChain || restaurantsLoading) {
    return (
      <div className="vd-page">
        <div className="vd-loading">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          {t("common.refreshing")}
        </div>
      </div>
    );
  }

  if (chain && restaurants.length > 0) {
    return <Navigate to="/master" replace />;
  }

  return <Navigate to="/sales" replace />;
};

export default DashboardLanding;
