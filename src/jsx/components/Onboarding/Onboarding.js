import React, { useEffect, useState } from "react";
import {
  Modal,
  ProgressBar,
  Form,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {
  CheckCircleFill,
  ArrowRightCircle,
  GeoAlt,
  Lightning,
  ArrowClockwise,
} from "react-bootstrap-icons";
import "./RestaurantOnboarding.css";
import { useSelector, useDispatch } from "react-redux";
import Lottie from "lottie-react";
import loadingLottie from "../../../json/onboarding.json";
import { getUserPlanThunk } from "../../../store/session";
import { getHomepageThunk } from "../../../store/homepagesettings";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../store/utlits";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RestaurantOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const plan = useSelector((state) => state.session.userPlan);
  const restaurant = useSelector((state) => state.restaurant.restaurant);
  const [currentStep, setCurrentStep] = useState(1);
  const [iframeLoading, setIframeLoading] = useState(true);
  const homepageSetting = useSelector((state) => state.homepage.homepage);
  const [onboardedSuccess, setOnboardedSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIframe(true);
    }, 2500); // 2 seconds
    return () => clearTimeout(timer);
  }, []);
  const [formData, setFormData] = useState({
    restaurantName: "",
    cuisineType: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    commissionFee: "",
    taxRate: "",
    processingFee: "",
  });
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const handleSkip = () => {
    setLoading(false);
    setOnboardedSuccess(true);
    setShowModal(false);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 1. Fetch homepage ONCE
  useEffect(() => {
    if (restaurant) {
      dispatch(getHomepageThunk(restaurant.id));
    }
  }, [restaurant, dispatch]);

  // 2. Wait for everything to load, with min 1.5s delay
  useEffect(() => {
    if (!restaurant) return;

    const start = Date.now();
    const minLoadingDuration = 0;

    const checkReady = () => {
      // ✅ Skip onboarding logic for restaurant ID <= 6
      if (restaurant?.id <= 27) {
        setOnboardedSuccess(true);
        setShowModal(false);
        setLoading(false);
        return;
      }

      if (plan === undefined) return;

      const elapsed = Date.now() - start;
      const waitTime = Math.max(0, minLoadingDuration - elapsed);

      setTimeout(() => {
        if (!plan) {
          setOnboardedSuccess(true);
          setShowModal(false);
        } else if (!homepageSetting) {
          setShowModal(true);
        } else {
          setOnboardedSuccess(true);
          setShowModal(false);
        }

        setLoading(false);
      }, waitTime);
    };

    checkReady();
  }, [restaurant, plan, homepageSetting]);

  const totalSteps = 5;
  const primaryColor = "#DD2F6E";
  const setupMessages = [
    "🤖 Initializing your AI-powered dashboard...",
    "📊 Analyzing business details and optimizing data...",
    "🌐 Auto-generating a smart website experience...",
    "⚙️ Applying intelligent configurations and features...",
    "✅ Finalizing your personalized setup...",
  ];

  const isLocationComplete = () => {
    return (
      formData.street.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== "" &&
      formData.zipCode.trim() !== ""
    );
  };

  useEffect(() => {
    const submitFormData = async () => {
      const token = getToken();
      try {
        const response = await fetch(`/api/newrestaurants/${restaurant.id}`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        });

        if (!response.ok) {
          console.error("Failed to save homepage settings");
          return;
        }

        const result = await response.json();
        dispatch(getUserPlanThunk());
      } catch (err) {
        console.error("Error submitting onboarding data:", err);
      }
    };

    if (currentStep === 4) {
      submitFormData();
    }
  }, [currentStep]);

  useEffect(() => {
    if (restaurant) {
      setFormData((prev) => ({
        ...prev,
        restaurantName: restaurant.name || "",
        cuisineType: restaurant.cuisine || "",
        street: restaurant.street || "",
      }));
    }
  }, [restaurant]);

  useEffect(() => {
    if (currentStep === 4) {
      const timer = setTimeout(() => {
        setCurrentStep(5);
      }, 16000); // 16 seconds
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (isLocationComplete()) {
      setTimeout(() => {
        setIframeLoading(false);
      }, 2000);
    }
  }, [isLocationComplete()]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only digits and up to one decimal with max 2 places
    if (["taxRate", "processingFee", "commissionFee"].includes(name)) {
      const isValid = /^\d{0,3}(\.\d{0,2})?$/.test(value); // allow up to 999.99 temporarily
      if (!isValid) return;

      const numericValue = parseFloat(value);
      if (numericValue > 100) return; // restrict max to 100

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    // Uppercase state
    if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        [name]: value
          .replace(/[^a-zA-Z]/g, "")
          .toUpperCase()
          .slice(0, 2),
      }));
      return;
    }

    // Capitalize city/street
    if (name === "street" || name === "city") {
      const formattedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    // Default update
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isStep2Valid = () => {
    return (
      formData.restaurantName.trim() !== "" &&
      formData.cuisineType.trim() !== "" &&
      formData.street.trim() !== "" &&
      formData.city.trim() !== "" &&
      /^[A-Z]{2}$/.test(formData.state.trim()) && // 2-letter state
      /^\d{5}$/.test(formData.zipCode.trim()) // 5-digit zip code
    );
  };

  // Generate Google Maps URL without API key
  const getGoogleMapsEmbedUrl = (address) => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // Custom styling for primary color buttons
  const primaryButtonStyle = {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  };

  const primaryBgStyle = {
    backgroundColor: primaryColor,
  };

  const mapAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`;

  const renderStepIndicators = () => {
    return (
      <div className="d-flex justify-content-center mb-4">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center`}
              style={{
                width: "32px",
                height: "32px",
                backgroundColor:
                  idx + 1 <= currentStep ? primaryColor : "#e9ecef",
                color: idx + 1 <= currentStep ? "white" : "#6c757d",
                fontWeight: "bold",
                border: idx + 1 === currentStep ? "2px solid white" : "none",
                boxShadow:
                  idx + 1 === currentStep
                    ? `0 0 0 2px ${primaryColor}`
                    : "none",
              }}
            >
              {idx + 1 < currentStep ? (
                <CheckCircleFill size={16} />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            {idx < totalSteps - 1 && (
              <div
                style={{
                  height: "2px",
                  width: "40px",
                  backgroundColor:
                    idx + 1 < currentStep ? primaryColor : "#e9ecef",
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (
    loading ||
    plan === undefined ||
    homepageSetting === undefined ||
    restaurant === undefined
  ) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="d-flex align-items-center">
          <ArrowClockwise
            size={36}
            className="spin-animation"
            style={{ color: primaryColor }}
          />
          <span className="ms-3 text-muted">Welcome to OwnMenu...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {onboardedSuccess && !showModal && (
        <div className="container-fluid py-2 px-3 ">
          <div className="row justify-content-center align-items-stretch g-4">
            {/* LEFT: Live Preview */}
            <div className="col-lg-9">
              {plan && homepageSetting ? (
                <div className="card shadow-sm h-100 p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="fw-bold text-success">
                      🎉 Your Website Is Live
                    </h4>
                    <span
                      onClick={() => {
                        navigate("/account");
                        setTimeout(() => {
                          window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                          });
                        }, 100); // small delay to allow route change to complete
                      }}
                      className="text-primary text-decoration-none "
                      style={{ fontSize: "0.9rem", cursor: "pointer" }}
                    >
                      Need Help?
                    </span>
                  </div>

                  <p className="text-muted mb-1">
                    Here's a preview of your website: 🌐{" "}
                    <a
                      href={`https://${plan?.domain}.ownmenu.com`}
                      // href={`http://localhost:3001`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {plan?.domain}.ownmenu.com
                      {/* {`http://localhost:3001`} */}
                    </a>
                  </p>

                  <div
                    className="border rounded overflow-hidden flex-grow-1"
                    style={{ minHeight: "400px" }}
                  >
                    {!showIframe ? (
                      <Skeleton height="100%" width="100%" duration={0.7} />
                    ) : (
                      <iframe
                        title="Live Site Preview"
                        // src={`http://localhost:3001`}
                        src={`https://${plan?.domain}.ownmenu.com`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: "none" }}
                      ></iframe>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card shadow-sm h-100 p-4 d-flex flex-column justify-content-center align-items-center text-center">
                  <h4 className="fw-bold mb-2 text-danger">
                    🚫 Site is Offline
                  </h4>
                  <p className="text-muted mb-3">
                    Your website hasn't been created yet. Click below to start
                    building it.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/website-editing")}
                  >
                    Create My Website
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT: Action Steps */}
            <div className="col-lg-3 d-flex flex-column justify-content-between ">
              <div
                className="p-4 rounded-4 shadow"
                style={{
                  background: "linear-gradient(to bottom, #fff, #f9f9f9)",
                  height: "100%",
                  borderRadius: "25px",
                }}
              >
                <h5 className="fw-bold mb-4" style={{ fontSize: "1.3rem" }}>
                  🚀 Suggested Actions
                </h5>

                {/* Section 1: Website */}
                <div className="mb-4">
                  <div
                    className="mb-2 fw-semibold text-uppercase"
                    style={{ fontSize: "0.85rem", color: "#DD2F6E" }}
                  >
                    🌐 Website
                  </div>
                  <div className="d-grid gap-3">
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/website-editing")}
                    >
                      <span className="me-2">🛠️</span> Edit Website & SEO
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/online-status")}
                    >
                      <span className="me-2">📍</span> Set Business Hours
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/fees")}
                    >
                      <span className="me-2">💸</span> Customize Fees
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/custom-domains")}
                    >
                      <span className="me-2">🔗</span> Connect Domain
                    </Button>
                  </div>
                </div>

                {/* Section 2: Menu */}
                <div className="mb-4">
                  <div
                    className="mb-2 fw-semibold text-uppercase"
                    style={{ fontSize: "0.85rem", color: "#00A86B" }}
                  >
                    🍽️ Menu
                  </div>
                  <div className="d-grid gap-3">
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/all-products", { state: { openAddModal: true } })}
                    >
                      <span className="me-2">➕</span> Add Product
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/automated-menu")}
                    >
                      <span className="me-2">⚡</span> AI Menu Uploader
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/all-products")}
                    >
                      <span className="me-2">📦</span> Manage Products
                    </Button>
                  </div>
                </div>

                {/* Section 3: Plan & Add-ons */}
                <div>
                  <div
                    className="mb-2 fw-semibold text-uppercase"
                    style={{ fontSize: "0.85rem", color: "#1E90FF" }}
                  >
                    💼 Plan & Add-ons
                  </div>
                  <div className="d-grid gap-3">
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/plans")}
                    >
                      <span className="me-2">📊</span> Your Plan
                    </Button>
                    <Button
                      variant="outline-dark"
                      className="glass-button text-start px-3 py-2"
                      onClick={() => navigate("/plans")}
                    >
                      <span className="me-2">🧩</span> Add-ons
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={showModal}
        fullscreen={true}
        backdrop="static"
        keyboard={false}
        contentClassName="border-0"
        className="restaurant-onboarding-modal"
      >
        <Modal.Header className="border-0  text-white py-2">
          <Modal.Title>OwnMenu Onboarding</Modal.Title>
        </Modal.Header>

        <div className="w-100">
          <ProgressBar
            now={(currentStep / totalSteps) * 100}
            style={{
              height: "5px",
              backgroundColor: "#f8f9fa",
              borderRadius: 0,
            }}
            variant="danger"
          />
        </div>

        <Modal.Body className="d-flex flex-column justify-content-center align-items-center p-0">
          <Container className="py-5">
            {renderStepIndicators()}

            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center py-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: `${primaryColor}20`, // 20% opacity
                  }}
                >
                  <img
                    src="/hutaologo1.png"
                    alt="Hutao Logo"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <h2 className="fw-bold mb-3">Welcome to OwnMenu</h2>
                <p
                  className="text-muted mb-4 mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  Let's set up your restaurant website in just a few simple
                  steps.
                </p>
                <Button
                  onClick={handleNext}
                  style={primaryButtonStyle}
                  className="px-4 py-2"
                >
                  Get Started <ArrowRightCircle className="ms-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Restaurant Information */}
            {currentStep === 2 && (
              <Row className="justify-content-center g-0">
                <Col lg={6} className="pe-lg-4">
                  <h3 className="mb-4">Restaurant Information</h3>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Restaurant Name</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          name="restaurantName"
                          value={formData.restaurantName}
                          onChange={handleInputChange}
                          placeholder="Enter your restaurant name"
                          style={{ textTransform: "capitalize" }}
                          autoCapitalize="words"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Cuisine Type</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          name="cuisineType"
                          value={formData.cuisineType}
                          onChange={handleInputChange}
                          placeholder="e.g., Italian, Japanese, Mexican"
                          style={{ textTransform: "capitalize" }}
                          autoCapitalize="words"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Location</Form.Label>
                      <div className="mb-3">
                        <div className="input-group">
                          <Form.Control
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            style={{ textTransform: "capitalize" }}
                            placeholder="Street Address"
                          />
                        </div>
                      </div>

                      <Row className="mb-3">
                        <Col md={5}>
                          <Form.Group controlId="formCity">
                            <Form.Control
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group controlId="formState">
                            <Form.Control
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={(e) => {
                                const lettersOnly = e.target.value
                                  .replace(/[^a-zA-Z]/g, "")
                                  .toUpperCase()
                                  .slice(0, 2);
                                setFormData({
                                  ...formData,
                                  state: lettersOnly,
                                });
                              }}
                              placeholder="State"
                              maxLength={2}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group controlId="formZipCode">
                            <Form.Control
                              type="tel" // triggers mobile number pad
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => {
                                const digitsOnly = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 5);
                                setFormData({
                                  ...formData,
                                  zipCode: digitsOnly,
                                });
                              }}
                              placeholder="Zip Code"
                              maxLength={5}
                              inputMode="numeric" // additional hint for number pad
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form.Group>

                    <div className="d-flex justify-content-between">
                      <Button variant="outline-secondary" onClick={handleBack}>
                        ← Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!isStep2Valid()}
                        style={isStep2Valid() ? primaryButtonStyle : {}}
                        variant={isStep2Valid() ? "primary" : "secondary"}
                      >
                        Continue <ArrowRightCircle className="ms-2" />
                      </Button>
                    </div>
                  </Form>
                </Col>

                <Col lg={6} className="d-none d-lg-block">
                  <div className="h-100 d-flex align-items-center justify-content-center">
                    {isLocationComplete() ? (
                      <div className="location-map border rounded overflow-hidden w-100 map-transition">
                        <>
                          {iframeLoading && (
                            <div
                              className="d-flex justify-content-center align-items-center py-5 bg-light"
                              style={{ height: 400 }}
                            >
                              <ArrowClockwise
                                size={32}
                                className="spin-animation text-muted"
                              />
                              <span className="ms-2 text-muted">
                                Loading map...
                              </span>
                            </div>
                          )}
                          <iframe
                            title="Restaurant Location Map"
                            width="100%"
                            height="400"
                            style={{
                              border: 0,
                              display: iframeLoading ? "none" : "block",
                            }}
                            loading="lazy"
                            src={getGoogleMapsEmbedUrl(mapAddress)}
                            onLoad={() => setIframeLoading(false)}
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                          />
                          {!iframeLoading && (
                            <div className="p-2 bg-light">
                              <small className="text-muted d-flex align-items-center">
                                <GeoAlt size={12} className="me-1" />
                                <span>
                                  <strong>Verified Address:</strong>{" "}
                                  {mapAddress}
                                </span>
                              </small>
                            </div>
                          )}
                        </>
                      </div>
                    ) : (
                      <div className="text-center text-muted p-5 border border-dashed rounded map-placeholder">
                        <GeoAlt
                          size={48}
                          style={{ color: primaryColor, opacity: 0.5 }}
                        />
                        <p className="mt-3">
                          Enter your complete address to check the location on
                          map
                        </p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            )}
            {currentStep === 3 && (
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{ minHeight: "60vh" }}
              >
                <div className="text-start w-100" style={{ maxWidth: 600 }}>
                  <h3 className="mb-2 text-center">Setup Your Fees</h3>
                  <p
                    className="text-muted text-center mb-4"
                    style={{ maxWidth: "500px", margin: "0 auto" }}
                  >
                    You keep 100% of your revenue — no hidden commissions or
                    surprise fees.
                  </p>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Sales Tax (% eg. 9.25)</Form.Label>
                      <Form.Control
                        type="number"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        placeholder="e.g., 8.25"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Processing Fee (%){" "}
                        <span className="text-muted">(optional)</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="processingFee"
                        value={formData.processingFee}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.9"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Commission Fee (Flat $){" "}
                        <span className="text-muted">(optional)</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="commissionFee"
                        value={formData.commissionFee}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.50"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between mt-4">
                      <Button variant="outline-secondary" onClick={handleBack}>
                        ← Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={formData.taxRate.trim() === ""}
                        style={primaryButtonStyle}
                      >
                        Continue <ArrowRightCircle className="ms-2" />
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            )}

            {/* Step 4: Loading */}
            {currentStep === 4 && (
              <div className="text-center py-5">
                <div className="text-center mb-4">
                  <div style={{ width: 200, height: 200, margin: "0 auto" }}>
                    <Lottie animationData={loadingLottie} loop={true} />
                  </div>
                </div>

                <h3 className="fw-bold mb-3">Getting everything ready...</h3>
                <p
                  className="text-muted mx-auto text-center"
                  style={{ maxWidth: "500px" }}
                >
                  {setupMessages[currentMessageIndex]}
                </p>
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <div className="text-center py-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#28a74520", // Light green background
                  }}
                >
                  <CheckCircleFill size={40} style={{ color: "#28a745" }} />
                </div>
                <h2 className="fw-bold mb-3">Setup Complete!</h2>
                <p
                  className="text-muted mb-4 mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  {formData.restaurantName} in {formData.city}, {formData.state}{" "}
                  has been successfully configured. Your AI-powered restaurant
                  site is ready.
                </p>

                <p className="text-center text-success fw-semibold mb-4">
                  🌐 Live site:{" "}
                  <a
                    href={`https://${plan.domain}.ownmenu.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plan.domain}.ownmenu.com
                  </a>
                </p>

                <Button
                  style={primaryButtonStyle}
                  className="px-4 py-2"
                  onClick={() => window.location.reload()}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </Container>
        </Modal.Body>
        {currentStep === 1 && (
          <div
            className="d-flex justify-content-center"
            style={{
              position: "absolute",
              bottom: "40px", // not all the way down
              left: 0,
              right: 0,
            }}
          >
            <span
              onClick={handleSkip}
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#6c757d",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "6px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f1f1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Skip for Now
            </span>
          </div>
        )}
      </Modal>
    </>
  );
};

export default RestaurantOnboarding;
