import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCouponThunk,
  deleteCouponThunk,
  getAllCouponsThunk,
} from "../../../store/coupons";
import { Button, Modal, Form, Row, Col, Spinner, Card, Table } from "react-bootstrap";
import swal from "sweetalert";
import {
  addFreeItemThunk,
  createRedeemableThunk,
  deleteFreeItemThunk,
  deleteRedeemableThunk,
  getFreeItemsThunk,
  updateRedeemableThunk,
} from "../../../store/freeitems";
import { getItemsThunk } from "../../../store/items";
import { FaPlus, FaMinus } from "react-icons/fa";
import Rewards from "./rewards";
import SpecialItems from "./SpecialItems";
import { getRestaurantThunk } from "../../../store/restaurants";
import { useTranslation } from "react-i18next";

function Coupons() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const coupons = useSelector((state) => state.coupons.coupons);
  const [createModal, setCreateModal] = useState(false);
  const [inputType, setInputType] = useState("Percentage");
  const [value, setValue] = useState("");
  const [expiration, setExpiration] = useState("1 day");
  const [use_limit, setUseLimit] = useState(null);
  const [min_require, setMinRequire] = useState(0);
  const restaurant = useSelector((state) => state.restaurant?.restaurant);
  const [freeitemsEnable, setFreeItemsEnabled] = useState(false);
  const [limit_one, setLimitOne] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (restaurant?.freeitems_enable !== undefined) {
      setFreeItemsEnabled(restaurant.freeitems_enable);
    }
  }, [restaurant]);

  const [reedemName, setRedeemName] = useState("");
  const [reedemModal, setRedeemModal] = useState(false);
  const [editReedemModal, setEditReedemModal] = useState(false);
  const [currentRedeemable, setCurrentRedeemable] = useState(null);
const [ftCustomer, setFtCustomer] = useState(false);
const [visibleOnline, setVisibleOnline] = useState(false);
const [maxDiscount, setMaxDiscount] = useState("");
const [randomCode, setRandomCode] = useState(true);
const [customCode, setCustomCode] = useState(false);
const [customCodeValue, setCustomCodeValue] = useState('');

  const items = useSelector((state) => state.items.items);
  const freeitems = useSelector((state) => state.freeItems.freeitems);
  const [createItemModal, setCreateItemModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [needAmount, setNeedAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [couponSort, setCouponSort] = useState({ sort: "createdAt", order: "desc" });
  const [couponSourceFilter, setCouponSourceFilter] = useState("");
  useEffect(() => {
    dispatch(getAllCouponsThunk({
      sort: couponSort.sort,
      order: couponSort.order,
      source: couponSourceFilter || undefined,
    }));
    dispatch(getFreeItemsThunk());
    dispatch(getItemsThunk());
  }, [dispatch, couponSort.sort, couponSort.order, couponSourceFilter]);

  const handleFreeItemEnabled = async () => {
    const newState = !freeitemsEnable;
    try {
      const res = await fetch("/api/neworders/toggle-freeitems", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          freeitemsEnable: newState,
        }),
      });

      if (!res.ok) throw new Error("Toggle failed");
      dispatch(getRestaurantThunk());
      setFreeItemsEnabled(newState);
      swal(
        t("marketing.coupons.swal.updated"),
        t("marketing.coupons.swal.free_item_status", { status: newState ? t("marketing.coupons.enabled") : t("marketing.coupons.disabled") }),
        "success",
      );
    } catch (err) {
      console.error("Error toggling freeitem:", err);
      swal(
        t("common.error"),
        t("common.failed_to_update"),
        "error",
      );
    }
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleExpirationChange = (e) => {
    setExpiration(e.target.value);
  };


