import { formatUrl } from "@/utils/format";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";

export const LinkField = ({ label, value, onChange, width, required }) => {
  const router = useRouter();
  const { id } = router.query;
  const [isEditing, setIsEditing] = useState(true);
  const hasInitialized = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && value !== undefined) {
      setLoaded(true);
    }
  }, [value]);

  useEffect(() => {
    if (!hasInitialized.current && id && loaded) {
      if (value === "") {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
      hasInitialized.current = true;
    }
  }, [id, loaded]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter"  || e.keyCode === 13 || e.keyCode === 66) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="link-container" style={{ width, position: "relative" }}>
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>

      {isEditing ? (
        <input
          className="link-box"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="link-box">
          <div
            className="anchor-box"
            onClick={() => window.open(formatUrl(value))}
          >
            <input className="anchor-text" type="text" value={value} readOnly />
          </div>
          {
            <div className="link-edit-modal">
              <div onClick={handleEditClick} className="link-edit-btn">
                Edit Link
              </div>
            </div>
          }
        </div>
      )}
    </div>
  );
};
