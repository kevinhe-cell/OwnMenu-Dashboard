import { useState, useEffect } from "react";
import swal from "sweetalert";
import { getToken } from "../../../store/utlits";
import { getFeesThunk } from "../../../store/fees";
import { useDispatch } from "react-redux";

function TipOptionsControl({ fees }) {
  const defaultTips = [10, 15, 18];
  const dispatch = useDispatch();
  const [tipOptions, setTipOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fees?.tip_options) {
      setTipOptions(fees.tip_options);
    } else {
      setTipOptions(defaultTips);
    }
  }, [fees]);

  const handleChange = (index, value) => {
    const newOptions = [...tipOptions];
    newOptions[index] = Number(value);
    setTipOptions(newOptions);
  };

  const handleSave = async () => {
    // Check for duplicates
    const uniqueTips = new Set(tipOptions);
    if (uniqueTips.size !== tipOptions.length) {
      swal("Error", "Tip options cannot have duplicate values.", "error");
      return;
    }

    const token = getToken();
    setLoading(true);
    try {
      const res = await fetch("/api/fees/tip-options", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tip_options: tipOptions }),
      });

      const json = await res.json();
      if (res.ok) {
        swal("Success!", "Tip options updated successfully!", "success");
      } else {
        swal("Error", json.message || "Failed to update tips", "error");
      }
    } catch (error) {
      swal("Error", "Network error while updating tips", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setTipOptions(defaultTips);
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header">
        <h4 className="card-title mb-0">Edit Tip Suggestion % </h4>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-3 justify-content-start">
          {tipOptions.map((tip, index) => (
            <div
              key={index}
              className="d-flex flex-column align-items-center"
              style={{ width: "110px" }}
            >
              <input
                type="number"
                className="form-control text-center fw-semibold fs-4 rounded-3 shadow-sm"
                id={`tip-input-${index}`}
                value={tip}
                onChange={(e) => handleChange(index, e.target.value)}
                min="0"
                style={{ height: "48px" }}
                aria-describedby={`tip-label-${index}`}
              />
            </div>
          ))}
        </div>

        <div className="d-flex gap-3 mt-4">
          <button
            className="btn btn-primary px-4"
            onClick={handleSave}
            disabled={loading}
            style={{ minWidth: "120px" }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              "Save Tips"
            )}
          </button>

          <button
            className="btn btn-outline-secondary px-4"
            onClick={handleReset}
            disabled={loading}
            style={{ minWidth: "140px" }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

export default TipOptionsControl;
