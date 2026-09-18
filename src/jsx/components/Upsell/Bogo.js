import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getItemsThunk } from "../../../store/items";
import { Button, Modal, Form, Spinner, Card } from "react-bootstrap";
import Select from "react-select";
import { getToken } from "../../../store/utlits";
import Swal from "sweetalert2";

export default function Bogo() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const items = useSelector((s) => s.items.items || []);

    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [useDifferentGetItem, setUseDifferentGetItem] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editPromo, setEditPromo] = useState(null);
    const [form, setForm] = useState({
        buy_item_id: "",
        get_item_id: "",
        discount_percent: 100,
        min_order_amount: "",
    });

    // Load items & promotions
    useEffect(() => {
        dispatch(getItemsThunk());
        fetchPromotions();
    }, [dispatch]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/coupons/bogo", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Failed to fetch promotions");
            const data = await res.json();
            setPromotions(data);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load promotions", "error");
        } finally {
            setLoading(false);
        }
    };


    const handleOpen = (promo = null) => {
        if (promo) {
            // Check if buy and get are the same item
            const sameItem = promo.buy_item_id === promo.get_item_id;

            setEditPromo(promo);
            setUseDifferentGetItem(!sameItem); // if same, leave checkbox unchecked

            setForm({
                buy_item_id: promo.buy_item_id,
                get_item_id: promo.get_item_id,
                discount_percent: promo.discount_percent,
                min_order_amount: promo.min_order_amount || "",
            });
        } else {
            // New promotion: default get = buy item, checkbox unchecked
            setEditPromo(null);
            setUseDifferentGetItem(false);

            setForm({
                buy_item_id: "",
                get_item_id: "",
                discount_percent: 100,
                min_order_amount: "",
            });
        }

        setShowModal(true);
    };


    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = editPromo ? "PUT" : "POST";
            const url = editPromo
                ? `/api/coupons/bogo/${editPromo.id}`
                : "/api/coupons/bogo";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to save promotion");

            await fetchPromotions();
            handleClose();
            Swal.fire(
                t("common.success"),
                t("bogo.swal.save_success", { status: editPromo ? t("common.updated") : t("common.created") }),
                "success"
            );
        } catch (err) {
            console.error(err);
            Swal.fire(t("common.error"), t("bogo.swal.err_save"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: t("bogo.swal.delete_title"),
            text: t("bogo.swal.delete_text"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ea4335",
            cancelButtonColor: "#4285f4",
            confirmButtonText: t("bogo.swal.delete_confirm"),
            cancelButtonText: t("common.cancel"),
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-primary mx-2"
            }
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`/api/coupons/bogo/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Failed to delete promotion");

            await fetchPromotions();
            Swal.fire(t("common.deleted"), t("bogo.swal.delete_success"), "success");
        } catch (err) {
            console.error(err);
            Swal.fire(t("common.error"), t("bogo.swal.err_delete"), "error");
        }
    };

    const getItemName = (id) => {
        const item = items.find((i) => i.id === id);
        return item ? item.name : `Item #${id}`;
    };

    const cardStyle = {
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        background: '#fff',
        height: '100%'
    };

    const cardHoverStyle = {
        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        transform: 'translateY(-2px)'
    };

    const emptyStateStyle = {
        padding: '4rem 2rem',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        margin: '2rem 0'
    };

    // Compute IDs of items already used in BOGO promotions
    const usedItemIds = new Set();
    promotions.forEach((promo) => {
        usedItemIds.add(promo.buy_item_id);
        usedItemIds.add(promo.get_item_id);
    });

    // Helper: filter out used items for dropdowns (unless editing and the item is the current value)
    const availableItems = (field) => {
        return items.filter((i) => {
            // If editing, allow the current value
            if (editPromo && form[field] === i.id) return true;
            return !usedItemIds.has(i.id);
        });
    };

    // Searchable select options for Buy / Get items
    const buyItemOptions = useMemo(
        () =>
            availableItems("buy_item_id").map((i) => ({
                value: i.id,
                label: i.name + (i.chinese_name ? ` (${i.chinese_name})` : ""),
            })),
        [items, editPromo, form.buy_item_id, promotions]
    );
    const getItemOptions = useMemo(
        () =>
            availableItems("get_item_id").map((i) => ({
                value: i.id,
                label: i.name + (i.chinese_name ? ` (${i.chinese_name})` : ""),
            })),
        [items, editPromo, form.get_item_id, promotions]
    );

    const buySelectValue = form.buy_item_id
        ? buyItemOptions.find((o) => o.value === form.buy_item_id) || { value: form.buy_item_id, label: getItemName(form.buy_item_id) }
        : null;
    const getSelectValue = form.get_item_id
        ? getItemOptions.find((o) => o.value === form.get_item_id) || { value: form.get_item_id, label: getItemName(form.get_item_id) }
        : null;

    const selectStyles = {
        control: (base) => ({
            ...base,
            border: "1px solid #dadce0",
            borderRadius: "8px",
            fontSize: "0.875rem",
            minHeight: "44px",
            boxShadow: "none",
        }),
        menu: (base) => ({ ...base, fontSize: "0.875rem" }),
    };

    return (
        <div >
            <div className="container ">
                {/* Header Section */}
                <div style={{ marginBottom: '32px' }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h1 style={{
                                color: '#202124',
                                fontSize: '2rem',
                                fontWeight: '400',
                                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                                marginBottom: '8px'
                            }}>
                                {t("bogo.title")}
                            </h1>
                            <p style={{
                                color: '#5f6368',
                                fontSize: '0.875rem',
                                margin: 0,
                                lineHeight: '1.4'
                            }}>
                                {t("bogo.desc")}
                                <br />
                                {t("bogo.exclude_duplicates")}
                            </p>
                        </div>

                        <Button
                            onClick={() => handleOpen()}

                        >
                            <span style={{ fontSize: '16px' }}></span>
                            {t("bogo.add_btn")}
                        </Button>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px',
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                    }}>
                        <div className="text-center">
                            <Spinner
                                animation="border"
                                style={{
                                    width: '3rem',
                                    height: '3rem',
                                    color: '#4285f4'
                                }}
                            />
                            <div style={{
                                marginTop: '16px',
                                color: '#5f6368',
                                fontSize: '0.875rem'
                            }}>
                                {t("bogo.loading")}
                            </div>
                        </div>
                    </div>
                ) : promotions.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '24px',
                            opacity: '0.3'
                        }}>
                            🎯
                        </div>
                        <h3 style={{
                            color: '#202124',
                            fontSize: '1.5rem',
                            fontWeight: '400',
                            marginBottom: '12px'
                        }}>
                            {t("bogo.no_promos_title")}
                        </h3>
                        <p style={{
                            color: '#5f6368',
                            fontSize: '0.875rem',
                            marginBottom: '24px',
                            maxWidth: '400px',
                            margin: '0 auto 24px'
                        }}>
                            {t("bogo.no_promos_desc")}
                        </p>
                        <Button
                            onClick={() => handleOpen()}
                            style={{
                                background: '#4285f4',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}
                        >
                            {t("bogo.create_first_btn")}
                        </Button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {promotions.map((promo) => (
                            <div key={promo.id} className="col-lg-4 col-md-6">
                                <Card
                                    style={cardStyle}
                                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
                                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
                                >
                                    <Card.Body className="p-4">
                                        {/* Header with discount badge */}
                                        <div className="d-flex  justify-content-between align-items-start mb-3">
                                            <div style={{
                                                background: 'linear-gradient(135deg, #34a853 0%, #fbbc04 100%)',
                                                color: '#fff',
                                                padding: '6px 12px',
                                                borderRadius: '16px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {promo.discount_percent}% {t("common.off")}
                                            </div>
                                            <div style={{ fontSize: '1.5rem' }}>🎁</div>
                                        </div>

                                        {/* Promotion Details */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#5f6368',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: '500',
                                                    textAlign: 'center'
                                                }}>
                                                    {t("bogo.buy_label")}
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    color: '#202124',
                                                    fontWeight: '500',
                                                    marginTop: '4px',
                                                    textAlign: 'center'
                                                }}>
                                                    {getItemName(promo.buy_item_id)}
                                                </div>
                                            </div>

                                            <div style={{
                                                textAlign: 'center',
                                                margin: '16px 0',
                                                color: '#5f6368'
                                            }}>
                                                ⬇
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#5f6368',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: '500',
                                                    textAlign: 'center'

                                                }}>
                                                    {t("bogo.get_label")}
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    color: '#202124',
                                                    fontWeight: '500',
                                                    marginTop: '4px',
                                                    textAlign: 'center'

                                                }}>
                                                    {getItemName(promo.get_item_id)}
                                                </div>
                                            </div>

                                            {promo.min_order_amount && (
                                                <div style={{
                                                    background: '#f8f9fa',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    color: '#5f6368',
                                                    textAlign: 'center'
                                                }}>
                                                    {t("bogo.min_order_label", { amount: promo.min_order_amount })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpen(promo)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #dadce0',
                                                    color: '#5f6368',
                                                    borderRadius: '6px',
                                                    padding: '6px 16px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    flex: '1'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = '#f8f9fa';
                                                    e.target.style.borderColor = '#4285f4';
                                                    e.target.style.color = '#4285f4';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.borderColor = '#dadce0';
                                                    e.target.style.color = '#5f6368';
                                                }}
                                            >
                                                ✏️ {t("common.edit")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleDelete(promo.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #dadce0',
                                                    color: '#ea4335',
                                                    borderRadius: '6px',
                                                    padding: '6px 16px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    flex: '1'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = '#fce8e6';
                                                    e.target.style.borderColor = '#ea4335';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.borderColor = '#dadce0';
                                                }}
                                            >
                                                🗑️ {t("common.delete")}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    show={showModal}
                    onHide={handleClose}
                    centered
                    size="md"
                >
                    <div style={{
                        border: 'none',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }}>
                        <Modal.Header
                            closeButton
                            style={{
                                background: '#fff',
                                border: 'none',
                                padding: '24px 24px 16px'
                            }}
                        >
                            <Modal.Title style={{
                                color: '#202124',
                                fontSize: '1.25rem',
                                fontWeight: '500',
                                fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
                            }}>
                                {editPromo ? t("bogo.modal_edit_title") : t("bogo.modal_create_title")}
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body style={{ padding: '0 24px 24px' }}>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{
                                        color: '#5f6368',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        marginBottom: '8px'
                                    }}>
                                        {t("bogo.modal_buy_item")} *
                                    </Form.Label>
                                    <Select
                                        placeholder={t("bogo.modal_buy_placeholder")}
                                        isSearchable
                                        options={buyItemOptions}
                                        value={buySelectValue}
                                        onChange={(opt) => {
                                            const val = opt ? opt.value : "";
                                            setForm((f) => ({
                                                ...f,
                                                buy_item_id: val,
                                                get_item_id: useDifferentGetItem ? f.get_item_id : val,
                                            }));
                                        }}
                                        styles={selectStyles}
                                        noOptionsMessage={() => t("common.no_options")}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label
                                        style={{
                                            color: "#5f6368",
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        {t("bogo.modal_get_item")} *
                                    </Form.Label>

                                    {/* Checkbox to toggle */}
                                    <Form.Check
                                        type="checkbox"
                                        id="useDifferentGetItem"
                                        label={t("bogo.modal_choose_different")}
                                        checked={useDifferentGetItem}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUseDifferentGetItem(checked);
                                            if (!checked) {
                                                // Reset get_item_id = buy_item_id
                                                setForm((f) => ({ ...f, get_item_id: f.buy_item_id }));
                                            }
                                        }}
                                        style={{ marginBottom: "8px" }}
                                    />

                                    <Select
                                        placeholder={t("bogo.modal_get_placeholder")}
                                        isSearchable
                                        options={getItemOptions}
                                        value={getSelectValue}
                                        onChange={(opt) => setForm((f) => ({ ...f, get_item_id: opt ? opt.value : "" }))}
                                        isDisabled={!useDifferentGetItem}
                                        styles={{
                                            ...selectStyles,
                                            control: (base) => ({
                                                ...base,
                                                ...selectStyles.control(base),
                                                background: !useDifferentGetItem ? "#f1f3f4" : "#fff",
                                            }),
                                        }}
                                        noOptionsMessage={() => "No items found"}
                                    />
                                </Form.Group>


                                <div className="row g-3">
                                    <div className="col-6">
                                        <Form.Group>
                                            <Form.Label style={{
                                                color: '#5f6368',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                marginBottom: '8px'
                                            }}>
                                                {t("bogo.modal_discount_percent")}
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="discount_percent"
                                                value={form.discount_percent}
                                                onChange={handleChange}
                                                min="1"
                                                max="100"
                                                style={{
                                                    border: '1px solid #dadce0',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    padding: '12px 16px'
                                                }}
                                            />
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group>
                                            <Form.Label style={{
                                                color: '#5f6368',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                marginBottom: '8px'
                                            }}>
                                                {t("bogo.modal_min_order")} ($)
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="min_order_amount"
                                                value={form.min_order_amount}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder={t("common.optional")}
                                                style={{
                                                    border: '1px solid #dadce0',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    padding: '12px 16px'
                                                }}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                            </Form>
                        </Modal.Body>

                        <Modal.Footer style={{
                            background: '#f8f9fa',
                            border: 'none',
                            padding: '16px 24px'
                        }}>
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #dadce0',
                                    color: '#5f6368',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    background: '#4285f4',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 20px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        {t("common.saving")}
                                    </>
                                ) : (
                                    <>💾 {editPromo ? t("common.update") : t("common.create")}</>
                                )}
                            </Button>
                        </Modal.Footer>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
