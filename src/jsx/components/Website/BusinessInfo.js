import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRestaurantThunk,
  updateRestaurantAddressThunk,
} from "../../../store/restaurants";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const BUSINESS_INFO_PASSCODE = "0930";

export default function BusinessInfo() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const restaurant = useSelector((state) => state.restaurant.restaurant);

  const [formData, setFormData] = useState({
    name: "",
    street: "",
    cityOnly: "",
    stateOnly: "",
    zipOnly: "",
    phone: "",
    google_review_url: "",
  });

  const [loading, setLoading] = useState(false); // 🔁 Loading state

  useEffect(() => {
    if (restaurant) {
      const [cityOnly = "", stateZip = ""] = (restaurant.city || "").split(",");
      const [parsedState = "", parsedZip = ""] = (stateZip || "").trim().split(/\s+/);

      setFormData({
        name: restaurant.name || "",
        street: restaurant.street || "",
        cityOnly: cityOnly.trim(),
        stateOnly: (restaurant.state || parsedState).trim(),
        zipOnly: parsedZip.trim(),
        phone: restaurant.phone || "",
        google_review_url: restaurant.google_review_url || "",
      });
    }
  }, [restaurant]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const promptPasscode = async () => {
    const { value: passcode, isConfirmed } = await Swal.fire({
      title: t("fees.swal.passcode_title"),
      text: t("website.business_info.passcode_desc"),
      input: "password",
      inputPlaceholder: t("fees.swal.passcode_placeholder"),
      inputAttributes: { inputMode: "numeric" },
      showCancelButton: true,
      cancelButtonText: t("common.cancel"),
      confirmButtonText: t("fees.swal.passcode_confirm"),
      confirmButtonColor: "#3085d6",
      allowOutsideClick: false,
    });

    if (!isConfirmed) return false;

    const trimmed = String(passcode || "").trim();
    if (!trimmed) {
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("fees.swal.passcode_required"),
        confirmButtonColor: "#3085d6",
      });
      return false;
    }

    if (trimmed !== BUSINESS_INFO_PASSCODE) {
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("fees.swal.passcode_incorrect"),
        confirmButtonColor: "#3085d6",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const authorized = await promptPasscode();
    if (!authorized) return;

    setLoading(true); // ⏳ Start spinner

    const fullCity = `${formData.cityOnly}, ${formData.stateOnly} ${formData.zipOnly}`;

    const payload = {
      name: formData.name,
      street: formData.street,
      city: fullCity,
      zip: formData.phone, // legacy: zip column used for pickup phone in delivery APIs
      phone: formData.phone,
      state: formData.stateOnly.trim().toUpperCase(),
      google_review_url: formData.google_review_url.trim(),
    };

    if (user?.restaurant_id) {
      await dispatch(updateRestaurantAddressThunk(user.restaurant_id, payload));

       Swal.fire({
        icon: "success",
        title: t('website.business_info.saved'),
        text: t('website.business_info.update_success'),
        confirmButtonColor: "#3085d6",
      });
    }

    setLoading(false); // ✅ Stop spinner
  };

  return (
    <div className="container mt-4">
       <h4 className="mb-4 text-center fw-bold border-bottom  pb-2">
        🏢 {t('website.business_info.title')}
      </h4>
       <span className="text-warning">
        {t('website.business_info.notice')}
      </span>
      <form className="row g-3 mt-3" onSubmit={handleSubmit}>
         <div className="col-md-6">
          <label className="form-label">{t('website.business_info.restaurant_name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

         <div className="col-md-6">
          <label className="form-label">{t('website.business_info.street_address')}</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. 1240 Peachtree Blvd"
            required
          />
        </div>

         <div className="col-md-4">
          <label className="form-label">{t('website.business_info.city')}</label>
          <input
            type="text"
            name="cityOnly"
            value={formData.cityOnly}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. Duluth"
            required
          />
        </div>

         <div className="col-md-4">
          <label className="form-label">{t('website.business_info.state')}</label>
          <input
            type="text"
            name="stateOnly"
            value={formData.stateOnly}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. GA"
            required
          />
        </div>

         <div className="col-md-4">
          <label className="form-label">{t('website.business_info.zip_code')}</label>
          <input
            type="text"
            name="zipOnly"
            value={formData.zipOnly}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. 30097"
            required
          />
        </div>

         <div className="col-md-6">
          <label className="form-label">{t('website.business_info.phone_number')}</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. 6781234567"
            required
          />
        </div>

         <div className="col-12">
          <label className="form-label">{t('website.business_info.google_review')}</label>
          <input
            type="url"
            name="google_review_url"
            value={formData.google_review_url}
            onChange={handleChange}
            className="form-control"
            placeholder="https://g.page/... or Google Maps review link"
          />
           <span className="text-muted small">
            {t('website.business_info.google_review_notice')}
          </span>
        </div>

        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            disabled={loading}
          >
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
               ></span>
            )}
            {t('website.business_info.save_changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
