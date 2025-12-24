export const DropdownField = ({
  label,
  dropdownList,
  onChange,
  width,
  value,
  required,
}) => {
  return (
    <div className="reusable-dropdown" style={{ width: width }}>
      {label ? (
        <label className="input-label">
          {label}
          <span className="required-asterisk">{required ? "*" : null}</span>
        </label>
      ) : null}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option key={0} value={""}></option>
        {dropdownList && dropdownList.length
          ? dropdownList.map((option, index) => {
              const optionValue = option.value ?? option;
              const optionLabel = option.label ?? option;
              return (
                <option key={index + 1} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })
          : null}
      </select>
    </div>
  );
};
