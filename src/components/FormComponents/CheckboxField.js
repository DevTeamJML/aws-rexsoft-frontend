export const CheckboxField = ({ label, value, onChange, width, required }) => {
  return (
    <div className="checkbox-container" style={{ width: width }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>
        <input
        //   ref={inputRef}
          className="checkbox-field"
          type="checkbox"
          checked={value === 1 ? true : false}
          value={value}
          onChange={(e) => onChange(e.target.checked === true ? 1 : 0)}
        />
    </div>
  );
};
