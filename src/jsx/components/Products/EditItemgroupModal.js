import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  editItemGroupThunk,
  deleteItemGroupThunk,
  getItemGroupsThunk,
} from "../../../store/itemgroups";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  FormControl,
  Image,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";

export default function EditItemGroupModal({ show, onHide, group }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items);

  const [groupName, setGroupName] = useState("");
  const [groupIndex, setGroupIndex] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupName(group.name || "");
      setGroupIndex(group.index ?? "");
      setImageUrl(group.imageUrl || "");

      let parsedIds = [];

      try {
        if (Array.isArray(group.itemIds)) {
          parsedIds = group.itemIds;
        } else if (typeof group.itemIds === "string") {
          parsedIds = JSON.parse(group.itemIds);
          if (!Array.isArray(parsedIds)) {
            parsedIds = [parsedIds];
          }
        } else if (typeof group.itemIds === "number") {
          parsedIds = [group.itemIds];
        } else {
          parsedIds = [];
        }
      } catch {
        parsedIds = [];
      }

      setSelectedItemIds(new Set(parsedIds));
    }
  }, [group]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item?.name?.toLowerCase()?.includes(term));
  }, [items, searchTerm]);

  const toggleSelectItem = (itemId) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl("");
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      Swal.fire("Oops!", "Please enter a group name.", "warning");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", groupName.trim());
    formData.append("itemIds", JSON.stringify(Array.from(selectedItemIds)));
    if (groupIndex !== "") formData.append("index", String(groupIndex));

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (!imageUrl && group.imageUrl) {
      formData.append("removeImage", "true");
    }

    try {
      await dispatch(editItemGroupThunk(group.id, formData));
      await dispatch(getItemGroupsThunk());
      onHide();
      Swal.fire("Success", "Item group updated successfully!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update item group.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the group!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await dispatch(deleteItemGroupThunk(group.id));
      await dispatch(getItemGroupsThunk());
      onHide();
      Swal.fire("Deleted!", "The group has been deleted.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete item group.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="edit-item-group-modal"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title id="edit-item-group-modal">Edit Item Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Item Group Name</Form.Label>
            <Form.Control
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Display order</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={groupIndex}
              onChange={(e) => setGroupIndex(e.target.value)}
              disabled={loading}
              placeholder="Auto-assigned if empty"
            />
            <Form.Text className="text-muted">
              Position among items and groups in the same category (lower numbers appear first).
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Group Image</Form.Label>
            {imageUrl ? (
              <div className="mb-2">
                <Image
                  src={imageUrl}
                  fluid
                  rounded
                  className="mb-2"
                  style={{ width: "80px" }}
                />
                <div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            ) : (
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            )}
          </Form.Group>

          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search items to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </InputGroup>

          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
            }}
          >
            {filteredItems.length === 0 ? (
              <p className="text-muted">No items found.</p>
            ) : (
              filteredItems.map((item) => (
                <Form.Check
                  key={item.id}
                  type="checkbox"
                  id={`editgroup-item-${item.id}`}
                  label={item.name}
                  checked={selectedItemIds.has(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="mb-1"
                  disabled={loading}
                />
              ))
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Delete Group"}
        </Button>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
