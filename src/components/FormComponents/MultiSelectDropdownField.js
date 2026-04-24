import { FaTimesCircle } from "react-icons/fa";
import { useState, useMemo, useRef, useEffect } from "react";

export default function MultiSelectDropdownField({
  selected = [],
  options = [],
  placeholder = "Select...",
  onChange = () => {},
  onRemove = () => {},
  onCreate,
  width,
  hasOthersInput,
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
    const normalized =
      typeof option === "object" ? option : { value: option, label: option };

    onChange(normalized);

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
        {selected.map((value, index) => {
          // const found = options.find((o) => (o.value ?? o) === value);

          // const label = found?.label ?? value;
          const valueKey = value?.value ?? value;

          const found = options.find((o) => (o.value ?? o) === valueKey);

          const label = value?.label ?? found?.label ?? valueKey;

          return (
            <div key={index} className="chip">
              <span>{label}</span>
              <div
                className="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelected(value);
                }}
              >
                <FaTimesCircle />
              </div>
            </div>
          );
        })}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              e.preventDefault();

              const newValue = search.trim();

              if (!selected.includes(newValue)) {
                onChange(newValue);
              }

              setSearch("");
              setOpen(false);
            }
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="multi-select-dropdown">

          {filteredOptions.map((opt, index) => (
            <li key={index} onClick={() => toggleSelect(opt)}>
              {opt.label}
            </li>
          ))}

          {/* Add custom option */}
          {hasOthersInput ?
            search.trim() &&
            !options.some(
              (opt) =>
                (opt.value ?? opt).toLowerCase() === search.toLowerCase(),
            ) &&
            !selected.some(
              (val) =>
                (val.value ?? val).toLowerCase() === search.toLowerCase(),
            ) && (
              <li
                className="create-option"
                onClick={() => {
                  const newValue = search.trim();

                  toggleSelect({
                    label: newValue,
                    value: newValue
                  });

                  setSearch("");
                  setOpen(false);
                }}
              >
                ➕ Add "{search}"
              </li>
            ) : null}

          {/* No results fallback */}
          {filteredOptions.length === 0 && !search && (
            <li className="no-results">No options</li>
          )}
        </ul>
      )}
    </div>
  );
}
