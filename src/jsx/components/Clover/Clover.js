import React, { useEffect, useState } from "react";
import { getToken } from "../../../store/utlits";
import { Button, Card, Form, Badge, Table } from "react-bootstrap";
import {
  FaPlug,
  FaUnlink,
  FaPrint,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUtensils,
  FaUsers,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function Clover() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [menuPreview, setMenuPreview] = useState(null);
  const [manualForm, setManualForm] = useState({
    merchant_id: "",
    api_token: "",
    tender_id: "",
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clover/status", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected && data.oauth_verified) {
          fetchTenders();
        }
      }
    } catch (err) {
      console.error("Failed to fetch Clover status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenders = async () => {
    try {
      const res = await fetch("/api/clover/tenders", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTenders(data.tenders || []);
      }
    } catch (err) {
      console.error("Failed to fetch Clover tenders:", err);
    }
  };

  useEffect(() => {
    fetchStatus();

    const onMessage = (event) => {
      if (event.data?.source === "ownmenu-clover-oauth") {
        if (event.data.status === "success") {
          Swal.fire("Connected", "Clover connected via OAuth.", "success");
          fetchStatus();
        } else {
          Swal.fire("Connection failed", event.data.message || "Clover OAuth failed.", "error");
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cloverStatus = params.get("clover");
    if (cloverStatus === "success") {
      Swal.fire("Connected", "Clover connected via OAuth.", "success");
      window.history.replaceState({}, "", window.location.pathname);
      fetchStatus();
    } else if (cloverStatus === "error") {
      Swal.fire("Connection failed", params.get("message") || "Clover OAuth failed.", "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleOAuthConnect = async () => {
    try {
      const res = await fetch(`/api/clover/connect?popup=1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok || !data.authUrl) throw new Error(data.error || "OAuth not available");
      const popup = window.open(data.authUrl, "clover-oauth", "width=600,height=700");
      if (!popup) window.location.href = data.authUrl;
    } catch (err) {
      Swal.fire("OAuth unavailable", err.message, "error");
    }
  };

  const handleConnectManual = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clover/connect-manual", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(manualForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      Swal.fire("Connected", "Manual token connected.", "success");
      setManualForm((prev) => ({ ...prev, api_token: "" }));
      fetchStatus();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      title: "Disconnect Clover?",
      text: "Orders, menu sync, and customer sync will stop.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Disconnect",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const res = await fetch("/api/clover/disconnect", {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Disconnect failed");
      setStatus({ connected: false, oauth_verified: false, allow_manual: status?.allow_manual });
      setTenders([]);
      setMenuPreview(null);
      Swal.fire("Disconnected", "Clover has been disconnected.", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async (patch) => {
    setSaving(true);
    try {
      const res = await fetch("/api/clover/settings", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setStatus((prev) => ({ ...prev, ...patch }));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMenuPreview = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clover/menu/preview", { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setMenuPreview(data);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMenuSync = async (mode) => {
    const result = await Swal.fire({
      title: mode === "fill_empty" ? "Import Clover menu?" : "Upsert Clover menu?",
      text:
        mode === "fill_empty"
          ? "Only works when your OwnMenu menu is empty."
          : "Creates missing items and updates items already mapped by clover_item_id.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sync now",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const res = await fetch("/api/clover/menu/sync", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      Swal.fire(
        "Menu synced",
        `Categories +${data.categories_created}/~${data.categories_updated}. Items +${data.items_created}/~${data.items_updated}.`,
        "success"
      );
      fetchStatus();
      handleMenuPreview();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerSync = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clover/customers/sync", {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Customer sync failed");
      Swal.fire(
        "Customers synced",
        `Pulled ${data.clover_total} Clover customers. Linked ${data.linked_to_ownmenu} to OwnMenu by phone.`,
        "success"
      );
      fetchStatus();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-3 font-weight-bold">Loading Clover settings...</span>
      </div>
    );
  }

  const isVerified = status?.connected && status?.oauth_verified;

  if (!isVerified) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-8">
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <FaPlug className="text-primary me-2" size={24} />
                  <div>
                    <h4 className="mb-0">Connect Clover POS</h4>
                    <p className="text-muted mb-0">
                      OAuth is required. Only verified Clover connections can receive orders, sync menus, and pull customers.
                    </p>
                  </div>
                </div>

                {status?.connected && !status?.oauth_verified && (
                  <div className="alert alert-warning">
                    <FaExclamationTriangle className="me-2" />
                    A connection exists but is not OAuth-verified. Disconnect and reconnect with Clover OAuth.
                  </div>
                )}

                <p className="text-muted small mb-3">
                  Connects to <strong>Clover production</strong> (`www.clover.com` / `api.clover.com`).
                </p>

                <Button variant="primary" size="lg" onClick={handleOAuthConnect} disabled={saving}>
                  <FaPlug className="me-2" />
                  Connect with Clover (OAuth)
                </Button>

                {status?.allow_manual && (
                  <Card className="mt-4 border">
                    <Card.Body>
                      <h6 className="text-muted">Manual API token (dev only)</h6>
                      <Form onSubmit={handleConnectManual}>
                        <Form.Group className="mb-2">
                          <Form.Control
                            placeholder="Merchant ID"
                            value={manualForm.merchant_id}
                            onChange={(e) => setManualForm({ ...manualForm, merchant_id: e.target.value })}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Control
                            type="password"
                            placeholder="API token"
                            value={manualForm.api_token}
                            onChange={(e) => setManualForm({ ...manualForm, api_token: e.target.value })}
                            required
                          />
                        </Form.Group>
                        <Button type="submit" variant="outline-secondary" size="sm" disabled={saving}>
                          Connect manual token
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-xl-8">
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="mb-1 d-flex align-items-center gap-2">
                    <FaCheckCircle className="text-success" /> Clover Connected
                    <Badge bg="success">OAuth</Badge>
                  </h4>
                  <p className="text-muted mb-0">
                    Merchant <strong>{status.merchant_id}</strong> · {status.environment}
                  </p>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleDisconnect} disabled={saving}>
                  <FaUnlink className="me-1" /> Disconnect
                </Button>
              </div>

              {status.last_sync_error && (
                <div className="alert alert-warning d-flex align-items-start">
                  <FaExclamationTriangle className="me-2 mt-1" />
                  <div>
                    <strong>Last error:</strong> {status.last_sync_error}
                  </div>
                </div>
              )}

              <div className="mb-3 small text-muted">
                <div>Token: {status.token_hint}</div>
                {status.last_synced_at && (
                  <div>Last order push: {new Date(status.last_synced_at).toLocaleString()}</div>
                )}
                {status.last_menu_synced_at && (
                  <div>Last menu sync: {new Date(status.last_menu_synced_at).toLocaleString()}</div>
                )}
                {status.last_customers_synced_at && (
                  <div>Last customer sync: {new Date(status.last_customers_synced_at).toLocaleString()}</div>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="clover-sync-enabled"
                  label="Send new OwnMenu orders to Clover"
                  checked={!!status.sync_enabled}
                  onChange={(e) => updateSettings({ sync_enabled: e.target.checked })}
                  disabled={saving}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="clover-print-enabled"
                  label={
                    <span>
                      <FaPrint className="me-1" /> Auto-print on Clover device
                    </span>
                  }
                  checked={!!status.print_enabled}
                  onChange={(e) => updateSettings({ print_enabled: e.target.checked })}
                  disabled={saving}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label>Paid-online tender</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={status.tender_id || ""}
                    onChange={(e) => updateSettings({ tender_id: e.target.value || null })}
                    disabled={saving}
                  >
                    <option value="">Select tender...</option>
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label || t.labelKey || t.id}
                        {!t.enabled ? " (disabled)" : ""}
                      </option>
                    ))}
                  </Form.Select>
                  <Button variant="outline-secondary" onClick={fetchTenders} disabled={saving}>
                    <FaSync />
                  </Button>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FaUtensils /> Menu sync (Clover → OwnMenu)
              </h5>
              <p className="text-muted small">
                Pull categories and items from Clover. Empty OwnMenu menus can use Fill empty; otherwise use Upsert.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button variant="outline-primary" onClick={handleMenuPreview} disabled={saving}>
                  Preview
                </Button>
                <Button variant="primary" onClick={() => handleMenuSync("fill_empty")} disabled={saving}>
                  Fill empty menu
                </Button>
                <Button variant="outline-secondary" onClick={() => handleMenuSync("upsert")} disabled={saving}>
                  Upsert menu
                </Button>
              </div>
              {menuPreview && (
                <div className="bg-light rounded p-3">
                  <div>
                    Clover: <strong>{menuPreview.category_count}</strong> categories,{" "}
                    <strong>{menuPreview.item_count}</strong> items
                  </div>
                  <div>
                    OwnMenu currently has <strong>{menuPreview.ownmenu_item_count}</strong> items
                  </div>
                  {menuPreview.sample_items?.length > 0 && (
                    <Table size="sm" className="mt-2 mb-0">
                      <thead>
                        <tr>
                          <th>Sample item</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuPreview.sample_items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>${Number(it.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FaUsers /> Customer sync
              </h5>
              <p className="text-muted small">
                Pull Clover customers and link matching OwnMenu customers by phone. Use the Customers page filter: OwnMenu / Clover / All.
              </p>
              <Button variant="primary" onClick={handleCustomerSync} disabled={saving}>
                Sync customers from Clover
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">Ticket note layout</h5>
              <pre className="bg-light p-3 rounded mb-0" style={{ whiteSpace: "pre-wrap" }}>
{`OwnMenu #ABC1234

Order #ABC1234
PICKUP
John Smith
(856) 555-1234
Ready: ASAP
PAID ONLINE (OwnMenu)`}
              </pre>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
