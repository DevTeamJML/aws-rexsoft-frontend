export const MultilineField = ({
  label,
  value,
  type,
  onChange,
  width,
  required,
  disable,
  minHeight
}) => {
  return (
    <div
      className="multiline-container"
      style={{
        width: width,
      }}
    >
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>
      <textarea
        style={{
          minHeight: minHeight,
        }}
        disabled={disable}
        className={`multiline-box ${disable ? "disabled-multiline-box" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
