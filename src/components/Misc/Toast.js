import { useSelector, useDispatch } from "react-redux";
import { useSelectToast, showToast, hideToast } from "../../../redux/slices/toastSlice";
import { createContext, useContext } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { message, status, show, loader } = useSelector((state) => state.toast.toast);

  function hideToastModal(){
    dispatch(hideToast());
  }

  return (
    <ToastContext.Provider
      value={{
        showToast: (message, status) =>
          dispatch(showToast({ message, status, loader })),
      }}
    >
      {children}
      {show && (
        <div className={`toast-container ${status}`} onClick={()=>hideToastModal()}>
          <span className="toast-message">{message}</span>
          {loader ? <div className="spinner"></div> : null}
        </div>
      )}
    </ToastContext.Provider>
  );
};
