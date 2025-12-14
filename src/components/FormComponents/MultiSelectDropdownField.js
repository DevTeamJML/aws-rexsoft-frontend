
import { FaTimesCircle } from "react-icons/fa";
import { useState, useMemo, useRef, useEffect } from "react";

export default function MultiSelectDropdownField({
  selected = [],
  options = [],
  placeholder = "Select...",
  onChange = () => {},
  onRemove = () => {},
  width,
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
    return options.filter((opt) => {
      const optionValue = opt.value ?? opt; // fallback for string arrays
      const optionLabel = opt.label ?? opt;

      // Check if option matches search AND is not already selected
      return (
        (optionValue.toLowerCase().includes(search.toLowerCase()) ||
          optionLabel.toLowerCase().includes(search.toLowerCase())) &&
        !selected.some((selectedItem) => {
      
          const selectedValue = selectedItem.value ?? selectedItem;
          return selectedValue === optionValue;
        })
      );
    });
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
    onRemove(option);
    // setSelected((prev) => {
    //   const newSelected = prev.filter((o) => o !== option);
    //   onChange(newSelected);
    //   return newSelected;
    // });
  };

  return (
    <div className="multi-select" ref={dropdownRef} style={{ width: width }}>
      {/* Input + selected items */}
      <div className="multi-select-input">
        {options.map((item, index) => {
          const optionValue = item.value ?? item ;
          const optionLabel = item.label ?? item;
          if (selected.includes(optionValue)) {
            return (
              <div key={index} className="chip">
                <span>{optionLabel}</span>
                <div
                  className="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelected(optionValue);
                  }}
                >
                  <FaTimesCircle />
                </div>
              </div>
            );
          }
        })}
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
            filteredOptions.map((opt, index) => (
              <li key={index} onClick={() => toggleSelect(opt.value)}>
                {opt.label}
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
