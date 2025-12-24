import { useState, useMemo } from "react";
import MultiSelectDropdownField from "./MultiSelectDropdownField";

/**
 * value: string[]
 * options: string[] | { label, value }[]
 */
export default function CreatableMultiSelectDropdownField({
  value = [],
  options = [],
  placeholder = "Select or type...",
  onChange,
  onRemove,
  width,
}) {
  // Normalize options to string[]
  const normalizedOptions = useMemo(() => {
    return options.map((o) => (typeof o === "string" ? o : o.value));
  }, [options]);

  const handleChange = (val) => {
    onChange?.(val); // emit string
  };

  const handleRemoveInternal = (val) => {
    onRemove?.(val);
  };

  return (
    <MultiSelectDropdownField
      selected={value}                 // string[]
      options={normalizedOptions}      // string[]
      placeholder={placeholder}
      width={width}
      onChange={handleChange}
      onRemove={handleRemoveInternal}
    />
  );
}
