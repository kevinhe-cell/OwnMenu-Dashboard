import { useCallback, useEffect, useState } from "react";
import { Card, Button, Form, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { Download, Search, AlertTriangle, Trash2 } from "lucide-react";
import swal from "sweetalert";
import { previewMenuImport, runMenuImport } from "../../../store/menuImport";
import { previewMenuClear, runMenuClear } from "../../../store/menuClear";

function CountBadges({ counts }) {
  if (!counts) return null;
  return (
    <div className="d-flex flex-wrap gap-2">
      <Badge bg="light" text="dark" className="border">
        {counts.categories} categories
      </Badge>
      <Badge bg="light" text="dark" className="border">
        {counts.items} items
      </Badge>
      {typeof counts.deletedItems === "number" && counts.deletedItems > 0 && (
        <Badge bg="light" text="dark" className="border">
          {counts.deletedItems} deleted items
        </Badge>
      )}
      <Badge bg="light" text="dark" className="border">
        {counts.attributes} modifiers
      </Badge>
      <Badge bg="light" text="dark" className="border">
        {counts.itemGroups} groups
      </Badge>
      <Badge bg="light" text="dark" className="border">
        {counts.specialModifiers} special
      </Badge>
    </div>
  );
}

export default function ImportMenu() {
  const [restaurantIdInput, setRestaurantIdInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [importing, setImporting] = useState(false);

  const [clearPreview, setClearPreview] = useState(null);
  const [clearLoading, setClearLoading] = useState(true);
  const [clearError, setClearError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [clearPasswordError, setClearPasswordError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadClearPreview = useCallback(async () => {
    setClearLoading(true);
    setClearError("");
    try {
      const data = await previewMenuClear();
      setClearPreview(data);
    } catch (err) {
      setClearError(err.message || "Failed to load menu summary");
      setClearPreview(null);
    } finally {
      setClearLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClearPreview();
  }, [loadClearPreview]);

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
      const data = await previewMenuImport(id);
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

  const handleImport = async () => {
    setPasswordError("");
    if (String(password) !== "0930") {
      setPasswordError("Incorrect password.");
      return;
    }
    if (!preview?.id) return;

    const confirmed = await swal({
      title: "Are you sure?",
      text: `This will copy the full menu from "${preview.name}" onto your current restaurant. Existing menu items will stay; imported items are added on top.`,
      icon: "warning",
      buttons: ["Cancel", "Yes, import"],
      dangerMode: true,
    });

    if (!confirmed) return;

    setImporting(true);
    try {
      const result = await runMenuImport(preview.id, password);
      setShowConfirm(false);
      setPassword("");
      const c = result.created || {};
      await swal({
        title: "Import complete",
        text: `From ${result.source?.name || preview.name}: ${c.categories || 0} categories, ${c.items || 0} items, ${c.attributes || 0} modifiers, ${c.itemGroups || 0} menu groups, ${c.specialModifiers || 0} special modifiers.`,
        icon: "success",
      });
      await loadClearPreview();
    } catch (err) {
      setPasswordError(err.message || "Import failed");
      swal("Import failed", err.message || "Something went wrong", "error");
    } finally {
      setImporting(false);
    }
  };

  const openClearConfirm = () => {
    setClearPassword("");
    setClearPasswordError("");
    setShowClearConfirm(true);
  };

  const handleDelete = async () => {
    setClearPasswordError("");
    if (String(clearPassword) !== "0930") {
      setClearPasswordError("Incorrect password.");
      return;
    }
    if (!clearPreview?.canDelete) {
      setClearPasswordError("This restaurant still has orders.");
      return;
    }

    const confirmed = await swal({
      title: "Delete entire menu?",
      text: "This permanently deletes all categories, items, modifiers, menu groups, and special modifiers. This cannot be undone.",
      icon: "warning",
      buttons: ["Cancel", "Yes, delete everything"],
      dangerMode: true,
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await runMenuClear(clearPassword);
      setShowClearConfirm(false);
      setClearPassword("");
      const d = result.deleted || {};
      await swal({
        title: "Menu deleted",
        text: `Removed ${d.categories || 0} categories, ${d.items || 0} items, ${d.attributes || 0} modifiers, ${d.itemGroups || 0} menu groups, ${d.specialModifiers || 0} special modifiers.`,
        icon: "success",
      });
      await loadClearPreview();
    } catch (err) {
      setClearPasswordError(err.message || "Delete failed");
      swal("Delete failed", err.message || "Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = Boolean(clearPreview?.canDelete);
  const busy = importing || deleting;
  const clearCounts = clearPreview?.counts;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-xl-8 col-lg-10">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-1">Menu Tools</h4>
              <p className="text-muted mb-4">
                Import a menu from another restaurant, or clear this restaurant&apos;s menu when it
                has no orders.
              </p>

              <section className="mb-4 pb-4 border-bottom">
                <h5 className="mb-1 d-flex align-items-center gap-2">
                  <Download size={18} />
                  Import
                </h5>
                <p className="text-muted small mb-3">
                  Copies categories, items, modifiers, groups, and special modifiers onto the current
                  menu. Existing items stay; imported content is added on top.
                </p>

                <Form onSubmit={handleLookup}>
                  <Form.Label className="fw-semibold">Source restaurant ID</Form.Label>
                  <div className="d-flex gap-2 mb-3">
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
                      disabled={lookupLoading || busy}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={lookupLoading || busy || !restaurantIdInput.trim()}
                      className="d-flex align-items-center gap-2 text-nowrap"
                    >
                      {lookupLoading ? <Spinner animation="border" size="sm" /> : <Search size={16} />}
                      Look up
                    </Button>
                  </div>
                </Form>

                {lookupError && <Alert variant="danger">{lookupError}</Alert>}

                {preview && (
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                      <div className="fw-semibold">{preview.name}</div>
                      <div className="text-muted small mb-2">ID {preview.id}</div>
                      <CountBadges counts={preview.counts} />
                    </div>
                    <Button
                      variant="primary"
                      onClick={openConfirm}
                      disabled={busy}
                      className="d-flex align-items-center gap-2 text-nowrap align-self-start"
                    >
                      <Download size={16} />
                      Import menu
                    </Button>
                  </div>
                )}
              </section>

              <section>
                <h5 className="mb-1 d-flex align-items-center gap-2 text-danger">
                  <Trash2 size={18} />
                  Delete all
                </h5>
                <p className="text-muted small mb-3">
                  Permanently removes this restaurant&apos;s full menu. Blocked if any orders exist.
                </p>

                {clearLoading && (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Spinner animation="border" size="sm" />
                    Loading…
                  </div>
                )}

                {clearError && <Alert variant="danger">{clearError}</Alert>}

                {!clearLoading && clearPreview && (
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                      <div className="fw-semibold">{clearPreview.name}</div>
                      <div className="text-muted small mb-2">ID {clearPreview.id}</div>
                      <CountBadges counts={clearCounts} />
                      {!canDelete && (
                        <div className="text-warning small mt-2">
                          Cannot delete — this restaurant already has orders.
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline-danger"
                      onClick={openClearConfirm}
                      disabled={busy || !canDelete}
                      className="d-flex align-items-center gap-2 text-nowrap align-self-start"
                    >
                      <Trash2 size={16} />
                      Delete menu
                    </Button>
                  </div>
                )}
              </section>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showConfirm} onHide={() => !importing && setShowConfirm(false)} centered>
        <Modal.Header closeButton={!importing}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            Confirm import
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Import the menu from <strong>{preview?.name}</strong> (ID {preview?.id}) onto this
            restaurant?
          </p>
          <Form.Group>
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter password"
              disabled={importing}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleImport();
                }
              }}
            />
            {passwordError && (
              <Form.Text className="text-danger d-block mt-1">{passwordError}</Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowConfirm(false)} disabled={importing}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={importing || !password}>
            {importing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Importing…
              </>
            ) : (
              "Import menu"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClearConfirm} onHide={() => !deleting && setShowClearConfirm(false)} centered>
        <Modal.Header closeButton={!deleting}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-danger" />
            Confirm delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Permanently wipe the menu for <strong>{clearPreview?.name}</strong>? This cannot be
            undone.
          </p>
          <Form.Group>
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              value={clearPassword}
              onChange={(e) => {
                setClearPassword(e.target.value);
                setClearPasswordError("");
              }}
              placeholder="Enter password"
              disabled={deleting}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleDelete();
                }
              }}
            />
            {clearPasswordError && (
              <Form.Text className="text-danger d-block mt-1">{clearPasswordError}</Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowClearConfirm(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting || !clearPassword}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting…
              </>
            ) : (
              "Delete everything"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
