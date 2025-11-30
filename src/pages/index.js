import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { signIn } from "../../redux/slices/authSlice";
import { useMediaQuery } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { ResetPasswordModal } from "@/components/Misc/ResetPasswordModal";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useMediaQuery("(max-width:1100px)");
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = () => {
    const data = {
      email: email,
      password: password,
      router,
    };

    dispatch(signIn(data));
  };

  return (
    <div className="login-page-content">
      <ResetPasswordModal
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
      <div className="login-container">
        <div className="login-content">
          {/* <div className="image-box">
            <Image
              className="logo"
              src="/assets/Logo.jpeg"
              alt="Lelong Logo"
              style={{ objectFit: "contain" }}
              width={isMobile ? 100 : 100}
              height={isMobile ? 100 : 150}
              priority
            />
          </div> */}
          <div className="title-box">
            <span className="title">Log in to your account.</span>
            <span className="description">
              Please fill in your information to access into crm.
            </span>
          </div>
          <form
            className="login-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <PlainTextField
              label={"Email"}
              width={"100%"}
              required={true}
              type={"text"}
              value={email}
              onChange={(val) => setEmail(val)}
            />
            <PlainTextField
              label={"Password"}
              width={"100%"}
              required={true}
              type={"password"}
              value={password}
              onChange={(val) => setPassword(val)}
            />
            <button type="submit" className="login-btn">
              Login
            </button>
            <div className="reset-password">
              <span
                onClick={() => {
                  setShowResetModal(true);
                  // router.push("/forgot-password");
                }}
              >
                Forgot your password ?
              </span>
            </div>
          </form>
        </div>
      </div>
      {/* <div className="visual-container">
        <div className="visual-placeholder">
        </div>
      </div> */}
    </div>
  );
}
