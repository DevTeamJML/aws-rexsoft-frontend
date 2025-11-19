export const MultilineField = ({
  label,
  value,
  onChange,
  width,
  required,
  placeholder,
  rows = 4,
}) => {
  return (
    <div className="textarea-container" style={{ width: width }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>
      <textarea
        className="textarea-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};