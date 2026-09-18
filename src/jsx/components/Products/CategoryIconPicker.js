import React, { useState, useMemo } from "react";
import { Modal, Button, Form, Badge, InputGroup, Nav, Tab } from "react-bootstrap";
import { Search, X, Check, Sparkles, Link as LinkIcon, Grid } from "lucide-react";
import { CATEGORY_ICONS, CATEGORY_ICON_MAP, CategoryIcon } from "./CategoryIcon";

/**
 * 分类图标选择器组件
 * 支持 100+ 精选餐饮图标网格点选与自定义图片链接/Key 输入
 * @param {string} value 当前选中的图标 key 或 URL
 * @param {function} onChange 图标变更回调函数
 */
export function CategoryIconPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeMode, setActiveMode] = useState("library"); // 'library' | 'custom'
  const [customInput, setCustomInput] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(CATEGORY_ICONS.map((i) => i.category)));
    return ["All", ...unique];
  }, []);

  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return CATEGORY_ICONS.filter((item) => {
      const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
      if (!matchCategory) return false;
      if (!term) return true;

      const matchKey = item.key.toLowerCase().includes(term);
      const matchLabel = item.label.toLowerCase().includes(term);
      const matchKeyword = item.keywords?.some((k) => k.toLowerCase().includes(term));
      return matchKey || matchLabel || matchKeyword;
    });
  }, [searchTerm, selectedCategory]);

  const currentIconConfig = value ? CATEGORY_ICON_MAP[value] : null;
  const isCustomUrl = value && (value.startsWith("http") || value.startsWith("/") || value.startsWith("data:"));

  const handleOpen = () => {
    setCustomInput(value || "");
    setIsOpen(true);
  };

  const handleSelect = (iconKey) => {
    onChange(iconKey);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleApplyCustom = () => {
    const trimmed = customInput.trim();
    onChange(trimmed ? trimmed : null);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange(null);
  };

  return (
    <div className="category-icon-picker">
      {/* 触发与当前选中展示区 */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {value ? (
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 border rounded-3 bg-white shadow-sm"
            style={{ cursor: "pointer", borderColor: "#cbd5e1" }}
            onClick={handleOpen}
            title="点击更换分类图标"
          >
            <div
              className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-2 overflow-hidden"
              style={{ width: 36, height: 36 }}
            >
              <CategoryIcon name={value} size={22} />
            </div>
            <div>
              <div className="fw-semibold text-slate-800 small">
                {currentIconConfig ? currentIconConfig.label : (isCustomUrl ? "自定义图片链接" : value)}
              </div>
              <div className="text-muted smaller" style={{ fontSize: "0.72rem" }}>
                {isCustomUrl ? "Custom Image URL" : `Key: ${value}`}
              </div>
            </div>
            <Button
              variant="light"
              size="sm"
              className="btn-sm py-0 px-2 ms-2 text-muted border-0 hover-text-danger"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(e);
              }}
              title="清除图标"
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline-secondary"
            className="d-flex align-items-center gap-2 rounded-3 border-dashed px-3 py-2"
            onClick={handleOpen}
            type="button"
          >
            <Sparkles size={16} className="text-primary" />
            <span className="small fw-medium">选择分类图标 (100+ 精选图标)</span>
          </Button>
        )}
      </div>

      {/* 选择图标弹窗 */}
      <Modal
        show={isOpen}
        onHide={() => setIsOpen(false)}
        size="lg"
        centered
        className="category-icon-modal"
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <div>
            <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
              <Sparkles className="text-primary" size={20} /> 选择分类图标 (Category Icon)
            </Modal.Title>
            <p className="text-muted small mb-0">提供 100+ 款餐饮矢量图标，支持按关键词快速搜索或自定义图片链接</p>
          </div>
        </Modal.Header>

        <Modal.Body className="pt-1 px-4">
          {/* 模式切换 (图标库 vs 自定义链接) */}
          <Nav variant="pills" className="mb-3 border-bottom pb-2 gap-2">
            <Nav.Item>
              <Nav.Link
                active={activeMode === "library"}
                onClick={() => setActiveMode("library")}
                className="py-1 px-3 rounded-pill small fw-medium d-flex align-items-center gap-1"
                style={{ cursor: "pointer" }}
              >
                <Grid size={14} /> 精选餐饮图标库 ({CATEGORY_ICONS.length}+)
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeMode === "custom"}
                onClick={() => setActiveMode("custom")}
                className="py-1 px-3 rounded-pill small fw-medium d-flex align-items-center gap-1"
                style={{ cursor: "pointer" }}
              >
                <LinkIcon size={14} /> 自定义图片 URL / Key
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeMode === "library" ? (
            <>
              {/* 搜索框 */}
              <InputGroup className="mb-3 shadow-none">
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="搜索图标名称、关键词 (如: soup, 辣, chicken, 饺子, 面条, 烤鸭, boba, drinks, dessert...)"
                  className="border-start-0 shadow-none ps-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    className="border-start-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={14} />
                  </Button>
                )}
              </InputGroup>

              {/* 分类标签过滤 */}
              <div className="d-flex flex-wrap gap-1 mb-3" style={{ maxHeight: "70px", overflowY: "auto" }}>
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    bg={selectedCategory === cat ? "primary" : "light"}
                    text={selectedCategory === cat ? "white" : "dark"}
                    className="px-3 py-2 rounded-pill fw-medium border"
                    style={{ cursor: "pointer", fontSize: "0.73rem" }}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* 图标网格 */}
              <div
                className="icon-grid p-1"
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
                  gap: "10px",
                }}
              >
                {filteredIcons.length === 0 ? (
                  <div className="text-center py-5 text-muted w-100" style={{ gridColumn: "1 / -1" }}>
                    <p className="mb-1">未找到匹配的图标</p>
                    <p className="small text-muted mb-0">您可以切换分类标签或切换到「自定义图片 URL」模式</p>
                  </div>
                ) : (
                  filteredIcons.map((item) => {
                    const isSelected = value === item.key;
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleSelect(item.key)}
                        className={`d-flex flex-column align-items-center justify-content-center p-2 rounded-3 border text-center ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "bg-white text-slate-700 hover-bg-light"
                        }`}
                        style={{
                          cursor: "pointer",
                          minHeight: 90,
                          position: "relative",
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              background: "#fff",
                              color: "#0d6efd",
                              borderRadius: "50%",
                              width: 16,
                              height: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div className="mb-2 text-center d-flex align-items-center justify-content-center" style={{ height: 32 }}>
                          <IconComponent size={26} />
                        </div>
                        <span
                          className="text-truncate w-100"
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: isSelected ? 600 : 500,
                          }}
                          title={item.label}
                        >
                          {item.label.split(" / ")[0]}
                        </span>
                        <span
                          className="text-truncate w-100 opacity-75"
                          style={{
                            fontSize: "0.68rem",
                          }}
                        >
                          {item.label.split(" / ")[1] || ""}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="py-3">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-slate-700">自定义图标图片链接 (Image / SVG URL)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="https://example.com/icons/my-category.svg"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="rounded-3 border-slate-200"
                />
                <Form.Text className="text-muted small">
                  支持外链图片 URL（PNG、SVG、JPG）或图标 Key。
                </Form.Text>
              </Form.Group>

              {customInput && (
                <div className="p-3 border rounded-3 bg-light d-flex align-items-center gap-3 mt-3">
                  <div className="bg-white p-2 border rounded-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <CategoryIcon name={customInput} size={32} />
                  </div>
                  <div>
                    <div className="small fw-bold text-slate-800">当前输入预览</div>
                    <div className="small text-muted text-break">{customInput}</div>
                  </div>
                </div>
              )}

              <div className="mt-4 d-flex justify-content-end">
                <Button variant="primary" className="rounded-pill px-4" onClick={handleApplyCustom}>
                  应用此图标 (Apply)
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 justify-content-between">
          <Button
            variant="outline-danger"
            size="sm"
            className="rounded-pill px-3"
            onClick={() => handleSelect(null)}
          >
            无图标 (Clear Icon)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-pill px-4"
            onClick={() => setIsOpen(false)}
          >
            关闭
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CategoryIconPicker;
