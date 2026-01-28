import { useMemo } from "react";

export const MultipleChoiceField = ({
  label = "test",
  selected = [],
  options = [],
  onChange,
  width,
  required,
  value = "",
}) => {
  const normalizedOption = useMemo(() => {
    return options.map((opt) => {
      const label = opt.label ?? opt;
      const value = opt.value ?? opt;

      return label;
    });
  }, [options]);

  return (
    <div className="choice-container" style={{ width: width }}>
      {normalizedOption.map((opt) => {
        return (
          <div className="choice-input">
            <input
              className="choice-field"
              type="radio"
              checked={selected === opt}
              value={opt}
              onChange={(e) => onChange(opt)}
            />
            <label className="input-label">
              {opt}
              <span className="required-asterisk">{required ? "*" : null}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
};
