import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createFeeThunk,
  getFeesThunk,
  updateDeliveryFeeThunk,
  updateFeeThunk,
} from "../../../store/fees";
import {
  getRestaurantThunk,
  updateDisallowSpecialInstructionsThunk,
  updateAllowOrderNotesThunk,
  updateAskForUtensilsThunk,
  updateSingleDealOnlyThunk,
  updateSmsVerificationNeedThunk,
  updateDisableScheduleOrdersThunk,
  updateRestaurantOrderAutomationThunk,
  updateCateringLeadTimeThunk,
} from "../../../store/restaurants";
import { Row, Card, Col, Button, Modal, Tab, Nav } from "react-bootstrap";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";
import { getUserPlanThunk } from "../../../store/session";
import DeliveryFeeModal from "./DeliveryFeeModal";
import TipOptionsControl from "./TipOptionControl";
import DeliverySchedule from "./DeliverySchedule";
import { useTranslation } from "react-i18next";

function Fees() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fees = useSelector((state) => state.fees.fees);
  const userPlan = useSelector((state) => state.session?.userPlan);
  const restaurant = useSelector((state) => state.restaurant?.restaurant);
  const [updateModal, setUpdateModal] = useState(false);
  const [commission, setCommission] = useState(0);
  const [tax, setTax] = useState(0);
  const [delivery_fee, setDeliveryFee] = useState(0);
  const [service_fee, setServiceFee] = useState(0);
  const [processing_fee, setProcessingFee] = useState(0);
  const [inStoreCash, setInStoreCash] = useState(false);
  const [inStoreOnline, setInStoreOnline] = useState(false);
  const [onlineCash, setOnlineCash] = useState(false);
  const [onlineOnline, setOnlineOnline] = useState(false);
  const [delivery_type, setDeliveryType] = useState(null);
  const [selectedOption, setSelectedOption] = useState("instore");
  const [selectedPickupOptions, setSelectedPickupOptions] = useState("pickup");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [maxDeliveryRange, setMaxDeliveryRange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoDeliveryEnabled, setAutoDeliveryEnabled] = useState(false);
  const [disallowSpecialInstructions, setDisallowSpecialInstructions] =
    useState(false);
  const [allowOrderNotes, setAllowOrderNotes] = useState(true);
  const [askForUtensils, setAskForUtensils] = useState(false);
  const [singleDealOnly, setSingleDealOnly] = useState(false);
  const [smsVerificationNeed, setSmsVerificationNeed] = useState(false);
  const [disableScheduleOrders, setDisableScheduleOrders] = useState(false);
  const [autoAcceptOrder, setAutoAcceptOrder] = useState(true);
  const [orderBufferMinutes, setOrderBufferMinutes] = useState(60);
  const [autoPrepTimeMinutes, setAutoPrepTimeMinutes] = useState("");
  const [cateringLeadTime, setCateringLeadTime] = useState(24);

  useEffect(() => {
    dispatch(getRestaurantThunk());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant && restaurant.disallow_special_instructions !== undefined) {
      setDisallowSpecialInstructions(!!restaurant.disallow_special_instructions);
    }
    if (restaurant && restaurant.allow_order_notes !== undefined) {
      setAllowOrderNotes(restaurant.allow_order_notes !== false);
    }
    if (restaurant && restaurant.ask_for_utensils !== undefined) {
      setAskForUtensils(!!restaurant.ask_for_utensils);
    }
    if (restaurant && restaurant.single_deal_only !== undefined) {
      setSingleDealOnly(!!restaurant.single_deal_only);
    }
    if (restaurant && restaurant.sms_verification_need !== undefined) {
      setSmsVerificationNeed(!!restaurant.sms_verification_need);
    }
    if (restaurant && restaurant.disable_schedule_orders !== undefined) {
      setDisableScheduleOrders(!!restaurant.disable_schedule_orders);
    }
    if (restaurant && restaurant.auto_accept_order !== undefined) {
      setAutoAcceptOrder(!!restaurant.auto_accept_order);
    }
    if (
      restaurant &&
      restaurant.order_buffer_minutes !== undefined &&
      restaurant.order_buffer_minutes !== null
    ) {
      setOrderBufferMinutes(Number(restaurant.order_buffer_minutes) || 60);
    }
    if (restaurant && restaurant.auto_prep_time_minutes != null) {
      const n = Number(restaurant.auto_prep_time_minutes);
      setAutoPrepTimeMinutes(Number.isFinite(n) && n > 0 ? n : "");
    } else {
      setAutoPrepTimeMinutes("");
    }
    if (restaurant && restaurant.catering_lead_time !== undefined) {
      setCateringLeadTime(Number(restaurant.catering_lead_time) || 0);
    }
  }, [restaurant]);

  useEffect(() => {
    if (!userPlan) {
      return;
    }
    if (userPlan?.instore_online) {
      setSelectedOption(userPlan?.instore_online);
    }

    if (userPlan?.pickup_delivery) {
      setSelectedPickupOptions(userPlan.pickup_delivery);
    }
  }, [userPlan]);

  useEffect(() => {
    dispatch(getFeesThunk());
    dispatch(getUserPlanThunk());
  }, [dispatch]);

  useEffect(() => {
    if (fees && fees.commission_fee !== undefined && fees.tax !== undefined) {
      setCommission(fees.commission_fee);
      setTax(fees.tax);
      setDeliveryFee(fees.delivery_fee);
      setServiceFee(fees.service_fee);
      setProcessingFee(fees.processing_fee);
      setInStoreCash(fees.pickup_cash);
      setInStoreOnline(fees.pickup_online);
      setOnlineCash(fees.delivery_cash);
      setOnlineOnline(fees.delivery_online);
      setDeliveryType(fees.delivery_type || "");
      setMaxDeliveryRange(fees.max_delivery_range);
      setAutoDeliveryEnabled(!!fees.auto_delivery_switch_enabled);
    } else {
      setCommission(0);
      setTax(0);
      setDeliveryFee(0);
      setServiceFee(0);
      setProcessingFee(0);
      setMaxDeliveryRange(0);
      setAutoDeliveryEnabled(false);
    }
  }, [fees]);

  const toggleUpdateModal = () => {
    setUpdateModal(!updateModal);
  };

  const handleCommissionChange = (e) => {
    setCommission(e.target.value);
  };

  const handleTaxChange = (e) => {
    setTax(e.target.value);
  };

  const handleUpdate = () => {
    if (fees.message) {
      dispatch(
        createFeeThunk(
          commission,
          tax,
          delivery_fee,
          service_fee,
          processing_fee,
        ),
      );
      setUpdateModal(true);
    } else {
      dispatch(
        updateFeeThunk(fees.id, {
          commission_fee: commission,
          tax_percentage: tax,
          delivery_fee: delivery_fee,
          service_fee: service_fee,
          processing_fee: processing_fee,
        }),
      );
      setUpdateModal(true);
    }
  };

  const handleOptionChange = async (option) => {
    if (fees.delivery_type === "doordash" && option === "instore") {
      swal({
        title: t("fees.swal.cant_not_set"),
        text: t("fees.swal.remove_request_delivery_msg"),
        icon: "warning",
        buttons: {
          cancel: t("common.ok"),
        },
      });
      return;
    }

    const gate = await swal({
      title: t("fees.swal.passcode_title"),
      text: t("fees.swal.passcode_desc"),
      content: {
        element: "input",
        attributes: {
          placeholder: t("fees.swal.passcode_placeholder"),
          type: "password",
          inputMode: "numeric",
        },
      },
      buttons: {
        cancel: t("common.cancel"),
        confirm: {
          text: t("fees.swal.passcode_confirm"),
          closeModal: false,
        },
      },
      closeOnClickOutside: false,
    });

    if (gate === null) return;
    const passcode = String(gate || "").trim();
    if (!passcode) {
      swal(t("common.error"), t("fees.swal.passcode_required"), "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/neworders/update-payment-method", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: userPlan?.restaurant_id,
          instoreOnline: option,
          passcode,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("NO_ACCESS");
        throw new Error("Update failed");
      }

      setSelectedOption(option);
      dispatch(getUserPlanThunk());
      setLoading(false);
      swal(
        t("fees.swal.updated_title"),
        t("fees.swal.payment_method_changed", { option: option }),
        "success",
      );
    } catch (error) {
      console.error("Failed to update payment method:", error);
      setLoading(false);
      if (error?.message === "NO_ACCESS") {
        swal(t("common.error"), t("fees.swal.passcode_incorrect"), "error");
        return;
      }
      swal(t("common.error"), t("fees.swal.payment_method_failed"), "error");
    }
  };

  const handleBothPaymentType = async (option, type) => {
    const plan = userPlan?.plan_type;

    // Prevent delivery-cash disable if DoorDash
    if (
      option === "delivery" &&
      type === "cash" &&
      delivery_type === "doordash"
    ) {
      swal({
        title: t("fees.swal.not_allowed"),
        text: t("fees.swal.request_delivery_online_only"),
        icon: "warning",
        buttons: {
          cancel: t("common.cancel"),
        },
      });
      return;
    }

    // --- Check if both would be disabled ---
    const currentCash =
      option === "pickup" ? fees?.pickup_cash : fees?.delivery_cash;
    const currentOnline =
      option === "pickup" ? fees?.pickup_online : fees?.delivery_online;

    const isDisabling =
      (type === "cash" && currentCash) || (type === "online" && currentOnline);

    const otherTypeEnabled =
      (type === "cash" && currentOnline) || (type === "online" && currentCash);

    // If user tries to untoggle the last enabled option (both would be false)
    if (isDisabling && !otherTypeEnabled) {
      swal({
        title: t("fees.swal.not_allowed"),
        text: t("fees.swal.at_least_one_enabled", { option: option }),
        icon: "warning",
        buttons: {
          cancel: t("common.cancel"),
        },
      });
      return;
    }

    const gate = await swal({
      title: t("fees.swal.passcode_title"),
      text: t("fees.swal.passcode_desc"),
      content: {
        element: "input",
        attributes: {
          placeholder: t("fees.swal.passcode_placeholder"),
          type: "password",
          inputMode: "numeric",
        },
      },
      buttons: {
        cancel: t("common.cancel"),
        confirm: {
          text: t("fees.swal.passcode_confirm"),
          closeModal: false,
        },
      },
      closeOnClickOutside: false,
    });

    if (gate === null) return;
    const passcode = String(gate || "").trim();
    if (!passcode) {
      swal(t("common.error"), t("fees.swal.passcode_required"), "error");
      return;
    }
    setLoading(true);

    // --- Continue with update ---
    try {
      const res = await fetch("/api/neworders/update-both-method", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: userPlan?.restaurant_id,
          option,
          type,
          passcode,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("NO_ACCESS");
        throw new Error("Update failed");
      }

      setSelectedOption(option);
      dispatch(getUserPlanThunk());
      dispatch(getFeesThunk());
      setLoading(false);
      swal(
        t("fees.swal.updated_title"),
        t("fees.swal.payment_method_changed", { option: `${option}-${type}` }),
        "success",
      );
    } catch (error) {
      console.error("Failed to update payment method:", error);
      setLoading(false);
      if (error?.message === "NO_ACCESS") {
        swal(t("common.error"), t("fees.swal.passcode_incorrect"), "error");
        return;
      }
      swal(t("common.error"), t("fees.swal.payment_method_failed"), "error");
    }
  };

  const handlePickupOptionChange = async (option) => {
    setLoading(true);
    try {
      const res = await fetch("/api/neworders/update-pickup-delivery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: userPlan?.restaurant_id,
          pickupDelivery: option,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setSelectedPickupOptions(option);
      dispatch(getUserPlanThunk());
      dispatch(getFeesThunk());
      setLoading(false);
      swal(
        "Updated!",
        `Order method successfully changed to "${option}".`,
        "success",
      );
    } catch (error) {
      console.error("Failed to update Order method:", error);
      setLoading(false);
      swal(
        "Error",
        "Failed to update Order method. Please try again.",
        "error",
      );
    }
  };

  const handleDeliveryOptionsChange = async (option) => {
    const plan = userPlan?.plan_type;
    //     // Deny doordash request only for free plan and no stripe subscription.
    // if (
    //   option === "doordash" &&
    //   ((!userPlan?.online_payment_enabled && plan !== "pro") ||
    //     !userPlan?.stripe_onboarded)
    // ) {
    //   swal({
    //     title: "Upgrade Required",
    //     text: `This access is not included in the ${plan}`,
    //     icon: "warning",
    //     buttons: {
    //       cancel: "Cancel",
    //       upgrade: {
    //         text: "Upgrade Now",
    //         value: "upgrade",
    //       },
    //     },
    //   }).then((value) => {
    //     if (value === "upgrade") {
    //       navigate("/plans");
    //     }
    //   });
    //   return;
    // }
    // if (selectedOption === "instore" && option === "doordash") {
    //   swal({
    //     title: t("fees.swal.not_allowed"),
    //     text: t("fees.swal.requires_online_payment"),
    //     icon: "warning",
    //     buttons: {
    //       cancel: t("common.ok"),
    //     },
    //   });
    //   return;
    // }

    // if (option === "both" && !userPlan?.complete_enabled && plan !== "pro") {
    //   swal({
    //     title: "Requires Tablet",
    //     text: `This access is not included in the ${plan}`,
    //     icon: "warning",
    //     buttons: {
    //       cancel: "Cancel",
    //       upgrade: {
    //         text: "Upgrade Now",
    //         value: "upgrade",
    //       },
    //     },
    //   }).then((value) => {
    //     if (value === "upgrade") {
    //       navigate("/plans");
    //     }
    //   });
    //   return;
    // }
    setLoading(true);
    try {
      const res = await fetch("/api/neworders/update-delivery-options", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: userPlan?.restaurant_id,
          option,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setSelectedPickupOptions(option);
      dispatch(getUserPlanThunk());
      dispatch(getFeesThunk());
      setLoading(false);
      swal(
        "Updated!",
        `Order method successfully changed to "${option}".`,
        "success",
      );
    } catch (error) {
      console.error("Failed to update Order method:", error);
      setLoading(false);
      swal(
        "Error",
        "Failed to update Order method. Please try again.",
        "error",
      );
    }
  };

  const handleSaveMaxDeliveryRange = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/neworders/update-max-delivery-range", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: fees.restaurant_id, // Assuming fees is in scope
          maxDeliveryRange: maxDeliveryRange,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error updating max delivery range:", error);
        setLoading(false);
        swal(
          "Error",
          error?.error || "Error updating max delivery range.",
          "error",
        );
        return;
      }

      const data = await response.json();
      setLoading(false);
      swal(t("common.success"), t("fees.swal.max_range_updated"), "success");
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      swal("Error", "An unexpected error occurred. Please try again.", "error");
    }
  };

  const tabs = [
    { key: "fees", label: "Fees & Tipping" },
    { key: "payments", label: "Payments" },
    { key: "delivery", label: "Delivery" },
    { key: "settings", label: "Order Settings" },
  ];

  return (
    <div className="col-xl-12 col-lg-12 container">
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 9999 }}
        >
          <div className="text-white text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        </div>
      )}

      <Tab.Container defaultActiveKey="fees">
        <Card className="mb-3 shadow-sm border-0">
          <Card.Body className="p-2">
            <Nav
              variant="pills"
              className="flex-row flex-wrap gap-2 justify-content-start"
            >
              {tabs.map((t) => (
                <Nav.Item key={t.key}>
                  <Nav.Link eventKey={t.key} className="px-3 py-2">
                    {t.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Body>
        </Card>

        <Tab.Content>
          {/* ───────────────────── Fees & Tipping ───────────────────── */}
          <Tab.Pane eventKey="fees">
            <div className="card mb-3">
              <div className="card-header">
                <h4 className="card-title">
                  Customer-Facing Fees{" "}
                  <small className="text-muted">
                    (100% retained by your business)
                  </small>
                </h4>
              </div>
              <div className="card-body">
                <div className="basic-form">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Row className="g-3">
                      <Col sm={6} md={4}>
                        <p className="fw-bold mb-1">Tax Percentage</p>
                        <small className="text-muted d-block mb-1">
                          Decimal (e.g. 0.0925 for 9.25%)
                        </small>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 0.0925"
                          value={tax}
                          onChange={handleTaxChange}
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <p className="fw-bold mb-1">
                          Commission Fee{" "}
                          <small className="text-muted">(optional)</small>
                        </p>
                        <small className="text-muted d-block mb-1">
                          Flat fee (e.g. 1 or 1.5)
                        </small>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 1.5"
                          value={commission}
                          onChange={handleCommissionChange}
                        />
                      </Col>
                      <Col sm={6} md={4}>
                        <p className="fw-bold mb-1">
                          Processing Fee{" "}
                          <small className="text-muted">(optional)</small>
                        </p>
                        <small className="text-muted d-block mb-1">
                          4 decimals (e.g. 0.0521 for 5.21%)
                        </small>
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          max="1"
                          className="form-control"
                          placeholder="e.g. 0.0521"
                          value={processing_fee}
                          onChange={(e) => setProcessingFee(e.target.value)}
                        />
                      </Col>
                      <Col sm={6} md={4} className="position-relative">
                        <p className="fw-bold mb-1">
                          Delivery Fee{" "}
                          <small className="text-muted">(delivery only)</small>
                        </p>
                        <small className="text-muted d-block mb-1">
                          Flat fee per delivery (e.g. 5.99)
                        </small>
                        <div
                          className="form-control d-flex align-items-center justify-content-between"
                          style={{
                            cursor: "pointer",
                            backgroundColor: "#f8f9fa",
                          }}
                          onClick={() => setShowDeliveryModal(true)}
                        >
                          <span>
                            {fees?.delivery_fee_type === "fixed"
                              ? `$${fees?.delivery_fee || "0.00"}`
                              : "Custom"}
                          </span>
                          <small className="text-primary">Edit</small>
                        </div>
                        {fees?.delivery_type === "doordash" &&
                          userPlan?.pickup_delivery === "both" && (
                            <div className="overlay-cover">
                              <div className="overlay-text">
                                OwnMenu Delivery（Provide By Doordash）
                              </div>
                            </div>
                          )}
                        {showDeliveryModal && (
                          <DeliveryFeeModal
                            delivery_fee={delivery_fee}
                            setDeliveryFee={setDeliveryFee}
                            handleSubmit={handleUpdate}
                            onClose={() => setShowDeliveryModal(false)}
                            fees={fees}
                          />
                        )}
                      </Col>
                      <Col sm={6} md={4} className="position-relative">
                        <p className="fw-bold mb-1">
                          Service Fee{" "}
                          <small className="text-muted">(delivery only)</small>
                        </p>
                        <small className="text-muted d-block mb-1">
                          Decimal (e.g. 0.05 for 5%)
                        </small>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 0.05"
                          value={service_fee}
                          onChange={(e) => setServiceFee(e.target.value)}
                          disabled={fees.delivery_type === "doordash"}
                        />
                        {fees?.delivery_type === "doordash" &&
                          userPlan?.pickup_delivery === "both" && (
                            <div className="overlay-cover">
                              <div className="overlay-text">
                                OwnMenu Delivery（Provide By Doordash）
                              </div>
                            </div>
                          )}
                      </Col>
                    </Row>
                    <div className="mt-3">
                      <Button
                        onClick={handleUpdate}
                        type="submit"
                        variant="primary"
                      >
                        Apply Fee Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <TipOptionsControl fees={fees} />
          </Tab.Pane>

          {/* ───────────────────── Payments ───────────────────── */}
          <Tab.Pane eventKey="payments">
            {userPlan ? (
              <div className="card mb-3">
                <div className="card-header">
                  <h4 className="card-title">
                    How should the website accept payments
                  </h4>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      {
                        id: "instoreOnly",
                        label: "In-Store Only",
                        value: "instore",
                      },
                      {
                        id: "onlineOnly",
                        label: "Online Payment Only",
                        value: "online",
                      },
                      {
                        id: "both",
                        label: "In-Store & Online Payment",
                        value: "both",
                      },
                    ].map((option) => (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`payment-option btn btn-outline-primary ${selectedOption === option.value ? "active" : ""
                          }`}
                      >
                        <input
                          className="form-check-input d-none"
                          type="radio"
                          name="paymentOption"
                          id={option.id}
                          value={option.value}
                          checked={selectedOption === option.value}
                          onChange={() => handleOptionChange(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>

                  {selectedOption === "both" && (
                    <div className="mt-3 p-3 border rounded">
                      <h6 className="mb-2">
                        Customize "Both" Payment Methods
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-primary">Pickup Orders</h6>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="instoreCash"
                              checked={inStoreCash}
                              onChange={() =>
                                handleBothPaymentType("pickup", "cash")
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="instoreCash"
                            >
                              In-Store Payment
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="instoreOnline"
                              checked={inStoreOnline}
                              onChange={() =>
                                handleBothPaymentType("pickup", "online")
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="instoreOnline"
                            >
                              Online Payment
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-primary">
                            Delivery Orders{" "}
                            <small className="text-muted">
                              (if delivery enabled)
                            </small>
                          </h6>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="onlineCash"
                              checked={onlineCash}
                              onChange={() =>
                                handleBothPaymentType("delivery", "cash")
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="onlineCash"
                            >
                              In-Store Payment
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="onlineOnline"
                              checked={onlineOnline}
                              onChange={() =>
                                handleBothPaymentType("delivery", "online")
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="onlineOnline"
                            >
                              Online Payment
                            </label>
                          </div>
                        </div>
                      </div>
                      <small className="text-muted d-block mt-2">
                        Customize how you accept payments for both in-store and
                        online orders.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                Loading plan information…
              </div>
            )}
          </Tab.Pane>

          {/* ───────────────────── Delivery ───────────────────── */}
          <Tab.Pane eventKey="delivery">
            {userPlan ? (
              <>
                <div className="card mb-3">
                  <div className="card-header">
                    <h4 className="card-title mb-0">
                      How should customers receive orders
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        {
                          id: "pickuponly",
                          label: "Pickup Only",
                          value: "pickup",
                        },
                        {
                          id: "pickupdelivery",
                          label: "Pickup & Delivery",
                          value: "both",
                        },
                      ].map((option) => (
                        <label
                          key={option.id}
                          htmlFor={option.id}
                          className={`payment-option btn btn-outline-primary ${selectedPickupOptions === option.value ? "active" : ""
                            }`}
                        >
                          <input
                            className="form-check-input d-none"
                            type="radio"
                            name="pickupOption"
                            id={option.id}
                            value={option.value}
                            checked={selectedPickupOptions === option.value}
                            onChange={() =>
                              handlePickupOptionChange(option.value)
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    {selectedPickupOptions === "both" && (
                      <div className="mt-3 p-3 border rounded">
                        <h6 className="mb-2 text-primary">
                          Customize Delivery Options
                        </h6>
                        {autoDeliveryEnabled && (
                          <div className="alert alert-info py-2 px-3 small mb-3">
                            Automatic delivery switch is enabled. Delivery
                            method is controlled by the schedule below. To
                            change manually, disable the automatic switch
                            first.
                          </div>
                        )}
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="selfDelivery"
                            checked={delivery_type === "self"}
                            disabled={autoDeliveryEnabled}
                            onChange={(e) =>
                              handleDeliveryOptionsChange("self")
                            }
                          />
                          <label
                            className="form-check-label d-flex flex-column"
                            htmlFor="selfDelivery"
                          >
                            <span>
                              Self Delivery{" "}
                              <small className="text-muted">
                                (Handled by Your Restaurant)
                              </small>
                            </span>
                            <small className="d-flex align-items-center mt-1 fw-bold">
                              – You are responsible for delivering orders
                              directly to customers.
                            </small>
                          </label>
                        </div>

                        <div className="form-check d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="requestDelivery"
                            checked={delivery_type === "doordash"}
                            disabled={autoDeliveryEnabled}
                            onChange={(e) =>
                              handleDeliveryOptionsChange("doordash")
                            }
                          />
                          <label
                            className="form-check-label d-flex flex-column"
                            htmlFor="requestDelivery"
                          >
                            <span>
                              Request Delivery{" "}
                              <small className="text-muted">
                                (by Doordash)
                              </small>
                            </span>
                            <small className="d-flex align-items-center mt-1 fw-bold">
                              – No cost to you — we charge from customers.
                            </small>
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="bothDelivery"
                            value="both"
                            checked={delivery_type === "both"}
                            disabled={autoDeliveryEnabled}
                            onChange={(e) =>
                              handleDeliveryOptionsChange("both")
                            }
                          />
                          <label
                            className="form-check-label d-flex flex-column"
                            htmlFor="bothDelivery"
                          >
                            <span>
                              Flexible Delivery{" "}
                              <small className="text-muted">
                                (Self or Doordash as Needed)
                              </small>
                            </span>
                            <small className="d-flex align-items-center mt-1 fw-bold">
                              – Customers pay your delivery fee (fixed or
                              dynamic) and service fee, up to 5 miles. You
                              deliver yourself or request DoorDash per order
                              <span className="fw-bold text-primary ms-1">
                                (DoorDash driver request is billed to you
                                separately, not at customer checkout)
                              </span>
                              .
                            </small>
                          </label>
                        </div>

                        <hr />

                        <div className="position-relative">
                          <label
                            htmlFor="maxDeliveryRange"
                            className="form-label fw-bold"
                          >
                            Maximum Delivery Range (miles)
                          </label>
                          <div className="position-relative d-flex align-items-center">
                            <input
                              type="number"
                              id="maxDeliveryRange"
                              className="form-control me-2"
                              style={{ maxWidth: "240px" }}
                              min={0}
                              step={0.1}
                              value={maxDeliveryRange}
                              onChange={(e) =>
                                setMaxDeliveryRange(e.target.value)
                              }
                              placeholder="Enter max delivery distance"
                            />
                            <Button
                              variant="primary"
                              onClick={handleSaveMaxDeliveryRange}
                            >
                              Save
                            </Button>
                            {fees?.delivery_type === "doordash" &&
                              userPlan?.pickup_delivery === "both" && (
                                <div className="overlay-cover">
                                  <div className="overlay-text">
                                    OwnMenu Delivery（Provide By Doordash）
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPickupOptions === "both" && <DeliverySchedule />}
              </>
            ) : (
              <div className="alert alert-info">
                Loading plan information…
              </div>
            )}
          </Tab.Pane>

          {/* ───────────────────── Order Settings ───────────────────── */}
          <Tab.Pane eventKey="settings">
            <div className="card mb-3">
              <div className="card-header">
                <h4 className="card-title">Customer Order Options</h4>
              </div>
              <div className="card-body">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="disallowSpecialInstructions"
                    checked={disallowSpecialInstructions}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setDisallowSpecialInstructions(value);
                      const ok = await dispatch(
                        updateDisallowSpecialInstructionsThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setDisallowSpecialInstructions(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="disallowSpecialInstructions"
                  >
                    Do not allow special requests
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  When enabled, customers cannot add special instructions (e.g.
                  notes for the kitchen) when adding or editing items in the
                  cart.
                </small>

                <hr className="my-3" />

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowOrderNotes"
                    checked={allowOrderNotes}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setAllowOrderNotes(value);
                      const ok = await dispatch(
                        updateAllowOrderNotesThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setAllowOrderNotes(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="allowOrderNotes"
                  >
                    Allow order notes at checkout
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  When enabled (default), customers can add an order-level note
                  on the checkout page. Turn off to hide that section.
                </small>

                <hr className="my-3" />

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="askForUtensils"
                    checked={askForUtensils}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setAskForUtensils(value);
                      const ok = await dispatch(
                        updateAskForUtensilsThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setAskForUtensils(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="askForUtensils"
                  >
                    {t("fees.order_options.ask_for_utensils")}
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  {t("fees.order_options.ask_for_utensils_desc")}
                </small>

                <hr className="my-3" />

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="singleDealOnly"
                    checked={singleDealOnly}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setSingleDealOnly(value);
                      const ok = await dispatch(
                        updateSingleDealOnlyThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setSingleDealOnly(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="singleDealOnly"
                  >
                    Allow only one deal at checkout
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  When enabled, customers can only use one deal at a time (Free
                  Item, Reward, Coupon, or BOGO) during checkout.
                </small>

                <hr className="my-3" />

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsVerificationNeed"
                    checked={smsVerificationNeed}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setSmsVerificationNeed(value);
                      const ok = await dispatch(
                        updateSmsVerificationNeedThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setSmsVerificationNeed(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="smsVerificationNeed"
                  >
                    {t("fees.order_options.sms_verification_need")}
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  {t("fees.order_options.sms_verification_need_desc")}
                </small>

                <hr className="my-3" />

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="disableScheduleOrders"
                    checked={disableScheduleOrders}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setDisableScheduleOrders(value);
                      const ok = await dispatch(
                        updateDisableScheduleOrdersThunk(
                          userPlan?.restaurant_id,
                          value
                        )
                      );
                      if (!ok) {
                        setDisableScheduleOrders(!value);
                        swal("Error", "Failed to update setting.", "error");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="disableScheduleOrders"
                  >
                    {t("fees.order_options.disable_schedule_orders")}
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  {t("fees.order_options.disable_schedule_orders_desc")}
                </small>

                <hr className="my-3" />

                <div className="row align-items-end">
                  <div className="col-sm-6 col-md-4">
                    <label
                      htmlFor="cateringLeadTime"
                      className="form-label fw-bold"
                    >
                      Catering lead time (hours)
                    </label>
                    <input
                      id="cateringLeadTime"
                      type="number"
                      min={0}
                      max={720}
                      step={1}
                      className="form-control"
                      value={cateringLeadTime}
                      onChange={(e) =>
                        setCateringLeadTime(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    <small className="text-muted d-block mt-1">
                      Minimum hours in advance customers must schedule a catering order.
                    </small>
                  </div>
                  <div className="col-sm-auto mt-2 mt-sm-0">
                    <Button
                      variant="primary"
                      disabled={loading || !userPlan?.restaurant_id}
                      onClick={async () => {
                        const n =
                          cateringLeadTime === ""
                            ? NaN
                            : parseInt(String(cateringLeadTime), 10);
                        if (!Number.isFinite(n) || n < 0 || n > 720) {
                          swal(
                            "Invalid value",
                            "Enter an integer between 0 and 720.",
                            "warning"
                          );
                          return;
                        }
                        setLoading(true);
                        const ok = await dispatch(
                          updateCateringLeadTimeThunk(
                            userPlan.restaurant_id,
                            n
                          )
                        );
                        setLoading(false);
                        if (!ok) {
                          swal("Error", "Failed to save catering lead time.", "error");
                        } else {
                          swal(
                            "Saved",
                            "Catering lead time updated.",
                            "success"
                          );
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-header">
                <h4 className="card-title">Restaurant App Automation</h4>
              </div>
              <div className="card-body">
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoAcceptOrder"
                    checked={autoAcceptOrder}
                    onChange={async (e) => {
                      const value = e.target.checked;
                      setAutoAcceptOrder(value);
                      const ok = await dispatch(
                        updateRestaurantOrderAutomationThunk(
                          userPlan?.restaurant_id,
                          { auto_accept_order: value }
                        )
                      );
                      if (!ok) {
                        setAutoAcceptOrder(!value);
                        swal("Error", "Failed to update auto-accept.", "error");
                      } else {
                        swal("Saved", "Auto-accept updated.", "success");
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="autoAcceptOrder"
                  >
                    Auto-accept new orders (restaurant app)
                  </label>
                </div>
                <small className="text-muted d-block mb-3">
                  When off, incoming orders stay pending until staff accepts
                  them in the app.
                </small>
                <div className="row align-items-end">
                  <div className="col-sm-6 col-md-4">
                    <label
                      htmlFor="orderBufferMinutes"
                      className="form-label fw-bold"
                    >
                      Scheduled order buffer (minutes)
                    </label>
                    <input
                      id="orderBufferMinutes"
                      type="number"
                      min={1}
                      max={10080}
                      step={1}
                      className="form-control"
                      value={orderBufferMinutes}
                      onChange={(e) =>
                        setOrderBufferMinutes(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    <small className="text-muted d-block mt-1">
                      How far ahead scheduled pickups appear in the app
                      (1–10080 minutes).
                    </small>
                  </div>
                  <div className="col-sm-auto mt-2 mt-sm-0">
                    <Button
                      variant="primary"
                      disabled={loading || !userPlan?.restaurant_id}
                      onClick={async () => {
                        const n =
                          orderBufferMinutes === ""
                            ? NaN
                            : parseInt(String(orderBufferMinutes), 10);
                        if (!Number.isFinite(n) || n < 1 || n > 10080) {
                          swal(
                            "Invalid value",
                            "Enter an integer between 1 and 10080.",
                            "warning"
                          );
                          return;
                        }
                        setLoading(true);
                        const ok = await dispatch(
                          updateRestaurantOrderAutomationThunk(
                            userPlan.restaurant_id,
                            { order_buffer_minutes: n }
                          )
                        );
                        setLoading(false);
                        if (!ok) {
                          swal("Error", "Failed to save buffer.", "error");
                        } else {
                          swal(
                            "Saved",
                            "Scheduled order buffer updated.",
                            "success"
                          );
                        }
                      }}
                    >
                      {t("fees.app_automation.save_buffer_btn")}
                    </Button>
                  </div>
                  <div className="col-sm-6 col-md-4 mt-3 mt-md-0">
                    <label
                      htmlFor="autoPrepTimeMinutes"
                      className="form-label fw-bold"
                    >
                      {t("fees.app_automation.auto_prep_time")}
                    </label>
                    <input
                      id="autoPrepTimeMinutes"
                      type="number"
                      min={0}
                      max={480}
                      step={1}
                      className="form-control"
                      placeholder="20"
                      value={autoPrepTimeMinutes}
                      onChange={(e) =>
                        setAutoPrepTimeMinutes(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    <small className="text-muted d-block mt-1">
                      {t("fees.app_automation.auto_prep_time_desc")}
                    </small>
                  </div>
                  <div className="col-sm-auto mt-2 mt-sm-0">
                    <Button
                      variant="primary"
                      disabled={loading || !userPlan?.restaurant_id}
                      onClick={async () => {
                        const raw =
                          autoPrepTimeMinutes === ""
                            ? 0
                            : parseInt(String(autoPrepTimeMinutes), 10);
                        if (!Number.isFinite(raw) || raw < 0 || raw > 480) {
                          swal(
                            "Invalid value",
                            "Enter 0 for default (20 min) or an integer between 1 and 480.",
                            "warning"
                          );
                          return;
                        }
                        setLoading(true);
                        const ok = await dispatch(
                          updateRestaurantOrderAutomationThunk(
                            userPlan.restaurant_id,
                            { auto_prep_time_minutes: raw === 0 ? null : raw }
                          )
                        );
                        setLoading(false);
                        if (!ok) {
                          swal("Error", "Failed to save prep time.", "error");
                        } else {
                          swal(
                            "Saved",
                            "Auto-accept prep time updated.",
                            "success"
                          );
                        }
                      }}
                    >
                      {t("fees.app_automation.save_prep_time_btn")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <Modal show={updateModal} onHide={toggleUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t("fees.modal.update_success_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("fees.modal.update_success_body")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleUpdateModal}>
            {t("common.ok")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Fees;
