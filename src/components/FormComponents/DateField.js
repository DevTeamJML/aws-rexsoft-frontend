import moment from "moment";
import dynamic from "next/dynamic";
import { Fragment, useRef } from "react";

export const DateField = ({
  label,
  value,
  onChange,
  width,
  required,
  type = "date",
}) => {
  
  const formatDate = (val) => {
    if (!val) return "";

    if (type === "datetime-local") {
      return moment(val).format("YYYY-MM-DDTHH:mm");
    }

    return moment(val).format("YYYY-MM-DD");
  };

  const inputRef = useRef(null);

  const handleFocus = () => {
    if (inputRef.current && typeof inputRef.current.showPicker === "function") {
      inputRef.current?.showPicker();
    }
  };

  return (
    <Fragment>
      <div className="date-box" onClick={handleFocus}>
        {label ? (
          <label className="input-label">
            {label}
            <span className="required-asterisk">{required ? "*" : null}</span>
          </label>
        ) : null}
        <input
          ref={inputRef}
          className="date-field"
          type={type ? type : "date"}
          value={formatDate(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Fragment>
  );
};
