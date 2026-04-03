import React, { useContext, useState, useEffect } from "react";
import { v4 as uuid, v4 } from "uuid";
import {
  getDownloadURL,
  uploadBytesResumable,
  ref as ref_storage,
} from "firebase/storage";
import { set, child, push, ref, update, get } from "firebase/database";
import { FiSend } from "react-icons/fi";
import { BsImages, BsPaperclip } from "react-icons/bs";
import { MentionsInput, Mention } from "react-mentions";
import mentionsInputStyles from "./mentionsInputStyles";
import { MessageContext } from "../ChatScrollContext";
import { useSelectAllCompanyUsers } from "../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ActionButton } from "@/components/Misc/ActionButton";
import SendNotification from "@/components/Notifications/SendNotification";
import { db, storage } from "@/config/firebaseConfig";
import { setDoc, setQuote } from "../../../../redux/slices/messageSlice";

const Input = () => {
  const dispatch = useDispatch();

  const doc = useSelector((state) => state.message.doc);
  const quote = useSelector((state) => state.message.quote);
  const loadingChat = useSelector((state) => state.chat.loadingChat);

  const chat = useSelector((state) => state.chat.selectedChat);
  const chatId = useSelector((state) => state.chat.chatId);
  const groupUser = useSelector((state) => state.chat.groupUsers);

  //   const { dispatchDoc, doc, imageInputRef, fileInputRef, unreadMessages, dispatchQuote, quote, loadingChat, dispatchLoadingChat } = useContext(MessageContext);
  const { fileInputRef, imageInputRef } = useContext(MessageContext);
  const user = useSelectUser();
  const allUserList = useSelectAllCompanyUsers();
  const [taggableList, setTaggableList] = useState([]);
  const [tagList, setTagList] = useState(null);

  const dbRef = ref(db);

  const [text, setText] = useState("");

  useEffect(() => {
    var newGroupTarget = [];
    if (groupUser.length > 0) {
      newGroupTarget.push({
        id: "alluser1001",
        display: "All",
        photoURL: "",
      });
    }
    const newSets = groupUser.filter((item) => item.uid !== user?.uid);
    newSets.map((item) => {
      if (!item?.remove) {
        newGroupTarget.push({
          id: item.uid,
          display: item.displayName,
          photoURL: item.photoURL,
        });
      }
    });
    setTaggableList(newGroupTarget);
  }, [groupUser]);

  const handleAddImage = (source) => {
    var newArray = [];

    for (var i = 0; i < source.target.files.length; i++) {
      const fileSize = source.target.files[i].size;
      const fileMB = Math.round(fileSize / 1024);
      if (fileMB <= 5120) {
        newArray.push(source.target.files[i]);
      }
    }

    if (newArray.length > 0) {
      dispatch(
        setDoc({
          type: "image",
          data: newArray,
        }),
      );
    }
  };

  const handleAddFile = (source) => {
    var newArray = [];

    for (var i = 0; i < source.target.files.length; i++) {
      const fileSize = source.target.files[i].size;
      const fileMB = Math.round(fileSize / 1024);
      if (fileMB <= 5120) {
        newArray.push(source.target.files[i]);
      }
    }

    if (newArray.length > 0) {
      dispatch(
        setDoc({
          type: "file",
          data: newArray,
        }),
      );
    }
  };

  const processMessage = () => {
    const dateNow = Date.now();
    const uniqueID = uuid();
    const combineID = dateNow + uniqueID;

    const formatMessageLeftBrac = text.replaceAll("[-", "@");
    const removeStringID = formatMessageLeftBrac.replaceAll("-]", "");

    const formatMessage = removeStringID.replaceAll(/-{.*?}-/g, "");

    if (doc && doc.type === "image") {
      // dispatch(setLoadingChat(true))
      handleSendImage({ dateNow, uniqueID, combineID, formatMessage });
    } else if (doc && doc.type === "file") {
      // dispatch(setLoadingChat(true))
      handleSendFile({ dateNow, uniqueID, combineID, formatMessage });
    } else if (!doc) {
      // dispatch(setLoadingChat(true))
      handleSendText({ dateNow, uniqueID, combineID, formatMessage });
    }
  };

  function handleSendFile({ dateNow, uniqueID, combineID, formatMessage }) {
    if (formatMessage) {
      const postData = {
        id: uniqueID,
        senderId: user?.uid,
        date: dateNow,
        text: formatMessage,
        img: false,
        fileSize: false,
        fileName: false,
        file: false,
        analytics: false,
        appointment: false,
        hasRead: false,
      };

      if (groupUser.length > 0) {
        set(
          ref(
            db,
            "chats/" + chatId + "/messages/" + uniqueID + "/" + user?.uid,
          ),
          postData,
        );

        set(
          ref(
            db,
            "/userChats/" + user?.uid + "/" + chatId + "/" + "lastMessage/text",
          ),
          formatMessage,
        );
        set(
          ref(db, "/userChats/" + user?.uid + "/" + chatId + "/" + "date"),
          dateNow,
        );
        set(
          ref(
            db,
            "userChats/" + user?.uid + "/" + chatId + "/lastMessage/recall",
          ),
          false,
        );

        for (var y = 0; y < groupUser.length; y++) {
          set(
            ref(
              db,
              "chats/" +
                chatId +
                "/messages/" +
                uniqueID +
                "/" +
                groupUser[y].uid,
            ),
            postData,
          );
          set(
            ref(
              db,
              "/userChats/" + groupUser[y].uid + "/" + chatId + "/" + "date",
            ),
            dateNow,
          );
          set(
            ref(
              db,
              "/userChats/" +
                groupUser[y].uid +
                "/" +
                chatId +
                "/" +
                "lastMessage/text",
            ),
            formatMessage,
          );
          set(
            ref(
              db,
              "userChats/" +
                groupUser[y].uid +
                "/" +
                chatId +
                "/lastMessage/recall",
            ),
            false,
          );

          if (tagList) {
            const tagAll = tagList.find((e) => e === "alluser1001");
            if (tagAll === "alluser1001") {
              const targetUser = allUserList.find(
                (e) => e.uid === groupUser[y].uid,
              );
              if (targetUser.fcm && targetUser.uid !== user?.uid) {
                SendNotification(dispatch, {
                  fcm: targetUser.fcm,
                  title: chat?.groupInfo?.groupName,
                  body: user?.displayName + ": " + formatMessage,
                  profileImg: user.photoURL,
                  imgContent: null,
                });
              }
            } else {
              const targetMention = allUserList.filter((element) =>
                tagList.includes(element.uid),
              );
              const targetUser = targetMention.find(
                (e) => e.uid === groupUser[y].uid,
              );
              if (targetUser) {
                if (targetUser.fcm) {
                  SendNotification(dispatch, {
                    fcm: targetUser.fcm,
                    title: chat?.groupInfo?.groupName,
                    body: user?.displayName + ": " + formatMessage,
                    profileImg: user.photoURL,
                    imgContent: null,
                  });
                }
              }
            }
          }

          if (groupUser[y].uid !== user?.uid && groupUser[y].mute === false) {
            if (tagList) {
              const tagAll = tagList.find((e) => e === "alluser1001");
              if (tagAll !== "alluser1001") {
                const newUserList = allUserList.filter(
                  (element) => !tagList.includes(element.uid),
                );
                const targetUser = newUserList.find(
                  (e) => e.uid === groupUser[y].uid,
                );
                if (targetUser) {
                  SendNotification(dispatch, {
                    fcm: targetUser.fcm,
                    title: chat?.groupInfo?.groupName,
                    body: user?.displayName + ": " + formatMessage,
                    profileImg: user.photoURL,
                    imgContent: null,
                  });
                }
              }
            } else {
              const targetUser = allUserList.find(
                (e) => e.uid === groupUser[y].uid,
              );
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: chat?.groupInfo?.groupName,
                body: user?.displayName + ": " + formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          }
        }
        setText("");
      } else {
        set(ref(db, "chats/" + chatId + "/messages/" + uniqueID), postData);

        set(
          ref(
            db,
            "/userChats/" + user?.uid + "/" + chatId + "/" + "lastMessage/text",
          ),
          formatMessage,
        );
        set(
          ref(
            db,
            "/userChats/" +
              chat?.userInfo?.uid +
              "/" +
              chatId +
              "/" +
              "lastMessage/text",
          ),
          formatMessage,
        );
        set(
          ref(db, "/userChats/" + user?.uid + "/" + chatId + "/" + "date"),
          dateNow,
        );
        set(
          ref(
            db,
            "/userChats/" + chat?.userInfo?.uid + "/" + chatId + "/" + "date",
          ),
          dateNow,
        );

        const targetUser = allUserList.find(
          (e) => e.uid === chat?.userInfo?.uid,
        );

        get(
          child(dbRef, `userChats/${chat?.userInfo?.uid}/${chatId}/mute`),
        ).then((snapshot) => {
          if (snapshot.exists()) {
            if (!snapshot.val()) {
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: user?.displayName,
                body: formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          }
        });

        setText("");
      }
    }
    ////////////////////////////////////////////Send image below
    for (var x = 0; x < doc.data.length; x++) {
      const storageRef = ref_storage(
        storage,
        "/conversation/file/" + doc.data[x].name,
      );
      const uploadTask = uploadBytesResumable(storageRef, doc.data[x]);
      const newUniqueID = uniqueID + x;
      const fileName = doc.data[x].name;
      const fileSize = doc.data[x].size;

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const postData = {
              id: newUniqueID,
              senderId: user?.uid,
              date: dateNow,
              text: false,
              img: false,
              fileName: fileName,
              fileSize: fileSize,
              file: downloadURL,
              analytics: false,
              appointment: false,
              hasRead: false,
            };

            if (groupUser.length > 0) {
              set(
                ref(
                  db,
                  "chats/" +
                    chatId +
                    "/messages/" +
                    newUniqueID +
                    "/" +
                    user?.uid,
                ),
                postData,
              );

              set(
                ref(
                  db,
                  "/userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[file]",
              );
              set(
                ref(
                  db,
                  "/userChats/" + user?.uid + "/" + chatId + "/" + "date",
                ),
                dateNow,
              );
              set(
                ref(
                  db,
                  "userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );

              for (var y = 0; y < groupUser.length; y++) {
                set(
                  ref(
                    db,
                    "userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/lastMessage/recall",
                  ),
                  false,
                );
                set(
                  ref(
                    db,
                    "chats/" +
                      chatId +
                      "/messages/" +
                      newUniqueID +
                      "/" +
                      groupUser[y].uid,
                  ),
                  postData,
                );
                set(
                  ref(
                    db,
                    "/userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/" +
                      "date",
                  ),
                  dateNow,
                );
                set(
                  ref(
                    db,
                    "/userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/" +
                      "lastMessage/text",
                  ),
                  "[file]",
                );

                if (tagList) {
                  const tagAll = tagList.find((e) => e === "alluser1001");
                  if (tagAll === "alluser1001") {
                    const targetUser = allUserList.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    if (targetUser.fcm && targetUser.uid !== user?.uid) {
                      SendNotification(dispatch, {
                        fcm: targetUser.fcm,
                        title: chat?.groupInfo?.groupName,
                        body: user?.displayName + ": " + formatMessage,
                        profileImg: user.photoURL,
                        imgContent: null,
                      });
                    }
                  } else {
                    const targetMention = allUserList.filter((element) =>
                      tagList.includes(element.uid),
                    );
                    const targetUser = targetMention.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    if (targetUser) {
                      if (targetUser.fcm) {
                        SendNotification(dispatch, {
                          fcm: targetUser.fcm,
                          title: chat?.groupInfo?.groupName,
                          body: user?.displayName + ": " + formatMessage,
                          profileImg: user.photoURL,
                          imgContent: null,
                        });
                      }
                    }
                  }
                }

                if (
                  groupUser[y].uid !== user?.uid &&
                  groupUser[y].mute === false
                ) {
                  if (tagList) {
                    const tagAll = tagList.find((e) => e === "alluser1001");
                    if (tagAll !== "alluser1001") {
                      const newUserList = allUserList.filter(
                        (element) => !tagList.includes(element.uid),
                      );
                      const targetUser = newUserList.find(
                        (e) => e.uid === groupUser[y].uid,
                      );
                      if (targetUser) {
                        SendNotification(dispatch, {
                          fcm: targetUser.fcm,
                          title: chat?.groupInfo?.groupName,
                          body: user?.displayName + ": " + formatMessage,
                          profileImg: user.photoURL,
                          imgContent: null,
                        });
                      }
                    }
                  } else {
                    const targetUser = allUserList.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    SendNotification(dispatch, {
                      fcm: targetUser.fcm,
                      title: chat?.groupInfo?.groupName,
                      body: user?.displayName + ": " + fileName,
                      profileImg: user.photoURL,
                      imgContent: null,
                    });
                  }
                }
              }
            } else {
              set(
                ref(
                  db,
                  "userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );
              set(
                ref(
                  db,
                  "userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );

              set(
                ref(db, "chats/" + chatId + "/messages/" + newUniqueID),
                postData,
              );

              set(
                ref(
                  db,
                  "/userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[file]",
              );
              set(
                ref(
                  db,
                  "/userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[file]",
              );
              set(
                ref(
                  db,
                  "/userChats/" + user?.uid + "/" + chatId + "/" + "date",
                ),
                dateNow,
              );
              set(
                ref(
                  db,
                  "/userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "date",
                ),
                dateNow,
              );

              const targetUser = allUserList.find(
                (e) => e.uid === chat?.userInfo?.uid,
              );
              get(
                child(dbRef, `userChats/${chat?.userInfo?.uid}/${chatId}/mute`),
              ).then((snapshot) => {
                if (snapshot.exists()) {
                  if (!snapshot.val()) {
                    SendNotification(dispatch, {
                      fcm: targetUser.fcm,
                      title: user?.displayName,
                      body: fileName,
                      profileImg: user.photoURL,
                      imgContent: null,
                    });
                  }
                }
              });
            }
          });
        },
      );
    }

    fileInputRef.current.value = null;
    dispatch(setDoc(null));
  }

  function handleSendImage({ dateNow, uniqueID, combineID, formatMessage }) {
    //Send text first
    if (formatMessage) {
      const postData = {
        id: uniqueID,
        senderId: user?.uid,
        date: dateNow,
        text: formatMessage,
        img: false,
        fileSize: false,
        fileName: false,
        file: false,
        analytics: false,
        appointment: false,
        hasRead: false,
      };

      if (groupUser.length > 0) {
        set(
          ref(
            db,
            "chats/" + chatId + "/messages/" + uniqueID + "/" + user?.uid,
          ),
          postData,
        );

        set(
          ref(
            db,
            "/userChats/" + user?.uid + "/" + chatId + "/" + "lastMessage/text",
          ),
          formatMessage,
        );
        set(
          ref(db, "/userChats/" + user?.uid + "/" + chatId + "/" + "date"),
          dateNow,
        );

        for (var y = 0; y < groupUser.length; y++) {
          set(
            ref(
              db,
              "chats/" +
                chatId +
                "/messages/" +
                uniqueID +
                "/" +
                groupUser[y].uid,
            ),
            postData,
          );
          set(
            ref(
              db,
              "/userChats/" +
                groupUser[y].uid +
                "/" +
                chatId +
                "/" +
                "lastMessage/text",
            ),
            formatMessage,
          );
          set(
            ref(
              db,
              "/userChats/" + groupUser[y].uid + "/" + chatId + "/" + "date",
            ),
            dateNow,
          );
          set(
            ref(
              db,
              "userChats/" +
                groupUser[y].uid +
                "/" +
                chatId +
                "/lastMessage/recall",
            ),
            false,
          );

          if (tagList) {
            const tagAll = tagList.find((e) => e === "alluser1001");
            if (tagAll === "alluser1001") {
              const targetUser = allUserList.find(
                (e) => e.uid === groupUser[y].uid,
              );
              if (targetUser.fcm && targetUser.uid !== user?.uid) {
                SendNotification(dispatch, {
                  fcm: targetUser.fcm,
                  title: chat?.groupInfo?.groupName,
                  body: user?.displayName + ": " + formatMessage,
                  profileImg: user.photoURL,
                  imgContent: null,
                });
              }
            } else {
              const targetMention = allUserList.filter((element) =>
                tagList.includes(element.uid),
              );
              const targetUser = targetMention.find(
                (e) => e.uid === groupUser[y].uid,
              );
              if (targetUser) {
                if (targetUser.fcm) {
                  SendNotification(dispatch, {
                    fcm: targetUser.fcm,
                    title: chat?.groupInfo?.groupName,
                    body: user?.displayName + ": " + formatMessage,
                    profileImg: user.photoURL,
                    imgContent: null,
                  });
                }
              }
            }
          }

          if (groupUser[y].uid !== user?.uid && groupUser[y].mute === false) {
            if (tagList) {
              const tagAll = tagList.find((e) => e === "alluser1001");
              if (tagAll !== "alluser1001") {
                const newUserList = allUserList.filter(
                  (element) => !tagList.includes(element.uid),
                );
                const targetUser = newUserList.find(
                  (e) => e.uid === groupUser[y].uid,
                );
                if (targetUser) {
                  SendNotification(dispatch, {
                    fcm: targetUser.fcm,
                    title: chat?.groupInfo?.groupName,
                    body: user?.displayName + ": " + formatMessage,
                    profileImg: user.photoURL,
                    imgContent: null,
                  });
                }
              }
            } else {
              const targetUser = allUserList.find(
                (e) => e.uid === groupUser[y].uid,
              );
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: chat?.groupInfo?.groupName,
                body: user?.displayName + ": " + formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          }
        }
        setText("");
      } else {
        set(ref(db, "chats/" + chatId + "/messages/" + uniqueID), postData);

        set(
          ref(
            db,
            "/userChats/" + user?.uid + "/" + chatId + "/" + "lastMessage/text",
          ),
          formatMessage,
        );
        set(
          ref(
            db,
            "/userChats/" + chat?.userInfo?.uid + "/" + chatId + "/" + "date",
          ),
          dateNow,
        );

        const targetUser = allUserList.find(
          (e) => e.uid === chat?.userInfo?.uid,
        );
        get(
          child(dbRef, `userChats/${chat?.userInfo?.uid}/${chatId}/mute`),
        ).then((snapshot) => {
          if (snapshot.exists()) {
            if (!snapshot.val()) {
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: user?.displayName,
                body: formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          }
        });

        setText("");
      }
    }
    ////////////////////////////////////////////Send image below
    for (var x = 0; x < doc.data.length; x++) {
      const storageRef = ref_storage(
        storage,
        "/conversation/image/" + combineID + x,
      );
      const uploadTask = uploadBytesResumable(storageRef, doc.data[x]);
      const newUniqueID = uniqueID + x;

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const postData = {
              id: newUniqueID,
              senderId: user?.uid,
              date: dateNow,
              text: false,
              img: downloadURL,
              fileSize: false,
              fileName: false,
              file: false,
              analytics: false,
              appointment: false,
              hasRead: false,
            };

            if (groupUser.length > 0) {
              set(
                ref(
                  db,
                  "chats/" +
                    chatId +
                    "/messages/" +
                    newUniqueID +
                    "/" +
                    user?.uid,
                ),
                postData,
              );

              set(
                ref(
                  db,
                  "/userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[image]",
              );
              set(
                ref(
                  db,
                  "/userChats/" + user?.uid + "/" + chatId + "/" + "date",
                ),
                dateNow,
              );
              set(
                ref(
                  db,
                  "userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );

              for (var y = 0; y < groupUser.length; y++) {
                set(
                  ref(
                    db,
                    "chats/" +
                      chatId +
                      "/messages/" +
                      newUniqueID +
                      "/" +
                      groupUser[y].uid,
                  ),
                  postData,
                );
                set(
                  ref(
                    db,
                    "userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/lastMessage/recall",
                  ),
                  false,
                );

                set(
                  ref(
                    db,
                    "/userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/" +
                      "lastMessage/text",
                  ),
                  "[image]",
                );
                set(
                  ref(
                    db,
                    "/userChats/" +
                      groupUser[y].uid +
                      "/" +
                      chatId +
                      "/" +
                      "date",
                  ),
                  dateNow,
                );

                if (tagList) {
                  const tagAll = tagList.find((e) => e === "alluser1001");
                  if (tagAll === "alluser1001") {
                    const targetUser = allUserList.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    if (targetUser.fcm && targetUser.uid !== user?.uid) {
                      SendNotification(dispatch, {
                        fcm: targetUser.fcm,
                        title: chat?.groupInfo?.groupName,
                        body: user?.displayName + ": " + formatMessage,
                        profileImg: user.photoURL,
                        imgContent: null,
                      });
                    }
                  } else {
                    const targetMention = allUserList.filter((element) =>
                      tagList.includes(element.uid),
                    );
                    const targetUser = targetMention.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    if (targetUser) {
                      if (targetUser.fcm) {
                        SendNotification(dispatch, {
                          fcm: targetUser.fcm,
                          title: chat?.groupInfo?.groupName,
                          body: user?.displayName + ": " + formatMessage,
                          profileImg: user.photoURL,
                          imgContent: null,
                        });
                      }
                    }
                  }
                }

                if (
                  groupUser[y].uid !== user?.uid &&
                  groupUser[y].mute === false
                ) {
                  if (tagList) {
                    const tagAll = tagList.find((e) => e === "alluser1001");
                    if (tagAll !== "alluser1001") {
                      const newUserList = allUserList.filter(
                        (element) => !tagList.includes(element.uid),
                      );
                      const targetUser = newUserList.find(
                        (e) => e.uid === groupUser[y].uid,
                      );
                      if (targetUser) {
                        SendNotification(dispatch, {
                          fcm: targetUser.fcm,
                          title: chat?.groupInfo?.groupName,
                          body: user?.displayName + ": " + formatMessage,
                          profileImg: user.photoURL,
                          imgContent: null,
                        });
                      }
                    }
                  } else {
                    const targetUser = allUserList.find(
                      (e) => e.uid === groupUser[y].uid,
                    );
                    SendNotification(dispatch, {
                      fcm: targetUser.fcm,
                      title: chat?.groupInfo?.groupName,
                      body: "",
                      profileImg: user.photoURL,
                      imgContent: downloadURL,
                    });
                  }
                }
              }
            } else {
              set(
                ref(
                  db,
                  "userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );
              set(
                ref(
                  db,
                  "userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/lastMessage/recall",
                ),
                false,
              );

              set(
                ref(db, "chats/" + chatId + "/messages/" + newUniqueID),
                postData,
              );

              set(
                ref(
                  db,
                  "/userChats/" +
                    user?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[image]",
              );
              set(
                ref(
                  db,
                  "/userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "lastMessage/text",
                ),
                "[image]",
              );
              set(
                ref(
                  db,
                  "/userChats/" + user?.uid + "/" + chatId + "/" + "date",
                ),
                dateNow,
              );
              set(
                ref(
                  db,
                  "/userChats/" +
                    chat?.userInfo?.uid +
                    "/" +
                    chatId +
                    "/" +
                    "date",
                ),
                dateNow,
              );

              const targetUser = allUserList.find(
                (e) => e.uid === chat?.userInfo?.uid,
              );
              get(
                child(dbRef, `userChats/${chat?.userInfo?.uid}/${chatId}/mute`),
              ).then((snapshot) => {
                if (snapshot.exists()) {
                  if (!snapshot.val()) {
                    SendNotification(dispatch, {
                      fcm: targetUser.fcm,
                      title: user?.displayName,
                      body: "",
                      profileImg: user.photoURL,
                      imgContent: downloadURL,
                    });
                  }
                }
              });
            }
          });
        },
      );
    }

    imageInputRef.current.value = null;
    dispatch(setDoc(null));
  }

  async function handleSendText({ dateNow, uniqueID, formatMessage }) {
    const postData = {
      id: uniqueID,
      senderId: user?.uid,
      quoteType: quote
        ? quote.text
          ? "TEXT"
          : quote.file
            ? "FILE"
            : "IMG"
        : false,
      quote: quote
        ? quote.text
          ? quote.text
          : quote.file
            ? quote.file
            : quote.img
        : false,
      quoteSender: quote ? quote.senderId : false,
      quoteId: quote ? quote.id : false,
      date: dateNow,
      text: formatMessage,
      img: false,
      fileSize: false,
      fileName: false,
      file: false,
      analytics: false,
      appointment: false,
      hasRead: false,
    };

    if (groupUser.length > 0) {
      set(
        ref(db, "chats/" + chatId + "/messages/" + uniqueID + "/" + user?.uid),
        postData,
      );

      set(
        ref(db, "/userChats/" + user?.uid + "/" + chatId + "/" + "date"),
        dateNow,
      );
      set(
        ref(
          db,
          "/userChats/" + user?.uid + "/" + chatId + "/" + "lastMessage/text",
        ),
        formatMessage,
      );
      set(
        ref(
          db,
          "userChats/" + user?.uid + "/" + chatId + "/lastMessage/recall",
        ),
        false,
      );

      for (var y = 0; y < groupUser.length; y++) {
        set(
          ref(
            db,
            "chats/" +
              chatId +
              "/messages/" +
              uniqueID +
              "/" +
              groupUser[y].uid,
          ),
          postData,
        );
        set(
          ref(
            db,
            "userChats/" +
              groupUser[y].uid +
              "/" +
              chatId +
              "/lastMessage/recall",
          ),
          false,
        );

        set(
          ref(
            db,
            "/userChats/" + groupUser[y].uid + "/" + chatId + "/" + "date",
          ),
          dateNow,
        );
        set(
          ref(
            db,
            "/userChats/" +
              groupUser[y].uid +
              "/" +
              chatId +
              "/" +
              "lastMessage/text",
          ),
          formatMessage,
        );

        if (tagList) {
          const tagAll = tagList.find((e) => e === "alluser1001");
          if (tagAll === "alluser1001") {
            const targetUser = allUserList.find(
              (e) => e.uid === groupUser[y].uid,
            );
            if (targetUser.fcm && targetUser.uid !== user?.uid) {
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: chat?.groupInfo?.groupName,
                body: user?.displayName + ": " + formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          } else {
            const targetMention = allUserList.filter((element) =>
              tagList.includes(element.uid),
            );
            const targetUser = targetMention.find(
              (e) => e.uid === groupUser[y].uid,
            );
            if (targetUser) {
              if (targetUser.fcm) {
                SendNotification(dispatch, {
                  fcm: targetUser.fcm,
                  title: chat?.groupInfo?.groupName,
                  body: user?.displayName + ": " + formatMessage,
                  profileImg: user.photoURL,
                  imgContent: null,
                });
              }
            }
          }
        }

        if (groupUser[y].uid !== user?.uid && groupUser[y].mute === false) {
          if (tagList) {
            const tagAll = tagList.find((e) => e === "alluser1001");
            if (tagAll !== "alluser1001") {
              const newUserList = allUserList.filter(
                (element) => !tagList.includes(element.uid),
              );
              const targetUser = newUserList.find(
                (e) => e.uid === groupUser[y].uid,
              );
              if (targetUser) {
                SendNotification(dispatch, {
                  fcm: targetUser.fcm,
                  title: chat?.groupInfo?.groupName,
                  body: user?.displayName + ": " + formatMessage,
                  profileImg: user.photoURL,
                  imgContent: null,
                });
              }
            }
          } else {
            const targetUser = allUserList.find(
              (e) => e.uid === groupUser[y].uid,
            );
            SendNotification(dispatch, {
              fcm: targetUser.fcm,
              title: chat?.groupInfo?.groupName,
              body: user?.displayName + ": " + formatMessage,
              profileImg: user.photoURL,
              imgContent: null,
            });
          }
        }
      }
      setText("");
    } else {
      //Bug occurred in this function

      set(ref(db, "chats/" + chatId + "/messages/" + uniqueID), postData);

      const targetUser = allUserList.find((e) => e.uid === chat?.userInfo?.uid);

      get(child(dbRef, `userChats/${chat?.userInfo?.uid}/${chatId}/mute`)).then(
        (snapshot) => {
          if (snapshot.exists()) {
            if (!snapshot.val()) {
              SendNotification(dispatch, {
                fcm: targetUser.fcm,
                title: user?.displayName,
                body: formatMessage,
                profileImg: user.photoURL,
                imgContent: null,
              });
            }
          }
        },
      );

      setText("");

      var chatsData = {
        recall: false,
        text: formatMessage,
      };

      set(ref(db, "userChats/" + user?.uid + "/" + chatId + "/date"), dateNow);
      set(
        ref(db, "userChats/" + chat?.userInfo?.uid + "/" + chatId + "/date"),
        dateNow,
      );

      set(
        ref(db, "userChats/" + user?.uid + "/" + chatId + "/lastMessage"),
        chatsData,
      );
      set(
        ref(
          db,
          "userChats/" + chat?.userInfo?.uid + "/" + chatId + "/lastMessage",
        ),
        chatsData,
      );
    }

    dispatch(setQuote(null));
  }

  const handleKey = (e) => {
    if (e.code === "Enter") {
      if (doc || text !== "") {
        processMessage();
      } else {
        console.log("invalid Input");
      }
    }
  };

  function handleTextChange(value) {
    setText(value);

    const regex = /[^-{}]+(?=}-)/g;
    const mentions = value.match(regex);
    setTagList(mentions);
  }

  return (
    <div className="input-container">
      <div className="input-subContainer">
        <div className="inputField">
          <MentionsInput
            singleLine
            style={mentionsInputStyles}
            forceSuggestionsAboveCursor
            allowSpaceInQuery
            value={text}
            className="mentions"
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={"Type something here..."}
            a11ySuggestionsListLabel={"Suggested tag"}
          >
            <Mention
              trigger="@"
              displayTransform={(id, display) => `@${display}`}
              style={{}}
              data={taggableList}
              className="mentions__mention"
              markup="[-__display__-]-{__id__}-"
              // onAdd={(id, display, startPos, endPos) => { addUserToTag(id, display, startPos, endPos) }}
            />
          </MentionsInput>
        </div>
        {/* <input type="text" placeholder="Type something..." onChange={e => setText(e.target.value)} value={text} onKeyDown={handleKey}/> */}
        <div className="send">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            id="attachForConversation"
            onChange={(e) => handleAddFile(e)}
            multiple
          />
          <label
            htmlFor="attachForConversation"
            style={doc || (quote && { display: "none" })}
          >
            <BsPaperclip
              className={`fileContainer ${doc || (quote && "fileContainer-deactive")}`}
              size={20}
            />
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="imageForConversation"
            onInput={(e) => handleAddImage(e)}
            multiple
          />
          <label
            htmlFor="imageForConversation"
            style={doc || (quote && { display: "none" })}
          >
            <BsImages
              className={`imgContainer ${doc || (quote && "imgContainer-deactive")}`}
              size={20}
            />
          </label>
          <button
            className="send-btn"
            onClick={processMessage}
            disabled={!doc && text === ""}
          >
            <FiSend size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Input;
