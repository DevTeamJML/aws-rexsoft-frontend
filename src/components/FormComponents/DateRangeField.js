
import React from "react";

export default function DateRangeField({ onChange, value = { startDate: "", endDate: "" } }) {
  const handleStartDateChange = (e) => {
    onChange?.({ startDate: e.target.value, endDate: value.endDate });
  };

  const handleEndDateChange = (e) => {
    onChange?.({ startDate: value.startDate, endDate: e.target.value });
  };

  return (
    <div className="start-end-fields">
      <input
        type="date"
        value={value.startDate ?? ""}
        onChange={handleStartDateChange}
        onWheel={(e) => e.target.blur()}
      />
      <span className="separator">-</span>
      <input
        type="date"
        value={value.endDate ?? ""}
        onChange={handleEndDateChange}
        onWheel={(e) => e.target.blur()}
      />
    </div>
  );
}
