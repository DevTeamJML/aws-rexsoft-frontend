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
  resizable = false,
  selectable = false,
  actionable = true,
  deletableAction = true,
  editableAction = true,
  onSort,
  onAction,
  onRowClick,
  onSelectionChange,
  onSelectionCountChange, // optional callback to notify parent with the count
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
  sortConfig = {}, // { id: 'created_at', order: 'asc' }
  columnSortingArray,
  userSortingArray,
  columnVisibility,
  columnWidths = {},
  setColumnWidths = () => {},
  isAdmin = false,
}) => {
  const dispatch = useDispatch();
  const [resizing, setResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(200);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Keep consistent naming for sort config
  const currentSortConfig = sortConfig || {};

  // effective total items: prefer server-provided totalItems (for server-side pagination),
  // otherwise fall back to local data length (client-side).
  const effectiveTotalItems =
    typeof totalItems === "number" && totalItems > 0 ? totalItems : data.length;

  // number of selected rows
  const selectedCount = selectedRows.size;

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
    if ((deletableAction || editableAction) && actionable) {
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
  }, [
    fixedColumns,
    dynamicColumns,
    selectable,
    actionable,
    deletableAction,
    editableAction,
  ]);

  const sortedAllColumns = useMemo(() => {
    const cols = Array.isArray(allColumns) ? allColumns : [];
    const getId = (c) => c?.id ?? c?.column_id;

    const checkboxCol = cols.find((c) => getId(c) === "_checkbox");

    const otherCols = cols.filter((c) => getId(c) !== "_checkbox");

    const orderIds =
      (Array.isArray(userSortingArray) &&
        userSortingArray.length > 0 &&
        userSortingArray) ||
      (Array.isArray(columnSortingArray) &&
        columnSortingArray.length > 0 &&
        columnSortingArray) ||
      null;

    if (!orderIds) {
      return checkboxCol ? [checkboxCol, ...otherCols] : otherCols;
    }

    const idToCol = new Map(otherCols.map((c) => [getId(c), c]));

    const ordered = orderIds.map((id) => idToCol.get(id)).filter(Boolean);

    const remaining = otherCols.filter((c) => !orderIds.includes(getId(c)));

    return checkboxCol
      ? [checkboxCol, ...ordered, ...remaining]
      : [...ordered, ...remaining];
  }, [allColumns, userSortingArray, columnSortingArray]);

  const visibleSortedColumns = useMemo(() => {
    const getId = (c) => c?.id ?? c?.column_id ?? c?.raw?.column_id;

    let filtered = isAdmin ? sortedAllColumns : sortedAllColumns.filter(
      (c) => c?.permission !== "not_viewable"
    );

    if (Array.isArray(columnVisibility) && columnVisibility.length > 0) {
      filtered = filtered.filter((col) => {
        const id = getId(col);
        if (id === "_checkbox" || id === "actions") return true; // keep special
        return columnVisibility.includes(id);
      });
    }

    return filtered;
  }, [sortedAllColumns, columnVisibility]);

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

            // Find the closest value that is >= daysDiff
            const matchingOption = sortedOptions.find(
              (item) => daysDiff <= item.value
            );

            return matchingOption?.fillColor || "#ffffff";
          })();
      return { backgroundColor: fillColor };
    };
  }, [dynamicColumns]);

  const getColumnWidth = (columnId) => {
    return columnId === "_checkbox" ? 100 : columnWidths?.[columnId] ?? 200;
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
      // Select all visible rows (current page)
      newSelectedRows = new Set(data.map((row) => row.id));
      setIsAllSelected(true);
    }

    setSelectedRows(newSelectedRows);
    onSelectionChange && onSelectionChange(Array.from(newSelectedRows));
    if (typeof onSelectionCountChange === "function") {
      onSelectionCountChange(newSelectedRows.size);
    }
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
    if (typeof onSelectionCountChange === "function") {
      onSelectionCountChange(newSelectedRows.size);
    }
  };

  // Handle sort click
  const handleSort = (column) => {
    if (!sortable) return;
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

    const minWidth = column?.minWidth || 80;
    const maxWidth = column?.maxWidth || 500;
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

    if (currentSortConfig.id === columnIdentifier) {
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
          {editableAction ? (
            <FaEdit
              className="action-icon edit"
              onClick={(e) => {
                e.stopPropagation();
                onAction && onAction("edit", row);
              }}
              title="Edit"
            />
          ) : null}

          {deletableAction ? (
            <FaTrash
              className="action-icon delete"
              onClick={(e) => {
                e.stopPropagation();
                onAction && onAction("delete", row);
              }}
              title="Delete"
            />
          ) : null}
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
      case "multiline":
        return (
          <span
            title={value}
            className="cell-multiline"
            style={{
              maxWidth: columnWidths[column.id]
                ? `${columnWidths[column.id]}px`
                : "100px",
            }}
          >
            {value}
          </span>
        );

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
    if (typeof onSelectionCountChange === "function") {
      onSelectionCountChange(0);
    }
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
        {/* Optional selection summary above table */}
        {selectable && (
          <div className="table-selection-summary">
            {/* {selectedCount > 0 ? (
              <span>
                Selected {selectedCount} {selectedCount === 1 ? "item" : "items"} of {effectiveTotalItems}
              </span>
            ) : (
              <span>{`No items selected (${effectiveTotalItems} items)`}</span>
            )} */}
            <span>
              {selectable && selectedCount > 0 ? (
                <span className="selected-info" style={{ marginRight: 8 }}>
                  Selected {selectedCount}{" "}
                  {selectedCount === 1 ? "client" : "clients"} —
                </span>
              ) : null}
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, effectiveTotalItems)} of{" "}
              {effectiveTotalItems} entries
            </span>
          </div>
        )}

        <div className="table-scroll-container">
          <div className="table-header-wrapper">
            <table className="reusable-table">
              <thead>
                <tr>
                  {visibleSortedColumns.map((column, index) => (
                    <th
                      key={column.id}
                      className={`table-header ${sortable ? "sortable" : ""} ${
                        column.fixed ? "fixed-column" : ""
                      }`}
                      style={{
                        width: `${getColumnWidth(column.id)}px`,
                      }}
                      data-fixed={column.fixedPosition}
                      onClick={() => {
                        if (
                          column.id !== "_checkbox" &&
                          column.id !== "actions"
                        ) {
                          handleSort(column);
                        }
                      }}
                    >
                      <div className="header-content">
                        {column.field_type === "checkbox" ? (
                          renderCheckbox()
                        ) : (
                          <>
                            <span className="header-label">{column.label}</span>
                            {sortable && renderSortIcon(column)}
                          </>
                        )}
                      </div>
                      {resizable &&
                        column.field_type !== "checkbox" &&
                        column.field_type !== "action" && (
                          <div
                            className="column-resizer"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleResizeStart(column.id, e);
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                    <td
                      colSpan={visibleSortedColumns.length}
                      className="empty-message"
                    >
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
                        {visibleSortedColumns.map((column, colIndex) => {
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
            {/* {selectable && selectedCount > 0 ? (
              <span className="selected-info" style={{ marginRight: 8 }}>
                Selected {selectedCount}{" "}
                {selectedCount === 1 ? "client" : "clients"} —
              </span>
            ) : null}
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, effectiveTotalItems)} of{" "}
            {effectiveTotalItems} entries */}
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
