import { useDispatch } from "react-redux";
import { sendChatNotification } from "../../../redux/slices/messageSlice";

const SendNotification = ({ fcm, title, body, profileImg, imgContent }) => {
  const dispatch = useDispatch();

  const message = {
    title: title,
    body: body,
    profileImg: profileImg,
    imgContent: imgContent ? imgContent : "EMPTY",
    fcm: fcm,
  };

  if (message.fcm) {
    dispatch(sendChatNotification(message));
    // ApiClient.POST(API.registerFCM, message).then((result) => {

    // }).catch(err => {

    //   console.log(err)

    // })
  }
};

export default SendNotification;
