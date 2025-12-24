import { DateField } from "@/components/FormComponents/DateField";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { MultilineField } from "@/components/FormComponents/MultilineField";
import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { SearchDropdownField } from "@/components/FormComponents/SearchDropdownField";
import { safeParseJSON } from "./validation";

const handleInputChange = (columnId, value, setFormData, isMulti = false) => {
  setFormData((prev) => {
    if (!isMulti) {
      return {
        ...prev,
        [columnId]: value,
      };
    }

    return {
      ...prev,
      [columnId]: prev[columnId].includes(value)
        ? prev[columnId].filter((o) => o.value !== value)
        : [...prev[columnId], value],
    };
  });
};

const handleRemoveDropdownValue = (columnId, value, setFormData) => {
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

export const renderClientInputField = (
  formData,
  column,
  setFormData,
  extraProps = {}
) => {
  const { disabled = false, error = null } = extraProps;

  const isMulti =
    column.field_type === "handler" || column.multi_select_dropdown;

  const commonProps = {
    value: formData[column.column_id] ?? (isMulti ? [] : ""),
    onChange: (value) =>
      handleInputChange(column.column_id, value, setFormData, isMulti),
    required: !!column.is_required,
    placeholder: `Enter ${column.label.toLowerCase()}`,
    disabled,
    error,
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

    case "alert": {
      const alertValue = formData[column.column_id] || {
        date: "",
        is_complete: false,
      };

      const handleDateChange = (date) => {
        const updatedValue = {
          ...alertValue,
          date,
        };
        commonProps.onChange(updatedValue);
      };

      const handleCompleteChange = (e) => {
        const updatedValue = {
          ...alertValue,
          is_complete: e.target.checked,
        };
        commonProps.onChange(updatedValue);
      };

      return (
        <div className="alert-field-content">
          <DateField
            {...commonProps}
            value={alertValue.date}
            onChange={handleDateChange}
            disabled={disabled}
          />

          <div className="alert-checkbox-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="alert-checkbox"
                checked={alertValue.is_complete}
                onChange={handleCompleteChange}
                disabled={disabled}
              />
              <span className="checkmark"></span>
              Completed
            </label>
          </div>
        </div>
      );
    }

    case "dropdown": {
      const dropdownOptions = parseDropdownOptions(column.options);

      if (column.multi_select_dropdown) {
        return (
          <MultiSelectDropdownField
            {...commonProps}
            options={dropdownOptions}
            selected={formData[column.column_id] || []}
            onRemove={(value) =>
              handleRemoveDropdownValue(column.column_id, value, setFormData)
            }
            disabled={disabled}
          />
        );
      }

      return (
        <SearchDropdownField
          {...commonProps}
          dropdownList={dropdownOptions}
          disabled={disabled}
        />
      );
    }

    case "handler": {
      const handlerOptions = parseDropdownOptions(column.options);
      return (
        <MultiSelectDropdownField
          {...commonProps}
          options={handlerOptions}
          selected={formData["handler"]}
          onRemove={(value) =>
            handleRemoveDropdownValue(column.column_id, value, setFormData)
          }
          disabled={disabled}
        />
      );
    }

    case "date":
      return <DateField {...commonProps} disabled={disabled} />;

    case "number":
      return (
        <PlainTextField {...commonProps} type="number" disabled={disabled} />
      );

    default:
      return (
        <PlainTextField
          {...commonProps}
          type="text"
          width={`100%`}
          disabled={disabled}
        />
      );
  }
};
