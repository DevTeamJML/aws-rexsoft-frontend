import { useEffect, useState } from "react";

export const ActionButton = ({
  label,
  width,
  height = "",
  onClick = () => {},
  type = "",
  style,
  externalClass = ""
}) => {
  return (
    <button
      className={`reusable-button ${type} ${externalClass}`.trim()}
      style={{
        width,
        height,
        transition: "background 0.2s ease",
        ...style
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
