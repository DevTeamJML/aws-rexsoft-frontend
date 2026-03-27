import PropTypes from "prop-types";
import "react-toastify/dist/ReactToastify.css";
import "./ReactNotification.css";

const ReactNotificationComponent = ({ title, body, profileImg, imgContent, show }) => {

  return (
    <div className={`noti-container ${show && 'show-noti'}`}>
      <div className="noti-content-container">
        <div className="noti-img-container">
          {profileImg && <img className="profile-image" src={profileImg} alt=""/>}
        </div>
        <div className="noti-text-container">
          <span className="noti-title">{title}</span>
          {body && <span className="noti-body">{body}</span>}
        </div>
        {imgContent !== "EMPTY" &&
          <div className="noti-imgContent">
            <img className="content-image" src={imgContent} alt=""/>
          </div>
        }
      </div>
    </div>
  );
};

ReactNotificationComponent.defaultProps = {
  title: "",
  body: "",
};

ReactNotificationComponent.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
};

export default ReactNotificationComponent;
