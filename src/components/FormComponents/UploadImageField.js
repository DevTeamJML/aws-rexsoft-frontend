
import { useState } from "react";
import { FaUpload } from "react-icons/fa";

export default function UploadImageField({
  file,
  setFile,
  width,
  label,
  required,
}) {
  //   const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const reader = new FileReader();
    reader.readAsDataURL(selected);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let { width, height } = img;

        // scale down while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // compress to JPEG at 0.7 quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], selected.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              setFile(compressedFile);

              e.target.value = null;
              //   setPreview(URL.createObjectURL(compressedFile));
            }
          },
          "image/jpeg",
          0.7 // compression quality (0 to 1)
        );
      };
    };
  };

  return (
    // <div className="upload-image-container" style={{width: width}}>

    //   <input type="file" accept="image/*" onChange={handleFileChange} style={{width: width}}/>
    // </div>
    <div
      className="upload-image-container"
      style={{
        width,
      }}
    >
      <label className="input-label">
        {label}
        <span className="required-asterisk">{required ? "*" : null}</span>
      </label>

      <div className="upload-container">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {file && file.name ? (
          <span style={{ color: "#000000" }}>
            {file?.name || "Upload image here"}
          </span>
        ) : (
          <span style={{ color: "#a9a9a9" }}>
            {file?.name || "Upload image here"}
          </span>
        )}

        <FaUpload size={15} />
      </div>
    </div>
  );
}
