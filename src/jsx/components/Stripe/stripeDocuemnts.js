import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectPayments,
  ConnectComponentsProvider,
  ConnectDocuments,
} from "@stripe/react-connect-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToken } from "../../../store/utlits";
import PasscodeModal from "./PasscodeModal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function StripeDocuments() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const passcodeVerified = useSelector((state) => state.passcode.verified);
  const [showPasscodeModal, setShowPasscodeModal] = useState(!passcodeVerified);
  const user = useSelector((state) => state.session.user);
  const plan = useSelector((state) => state.session.userPlan);

  const isFreePlanWithoutOnlinePayment =
    (plan?.plan_type === "free" && !plan?.online_payment_enabled) ||
    (plan?.plan_type === "custom" && !plan?.online_payment_enabled);

  const [stripeConnectInstance] = useState(() => {
    const fetchClientSecret = async () => {
      // Fetch the AccountSession client secret
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
        // Handle errors on the client side here
        const { error } = await response.json();
        return undefined;
      } else {
        const { client_secret: clientSecret } = await response.json();
        return clientSecret;
      }
    };

    return loadConnectAndInitialize({
      // This is your test publishable API key.
      publishableKey:
        "pk_live_51N1jsSIzDtG53Sp0IYroac8Yq8aSbX7PQgISERDGaQNviBMnz4SGJ4RhjZws64QrELl0aJoWqtyYe5W3Ud6bqhmV00sR5crhK1",
      fetchClientSecret: fetchClientSecret,
    });
  });

  const handleCloseModal = (a) => {
    navigate(-1);
  };

  const handleSuccess = () => {
    // User entered correct passcode
    setShowPasscodeModal(false); // allow access
  };

  return (
    <>
      {isFreePlanWithoutOnlinePayment ? (
        <div className="alert alert-danger">
          {t('payments_mgmt.addon_required')}
        </div>
      ) : (
        <>
          {/* <PasscodeModal
            show={showPasscodeModal}
            onClose={handleCloseModal}
            restaurantId={user.restaurant_id} // replace with actual restaurant context
            onSuccess={handleSuccess}
          /> */}
          {/* {!showPasscodeModal && ( */}
            <div className="container">
              <ConnectComponentsProvider
                connectInstance={stripeConnectInstance}
              >
                <ConnectDocuments />
              </ConnectComponentsProvider>
            </div>
          {/* // )} */}
        </>
      )}
    </>
  );
}

export default StripeDocuments;
