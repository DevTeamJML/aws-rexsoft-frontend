import { formatNumber, unformatNumber } from "@/utils/format";
import { useMediaQuery } from "@mui/material";
import { FaAsterisk } from "react-icons/fa";

export const PlainTextField = ({
  label,
  value,
  type,
  onChange,
  width,
  required,
  disable,
  placeholder,
  generatePassword,
  ...props
}) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const handleWheel = (e) => {
    e.target.blur();
  };

  const renderNumberField = () => {
    const formattedNumber = formatNumber(value);
    return (
      <input
        placeholder={placeholder || ""}
        disabled={disable}
        className={`text-box ${disable ? "disabled-text-box" : ""}`}
        type="text"
        value={formattedNumber}
        onChange={(e) => {
          const raw = unformatNumber(e.target.value);
          if (!/^\d*(\.?\d{0,2})?$/.test(raw)) return;
          onChange(raw);
        }}
        onWheel={type === "number" ? handleWheel : undefined}
      />
    );
  };

  const renderTextField = () => {
    return (
      <input
        placeholder={placeholder || ""}
        disabled={disable}
        className={`text-box ${disable ? "disabled-text-box" : ""}`}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onWheel={type === "number" ? handleWheel : undefined}
      />
    );
  };

  const renderGeneratePasswordField = () => {
    const generateRandomPassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let pass = "";
      for (let i = 0; i < 12; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      onChange(pass);
    };

    return (
      <div className="generate-password-container">
        <input
          placeholder={placeholder || "Enter or generate password"}
          disabled={disable}
          className={`password-text-box ${
            disable ? "disabled-password-text-box" : ""
          }`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div
          className="generate-btn"
          onClick={generateRandomPassword}
          disabled={disable}
          title="Generate Password"
        >
          {isMobile ? <FaAsterisk /> : "Generate"}
        </div>
      </div>
    );
  };

  return (
    <div className="text-container" style={{ width }} {...props}>
      {label ? (
        <label className="input-label">
          {label}
          <span className="required-asterisk">{required ? "*" : null}</span>
        </label>
      ) : null}

      {generatePassword
        ? renderGeneratePasswordField()
        : type === "number"
        ? renderNumberField()
        : renderTextField()}
    </div>
  );
};
