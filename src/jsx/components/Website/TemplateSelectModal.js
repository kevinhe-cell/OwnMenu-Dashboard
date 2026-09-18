import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Pagination, Nav } from 'react-bootstrap';
import { SECTION_TEMPLATES } from './editorConfig';

const ITEMS_PER_PAGE = 8;

const getTemplatePreviewImage = (templateKey) => {
  const fallbackImage = "/thumbnails/default.png";
  const type = templateKey.split('-')[0];
  return `/thumbnails/${type}/${templateKey}.png` || fallbackImage;
};

const TemplateSelectModal = ({ 
  show, 
  onHide, 
  sectionType, 
  currentTemplate, 
  onSelect, 
  initialPage = 1, 
  onPageChange 
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [activeTab, setActiveTab] = useState('all');

  // 当弹窗打开时，根据传入的初始值同步页码并重置 Tab
  useEffect(() => {
    if (show) {
      setCurrentPage(initialPage);
      setActiveTab('all');
    }
  }, [show, initialPage]);

  // 处理页码改变并通知父组件进行持久化
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) onPageChange(page);
  };

  // 处理 Tab 切换并重置页码为 1
  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
    if (onPageChange) onPageChange(1);
  };

  // 属于当前类别 (sectionType) 的全部模板
  const allCategoryTemplates = useMemo(() => {
    return Object.entries(SECTION_TEMPLATES)
      .filter(([key, config]) => config.type === sectionType)
      .map(([key, config]) => ({
        key,
        name: config.name,
        preview: getTemplatePreviewImage(key)
      }));
  }, [sectionType]);

  // 计算带 'New' 名称的模板数量
  const newTemplatesCount = useMemo(() => {
    return allCategoryTemplates.filter(t => t.name.toLowerCase().includes('new')).length;
  }, [allCategoryTemplates]);

  // 根据当前 activeTab 过滤要显示的模板列表
  const availableTemplates = useMemo(() => {
    if (activeTab === 'new') {
      return allCategoryTemplates.filter(t => t.name.toLowerCase().includes('new'));
    }
    return allCategoryTemplates;
  }, [allCategoryTemplates, activeTab]);

  const totalPages = Math.ceil(availableTemplates.length / ITEMS_PER_PAGE);
  const currentTemplates = availableTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>,
    );
  }

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      backdrop="static"
      keyboard={false}
      style={{ zIndex: 1060 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Change Template for <span className="text-capitalize fw-bold">{sectionType}</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ minHeight: '400px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <Nav variant="pills" activeKey={activeTab} onSelect={handleTabSelect}>
            <Nav.Item>
              <Nav.Link eventKey="all" className="px-3 py-1 font-w500">
                All ({allCategoryTemplates.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="new" className="px-3 py-1 font-w500">
                New ({newTemplatesCount})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        {availableTemplates.length > 0 ? (
          <div className="d-flex flex-column justify-content-between h-100">
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {currentTemplates.map((template) => {
                const isSelected = template.key === currentTemplate;
                return (
                  <Col key={template.key}>
                    <Card 
                      className={`h-100 cursor-pointer shadow-sm transition-all border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`} 
                      onClick={() => onSelect(template.key)}
                      style={{ 
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 0 15px rgba(13, 110, 253, 0.5)' : ''
                      }}
                    >
                      <Card.Img 
                        variant="top" 
                        src={template.preview} 
                        style={{ height: '150px', objectFit: 'cover', borderBottom: '1px solid #eee' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = '/thumbnails/default.png'; }}
                      />
                      <Card.Body className="text-center py-2">
                        <Card.Title as="h6" className={`small fw-bold mb-1 text-truncate ${isSelected ? 'text-primary' : ''}`} title={template.name}>
                          {template.name}
                        </Card.Title>
                        <Card.Text className="text-muted small" style={{ fontSize: '0.7rem' }}>
                          {template.key}
                          {isSelected && <span className="ms-1 badge bg-primary">Current</span>}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4 pt-3 border-top">
                <Pagination className="mb-0">
                  <Pagination.Prev onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} />
                  {paginationItems}
                  <Pagination.Next onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted p-5">
            {activeTab === 'new' ? 'No new templates available for this category.' : 'No other templates available for this category.'}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
      <style>{`
        .cursor-pointer:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </Modal>
  );
};

export default TemplateSelectModal;
