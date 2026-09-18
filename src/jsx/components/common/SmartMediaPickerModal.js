import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";
import { Images } from "react-bootstrap-icons";

const PAGE_SIZE = 24;

function parseFilenameFromContentDisposition(header) {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;\s]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      return star[1];
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted) return quoted[1];
  return null;
}

/**
 * Pick images/videos from Smart Media gallery; returns browser File objects via onPickFiles.
 */
export default function SmartMediaPickerModal({
  show,
  onHide,
  onPickFiles,
  maxAdd,
  title = "Choose from Smart Media gallery",
}) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [typeFilter, setTypeFilter] = useState("all");
  const [importing, setImporting] = useState(false);

  const fetchPage = useCallback(async (p) => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/smart-media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.message || "Failed to load gallery", "error");
        return;
      }
      const data = await res.json();
      setMedia(data.media || []);
      setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
      setPage(data.pagination?.page || p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setSelectedIds(new Set());
      setTypeFilter("all");
      fetchPage(1);
    }
  }, [show, fetchPage]);

  const filteredMedia = media.filter((m) => {
    if (typeFilter === "all") return true;
    return m.file_type === typeFilter;
  });

  const toggleSelect = (id) => {
    const cap = Math.max(0, maxAdd);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= cap) {
        Swal.fire({
          icon: "info",
          title: "Limit reached",
          text: `You can add at most ${cap} more file(s).`,
          timer: 2000,
          showConfirmButton: false,
        });
        return prev;
      }
      next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      Swal.fire({
        icon: "info",
        title: "Select at least one item",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setImporting(true);
    try {
      const token = getToken();
      const files = [];
      for (const id of selectedIds) {
        const res = await fetch(`/api/smart-media/file/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to load item ${id}`);
        }
        const blob = await res.blob();
        const cdName = parseFilenameFromContentDisposition(
          res.headers.get("Content-Disposition"),
        );
        const mime =
          blob.type ||
          (res.headers.get("Content-Type") || "application/octet-stream");
        const name = cdName || `gallery-${id}`;
        files.push(new File([blob], name, { type: mime }));
      }
      await onPickFiles(files);
      onHide();
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Could not load media",
        text: e.message || "Something went wrong.",
      });
    } finally {
      setImporting(false);
    }
  };

  const cap = Math.max(0, maxAdd);

  return (
    <Modal
      show={show}
      onHide={importing ? () => {} : onHide}
      size="lg"
      centered
      backdrop={importing ? "static" : true}
      enforceFocus={false}
    >
      <Modal.Header closeButton={!importing}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Images className="text-primary" />
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <Form.Select
            style={{ maxWidth: 200 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={loading || importing}
          >
            <option value="all">All</option>
            <option value="image">Images only</option>
            <option value="video">Videos only</option>
          </Form.Select>
          <span className="text-muted small">
            {selectedIds.size} selected
            {cap > 0 ? ` · up to ${cap} more allowed` : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No items on this page. Try another filter or page.
          </p>
        ) : (
          <Row className="g-2" style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {filteredMedia.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <Col key={item.id} xs={6} sm={4} md={3}>
                  <button
                    type="button"
                    className="border-0 p-0 w-100 rounded-3 overflow-hidden position-relative bg-light"
                    style={{
                      aspectRatio: "1",
                      cursor: "pointer",
                      boxShadow: selected
                        ? "0 0 0 3px var(--bs-primary)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                    onClick={() => toggleSelect(item.id)}
                  >
                    {item.file_type === "video" ? (
                      <video
                        src={item.file_url}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={item.file_name || ""}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <span
                      className="position-absolute top-0 end-0 m-1 badge"
                      style={{
                        background: selected
                          ? "var(--bs-primary)"
                          : "rgba(0,0,0,0.55)",
                      }}
                    >
                      {item.file_type === "video" ? "VIDEO" : "IMG"}
                    </span>
                    {selected && (
                      <span className="position-absolute bottom-0 start-0 end-0 bg-primary text-white small py-1 text-center">
                        Selected
                      </span>
                    )}
                  </button>
                </Col>
              );
            })}
          </Row>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={loading || importing || page <= 1}
              onClick={() => fetchPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={loading || importing || page >= totalPages}
              onClick={() => fetchPage(page + 1)}
            >
              Next
            </Button>
          </div>
          <span className="text-muted small">
            Page {page} of {totalPages}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={importing}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={importing || selectedIds.size === 0 || cap === 0}
        >
          {importing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding…
            </>
          ) : selectedIds.size > 0 ? (
            `Add ${selectedIds.size} to post`
          ) : (
            "Add to post"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
