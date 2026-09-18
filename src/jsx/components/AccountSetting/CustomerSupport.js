import { useState, useRef } from "react";
import swal from "sweetalert";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function CustomerSupportForm() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.session.user);
  const plan = useSelector((state) => state.session.userPlan);

  const [issueType, setIssueType] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const issueOptions = [
    t('account.support.options.billing'),
    t('account.support.options.menu_upload'),
    t('account.support.options.menu_mgmt'),
    t('account.support.options.printing'),
    t('account.support.options.notification'),
    t('account.support.options.payment'),
    t('account.support.options.domain'),
    t('account.support.options.admin'),
    t('account.support.options.access'),
    t('account.support.options.bug'),
    t('account.support.options.feature'),
    t('account.support.options.other'),
  ];

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    if (attachments.length >= 5) {
      swal(t('account.support.limit_reached'), t('account.support.limit_text'), "warning");
      return;
    }

    // Prevent duplicates by filename
    if (attachments.some((file) => file.name === newFile.name)) {
      swal(t('account.support.duplicate'), t('account.support.duplicate_text'), "warning");
      return;
    }

    setAttachments([...attachments, newFile]);
    e.target.value = ""; // reset input so same file can be selected again later
  };

  const removeFile = (index) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    setAttachments(updated);
  };

  const handleSupportSubmit = async () => {
    const title = issueType === t('account.support.options.other') ? customIssue : issueType;

    if (!title || !supportMessage) {
      return swal(
        t('account.support.missing_fields'),
        t('account.support.missing_text'),
        "warning",
      );
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", supportMessage);
      formData.append("from", user?.phone || "unknown@ownmenu.com");
      formData.append(
        "userInfo",
        JSON.stringify({
          userId: user?.id,
          phone: user?.phone,
          restaurantId: user?.restaurant_id,
          planType: plan?.plan_type,
          planStartDate: plan?.plan_start_date,
          planEndDate: plan?.plan_expiration_date,
          smsEnabled: plan?.sms_notification_enabled,
          onlinePayment: plan?.online_payment_enabled,
          cardLast4: plan?.paymentMethod_card?.last4,
          cardBrand: plan?.paymentMethod_card?.brand,
        }),
      );

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch("/api/users/support/email", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        swal(
          t('account.support.received_title'),
          t('account.support.received_text'),
          "success",
        );
        setIssueType("");
        setCustomIssue("");
        setSupportMessage("");
        setAttachments([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        swal(t('common.error'), data.message || "Failed to send message.", "error");
      }
    } catch (err) {
      swal(t('common.error'), "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-body">
        <h5 className="fw-semibold mb-3">🛠 {t('account.support.title')}</h5>
        <p className="text-muted mb-4">
          {t('account.support.desc')}
        </p>

        <div className="mb-3">
          <label className="form-label">{t('account.support.issue_type')}</label>
          <select
            className="form-select"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="">{t('account.support.select_issue')}</option>
            {issueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {issueType === t('account.support.options.other') && (
          <div className="mb-3">
            <label className="form-label">{t('account.support.custom_title')}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t('account.support.enter_title')}
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">{t('account.support.description')}</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder={t('account.support.details_placeholder')}
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">{t('account.support.attach_files')}</label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            ref={fileInputRef}
          />
          {attachments.length > 0 && (
            <ul className="mt-2 list-group">
              {attachments.map((file, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="text-truncate" style={{ maxWidth: "80%" }}>
                    {file.name}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFile(index)}
                  >
                    {t('account.support.remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="d-grid mb-4">
          <button
            className="btn btn-outline-primary"
            onClick={handleSupportSubmit}
            disabled={loading}
          >
            📧 {t('account.support.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
