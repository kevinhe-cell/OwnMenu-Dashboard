import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { Spinner } from "react-bootstrap";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import { getUserPlanThunk } from "../../../store/session";

export default function OnBoardingStripe() {
  const { t } = useTranslation();
  const plan = useSelector((state) => state.session.userPlan);
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading"); // 'loading', 'onboarding', 'success', 'error', 'creating_account'
  const [connectInstance, setConnectInstance] = useState(null);
  const [message, setMessage] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    const confirm = await swal({
      title: t("payments_mgmt.disconnect_stripe"),
      text: t("payments_mgmt.disconnect_confirm"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (!confirm) return;

    setDisconnecting(true);
    try {
      const response = await fetch("/api/stripe/disconnect-stripe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to disconnect Stripe");
      }

      await swal(t("payments_mgmt.disconnect_stripe"), t("payments_mgmt.disconnect_success"), "success");
      dispatch(getUserPlanThunk());
      setStatus("loading");
    } catch (err) {
      console.error("Failed to disconnect Stripe:", err);
      swal("Error", t("payments_mgmt.disconnect_failed"), "error");
    } finally {
      setDisconnecting(false);
    }
  };

  const isFreePlanWithoutOnlinePayment =
    (plan?.plan_type === "free" && !plan?.online_payment_enabled) ||
    (plan?.plan_type === "custom" && !plan?.online_payment_enabled);

  useEffect(() => {
    if (isFreePlanWithoutOnlinePayment) {
      setStatus("error");
      return;
    }

    const checkAccountStatus = async () => {
      try {
        const response = await fetch("/api/stripe/get-account-status", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountId: plan?.account_id }),
        });
        const data = await response.json();

        const { capabilities = {}, detailsSubmitted, payout } = data;
        const isOnboarded =
          detailsSubmitted && capabilities.card_payments === "active" && payout;

        if (isOnboarded) {
          setStatus("success");
          setMessage(t('payments_mgmt.status_success_msg'));
          return;
        }

        initializeStripe();
      } catch (err) {
        console.error("Initial status check failed:", err);
        initializeStripe();
      }
    };

    const initializeStripe = async () => {
      const token = getToken();
      if (!token || !plan?.restaurant_id) return;

      try {
        const response = await fetch("/api/stripe/create-onboarding-session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ restaurantId: plan.restaurant_id }),
        });

        const data = await response.json();

        if (!response.ok || !data?.client_secret) {
          throw new Error(data.message || "No client secret returned.");
        }

        const connect = await loadConnectAndInitialize({
          publishableKey:
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
            "pk_live_51N1jsSIzDtG53Sp0IYroac8Yq8aSbX7PQgISERDGaQNviBMnz4SGJ4RhjZws64QrELl0aJoWqtyYe5W3Ud6bqhmV00sR5crhK1",
          fetchClientSecret: async () => data.client_secret,
        });

        setConnectInstance(connect);
        setStatus("onboarding");
      } catch (err) {
        console.warn("No Stripe account found. Creating a new one...");
        setStatus("creating_account");
        setMessage(t('payments_mgmt.status_creating'));
        await fetch("/api/stripe/create-express-account", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ restaurantId: plan.restaurant_id }),
        });
        dispatch(getUserPlanThunk());
        setTimeout(() => initializeStripe(), 1000);
      }
    };

    checkAccountStatus();
  }, [plan]);

  const handleExit = async () => {
    try {
      const response = await fetch("/api/stripe/get-account-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId: plan?.account_id }),
      });
      const data = await response.json();

      const { capabilities = {}, detailsSubmitted, payout } = data;
      const isOnboarded =
        detailsSubmitted && capabilities.card_payments === "active" && payout;

      if (isOnboarded) {
        setStatus("success");
        setMessage(t('payments_mgmt.status_success_msg'));
      } else {
        setMessage(t('payments_mgmt.reviewing_msg'));
      }
    } catch (err) {
      console.error("Check status error:", err);
      setMessage(t('payments_mgmt.verify_error'));
      setStatus("error");
    }
  };

  return (
    <div className="container bg-white rounded-xl shadow-md p-4">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">{t('payments_mgmt.onboarding_title')}</h2>
      </div>
      {message && (
        <div
          className={`alert ${status === "success" ? "alert-success" : "alert-warning"} mb-4`}
        >
          {message}
        </div>
      )}
      {status === "loading" || status === "creating_account" ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : status === "success" ? (
        <div className="alert alert-success">
          {t('payments_mgmt.already_onboarded')}
          <br />
          {t('payments_mgmt.security_note')}
        </div>
      ) : status === "onboarding" && connectInstance ? (
        <ConnectComponentsProvider connectInstance={connectInstance}>
          <ConnectAccountOnboarding onExit={handleExit} />
        </ConnectComponentsProvider>
      ) : status === "error" && isFreePlanWithoutOnlinePayment ? (
        <div className="alert alert-danger">
          {t('payments_mgmt.addon_required')}
        </div>
      ) : (
        <div className="alert alert-danger">
          {t('payments_mgmt.load_error')}
        </div>
      )}
    </div>
  );
}
