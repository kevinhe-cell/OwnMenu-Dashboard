import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  sendVerificationThunk,
  verifyCodeThunk,
  setNewPasscodeThunk,
  checkPasscodeThunk,
} from "../../../store/paymentaccesscode";
import { getToken } from "../../../store/utlits";
import { useTranslation } from "react-i18next";

const PasscodeModal = ({
  show,
  onClose,
  restaurantId,
  onSuccess,
  fromAccount,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { verified } = useSelector((state) => state.passcode);

  const [step, setStep] = useState(null); // 'check' | 'code' | 'set'
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPasscodeExists = async () => {
      if (!show || fromAccount) return; // Skip if fromAccount mode
      const token = getToken();

      setLoading(true);
      const res = await fetch(
        `/api/payment-access/check-exists/${restaurantId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setStep("check");
        } else {
          const phoneRes = await fetch("/api/payment-access/get-phone", {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ restaurantId }),
          });

          const phoneData = await phoneRes.json();
          if (phoneRes.ok && phoneData.phone) {
            setPhone(phoneData.phone);
            await dispatch(
              sendVerificationThunk(restaurantId, phoneData.phone),
            );
            setStep("code");
          } else {
            setStep("phone");
          }
        }
      } else {
        setStep("phone");
      }
      setLoading(false);
    };

    checkPasscodeExists();
  }, [show, restaurantId, fromAccount]);

  const forgotPassowrd = async () => {
    const token = getToken();

    setLoading(true);
    const res = await fetch("/api/payment-access/get-phone", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restaurantId }),
    });
    const data = await res.json();
    if (res.ok && data.phone) {
      setPhone(data.phone);
      await dispatch(sendVerificationThunk(restaurantId, data.phone));
      setStep("code");
    } else {
      setError(t('orders.passcode.phone_not_found'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show && fromAccount) {
      // Skip checkPasscodeExists, directly run forgot flow
      (async () => {
        await forgotPassowrd();
      })();
    }
  }, [show, fromAccount]);

  const handleCheckPasscode = async () => {
    setLoading(true);
    const success = await dispatch(checkPasscodeThunk(restaurantId, passcode));
    setLoading(false);

    if (success) {
      onSuccess();
    } else {
      setError(t('orders.passcode.incorrect'));
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    const ok = await dispatch(sendVerificationThunk(restaurantId, phone));

    setLoading(false);

    if (ok) {
      setStep("code");
    } else {
      setError(t('orders.passcode.send_failed'));
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    const ok = await dispatch(verifyCodeThunk(restaurantId, phone, code));
    setLoading(false);

    if (ok) {
      setStep("set");
    } else {
      setError(t('orders.passcode.verify_failed'));
    }
  };

  const handleSetPasscode = async () => {
    setLoading(true);
    const ok = await dispatch(setNewPasscodeThunk(restaurantId, passcode));
    setLoading(false);

    if (ok) {
      onSuccess();
    } else {
      setError(t('orders.passcode.set_failed'));
    }
  };

  const renderStep = () => {
    if (loading || step === null) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      );
    }

    const inputClass = "form-control form-control-lg rounded-3 shadow-sm";

    switch (step) {
      case "check":
        return (
          <>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                {t('orders.passcode.enter_passcode')}
              </Form.Label>
              <Form.Control
                className={inputClass}
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckPasscode}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  t('orders.passcode.continue')
                )}
              </Button>
              <Button
                variant="link"
                className="text-danger"
                onClick={forgotPassowrd}
              >
                {t('orders.passcode.forgot_passcode')}
              </Button>
            </div>
          </>
        );

      case "phone":
        return (
          <>
            <p className="mb-3 text-muted">
              {t('orders.passcode.first_time_notice')}
            </p>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">{t('orders.passcode.phone_number')}</Form.Label>
              <Form.Control
                className={inputClass}
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  if (onlyDigits.length <= 10) setPhone(onlyDigits);
                }}
                placeholder={t('orders.passcode.phone_placeholder')}
              />
              <Form.Text muted>
                {t('orders.passcode.us_only_notice')}
              </Form.Text>
            </Form.Group>
            <div className="d-grid">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  t('orders.passcode.send_code')
                )}
              </Button>
            </div>
          </>
        );

      case "code":
        return (
          <>
            <p className="text-muted mb-2">
              {t('orders.passcode.code_sent_to')}{" "}
              <strong>•••-•••-{phone.slice(-4)}</strong>
            </p>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                {t('orders.passcode.enter_code')}
              </Form.Label>
              <Form.Control
                className={inputClass}
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>
            <div className="text-muted small mb-3">
              {t('orders.passcode.support_notice')}
            </div>
            <div className="d-grid">
              <Button
                variant="primary"
                size="lg"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : t('orders.passcode.verify')}
              </Button>
            </div>
          </>
        );

      case "set":
        return (
          <>
            <p className="text-muted mb-3">
              {t('orders.passcode.create_notice')}
            </p>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                {t('orders.passcode.set_passcode')}
              </Form.Label>
              <Form.Control
                className={inputClass}
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid">
              <Button
                variant="success"
                size="lg"
                onClick={handleSetPasscode}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  t('orders.passcode.save_continue')
                )}
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('orders.passcode.secure_access')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>{renderStep()}</Form>
      </Modal.Body>
    </Modal>
  );
};

export default PasscodeModal;
