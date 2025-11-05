// components/ReusableTable/ReusableTable.jsx
import React, { useState, useMemo, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
  setSortConfig,
  updateColumnWidth,
  useSelectColumnWidths,
  useSelectSortConfig,
} from "@/redux/slices/tableSlice";
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
  onPageSizeChange,
}) => {
  const dispatch = useDispatch();
  const sortConfig = useSelector(useSelectSortConfig);
  const columnWidths = useSelector(useSelectColumnWidths(tableId));
  const [resizing, setResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Combine fixed and dynamic columns
  const allColumns = useMemo(() => {
    const baseColumns = [...fixedColumns, ...dynamicColumns];

    if (selectable) {
      return [
        {
          id: "_checkbox",
          label: "",
          type: "checkbox",
          sortable: false,
          fixed: true,
          width: 50,
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  }, [fixedColumns, dynamicColumns, selectable]);

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
    if (!column.sortable || !sortable) return;

    const newOrder =
      sortConfig.columnId === column.id && sortConfig.order === "asc"
        ? "desc"
        : "asc";

    if (onSort) {
      onSort({ columnId: column.id, order: newOrder, tableId });
    } else {
      dispatch(setSortConfig({ columnId: column.id, order: newOrder }));
    }
  };

  const handleResizeStart = (columnId, e) => {
    if (!resizable) return;

    setResizing(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths?.[columnId] || getColumnDefaultWidth(columnId));
    e.preventDefault();
  };

  const handleResize = (e) => {
    if (!resizing) return;

    const currentWidth = startWidth + (e.clientX - startX);
    const column = allColumns.find((col) => col.id === resizing);

    const minWidth = column.minWidth || 150;
    const maxWidth = column.maxWidth || 400;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth));

    dispatch(
      updateColumnWidth({ tableId, columnId: resizing, width: newWidth })
    );

  };

  const handleResizeEnd = () => {
    if (resizing) {
      setResizing(null);
    }
  };

  // Get column width
  const getColumnWidth = (columnId) => {
    return columnWidths?.[columnId] || getColumnDefaultWidth(columnId);
  };

  // Get default column width
  const getColumnDefaultWidth = (columnId) => {
    const column = allColumns.find((col) => col.id === columnId);
    return column.width || 150;
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (!column.sortable || !sortable) return null;

    if (sortConfig.columnId === column.id) {
      return sortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />;
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
        <FaEye
          className="action-icon view"
          onClick={(e) => {
            e.stopPropagation();
            onAction && onAction("view", row);
          }}
          title="View"
        />
        <FaDownload
          className="action-icon download"
          onClick={(e) => {
            e.stopPropagation();
            onAction && onAction("download", row);
          }}
          title="Download"
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD/MM/YYYY"); // Consistent format for both server and client
  };

  // Render cell content based on column type
  const renderCellContent = (row, column) => {
    switch (column.type) {
      case "checkbox":
        return renderCheckbox(row);

      case "action":
        return renderActionIcons(row);

      case "date":
        return formatDate(row[column.id]);

      case "dropdown":
        return row[column.id] || "-";

      default:
        return row[column.id] || "-";
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
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

  return (
    <Fragment>
      <div className="reusable-table-container">
        <table className="reusable-table">
          <thead>
            <tr>
              {allColumns.map((column) => (
                <th
                  key={column.id}
                  className={`table-header ${
                    column.sortable && sortable ? "sortable" : ""
                  } ${column.fixed ? "fixed-column" : ""}`}
                  style={{ width: `${getColumnWidth(column.id)}px` }}
                  onClick={() =>
                    column.id !== "_checkbox" && handleSort(column)
                  } 
                >
                  <div className="header-content">
                    {column.type === "checkbox" ? (
                      renderCheckbox()
                    ) : (
                      <>
                        <span className="header-label">{column.label}</span>
                        {renderSortIcon(column)}
                      </>
                    )}
                  </div>
                  {resizable && column.type !== "checkbox" && (
                    <div
                      className="column-resizer"
                      onMouseDown={(e) => handleResizeStart(column.id, e)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`${selectable ? "selectable-row" : ""} ${
                    selectedRows.has(row.id) ? "selected-row" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {allColumns.map((column) => (
                    <td
                      key={column.id}
                      className={`table-cell ${
                        column.fixed ? "fixed-column" : ""
                      }`}
                      style={{ width: `${getColumnWidth(column.id)}px` }}
                    >
                      {renderCellContent(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
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

            <span className="pagination-current">
              Page {currentPage} of {totalPages}
            </span>

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
