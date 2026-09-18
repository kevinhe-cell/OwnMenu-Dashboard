import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";
import {
  addItemGroupThunk,
  getItemGroupsThunk,
} from "../../../store/itemgroups"; // Adjust path

export default function CreateItemGroupModal({ show, onHide }) {
  const dispatch = useDispatch();

  // Items from redux
  const items = useSelector((state) => state.items.items);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [groupIndex, setGroupIndex] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  // Loading state for submission
  const [loading, setLoading] = useState(false);

  // Filtered items by search term
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item?.name
          ?.toLowerCase()
          ?.includes(term) /* add other fields if needed */,
    );
  }, [items, searchTerm]);

  // Toggle item selection
  const toggleSelectItem = (itemId) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setImageFile(e.target.files[0]);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!groupName.trim()) {
      alert("Please enter an item group name.");
      return;
    }

    setLoading(true);
    try {
      const newGroupData = {
        name: groupName.trim(),
        itemIds: Array.from(selectedItemIds),
        image: imageFile,
        index: groupIndex !== "" ? Number(groupIndex) : undefined,
      };
      await dispatch(addItemGroupThunk(newGroupData));
      await dispatch(getItemGroupsThunk()); // refresh groups if needed
      onHide(); // close modal

      // reset state for next time modal opens
      setGroupName("");
      setGroupIndex("");
      setSelectedItemIds(new Set());
      setImageFile(null);
      setSearchTerm("");
    } catch (error) {
      alert("Failed to create item group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="create-item-group-modal"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title id="create-item-group-modal">
          Create Item Group
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Group name */}
          <Form.Group className="mb-3" controlId="itemGroupName">
            <Form.Label>Item Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter item group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="itemGroupIndex">
            <Form.Label>Display order (optional)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              placeholder="Auto-assigned if empty"
              value={groupIndex}
              onChange={(e) => setGroupIndex(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          {/* Image upload */}
          <Form.Group controlId="itemGroupImage" className="mb-3">
            <Form.Label>Image (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </Form.Group>

          {/* Search input */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search items to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search items"
              disabled={loading}
            />
          </InputGroup>

          {/* Items list with checkboxes, scrollable */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
            }}
          >
            {filteredItems.length === 0 && (
              <p className="text-muted">No items found.</p>
            )}
            {filteredItems.map((item) => (
              <Form.Check
                key={item.id}
                type="checkbox"
                id={`itemgroup-item-${item.id}`}
                label={item.name}
                checked={selectedItemIds.has(item.id)}
                onChange={() => toggleSelectItem(item.id)}
                className="mb-1"
                disabled={loading}
              />
            ))}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
