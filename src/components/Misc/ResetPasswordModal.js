import { auth } from "@/config/firebaseConfig";
import { useState } from "react";
import { PlainTextField } from "../FormComponents/PlainTextField";
import { ActionButton } from "./ActionButton";
import { sendPasswordResetEmail } from "firebase/auth";

export function ResetPasswordModal({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="reset-password-modal-backdrop">
      <div className="modal-container">
        <div className="modal-title-input">
          <h3 className="modal-title">Reset Password</h3>

          <PlainTextField
            placeholder="Enter your email"
            value={email}
            onChange={(val) => setEmail(val)}
          />
        </div>
        <div className="modal-buttons">
          <ActionButton
            label={loading ? "Sending..." : "Send Reset Link"}
            width="100%"
            type="primary"
            onClick={handleReset}
          />

          {/* Close */}
          <ActionButton
            label="Close"
            width="100%"
            type="secondary"
            onClick={onClose}
          />
         
        </div>
         {message && <p className="modal-message">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPasswordModal;
