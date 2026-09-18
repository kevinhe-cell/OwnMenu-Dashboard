import { useState } from "react";
import { Card, Button, Form, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { ArrowRightLeft, Search, AlertTriangle, Users } from "lucide-react";
import swal from "sweetalert";
import {
  previewDataTransfer,
  runDataTransfer,
  runCustomerTransfer,
} from "../../../store/dataTransfer";

const TRANSFER_PASSCODE = "0930";

export default function TransferRestaurantData() {
  const [restaurantIdInput, setRestaurantIdInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Customer-only clone
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [customerPreview, setCustomerPreview] = useState(null);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerLookupError, setCustomerLookupError] = useState("");
  const [transferPoints, setTransferPoints] = useState(true);
  const [showCustomerConfirm, setShowCustomerConfirm] = useState(false);
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerPasswordError, setCustomerPasswordError] = useState("");
  const [customerTransferring, setCustomerTransferring] = useState(false);

  const handleLookup = async (e) => {
    e?.preventDefault?.();
    setLookupError("");
    setPreview(null);

    const id = String(restaurantIdInput || "").trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      setLookupError("Enter a valid restaurant ID (numbers only).");
      return;
    }

    setLookupLoading(true);
    try {
      const data = await previewDataTransfer(id);
      setPreview(data);
    } catch (err) {
      setLookupError(err.message || "Restaurant not found");
    } finally {
      setLookupLoading(false);
    }
  };

  const openConfirm = () => {
    setPassword("");
    setPasswordError("");
    setShowConfirm(true);
  };

  const handleTransfer = async () => {
    setPasswordError("");
    if (String(password) !== TRANSFER_PASSCODE) {
      setPasswordError("Incorrect password.");
      return;
    }
    if (!preview?.id) return;

    const confirmed = await swal({
      title: "Are you sure?",
      text: `This will MOVE menu items and orders from "${preview.name}" onto your current restaurant, and CLONE customers (source customers stay). The source restaurant will no longer see menu/order data.`,
      icon: "warning",
      buttons: ["Cancel", "Yes, transfer"],
      dangerMode: true,
    });

    if (!confirmed) return;

    setTransferring(true);
    try {
      const result = await runDataTransfer(preview.id, password);
      setShowConfirm(false);
      setPassword("");
      setPreview(null);
      setRestaurantIdInput("");
      const m = result.moved || {};
      const skipped = result.skippedCustomers || 0;
      const skipNote =
        skipped > 0
          ? ` ${skipped} customer(s) skipped (phone already exists here).`
          : "";
      await swal({
        title: "Transfer complete",
        text: `From ${result.source?.name || preview.name}: ${m.items || 0} items, ${m.orders || 0} orders, ${m.customers || 0} customers cloned, ${m.categories || 0} categories, ${m.attributes || 0} modifiers.${skipNote}`,
        icon: "success",
      });
    } catch (err) {
      setPasswordError(err.message || "Transfer failed");
      swal("Transfer failed", err.message || "Something went wrong", "error");
    } finally {
      setTransferring(false);
    }
  };

  const handleCustomerLookup = async (e) => {
    e?.preventDefault?.();
    setCustomerLookupError("");
    setCustomerPreview(null);

    const id = String(customerIdInput || "").trim();
    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      setCustomerLookupError("Enter a valid restaurant ID (numbers only).");
      return;
    }

    setCustomerLookupLoading(true);
    try {
      const data = await previewDataTransfer(id);
      setCustomerPreview(data);
    } catch (err) {
      setCustomerLookupError(err.message || "Restaurant not found");
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  const openCustomerConfirm = () => {
    setCustomerPassword("");
    setCustomerPasswordError("");
    setShowCustomerConfirm(true);
  };

  const handleCustomerTransfer = async () => {
    setCustomerPasswordError("");
    if (String(customerPassword) !== TRANSFER_PASSCODE) {
      setCustomerPasswordError("Incorrect password.");
      return;
    }
    if (!customerPreview?.id) return;

    const pointsNote = transferPoints
      ? "Reward points will be copied."
      : "Customers will be created with 0 points.";

    const confirmed = await swal({
      title: "Clone customers?",
      text: `This will COPY all customers from "${customerPreview.name}" onto your current restaurant. Source customers stay unchanged. ${pointsNote} Phones that already exist here will be skipped.`,
      icon: "warning",
      buttons: ["Cancel", "Yes, clone customers"],
      dangerMode: true,
    });

    if (!confirmed) return;

    setCustomerTransferring(true);
    try {
      const result = await runCustomerTransfer(customerPreview.id, customerPassword, {
        transferPoints,
      });
      setShowCustomerConfirm(false);
      setCustomerPassword("");
      setCustomerPreview(null);
      setCustomerIdInput("");
      const skipNote =
        result.skipped > 0
          ? ` ${result.skipped} skipped (phone already exists or missing).`
          : "";
      await swal({
        title: "Customer transfer complete",
        text: `Cloned ${result.created || 0} of ${result.sourceTotal || 0} customers from ${result.source?.name || customerPreview.name}.${transferPoints ? " Points included." : " Points set to 0."}${skipNote}`,
        icon: "success",
      });
    } catch (err) {
      setCustomerPasswordError(err.message || "Transfer failed");
      swal("Customer transfer failed", err.message || "Something went wrong", "error");
    } finally {
      setCustomerTransferring(false);
    }
  };

  const counts = preview?.counts;
  const customerCounts = customerPreview?.counts;
  const anyBusy = transferring || customerTransferring;

  return (
    <div>
      <div className="row">
        <div className="col-xl-8 col-lg-10">
          <Card className="border-0 shadow-sm mb-4 h-auto">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <ArrowRightLeft size={22} />
                <h4 className="mb-0">Transfer Restaurant Data</h4>
              </div>
              <p className="text-muted mb-4">
                Move menu items and orders from another restaurant onto your current restaurant.
                Customers are cloned (source keeps its customers). Requires passcode. This does not
                delete the source restaurant record.
              </p>

              <Alert variant="warning" className="mb-4">
                Menu and orders are a <strong>move</strong>. Customers are a <strong>copy</strong>.
                Stripe Connect, printers, hours, and website settings stay on the source.
              </Alert>

              <Form onSubmit={handleLookup}>
                <Form.Group className="mb-0">
                  <Form.Label className="fw-semibold">Source restaurant ID</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 42"
                      value={restaurantIdInput}
                      onChange={(e) => {
                        setRestaurantIdInput(e.target.value);
                        setPreview(null);
                        setLookupError("");
                      }}
                      disabled={lookupLoading || anyBusy}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={lookupLoading || anyBusy || !restaurantIdInput.trim()}
                      className="d-flex align-items-center gap-2 text-nowrap"
                    >
                      {lookupLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Search size={16} />
                      )}
                      Look up
                    </Button>
                  </div>
                </Form.Group>
              </Form>

              {lookupError && (
                <Alert variant="danger" className="mb-0 mt-3">
                  {lookupError}
                </Alert>
              )}

              {preview && (
                <div
                  className="p-3 rounded mt-3"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <div className="mb-2">
                    <span className="text-muted">Transfer from restaurant</span>
                    <h5 className="mb-1 mt-1">{preview.name}</h5>
                    <small className="text-muted">ID: {preview.id}</small>
                  </div>
                  {counts && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge bg="secondary">{counts.categories} categories</Badge>
                      <Badge bg="secondary">{counts.items} items</Badge>
                      <Badge bg="secondary">{counts.attributes} modifiers</Badge>
                      <Badge bg="secondary">{counts.itemGroups} menu groups</Badge>
                      <Badge bg="secondary">{counts.specialModifiers} special modifiers</Badge>
                      <Badge bg="primary">{counts.orders} orders</Badge>
                      <Badge bg="primary">{counts.customers} customers</Badge>
                    </div>
                  )}
                  <Button
                    variant="danger"
                    onClick={openConfirm}
                    disabled={anyBusy}
                    className="d-flex align-items-center gap-2"
                  >
                    <ArrowRightLeft size={16} />
                    Transfer this data
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm h-auto">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Users size={22} />
                <h4 className="mb-0">Transfer Customers</h4>
              </div>
              <p className="text-muted mb-4">
                Clone all customers from another restaurant onto this one. Source customers are not
                deleted or moved — only new rows are created for the current restaurant. Requires
                passcode.
              </p>

              <Alert variant="info" className="mb-4">
                This is a <strong>copy</strong>. Duplicate phone numbers already on this restaurant
                are skipped.
              </Alert>

              <Form onSubmit={handleCustomerLookup}>
                <Form.Group className="mb-0">
                  <Form.Label className="fw-semibold">Source restaurant ID</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 42"
                      value={customerIdInput}
                      onChange={(e) => {
                        setCustomerIdInput(e.target.value);
                        setCustomerPreview(null);
                        setCustomerLookupError("");
                      }}
                      disabled={customerLookupLoading || anyBusy}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        customerLookupLoading || anyBusy || !customerIdInput.trim()
                      }
                      className="d-flex align-items-center gap-2 text-nowrap"
                    >
                      {customerLookupLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Search size={16} />
                      )}
                      Look up
                    </Button>
                  </div>
                </Form.Group>
              </Form>

              {customerLookupError && (
                <Alert variant="danger" className="mb-0 mt-3">
                  {customerLookupError}
                </Alert>
              )}

              {customerPreview && (
                <div
                  className="p-3 rounded mt-3"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <div className="mb-2">
                    <span className="text-muted">Clone customers from</span>
                    <h5 className="mb-1 mt-1">{customerPreview.name}</h5>
                    <small className="text-muted">ID: {customerPreview.id}</small>
                  </div>
                  {customerCounts && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge bg="primary">{customerCounts.customers} customers</Badge>
                    </div>
                  )}
                  <Form.Check
                    type="checkbox"
                    id="transfer-points-checkbox"
                    className="mb-3"
                    checked={transferPoints}
                    onChange={(e) => setTransferPoints(e.target.checked)}
                    disabled={anyBusy}
                    label="Transfer points (unchecked = create customers with 0 points)"
                  />
                  <Button
                    variant="primary"
                    onClick={openCustomerConfirm}
                    disabled={anyBusy || !customerCounts?.customers}
                    className="d-flex align-items-center gap-2"
                  >
                    <Users size={16} />
                    Transfer customers
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showConfirm} onHide={() => !transferring && setShowConfirm(false)} centered>
        <Modal.Header closeButton={!transferring}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            Confirm transfer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Move menu/orders from <strong>{preview?.name}</strong> (ID {preview?.id}) and clone
            customers onto your current restaurant. Enter passcode to continue.
          </p>
          <Form.Group>
            <Form.Label className="fw-semibold">Passcode</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter passcode"
              disabled={transferring}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTransfer();
                }
              }}
            />
            {passwordError && (
              <Form.Text className="text-danger d-block mt-1">{passwordError}</Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowConfirm(false)} disabled={transferring}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleTransfer} disabled={transferring || !password}>
            {transferring ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Transferring…
              </>
            ) : (
              "Yes, transfer data"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCustomerConfirm}
        onHide={() => !customerTransferring && setShowCustomerConfirm(false)}
        centered
      >
        <Modal.Header closeButton={!customerTransferring}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            Confirm customer transfer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Clone <strong>{customerCounts?.customers || 0}</strong> customers from{" "}
            <strong>{customerPreview?.name}</strong> (ID {customerPreview?.id}) onto this
            restaurant.
            {transferPoints
              ? " Points will be copied."
              : " Points will be set to 0."}{" "}
            Source customers stay. Enter passcode to continue.
          </p>
          <Form.Check
            type="checkbox"
            id="transfer-points-modal-checkbox"
            className="mb-3"
            checked={transferPoints}
            onChange={(e) => setTransferPoints(e.target.checked)}
            disabled={customerTransferring}
            label="Transfer points"
          />
          <Form.Group>
            <Form.Label className="fw-semibold">Passcode</Form.Label>
            <Form.Control
              type="password"
              value={customerPassword}
              onChange={(e) => {
                setCustomerPassword(e.target.value);
                setCustomerPasswordError("");
              }}
              placeholder="Enter passcode"
              disabled={customerTransferring}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomerTransfer();
                }
              }}
            />
            {customerPasswordError && (
              <Form.Text className="text-danger d-block mt-1">
                {customerPasswordError}
              </Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowCustomerConfirm(false)}
            disabled={customerTransferring}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCustomerTransfer}
            disabled={customerTransferring || !customerPassword}
          >
            {customerTransferring ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Transferring…
              </>
            ) : (
              "Yes, clone customers"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
