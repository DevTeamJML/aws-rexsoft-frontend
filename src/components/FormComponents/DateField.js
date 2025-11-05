import dynamic from "next/dynamic";
import { useRef } from "react";

export const DateField = ({
  label,
  value,
  onChange,
  width,
  required,
}) => {
  const inputRef = useRef(null);

  const handleFocus = () => {
    if (inputRef.current && typeof inputRef.current.showPicker === "function") {
      inputRef.current?.showPicker();
    }
  };

  return (
    <div className="date-container" style={{ width: width }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>
      <div className="date-box"
        onClick={() => handleFocus()}
      >
        <input
          ref={inputRef}
          className="date-field"
          type="date"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
