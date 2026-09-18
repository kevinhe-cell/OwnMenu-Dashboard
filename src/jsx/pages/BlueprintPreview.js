import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Row, Col, Badge, Table, Button } from "react-bootstrap";

// Helper function to safely parse non-standard JSON strings
const safeParseNonStandardJSON = (str) => {
  if (!str) return null;
  
  // If it's already an object or array, return as is
  if (typeof str === 'object') return str;
  
  // Handle non-standard array of objects like "[{type:hero,template:hero-13},{type:about,template:about-3}]"
  if (typeof str === 'string' && str.startsWith('[') && str.endsWith(']')) {
    try {
      // Fix non-standard JSON by adding quotes to keys and string values
      let fixedStr = str
        // Quote keys: {type:hero -> {"type":"hero"
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        // Quote string values: :"hero" -> :"hero" (already quoted) or :hero -> :"hero"
        .replace(/:\s*([a-zA-Z0-9_\-]+)(?=[,}])/g, ':"$1"');
      
      return JSON.parse(fixedStr);
    } catch (e) {
      console.error("Failed to parse non-standard JSON:", str);
      return str;
    }
  }
  
  // Handle standard JSON
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

const BlueprintPreview = () => {
  const { blueprintId } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blueprints/${blueprintId}`);
        if (response.ok) {
          const data = await response.json();
          setBlueprint(data);
        } else {
          setError("Blueprint not found");
        }
      } catch (err) {
        setError("Failed to fetch blueprint data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprint();
  }, [blueprintId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!blueprint) {
    return <div className="alert alert-warning">No blueprint data to display.</div>;
  }

  // Safely parse layout and tags
  let layout = [];
  if (blueprint.layout) {
    layout = safeParseNonStandardJSON(blueprint.layout);
    // Ensure it's an array
    if (!Array.isArray(layout)) {
      // Handle string representation of arrays like "[{type:hero,template:hero-13},{type:about,template:about-3}]"
      if (typeof blueprint.layout === 'string' && blueprint.layout.startsWith('[') && blueprint.layout.endsWith(']')) {
        try {
          // Fix non-standard JSON by adding quotes to keys and string values
          let fixedStr = blueprint.layout
            // Quote keys: {type:hero -> {"type":"hero"
            .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            // Quote string values: :"hero" -> :"hero" (already quoted) or :hero -> :"hero"
            .replace(/:\s*([a-zA-Z0-9_\-]+)(?=[,}])/g, ':"$1"');
          
          layout = JSON.parse(fixedStr);
        } catch (e) {
          console.error("Failed to parse layout array:", blueprint.layout);
          layout = [];
        }
      } else {
        layout = [];
      }
    }
  }

  let tags = [];
  if (blueprint.tags) {
    tags = safeParseNonStandardJSON(blueprint.tags);
    // Ensure it's an array
    if (!Array.isArray(tags)) {
      // Handle string representation of arrays like "[tag1,tag2,tag3]"
      if (typeof blueprint.tags === 'string' && blueprint.tags.startsWith('[') && blueprint.tags.endsWith(']')) {
        try {
          // Remove brackets and split by comma
          tags = blueprint.tags.substring(1, blueprint.tags.length - 1).split(',').map(tag => tag.trim());
        } catch (e) {
          console.error("Failed to parse tags array:", blueprint.tags);
          tags = [];
        }
      } else {
        tags = [];
      }
    }
  }

  // Safely parse colors
  let colors = {};
  if (blueprint.default_colors) {
    colors = safeParseNonStandardJSON(blueprint.default_colors);
    // Ensure it's an object
    if (typeof colors !== 'object' || colors === null || Array.isArray(colors)) {
      // Handle string representation of objects like "{primary:#B71C1C,secondary:#FFD700,text:#3E2723}"
      if (typeof blueprint.default_colors === 'string' && blueprint.default_colors.startsWith('{') && blueprint.default_colors.endsWith('}')) {
        try {
          // Fix non-standard JSON by adding quotes to keys and string values
          let fixedStr = blueprint.default_colors
            // Quote keys: {primary:#B71C1C -> {"primary":"#B71C1C"}
            .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            // Quote string values: :"#B71C1C" -> :"#B71C1C" (already quoted) or :#B71C1C -> :"#B71C1C"
            .replace(/:\s*([a-zA-Z0-9_#\-]+)(?=[,}])/g, ':"$1"');
          
          colors = JSON.parse(fixedStr);
        } catch (e) {
          console.error("Failed to parse colors object:", blueprint.default_colors);
          colors = {};
        }
      } else {
        colors = {};
      }
    }
  }

  return (
    <>
      <div className="page-titles d-flex justify-content-between align-items-center">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/blueprints">Blueprints</Link></li>
          <li className="breadcrumb-item active"><Link to="#">Preview: {blueprint.label}</Link></li>
        </ol>
        <Button variant="secondary" onClick={() => navigate('/blueprints')}>
          <i className="fa fa-arrow-left me-2"></i> Back
        </Button>
      </div>

      <Row>
        {/* Left Column: Basic Info & Styles */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <Card.Title>Blueprint Details</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h4 className="text-primary">{blueprint.label}</h4>
                <p>{blueprint.description}</p>
              </div>
              
              <div className="mb-4">
                <h5>Tags</h5>
                <div>
                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <Badge key={index} bg="info" className="me-1 mb-1">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-muted">No tags</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5>Style Configuration</h5>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Font Style</strong></td>
                      <td>{blueprint.font_style || "Default"}</td>
                    </tr>
                    <tr>
                      <td><strong>Primary Color</strong></td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div style={{ width: 20, height: 20, backgroundColor: colors.primary, marginRight: 8, border: "1px solid #ccc" }}></div>
                          {colors.primary || "N/A"}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Secondary Color</strong></td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div style={{ width: 20, height: 20, backgroundColor: colors.secondary, marginRight: 8, border: "1px solid #ccc" }}></div>
                          {colors.secondary || "N/A"}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Text Color</strong></td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div style={{ width: 20, height: 20, backgroundColor: colors.text, marginRight: 8, border: "1px solid #ccc" }}></div>
                          {colors.text || "N/A"}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Layout Structure */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <Card.Title>Layout Structure</Card.Title>
            </Card.Header>
            <Card.Body>
              {layout.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Section Type</th>
                        <th>Template ID</th>
                        <th>Page</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layout.map((section, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <Badge bg="secondary">{section.type}</Badge>
                          </td>
                          <td><code>{section.template}</code></td>
                          <td>{section.page || <span className="text-muted">home</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No layout configuration found for this blueprint.</p>
                </div>
              )}
              
              <div className="mt-4">
                 <h5>Raw Layout JSON</h5>
                 <pre style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px", maxHeight: "300px", overflow: "auto" }}>
                    {JSON.stringify(layout, null, 2)}
                 </pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlueprintPreview;