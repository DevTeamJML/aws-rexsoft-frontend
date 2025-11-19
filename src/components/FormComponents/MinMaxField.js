
import React from "react";

export default function MinMaxField({
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  onChange,
  value = { min: "", max: "" }
}) {
  const handleMinChange = (e) => {
    const newMin = e.target.value;
    onChange?.({ min: newMin, max: value.max });
  };

  const handleMaxChange = (e) => {
    const newMax = e.target.value;
    onChange?.({ min: value.min, max: newMax });
  };

  return (
    <div className="min-max-fields">
      <input
        type="number"
        placeholder={minPlaceholder}
        value={value.min ?? ""}
        onChange={handleMinChange}
        onWheel={(e) => e.target.blur()}
      />
      <span className="separator">-</span>
      <input
        type="number"
        placeholder={maxPlaceholder}
        value={value.max ?? ""}
        onChange={handleMaxChange}
        onWheel={(e) => e.target.blur()}
      />
    </div>
  );
}
