import React, { useEffect, useState } from "react";
import { FaTimes, FaEdit, FaSave, FaGripVertical, FaArrowLeft } from "react-icons/fa";

export default function ColumnOrderDrawer({
  open,
  onClose,
  dynamicColumns = [],
  fixedColumns = [],
  onColumnVisibilityChange,
  onColumnOrderChange
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempColumns, setTempColumns] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Combine fixed and dynamic columns into one array
  useEffect(() => {
    if (open) {
      const allColumns = [...fixedColumns, ...dynamicColumns];
      setTempColumns(allColumns.map(col => ({
        ...col,
        isVisible: col.isVisible !== false // Default to visible if not specified
      })));
    }
  }, [open, dynamicColumns, fixedColumns]);

  const toggleColumnVisibility = (columnId) => {
    if (isEditMode) return;
    
    setTempColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const enterEditMode = () => {
    setIsEditMode(true);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setDragOverIndex(null);
  };

  const saveOrder = () => {
    onColumnOrderChange(tempColumns.map(col => col.id));
    setIsEditMode(false);
    setDragOverIndex(null);
  };

  const handleDragStart = (e, index) => {
    if (!isEditMode) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index);
  };

  const handleDragOver = (e, index) => {
    if (!isEditMode || dragIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    if (!isEditMode || dragIndex === null) return;
    e.preventDefault();
    
    const newColumns = [...tempColumns];
    const [draggedItem] = newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedItem);
    
    setTempColumns(newColumns);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleApply = () => {
    const visibilityUpdates = tempColumns.reduce((acc, col) => {
      acc[col.id] = col.isVisible;
      return acc;
    }, {});
    
    onColumnVisibilityChange(visibilityUpdates);
    onClose();
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setDragOverIndex(null);
    onClose();
  };

  return (
    <>
      <div
        className={`drawer-overlay ${open ? "active" : ""}`}
        onClick={handleCancel}
      ></div>

      <div className={`column-order-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="header-content">
            {isEditMode ? (
              <>
                <button className="back-btn" onClick={exitEditMode}>
                  <FaArrowLeft />
                </button>
                <h3>Rearrange Columns</h3>
                <button className="save-btn" onClick={saveOrder}>
                  <FaSave />
                </button>
              </>
            ) : (
              <>
                <h3>Column Settings</h3>
                <button className="edit-btn" onClick={enterEditMode}>
                  <FaEdit />
                </button>
              </>
            )}
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-content">
          {isEditMode ? (
            // Edit Mode - Draggable columns
            <div className="edit-mode-container">
              <p className="edit-instruction">
                Drag and drop to rearrange column order
              </p>
              <div className="columns-list edit-mode">
                {tempColumns.map((column, index) => (
                  <DraggableColumnItem
                    key={column.id}
                    column={column}
                    index={index}
                    isEditMode={isEditMode}
                    isDragging={dragIndex === index}
                    isDragOver={dragOverIndex === index}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          ) : (
            // View Mode - Toggle visibility
            <div className="view-mode-container">
              <div className="columns-list view-mode">
                {tempColumns.map((column) => (
                  <ColumnVisibilityItem
                    key={column.id}
                    column={column}
                    onToggleVisibility={toggleColumnVisibility}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!isEditMode && (
          <div className="drawer-footer">
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-apply" onClick={handleApply}>
              Apply Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Column Item for Visibility Toggle Mode
const ColumnVisibilityItem = ({ column, onToggleVisibility }) => {
  return (
    <div 
      className={`column-item ${!column.isVisible ? 'disabled' : ''}`}
      onClick={() => onToggleVisibility(column.id)}
    >
      <div className="column-info">
        <span className="column-label">{column.label}</span>
      </div>
      <div className="visibility-indicator">
        <div className={`toggle-dot ${column.isVisible ? 'visible' : 'hidden'}`} />
      </div>
    </div>
  );
};

// Column Item for Drag and Drop Mode
const DraggableColumnItem = ({ 
  column, 
  index, 
  isEditMode, 
  isDragging,
  isDragOver,
  onDragStart, 
  onDragOver, 
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  return (
    <div
      className={`column-item draggable ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${!column.isVisible ? 'disabled' : ''}`}
      draggable={isEditMode && column.isVisible}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <FaGripVertical className="drag-handle" />
      <span className="column-label">{column.label}</span>
    </div>
  );
};