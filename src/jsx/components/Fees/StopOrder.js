import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import {
  getRestaurantThunk,
  changeOnlineStatusThunk,
  updateSMSNotificationThunk,
} from "../../../store/restaurants";
import { fetchHours } from "../../../store/Hours";
import Hours from "./Hours";
import { useTranslation } from "react-i18next";

function StopOrdering() {
  const dispatch = useDispatch();
  const id = useSelector((state) => state.session.user.restaurant_id);
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const [stoppedOrdering, setStoppedOrdering] = useState(false);
  const [phone, setPhone] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getRestaurantThunk());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant) {
      setStoppedOrdering(restaurant.stop_order);
      setPhone(restaurant.sms_noti_phone || "");
    }
  }, [restaurant]);

  const handleGoOffline = () => {
    swal({
      title: t("online_status.swal.offline_title"),
      text: t("online_status.swal.offline_text_legacy"),
      icon: "warning",
      buttons: [t("common.cancel"), t("online_status.swal.btn_go_offline")],
      dangerMode: true,
    }).then((willGoOffline) => {
      if (willGoOffline) {
        dispatch(changeOnlineStatusThunk(id));
      }
    });
  };

  const handleGoOnline = () => {
    swal({
      title: t("online_status.swal.online_title"),
      text: t("online_status.swal.online_text"),
      icon: "info",
      buttons: [t("common.cancel"), t("online_status.swal.btn_go_online")],
    }).then((willGoOnline) => {
      if (willGoOnline) {
        dispatch(changeOnlineStatusThunk(id));
      }
    });
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const updatePhone = async () => {
    await dispatch(updateSMSNotificationThunk(id, phone)).then(() => {
      dispatch(getRestaurantThunk());
      swal(t("stop_order.alerts.updated"), {
        icon: "success",
      });
    });
  };

  return (
    <div>
      <h2>{t("stop_order.legacy.title")}</h2>
      <p className="text-warning">
        ⚠️ This section is part of our legacy system and may no longer function
        correctly. Please ignore or contact support if you need assistance.
      </p>

      <div className="my-3">
        <h2>{t("stop_order.phone.title")}</h2>
        <p>
          Enter the phone number you want to receive SMS notifications for new
          orders.
        </p>
        <p>{t("stop_order.phone.format")}</p>
        <input
          placeholder="2222222222"
          type="text"
          value={phone}
          onChange={handlePhoneChange}
        />
        <button className="btn btn-shadow btn-light" onClick={updatePhone}>
          Update Phone
        </button>
      </div>
    </div>
  );
}

export default StopOrdering;
