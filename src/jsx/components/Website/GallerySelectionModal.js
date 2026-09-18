import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { getToken } from "../../../store/utlits";

export default function GallerySelectionModal({ show, onHide, onSelectImage }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("original"); // "original" or "ai"

  useEffect(() => {
    if (show) {
      setSelectedUrl(null); // Reset selection on open
      fetchImages();
    }
  }, [show]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/smart-media/gallery-images", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch gallery images");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
    }
  };

  // Group images
  const originalImages = images.filter((img) => img.source !== "ai_enhanced");
  const aiImages = images.filter((img) => img.source === "ai_enhanced");

  const currentTabImages = activeTab === "original" ? originalImages : aiImages;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-4 fw-bold text-dark">
          🖼️ Select from Gallery
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2" style={{ minHeight: "350px" }}>
        
        {/* Premium Segmented Control / Tabs */}
        <div className="d-flex justify-content-center my-3">
          <div 
            className="p-1 d-flex bg-light rounded-pill border" 
            style={{ width: "fit-content", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={() => setActiveTab("original")}
              className={`btn rounded-pill px-4 py-2 fw-semibold transition-all d-flex align-items-center gap-2 ${
                activeTab === "original"
                  ? "bg-white text-primary shadow-sm border-0"
                  : "text-muted border-0 bg-transparent"
              }`}
              style={{ fontSize: "14px", transition: "all 0.3s ease" }}
            >
              <span>📷</span>
              Original & Uploads ({originalImages.length})
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`btn rounded-pill px-4 py-2 fw-semibold transition-all d-flex align-items-center gap-2 ${
                activeTab === "ai"
                  ? "bg-white text-primary shadow-sm border-0"
                  : "text-muted border-0 bg-transparent"
              }`}
              style={{ fontSize: "14px", transition: "all 0.3s ease" }}
            >
              <span>✨</span>
              AI Enhanced ({aiImages.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 my-4">
            <Spinner animation="border" variant="primary" />
            <div className="text-muted mt-2 fw-semibold" style={{ fontSize: "13px" }}>Loading gallery...</div>
          </div>
        ) : currentTabImages.length === 0 ? (
          <div className="text-center py-5 my-4 text-muted d-flex flex-column align-items-center justify-content-center">
            <div 
              className="bg-light rounded-circle p-4 mb-3 d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <span style={{ fontSize: "36px" }}>{activeTab === "original" ? "📷" : "✨"}</span>
            </div>
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "16px" }}>
              No Images Found
            </h5>
            <p className="text-muted mb-0" style={{ fontSize: "13px", maxWidth: "320px" }}>
              {activeTab === "original"
                ? "You haven't uploaded any original images to your gallery yet."
                : "No AI美化 images found. Try using our AI美化 feature to enhance your photos first!"}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-4 justify-content-start p-2" style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {currentTabImages.map((img) => (
              <div
                key={img.ai_id}
                className={`position-relative rounded-4 overflow-hidden shadow-sm border cursor-pointer select-card ${
                  selectedUrl === img.ai_url ? "border-primary border-3" : "border-light"
                }`}
                style={{ 
                  width: "160px", 
                  height: "160px", 
                  cursor: "pointer", 
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  transform: selectedUrl === img.ai_url ? "scale(1.03)" : "scale(1)"
                }}
                onClick={() => setSelectedUrl(img.ai_url)}
              >
                <img
                  src={img.ai_url}
                  alt="Gallery Item"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
                
                {/* Premium hover overlay */}
                <div 
                  className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.1)",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <div className="bg-white rounded-circle p-2 shadow-sm text-primary">
                    🔍
                  </div>
                </div>

                {selectedUrl === img.ai_url && (
                  <div 
                    className="position-absolute bg-primary text-white d-flex align-items-center justify-content-center shadow" 
                    style={{ 
                      top: "10px", 
                      right: "10px", 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%",
                      fontSize: "14px",
                      fontWeight: "bold",
                      border: "2px solid white"
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* AI Enhanced Tag */}
                {img.source === "ai_enhanced" && (
                  <div 
                    className="position-absolute bg-dark text-white px-2 py-0.5 rounded-pill"
                    style={{
                      bottom: "10px",
                      left: "10px",
                      fontSize: "10px",
                      fontWeight: "semibold",
                      opacity: 0.85,
                      letterSpacing: "0.5px"
                    }}
                  >
                    ✨ AI Enhanced
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          className="rounded-pill px-4 shadow-sm"
          onClick={handleConfirm} 
          disabled={!selectedUrl}
        >
          Select Image
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
