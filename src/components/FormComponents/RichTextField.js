import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const decodeHTML = (html) => {
  if (typeof html !== "string") return "";
  if (!html.includes("&lt;")) return html;

  if (typeof window === "undefined") return html;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};

export const RichTextField = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = null,
}) => {
  const decodedValue = useMemo(() => decodeHTML(value), [value]);

  return (
    <div className={`rich-text-field ${error ? "has-error" : ""}`}>
      <ReactQuill
        theme="snow"
        value={decodedValue}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        }}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};
