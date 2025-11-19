// components/ReusableTable/ReusableTable.jsx
import React, { useState, useMemo, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import moment from "moment";

const ReusableTable = ({
  tableId,
  data = [],
  columns = [],
  fixedColumns = [],
  dynamicColumns = [],
  sortable = true,
  resizable = true,
  selectable = false,
  actionable = true,
  onSort,
  onAction,
  onRowClick,
  onSelectionChange,
  loading = false,
  emptyMessage = "No data found",

  // Pagination props
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,

  // Sorting props from parent
  sortConfig = {}, // { columnId: 'created_at', order: 'asc' }
}) => {
  const dispatch = useDispatch();
  const [resizing, setResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(200);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [columnWidths, setColumnWidths] = useState({}); // Local state for resized widths

  // Use parent sortConfig
  const currentSortConfig = sortConfig;

  // Combine fixed and dynamic columns
  const allColumns = useMemo(() => {
    const filteredDynamicColumns = dynamicColumns.filter(
      (c) => c.field_type !== "alert"
    );
    const baseColumns = [...fixedColumns, ...filteredDynamicColumns];
    let resultColumns = [...baseColumns];

    // Add checkbox column at start if selectable
    if (selectable) {
      resultColumns.unshift({
        id: "_checkbox",
        label: "",
        field_type: "checkbox",
        sortable: false,
        fixed: true,
        fixedPosition: "left",
        width: 50,
      });
    }

    // Add actions column at the end
    if (actionable) {
      resultColumns.push({
        id: "actions",
        label: "Actions",
        field_type: "action",
        sortable: false,
        fixed: true,
        fixedPosition: "right",
        width: 120,
      });
    }

    return resultColumns;
  }, [fixedColumns, dynamicColumns, selectable, actionable]);

  // Add this row styling function
  const getRowStyle = useMemo(() => {
    return (row) => {
      // Find alert column from all columns (including dynamic ones)
      const alertColumn = dynamicColumns.find(
        (col) => col.field_type === "alert"
      );
      if (!alertColumn) return {};

      // Get the raw data from the row
      const rawData = row.raw || [];
      const rawDataAlert = rawData.find(
        (d) => d.column_id === alertColumn.column_id
      );

      // Parse the alert value
      let alertRowValue;
      try {
        alertRowValue = rawDataAlert?.row_value
          ? typeof rawDataAlert.row_value === "string"
            ? JSON.parse(rawDataAlert.row_value)
            : rawDataAlert.row_value
          : null;
      } catch (error) {
        alertRowValue = null;
      }

      const isCompleted = alertRowValue?.is_complete || false;
      const dueDate = moment(alertRowValue?.date);
      const now = moment();
      const daysDiff = dueDate.isValid() ? dueDate.diff(now, "days") : Infinity;

      // Get the fill color based on alert configuration
      const fillColor = isCompleted
        ? "#ffffff"
        : (() => {
            const sortedOptions = [...(alertColumn.options || [])].sort(
              (a, b) => a.value - b.value
            );

            // Find the closest value that's >= daysDiff
            const matchingOption = sortedOptions.find(
              (item) => daysDiff <= item.value
            );

            return matchingOption?.fillColor || "#ffffff";
          })();
      return { backgroundColor: fillColor };
    };
  }, [allColumns]);

  const getColumnWidth = (columnId) => {
    return columnId === "_checkbox" ? 100 : (columnWidths[columnId] || 200); // default width
  };

  const handleSelectAll = () => {
    let newSelectedRows;

    if (
      isAllSelected ||
      (selectedRows.size > 0 && selectedRows.size === data.length)
    ) {
      // Deselect all
      newSelectedRows = new Set();
      setIsAllSelected(false);
    } else {
      // Select all visible rows
      newSelectedRows = new Set(data.map((row) => row.id));
      setIsAllSelected(true);
    }

    setSelectedRows(newSelectedRows);
    onSelectionChange && onSelectionChange(Array.from(newSelectedRows));
  };

  // Handle individual row selection
  const handleRowSelect = (rowId, checked) => {
    const newSelectedRows = new Set(selectedRows);

    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }

    setSelectedRows(newSelectedRows);

    // Update select-all state
    if (newSelectedRows.size === 0) {
      setIsAllSelected(false);
    } else if (newSelectedRows.size === data.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false); // This creates the indeterminate state
    }

    onSelectionChange && onSelectionChange(Array.from(newSelectedRows));
  };

  // Handle sort click
  const handleSort = (column) => {
    const columnIdentifier = column.column_id || column.id;

    const newOrder =
      currentSortConfig.id === columnIdentifier &&
      currentSortConfig.order === "asc"
        ? "desc"
        : "asc";

    const newSortConfig = { id: columnIdentifier, order: newOrder };

    if (onSort) {
      onSort(newSortConfig);
    }
  };

  const handleResizeStart = (columnId, e) => {
    if (!resizable) return;
    setStartWidth(getColumnWidth(columnId));
    setResizing(columnId);
    setStartX(e.clientX);
    e.preventDefault();
  };

  const handleResize = (e) => {
    if (!resizing) return;

    const currentWidth = startWidth + (e.clientX - startX);
    const column = allColumns.find((col) => col.id === resizing);

    const minWidth = column.minWidth || 80;
    const maxWidth = column.maxWidth || 500;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth));

    // Update local state with new width
    setColumnWidths((prev) => ({
      ...prev,
      [resizing]: newWidth,
    }));
  };

  const handleResizeEnd = () => {
    if (resizing) {
      setResizing(null);
    }
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    const columnIdentifier = column.column_id || column.id;

    if (currentSortConfig.columnId === columnIdentifier) {
      return currentSortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  // Render checkbox
  const renderCheckbox = (row = null) => {
    if (row) {
      // Individual row checkbox
      const checked = selectedRows.has(row.id);
      return (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => handleRowSelect(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      );
    } else {
      // Header select-all checkbox
      const checked = isAllSelected;
      const indeterminate =
        selectedRows.size > 0 && selectedRows.size < data.length;

      return (
        <input
          type="checkbox"
          checked={checked}
          ref={(el) => {
            if (el) {
              el.indeterminate = indeterminate;
            }
          }}
          onChange={(e) => handleSelectAll()}
        />
      );
    }
  };

  const renderActionIcons = (row) => {
    if (actionable) {
      return (
        <div className="action-icons">
          <FaEdit
            className="action-icon edit"
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction("edit", row);
            }}
            title="Edit"
          />
          <FaTrash
            className="action-icon delete"
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction("delete", row);
            }}
            title="Delete"
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD/MM/YYYY");
  };

  // Render cell content based on column type
  const renderCellContent = (row, column) => {
    const getCellValue = (row, column) => {
      if (column.field_type === "checkbox" || column.field_type === "action") {
        return null;
      }

      if (column.column_id) {
        const rawValue = row.raw?.find(
          (item) => item.column_id === column.column_id
        )?.row_value;

        if (rawValue !== undefined && rawValue !== null) {
          return rawValue;
        }

        const labelKey = column.label?.toLowerCase().replace(/\s+/g, "_");
        if (
          row.mapped?.[labelKey] !== undefined &&
          row.mapped?.[labelKey] !== null
        ) {
          return row.mapped[labelKey];
        }
      }

      if (row[column.id] !== undefined && row[column.id] !== null) {
        return row[column.id];
      }

      return undefined;
    };

    const value = getCellValue(row, column);

    switch (column.field_type) {
      case "checkbox":
        return renderCheckbox(row);
      case "action":
        return renderActionIcons(row);
      case "date":
        return formatDate(value);
      case "dropdown":
        // Chip styling for dropdown fields
        const dropdownOptions = column.options || [];
        const matchingOption = dropdownOptions.find(
          (opt) => opt.value === value || opt.name === value
        );

        const chipStyle = {
          backgroundColor: matchingOption?.fillColor || "#f0f0f0",
          color: matchingOption?.color || "#333333",
          border: `1px solid ${matchingOption?.color || "#ddd"}`,
        };

        return (
          <span className="dropdown-chip" style={chipStyle}>
            {value || "-"}
          </span>
        );
      case "handler":
        return row.handler_name || "-";
      default:
        if (value !== undefined && value !== null) {
          return value;
        } else {
          return "-";
        }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  // Add resize event listeners
  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);

      return () => {
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing]);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedRows(new Set());
    setIsAllSelected(false);
  }, [data]);

  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Fragment>
      <div className="reusable-table-container">
        <div className="table-scroll-container">
          <div className="table-header-wrapper">
            <table className="reusable-table">
              <thead>
                <tr>
                  {allColumns.map((column, index) => (
                    <th
                      key={column.id}
                      className={`table-header ${"sortable"} ${
                        column.fixed ? "fixed-column" : ""
                      }`}
                      style={{
                        width: `${getColumnWidth(column.id)}px`,
                      }}
                      data-fixed={column.fixedPosition}
                      onClick={() => {
                        column.id !== "_checkbox" &&
                          column.id !== "actions" &&
                          handleSort(column);
                      }}
                    >
                      <div className="header-content">
                        {column.field_type === "checkbox" ? (
                          renderCheckbox()
                        ) : (
                          <>
                            <span className="header-label">{column.label}</span>
                            {renderSortIcon(column)}
                          </>
                        )}
                      </div>
                      {resizable &&
                        column.field_type !== "checkbox" &&
                        column.field_type !== "action" && (
                          <div
                            className="column-resizer"
                            onMouseDown={(e) => handleResizeStart(column.id, e)}
                          />
                        )}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-body-wrapper">
            <table className="reusable-table">
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={allColumns.length} className="empty-message">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => {
                    const rowStyle = getRowStyle(row);
                    return (
                      <tr
                        key={row.id || index}
                        className={`${selectable ? "selectable-row" : ""} ${
                          selectedRows.has(row.id) ? "selected-row" : ""
                        }`}
                        style={rowStyle}
                        onClick={() => onRowClick && onRowClick(row)}
                      >
                        {allColumns.map((column, colIndex) => {
                          return (
                            <td
                              key={column.id}
                              className={`table-cell ${
                                column.fixed ? "fixed-column" : ""
                              }`}
                              style={{
                                width: `${getColumnWidth(column.id)}px`,
                              }}
                              data-fixed={column.fixedPosition}
                            >
                              {renderCellContent(row, column)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
              <FaChevronLeft />
            </button>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {generatePageNumbers(currentPage, totalPages).map((page, index) => (
              <button
                key={index}
                className={`pagination-btn ${
                  page === currentPage ? "active" : ""
                } ${page === "..." ? "ellipsis" : ""}`}
                onClick={() => page !== "..." && handlePageChange(page)}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ReusableTable;
