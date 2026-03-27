import React, { useState, useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "../../firebaseInit.js";
import { ref, set } from "firebase/database";

const Notifications = (props) => {

  const publicKey = "BAq_zT39tBFy9Zll_4WLwxvAhem80SfHd77PG6ian1qnn2AiuDvtpkOm1DcNluhsOxwzzogVDNXzXM1XIkOfomQ";

  const [isTokenFound, setTokenFound] = useState(false);

  const fetchToken = async (TokenFound) => {
    let currentToken = "";
    // let currentToken = true;
  
    try {
      currentToken = await getToken(messaging, { vapidKey: publicKey });
      if (currentToken) {
        TokenFound(true);
      } else {
        TokenFound(false);
      }
    } catch (error) {
      // console.log("An error occurred while retrieving token. ", error);
    }
  
    return currentToken;
  };

  // To load once
  useEffect(() => {
    let data;

    async function tokenFunc() {
      data = await fetchToken(setTokenFound);
      if (data) {
        // const combinedId = user.uid > targetUser.uid ? user.uid + targetUser.uid : targetUser.uid + user.uid;
        // const dateNow = Date.now()

        // await set(ref(db, 'userChats/' + "kVF8yQfINWWpE6OqZNoujuFSgv33" + '/' + combinedId), {
        //   userInfo: {
        //     uid: "m6hP6ivNn4Wo2WIGWiodYOxPiO33",
        //     displayName: "Cheng Wang",
        //     photoURL: "https://firebasestorage.googleapis.com/v0/b/rexsoft-crm.appspot.com/o/d61b76bd-a2a5-4144-9b75-d3cdaab831a1?alt=media&token=09c60b9c-84a7-4797-9497-e0806e56d952"
        //   },
        //   date: dateNow
        // })
        // .then((result) => {

        // })
        // .catch(err => {
        //   console.log(err)
        // })

      }
      return data;
    }

    tokenFunc();
  }, [setTokenFound]);

  return <></>;
};

Notifications.propTypes = {};

export default Notifications;
