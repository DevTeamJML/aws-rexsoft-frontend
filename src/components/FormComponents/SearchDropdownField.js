"use client";
import { useState, useRef, useEffect, useMemo } from "react";

export default function SearchDropdownField({
  options = [],
  placeholder = "Select",
  onChange = () => {},
  width,
  label,
  required,
  value = "",
  returnFullObject = false, // New prop to toggle return type
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!search) {
      // Set search text based on current value
      if (returnFullObject && value && typeof value === 'object') {
        setSearch(value.label || "");
      } else {
        setSearch(value || "");
      }
    }
  }, [value, returnFullObject]);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    const lower = search.toLowerCase();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(lower)
    );
  }, [normalizedOptions, search]);

  const toggleSelect = (option) => {
    if (returnFullObject) {
      onChange(option); // Send back entire object
    } else {
      onChange(option.value); // Send back only value
    }
    setSearch(option.label); // Show the label
    setOpen(false);
  };

  return (
    <div className="search-dropdown-text-container" style={{ width }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>

      <div className="search-dropdown-multi-select" ref={dropdownRef}>
        <div className="multi-select-input">
          <input
            type="text"
            className="select-input"
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              if (val === "") {
                if (returnFullObject) {
                  onChange(null); // Send null when cleared
                } else {
                  onChange(""); // Send empty string when cleared
                }
              }
            }}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
          />
        </div>

        {open && (
          <ul className="multi-select-dropdown">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li key={opt.label} onClick={() => toggleSelect(opt)}>
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="no-results">No results</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}