const handleCreateCoupon = async () => {
  if (customCode && !customCodeValue.trim()) {
    swal({
      title: t("common.error"),
      text: t("marketing.coupons.swal.err_custom_code"),
      icon: "error",
      button: t("common.ok"),
    });
    return;
  }

  setCreateModal(false);

  const result = await dispatch(
    createCouponThunk({
      discount: value,
      discount_type: inputType,
      expiration,
      use_limit,
      min_require,
      limit_one,
      ft_customer: ftCustomer,
      visible_online: visibleOnline,
      max_discount: (() => {
        if (maxDiscount === "" || maxDiscount == null) return null;
        const n = Number(maxDiscount);
        return Number.isFinite(n) && n > 0 ? n : null;
      })(),
      custom_code: customCode ? customCodeValue.trim().toUpperCase() : null,
      random_code: randomCode,
    })
  );

  if (result?.error) {
    swal({
      title: t("common.error"),
      text: result.error,
      icon: "error",
      button: t("common.ok"),
    });
    return;
  }

  // Reset form only on success
  setInputType("Percentage");
  setValue("");
  setExpiration("1day");
  setLimitOne(false);
  setFtCustomer(false);
  setVisibleOnline(false);
  setMaxDiscount("");
  setRandomCode(true);
  setCustomCode(false);
  setCustomCodeValue("");

  swal({
    title: t("common.success"),
    text: t("marketing.coupons.swal.create_success"),
    icon: "success",
    button: t("common.ok"),
  });
};


  const handleDeleteCoupon = async (couponId) => {
    // Handle coupon deletion logic here
    await dispatch(deleteCouponThunk(couponId));

    swal({
      title: t("common.success"),
      text: t("marketing.coupons.swal.delete_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return date.toLocaleDateString(undefined, options);
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

    try {
      setLoading(true);
      await dispatch(deleteFreeItemThunk(freeitemId, redeemableId));
      await dispatch(getFreeItemsThunk());

      // Force-close and re-open
      setCreateItemModal(false);
      setTimeout(() => {
        const updated = freeitems.find((f) => f.id === redeemableId);
        if (updated) setCurrentRedeemable(updated);
        setCreateItemModal(true);
      }, 200);
    } catch (err) {
      swal({
        title: t("common.error"),
        text: t("common.error_deleting"),
        icon: "error",
        button: t("common.ok"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRedeemable = async () => {
    // Handle redeemable creation logic here
    setRedeemModal(false);

    // Reset form
    setRedeemName("");
    setNeedAmount(0);

    await dispatch(createRedeemableThunk(reedemName, needAmount));

    swal({
      title: t("common.success"),
      text: t("marketing.coupons.swal.redeem_create_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleUpdateRedeemable = async (id) => {
    // Handle redeemable update logic here

    setEditReedemModal(false);

    // Reset form
    setRedeemName("");
    setNeedAmount(0);

    await dispatch(updateRedeemableThunk(id, reedemName, needAmount));

    swal({
      title: t("common.success"),
      text: t("marketing.coupons.swal.redeem_update_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleDeleteRedeemable = async (id) => {
    // Handle redeemable deletion logic here
    setEditReedemModal(false);

    setRedeemName("");
    setNeedAmount(0);

    await dispatch(deleteRedeemableThunk(id));

    swal({
      title: t("common.success"),
      text: t("marketing.coupons.swal.redeem_delete_success"),
      icon: "success",
      button: t("common.ok"),
    });
  };

  const handleClickEdit = (reedemable) => {
    setCurrentRedeemable(reedemable);
    setRedeemName(reedemable.name);
    setNeedAmount(reedemable.need_amount);
    setEditReedemModal(true);
  };

  const handleSort = (field) => {
    setCouponSort((prev) => ({
      sort: field,
      order: prev.sort === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ field }) => {
    if (couponSort.sort !== field) return null;
    return couponSort.order === "desc" ? " ▼" : " ▲";
  };

  return (
    <div className="container mt-4">
      <hr />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">{t("marketing.coupons.title")}</h4>
        <Button variant="primary" onClick={() => setCreateModal(true)}>
          {t("marketing.coupons.create_btn")}
        </Button>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <Form.Group>
              <Form.Label className="small text-muted">{t("marketing.coupons.filter_source")}</Form.Label>
              <Form.Select
                size="sm"
                value={couponSourceFilter}
                onChange={(e) => setCouponSourceFilter(e.target.value)}
                style={{ minWidth: "140px" }}
              >
                <option value="">{t("marketing.coupons.filter_all")}</option>
                <option value="automated">{t("marketing.coupons.filter_ai")}</option>
                <option value="manual">{t("marketing.coupons.filter_manual")}</option>
              </Form.Select>
            </Form.Group>
          </div>

          {!coupons.length && <p className="text-muted mb-0">{t("marketing.coupons.no_coupons")}</p>}
          {coupons.length > 0 && (
            <Table hover responsive className="mb-0">
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("coupon_id")}>
                    {t("marketing.coupons.table.code")} <SortIcon field="coupon_id" />
                  </th>
                  <th>{t("marketing.coupons.table.discount")}</th>
                  <th>{t("marketing.coupons.table.max_discount")}</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("source")}>
                    {t("marketing.coupons.table.source")} <SortIcon field="source" />
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("createdAt")}>
                    {t("marketing.coupons.table.created")} <SortIcon field="createdAt" />
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("expiration_date")}>
                    {t("marketing.coupons.table.expires")} <SortIcon field="expiration_date" />
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("redemption_count")}>
                    {t("marketing.coupons.table.uses")} <SortIcon field="redemption_count" />
                  </th>
                  <th>{t("marketing.coupons.table.status")}</th>
                  <th>{t("marketing.coupons.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="fw-semibold">{coupon.coupon_id}</td>
                    <td>
                      {coupon.discount}
                      {coupon.discount_type === "Percentage" ? "%" : "$"}
                    </td>
                    <td className="text-muted small">
                      {coupon.max_discount != null && coupon.max_discount !== ""
                        ? `$${Number(coupon.max_discount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`badge ${coupon.source === "automated" ? "bg-info" : "bg-secondary"}`}
                      >
                        {coupon.source === "automated" ? "AI" : "Manual"}
                      </span>
                    </td>
                    <td>{coupon.createdAt ? formatDate(coupon.createdAt) : "-"}</td>
                    <td>{formatDate(coupon.expiration_date)}</td>
                    <td>{coupon.redemption_count ?? 0}</td>
                    <td>
                      <span
                        className={`badge ${(coupon.status === "active" || (coupon.expiration_date && new Date(coupon.expiration_date) > new Date())) ? "bg-success" : "bg-secondary"}`}
                      >
                        {coupon.status === "expired" || (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) ? t("marketing.coupons.status.expired") : t("marketing.coupons.status.active")}
                      </span>
                    </td>
                    <td>
                      {coupon.source !== "manual" ? (
                        <Button variant="outline-secondary" size="sm" disabled title="Only manually created coupons can be deleted">
                          {t("marketing.coupons.delete_btn")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.coupon_id)}
                        >
                          {t("marketing.coupons.delete_btn")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <hr />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">{t("marketing.coupons.free_items_title")}</h4>
        <div className="d-flex align-items-center gap-3">
          <Form.Check
            type="switch"
            id="free-items-toggle"
            label={restaurant?.freeitems_enable ? t("marketing.coupons.enabled") : t("marketing.coupons.disabled")} // ✅ use .enable
            checked={restaurant?.freeitems_enable}
            onChange={handleFreeItemEnabled}
          />
        </div>
      </div>

      {restaurant?.freeitems_enable ? (
        <>
          <Button variant="dark" onClick={() => setRedeemModal(true)}>
            ➕ {t("marketing.coupons.create_free_item_btn")}
          </Button>
          <Row>
            {freeitems?.length > 0 ? (
              freeitems.map((freeitem) => (
                <Col key={freeitem?.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <Card.Title className="fw-semibold text-center">
                        {freeitem.name}
                      </Card.Title>
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleClickEdit(freeitem)}
                        >
                          ✏️ {t("common.edit")}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setCreateItemModal(true);
                            setCurrentRedeemable(freeitem);
                          }}
                        >
                          ➕ {t("common.add_item")}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-muted">{t("marketing.coupons.no_free_items")}</p>
            )}
          </Row>
        </>
      ) : (
        <p className="text-muted">
          {t("marketing.coupons.free_items_disabled_msg")}
        </p>
      )}

      <hr />
      {/** Create Redeemable Modal */}
      <Modal show={reedemModal} onHide={() => setRedeemModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("marketing.coupons.modal_create_redeemable.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t("marketing.coupons.modal_create_redeemable.name")}</Form.Label>
              <Form.Control
                type="text"
                value={reedemName}
                onChange={(e) => setRedeemName(e.target.value)}
                placeholder="Enter Free Item name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("marketing.coupons.modal_create_redeemable.amount_needed")}</Form.Label>
              <Form.Control
                type="number"
                value={needAmount}
                onChange={(e) => setNeedAmount(e.target.value)}
                placeholder="Enter need amount"
                required
                min={0}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRedeemModal(false)}>
            {t("common.close")}
          </Button>
          <Button variant="primary" onClick={() => handleCreateRedeemable()}>
            {t("common.create")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/** Edit Redeemable Modal */}
      <Modal
        show={editReedemModal}
        onHide={() => setEditReedemModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("marketing.coupons.modal_edit_redeemable.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={reedemName}
                onChange={(e) => setRedeemName(e.target.value)}
                placeholder="Enter Free Item name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("marketing.coupons.modal_create_coupon.min_spend")}</Form.Label>
              <Form.Control
                type="number"
                value={needAmount}
                onChange={(e) => setNeedAmount(e.target.value)}
                placeholder="Enter need amount"
                required
                min={0}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => handleDeleteRedeemable(currentRedeemable.id)}
          >
            Delete
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              handleUpdateRedeemable(currentRedeemable.id, reedemName)
            }
          >
            {t("common.update")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/** Create Modal */}
<Modal show={createModal} onHide={() => setCreateModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title className="fw-bold">{t("marketing.coupons.modal_create_coupon.title")}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form>
      {/* Discount Type */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.discount_type")}</Form.Label>
        <div className="d-flex gap-4">
          <Form.Check
            type="radio"
            label={t("marketing.coupons.modal_create_coupon.percentage")}
            name="discountType"
            id="percentage"
            value="percentage"
            checked={inputType === "Percentage"}
            onChange={() => setInputType("Percentage")}
          />
          <Form.Check
            type="radio"
            label={t("marketing.coupons.modal_create_coupon.fixed_amount")}
            name="discountType"
            id="amount"
            value="amount"
            checked={inputType === "Amount"}
            onChange={() => setInputType("Amount")}
          />
        </div>
      </Form.Group>

      {/* Discount Value */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">
          {inputType === "Percentage" ? t("marketing.coupons.modal_create_coupon.discount_val_pct") : t("marketing.coupons.modal_create_coupon.discount_val_amt")}
        </Form.Label>
        <Form.Control
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder={`Enter ${inputType.toLowerCase()}`}
          required
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.max_discount")}</Form.Label>
        <Form.Control
          type="number"
          min={0}
          step="0.01"
          value={maxDiscount}
          onChange={(e) => setMaxDiscount(e.target.value)}
          placeholder={t("marketing.coupons.modal_create_coupon.max_discount_placeholder")}
        />
        <Form.Text className="text-muted">{t("marketing.coupons.modal_create_coupon.max_discount_hint")}</Form.Text>
      </Form.Group>

      {/* Use Limit */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.use_limit")}</Form.Label>
        <Form.Control
          type="number"
          value={use_limit}
          onChange={(e) => setUseLimit(e.target.value)}
          placeholder="Enter max number of uses"
          required
          min={1}
        />
      </Form.Group>

      {/* Minimum Spend */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.min_spend")}</Form.Label>
        <Form.Control
          type="number"
          value={min_require}
          onChange={(e) => setMinRequire(e.target.value)}
          placeholder="Enter minimum spend ($)"
          required
          min={0}
        />
      </Form.Group>

      {/* Expiration */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.expiration")}</Form.Label>
        <Form.Select
          value={expiration}
          onChange={handleExpirationChange}
          required
        >
          <option value="1day">{t("marketing.coupons.modal_create_coupon.exp_1day")}</option>
          <option value="1week">{t("marketing.coupons.modal_create_coupon.exp_1week")}</option>
          <option value="1month">{t("marketing.coupons.modal_create_coupon.exp_1month")}</option>
          <option value="unlimited">{t("marketing.coupons.modal_create_coupon.exp_unlimited")}</option>
        </Form.Select>
      </Form.Group>

      {/* Checkboxes */}
      <div className="mb-4">
        <Form.Check
          type="checkbox"
          label={t("marketing.coupons.modal_create_coupon.limit_one")}
          checked={limit_one}
          onChange={(e) => setLimitOne(e.target.checked)}
          className="mb-2"
        />
        <Form.Check
          type="checkbox"
          label={t("marketing.coupons.modal_create_coupon.first_time")}
          checked={ftCustomer}
          onChange={(e) => setFtCustomer(e.target.checked)}
          className="mb-2"
        />
        <Form.Check
          type="checkbox"
          label={t("marketing.coupons.modal_create_coupon.visible_online")}
          checked={visibleOnline}
          onChange={(e) => setVisibleOnline(e.target.checked)}
          className="mb-2"
        />
      </div>

      {/* Code Type */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.code_option")}</Form.Label>
        <div className="d-flex gap-4">
          <Form.Check
            type="checkbox"
            label={t("marketing.coupons.modal_create_coupon.gen_random")}
            checked={randomCode}
            onChange={(e) => {
              setRandomCode(e.target.checked);
              if (e.target.checked) setCustomCode(false);
            }}
          />
          <Form.Check
            type="checkbox"
            label={t("marketing.coupons.modal_create_coupon.enter_custom")}
            checked={customCode}
            onChange={(e) => {
              setCustomCode(e.target.checked);
              if (e.target.checked) setRandomCode(false);
            }}
          />
        </div>
      </Form.Group>

      {/* Custom Code Input */}
      {customCode && (
<Form.Group className="mb-4">
  <Form.Label className="fw-semibold">{t("marketing.coupons.modal_create_coupon.custom_code_label")}</Form.Label>
  <Form.Control
    type="text"
    value={customCodeValue}
    onChange={(e) => setCustomCodeValue(e.target.value.toUpperCase())}
    placeholder="Enter custom coupon code"
    required
  />
</Form.Group>

      )}
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline-secondary" onClick={() => setCreateModal(false)}>
      {t("common.cancel")}
    </Button>
    <Button variant="primary" onClick={handleCreateCoupon}>
      {t("marketing.coupons.create_btn")}
    </Button>
  </Modal.Footer>
</Modal>


      {/** Create Item Modal */}
      <Modal
        show={createItemModal}
        onHide={() => setCreateItemModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("marketing.coupons.modal_add_item.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col
                ref={scrollRef}
                style={{
                  maxHeight: "600px",
                  overflow: "auto",
                  borderRight: "1px solid gray",
                }}
              >
                <h5>{t("marketing.coupons.modal_add_item.available")}</h5>
                {items
                  .filter(
                    (item) =>
                      !currentRedeemable?.ReedemableItems?.find(
                        (redeemableItem) => redeemableItem.item_id === item.id,
                      ),
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {item.name} - {item.chinese_name}
                      </span>
                      <Button
                        variant="link"
                        onClick={() =>
                          handleCreateItem(currentRedeemable.id, item.id)
                        }
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  ))}
              </Col>
              <Col style={{ maxHeight: "600px", overflow: "auto" }}>
                <h5>{t("marketing.coupons.modal_add_item.selected")}</h5>
                {currentRedeemable?.ReedemableItems?.map((item) => (
                  <div
                    key={item?.Item?.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {item?.Item?.name} - {item?.Item?.chinese_name} -{" "}
                      {item.quantity}
                    </span>
                    <Button
                      variant="link"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <FaMinus />
                    </Button>
                  </div>
                ))}
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {loading && <Spinner animation="border" variant="primary" />}
          <Button variant="secondary" onClick={() => setCreateItemModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Rewards />
      <hr />
      <SpecialItems />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1055,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
}

export default Coupons;
