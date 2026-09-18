import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";
export const colorThemes = [
  // For: Modern Minimalist
  {
    name: "Pure Noir",
    primaryColor: "#000000",
    secondaryColor: "#f4f4f5",
    textColor: "#1f2937",
  },
  {
    name: "Smokehouse Blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#f0f9ff",
    textColor: "#1e3a8a",
  },
  {
    name: "Charcoal & Gold",
    primaryColor: "#facc15",
    secondaryColor: "#111827",
    textColor: "#fde047",
  },
  {
    name: "Monochrome Mist",
    primaryColor: "#2E2E2E",
    secondaryColor: "#F5F5F5",
    textColor: "#1A1A1A",
  },
  {
    name: "Ashen Blue",
    primaryColor: "#B0C4DE",
    secondaryColor: "#E6E6FA",
    textColor: "#4682B4",
  },

  // For: Traditional Asian
  {
    name: "Avocado Toast",
    primaryColor: "#10b981",
    secondaryColor: "#ecfdf5",
    textColor: "#064e3b",
  },
  {
    name: "Plum Wine",
    primaryColor: "#8b5cf6",
    secondaryColor: "#ede9fe",
    textColor: "#1e1b4b",
  },
  {
    name: "Crimson Jade",
    primaryColor: "#8B0000",
    secondaryColor: "#F0FFF0",
    textColor: "#006400",
  },
  {
    name: "Golden Bamboo",
    primaryColor: "#DAA520",
    secondaryColor: "#FFFACD",
    textColor: "#556B2F",
  },
  {
    name: "Celadon Harmony",
    primaryColor: "#ACE1AF",
    secondaryColor: "#F5FFFA",
    textColor: "#2E8B57",
  },

  // For: Elegant Fine Dining
  {
    name: "Midnight Copper",
    primaryColor: "#fb923c",
    secondaryColor: "#fef3c7",
    textColor: "#78350f",
  },
  {
    name: "Burgundy Velvet",
    primaryColor: "#800020",
    secondaryColor: "#F5F5DC",
    textColor: "#4B0082",
  },
  {
    name: "Champagne Gold",
    primaryColor: "#F7E7CE",
    secondaryColor: "#FFF8DC",
    textColor: "#8B4513",
  },
  {
    name: "Emerald Elegance",
    primaryColor: "#50C878",
    secondaryColor: "#F0FFF0",
    textColor: "#006400",
  },
  {
    name: "Silver Pearl",
    primaryColor: "#C0C0C0",
    secondaryColor: "#FFFFFF",
    textColor: "#2F4F4F",
  },

  // For: Tropical & Seafood
  {
    name: "Tropical Punch",
    primaryColor: "#0ea5e9",
    secondaryColor: "#f0fdfa",
    textColor: "#0f172a",
  },
  {
    name: "Lemon Basil",
    primaryColor: "#fde047",
    secondaryColor: "#fef9c3",
    textColor: "#1e293b",
  },
  {
    name: "Ocean Breeze",
    primaryColor: "#00CED1",
    secondaryColor: "#E0FFFF",
    textColor: "#2F4F4F",
  },
  {
    name: "Coral Reef",
    primaryColor: "#FF7F50",
    secondaryColor: "#FFF5EE",
    textColor: "#8B0000",
  },
  {
    name: "Lagoon Blue",
    primaryColor: "#20B2AA",
    secondaryColor: "#F0FFFF",
    textColor: "#00688B",
  },

  // For: Street Food / Food Truck
  {
    name: "Neon BBQ",
    primaryColor: "#f43f5e",
    secondaryColor: "#fef2f2",
    textColor: "#7f1d1d",
  },
  {
    name: "Graffiti Blue",
    primaryColor: "#1E90FF",
    secondaryColor: "#F0F8FF",
    textColor: "#00008B",
  },
  {
    name: "Spicy Salsa",
    primaryColor: "#FF4500",
    secondaryColor: "#FFF5EE",
    textColor: "#8B0000",
  },
  {
    name: "Urban Jungle",
    primaryColor: "#556B2F",
    secondaryColor: "#F0FFF0",
    textColor: "#2E8B57",
  },
  {
    name: "Curry Yellow",
    primaryColor: "#FFD700",
    secondaryColor: "#FFFACD",
    textColor: "#B8860B",
  },

  // For: Chic Café / Dessert Bar
  {
    name: "Rosé Velvet",
    primaryColor: "#f472b6",
    secondaryColor: "#fdf2f8",
    textColor: "#831843",
  },
  {
    name: "Cream Espresso",
    primaryColor: "#d97706",
    secondaryColor: "#fff7ed",
    textColor: "#1f2937",
  },
  {
    name: "Strawberry Milk",
    primaryColor: "#FFBCD9",
    secondaryColor: "#FFF5F7",
    textColor: "#AD1457",
  },
  {
    name: "Mint Cocoa",
    primaryColor: "#A7F3D0",
    secondaryColor: "#FDFDFB",
    textColor: "#065F46",
  },
  {
    name: "Peachy Rose",
    primaryColor: "#FBB6CE",
    secondaryColor: "#FFF0F5",
    textColor: "#702963",
  },
];

