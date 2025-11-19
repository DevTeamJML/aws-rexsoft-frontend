import { useEffect, useState } from "react";

export const InputColor = ({ 
  placeholder="",
  value = "", 
  onChange, 
  className = "",
  label = "",
  type = "custom", // "primary" | "secondary" | "custom"
  ...props 
}) => {
  return (
    <div className={`input-color-container ${className}`}>
      {label && <label className="input-color-label">{label}</label>}
      <div className="color-pickers">
        <div 
          className={`color-picker ${type}`}
          style={type === "custom" ? { background: value } : {}}
        >
          <input
            title={placeholder}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)} 
            className="color-input"
            {...props}
          />
        </div>
      </div>
    </div>
  );
};
