import dynamic from "next/dynamic";
import { useRef } from "react";

export const TimeField = ({
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
    <div className="time-container" style={{ width: width }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>
      <div className="time-box"
        onClick={() => handleFocus()}
      >
        <input
          ref={inputRef}
          className="time-field"
          type="time"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
