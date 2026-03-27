// components/ReusableTable/ReusableTable.jsx
import React, { useState, useMemo, useEffect, Fragment, useRef } from "react";
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
  FaFileSignature,
  FaCopy,
} from "react-icons/fa";
import moment from "moment";
import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";
import { safeParseJSON } from "@/utils/validation";
import ColumnFilterPopover from "./ColumnFilterPopover";

const ReusableTable = ({
  tableId,
  data = [],
  columns = [],
  fixedColumns = [],
  dynamicColumns = [],

  /** Sorting & Column Behavior */
  sortable = true,
  resizable = false,
  filter = false,

  /** Selection */
  selectable = false,

  /** OLD ACTION SYSTEM (still supported) */
  actionable = true, // legacy
  editableAction = true, // legacy
  deletableAction = true, // legacy

  /** NEW ACTION SYSTEM */
  enableActions = true,
  actionButtons,
  // if undefined → fallback to old behavior
  // if array → overrides old props completely

  /** Event handlers */
  onSort,
  onAction,
  onRowClick,
  onSelectionChange,
  onSelectionCountChange,

  /** Loading & Empty State */
  loading = false,
  emptyMessage = "No data found",

  /** Pagination */
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,

  /** Sorting from parent */
  sortConfig = {},

  /** Column visibility and sizing */
  columnSortingArray,
  userSortingArray,
  columnVisibility,
  columnWidths = {},
  setColumnWidths = () => {},

  rtePreviewContent = "",
  setRtePreviewContent = () => {},

  /** Admin override */
  isAdmin = false,
  onColumnFilter = () => {},
  filters = [],
}) => {
  const dispatch = useDispatch();
  const allCompanyUsers = useSelectAllCompanyUsers();

  /** Resize */
  const [resizing, setResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(200);

  /** Selection */
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const headerRef = useRef(null);

  const rowMeasureRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(38);
  const [scrollTop, setScrollTop] = useState(0);

  const [filterColumn, setFilterColumn] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);

  const openColumnFilter = (column, e) => {
    setFilterColumn(column);
    setFilterAnchor(e.currentTarget);
  };

  const BUFFER = 5;
  const currentSortConfig = sortConfig || {};
  const effectiveTotalItems =
    typeof totalItems === "number" && totalItems > 0 ? totalItems : data.length;

  const onScroll = (e) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    setScrollTop(scrollTop);

    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  };

  const visibleRange = useMemo(() => {
    const viewportHeight = 400; // same as CSS height
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER);
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + BUFFER,
    );

    return { startIndex, endIndex };
  }, [scrollTop, data.length]);

  useEffect(() => {
    if (rowMeasureRef.current) {
      const h = rowMeasureRef.current.getBoundingClientRect().height;
      if (h && h !== rowHeight) {
        setRowHeight(h);
      }
    }
  }, [data, visibleRange.startIndex]);

  const resolvedActionButtons = useMemo(() => {
    // If caller explicitly passes array → override legacy system
    if (Array.isArray(actionButtons)) {
      return actionButtons;
    }

    // Otherwise → fallback to legacy system
    if (!actionable) return [];

    const buttons = [];
    if (editableAction) buttons.push("edit");
    if (deletableAction) buttons.push("delete");

    return buttons;
  }, [actionButtons, actionable, editableAction, deletableAction]);

  const getColumnWidth = (columnId) => {
    // Checkbox column is always small
    if (columnId === "_checkbox") return 100;

    // If saved width exists, use it
    if (columnWidths?.[columnId] !== undefined) {
      return columnWidths[columnId];
    }

    // Else fallback to default width (your UI uses 200px)
    return 200;
  };

  const allColumns = useMemo(() => {
    const filteredDynamic = dynamicColumns.filter(
      (c) => c.field_type !== "alert",
    );

    const base = [...fixedColumns, ...filteredDynamic];
    let result = [...base];

    /** Add checkbox column if selectable */
    if (selectable) {
      result.unshift({
        id: "_checkbox",
        label: "",
        field_type: "_checkbox",
        sortable: false,
        fixed: true,
        fixedPosition: "left",
        width: 50,
      });
    }

    /** Add action column if needed (use resolvedActionButtons) */
    if (enableActions && resolvedActionButtons.length > 0) {
      result.push({
        id: "actions",
        label: "Actions",
        field_type: "action",
        sortable: false,
        fixed: true,
        fixedPosition: "right",
        width: 160,
      });
    }

    return result;
  }, [
    fixedColumns,
    dynamicColumns,
    selectable,
    enableActions,
    resolvedActionButtons,
  ]);

  const sortedAllColumns = useMemo(() => {
    const cols = Array.isArray(allColumns) ? allColumns : [];
    const getId = (c) => c?.id ?? c?.column_id;

    const checkboxCol = cols.find((c) => getId(c) === "_checkbox");
    const others = cols.filter((c) => getId(c) !== "_checkbox");

    const orderIds =
      (Array.isArray(userSortingArray) &&
        userSortingArray.length > 0 &&
        userSortingArray) ||
      (Array.isArray(columnSortingArray) &&
        columnSortingArray.length > 0 &&
        columnSortingArray) ||
      null;

    if (!orderIds) {
      return checkboxCol ? [checkboxCol, ...others] : others;
    }

    const map = new Map(others.map((c) => [getId(c), c]));
    const ordered = orderIds.map((id) => map.get(id)).filter(Boolean);
    const remaining = others.filter((c) => !orderIds.includes(getId(c)));

    return checkboxCol
      ? [checkboxCol, ...ordered, ...remaining]
      : [...ordered, ...remaining];
  }, [allColumns, userSortingArray, columnSortingArray]);

  /** Visibility (unchanged) */
  const visibleSortedColumns = useMemo(() => {
    const getId = (c) => c?.id ?? c?.column_id;

    let cols = isAdmin
      ? sortedAllColumns
      : sortedAllColumns.filter((c) => c?.permission !== "not_viewable");

    if (Array.isArray(columnVisibility) && columnVisibility.length > 0) {
      cols = cols.filter((col) => {
        const id = getId(col);
        if (id === "_checkbox" || id === "actions") return true;
        return columnVisibility.includes(id);
      });
    }

    return cols;
  }, [sortedAllColumns, columnVisibility, isAdmin]);

  const handleSelectAll = () => {
    let newSet;

    if (isAllSelected) {
      newSet = new Set();
    } else {
      newSet = new Set(data.map((row) => row.id));
    }

    setSelectedRows(newSet);
    setIsAllSelected(!isAllSelected);

    onSelectionChange && onSelectionChange([...newSet]);
    onSelectionCountChange && onSelectionCountChange(newSet.size);
  };

  const handleRowSelect = (rowId, checked) => {
    const newSet = new Set(selectedRows);
    checked ? newSet.add(rowId) : newSet.delete(rowId);

    setSelectedRows(newSet);
    setIsAllSelected(newSet.size === data.length);

    onSelectionChange && onSelectionChange([...newSet]);
    onSelectionCountChange && onSelectionCountChange(newSet.size);
  };

  const renderCheckbox = (row) => {
    if (row) {
      return (
        <input
          type="checkbox"
          checked={selectedRows.has(row.id)}
          onChange={(e) => handleRowSelect(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    const checked = isAllSelected;
    const indeterminate =
      selectedRows.size > 0 && selectedRows.size < data.length;

    return (
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => el && (el.indeterminate = indeterminate)}
        onChange={handleSelectAll}
      />
    );
  };

  const renderActionIcons = (row) => {
    if (!enableActions || resolvedActionButtons.length === 0) return null;

    return (
      <div className="action-icons">
        {resolvedActionButtons.includes("view") && (
          <FaEye
            className="action-icon view"
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("view", row);
            }}
          />
        )}

        {resolvedActionButtons.includes("edit") && (
          <FaEdit
            className="action-icon edit"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("edit", row);
            }}
          />
        )}

        {resolvedActionButtons.includes("duplicate") && (
          <FaCopy
            className="action-icon duplicate"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("duplicate", row);
            }}
          />
        )}

        {resolvedActionButtons.includes("delete") && (
          <FaTrash
            className="action-icon delete"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("delete", row);
            }}
          />
        )}

        {resolvedActionButtons.includes("apply") && (
          <FaFileSignature
            className="action-icon apply"
            title="Apply"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("apply", row);
            }}
          />
        )}
      </div>
    );
  };

  const handleSort = (column) => {
    if (!sortable) return;

    const key = column.id ?? column.column_id;
    const newOrder =
      currentSortConfig.id === key && currentSortConfig.order === "asc"
        ? "desc"
        : "asc";

    onSort?.({ id: key, order: newOrder });
  };

  const renderSortIcon = (column) => {
    const key = column.id ?? column.column_id;

    if (currentSortConfig.id !== key) return <FaSort />;

    return currentSortConfig.order === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const getRowStyle = useMemo(() => {
    return (row) => {
      const alertColumn = dynamicColumns.find((c) => c.field_type === "alert");
      if (!alertColumn) return {};

      const rawData = row.raw || [];
      const alertRaw = rawData.find(
        (d) => d.column_id === alertColumn.column_id,
      );

      let alertValue;
      try {
        alertValue = safeParseJSON(alertRaw);
      } catch {
        alertValue = null;
      }

      const isDone =
        alertValue === undefined ||
        alertValue === null ||
        alertValue?.row_value?.date === "" ||
        alertValue?.row_value?.is_complete;
      if (isDone) return { backgroundColor: "#fff" };

      const date = moment(alertValue?.date);
      const diff = date.isValid() ? date.diff(moment(), "days") : Infinity;

      const sortedOptions = [...(alertColumn.options || [])].sort(
        (a, b) => a.value - b.value,
      );

      const match = sortedOptions.find((o) => diff <= o.value);

      return { backgroundColor: match?.fillColor || "#fff" };
    };
  }, [dynamicColumns]);

  const formatDate = (d) =>
    !d ? "-" : moment(d).format("DD/MM/YYYY HH:mm:ss");

  const formatUser = (userId) => {
    if (!userId || !Array.isArray(allCompanyUsers)) return "-";

    const user = allCompanyUsers.find((u) => u.user_id === userId);

    if (!user) return "-";

    return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  };

  const renderCellContent = (row, column, setRtePreviewContent) => {
    const getCellValue = () => {
      if (column.field_type === "_checkbox" || column.field_type === "action")
        return null;

      if (column.column_id) {
        const raw = row.raw?.find(
          (x) => x.column_id === column.column_id,
        )?.row_value;
        if (raw !== undefined && raw !== null) return raw;
      }

      if (row[column.id] !== undefined) return row[column.id];

      return undefined;
    };

    const value = getCellValue();

    switch (column.field_type) {
      case "_checkbox":
        return renderCheckbox(row);

      case "action":
        return renderActionIcons(row);

      case "user":
        return formatUser(value);

      case "date":
        return formatDate(value);

      case "rich_text":
        const style = {
          backgroundColor: "#eef2ff",
          color: "#3730a3",
          cursor: "pointer",
        };

        if (!value) return <span>No data</span>;
        return (
          <div
            className="dropdown-chip-group"
            onClick={() => {
              setRtePreviewContent(value);
            }}
          >
            <span className="dropdown-chip" style={style}>
              Preview
            </span>
          </div>
        );

      case "link":
        return (
          <a href={`${value}`} target={"_blank"}>
            {value}
          </a>
        );

      case "handler":
        return row.handler_name || "-";

      case "dropdown": {
        const opts = column.options || [];

        // multi select
        if (Array.isArray(value)) {
          if (!value.length) return <span>-</span>;

          return (
            <div className="dropdown-chip-group">
              {value.map((item, index) => {
                const val = item?.value ?? item;
                const label = item?.label ?? item;

                const found = opts.find(
                  (o) => o.value === val || o.name === val,
                );

                const style = {
                  backgroundColor: found?.fillColor || "#f0f0f0",
                  color: found?.color || "#333",
                  border: `1px solid ${found?.color || "#ccc"}`,
                };

                return (
                  <span
                    key={`${val}-${index}`}
                    style={style}
                    className="dropdown-chip"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          );
        }

        // single select
        const found = opts.find((o) => o.value === value || o.name === value);

        const style = {
          backgroundColor: found?.fillColor || "#f0f0f0",
          color: found?.color || "#333",
          border: `1px solid ${found?.color || "#ccc"}`,
        };

        return (
          <span className="dropdown-chip" style={style}>
            {value || "-"}
          </span>
        );
      }

      case "checkbox":
        const parsedValue =
          typeof value === "string" ? JSON.parse(value) : value;

        if (Array.isArray(parsedValue)) {
          if (!parsedValue.length) return <span>-</span>;

          return <span>{parsedValue.join(", ")}</span>;
        }

        return <span>-</span>;

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

      default:
        return value ?? "-";
    }
  };

  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  const generatePageNumbers = (current, total) => {
    const pages = [];
    const max = 5;

    if (total <= max) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current <= 3) end = 4;
    if (current >= total - 2) start = total - 3;

    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("...");

    pages.push(total);
    return pages;
  };

  const handleResizeStart = (columnId, e) => {
    e.preventDefault();
    e.stopPropagation();

    setResizing(columnId);
    setStartX(e.clientX);
    setStartWidth(getColumnWidth(columnId));
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + deltaX); // min width

      setColumnWidths((prev) => ({
        ...prev,
        [resizing]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, startX, startWidth, setColumnWidths]);

  return (
    <Fragment>
      <div className="reusable-table-container">
        {/* Selection Summary */}
        {selectable && (
          <div className="table-selection-summary">
            {selectedRows.size > 0 && (
              <span className="selected-info" style={{ marginRight: 8 }}>
                Selected {selectedRows.size}
              </span>
            )}
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, effectiveTotalItems)} of{" "}
            {effectiveTotalItems} entries
          </div>
        )}

        <div className="table-scroll-container">
          <div className="table-header-wrapper" ref={headerRef}>
            <table className="reusable-table">
              <thead>
                <tr>
                  {visibleSortedColumns.map((col) => {
                    const isFiltered = filters.some(
                      (f) => f.column_id === col.id,
                    );

                    return (
                      <th
                        key={col.id}
                        className={`table-header ${sortable ? "sortable" : ""} ${
                          col.fixed ? "fixed-column" : ""
                        }`}
                        data-fixed={col.fixedPosition}
                        style={{ width: `${getColumnWidth(col.id)}px` }}
                        onClick={() => {
                          if (resizing) return;

                          if (col.id !== "_checkbox" && col.id !== "actions") {
                            handleSort(col);
                          }
                        }}
                      >
                        <div className="header-content">
                          {col.field_type === "_checkbox" ? (
                            renderCheckbox()
                          ) : (
                            <>
                              {filter ? (
                                <div className="header-label-wrapper">
                                  <span className="header-label">
                                    {col.label}
                                  </span>

                                  <span
                                    className={`column-filter-arrow ${isFiltered ? "active" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openColumnFilter(col, e);
                                    }}
                                  >
                                    ▾
                                  </span>
                                </div>
                              ) : (
                                <span className="header-label">
                                  {col.label}
                                </span>
                              )}
                              {sortable &&
                                col.field_type !== "action" &&
                                renderSortIcon(col)}
                            </>
                          )}
                        </div>

                        {resizable &&
                          col.field_type !== "checkbox" &&
                          col.field_type !== "action" && (
                            <div
                              className="column-resizer"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleResizeStart(col.id, e);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            </table>
          </div>

          {/* BODY */}
          <div className="table-body-wrapper" onScroll={onScroll}>
            <table className="reusable-table">
              <tbody>
                <tr style={{ height: visibleRange.startIndex * rowHeight }} />

                {data
                  .slice(visibleRange.startIndex, visibleRange.endIndex)
                  .map((row, i) => {
                    const rowIndex = visibleRange.startIndex + i;
                    const style = getRowStyle(row);

                    return (
                      <tr
                        ref={i === 0 ? rowMeasureRef : null}
                        key={row.id || rowIndex}
                        className={`${selectable ? "selectable-row" : ""} ${
                          selectedRows.has(row.id) ? "selected-row" : ""
                        }`}
                        style={style}
                        onClick={() => onRowClick?.(row)}
                      >
                        {visibleSortedColumns.map((col) => (
                          <td
                            key={col.id}
                            className={`table-cell ${
                              col.fixed ? "fixed-column" : ""
                            }`}
                            style={{ width: getColumnWidth(col.id) }}
                            data-fixed={col.fixedPosition}
                          >
                            {renderCellContent(row, col, setRtePreviewContent)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                <tr
                  style={{
                    height: (data.length - visibleRange.endIndex) * rowHeight,
                  }}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {filterColumn && (
        <ColumnFilterPopover
          column={filterColumn}
          anchorEl={filterAnchor}
          existingFilter={filters?.find(
            (f) => f.column_id === filterColumn?.id,
          )}
          onClose={() => setFilterColumn(null)}
          onApply={(filter) => {
            onColumnFilter?.(filter);
            setFilterColumn(null);
          }}
          fixedColumns={fixedColumns}
        />
      )}

      {pagination && totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info"></div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
              <FaChevronLeft />
            </button>

            <button
              className="pagination-btn"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {generatePageNumbers(currentPage, totalPages).map((page, i) => (
              <button
                key={i}
                className={`pagination-btn ${
                  page === currentPage ? "active" : ""
                } ${page === "..." ? "ellipsis" : ""}`}
                disabled={page === "..."}
                onClick={() => page !== "..." && onPageChange?.(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>

            <button
              className="pagination-btn"
              onClick={() => onPageChange?.(totalPages)}
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

export default React.memo(ReusableTable);
