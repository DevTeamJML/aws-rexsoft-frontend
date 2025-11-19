import { DateField } from "@/components/FormComponents/DateField";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { MultilineField } from "@/components/FormComponents/MultilineField";
import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";

const handleInputChange = (columnId, value, setFormData) => {
  if (columnId === "handler") {
    setFormData((prev) => ({
      ...prev,
      [columnId]: prev[columnId].includes(value)
        ? prev[columnId].filter((o) => o.value !== value)
        : [...prev[columnId], value],
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  }
};

const handleHandlerRemove = (columnId, value, setFormData) => {
  setFormData((prev) => ({
    ...prev,
    [columnId]: prev[columnId].filter((o) => o !== value),
  }));
};

// Parse dropdown options from string to array
const parseDropdownOptions = (optionsString) => {
  try {
    const options = optionsString;
    return options.map((option) => ({
      value: option.value || option.name || "",
      label: option.label || option.value || option.name || "",
    }));
  } catch (error) {
    console.error("Error parsing dropdown options:", error);
    return [];
  }
};

export const renderClientInputField = (formData, column, setFormData) => {
  const commonProps = {
    value: formData[column.column_id] || "",
    onChange: (value) =>
      handleInputChange(column.column_id, value, setFormData),
    required: column.is_required,
    placeholder: `Enter ${column.label.toLowerCase()}`,
  };

  switch (column.field_type) {
    case "multiline":
      return (
        <MultilineField
          {...commonProps}
          rows={4}
          placeholder={`Enter ${column.label}...`}
        />
      );

    case "rich_text":
      return (
        <MultilineField
          {...commonProps}
          rows={6}
          placeholder={`Enter ${column.label}...`}
        />
      );

    case "alert":
      // Get the alert value directly - backend will handle parsing
      const alertValue = formData[column.column_id] || {
        date: "",
        is_complete: false,
      };

      const handleDateChange = (date) => {
        // Update just the date field
        const updatedValue = {
          ...alertValue,
          date: date,
        };
        commonProps.onChange(updatedValue); // Use commonProps.onChange
      };

      const handleStatusChange = (e) => {
        // Update just the is_complete field
        const updatedValue = {
          ...alertValue,
          is_complete: e.target.checked,
        };
        commonProps.onChange(updatedValue); // Use commonProps.onChange
      };

      return (
        <div className="alert-field-content">
          <DateField
            {...commonProps}
            value={alertValue.date}
            onChange={handleDateChange} // Use the custom handler
          />
          <div className="alert-checkbox-container">
            <label className="checkbox-label">
              <input type="checkbox" className="alert-checkbox" />
              <span className="checkmark"></span>
              Completed
            </label>
          </div>
        </div>
      );

    case "dropdown":
      const dropdownOptions = parseDropdownOptions(column.options);
      return <DropdownField {...commonProps} dropdownList={dropdownOptions} />;

    case "handler":
      const handlerOptions = parseDropdownOptions(column.options);
      return (
        <MultiSelectDropdownField
          {...commonProps}
          options={handlerOptions}
          selected={formData["handler"]}
          onRemove={(value) =>
            handleHandlerRemove(column.column_id, value, setFormData)
          }
        />
      );

    case "date":
      return <DateField {...commonProps} />;

    case "number":
      return <PlainTextField {...commonProps} type="number" />;

    default:
      return <PlainTextField {...commonProps} type="text" width={`100%`} />;
  }
};
