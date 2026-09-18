import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import { useDispatch } from "react-redux";
import { getFeesThunk } from "../../../store/fees";
import swal from "sweetalert";

const DYNAMIC_BANDS = [
  { api: "betweenZeroToOne", db: "delivery_zero_to_one", label: "0 to 1 mile" },
  { api: "betweenOneToTwo", db: "delivery_one_to_two", label: "1 to 2 miles" },
  { api: "betweenTwoToThree", db: "delivery_two_to_three", label: "2 to 3 miles" },
  { api: "betweenThreeToFour", db: "delivery_three_to_four", label: "3 to 4 miles" },
  { api: "betweenFourToFive", db: "delivery_four_to_five", label: "4 to 5 miles" },
  { api: "betweenFiveToSix", db: "delivery_five_to_six", label: "5 to 6 miles" },
  { api: "betweenSixToSeven", db: "delivery_six_to_seven", label: "6 to 7 miles" },
  { api: "betweenSevenToEight", db: "delivery_seven_to_eight", label: "7 to 8 miles" },
  { api: "betweenEightToNine", db: "delivery_eight_to_nine", label: "8 to 9 miles" },
  { api: "betweenNineToTen", db: "delivery_nine_to_ten", label: "9 to 10 miles" },
  { api: "betweenTenToEleven", db: "delivery_ten_to_eleven", label: "10 to 11 miles" },
  { api: "betweenElevenToTwelve", db: "delivery_eleven_to_twelve", label: "11 to 12 miles" },
  { api: "betweenTwelveToThirteen", db: "delivery_twelve_to_thirteen", label: "12 to 13 miles" },
  { api: "betweenThirteenToFourteen", db: "delivery_thirteen_to_fourteen", label: "13 to 14 miles" },
  { api: "betweenFourteenToFifteen", db: "delivery_fourteen_to_fifteen", label: "14 to 15 miles" },
  { api: "moreThanFifteen", db: "delivery_fifteen_greater", label: "15+ miles" },
];

const emptyRanges = () =>
  DYNAMIC_BANDS.reduce((acc, band) => {
    acc[band.api] = 0;
    return acc;
  }, {});

const DeliveryFeeModal = ({
  delivery_fee,
  setDeliveryFee,
  handleSubmit,
  onClose,
  fees,
}) => {
  const [feeType, setFeeType] = useState("fixed");
  const dispatch = useDispatch();
  const [ranges, setRanges] = useState(emptyRanges);
  const [minDeliveryAmount, setMinDeliveryAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fees && fees.delivery_fee_type) {
      setFeeType(fees.delivery_fee_type);
    }

    const next = emptyRanges();
    for (const band of DYNAMIC_BANDS) {
      const value = fees?.[band.db];
      // Prefer new columns; for 5–15 bands still empty, fall back once from legacy 5+.
      if (value != null && value !== "") {
        next[band.api] = value;
      } else if (
        band.db !== "delivery_zero_to_one" &&
        band.db !== "delivery_one_to_two" &&
        band.db !== "delivery_two_to_three" &&
        band.db !== "delivery_three_to_four" &&
        band.db !== "delivery_four_to_five" &&
        fees?.delivery_five_greater != null
      ) {
        next[band.api] = fees.delivery_five_greater;
      } else {
        next[band.api] = 0;
      }
    }
    setRanges(next);
    setMinDeliveryAmount(fees?.min_delivery_amount ?? 0);
  }, [fees]);

  const updateFeeType = async (type) => {
    setLoading(true);
    const token = getToken();
    try {
      const response = await fetch("/api/neworders/updatedeliveryfeetype", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
          credentials: "include",
        },
        body: JSON.stringify({ fee_type: type }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error updating fee type:", data.message);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
    setLoading(false);
  };

  const handleFeeTypeChange = (type) => {
    setFeeType(type);
    updateFeeType(type);
  };

  const handleDynamicSubmit = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const response = await fetch(`/api/fees/${fees.id}/custom_delivery_fee`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
          credentials: "include",
        },
        body: JSON.stringify(ranges),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(getFeesThunk());
        onClose();
      } else {
        console.error("Failed to save dynamic delivery fees:", data.message);
      }
    } catch (error) {
      console.error("Error saving dynamic delivery fees:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const token = getToken();
    try {
      await fetch(`/api/fees/${fees.id}/min-delivery-amount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
          credentials: "include",
        },
        body: JSON.stringify({
          min_delivery_amount: parseFloat(minDeliveryAmount),
        }),
      });

      if (feeType === "fixed") {
        handleSubmit();
        onClose();
        setLoading(false);
      } else {
        await handleDynamicSubmit();
        swal("Successfully Updated");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving min delivery amount:", error);
      setLoading(false);
    }
  };

  const bandFields = useMemo(
    () =>
      DYNAMIC_BANDS.map((band) => ({
        ...band,
        value: ranges[band.api],
      })),
    [ranges]
  );

  return (
    <Modal show onHide={onClose} centered size="lg">
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
      <Modal.Header closeButton>
        <Modal.Title>Edit Delivery Fee</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group controlId="minDeliveryAmount" className="mb-4">
            <Form.Label>Minimum Delivery Amount</Form.Label>
            <Form.Control
              type="number"
              step="any"
              min={0}
              placeholder="Enter minimum order amount for delivery"
              value={minDeliveryAmount}
              onChange={(e) => setMinDeliveryAmount(e.target.value)}
            />
            <Form.Text className="text-muted">
              The minimum order amount a customer must spend to qualify for
              delivery.
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Check
              type="radio"
              label="Fixed Delivery Fee"
              name="feeType"
              value="fixed"
              checked={feeType === "fixed"}
              onChange={() => handleFeeTypeChange("fixed")}
              id="feeTypeFixed"
            />
          </Form.Group>

          {feeType === "fixed" && (
            <Form.Group className="mt-3" controlId="fixedDeliveryFee">
              <Form.Label>Fixed Fee Amount</Form.Label>
              <Form.Control
                type="number"
                step="any"
                placeholder="Enter fixed delivery fee"
                value={delivery_fee}
                onChange={(e) => setDeliveryFee(e.target.value)}
              />
            </Form.Group>
          )}

          <Form.Group className="mt-4">
            <Form.Check
              type="radio"
              label="Dynamic Delivery Fee"
              name="feeType"
              value="dynamic"
              checked={feeType === "dynamic"}
              onChange={() => handleFeeTypeChange("dynamic")}
              id="feeTypeDynamic"
            />
          </Form.Group>

          {feeType === "dynamic" && (
            <div className="mt-3 d-flex flex-wrap gap-3" style={{ maxHeight: 420, overflowY: "auto" }}>
              {bandFields.map(({ api, label, value }) => (
                <Form.Group
                  style={{ flex: "1 1 45%", minWidth: "150px" }}
                  controlId={api}
                  key={api}
                  className="mb-2"
                >
                  <Form.Label style={{ fontSize: "0.9rem" }}>
                    {`Distance ${label}`} (eg. 2.99)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) =>
                      setRanges((prev) => ({ ...prev, [api]: e.target.value }))
                    }
                    min={0}
                    style={{
                      height: "32px",
                      fontSize: "0.9rem",
                      padding: "4px 8px",
                    }}
                  />
                </Form.Group>
              ))}
            </div>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeliveryFeeModal;
