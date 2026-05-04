import React, { useState } from "react";
import { FaPlus, FaTimes, FaSearch, FaCalendar } from "react-icons/fa";
import { v4 } from "uuid";
import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";

export default function FilterDrawer({
  open,
  onClose,
  dynamicColumns = [],
  fixedColumns = [],
  filters,
  setFilters,
  onApplyFilters,
}) {
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: v4(),
        column_id: "",
        filterType: "all", // all, filled, unfilled
        searchText: "",
        startDate: "",
        endDate: "",
        minValue: "",
        maxValue: "",
        selectedOptions: [], // New key for dropdown selections
      },
    ]);
  };

  const removeFilter = (filterId) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const updateFilter = (filterId, field, value) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId ? { ...filter, [field]: value } : filter,
      ),
    );
  };

  // New function to handle dropdown option selection
  const handleOptionSelection = (filterId, optionValue) => {
    setFilters((prev) =>
      prev.map((filter) => {
        if (filter.id !== filterId) return filter;

        const currentSelected = filter.selectedOptions || [];
        const isSelected = currentSelected.includes(optionValue);

        let newSelected;
        if (isSelected) {
          // Remove option if already selected
          newSelected = currentSelected.filter((val) => val !== optionValue);
        } else {
          // Add option if not selected
          newSelected = [...currentSelected, optionValue];
        }

        return {
          ...filter,
          selectedOptions: newSelected,
          searchText: newSelected.join(","), // Keep searchText for backward compatibility
        };
      }),
    );
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearAll = () => {
    setFilters([]);
    onApplyFilters([]);
  };

  // Combine dynamic and fixed columns for the dropdown
  const allColumns = [...fixedColumns, ...dynamicColumns];

  return (
    <>
      <div
        className={`drawer-overlay ${open ? "active" : ""}`}
        onClick={onClose}
      ></div>

      <div className={`filter-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Filters</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-content">
          <span
            className="clear-text"
            onClick={() => {
              handleClearAll();
            }}
          >
            Clear All
          </span>
          {/* Add Filter Button */}
          <div className="add-filter-section">
            <button className="add-filter-btn" onClick={addFilter}>
              <FaPlus />
              Add Filter
            </button>
          </div>

          {/* Filter Blocks */}
          <div className="filters-container">
            {filters.map((filter) => (
              <FilterBlock
                key={filter.id}
                filter={filter}
                dynamicColumns={dynamicColumns}
                fixedColumns={fixedColumns}
                onUpdate={(field, value) =>
                  updateFilter(filter.id, field, value)
                }
                onOptionSelect={(optionValue) =>
                  handleOptionSelection(filter.id, optionValue)
                }
                onRemove={() => removeFilter(filter.id)}
              />
            ))}
          </div>
        </div>

        <div className="drawer-footer">
          {/* <button className="btn-clear" onClick={handleClearAll}>
            Clear All
          </button> */}
          <button className="btn-apply" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// Individual Filter Block Component
const FilterBlock = ({
  filter,
  dynamicColumns,
  fixedColumns,
  onUpdate,
  onOptionSelect,
  onRemove,
}) => {
  const allUsers = useSelectAllCompanyUsers();

  const userMap = allUsers.reduce((acc, user) => {
    acc[user.uid] = user.displayName;
    return acc;
  }, {});

  const getColumnType = (column_id) => {
    // Check fixed columns first
    const fixedColumn = fixedColumns.find((col) => col.id === column_id);
    if (fixedColumn) return fixedColumn.field_type;

    // Then check dynamic columns
    const dynamicColumn = dynamicColumns.find(
      (col) => col.column_id === column_id,
    );
    return dynamicColumn?.field_type || "";
  };

  const getColumn = (column_id) => {
    // Check fixed columns first
    const fixedColumn = fixedColumns.find((col) => col.id === column_id);
    if (fixedColumn) return fixedColumn;

    // Then check dynamic columns
    const dynamicColumn = dynamicColumns.find(
      (col) => col.column_id === column_id,
    );
    return dynamicColumn;
  };

  const column = getColumn(filter.column_id);
  const columnType = getColumnType(filter.column_id);

  // Check if this is a fixed column
  const isFixedColumn = fixedColumns.some((col) => col.id === filter.column_id);

  // Parse dropdown options
  const getDropdownOptions = () => {
    if (columnType === "handler") {
      const options = allUsers.map((curr) => ({
        label: curr.displayName,
        value: curr.uid,
      }));

      return options;
    }

    if (columnType !== "dropdown" || !column || !column.options) return [];

    try {
      // If options is already an array, return it
      if (Array.isArray(column.options)) {
        return column.options;
      }

      // If options is a string, try to parse it as JSON
      if (typeof column.options === "string") {
        return JSON.parse(column.options);
      }

      return [];
    } catch (error) {
      console.error("Error parsing dropdown options:", error);
      return [];
    }
  };

  const dropdownOptions = getDropdownOptions();

  // Check if an option is selected
  const isOptionSelected = (optionValue) => {
    return (filter.selectedOptions || []).includes(optionValue);
  };

  // Check if this column type should show search field
  const shouldShowSearchField = () => {
    const textBasedTypes = [
      "short_text",
      "multiline",
      "rich_text",
      "alert",
      "dropdown",
      "number",
      "text", // For fixed columns like serial_number
    ];
    return textBasedTypes.includes(columnType);
  };

  // Check if this column type should show dropdown options
  const shouldShowDropdownOptions = () => {
    return (
      (columnType === "dropdown" || columnType === "handler") &&
      dropdownOptions.length > 0
    );
  };

  // Check if this column type should show number range
  const shouldShowNumberRange = () => {
    return columnType === "number" || column?.id === "serial_number";
  };

  // Check if this column type should show date range
  const shouldShowDateRange = () => {
    return columnType === "date";
  };

  // Combine all columns for the dropdown
  const allColumns = [...fixedColumns, ...dynamicColumns];

  return (
    <div className="filter-block">
      <div className="filter-header">
        <span>Filter</span>
        <button className="remove-filter" onClick={onRemove}>
          <FaTimes size={16} />
        </button>
      </div>

      {/* Column Selection */}
      <div className="filter-field">
        <label>Column</label>
        <select
          value={filter.column_id}
          onChange={(e) => onUpdate("column_id", e.target.value)}
        >
          <option value="">Select Column</option>
          {/* Fixed Columns Group */}
          {fixedColumns.length > 0 && (
            <optgroup label="Fixed Columns">
              {fixedColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.label}
                </option>
              ))}
            </optgroup>
          )}
          {/* Dynamic Columns Group */}
          {dynamicColumns.length > 0 && (
            <optgroup label="Custom Columns">
              {dynamicColumns.map((column) => (
                <option key={column.column_id} value={column.column_id}>
                  {column.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Filter Type (All, Filled, Unfilled) - Only for dynamic columns */}
      {/* {filter.column_id && !isFixedColumn && ( */}
      <div className="filter-field">
        <label>Filter Type</label>
        <select
          value={filter.filterType}
          onChange={(e) => onUpdate("filterType", e.target.value)}
        >
          <option value="all">All</option>
          <option value="filled">Filled</option>
          <option value="unfilled">Unfilled</option>
        </select>
      </div>
      {/* )} */}

      {/* Search Text (for all text-based columns except dropdown) */}
      {filter.column_id && shouldShowSearchField() && (
        <div className="filter-field">
          <label>
            {columnType === "handler" ? "Search Handler" : "Search"}
          </label>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={
                columnType === "handler"
                  ? "Search handler names..."
                  : "Search..."
              }
              value={filter.searchText}
              onChange={(e) => onUpdate("searchText", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Dropdown Options (for dropdown columns) */}
      {filter.column_id && shouldShowDropdownOptions() && (
        <div className="filter-field">
          <label>Select Options</label>
          <div className="dropdown-options-grid">
            {dropdownOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                className={`dropdown-option-btn ${isOptionSelected(option.value) ? "selected" : ""}`}
                onClick={() => onOptionSelect(option.value)}
              >
                {filter.column_id === "handler" ? option.label : option.value}
              </button>
            ))}
          </div>
          {filter.selectedOptions && filter.selectedOptions.length > 0 && (
            <div className="selected-options-info">
              <strong>Selected:</strong>{" "}
              {filter.column_id === "handler"
                ? filter.selectedOptions
                    .map((opt) => userMap[opt] || "")
                    .filter(Boolean)
                    .join(", ")
                : filter.selectedOptions.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Number Range (for number columns) */}
      {filter.column_id && shouldShowNumberRange() && (
        <div className="number-range-fields">
          <div className="filter-field">
            <label>Min Value</label>
            <input
              type="number"
              placeholder="Minimum"
              value={filter.minValue}
              onChange={(e) => onUpdate("minValue", e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label>Max Value</label>
            <input
              type="number"
              placeholder="Maximum"
              value={filter.maxValue}
              onChange={(e) => onUpdate("maxValue", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Date Range (for date columns) */}
      {filter.column_id && shouldShowDateRange() && (
        <div className="date-range-fields">
          <div className="filter-field">
            <label>Start Date</label>
            <div className="date-input-wrapper">
              <FaCalendar className="date-icon" />
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => onUpdate("startDate", e.target.value)}
              />
            </div>
          </div>
          <div className="filter-field">
            <label>End Date</label>
            <div className="date-input-wrapper">
              <FaCalendar className="date-icon" />
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => onUpdate("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