export const fontOptions = [
  // For: Modern Minimalist
  { name: "Inter" },
  { name: "Poppins" },
  { name: "Work Sans" },
  { name: "Manrope" },

  // For: Traditional Asian
  { name: "Mukta" },
  { name: "Cinzel" },
  { name: "Zen Old Mincho" },
  { name: "Noto Sans TC" },

  // For: Elegant Fine Dining
  { name: "Playfair Display" },
  { name: "Lora" },
  { name: "Cormorant Garamond" },
  { name: "Della Respira" },

  // For: Tropical & Seafood
  { name: "Raleway" },
  { name: "Open Sans" },
  { name: "Pacifico" },
  { name: "Merienda" },

  // For: Street Food / Food Truck
  { name: "Bebas Neue" },
  { name: "Oswald" },
  { name: "Shrikhand" },
  { name: "Staatliches" },

  // For: Chic Café / Dessert Bar
  { name: "Quicksand" },
  { name: "Great Vibes" },
  { name: "Dancing Script" },
  { name: "Cookie" },
];

const ThemeDropdown = ({
  onSelect,
  onSelecteFontStyle,
  onToggleColorLayout,
}) => {
  const homepagesetting = useSelector((state) => state.homepage.homepage);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: "",
    secondaryColor: "",
    textColor: "",
    name: "custom",
  });
  const [activeTab, setActiveTab] = useState("color"); // 'color' or 'font'

  const current = {
    primaryColor: homepagesetting?.primaryColor,
    secondaryColor: homepagesetting?.secondaryColor,
    textColor: homepagesetting?.textColor,
  };

  const isSelected = (theme) => {
    return (
      current?.primaryColor?.toLowerCase() ===
        theme.primaryColor.toLowerCase() &&
      current?.secondaryColor?.toLowerCase() ===
        theme.secondaryColor.toLowerCase() &&
      current?.textColor?.toLowerCase() === theme.textColor.toLowerCase()
    );
  };

  const isFontSelected = (font) => {
    return (
      homepagesetting?.font_style?.toLowerCase() === font.name.toLowerCase()
    );
  };

  const selectedTheme = colorThemes.find(
    (theme) =>
      theme.primaryColor.toLowerCase() ===
        current?.primaryColor?.toLowerCase() &&
      theme.secondaryColor.toLowerCase() ===
        current?.secondaryColor?.toLowerCase() &&
      theme.textColor.toLowerCase() === current?.textColor?.toLowerCase(),
  );

  const handleCustomApply = () => {
    setShowModal(false);
    onSelect(customTheme);
  };

  return (
    <div
      className="position-relative"
      style={{ width: "fit-content", maxWidth: "220px" }}
    >
      <button
        className="btn d-flex flex-column justify-content-center align-items-center rounded-pill border bg-white text-dark shadow-sm w-100 text-center"
        style={{
          padding: "5px 22px",
          fontSize: "0.85rem",
          lineHeight: "1.2",
          borderColor: "#ced4da",
          boxShadow: "0 2px 6px rgba(30, 255, 0, 0.08)",
          minHeight: "40px",
        }}
        onClick={() => setOpen(!open)}
      >
        <span className="fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>
          {selectedTheme
            ? selectedTheme?.name
            : current?.name || "Custom Theme"}
        </span>
        <span
          className="text-muted small"
          style={{
            fontFamily: homepagesetting?.font_style || "inherit",
            fontSize: "0.75rem",
            letterSpacing: "0.3px",
          }}
        >
          {homepagesetting?.font_style?.length > 3
            ? homepagesetting?.font_style
            : "Default Font"}
        </span>
      </button>

      {open && (
        <div
          className="position-absolute mt-2 bg-white border rounded shadow-lg"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            minWidth: "360px",
            maxWidth: "400px",
            maxHeight: "500px",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          {/* Tab Header with Close Button */}
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            {/* Tabs */}
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "color" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("color")}
              >
                🎨 Color Theme
              </button>
              <button
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "font" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("font")}
              >
                🖋 Font Style
              </button>
            </div>

            {/* Close Button */}
            <button
              className="btn btn-sm btn-outline-secondary "
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* === COLOR TAB === */}
          {activeTab === "color" && (
            <>
              <div className="row g-3">
                {colorThemes.map((theme, idx) => {
                  const selected = isSelected(theme);
                  return (
                    <div className="col-6" key={idx}>
                      <div
                        className={`h-100 p-3 rounded border d-flex flex-column align-items-center justify-content-center text-center cursor-pointer ${
                          selected ? "border-success shadow-sm" : ""
                        }`}
                        style={{
                          fontSize: "0.9rem",
                          backgroundColor: selected ? "#e6fffa" : "#f9f9f9",
                          minHeight: "110px",
                        }}
                        onClick={() => {
                          setOpen(false);
                          onSelect(theme);
                        }}
                      >
                        <div className="d-flex gap-2 mb-2">
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: theme.primaryColor,
                              borderRadius: 4,
                            }}
                          />
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: theme.secondaryColor,
                              borderRadius: 4,
                            }}
                          />
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: theme.textColor,
                              borderRadius: 4,
                              border: "1px solid #ccc",
                            }}
                          />
                        </div>
                        <div>
                          {theme.name} {selected && "✅"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-3 d-flex justify-content-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill px-4"
                  onClick={() => {
                    setCustomTheme({ ...current, name: "custom" });
                    setShowModal(true);
                  }}
                >
                  ✨ Customize Colors
                </Button>

                <Button
                  variant={
                    homepagesetting?.layout_style === "mix"
                      ? "success"
                      : "outline-dark"
                  }
                  size="sm"
                  className="rounded-pill px-2  "
                  onClick={() => {
                    setOpen(false);
                    onToggleColorLayout();
                  }}
                >
                  🎨 Mix & Match{" "}
                  {homepagesetting?.layout_style === "mix"
                    ? "Enabled ✅"
                    : "Disabled"}
                </Button>
              </div>
            </>
          )}

          {/* === FONT TAB === */}
          {activeTab === "font" && (
            <>
              {" "}
              <div className="row g-3">
                {fontOptions.map((font, idx) => {
                  const selected = isFontSelected(font);
                  return (
                    <div className="col-6" key={idx}>
                      <div
                        className={`h-100 p-3 rounded border d-flex flex-column align-items-center justify-content-center text-center cursor-pointer ${
                          selected ? "border-success shadow-sm" : ""
                        }`}
                        style={{
                          fontFamily: `'${font.name}', sans-serif`,
                          fontSize: "0.95rem",
                          backgroundColor: selected ? "#e6fffa" : "#f9f9f9",
                          minHeight: "110px",
                        }}
                        onClick={() => {
                          setOpen(false);
                          onSelecteFontStyle(font);
                        }}
                      >
                        <div className="mb-1">{font.name}</div>
                        {selected && (
                          <div className="text-success small">✅</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="px-4"
                  onClick={() => {
                    setOpen(false);
                    onSelecteFontStyle({ name: " " });
                  }}
                >
                  🔄 Reset Font
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal for Custom Theme */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-1">
          <Modal.Title className="fs-5">🎨 Customize Your Theme</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2 d-block">
              Primary Color
            </label>
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="small text-muted">Buttons & Highlights</span>
                <input
                  type="color"
                  value={customTheme.primaryColor}
                  onChange={(e) =>
                    setCustomTheme({
                      ...customTheme,
                      primaryColor: e.target.value,
                    })
                  }
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold mb-2 d-block">
              Secondary Color
            </label>
            <div
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="small text-muted">Background Area</span>
              <input
                type="color"
                value={customTheme.secondaryColor}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    secondaryColor: e.target.value,
                  })
                }
                style={{
                  width: "40px",
                  height: "40px",
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold mb-2 d-block">
              Text Color
            </label>
            <div
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="small text-muted">
                Used on content & button texts
              </span>
              <input
                type="color"
                value={customTheme.textColor}
                onChange={(e) =>
                  setCustomTheme({ ...customTheme, textColor: e.target.value })
                }
                style={{
                  width: "40px",
                  height: "40px",
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          <div className="mt-4 small text-muted">
            ⚠️ Ensure contrast between text and background is high enough for
            readability.
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCustomApply}>
            Apply Theme
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ThemeDropdown;
