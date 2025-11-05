"use client";
import React from "react";

export default function Drawer({ open, onClose, children }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${open ? "active" : ""}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`drawer ${open ? "open" : ""}`}
      >
        {/* <button className="drawer-close" onClick={onClose}>
          ✕
        </button> */}
        <div className="drawer-content">{children}</div>
      </div>
    </>
  );
}
