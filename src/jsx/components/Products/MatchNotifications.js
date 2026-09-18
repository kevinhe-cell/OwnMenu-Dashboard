import { useEffect, useState } from "react";
import { Alert, Button, Card, Modal, Badge } from "react-bootstrap";
import { FaCheck, FaTimes, FaImage, FaSpinner } from "react-icons/fa";
import { getToken } from "../../../store/utlits";
import swal from "sweetalert";

function MatchNotifications({ onMatchResolved, onItemsRefresh }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [processing, setProcessing] = useState(null);
  console.log("MatchNotifications: matches", matches);
  useEffect(() => {
    fetchPendingMatches();
    // Poll every 30 seconds for new matches
    const interval = setInterval(fetchPendingMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("MatchNotifications: matches updated", matches.length, matches);
  }, [matches]);

  const fetchPendingMatches = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/smart-media/matches/pending", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Pending matches data:", data);
        setMatches(data.matches || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch matches:", response.status, errorData);
        setMatches([]);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (match) => {
    setProcessing(match.smart_media_id);
    try {
      const token = getToken();
      const response = await fetch(
        `/api/smart-media/matches/${match.smart_media_id}/approve`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        swal("Success!", "Image assigned to menu item.", "success");
        setMatches((prev) =>
          prev.filter((m) => m.smart_media_id !== match.smart_media_id)
        );
        onMatchResolved?.();
        onItemsRefresh?.();
      } else {
        const data = await response.json();
        swal("Error!", data.message || "Failed to approve match.", "error");
      }
    } catch (err) {
      swal("Error!", "Something went wrong.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (match) => {
    setProcessing(match.smart_media_id);
    try {
      const token = getToken();
      const response = await fetch(
        `/api/smart-media/matches/${match.smart_media_id}/reject`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        swal("Match rejected", "This image won't be matched again.", "info");
        setMatches((prev) =>
          prev.filter((m) => m.smart_media_id !== match.smart_media_id)
        );
      } else {
        const data = await response.json();
        swal("Error!", data.message || "Failed to reject match.", "error");
      }
    } catch (err) {
      swal("Error!", "Something went wrong.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const openMatchModal = () => {
    if (matches.length > 0) {
      setShowModal(true);
    }
  };

  // Don't render anything if no matches and not loading
  if (matches.length === 0 && !loading) {
    return null;
  }

  return (
    <>
      {matches.length > 0 && (
      <Alert variant="info" className="mb-4 border-0 shadow-sm" >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaImage className="text-primary" size={20} />
            <div>
              <Alert.Heading className="mb-1" style={{ fontSize: "1rem" }}>
                {matches.length} new image match{matches.length > 1 ? "es" : ""} found
              </Alert.Heading>
              <div className="small text-muted">
                AI matched uploaded images with your menu items. Review and approve or reject.
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openMatchModal}
            className="rounded-pill px-3"
          >
            Review matches ({matches.length})
          </Button>
        </div>
      </Alert>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review AI Matches ({matches.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {matches.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No pending matches found.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {matches.map((match) => {
                console.log("Rendering match:", match);
                return (
                  <Card key={match.smart_media_id} className="border shadow-sm">
                    <Card.Body>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="text-muted small mb-2">Matched Image</div>
                          <img
                            src={match.file_url}
                            alt={match.file_name || "Matched image"}
                            className="img-fluid rounded border"
                            style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }}
                            onError={(e) => {
                              console.error("Image failed to load:", match.file_url);
                              e.target.src = "https://via.placeholder.com/200?text=Image+Not+Found";
                            }}
                          />
                        </div>
                        <div className="col-md-8">
                          <div className="mb-3">
                            <Badge bg="success" className="mb-2">
                              {match.confidence ? `${(match.confidence * 100).toFixed(0)}% match` : "Match found"}
                            </Badge>
                            <h5 className="mb-1">{match.item_name || "Unknown Item"}</h5>
                            {match.reasoning && (
                              <p className="text-muted small mb-2">{match.reasoning}</p>
                            )}
                            <div className="text-muted small">
                              <strong>File:</strong> {match.file_name || "Unknown"}
                            </div>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                console.log("Approving match:", match);
                                handleApprove(match);
                                if (matches.length === 1) setShowModal(false);
                              }}
                              disabled={processing === match.smart_media_id}
                              className="rounded-pill"
                            >
                              {processing === match.smart_media_id ? (
                                <>
                                  <FaSpinner className="spinner-border spinner-border-sm me-1" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FaCheck className="me-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                console.log("Rejecting match:", match);
                                handleReject(match);
                                if (matches.length === 1) setShowModal(false);
                              }}
                              disabled={processing === match.smart_media_id}
                              className="rounded-pill"
                            >
                              <FaTimes className="me-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MatchNotifications;
