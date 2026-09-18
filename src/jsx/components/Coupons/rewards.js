import { useDispatch, useSelector } from "react-redux";
import {
  createRewardThunk,
  deleteRewardThunk,
  getRewardsThunk,
} from "../../../store/rewards";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getItemsThunk } from "../../../store/items";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  FormCheck,
} from "react-bootstrap";
import swal from "sweetalert";

export default function Rewards() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const rewards = useSelector((state) => state.rewards.rewards);
  const items = useSelector((state) => state.items.items);
  const restaurant = useSelector((state) => state.restaurant?.restaurant);

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
const [rewardInput, setRewardInput] = useState({
  reward_type: "free_item",
  item_id: "",
  discount_amount: "",
  need_amount: "",
  quantity: 1,
});


  const [rewardsEnabled, setRewardsEnabled] = useState(false);

  useEffect(() => {
    if (restaurant?.rewards_enabled !== undefined) {
      setRewardsEnabled(restaurant.rewards_enabled);
    }
  }, [restaurant]);

  useEffect(() => {
    dispatch(getRewardsThunk());
    dispatch(getItemsThunk());
  }, [dispatch]);

  const filteredItems = items?.filter(
    (item) =>
      !rewards?.some((reward) => reward.item_id === item.id) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

const handleSubmit = () => {
  // Basic validation
  if (rewardInput.reward_type === "free_item" && !rewardInput.item_id) {
    alert(t("promotion_rewards.rewards.err_select_item"));
    return;
  }

  if (rewardInput.reward_type === "fixed_amount" && !rewardInput.discount_amount) {
    alert(t("promotion_rewards.rewards.err_discount_amount"));
    return;
  }

  if (!rewardInput.need_amount) {
    alert(t("promotion_rewards.rewards.err_points"));
    return;
  }

  dispatch(createRewardThunk(rewardInput));

  setShowModal(false);

  // Reset form
  setRewardInput({
    reward_type: "free_item",
    item_id: "",
    discount_amount: "",
    need_amount: "",
    quantity: 1,
  });

  setSearchQuery("");
};

  const handleToggleRewards = async () => {
    const newState = !rewardsEnabled;
    try {
      const res = await fetch("/api/neworders/toggle-rewards", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          rewardsEnabled: newState,
        }),
      });

      if (!res.ok) throw new Error("Toggle failed");

      setRewardsEnabled(newState);
      swal(
        t("common.updated"),
        t("promotion_rewards.rewards.toggle_success"),
        "success",
      );
    } catch (err) {
      console.error("Error toggling rewards:", err);
      swal(
        t("common.error"),
        t("common.err_failed"),
        "error",
      );
    }
  };

  return (
  <div className="container mt-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="fw-bold">{t("promotion_rewards.rewards.title")}</h4>
      <FormCheck
        type="switch"
        id="rewards-toggle"
        label={rewardsEnabled ? t("promotion_rewards.rewards.enabled") : t("promotion_rewards.rewards.disabled")}
        checked={rewardsEnabled}
        onChange={handleToggleRewards}
      />
    </div>

    {rewardsEnabled ? (
      <>
        <Button
          variant="dark"
          className="mb-4"
          onClick={() => setShowModal(true)}
        >
          {t("promotion_rewards.rewards.add_reward_btn")}
        </Button>

        <Row>
          {rewards?.length > 0 ? (
            rewards.map((reward) => (
              <Col key={reward.id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title className="fw-semibold">
                      {reward.reward_type === "free_item"
                        ? reward?.Item?.name
                        : `$${reward.discount_amount} ${t("common.off")}`}
                    </Card.Title>

                    <Card.Text>
                      <strong>{t("promotion_rewards.rewards.points_needed")}:</strong> {reward.need_amount}
                      <br />
                      <strong>{t("promotion_rewards.rewards.quantity")}:</strong> {reward.quantity}
                      <br />
                      <strong>{t("promotion_rewards.rewards.type")}:</strong>{" "}
                      {reward.reward_type === "free_item"
                        ? t("promotion_rewards.rewards.type_free_item")
                        : t("promotion_rewards.rewards.type_fixed_discount")}
                    </Card.Text>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => dispatch(deleteRewardThunk(reward.id))}
                    >
                      {t("promotion_rewards.rewards.delete_btn")}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-muted">No rewards created yet.</p>
          )}
        </Row>
      </>
    ) : (
      <p className="text-muted">
        {t("promotion_rewards.rewards.disabled_msg")}
      </p>
    )}

    <hr />

    {/* ==================== ADD REWARD MODAL ==================== */}
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("promotion_rewards.rewards.modal_add_title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Reward Type */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t("promotion_rewards.rewards.modal_type")}</Form.Label>
          <Form.Select
            value={rewardInput.reward_type}
            onChange={(e) =>
              setRewardInput({ ...rewardInput, reward_type: e.target.value })
            }
          >
            <option value="free_item">{t("promotion_rewards.rewards.type_free_item")}</option>
            <option value="fixed_amount">{t("promotion_rewards.rewards.type_fixed_discount")}</option>
          </Form.Select>
        </Form.Group>

        {/* Free Item Section */}
        {rewardInput.reward_type === "free_item" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">{t("promotion_rewards.rewards.modal_search")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("promotion_rewards.rewards.modal_search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">{t("promotion_rewards.rewards.modal_select_item")}</Form.Label>
              <Form.Select
                value={rewardInput.item_id}
                onChange={(e) =>
                  setRewardInput({ ...rewardInput, item_id: e.target.value })
                }
              >
                <option value="">{t("promotion_rewards.rewards.modal_choose_placeholder")}</option>
                {filteredItems?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </>
        )}

        {/* Fixed Discount Section */}
        {rewardInput.reward_type === "fixed_amount" && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{t("promotion_rewards.rewards.modal_discount_amount")}</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 5"
              value={rewardInput.discount_amount}
              onChange={(e) =>
                setRewardInput({
                  ...rewardInput,
                  discount_amount: e.target.value,
                })
              }
            />
          </Form.Group>
        )}

        {/* Points Needed */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">{t("promotion_rewards.rewards.modal_points_label")}</Form.Label>
          <Form.Control
            type="number"
            placeholder="e.g. 100"
            value={rewardInput.need_amount}
            onChange={(e) =>
              setRewardInput({
                ...rewardInput,
                need_amount: e.target.value,
              })
          
            }
            required
          />
        </Form.Group>

        {/* Quantity */}
        {/* <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Quantity</Form.Label>
          <Form.Control
            type="number"
            placeholder="e.g. 1"
            value={rewardInput.quantity}
            onChange={(e) =>
              setRewardInput({ ...rewardInput, quantity: e.target.value })
            }
          />
        </Form.Group> */}
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
