import { auth } from "@/config/firebaseConfig";
import { refreshSignIn, useSelectUser } from "../../../redux/slices/authSlice";
import { useDispatch } from "react-redux";

const { createContext, useState, useEffect, useContext } = require("react");

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const user = useSelectUser();
  const dispatch = useDispatch();

  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(refreshSignIn({ user, setAuthLoading }));
      } else {
        setAuthLoading(true);
      }
    });
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
