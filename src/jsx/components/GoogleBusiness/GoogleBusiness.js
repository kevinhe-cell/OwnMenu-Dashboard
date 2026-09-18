import React, { useEffect, useState } from "react";
import { getToken } from "../../../store/utlits";
import { Button, Modal, Form, Nav, Card } from "react-bootstrap";
import { 
  FaGoogle, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaUnlink, 
  FaStar, 
  FaReply, 
  FaEdit, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function GoogleBusiness() {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [status, setStatus] = useState(null); // Backend status payload
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Edit location modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", website: "" });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Tab state
  const [activeTab, setActiveTab] = useState("profile");

  const fetchStatus = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/google-business/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected && data.hasLocation) {
          // If already bound to a location, fetch reviews
          fetchReviews();
        }
      } else {
        console.error("Failed to fetch Google Business status");
        setStatus({ connected: false, error: "获取 Google 商家配置失败，请重试" });
      }
    } catch (err) {
      console.error("Error fetching status:", err);
      setStatus({ connected: false, error: "网络请求异常，请检查网络连接后重试" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/google-business/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen for OAuth status parameter from URL redirect
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status");
    const errorParam = params.get("error");

    if (statusParam === "success") {
      Swal.fire({
        title: "Google Account Connected!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (statusParam === "error") {
      Swal.fire({
        title: "Connection Failed",
        text: errorParam || "Could not authorize Google Account",
        icon: "error",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for postMessage from popup OAuth
    const handleMessage = (e) => {
      if (e.data?.source !== "ownmenu-google-oauth") return;
      if (e.data.status === "success") {
        Swal.fire({
          title: "Google Account Connected!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchStatus();
      } else {
        Swal.fire({
          title: "Connection Failed",
          text: e.data.error || "Could not authorize Google Account",
          icon: "error",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = async () => {
    setApiLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/google-business/connect?popup=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire("Error", data.error || "Failed to initiate connection", "error");
        return;
      }

      // Open OAuth in popup
      const popup = window.open(
        data.authUrl,
        "ownmenu_google_oauth",
        "width=600,height=720,scrollbars=yes"
      );

      if (!popup) {
        // Fallback to same tab redirect if popup is blocked
        window.location.href = data.authUrl.replace("popup=1", "popup=0");
      }
    } catch (err) {
      Swal.fire("Error", "Network error. Please try again.", "error");
    } finally {
      setApiLoading(false);
    }
  };

  const handleUnbind = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will disconnect your Google Business account and remove bound store data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Disconnect",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setApiLoading(true);
        const token = getToken();
        try {
          const res = await fetch("/api/google-business/unbind", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            Swal.fire("Disconnected", "Google Business has been disconnected.", "success");
            setStatus({ connected: false });
            setReviews([]);
          } else {
            Swal.fire("Error", "Failed to disconnect.", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error.", "error");
        } finally {
          setApiLoading(false);
        }
      }
    });
  };

  const handleBindLocation = async (locationName, accountName) => {
    setApiLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/google-business/bind-location", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationName, accountName }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Store bound successfully!", "success");
        fetchStatus();
      } else {
        Swal.fire("Error", data.error || "Failed to bind store", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Network error.", "error");
    } finally {
      setApiLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      phone: status.location?.phoneNumbers?.primaryPhone || "",
      website: status.location?.websiteUri || "",
    });
    setShowEditModal(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setApiLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/google-business/location", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: editForm.phone,
          website: editForm.website,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Store profile updated successfully!", "success");
        setShowEditModal(false);
        fetchStatus();
      } else {
        Swal.fire("Error", data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Network error.", "error");
    } finally {
      setApiLoading(false);
    }
  };



  // Rendering loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <FaSpinner className="fa-spin text-primary" size={40} />
        <span className="ms-3 font-weight-bold">Loading Google Business settings...</span>
      </div>
    );
  }

  // 防御性保护：避免 status 为空导致后续空指针白屏
  if (!status) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center">
        <div className="card-body py-5">
          <div className="mb-4">
            <FaExclamationTriangle size={50} className="text-warning" />
          </div>
          <h4 className="font-weight-bold mb-2">未能加载 Google 商家配置</h4>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: "500px" }}>
            未能获取到商家授权状态，请检查网络后点击下方按钮重试。
          </p>
          <Button variant="primary" onClick={fetchStatus}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  // 1. Unconnected View
  if (!status.connected) {
    return (
      <div className="card shadow-sm border-0 p-4 text-center">
        <div className="card-body py-5">
          <div className="mb-4">
            <FaGoogle size={60} className="text-danger" />
          </div>
          <h2 className="card-title font-weight-bold mb-3">Google 商家管理</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: "500px" }}>
            绑定您的 Google 商家账号以在 Dashboard 内管理您的店铺基础资料并查看与回复顾客的 Google 店铺留言。
          </p>
          {status.error && (
            <div className="alert alert-warning border-0 p-3 mb-4 mx-auto text-start" style={{ maxWidth: "600px" }}>
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="text-warning me-2 flex-shrink-0" />
                <span className="small">{status.error}</span>
              </div>
            </div>
          )}
          <Button 
            variant="danger" 
            size="lg" 
            onClick={handleConnect}
            disabled={apiLoading}
            className="d-inline-flex align-items-center px-4"
          >
            {apiLoading ? <FaSpinner className="fa-spin me-2" /> : <FaGoogle className="me-2" />}
            绑定 Google 账号
          </Button>
        </div>
      </div>
    );
  }

  // 2. Connected but no location selected View
  if (status.connected && !status.hasLocation) {
    return (
      <div className="card shadow-sm border-0 p-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="font-weight-bold mb-1">选择绑定的店铺</h2>
              <p className="text-muted mb-0">已连接账号: <span className="text-dark font-weight-bold">{status.email}</span></p>
            </div>
            <Button variant="outline-danger" onClick={handleUnbind} disabled={apiLoading}>
              <FaUnlink className="me-2" />
              解绑账号
            </Button>
          </div>

          {status.locations && status.locations.length > 0 ? (
            <div className="row">
              {status.locations.map((loc) => (
                <div className="col-md-6 mb-4" key={loc.name}>
                  <Card className="border-0 shadow-sm h-100 bg-light">
                    <Card.Body className="d-flex flex-column justify-content-between p-4">
                      <div className="mb-3">
                        <h4 className="font-weight-bold mb-2">{loc.title}</h4>
                        <p className="text-muted small mb-0">
                          <FaMapMarkerAlt className="me-1" />
                          {loc.address || "无地址信息"}
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={() => handleBindLocation(loc.name, loc.accountName)}
                        disabled={apiLoading}
                        className="w-100"
                      >
                        {apiLoading ? <FaSpinner className="fa-spin me-2" /> : null}
                        绑定此店铺
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-warning border-0 p-4 d-flex align-items-center mb-0">
              <FaExclamationTriangle size={30} className="text-warning me-3 flex-shrink-0" />
              <div>
                <h4 className="font-weight-bold mb-1">未检测到有效店铺</h4>
                <p className="mb-0 small">
                  {status.error || "该 Google 账号下没有已通过验证且具有管理权限的店铺（需具有 Voice of Merchant 权限）。请确认后再试。"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Fully Connected Store Dashboard View
  const loc = status.location;
  return (
    <div className="row">
      {/* Left Column: Store Profile Info */}
      <div className="col-lg-4 mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-danger-light p-3 rounded-circle text-danger d-inline-flex justify-content-center align-items-center me-3" style={{ backgroundColor: "#fde8e8" }}>
                  <FaGoogle size={24} />
                </div>
                <div>
                  <h4 className="font-weight-bold mb-0 text-truncate" style={{ maxWidth: "220px" }}>{loc.title}</h4>
                  <span className="badge badge-pill bg-success-light text-success small" style={{ backgroundColor: "#def7ec" }}>
                    <FaCheckCircle className="me-1" />
                    已同步绑定
                  </span>
                </div>
              </div>

              <hr className="my-3 text-muted" />

              <div className="mb-3">
                <label className="text-muted small font-weight-bold mb-1 d-block">绑定账号</label>
                <div className="font-weight-medium text-dark">{status.email}</div>
              </div>

              <div className="mb-3">
                <label className="text-muted small font-weight-bold mb-1 d-block">
                  <FaPhone className="me-1" />
                  电话号码
                </label>
                <div className="font-weight-medium text-dark">{loc.phoneNumbers?.primaryPhone || "未设置"}</div>
              </div>

              <div className="mb-3">
                <label className="text-muted small font-weight-bold mb-1 d-block">
                  <FaGlobe className="me-1" />
                  官方网址
                </label>
                {loc.websiteUri ? (
                  <a href={loc.websiteUri} target="_blank" rel="noopener noreferrer" className="text-primary font-weight-medium text-break">
                    {loc.websiteUri}
                  </a>
                ) : (
                  <span className="text-muted small">未设置</span>
                )}
              </div>

              <div className="mb-3">
                <label className="text-muted small font-weight-bold mb-1 d-block">
                  <FaMapMarkerAlt className="me-1" />
                  店铺地址
                </label>
                <div className="font-weight-medium text-dark text-break small">{loc.address || "无"}</div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <Button variant="outline-primary" className="flex-grow-1" onClick={openEditModal}>
                <FaEdit className="me-1" />
                编辑资料
              </Button>
              <Button variant="outline-danger" onClick={handleUnbind}>
                <FaUnlink />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Store Reviews Management */}
      <div className="col-lg-8 mb-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-bottom">
              <Nav.Item>
                <Nav.Link eventKey="profile" className="font-weight-bold px-4 py-3">店铺留言</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="card-body p-4">
            {reviewsLoading ? (
              <div className="d-flex flex-column justify-content-center align-items-center py-5">
                <FaSpinner className="fa-spin text-primary mb-3" size={32} />
                <span className="text-muted font-weight-medium">正在拉取店铺评价...</span>
              </div>
            ) : reviews && reviews.length > 0 ? (
              <>
                <div className="d-flex flex-column gap-4">
                  {reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((review) => {
                    const rating = {
                      ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5
                    }[review.starRating] || 5;

                    return (
                      <div className="p-4 rounded-xl border border-light bg-light" key={review.name}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <img 
                              src={review.reviewer.profilePhotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                              alt={review.reviewer.displayName}
                              className="rounded-circle me-3 border"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                              }}
                            />
                            <div>
                              <h5 className="font-weight-bold mb-1">{review.reviewer.displayName}</h5>
                              <div className="d-flex align-items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < rating ? "text-warning" : "text-muted"} size={13} />
                                ))}
                                <span className="text-muted small ms-2">{new Date(review.createTime).toLocaleDateString("zh-CN")}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-dark bg-white p-3 rounded-lg border-light mb-3 text-break" style={{ whiteSpace: "pre-line" }}>
                            {review.comment}
                          </p>
                        )}

                        {/* Replied Comment Container */}
                        {review.reviewReply?.comment && (
                          <div className="ms-4 p-3 rounded-lg border-start border-primary border-4 bg-primary-light" style={{ backgroundColor: "#ebf5ff" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="font-weight-bold text-primary small d-inline-flex align-items-center">
                                <FaReply className="me-1" size={11} />
                                商家回复
                              </span>
                              <span className="text-muted small">{new Date(review.reviewReply.updateTime).toLocaleDateString("zh-CN")}</span>
                            </div>
                            <p className="text-dark mb-0 small text-break">{review.reviewReply.comment}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {reviews.length > pageSize && (
                  <div className="d-flex justify-content-center mt-4 pt-3 border-top border-light">
                    <ul className="pagination pagination-gutter pagination-primary mb-0">
                      <li className={`page-item page-indicator ${currentPage === 1 ? "disabled" : ""}`}>
                        <a 
                          className="page-link" 
                          href="#" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            if (currentPage > 1) setCurrentPage(currentPage - 1); 
                          }}
                        >
                          <i className="la la-angle-left" />
                        </a>
                      </li>
                      {[...Array(Math.ceil(reviews.length / pageSize))].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                          <a 
                            className="page-link" 
                            href="#" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setCurrentPage(index + 1); 
                            }}
                          >
                            {index + 1}
                          </a>
                        </li>
                      ))}
                      <li className={`page-item page-indicator ${currentPage === Math.ceil(reviews.length / pageSize) ? "disabled" : ""}`}>
                        <a 
                          className="page-link" 
                          href="#" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            if (currentPage < Math.ceil(reviews.length / pageSize)) setCurrentPage(currentPage + 1); 
                          }}
                        >
                          <i className="la la-angle-right" />
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">暂无留言或评论数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Store Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-weight-bold">编辑 Google 商家信息</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveLocation}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="font-weight-medium">电话号码</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="例如: +1 123-456-7890" 
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="font-weight-medium">官方网址</Form.Label>
              <Form.Control 
                type="url" 
                placeholder="例如: https://example.com" 
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowEditModal(false)}>
              取消
            </Button>
            <Button variant="primary" type="submit" disabled={apiLoading}>
              {apiLoading ? <FaSpinner className="fa-spin me-1" /> : null}
              保存修改
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
