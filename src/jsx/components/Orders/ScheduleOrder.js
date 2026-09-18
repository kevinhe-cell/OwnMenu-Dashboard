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
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrdersThunk,
  updatePrepTimeThunk,
  updateStatusThunk,
} from "../../../store/orders";
import OrderDetailsModal from "./OrderDetailModal";
import { setNotification } from "../../../store/notifications";
import { getFeesThunk } from "../../../store/fees";

function ScheduleOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.allOrders);
  const id = useSelector((state) => state.session.user.id);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const notificationStatus = useSelector(
    (state) => state.notifications.notificationStatus,
  );
  const fees = useSelector((state) => state.fees.fees);

  useEffect(() => {
    dispatch(getOrdersThunk(id));
    dispatch(getFeesThunk());
  }, [dispatch, id]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <Container
      className="border bg-white"
      style={{ borderRadius: "15px", padding: "15px" }}
    >
      <Row className="mt-3 mb-3"></Row>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#Order</th>
            <th>Pickup Time</th>
            <th>Order Time</th>
            <th>Customer Info</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders
              .filter((order) => order.order_status === "HOLD")
              .map((order) => (
                <tr
                  key={order.id}
                  style={{
                    cursor: "pointer",
                    fontSize: "16px",
                    lineHeight: "1.1rem",
                  }}
                  className={
                    order?.order_status === "CLOSE"
                      ? "table-success"
                      : order.preparation_time
                        ? "table-warning"
                        : "table-warning"
                  }
                >
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    #{order.order_id}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    {order.pickup_time}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <p>
                      {order.name}
                      <br />
                      {order.phone_number}
                    </p>
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    ${order?.order_total}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOrderClick(order)}
                  >
                    {order.payment_method === "in-store" ? (
                      <>
                        <span className="badge bg-danger">PAY IN STORE</span>
                        <br />
                        {order?.address && order?.address !== "Pickup" ? (
                          <span className="badge bg-success">
                            REQUIRE DELIVERY
                          </span>
                        ) : (
                          <span className="badge bg-success">PICKUP</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="badge bg-success">PAID ONLINE</span>
                        <br />
                        {order?.address && order?.address !== "Pickup" ? (
                          <span className="badge bg-success">
                            REQUIRE DELIVERY
                          </span>
                        ) : (
                          <span className="badge bg-success">PICKUP</span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
        </tbody>
      </Table>

      <OrderDetailsModal
        showModal={showModal}
        selectedOrder={selectedOrder}
        setShowModal={setShowModal}
        fees={fees}
      />
    </Container>
  );
}

export default ScheduleOrders;
