import { useState } from "react";

export const SearchDropdownField = ({
  dropdownList = [],
  label,
  value,
  onChange,
  width,
  required,
}) => {
  const [showList, setShowList] = useState(false);

  const filtered = dropdownList.filter((opt) => {
    const label = opt.label ?? opt.value ?? opt;
    return label.toLowerCase().includes((value ?? "").toLowerCase());
  });

  return (
    <div
      className="reusable-search-dropdown"
      style={{ width: width, position: "relative" }}
    >
      {/* text input */}
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 200)}
      />

      {/* dropdown suggestions */}
      {showList && filtered.length > 0 && (
        <div className="dropdown-suggestions">
          {filtered.map((option, index) => {
            const optionValue = option.value ?? option;
            const optionLabel = option.label ?? option;

            return (
              <div
                key={index}
                className="dropdown-option"
                onMouseDown={() => {
                  onChange(optionValue);
                  setShowList(false);
                }}
              >
                {optionLabel}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
