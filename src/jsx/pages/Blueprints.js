import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Card, Col, Button } from "react-bootstrap";
import EditBlueprintModal from "../components/Website/EditBlueprintModal";
import AddBlueprintModal from "../components/Website/AddBlueprintModal";

const Blueprints = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch blueprints from the API
    const fetchBlueprints = async () => {
      try {
        const response = await fetch("/api/blueprints");
        if (response.ok) {
          const data = await response.json();
          setBlueprints(data);
        } else {
          console.error("Failed to fetch blueprints");
        }
      } catch (error) {
        console.error("Error fetching blueprints:", error);
      }
    };

    fetchBlueprints();
  }, []);

  // Delete blueprint function
  const deleteBlueprint = async (id, label) => {
    if (window.confirm(`Are you sure you want to delete blueprint "${label}"?`)) {
      try {
        const token = localStorage.getItem("ownmenutoken");
        const response = await fetch(`/api/blueprints/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }) // Include auth token if available
          },
        });
        
        if (response.ok) {
          // Remove the blueprint from the state
          setBlueprints(blueprints.filter(blueprint => blueprint.id !== id));
          // Reset to first page if current page becomes empty
          if (currentItems.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to delete blueprint:", errorData.message);
          alert(`Failed to delete blueprint: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting blueprint:", error);
        alert("Error deleting blueprint. Please try again.");
      }
    }
  };

  // Open edit modal with selected blueprint
  const handleEditClick = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setShowEditModal(true);
  };

  // Update blueprint in state after successful edit
  const handleUpdateBlueprint = (updatedBlueprint) => {
    setBlueprints(blueprints.map(b => b.id === updatedBlueprint.id ? updatedBlueprint : b));
  };

  // Add new blueprint to state
  const handleAddBlueprint = (newBlueprint) => {
    setBlueprints([newBlueprint, ...blueprints]);
    // Go to first page to see the new blueprint
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = blueprints.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(blueprints.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to={"#"}>Admin</Link>
          </li>
          <li className="breadcrumb-item active">
            <Link to={"#"}>Blueprints</Link>
          </li>
        </ol>
      </div>

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <Card.Title>Blueprints Management</Card.Title>
              <Button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add New Blueprint
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-responsive-md">
                  <thead>
                    <tr>
                      <th>
                        <strong>ID</strong>
                      </th>
                      <th>
                        <strong>Label</strong>
                      </th>
                      <th>
                        <strong>Description</strong>
                      </th>
                      <th>
                        <strong>Tags</strong>
                      </th>
                      <th>
                        <strong>Action</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((blueprint) => (
                      <tr key={blueprint.id}>
                        <td>
                          <strong>{blueprint.id}</strong>
                        </td>
                        <td>{blueprint.label}</td>
                        <td>{blueprint.description}</td>
                        <td>{blueprint.tags}</td>
                        <td>
                          <div className="d-flex">
                            <Link
                              to={`/blueprint-preview/${blueprint.id}`}
                              className="btn btn-info shadow btn-xs sharp me-1"
                            >
                              <i className="fa fa-eye"></i>
                            </Link>
                            <Button
                              as="a"
                              href="#"
                              className="btn btn-primary shadow btn-xs sharp me-1"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditClick(blueprint);
                              }}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </Button>
                            <Button
                              as="a"
                              href="#"
                              className="btn btn-danger shadow btn-xs sharp"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteBlueprint(blueprint.id, blueprint.label);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <Card.Footer>
              <nav>
                <ul className="pagination">
                  {pageNumbers.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${currentPage === number ? "active" : ""}`}
                    >
                      <a
                        onClick={() => paginate(number)}
                        href="#"
                        className="page-link"
                      >
                        {number}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <EditBlueprintModal 
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        blueprint={selectedBlueprint}
        onUpdate={handleUpdateBlueprint}
      />
      
      <AddBlueprintModal 
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onAdd={handleAddBlueprint}
      />
    </>
  );
};

export default Blueprints;