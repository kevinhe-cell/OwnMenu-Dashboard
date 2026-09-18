import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Row, Col, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updatePaymentIntentThunk } from "../../../store/stripe";
import Swal from "sweetalert2";
import { deleteOrderThunk, hardDeleteOrderThunk, updateDeliverByThunk } from "../../../store/orders";
import PasscodeModal from "../Stripe/PasscodeModal";
import { getToken } from "../../../store/utlits";
import { OrderItemModifiersBlock } from "./orderModifierDisplay";
import { OrderSourceBadge } from "./orderSourceBadge";
import { useTranslation } from "react-i18next";

const OrderDetailsModal = ({
  showModal,
  selectedOrder,
  setShowModal,
  fees,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const id = useSelector((state) => state.session.user.id);
  const restaurantId = useSelector((state) => state.session.user.restaurant_id);
  const adminRestaurant = useSelector((state) => state.restaurant.restaurant);
  // States
  const [newChargeModal, setNewChargeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  // Passcode & Security Logic
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'refund' or 'charge'

  const [partialRefund, setPartialRefund] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundMode, setRefundMode] = useState("amount"); // amount | items
  // { [orderItemId]: quantity }
  const [selectedRefundItems, setSelectedRefundItems] = useState({});
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  // Loading States
  const [loading, setLoading] = useState({
    receipt: false,
    delivery: false,
    extraCharge: false,
    delete: false,
    hardDelete: false,
    refund: false,
  });
  const [showHardDeleteModal, setShowHardDeleteModal] = useState(false);
  const [hardDeletePassword, setHardDeletePassword] = useState("");
  const [hardDeleteError, setHardDeleteError] = useState("");

  const getOrderItemUnitTotal = (item) => {
    const basePrice = Number(item?.item_price || 0);
    const optionUnit = (item?.Order_Item_Attributes || []).reduce((acc, attr) => {
      const optPrice = Number(attr?.Item_Attribute_Option?.price_modifier || 0);
      const optQty = Number(attr?.quantity || 1);
      return acc + optPrice * optQty;
    }, 0);
    const specialUnit = (item?.OrderItemSpecialAttributes || []).reduce((acc, attr) => {
      const spPrice = Number(attr?.price || 0);
      const spQty = Number(attr?.quantity || 1);
      return acc + spPrice * spQty;
    }, 0);
    return basePrice + optionUnit + specialUnit;
  };

  const getRefundableRemaining = () => {
    const orderTotal = Number(selectedOrder?.order_total || 0);
    const alreadyRefunded = Number(selectedOrder?.refund_amount || 0);
    return Math.max(0, Number((orderTotal - alreadyRefunded).toFixed(2)));
  };

  const getItemsRefundPreview = () => {
    const orderItems = selectedOrder?.OrderItems || [];
    let linesSubtotal = 0;
    Object.entries(selectedRefundItems).forEach(([id, qty]) => {
      const item = orderItems.find((row) => String(row.id) === String(id));
      if (!item || !qty) return;
      linesSubtotal += getOrderItemUnitTotal(item) * Number(qty);
    });
    linesSubtotal = Number(linesSubtotal.toFixed(2));
    const orderSubtotal = Number(selectedOrder?.subtotal || 0);
    const orderTax = Number(selectedOrder?.tax || 0);
    let taxPortion = 0;
    if (orderSubtotal > 0 && orderTax > 0 && linesSubtotal > 0) {
      taxPortion = Number(((linesSubtotal / orderSubtotal) * orderTax).toFixed(2));
      if (taxPortion > orderTax) taxPortion = Number(orderTax.toFixed(2));
    }
    const total = Number((linesSubtotal + taxPortion).toFixed(2));
    return { linesSubtotal, taxPortion, total };
  };

  const resetRefundForm = () => {
    setPartialRefund("");
    setRefundReason("");
    setRefundMode("amount");
    setSelectedRefundItems({});
  };

  const handleOpenRefund = () => {
    resetRefundForm();
    if (passcodeVerified) {
      setShowRefundModal(true);
    } else {
      setPendingAction("refund");
      setShowPasscodeModal(true);
    }
  };

  const toggleRefundItem = (item) => {
    const id = item.id;
    setSelectedRefundItems((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = Number(item.quantity || 1);
      }
      return next;
    });
  };

  const setRefundItemQty = (item, qty) => {
    const maxQty = Number(item.quantity || 1);
    let nextQty = parseInt(qty, 10);
    if (!Number.isFinite(nextQty) || nextQty < 1) nextQty = 1;
    if (nextQty > maxQty) nextQty = maxQty;
    setSelectedRefundItems((prev) => ({ ...prev, [item.id]: nextQty }));
  };

  const handleOpenNewChargeModal = () => {
    if (passcodeVerified) {
      setNewChargeModal(true);
    } else {
      setPendingAction("charge");
      setShowPasscodeModal(true);
    }
  };

  const handlePasscodeSuccess = () => {
    setPasscodeVerified(true);
    setShowPasscodeModal(false);

    if (pendingAction === "refund") {
      setShowRefundModal(true);
    } else if (pendingAction === "charge") {
      setNewChargeModal(true);
    }
    setPendingAction(null);
  };

  useEffect(() => {
    if (
      (selectedOrder?.deliver_by === "doordash" ||
        selectedOrder?.deliver_by === "uber") &&
      selectedOrder?.order_id
    ) {
      fetchDeliveryDetails();
    } else {
      setDeliveryInfo(null);
    }
  }, [selectedOrder?.deliver_by, selectedOrder?.order_id, showModal]);

  const fetchDeliveryDetails = async () => {
    if (!selectedOrder?.order_id) return;

    setLoading((prev) => ({ ...prev, delivery: true }));
    try {
      const isUber = selectedOrder.deliver_by === "uber";
      const url = isUber
        ? `/api/drivers/uber-delivery-status?order_id=${selectedOrder.order_id}`
        : `/api/drivers/get-delivery?order_id=${selectedOrder.order_id}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Fetch error:", errorData?.error || "Unknown error");
        setDeliveryInfo(null);
      } else {
        const data = await res.json();
        setDeliveryInfo(data);
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
      setDeliveryInfo(null);
    } finally {
      setLoading((prev) => ({ ...prev, delivery: false }));
    }
  };

  const handleViewReceipt = async () => {
    setLoading((prev) => ({ ...prev, receipt: true }));
    try {
      const res = await fetch(`/api/orders/receipt/find`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
         },
        body: JSON.stringify({ restaurant_id: selectedOrder?.restaurant_id, order_id: selectedOrder.order_id }),
      });

      const data = await res.json();

      if (!res.ok || !data?.receipt_url) {
        throw new Error(t('orders.details.receipt_error'));
      }

      window.open(data.receipt_url, "_blank");
    } catch (err) {
      console.error(err);
      alert(t('orders.details.receipt_open_error'));
    } finally {
      setLoading((prev) => ({ ...prev, receipt: false }));
    }
  };

  const formatDates = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString();
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString();
  };

  const updatePaymentIntent = (id, tipAmount, order_id, restaurant_id) => {
    setLoading((prev) => ({ ...prev, extraCharge: true }));
    dispatch(updatePaymentIntentThunk(id, tipAmount, order_id, restaurant_id))
      .then((response) => {
        if (response.ok) {
          setNewChargeModal(false);
          setShowModal(false);
          Swal.fire({
            title: t('common.success'),
            text: t('orders.details.tip_update_success'),
            icon: "success",
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            title: t('common.error'),
            text: t('orders.details.tip_update_error'),
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.error("Error updating tip:", error);
        Swal.fire({
          title: t('common.error'),
          text: t('orders.details.tip_update_error'),
          icon: "error",
          confirmButtonText: "OK",
        });
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, extraCharge: false }));
      });
  };

  const updateOrder = (order_id, restaurant_id) => {
    setLoading((prev) => ({ ...prev, delete: true }));
    dispatch(deleteOrderThunk(order_id, restaurant_id, id))
      .then(() => {
        setShowModal(false);
        Swal.fire({
          title: t('common.success'),
          text: t('orders.details.order_delete_success'),
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, delete: false }));
      });
  };

  const openHardDelete = () => {
    setHardDeletePassword("");
    setHardDeleteError("");
    setShowHardDeleteModal(true);
  };

  const confirmHardDelete = async () => {
    setHardDeleteError("");
    if (String(hardDeletePassword) !== "0930") {
      setHardDeleteError(t('orders.details.hard_delete_incorrect_password'));
      return;
    }
    if (!selectedOrder?.order_id) return;

    const confirmed = await Swal.fire({
      title: t('orders.details.hard_delete_confirm_title'),
      text: t('orders.details.hard_delete_confirm_text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('orders.details.hard_delete_confirm_button'),
      cancelButtonText: t('orders.details.close'),
      confirmButtonColor: "#dc3545",
    });
    if (!confirmed.isConfirmed) return;

    setLoading((prev) => ({ ...prev, hardDelete: true }));
    try {
      await dispatch(hardDeleteOrderThunk(selectedOrder.order_id, hardDeletePassword));
      setShowHardDeleteModal(false);
      setShowModal(false);
      await Swal.fire({
        title: t('common.success'),
        text: t('orders.details.hard_delete_success'),
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      setHardDeleteError(err.message || t('orders.details.hard_delete_error'));
      Swal.fire(t('common.error'), err.message || t('orders.details.hard_delete_error'), "error");
    } finally {
      setLoading((prev) => ({ ...prev, hardDelete: false }));
    }
  };

  const handleSubmitRefund = async ({ mode, amount, items } = {}) => {
    setLoading((prev) => ({ ...prev, refund: true }));
    try {
      const token = getToken();
      const targetRestaurantId = selectedOrder?.restaurant_id || restaurantId;
      const body = {
        orderId: selectedOrder?.order_id,
        restaurantId: targetRestaurantId,
        mode,
        reason: refundReason,
      };
      if (mode === "partial") body.amount = amount;
      if (mode === "items") body.items = items;

      const res = await fetch("/api/stripe/refund-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        const refunded = data?.refunded_amount
          ? ` $${Number(data.refunded_amount).toFixed(2)}`
          : "";
        Swal.fire(
          t("common.success"),
          `${t("orders.details.refund_success")}${refunded}`,
          "success",
        );
        resetRefundForm();
        setShowRefundModal(false);
        setShowModal(false);
      } else {
        const detailParts = [
          data?.error,
          data?.detail && data.detail !== data.error ? data.detail : null,
          data?.code ? `(${data.code})` : null,
          data?.decline_code ? `decline: ${data.decline_code}` : null,
        ].filter(Boolean);
        Swal.fire(
          t("common.error"),
          detailParts.join(" — ") || t("orders.details.refund_error"),
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire(t('common.error'), t('orders.details.refund_network_error'), "error");
    } finally {
      setLoading((prev) => ({ ...prev, refund: false }));
    }
  };

  const checkWords = (word) => {
    switch (word) {
      case "created": return t('orders.delivery_status.created');
      case "enroute_to_pickup": return t('orders.delivery_status.enroute_to_pickup');
      case "arrived_at_pickup": return t('orders.delivery_status.arrived_at_pickup');
      case "picked_up": return t('orders.delivery_status.picked_up');
      case "enroute_to_dropoff": return t('orders.delivery_status.enroute_to_dropoff');
      case "arrived_at_dropoff": return t('orders.delivery_status.arrived_at_dropoff');
      case "delivered": return t('orders.delivery_status.delivered');
      default: return word;
    }
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <div className="w-100 text-center">
            <Modal.Title className="d-flex flex-wrap align-items-center justify-content-center gap-2">
              <span>{t('orders.details.title')}{selectedOrder?.order_id}</span>
              {selectedOrder ? <OrderSourceBadge order={selectedOrder} /> : null}
            </Modal.Title>

            {selectedOrder?.address &&
              selectedOrder?.address !== "Pickup" &&
              selectedOrder?.deliver_by === null && (
                <div className="alert alert-danger py-2 mt-2 mb-0">
                  <strong>⚠️ {t('orders.details.attention')}:</strong> {t('orders.details.no_driver_notice')}
                </div>
              )}
          </div>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <Col lg={7} style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>{t('orders.details.quantity')}</th>
                    <th>{t('orders.details.item')}</th>
                    <th>{t('orders.details.price')}</th>
                  </tr>
                </thead>
                <tbody>
                 {selectedOrder?.OrderItems?.map((item) => (
  <tr key={item.id} className="align-top">
    {/* Quantity Column */}
    <td className="text-center" style={{ width: '50px' }}>
      <span className="badge bg-dark fs-6">{item?.quantity}</span>
    </td>

    {/* Item Details Column */}
    <td>
      <div className="mb-2">
        <div className="fw-bold text-uppercase" style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>
          {item?.Item?.chinese_name}
        </div>
        <div className="fw-bold text-primary">{item?.Item?.name}</div>
      </div>

      {/* Attributes & Special Mods Container */}
      <div className="ps-2 border-start border-3 border-light">
        {/* 1. Standard modifiers — API order; root vs nested UI */}
        <OrderItemModifiersBlock orderItem={item} />

        {/* 2. Special Pizza Attributes (Crusts & Toppings) */}
        {item?.OrderItemSpecialAttributes?.map((special) => (
          <div key={special.id} className="small mb-1">
            <span className="fw-bold text-danger">
               + ({special.quantity}) {special.name}
            </span>
            
            {/* Metadata (Left, Right, Extra, etc.) */}
            <span className="ms-2 px-2 py-0 bg-warning-subtle border border-warning rounded-pill text-dark" style={{ fontSize: '0.7rem' }}>
               {special.position === 'all' ? 'Whole' : special.position}
              {` | ${special.portion}`}
            </span>

            {special.price > 0 && (
              <span className="ms-1 text-muted">+${special.price}</span>
            )}
          </div>
        ))}

        {/* 3. Kitchen Instructions */}
        {item?.special_instructions && (
          <div className="mt-2 p-2 bg-danger-subtle border-start border-danger border-3 rounded-end">
             <i className="bi bi-info-circle-fill me-1"></i>
             <span className="fw-bold text-danger">{t('orders.details.note')}: </span>
             <span className="fst-italic">{item?.special_instructions}</span>
          </div>
        )}
      </div>
    </td>

    {/* Price Column */}
    <td className="text-end fw-bold">
      ${Number(item?.item_price).toFixed(2)}
    </td>
  </tr>
))}
                </tbody>
              </Table>
            </Col>
            <Col lg={5}>
              <div>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.order_date')}:</strong>
                  </Col>
                  <Col xs={6}>
                    {formatDates(selectedOrder?.createdAt)} /{" "}
                    {formatTime(selectedOrder?.createdAt)}
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.order_status')}:</strong>
                  </Col>
                  <Col xs={6}>
                    <span
                      className={
                        selectedOrder?.order_status === "CLOSE"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {selectedOrder?.order_status}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.payment')}:</strong>
                  </Col>
                  <Col xs={6}>
                    <span
                      className={
                        selectedOrder?.payment_method === "in-store"
                          ? "text-warning"
                          : "text-success"
                      }
                    >
                      {selectedOrder?.payment_method === "in-store"
                        ? t('orders.details.unpaid')
                        : t('orders.details.paid')}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.pickup_time')}:</strong>
                  </Col>
                  <Col xs={6}>{selectedOrder?.pickup_time}</Col>
                </Row>
                {(selectedOrder?.order_note || selectedOrder?.need_utensils) && (
                  <>
                    {selectedOrder?.need_utensils ? (
                      <Row className="mt-2">
                        <Col xs={6}>
                          <strong>Utensils:</strong>
                        </Col>
                        <Col xs={6}>Yes — include utensils</Col>
                      </Row>
                    ) : null}
                    {selectedOrder?.order_note ? (
                      <Row className="mt-2">
                        <Col xs={6}>
                          <strong>Order note:</strong>
                        </Col>
                        <Col xs={6} style={{ whiteSpace: "pre-wrap" }}>
                          {selectedOrder.order_note}
                        </Col>
                      </Row>
                    ) : null}
                  </>
                )}
                {selectedOrder?.address &&
                  selectedOrder?.address !== "Pickup" && (
                    <>
                      <Row>
                        <div className="border-top my-3"></div>
                        <Col xs={6}>
                          <strong>{t('orders.details.address')}:</strong>
                        </Col>
                        <Col xs={6}>{selectedOrder?.address}</Col>
                        <br />
                        <Col xs={6}>
                          <strong>{t('orders.details.apt_instruction')}:</strong>
                        </Col>
                        <Col xs={6}>
                          {selectedOrder?.delivery_apt_number} -{" "}
                          {selectedOrder?.delivery_instruction}
                        </Col>
                      </Row>

                      <Row className="mt-3">
                        <Col xs={12}>
                          {selectedOrder.deliver_by === null ? (
                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                className="btn btn-sm btn-outline-primary w-100"
                                onClick={() => {
                                  dispatch(updateDeliverByThunk(selectedOrder, "restaurant"));
                                  setShowModal(false);
                                }}
                              >
                                {t('orders.details.we_deliver')}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => {
                                  dispatch(updateDeliverByThunk(selectedOrder, "doordash", adminRestaurant));
                                  setShowModal(false);
                                }}
                              >
                                {t('orders.details.request_driver')}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-dark w-100"
                                onClick={() => {
                                  dispatch(
                                    updateDeliverByThunk(
                                      selectedOrder,
                                      "uber",
                                      adminRestaurant,
                                    ),
                                  );
                                  setShowModal(false);
                                }}
                              >
                                Request Uber
                              </button>
                            </div>
                          ) : selectedOrder.deliver_by === "restaurant" ? (
                            <div className="alert alert-primary mt-2 text-center p-3">
                              <div>{t('orders.details.you_delivering')}</div>
                            </div>
                          ) : selectedOrder.deliver_by === "undeliverable" ? (
                            <div className="alert alert-danger mt-2 text-center p-3">
                              <div>
                                Platform delivery failed (DoorDash and Uber).
                              </div>
                              <div className="d-flex gap-2 mt-2 flex-wrap">
                                <button
                                  className="btn btn-sm btn-outline-primary w-100"
                                  onClick={() => {
                                    dispatch(
                                      updateDeliverByThunk(
                                        selectedOrder,
                                        "restaurant",
                                      ),
                                    );
                                    setShowModal(false);
                                  }}
                                >
                                  {t("orders.details.we_deliver")}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary w-100"
                                  onClick={() => {
                                    dispatch(
                                      updateDeliverByThunk(
                                        selectedOrder,
                                        "doordash",
                                        adminRestaurant,
                                      ),
                                    );
                                    setShowModal(false);
                                  }}
                                >
                                  {t("orders.details.re_request_driver")}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-dark w-100"
                                  onClick={() => {
                                    dispatch(
                                      updateDeliverByThunk(
                                        selectedOrder,
                                        "uber",
                                        adminRestaurant,
                                      ),
                                    );
                                    setShowModal(false);
                                  }}
                                >
                                  Request Uber
                                </button>
                              </div>
                            </div>
                          ) : selectedOrder.deliver_by === "doordash" ||
                            selectedOrder.deliver_by === "uber" ? (
                            <div className="alert alert-warning mt-2 p-3 position-relative">
                              <div className="d-flex justify-content-between align-items-start">
                                <strong className="me-2">
                                  {selectedOrder.deliver_by === "uber"
                                    ? "Uber delivering"
                                    : t("orders.details.doordash_delivering")}
                                </strong>
                                <button
                                  onClick={fetchDeliveryDetails}
                                  className="btn btn-sm btn-light py-0 px-2 border"
                                  title="Refresh"
                                  disabled={loading.delivery}
                                >
                                  {loading.delivery ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    "🔄"
                                  )}
                                </button>
                              </div>

                              {selectedOrder.deliver_by === "doordash" && (
                                <button
                                  className="btn btn-sm btn-outline-dark mt-2 w-100"
                                  onClick={() => {
                                    dispatch(
                                      updateDeliverByThunk(
                                        selectedOrder,
                                        "uber",
                                        adminRestaurant,
                                      ),
                                    );
                                    setShowModal(false);
                                  }}
                                >
                                  Cancel DoorDash &amp; Request Uber
                                </button>
                              )}

                              {loading.delivery && (
                                <div className="mt-2 small text-muted fst-italic">
                                  {t("common.refreshing")}
                                </div>
                              )}

                              {deliveryInfo && !loading.delivery ? (
                                <div className="mt-1 small text-start text-black">
                                  <div>
                                    <strong>{t("orders.status")}:</strong>{" "}
                                    {selectedOrder.deliver_by === "uber"
                                      ? checkWords(
                                          deliveryInfo?.status ||
                                            selectedOrder.uber_delivery_status,
                                        )
                                      : checkWords(
                                          deliveryInfo?.data?.delivery_status,
                                        )}
                                    <br />
                                    {(selectedOrder.deliver_by === "uber"
                                      ? deliveryInfo?.tracking_url ||
                                        selectedOrder.uber_tracking_url
                                      : deliveryInfo?.data?.tracking_url) && (
                                      <a
                                        href={
                                          selectedOrder.deliver_by === "uber"
                                            ? deliveryInfo?.tracking_url ||
                                              selectedOrder.uber_tracking_url
                                            : deliveryInfo?.data?.tracking_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {selectedOrder.deliver_by === "uber"
                                          ? deliveryInfo?.tracking_url ||
                                            selectedOrder.uber_tracking_url
                                          : deliveryInfo?.data?.tracking_url}
                                      </a>
                                    )}
                                    <br />
                                    {selectedOrder.deliver_by === "doordash" &&
                                      (deliveryInfo?.data?.delivery_status ===
                                        "cancelled" ||
                                        deliveryInfo?.data?.delivery_status ===
                                          "canceled") && (
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => {
                                            dispatch(
                                              updateDeliverByThunk(
                                                selectedOrder,
                                                "doordash",
                                                adminRestaurant,
                                              ),
                                            );
                                            setShowModal(false);
                                          }}
                                        >
                                          {t(
                                            "orders.details.re_request_driver",
                                          )}
                                        </button>
                                      )}
                                  </div>
                                </div>
                              ) : selectedOrder.deliver_by === "uber" &&
                                selectedOrder.uber_tracking_url &&
                                !loading.delivery ? (
                                <div className="mt-1 small text-start text-black">
                                  <a
                                    href={selectedOrder.uber_tracking_url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {selectedOrder.uber_tracking_url}
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </Col>
                      </Row>
                    </>
                  )}

                <div className="border-top my-3"></div>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.name')}:</strong>
                  </Col>
                  <Col xs={6}>{selectedOrder?.name}</Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.phone')}:</strong>
                  </Col>
                  <Col xs={6}>{selectedOrder?.phone_number}</Col>
                </Row>
                {selectedOrder?.email && (
                  <Row>
                    <Col xs={6}>
                      <strong>{t('orders.details.email')}:</strong>
                    </Col>
                    <Col xs={6}>{selectedOrder?.email}</Col>
                  </Row>
                )}
                <div className="border-top my-3"></div>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.subtotal')}:</strong>
                  </Col>
                  <Col xs={6}>
                    <td>
                      $
                      {String(selectedOrder?.subtotal).includes(".")
                        ? String(selectedOrder?.subtotal).replace(
                            /(\.\d{2})\d+/,
                            "$1",
                          )
                        : String(selectedOrder?.subtotal) + ".00"}
                    </td>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.tax')}:</strong>
                  </Col>
                  <Col xs={6}>
                    <td>
                      $
                      {String(selectedOrder?.tax).includes(".")
                        ? String(selectedOrder?.tax).replace(
                            /(\.\d{2})\d+/,
                            "$1",
                          )
                        : String(selectedOrder?.tax) + ".00"}
                    </td>
                  </Col>{" "}
                </Row>

                {+selectedOrder?.processing_fee > 0 && (
                  <Row>
                    <Col xs={6}>
                      <strong>{t('orders.details.processing_fee')}:</strong>
                    </Col>
                    <Col xs={6}>${selectedOrder?.processing_fee}</Col>{" "}
                  </Row>
                )}

                {selectedOrder?.address &&
                  selectedOrder?.address === "Pickup" && (
                    <Row>
                      <Col xs={6}>
                        <strong>{t('orders.details.con_fee')}:</strong>
                      </Col>
                      <Col xs={6}>
                        ${Number(selectedOrder?.convenience_fee)}
                      </Col>
                    </Row>
                  )}
                {selectedOrder?.discount_total &&
                  selectedOrder?.discount_total > 0 && (
                    <Row>
                      <Col xs={6}>
                        <strong>{t('orders.details.discount_total')}:</strong>
                      </Col>
                      <Col xs={6}>
                        -${Number(selectedOrder?.discount_total)}
                      </Col>
                    </Row>
                  )}

                <Row>
                  <Col xs={6}>
                    <strong>{t('orders.details.tip')}:</strong>
                  </Col>
                  <Col xs={6}>${Number(selectedOrder?.tip)}</Col>
                </Row>
                {selectedOrder?.address &&
                  selectedOrder?.address !== "Pickup" && (
                    <>
                      <Row>
                        <Col xs={6}>
                          <strong>{t('orders.details.service_fee')}:</strong>
                        </Col>
                        <Col xs={6}>${selectedOrder?.service_fee}</Col>
                      </Row>
                      <Row>
                        <Col xs={6}>
                          <strong>{t('orders.details.delivery_fee')}:</strong>
                        </Col>
                        <Col xs={6}>${selectedOrder?.delivery_fee}</Col>
                      </Row>
                    </>
                  )}
                {selectedOrder?.coupon_code?.length > 9 && (
                  <Row>
                    <Col xs={6}>
                      <strong>{t('orders.details.discount')}:</strong>
                    </Col>
                    <Col xs={6}>
                      {selectedOrder?.coupon_code
                        .split("-")
                        ?.map((part, index) => {
                          if (index === 0) {
                            return (
                              <span key={index}>
                                <strong>{t('orders.details.code')}:</strong> {part} <br />
                              </span>
                            );
                          } else if (index === 1) {
                            return (
                              <span key={index}>
                                <strong>{t('orders.details.discount')}:</strong>-$
                                {String(part).includes(".")
                                  ? String(part).replace(/(\.\d{2})\d+/, "$1")
                                  : String(part) + ".00"}
                              </span>
                            );
                          }
                          return null;
                        })}
                    </Col>
                  </Row>
                )}
                
                {/* NEW: Over Charge Display */}
                {Number(selectedOrder?.over_charge) > 0 && (
                   <Row>
                     <Col xs={6}>
                       <strong>{t('orders.details.additional_charge')}:</strong>
                     </Col>
                     <Col xs={6}>
                       ${Number(selectedOrder?.over_charge).toFixed(2)}
                     </Col>
                   </Row>
                )}

                <div className="border-top my-3"></div>
                <Row>
                  <Col xs={6}>
                    <h5>{t('orders.details.total_price')}:</h5>
                  </Col>

                  <Col xs={6}>
                    <h5 className="text-primary mb-0">
                      ${Number(selectedOrder?.order_total).toFixed(2)}
                    </h5>
                  </Col>
                </Row>

                {selectedOrder?.is_refunded && (
                  <Row className="mt-2">
                    <Col xs={6}>
                      <strong className="text-danger">{t('orders.details.refunded')}:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="text-danger">
                        ${Number(selectedOrder?.refund_amount || 0).toFixed(2)}
                        <br />
                        {selectedOrder?.refund_reason &&
                          `${t('orders.details.reason')}: ${selectedOrder.refund_reason}`}
                      </span>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder?.payment_method === "in-store" && (
            <button
              type="button"
              className="btn btn-danger"
              disabled={loading.delete || loading.hardDelete}
              onClick={() =>
                updateOrder(
                  selectedOrder?.order_id,
                  selectedOrder?.restaurant_id,
                )
              }
            >
              {loading.delete ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.delete_order')}
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline-danger"
            disabled={loading.delete || loading.hardDelete}
            onClick={openHardDelete}
          >
            {loading.hardDelete ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.hard_delete_order')}
          </button>

          <Button variant="outline-dark" onClick={handleViewReceipt} disabled={loading.receipt}>
            {loading.receipt ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.view_receipt')}
          </Button>

          {selectedOrder?.payment_method !== "in-store" && (
            <>
              {getRefundableRemaining() > 0.009 && (
                <Button variant="danger" onClick={handleOpenRefund}>
                  {t('orders.details.refund')}
                </Button>
              )}
              <Button variant="primary" onClick={handleOpenNewChargeModal}>
                {t('orders.details.extra_charge')}
              </Button>
            </>
          )}

          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('orders.details.close')}
          </Button>
        </Modal.Footer>

        {/* New Charge Modal */}
        <Modal
          show={newChargeModal}
          onHide={() => !loading.extraCharge && setNewChargeModal(false)}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: 1055 }}
          centered
        >
          <Modal.Header closeButton={!loading.extraCharge}>
            <Modal.Title>{t('orders.details.new_charge')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  {t('orders.details.enter_tip')}
                </Form.Label>
                <Form.Control
                  type="number"
                  id="tipAmount"
                  placeholder="e.g. 2.00"
                  min="0"
                  step="0.01"
                  pattern="^\d+(\.\d{0,2})?$"
                  className="form-control form-control-lg"
                  disabled={loading.extraCharge}
                  onInput={(e) => {
                    let value = e.target.value.replace(/[^0-9.]/g, "");

                    if (value.includes(".")) {
                      const [whole, decimal] = value.split(".");
                      value = `${whole}.${decimal.slice(0, 2)}`;
                    }

                    e.target.value = value;
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val && !isNaN(val)) {
                      e.target.value = parseFloat(val).toFixed(2);
                    }
                  }}
                />
                <Form.Text className="text-muted">
                  {t('orders.details.tip_notice')}
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              disabled={loading.extraCharge}
              onClick={() => {
                const tipAmount = document.getElementById("tipAmount").value;
                updatePaymentIntent(
                  selectedOrder?.payment_id,
                  tipAmount,
                  selectedOrder?.id,
                  selectedOrder?.restaurant_id,
                );
              }}
            >
               {loading.extraCharge ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.charge')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setNewChargeModal(false)}
              disabled={loading.extraCharge}
            >
              {t('orders.details.close')}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Refund Modal */}
        <Modal
          show={showRefundModal}
          onHide={() => {
            if (loading.refund) return;
            resetRefundForm();
            setShowRefundModal(false);
          }}
          centered
          size="lg"
        >
          <Modal.Header closeButton={!loading.refund}>
            <Modal.Title>{t('orders.details.refund_order')}{selectedOrder?.order_id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              <strong>{t('orders.details.total_paid')}:</strong>{" "}
              <span className="text-primary">
                ${Number(selectedOrder?.order_total || 0).toFixed(2)}
              </span>
              {Number(selectedOrder?.refund_amount || 0) > 0 && (
                <>
                  {" · "}
                  <strong>{t('orders.details.refund_remaining')}:</strong>{" "}
                  <span className="text-danger">
                    ${getRefundableRemaining().toFixed(2)}
                  </span>
                </>
              )}
            </p>

            <div className="btn-group mb-3 w-100" role="group">
              <Button
                variant={refundMode === "amount" ? "primary" : "outline-primary"}
                disabled={loading.refund}
                onClick={() => setRefundMode("amount")}
              >
                {t('orders.details.refund_by_amount')}
              </Button>
              <Button
                variant={refundMode === "items" ? "primary" : "outline-primary"}
                disabled={loading.refund}
                onClick={() => setRefundMode("items")}
              >
                {t('orders.details.refund_by_item')}
              </Button>
            </div>

            {refundMode === "amount" ? (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  {t('orders.details.partial_refund_amount')}
                </Form.Label>
                <Form.Control
                  onBlur={() => {
                    if (partialRefund) {
                      setPartialRefund(parseFloat(partialRefund).toFixed(2));
                    }
                  }}
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={loading.refund}
                  max={getRefundableRemaining()}
                  value={partialRefund}
                  onChange={(e) => {
                    let value = e.target.value;

                    value = value.replace(/[^0-9.]/g, "");

                    if (value.includes(".")) {
                      const [whole, decimal] = value.split(".");
                      value = `${whole}.${decimal.slice(0, 2)}`;
                    }

                    const num = parseFloat(value);
                    const max = getRefundableRemaining();

                    if (isNaN(num)) {
                      setPartialRefund("");
                    } else if (num > max) {
                      setPartialRefund(max.toFixed(2));
                    } else {
                      setPartialRefund(value);
                    }
                  }}
                  placeholder={t('orders.details.partial_refund_placeholder') || "Enter amount for partial refund"}
                />

                {Number(partialRefund) > getRefundableRemaining() && (
                  <Form.Text className="text-danger">
                    {t('orders.details.refund_limit_notice')}
                  </Form.Text>
                )}
              </Form.Group>
            ) : (
              <div className="mb-3">
                <Form.Label className="fw-semibold">
                  {t('orders.details.refund_select_items')}
                </Form.Label>
                <div
                  className="border rounded p-2"
                  style={{ maxHeight: "280px", overflowY: "auto" }}
                >
                  {(selectedOrder?.OrderItems || []).map((item) => {
                    const selected = Boolean(selectedRefundItems[item.id]);
                    const unitTotal = getOrderItemUnitTotal(item);
                    const qty = selectedRefundItems[item.id] || Number(item.quantity || 1);
                    const lineTotal = Number((unitTotal * qty).toFixed(2));
                    return (
                      <div
                        key={item.id}
                        className="d-flex align-items-start gap-2 py-2 border-bottom"
                      >
                        <Form.Check
                          type="checkbox"
                          className="mt-1"
                          checked={selected}
                          disabled={loading.refund}
                          onChange={() => toggleRefundItem(item)}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {item?.Item?.name || item?.item_name || `Item #${item.id}`}
                          </div>
                          {item?.Item?.chinese_name && (
                            <div className="small text-muted">{item.Item.chinese_name}</div>
                          )}
                          <div className="small text-muted">
                            ${unitTotal.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        {selected && Number(item.quantity) > 1 && (
                          <Form.Control
                            type="number"
                            min={1}
                            max={item.quantity}
                            step={1}
                            style={{ width: "72px" }}
                            disabled={loading.refund}
                            value={qty}
                            onChange={(e) => setRefundItemQty(item, e.target.value)}
                            aria-label={t('orders.details.refund_qty')}
                          />
                        )}
                        <div className="fw-semibold text-end" style={{ minWidth: "72px" }}>
                          ${selected ? lineTotal.toFixed(2) : unitTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                  {!(selectedOrder?.OrderItems || []).length && (
                    <div className="text-muted small py-2">{t('orders.details.refund_items_empty')}</div>
                  )}
                </div>

                {(() => {
                  const preview = getItemsRefundPreview();
                  const hasSelection = Object.keys(selectedRefundItems).length > 0;
                  if (!hasSelection) {
                    return (
                      <Form.Text className="text-muted d-block mt-2">
                        {t('orders.details.refund_items_empty')}
                      </Form.Text>
                    );
                  }
                  return (
                    <div className="mt-3 small border rounded p-2 bg-light">
                      <div className="d-flex justify-content-between">
                        <span>{t('orders.details.refund_items_subtotal')}</span>
                        <span>${preview.linesSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>{t('orders.details.refund_items_tax')}</span>
                        <span>${preview.taxPortion.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold mt-1">
                        <span>{t('orders.details.refund_items_total')}</span>
                        <span>${preview.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">
                {t('orders.details.refund_reason')} <small className="text-muted">({t('orders.details.optional')})</small>
              </Form.Label>
              <Form.Control
                type="text"
                value={refundReason}
                disabled={loading.refund}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={t('orders.details.refund_placeholder')}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between flex-wrap gap-2">
            {refundMode === "amount" ? (
              <>
                <Button
                  variant="danger"
                  disabled={loading.refund || getRefundableRemaining() <= 0}
                  onClick={() => handleSubmitRefund({ mode: "full" })}
                >
                  {loading.refund ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.full_refund')}
                </Button>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    onClick={() =>
                      handleSubmitRefund({ mode: "partial", amount: partialRefund })
                    }
                    disabled={
                      loading.refund ||
                      !partialRefund ||
                      Number(partialRefund) <= 0 ||
                      Number(partialRefund) > getRefundableRemaining()
                    }
                  >
                    {loading.refund ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.partial_refund')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetRefundForm();
                      setShowRefundModal(false);
                    }}
                    disabled={loading.refund}
                  >
                    {t('orders.details.close')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="warning"
                  disabled={
                    loading.refund ||
                    Object.keys(selectedRefundItems).length === 0 ||
                    getItemsRefundPreview().total <= 0 ||
                    getItemsRefundPreview().total > getRefundableRemaining() + 0.00001
                  }
                  onClick={() =>
                    handleSubmitRefund({
                      mode: "items",
                      items: Object.entries(selectedRefundItems).map(([orderItemId, quantity]) => ({
                        orderItemId: Number(orderItemId),
                        quantity: Number(quantity),
                      })),
                    })
                  }
                >
                  {loading.refund ? <Spinner as="span" animation="border" size="sm" /> : t('orders.details.refund_items_btn')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetRefundForm();
                    setShowRefundModal(false);
                  }}
                  disabled={loading.refund}
                >
                  {t('orders.details.close')}
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>

        <PasscodeModal
          show={showPasscodeModal}
          onClose={() => {
            setShowPasscodeModal(false);
            setPendingAction(null);
          }}
          restaurantId={selectedOrder?.restaurant_id}
          onSuccess={handlePasscodeSuccess}
        />

        <Modal
          show={showHardDeleteModal}
          onHide={() => !loading.hardDelete && setShowHardDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton={!loading.hardDelete}>
            <Modal.Title>{t('orders.details.hard_delete_order')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              {t('orders.details.hard_delete_modal_text', {
                orderId: selectedOrder?.order_id,
              })}
            </p>
            <Form.Group>
              <Form.Label className="fw-semibold">{t('orders.details.hard_delete_password')}</Form.Label>
              <Form.Control
                type="password"
                value={hardDeletePassword}
                onChange={(e) => {
                  setHardDeletePassword(e.target.value);
                  setHardDeleteError("");
                }}
                placeholder={t('orders.details.hard_delete_password_placeholder')}
                disabled={loading.hardDelete}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmHardDelete();
                  }
                }}
              />
              {hardDeleteError && (
                <Form.Text className="text-danger d-block mt-1">{hardDeleteError}</Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => setShowHardDeleteModal(false)}
              disabled={loading.hardDelete}
            >
              {t('orders.details.close')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmHardDelete}
              disabled={loading.hardDelete || !hardDeletePassword}
            >
              {loading.hardDelete ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {t('orders.details.hard_delete_deleting')}
                </>
              ) : (
                t('orders.details.hard_delete_confirm_button')
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Modal>
    </>
  );
};

export default OrderDetailsModal;
