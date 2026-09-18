import { useDispatch, useSelector } from "react-redux";

import {
  createSpecialItemThunk,
  deleteSpecialItemThunk,
  getSpecialItemsThunk,
} from "../../../store/specialItems";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getItemsThunk } from "../../../store/items";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import swal from "sweetalert";

export default function SpecialItems() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const specialItems = useSelector((state) => state.specialItems?.specialItems) || [];
  const items = useSelector((state) => state.items.items) || [];
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState({
    item_id: "",
    discount_percent: "",
  });

  useEffect(() => {
    dispatch(getSpecialItemsThunk());
    dispatch(getItemsThunk());
  }, [dispatch]);

  const filteredItems = items.filter(
    (item) =>
      !specialItems?.some((s) => s.item_id === item.id) &&
      item.name?.toLowerCase().includes((searchQuery || "").toLowerCase()),
  );

  const handleSubmit = () => {
    if (!input.item_id) {
      swal(t("common.error"), t("special_items.err_select"), "error");
      return;
    }
    const percent = Number(input.discount_percent);
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      swal(t("common.error"), t("special_items.err_percent"), "error");
      return;
    }
    dispatch(createSpecialItemThunk({ item_id: input.item_id, discount_percent: percent }));
    setShowModal(false);
    setInput({ item_id: "", discount_percent: "" });
    setSearchQuery("");
    swal(t("common.success"), t("special_items.success_added"), "success");
  };

  const handleDelete = (id) => {
    dispatch(deleteSpecialItemThunk(id));
    swal(t("common.deleted"), t("special_items.success_deleted"), "success");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">{t("special_items.title")}</h4>
        <Button variant="dark" className="mb-4" onClick={() => setShowModal(true)}>
          {t("special_items.add_btn")}
        </Button>
      </div>
      <p className="text-muted small mb-3">
        {t("special_items.desc")}
      </p>

      <Row>
        {specialItems?.length > 0 ? (
          specialItems.map((special) => (
            <Col key={special.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title className="fw-semibold">
                    {special?.Item?.name || "Item"}
                  </Card.Title>
                  <Card.Text>
                    <strong>{t("special_items.discount_label")}:</strong> {special.discount_percent}% {t("common.off")}
                    <br />
                    <span className="text-decoration-line-through text-muted">${Number(special?.Item?.price ?? 0).toFixed(2)}</span>
                    {" → "}
                    <strong className="text-success">${(Number(special?.Item?.price ?? 0) * (1 - Number(special.discount_percent ?? 0) / 100)).toFixed(2)}</strong> {t("special_items.final_label")}
                  </Card.Text>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(special.id)}
                  >
                    {t("special_items.delete_btn")}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-muted">{t("special_items.no_items")}</p>
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("special_items.modal_add_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("special_items.modal_search")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("special_items.modal_search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("special_items.modal_select")}</Form.Label>
            <Form.Select
              value={input.item_id}
              onChange={(e) => setInput({ ...input, item_id: e.target.value })}
            >
              <option value="">{t("special_items.modal_choose_placeholder")}</option>
              {filteredItems?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.price != null ? `($${Number(item.price).toFixed(2)})` : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("special_items.modal_discount_percent")}</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder={t("special_items.modal_discount_placeholder")}
              value={input.discount_percent}
              onChange={(e) => setInput({ ...input, discount_percent: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t("common.save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
