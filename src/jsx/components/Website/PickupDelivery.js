import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";
import { getUserPlanThunk } from "../../../store/session";

function PickupDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPlan = useSelector((state) => state.session?.userPlan);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    if (userPlan?.pickup_delivery) {
      setSelectedOption(userPlan.pickup_delivery);
    } else {
      setSelectedOption("pickup");
    }
  }, [userPlan]);

  const handleOptionChange = async (option) => {
    const plan = userPlan?.plan_type;

    // Free plan can only pick "pickup"
    if (plan === "free" && option === "both") {
      swal({
        title: "Upgrade Required",
        text: "Access to both pickup and delivery requires a stater or higher plan.",
        icon: "warning",
        buttons: {
          cancel: "Cancel",
          upgrade: {
            text: "Upgrade Now",
            value: "upgrade",
          },
        },
      }).then((value) => {
        if (value === "upgrade") {
          navigate("/plans");
        }
      });
      return;
    }

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

      setSelectedOption(option);
      swal("Updated!", `Order receiving method set to "${option}".`, "success");
      dispatch(getUserPlanThunk());
    } catch (error) {
      console.error("Failed to update pickup/delivery option:", error);
      swal("Error", "Failed to update setting. Please try again.", "error");
    }
  };

  return (
    <div className="col-xl-12 col-lg-12">
      <div className="card mb-3">
        <div className="card-header">
          <h4 className="card-title">
            How should customers receive their order?
          </h4>
        </div>
        <div className="card-body">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="pickupDeliveryOption"
              id="pickupOnly"
              value="pickup"
              checked={selectedOption === "pickup"}
              onChange={() => handleOptionChange("pickup")}
            />
            <label className="form-check-label" htmlFor="pickupOnly">
              Pickup Only
            </label>
          </div>

          {/* Show "Pickup & Delivery" only */}
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="pickupDeliveryOption"
              id="pickupAndDelivery"
              value="both"
              checked={selectedOption === "both"}
              onChange={() => handleOptionChange("both")}
            />
            <label className="form-check-label" htmlFor="pickupAndDelivery">
              Pickup & Delivery
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PickupDelivery;
