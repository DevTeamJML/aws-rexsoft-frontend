import { useState, useEffect } from "react";

export const SearchDropdownField = ({
  dropdownList = [],
  value,
  onChange,
  width,
}) => {
  const [showList, setShowList] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Sync input text when value changes (selection)
  useEffect(() => {
    setSearchText(value ?? "");
  }, [value]);

  const filtered = dropdownList.filter((opt) => {
    const label = opt.label ?? opt.value ?? opt;
    return label
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });

  return (
    <div
      className="reusable-search-dropdown"
      style={{ width, position: "relative" }}
    >
      <input
        type="text"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setShowList(true);
        }}
        onFocus={() => {
          setSearchText("");    
          setShowList(true);
        }}
        onBlur={() => setTimeout(() => setShowList(false), 200)}
      />

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
                  onChange(optionValue); // actual selected value
                  setSearchText(optionLabel);
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
