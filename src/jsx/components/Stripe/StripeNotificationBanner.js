import React, { useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectNotificationBanner,
} from "@stripe/react-connect-js";
import { getToken } from "../../../store/utlits";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function StripeNotificationChecker() {
  const navigate = useNavigate();
  const [toastShown, setToastShown] = useState(false); // prevent duplicate toast

  const handleNotificationsChange = (response) => {
    if (response.actionRequired > 0 && !toastShown) {
      toast.warn(
        <div>
          ⚠️ <strong>Stripe Action Required</strong>
          <br />
          You must complete a payment or account task.
          <br />
          <button
            onClick={() => navigate("/account/stripe-notifications")}
            className="btn btn-sm btn-outline-light mt-2"
          >
            View in Stripe
          </button>
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          toastId: "stripe-required", // only show once
        },
      );
      setToastShown(true);
    }
  };

  const [stripeConnectInstance] = useState(() => {
    const fetchClientSecret = async () => {
      const token = getToken();
      if (!token) return;

      const response = await fetch("/api/stripe/account_session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        return undefined;
      } else {
        const { client_secret: clientSecret } = await response.json();
        return clientSecret;
      }
    };

    return loadConnectAndInitialize({
      publishableKey:
        "pk_live_51N1jsSIzDtG53Sp0IYroac8Yq8aSbX7PQgISERDGaQNviBMnz4SGJ4RhjZws64QrELl0aJoWqtyYe5W3Ud6bqhmV00sR5crhK1",
      fetchClientSecret,
    });
  });

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <ConnectNotificationBanner
        collectionOptions={{
          fields: "eventually_due",
          futureRequirements: "include",
        }}
        onNotificationsChange={handleNotificationsChange}
        style={{ display: "none" }} // hide native banner
      />
    </ConnectComponentsProvider>
  );
}
