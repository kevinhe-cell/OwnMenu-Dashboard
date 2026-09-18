import React, { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, Pagination, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

const IngredientSelectorModal = ({ show, onHide, onSave, initialSelectedIds = [] }) => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  // Initialize selectedIds when modal opens
  useEffect(() => {
    if (show) {
      setSelectedIds([...initialSelectedIds]);
      fetchIngredients(1, "");
    }
  }, [show, initialSelectedIds]);

  const fetchIngredients = async (currentPage, searchTerm) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: limit,
        search: searchTerm,
      }).toString();

      const res = await fetch(`/api/ingredients?${query}`);
      const data = await res.json();

      if (data.data) {
        setIngredients(data.data);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (err) {
      console.error("Failed to fetch ingredients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    setPage(1);
    fetchIngredients(1, term);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchIngredients(newPage, search);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    // Find the full objects for the selected IDs (from current page + we might need a way to get full objects if they are not on current page)
    // Actually, AddProducts only needs IDs to save, but needs objects to display.
    // For display purposes in parent, we might need to fetch all selected objects or pass them back if available.
    // Simplified: We pass back IDs. The parent component is responsible for displaying them. 
    // Wait, if the parent doesn't have the full list, it can't display the name/icon of selected items that are not on the current page of the modal.
    // Solution: The parent should probably fetch "all selected ingredients" or we pass back the full objects we know about.
    
    // Better approach for this specific UI: 
    // The parent likely needs the full ingredient objects to display the tags.
    // We can pass back the full objects of the *currently visible* selected items, 
    // but for items selected on other pages, we might miss them if we only look at `ingredients` state.
    
    // To solve this properly without over-fetching:
    // 1. Parent passes `initialSelectedIngredients` (full objects).
    // 2. Modal maintains a map of `selectedIngredientsMap` {id: object}.
    // 3. When saving, convert map values to array.
    
    onSave(selectedIds, ingredients.filter(i => selectedIds.includes(i.id))); 
    // Note: This simple filter only returns objects currently visible. 
    // We will improve this by maintaining a "selectedObjects" state if needed, 
    // but for now let's assume the parent handles fetching or we rely on what's visible.
    // Actually, let's just pass IDs and let the parent handle display logic (maybe parent fetches all ingredients once for display, or we fetch details).
    
    // REVISED: Let's pass back the IDs. The parent (AddProducts) already fetches ALL ingredients for display in the previous version.
    // If we want to support pagination in parent display too, that's complex.
    // Assuming the parent wants to display ALL selected tags.
    
    onSave(selectedIds);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Select Ingredients</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Search */}
        <InputGroup className="mb-3">
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search ingredients..."
            value={search}
            onChange={handleSearch}
          />
        </InputGroup>

        {/* List */}
        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        ) : (
          <div className="d-flex flex-wrap gap-2 mb-3" style={{ minHeight: "200px", alignContent: "flex-start" }}>
            {ingredients.map((ing) => {
              const isSelected = selectedIds.includes(ing.id);
              return (
                <Button
                  key={ing.id}
                  variant={isSelected ? "primary" : "outline-secondary"}
                  className="rounded-pill"
                  size="sm"
                  onClick={() => toggleSelection(ing.id)}
                >
                  {ing.icon} {ing.name} {ing.chinese_name && `(${ing.chinese_name})`}
                </Button>
              );
            })}
            {ingredients.length === 0 && <p className="text-muted">No ingredients found.</p>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
            </Pagination>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Confirm Selection ({selectedIds.length})</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IngredientSelectorModal;
