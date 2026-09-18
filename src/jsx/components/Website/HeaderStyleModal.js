import React, { useState, useEffect } from 'react';
import { Modal, Button, Pagination } from 'react-bootstrap';

const HeaderStyleModal = ({ show, onHide, onSelect, currentHeaderId }) => {
  const pageSize = 9;
  const [selectedId, setSelectedId] = useState(currentHeaderId);
  const [currentPage, setCurrentPage] = useState(1);

  const styles = [
    { id: 1, name: 'Header 1' },
    { id: 2, name: 'Header 2' },
    { id: 3, name: 'Header 3' },
    { id: 4, name: 'Header 4' },
    { id: 5, name: 'Header 5' },
    { id: 6, name: 'Header 6' },
    { id: 7, name: 'Header 7' },
    { id: 8, name: 'Header 8' },
    { id: 9, name: 'Header 9' },
    { id: 10, name: 'Header 10' },
    { id: 11, name: 'Header 11' },
    { id: 12, name: 'Header 12' },
    { id: 13, name: 'Header 13' },
    { id: 14, name: 'Header 14' },
    { id: 15, name: 'Header 15' },
    { id: 16, name: 'Header 16 (Premium)' },
    { id: 17, name: 'Header 17 (Premium)' },
    { id: 18, name: 'Header 18 (Premium)' },
    { id: 19, name: 'Header 19 (Premium)' },
    { id: 20, name: 'Header 20 (Premium)' },
    { id: 21, name: 'Header 21 (Premium)' },
    { id: 22, name: 'Header 22 (Premium)' },
    { id: 23, name: 'Header 23 (Premium)' },
    { id: 24, name: 'Header 24 (Premium)' },
    { id: 25, name: 'Header 25 (Premium)' },
    { id: 26, name: 'Header 26 (Premium)' },
  ];

  // Auto-navigate to the page containing the current selection when modal opens
  useEffect(() => {
    if (show && currentHeaderId) {
      setSelectedId(currentHeaderId);
      const currentIndex = styles.findIndex(s => s.id === currentHeaderId);
      if (currentIndex !== -1) {
        setCurrentPage(Math.ceil((currentIndex + 1) / pageSize));
      }
    }
  }, [show, currentHeaderId]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleSave = () => {
    onSelect(selectedId);
    onHide();
  };

  // Pagination logic
  const totalPages = Math.ceil(styles.length / pageSize);
  const currentStyles = styles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Change Header Style</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">Select a new style for your website's header.</p>
        <div className="row min-vh-50">
          {currentStyles.map((style) => (
            <div key={style.id} className="col-md-4 mb-3">
              <div
                className={`card h-100 ${selectedId === style.id ? 'border-primary border-3' : ''}`}
                onClick={() => handleSelect(style.id)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  transform: selectedId === style.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div className="card-body text-center d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
                  <h5 className="card-title mb-0">{style.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
              />
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === currentPage}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages} 
              />
            </Pagination>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HeaderStyleModal;
