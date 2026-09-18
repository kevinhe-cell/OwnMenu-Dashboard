import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  addFreeItemThunk,
  createRedeemableThunk,
  deleteFreeItemThunk,
  deleteRedeemableThunk,
  getFreeItemsThunk,
  updateRedeemableThunk,
} from "../../../store/freeitems";
import { getItemsThunk } from "../../../store/items";
import { getRestaurantThunk } from "../../../store/restaurants";
import { Button, Modal, Form, Row, Col, Spinner, Card } from "react-bootstrap";
import { FaPlus, FaMinus } from "react-icons/fa";
import swal from "sweetalert";
import Rewards from "./rewards";
import { Gift } from "lucide-react";

export default function PromotionRewardsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const restaurant = useSelector((state) => state.restaurant?.restaurant);
  const freeitems = useSelector((state) => state.freeItems.freeitems);
  const items = useSelector((state) => state.items.items);

  const [freeitemsEnable, setFreeItemsEnabled] = useState(false);
  const [reedemName, setRedeemName] = useState("");
  const [reedemModal, setRedeemModal] = useState(false);
  const [editReedemModal, setEditReedemModal] = useState(false);
  const [currentRedeemable, setCurrentRedeemable] = useState(null);
  const [createItemModal, setCreateItemModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [needAmount, setNeedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (restaurant?.freeitems_enable !== undefined) {
      setFreeItemsEnabled(restaurant.freeitems_enable);
    }
  }, [restaurant]);

  useEffect(() => {
    dispatch(getFreeItemsThunk());
    dispatch(getItemsThunk());
  }, [dispatch]);

  const handleFreeItemEnabled = async () => {
    const newState = !freeitemsEnable;
    try {
      const res = await fetch("/api/neworders/toggle-freeitems", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          freeitemsEnable: newState,
        }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      dispatch(getRestaurantThunk());
      setFreeItemsEnabled(newState);
      swal(t("common.updated"), t("promotion_rewards.free_items.toggle_success"), "success");
    } catch (err) {
      swal(t("common.error"), t("common.err_failed"), "error");
    }
  };

  const handleCreateItem = async (id, itemId) => {
    setLoading(true);
    await dispatch(addFreeItemThunk(id, itemId, quantity));
    await dispatch(getFreeItemsThunk());
    setCreateItemModal(false);
    setTimeout(() => {
      const updated = freeitems.find((f) => f.id === id);
      if (updated) setCurrentRedeemable(updated);
      setCreateItemModal(true);
    }, 200);
    setLoading(false);
  };

  const handleDeleteItem = async (freeitemId) => {
    const redeemableId = currentRedeemable?.id;
    if (!redeemableId) return;
    setLoading(true);
    await dispatch(deleteFreeItemThunk(freeitemId, redeemableId));
    await dispatch(getFreeItemsThunk());
    setCreateItemModal(false);
    setTimeout(() => {
      const updated = freeitems.find((f) => f.id === redeemableId);
      if (updated) setCurrentRedeemable(updated);
      setCreateItemModal(true);
    }, 200);
    setLoading(false);
  };

  const handleCreateRedeemable = async () => {
    setRedeemModal(false);
    setRedeemName("");
    setNeedAmount(0);
    await dispatch(createRedeemableThunk(reedemName, needAmount));
    swal(t("common.success"), t("promotion_rewards.free_items.success_created"), "success");
  };

  const handleUpdateRedeemable = async (id) => {
    setEditReedemModal(false);
    setRedeemName("");
    setNeedAmount(0);
    await dispatch(updateRedeemableThunk(id, reedemName, needAmount));
    swal(t("common.success"), t("promotion_rewards.free_items.success_updated"), "success");
  };

  const handleDeleteRedeemable = async (id) => {
    setEditReedemModal(false);
    setRedeemName("");
    setNeedAmount(0);
    await dispatch(deleteRedeemableThunk(id));
    swal(t("common.success"), t("promotion_rewards.free_items.success_deleted"), "success");
  };

  const handleClickEdit = (reedemable) => {
    setCurrentRedeemable(reedemable);
    setRedeemName(reedemable.name);
    setNeedAmount(reedemable.need_amount);
    setEditReedemModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-5">
        <h2 className="fw-bold mb-1" style={{ color: "#111827", letterSpacing: "-0.025em" }}>
          {t("promotion_rewards.title")}
        </h2>
        <p className="text-muted mb-0 small">{t("promotion_rewards.desc")}</p>
      </div>

      {/* Free Items */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <Card.Header
          className="d-flex flex-wrap justify-content-between align-items-center py-3"
          style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "#fef3c7" }}>
              <Gift size={20} style={{ color: "#d97706" }} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "#111827" }}>{t("promotion_rewards.free_items.title")}</h5>
              <p className="mb-0 small text-muted">{t("promotion_rewards.free_items.desc")}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Form.Check
              type="switch"
              id="free-items-toggle"
              label={restaurant?.freeitems_enable ? t("promotion_rewards.free_items.enabled") : t("promotion_rewards.free_items.disabled")}
              checked={restaurant?.freeitems_enable}
              onChange={handleFreeItemEnabled}
              className="mb-0"
            />
            {restaurant?.freeitems_enable && (
              <Button
                size="sm"
                onClick={() => setRedeemModal(true)}
                style={{ background: "#dd2f6e", border: "none", borderRadius: "8px" }}
              >
                {t("promotion_rewards.free_items.create_btn")}
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {!restaurant?.freeitems_enable ? (
            <p className="text-muted mb-0">{t("promotion_rewards.free_items.empty_state")}</p>
          ) : freeitems?.length > 0 ? (
            <Row>
              {freeitems.map((freeitem) => (
                <Col key={freeitem?.id} xs={12} md={6} lg={4} className="mb-3">
                  <Card className="border h-100" style={{ borderRadius: "10px" }}>
                    <Card.Body>
                      <Card.Title className="fw-semibold mb-2" style={{ color: "#111827" }}>{freeitem.name}</Card.Title>
                      <p className="small text-muted mb-3">{t("promotion_rewards.free_items.spend_to_redeem", { amount: freeitem.need_amount })}</p>
                      <div className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => handleClickEdit(freeitem)} style={{ borderRadius: "6px" }}>
                          {t("promotion_rewards.free_items.edit_btn")}
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => { setCreateItemModal(true); setCurrentRedeemable(freeitem); }} style={{ borderRadius: "6px" }}>
                          {t("promotion_rewards.free_items.add_item_btn")}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted mb-0">{t("promotion_rewards.free_items.no_items")}</p>
          )}
        </Card.Body>
      </Card>

      {/* Rewards */}
      <div className="mt-4">
        <Rewards />
      </div>

      {/* Create Redeemable Modal */}
      <Modal show={reedemModal} onHide={() => setRedeemModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{t("promotion_rewards.free_items.modal_create_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("promotion_rewards.free_items.modal_name")}</Form.Label>
            <Form.Control value={reedemName} onChange={(e) => setRedeemName(e.target.value)} placeholder={t("promotion_rewards.free_items.modal_name_placeholder")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("promotion_rewards.free_items.modal_amount")}</Form.Label>
            <Form.Control type="number" value={needAmount} onChange={(e) => setNeedAmount(e.target.value)} placeholder="e.g. 50" min={0} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRedeemModal(false)}>{t("common.cancel")}</Button>
          <Button variant="primary" onClick={handleCreateRedeemable}>{t("common.create")}</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Redeemable Modal */}
      <Modal show={editReedemModal} onHide={() => setEditReedemModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{t("promotion_rewards.free_items.modal_edit_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("promotion_rewards.free_items.modal_name")}</Form.Label>
            <Form.Control value={reedemName} onChange={(e) => setRedeemName(e.target.value)} placeholder={t("promotion_rewards.free_items.modal_name")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("promotion_rewards.free_items.modal_amount")}</Form.Label>
            <Form.Control type="number" value={needAmount} onChange={(e) => setNeedAmount(e.target.value)} min={0} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDeleteRedeemable(currentRedeemable?.id)}>{t("common.delete")}</Button>
          <Button variant="primary" onClick={() => handleUpdateRedeemable(currentRedeemable?.id)}>{t("common.update")}</Button>
        </Modal.Footer>
      </Modal>

      {/* Create Item Modal */}
      <Modal show={createItemModal} onHide={() => setCreateItemModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("promotion_rewards.free_items.modal_add_items_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col ref={scrollRef} style={{ maxHeight: "400px", overflow: "auto", borderRight: "1px solid #e5e7eb" }}>
                <h6 className="mb-3 fw-semibold">{t("promotion_rewards.free_items.modal_available_items")}</h6>
                {items?.filter((item) => !currentRedeemable?.ReedemableItems?.find((ri) => ri.item_id === item.id)).map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span>{item.name}{item.chinese_name && ` - ${item.chinese_name}`}</span>
                    <Button variant="link" className="p-0" onClick={() => handleCreateItem(currentRedeemable?.id, item.id)}>
                      <FaPlus />
                    </Button>
                  </div>
                ))}
              </Col>
              <Col style={{ maxHeight: "400px", overflow: "auto" }}>
                <h6 className="mb-3 fw-semibold">{t("promotion_rewards.free_items.modal_selected_items")}</h6>
                {currentRedeemable?.ReedemableItems?.map((item) => (
                  <div key={item?.Item?.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span>{item?.Item?.name}{item?.Item?.chinese_name && ` - ${item?.Item?.chinese_name}`} × {item.quantity}</span>
                    <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteItem(item.id)}>
                      <FaMinus />
                    </Button>
                  </div>
                ))}
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>{t("promotion_rewards.free_items.modal_quantity")}</Form.Label>
              <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min={1} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {loading && <Spinner animation="border" size="sm" className="me-2" />}
          <Button variant="secondary" onClick={() => setCreateItemModal(false)}>{t("common.close")}</Button>
        </Modal.Footer>
      </Modal>

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1055, background: "rgba(255,255,255,0.6)" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
}
