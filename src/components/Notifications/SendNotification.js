import { useDispatch } from "react-redux";
import { sendChatNotification } from "../../../redux/slices/messageSlice";

export const SendNotification = (dispatch, payload) => {
  const message = {
    title: payload.title,
    body: payload.body,
    profileImg: payload.profileImg,
    imgContent: payload.imgContent || "EMPTY",
    fcm: payload.fcm,
  };

  if (message.fcm) {
    dispatch(sendChatNotification(message));
  }
};

export default SendNotification;
