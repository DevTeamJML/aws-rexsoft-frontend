import {
  getColumnType,
  shouldShowDateRange,
  shouldShowDropdownOptions,
  shouldShowNumberRange,
  shouldShowSearchField,
} from "@/utils/clientFilterUtils";
import React, { useEffect, useRef, useState } from "react";
import { FaCalendar, FaSearch } from "react-icons/fa";

export default function ColumnFilterPopover({
  column,
  anchorEl,
  existingFilter,
  onClose,
  onApply,
}) {
  const popoverRef = useRef(null);

  const [filterType, setFilterType] = useState(
    existingFilter?.filterType || "all",
  );

  const [searchText, setSearchText] = useState(
    existingFilter?.searchText || "",
  );

  const [selectedOptions, setSelectedOptions] = useState(
    existingFilter?.selectedOptions || [],
  );

  const [minValue, setMinValue] = useState(existingFilter?.minValue || "");

  const [maxValue, setMaxValue] = useState(existingFilter?.maxValue || "");

  const [startDate, setStartDate] = useState(existingFilter?.startDate || "");

  const [endDate, setEndDate] = useState(existingFilter?.endDate || "");

  const toggleOption = (value) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const options = column?.options || [];

  const rect = anchorEl?.getBoundingClientRect();

  const style = rect
    ? {
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left - 100, // move left
        zIndex: 2000,
      }
    : {};

  const columnType = getColumnType(column, [], []);

  const showSearch = shouldShowSearchField(columnType);
  const showDropdown = shouldShowDropdownOptions(columnType, options);
  const showNumber = shouldShowNumberRange(columnType, column?.id);
  const showDate = shouldShowDateRange(columnType);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={popoverRef} className="column-filter-popover" style={style}>
      {/* Header */}
      <div className="filter-header">
        <span>Filters</span>
      </div>

      {showSearch && (
        <div className="filter-field">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filled / Unfilled */}
      <div className="filter-field">
        <label>Filter Type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="filled">Filled</option>
          <option value="unfilled">Unfilled</option>
        </select>
      </div>

      {showDropdown && (
        <div className="filter-field">
          <label>Select Options</label>
          <div className="dropdown-options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                className={`dropdown-option-btn ${selectedOptions.includes(option.value) ? "selected" : ""}`}
                onClick={() => toggleOption(option.value)}
              >
                {option.value}
              </button>
            ))}
          </div>
          {selectedOptions && selectedOptions.length > 0 && (
            <div className="selected-options-info">
              <strong>Selected:</strong> {selectedOptions.join(", ")}
            </div>
          )}
        </div>
      )}

      {showNumber && (
        <div className="number-range-fields">
          <div className="filter-field">
            <label>Min Value</label>
            <input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label>Max Value</label>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
            />
          </div>
        </div>
      )}

      {showDate && (
        <div className="date-range-fields">
          <div className="filter-field">
            <label>Start Date</label>
            <div className="date-input-wrapper">
              <FaCalendar className="date-icon" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-field">
            <label>End Date</label>
            <div className="date-input-wrapper">
              <FaCalendar className="date-icon" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="popover-footer">
        <button className="btn-clear" onClick={onClose}>
          Cancel
        </button>

        <button
          className="btn-apply"
          onClick={() =>
            onApply({
              column_id: column.id,
              filterType,
              searchText,
              selectedOptions,
            })
          }
        >
          Apply
        </button>
      </div>
    </div>
  );
}
