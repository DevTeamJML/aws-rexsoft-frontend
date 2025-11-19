export const DropdownField = ({ 
  label,
  dropdownList,
  onChange,
  width,
  value,
  required,
}) => {
  return (
    <div 
      className="reusable-dropdown"
      style={{ width: width }}
    >
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {(dropdownList && dropdownList.length) 
          ? dropdownList.map((option, index) => {
              const optionValue = option.value ?? option;   // fallback for string arrays
              const optionLabel = option.label ?? option;   // show label if provided
              return (
                <option key={index} value={optionValue}>
                  {optionLabel}
                </option>
              );
          }) 
          : null}
      </select>
    </div>
  );
};
