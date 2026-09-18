import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Container,
  Row,
  Col,
  Alert,
  Modal,
  Badge,
  Card,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrdersThunk,
  updatePrepTimeThunk,
  updateStatusThunk,
} from "../../../store/orders";
import OrderDetailsModal from "./OrderDetailModal";
import { OrderSourceBadge } from "./orderSourceBadge";
import { getFeesThunk } from "../../../store/fees";
import { useTranslation } from "react-i18next";

function InComingOrders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const id = useSelector((state) => state.session.user.id);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [preparationTime, setPreparationTime] = useState(5);
  const [showPreparationTimeModal, setShowPreparationTimeModal] =
    useState(false);
  const fees = useSelector((state) => state.fees.fees);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    dispatch(getOrdersThunk(id));
    dispatch(getFeesThunk());
    setIsMobile(window.innerWidth < 1200);
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, id]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setShowNewOrderAlert(false);
  };

  const handleStartOrder = (order) => {
    setSelectedOrder(order);
    setPreparationTime(5);
    setShowPreparationTimeModal(true);
    setShowNewOrderAlert(false);
  };

  const handleConfirmStartOrder = () => {
    dispatch(updatePrepTimeThunk(selectedOrder.id, preparationTime));
    setShowPreparationTimeModal(false);
  };

  const handleCloseOrder = (order) => {
    dispatch(updateStatusThunk(order.id));
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}/${month}/${day} ${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div
      className="border bg-white"
      style={{ borderRadius: "15px", padding: "15px" }}
    >
      <style>{`
        .custom-card {
          border: 2px solid #ccc;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        .custom-card:hover {
          transform: scale(1.01);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      <span className="text-danger">
        {t('orders.sms_notice')} {t('orders.free_plan_notice')}
      </span>

      <Row className="mt-3 mb-3">
        <Col className="d-flex align-items-center justify-content-between">
          <h2 className="mb-0" style={{ fontSize: "24px", fontWeight: "bold" }}>
            {formatDate(new Date())}
          </h2>
          <div className="d-flex gap-2 flex-wrap">
            <Badge bg="danger" className="badge-circle">
              {t('orders.new')}
            </Badge>
            <Badge bg="warning" className="badge-circle">
              {t('orders.in_process')}
            </Badge>
            <Badge bg="success" className="badge-circle">
              {t('orders.done')}
            </Badge>
          </div>
        </Col>
      </Row>

      {showNewOrderAlert && (
        <Alert
          variant="danger"
          onClick={() => setShowNewOrderAlert(false)}
          dismissible
        >
          <strong>{t('orders.new_order_alert')}</strong> {t('orders.unaccepted_alert')}
        </Alert>
      )}

      {isMobile ? (
        <Row>
          {orders
            ?.filter((order) => order.order_status !== "HOLD")
            .map((order) => (
              <Col xs={12} key={order.id} className="mb-4">
                <Card
                  onClick={() => handleOrderClick(order)}
                  className={`custom-card animate__animated animate__fadeIn ${
                    order.order_status === "CLOSE"
                      ? "border-success"
                      : order.preparation_time
                        ? "border-warning"
                        : "border-danger"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body>
                    <Card.Title className="mb-2">
                      #{order.order_id} - {formatTime(order.createdAt)}
                    </Card.Title>
                    <Card.Text>
                      <strong>{order.name}</strong>
                      <br />
                      {order.phone_number}
                      <br />
                      <strong>{t('orders.total')}:</strong> ${order.order_total}
                      <br />
                      {order.payment_method === "in-store" ? (
                        <>
                          <Badge bg="danger">{t('orders.pay_in_store')}</Badge>{" "}
                        </>
                      ) : (
                        <>
                          <Badge bg="success">{t('orders.paid_online')}</Badge>{" "}
                        </>
                      )}
                      {order.address && order.address !== "Pickup" ? (
                        <Badge bg="success">{t('orders.require_delivery')}</Badge>
                      ) : (
                        <Badge bg="success">{t('orders.pickup')}</Badge>
                      )}{" "}
                      <OrderSourceBadge order={order} />
                    </Card.Text>
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {order.preparation_time == null ? (
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartOrder(order);
                          }}
                        >
                          {t('orders.start')}
                        </Button>
                      ) : (
                        <Button variant="primary" disabled>
                          {order.preparation_time} {t('orders.min')}
                        </Button>
                      )}
                      {order.order_status === "CLOSE" ? (
                        <Button variant="primary" disabled>
                          {t('orders.closed')}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseOrder(order);
                          }}
                        >
                          {t('orders.ready')}
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      ) : (
        <div className="table-responsive-sm">
          <Table
            bordered
            hover
            responsive
            className="compact-order-table mb-0 align-middle text-nowrap"
          >
            <thead>
              <tr>
                <th>{t('orders.order_number')}</th>
                <th>{t('orders.order_time')}</th>
                <th>{t('orders.customer_info')}</th>
                <th>{t('orders.total')}</th>
                <th>{t('orders.status')}</th>
                <th>{t('orders.action')}</th>
                <th>{t('orders.ready')}</th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders
                  .filter((order) => order.order_status !== "HOLD")
                  .map((order) => (
                    <tr
                      key={order.id}
                      className={
                        order.order_status === "CLOSE"
                          ? "table-success"
                          : order.preparation_time
                            ? "table-warning"
                            : "table-danger"
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOrderClick(order)}
                    >
                      <td>#{order.order_id}</td>
                      <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td>
                        <div>{order.name}</div>
                        <div className="text-muted small">
                          {order.phone_number}
                        </div>
                      </td>
                      <td>
                        $
                        {String(order.order_total).includes(".")
                          ? String(order.order_total).replace(
                              /(\.\d{2})\d+/,
                              "$1",
                            )
                          : String(order.order_total) + ".00"}
                      </td>
                      <td>
                        <Badge
                          bg={
                            order.payment_method === "in-store"
                              ? "danger"
                              : "success"
                          }
                          className="me-1"
                        >
                          {order.payment_method === "in-store"
                            ? t('orders.pay_in_store')
                            : t('orders.paid_online')}
                        </Badge>
                        <Badge bg="secondary">
                          {order.address && order.address !== "Pickup"
                            ? t('orders.require_delivery')
                            : t('orders.pickup')}
                        </Badge>{" "}
                        <OrderSourceBadge order={order} />
                      </td>
                      <td>
                        {order?.preparation_time == null ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleStartOrder(order);
                            }}
                          >
                            {t('orders.start')}
                          </Button>
                        ) : (
                          <Button variant="outline-primary" size="sm" disabled>
                            {order?.preparation_time} {t('orders.min')}
                          </Button>
                        )}
                      </td>
                      <td>
                        {order?.order_status === "CLOSE" ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled
                          >
                            {t('orders.closed')}
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseOrder(order);
                            }}
                          >
                            {t('orders.ready')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </div>
      )}

      {showPreparationTimeModal && selectedOrder && (
        <Modal show={showPreparationTimeModal} centered>
          <Modal.Body className="text-center">
            <h6>{t('orders.select_prep_time')}</h6>
            <div className="d-flex justify-content-center flex-wrap">
              {[...Array(15).keys()].map((min) => (
                <Button
                  key={min}
                  variant={
                    preparationTime === (min + 1) * 5
                      ? "primary"
                      : "outline-primary"
                  }
                  className="m-2"
                  onClick={() => setPreparationTime((min + 1) * 5)}
                >
                  {(min + 1) * 5} {t('orders.min')}
                </Button>
              ))}
            </div>
            <Button
              variant="primary"
              className="mt-3"
              onClick={handleConfirmStartOrder}
            >
              {t('orders.confirm_start')}
            </Button>
          </Modal.Body>
        </Modal>
      )}

      <OrderDetailsModal
        showModal={showModal}
        selectedOrder={selectedOrder}
        setShowModal={setShowModal}
        fees={fees}
      />
    </div>
  );
}

export default InComingOrders;
