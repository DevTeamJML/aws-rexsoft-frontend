"use client";
import { FaTimesCircle } from "react-icons/fa";
import { useState, useMemo, useRef, useEffect } from "react";

export default function MultiSelectDropdownField({
  selected = [],
  options = [],
  placeholder = "Select...",
  onChange = () => {},
  width
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(
      (opt) =>
        opt.toLowerCase().includes(search.toLowerCase()) &&
        !selected.includes(opt)
    );
  }, [options, search, selected]);

  const toggleSelect = (option) => {
    onChange(option);
    // setSelected((prev) => {
    //   const newSelected = prev.includes(option)
    //     ? prev.filter((o) => o !== option)
    //     : [...prev, option];

    //   return newSelected;
    // });
    setSearch("");
  };

  const removeSelected = (option) => {
    onChange(option);
    // setSelected((prev) => {
    //   const newSelected = prev.filter((o) => o !== option);
    //   onChange(newSelected);
    //   return newSelected;
    // });
  };

  return (
    <div className="multi-select" ref={dropdownRef} style={{width : width}}>
      {/* Input + selected items */}
      <div className="multi-select-input">
        {selected.map((item) => (
          <div key={item} className="chip">
            <span>{item}</span>
            <div
              className="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeSelected(item);
              }}
            >
              <FaTimesCircle />
            </div>
          </div>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="multi-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li key={opt} onClick={() => toggleSelect(opt)}>
                {opt}
              </li>
            ))
          ) : (
            <li className="no-results">No results</li>
          )}
        </ul>
      )}
    </div>
  );
}
