import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { FaHandPointLeft, FaCameraRetro } from "react-icons/fa";
import { BiDotsHorizontalRounded, BiCrown } from "react-icons/bi";
import {
  AiOutlineArrowRight,
  AiFillBell,
  AiOutlineUserAdd,
  AiOutlineRight,
  AiOutlineArrowLeft,
  AiFillFile,
} from "react-icons/ai";
import {
  MdOutlinePermMedia,
  MdFilePresent,
  MdHistory,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import { ref, onValue, get, child } from "firebase/database";
import {
  ref as ref_storage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { set } from "firebase/database";
import moment from "moment";
import { GoCalendar } from "react-icons/go";
import { CgCrown } from "react-icons/cg";
import { ActionButton } from "@/components/Misc/ActionButton";
import SearchField from "@/components/FormComponents/SearchField";
import { useDispatch, useSelector } from "react-redux";
import { MessageContext } from "../ChatScrollContext";
import { setSelectedMessage } from "../../../../redux/slices/messageSlice";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { ChatContext } from "../UserChatContext";
import { db } from "@/config/firebaseConfig";
import { Switch } from "@mui/material";

const Chat = () => {
  const toolsContainerRef = useRef(null);
  const addMemberRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const chatImageRef = useRef(null);
  const chatFileRef = useRef(null);

  const messages = useSelector((state) => state.message.messages);
  const reduxDispatch = useDispatch();

  const { data, dispatch, groupUser } = useContext(ChatContext);
  const user = useSelectUser();

  const { messageRefs } = useContext(MessageContext);

  const [tools, setTools] = useState(false);
  const [chatHistory, setChatHistory] = useState(false);
  const [chatFile, setChatFile] = useState(false);
  const [chatImage, setChatImage] = useState(false);
  const [showMemberTools, setShowMemberTools] = useState({});
  const [removeConfirmation, setRemoveConfirmation] = useState({});
  const [addMemberContainer, setAddMemberContainer] = useState(false);
  const [ungroupMember, setUngroupMember] = useState();
  const [groupIcon, setGroupIcon] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [selectedRemover, setSelectedRemover] = useState(null);
  const [checkedMember, setCheckedMember] = useState();
  const [currentGroupUser, setCurrentGroupUser] = useState(
    groupUser?.find((e) => e.uid === user?.uid),
  );
  const [searchChat, setSearchChat] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState(false);

  const [muteState, setMuteState] = useState(currentGroupUser?.mute);
  const [privateMuteState, setPrivateMuteState] = useState(false);

  const handleClickOutside = (event) => {
    if (
      toolsContainerRef.current &&
      addMemberRef.current &&
      chatHistoryRef.current &&
      chatImageRef.current &&
      chatFileRef.current &&
      !addMemberRef.current.contains(event.target) &&
      !toolsContainerRef.current.contains(event.target) &&
      !chatHistoryRef.current.contains(event.target) &&
      !chatImageRef.current.contains(event.target) &&
      !chatFileRef.current.contains(event.target)
    ) {
      setTools(false);
      setShowMemberTools(false);
      setAddMemberContainer(false);
      setChatHistory(false);
      setChatFile(false);
      setChatImage(false);
      setSearchChat("");
      setDeleteConfirmation(false);
      setLeaveConfirmation(false);
      reduxDispatch(setSelectedMessage(null));
    }
  };

  useEffect(() => {
    if (!groupUser.length > 0) {
      const muteRef = ref(
        db,
        "userChats/" + user?.uid + "/" + data.chatId + "/mute",
      );
      onValue(muteRef, (snapshot) => {
        if (snapshot.exists()) {
          const value = snapshot.val();
          setPrivateMuteState(value);
        }
      });
    }
  }, [data]);

  useEffect(() => {
    setCurrentGroupUser(groupUser?.find((e) => e.uid === user?.uid));
  }, [groupUser]);

  useEffect(() => {
    setMuteState(currentGroupUser?.mute);
  }, [currentGroupUser]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (searchChat !== "") {
      let newArr = [];
      if (groupUser.length > 0) {
        messages.map((item) => {
          Object.entries(item)
            .filter((data) => {
              if (data[0] === user?.uid) {
                if (data[1].text) {
                  if (
                    data[1].text
                      .toLowerCase()
                      .includes(searchChat.toLowerCase())
                  ) {
                    return data[1];
                  }
                }
              }
            })
            .map((messg) => {
              newArr.push(messg[1]);
            });
        });
      } else {
        messages
          .filter((item) => {
            if (
              item.text &&
              item.text.toLowerCase().includes(searchChat.toLowerCase())
            ) {
              return item;
            }
          })
          .map((messg) => {
            newArr.push(messg);
          });
      }

      return setSearchResult(newArr);
    }
  }, [searchChat]);

  const handleMember = () => {
    const userRef = ref(db, "users/");

    try {
      onValue(userRef, (snapshot) => {
        user_handleSnapshot(snapshot);
      });
    } catch (err) {
      console.log(err);
    }
  };

  function user_handleSnapshot(snapshot) {
    var returnArr = [];

    snapshot.forEach(function (childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;

      returnArr.push(item);
    });

    const removed = groupUser.filter((e) => e.remove !== true);

    const remaining = [
      ...getRemainingMember(removed, returnArr),
      ...getRemainingMember(returnArr, removed),
    ];

    setUngroupMember(remaining);
    setCheckedMember(new Array(remaining.length).fill(false));
  }

  function getRemainingMember(arr1, arr2) {
    return arr1.filter((obj1) => {
      return !arr2.some((obj2) => {
        return obj1.uid === obj2.uid;
      });
    });
  }

  const handleOpenTools = () => {
    setTools(!tools);
  };

  const handleCloseTools = () => {
    setTools(false);
    setAddMemberContainer(false);
  };

  const handleManageMember = (index) => {
    return setShowMemberTools((state) => ({
      [index]: !state[index],
    }));
  };

  const handleRemoveConfirmation = (index) => {
    return setRemoveConfirmation((state) => ({
      [index]: !state[index],
    }));
  };

  const handleCancelRemove = () => {
    setRemoveConfirmation(false);
    setShowMemberTools(false);
  };

  const handleCloseMemberContainer = () => {
    setAddMemberContainer(false);
  };

  const handleSelectedMember = (e, val) => {
    const updatedCheckedState = checkedMember.map((item, index) =>
      index === e ? !item : item,
    );

    setCheckedMember(updatedCheckedState);
  };

  const updateGroupIcon = (file) => {
    if (file) {
      const storageRef = ref_storage(storage, "/chatGroupIcons/" + data.chatId);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            for (var x = 0; x < groupUser.length; x++) {
              set(
                ref(
                  db,
                  "userChats/" +
                    groupUser[x].uid +
                    "/" +
                    data.chatId +
                    "/groupInfo/photoURL",
                ),
                downloadURL,
              );

              set(
                ref(
                  db,
                  "userChats/" +
                    user?.uid +
                    "/" +
                    data.chatId +
                    "/groupInfo/photoURL",
                ),
                downloadURL,
              );
            }

            setGroupIcon(null);

            dispatch({
              type: "CHANGE_GROUP",
              payload: {
                groupInfo: {
                  groupName: data.user.groupInfo.groupName,
                  photoURL: downloadURL,
                },
                userInfo: data.user.userInfo,
              },
            });
          });
        },
      );
    }
  };

  const updateGroupName = () => {
    if (groupName) {
      for (var x = 0; x < groupUser.length; x++) {
        set(
          ref(
            db,
            "userChats/" +
              groupUser[x].uid +
              "/" +
              data.chatId +
              "/groupInfo/groupName",
          ),
          groupName,
        );

        set(
          ref(
            db,
            "userChats/" +
              user?.uid +
              "/" +
              data.chatId +
              "/groupInfo/groupName",
          ),
          groupName,
        );

        setGroupName("");

        dispatch({
          type: "CHANGE_GROUP",
          payload: {
            groupInfo: {
              groupName: groupName,
              photoURL: data.user.groupInfo.photoURL,
            },
            userInfo: data.user.userInfo,
          },
        });
      }
    }
  };

  const muteGroup = (e) => {
    setMuteState(e);
    set(
      ref(db, "groupChats/" + data.chatId + "/" + user?.uid + "/mute"),
      !muteState,
    );
  };

  const muteUser = (e) => {
    console.log(e);
    setPrivateMuteState(e);
    set(ref(db, "userChats/" + user?.uid + "/" + data.chatId + "/mute"), e);
  };

  const addMember = () => {
    const dateNow = Date.now();

    checkedMember.map((item, index) => {
      if (item === true) {
        set(
          ref(db, "userChats/" + ungroupMember[index].uid + "/" + data.chatId),
          {
            date: dateNow,
            groupInfo: {
              groupName: data.user.groupInfo.groupName,
              photoURL: data.user.groupInfo.photoURL,
            },
            userInfo: data.chatId,
          },
        );

        set(
          ref(db, "groupChats/" + data.chatId + "/" + ungroupMember[index].uid),
          {
            admin: false,
            owner: false,
            mute: false,
            remove: false,
            displayName: ungroupMember[index].displayName,
            photoURL: ungroupMember[index].photoURL,
            uid: ungroupMember[index].uid,
          },
        )
          .then((result) => {
            setAddMemberContainer(false);
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const removeMember = (member) => {
    set(
      ref(
        db,
        "groupChats/" + data.chatId + "/" + selectedRemover.uid + "/remove",
      ),
      true,
    );

    set(ref(db, "userChats/" + selectedRemover.uid + "/" + data.chatId), null)
      .then((res) => {
        setRemoveConfirmation(false);
        setShowMemberTools(false);
      })
      .catch((err) => console.log(err));
  };

  const AssignAdmin = (member) => {
    set(
      ref(db, "groupChats/" + data.chatId + "/" + member.uid + "/admin"),
      true,
    );
    setShowMemberTools(false);
  };

  const UnassignAdmin = (member) => {
    set(
      ref(db, "groupChats/" + data.chatId + "/" + member.uid + "/admin"),
      false,
    );
    setShowMemberTools(false);
  };

  const handleAddMemberContainer = () => {
    setAddMemberContainer(true);
    handleMember();
  };

  const handleFindMessage = (id) => {
    setTools(false);
    setShowMemberTools(false);
    setAddMemberContainer(false);
    setChatHistory(false);
    setSearchChat("");
    if (messageRefs[id]?.current) {
      messageRefs[id].current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    reduxDispatch(setSelectedMessage(id));
  };

  const handleCloseHistory = () => {
    setTools(true);
    setChatHistory(false);
  };

  const handleCloseImage = () => {
    setTools(true);
    setChatImage(false);
  };

  const handleCloseFile = () => {
    setTools(true);
    setChatFile(false);
  };

  const groups = messages.reduce((groups, item) => {
    if (groupUser.length > 0) {
      Object.entries(item).map((data) => {
        if (
          data[0] === user?.uid &&
          data[1].img !== false &&
          data[1].recall !== true
        ) {
          var date = moment(data[1].date).format();
          const newDate = date.split("T")[0];
          if (!groups[newDate]) {
            groups[newDate] = [];
          }
          groups[newDate].push(data);
        }
      });
      return groups;
    } else {
      if (item.img !== false) {
        var date = moment(item.date).format();
        const newDate = date.split("T")[0];
        if (!groups[newDate]) {
          groups[newDate] = [];
        }
        groups[newDate].push(item);
      }

      return groups;
    }
  }, {});

  const groupMessageByDate = useMemo(() => {
    const groups = messages.reduce((acc, item) => {
      // 👇 handle group vs private
      if (groupUser.length > 0) {
        Object.entries(item).forEach(([uid, msg]) => {
          if (uid === user?.uid && msg.img !== false && msg.recall !== true) {
            const date = moment(msg.date).format("YYYY-MM-DD");

            if (!acc[date]) {
              acc[date] = [];
            }

            acc[date].push(msg);
          }
        });
      } else {
        if (item.img !== false && item.recall !== true) {
          const date = moment(item.date).format("YYYY-MM-DD");

          if (!acc[date]) {
            acc[date] = [];
          }

          acc[date].push(item);
        }
      }

      return acc;
    }, {});

    return Object.keys(groups).map((date) => ({
      date,
      messages: groups[date],
    }));
  }, [messages, groupUser, user?.uid]);

  function deleteGroupConfirmation() {
    setDeleteConfirmation(true);
  }

  function deleteGroup() {
    groupUser.map((member) => {
      set(ref(db, "userChats/" + member.uid + "/" + data.chatId), null).then(
        (res) => {
          set(ref(db, "chats/" + data.chatId), null);
          set(ref(db, "groupChats/" + data.chatId), null);
          setTools(false);
          dispatch({
            type: "CHANGE_GROUP",
            payload: {
              groupInfo: {},
              userInfo: "null",
            },
          });
        },
      );
    });
  }

  function leaveGroupConfirmation() {
    setLeaveConfirmation(true);
  }

  function leaveGroup() {
    set(
      ref(db, "groupChats/" + data.chatId + "/" + user?.uid + "/remove"),
      true,
    );

    set(ref(db, "userChats/" + user?.uid + "/" + data.chatId), null)
      .then((res) => {
        setRemoveConfirmation(false);
        setShowMemberTools(false);
        dispatch({
          type: "CHANGE_GROUP",
          payload: {
            groupInfo: {},
            userInfo: "null",
          },
        });
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      {data.chatId !== "null" ? (
        <div className="chat">
          {data.user?.groupInfo ? (
            <div className="chatInfo">
              <div className="info">
                <img src={data.user?.groupInfo.photoURL} alt="" />
                <span>{data.user?.groupInfo.groupName}</span>
              </div>
              <div className="tools">
                <BiDotsHorizontalRounded
                  style={{ cursor: "pointer" }}
                  size={25}
                  onClick={() => {
                    handleOpenTools();
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="chatInfo">
              <div className="info">
                <img src={data.user?.photoURL} alt="" />
                <span>{data.user?.displayName}</span>
              </div>
              <div className="tools">
                <BiDotsHorizontalRounded
                  style={{ cursor: "pointer" }}
                  size={25}
                  onClick={() => {
                    handleOpenTools();
                  }}
                />
              </div>
            </div>
          )}
          <Messages />
          <Input />
          <div
            ref={addMemberRef}
            className={`addMemberMain ${addMemberContainer && "addMemberMain-active"}`}
          >
            <div className="newMemberList">
              <div className="title">
                <span>Invite New Member to Group</span>
                <AiOutlineArrowRight
                  size={20}
                  onClick={() => {
                    handleCloseMemberContainer();
                  }}
                />
              </div>
              <div className="newMemberMainListContainer">
                {ungroupMember &&
                  ungroupMember.map((item, index) => {
                    return (
                      <div className="newMemberContainer">
                        <div className="details">
                          <img src={item.photoURL} alt="" />
                          <span>{item.displayName}</span>
                        </div>
                        <label
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <input
                            className=""
                            type="checkbox"
                            onChange={(val) => {
                              handleSelectedMember(index, val);
                            }}
                            value={ungroupMember[index].uid}
                            checked={checkedMember[index]}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                    );
                  })}
              </div>
              <div
                className={`confirmInvite ${checkedMember && checkedMember.includes(true) && "confirmInvite-active"}`}
              >
                <ActionButton
                  backgroundColor={"#381256"}
                  width={"80%"}
                  buttonText={"INVITE MEMBER"}
                  justify={"center"}
                  onClick={() => {
                    addMember();
                  }}
                  textColor={"#FFFFFF"}
                />
              </div>
            </div>
          </div>
          {data.user?.groupInfo ? (
            <>
              <div
                ref={toolsContainerRef}
                className={`toolsContainer ${tools && !chatHistory && "toolsContainer-active"}`}
              >
                <div className="GroupInfoContainer">
                  <div className="backButton">
                    <AiOutlineArrowRight
                      size={20}
                      onClick={() => {
                        handleCloseTools();
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="file"
                    onChange={(e) => {
                      const fileSize = e.target.files[0].size;
                      const fileMB = Math.round(fileSize / 1024);
                      if (fileMB >= 4096) {
                        alert(
                          "File too Big, please select a file less than 4mb",
                        );
                      } else {
                        setGroupIcon(e.target.files[0]);
                        updateGroupIcon(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                  />
                  <label htmlFor="file">
                    <div className="addImageContainer">
                      <img
                        src={
                          groupIcon
                            ? URL.createObjectURL(groupIcon)
                            : data.user?.groupInfo.photoURL
                        }
                        alt=""
                      />
                      <div className="changeImage">
                        <FaCameraRetro
                          className="addImageIcon"
                          size={30}
                          color="rgb(217, 217, 217)"
                        />
                        <span>Change Group Icon</span>
                        <span>Size Limit 4MB*</span>
                      </div>
                    </div>
                  </label>
                  <div className="groupDetails">
                    <span>
                      Group · {groupUser && groupUser.length} Participants
                    </span>
                  </div>
                  <div className="addGroupTitleContainer">
                    <input
                      placeholder={data.user?.groupInfo.groupName}
                      value={groupName}
                      onChange={(e) => {
                        setGroupName(e.target.value);
                      }}
                    />
                    {groupName !== "" && (
                      <ActionButton
                        width={"120px"}
                        buttonText={"CONFIRM"}
                        justify={"space-evenly"}
                        onClick={() => {
                          updateGroupName();
                        }}
                        textColor={"#FFFFFF"}
                      />
                    )}
                  </div>
                  <div className="groupSettings">
                    <div className="muteSetting">
                      <div className="title">
                        <AiFillBell size={20} />
                        <span>Mute Notifications</span>
                      </div>
                      <Switch
                        checked={muteState}
                        onChange={(e) => muteGroup(e)}
                        onColor="#4BAB00"
                        onHandleColor="#FFFFFF"
                        handleDiameter={20}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={15}
                        width={35}
                      />
                    </div>
                    <div className="fileSettings">
                      <div
                        className="mediaButton"
                        onClick={() => {
                          setChatImage(true);
                          setTools(false);
                        }}
                      >
                        <div className="title">
                          <MdOutlinePermMedia size={15} />
                          <span>Media</span>
                        </div>
                        <AiOutlineRight className="icon" size={15} />
                      </div>
                      <div
                        className="fileButton"
                        onClick={() => {
                          setChatFile(true);
                          setTools(false);
                        }}
                      >
                        <div className="title">
                          <MdFilePresent size={15} />
                          <span>File</span>
                        </div>
                        <AiOutlineRight className="icon" size={15} />
                      </div>
                      <div
                        className="historyButton"
                        onClick={() => {
                          setChatHistory(true);
                          setTools(false);
                        }}
                      >
                        <div className="title">
                          <MdHistory size={15} />
                          <span>Chat History</span>
                        </div>
                        <AiOutlineRight className="icon" size={15} />
                      </div>
                    </div>

                    <div
                      className={`addMemberContainer ${addMemberContainer && "addMemberContainer-hide"}`}
                      onClick={() => {
                        handleAddMemberContainer();
                      }}
                    >
                      <div className="addMemberIcon">
                        <AiOutlineUserAdd size={25} color={"#FFF"} />
                      </div>
                      <div className="addMemberText">
                        <span>Add Participant</span>
                      </div>
                    </div>
                  </div>
                  <div className="groupMemberList">
                    {groupUser &&
                      groupUser.map((member, index) => {
                        if (member.remove !== true) {
                          return (
                            <div key={member.uid} className="member">
                              <div
                                className={`memberContainer ${showMemberTools[index] && "memberContainer-deactive"}`}
                                onClick={() => {
                                  if (
                                    user?.uid !== member.uid &&
                                    member.owner !== true
                                  ) {
                                    if (
                                      currentGroupUser?.admin === true ||
                                      currentGroupUser?.owner === true
                                    ) {
                                      handleManageMember(index);
                                    }
                                  }
                                }}
                              >
                                <div className={`memberInfo`}>
                                  <img src={member.photoURL} alt="" />
                                  <div className="textContainer">
                                    <div className="nameContainer">
                                      <span className="name">
                                        {member.displayName}
                                      </span>
                                      {member.owner && (
                                        <MdOutlineAdminPanelSettings
                                          size={15}
                                        />
                                      )}
                                      {member.admin && !member.owner && (
                                        <CgCrown size={13} />
                                      )}
                                    </div>
                                    <span className="desc">Coding is fun</span>
                                  </div>
                                </div>

                                {user?.uid !== member.uid &&
                                member.owner !== true ? (
                                  currentGroupUser?.admin === true ||
                                  currentGroupUser?.owner === true ? (
                                    <BiDotsHorizontalRounded
                                      style={{}}
                                      size={20}
                                    />
                                  ) : null
                                ) : null}
                              </div>

                              <div
                                className={`memberToolsContainer ${showMemberTools[index] && "memberToolsContainer-active"} ${removeConfirmation[index] && "memberToolsContainer-deactive"}`}
                              >
                                <div className="options">
                                  {!member.admin ? (
                                    <div
                                      className="giveAdmin"
                                      onClick={() => {
                                        AssignAdmin(member);
                                      }}
                                    >
                                      <span>Assign Admin</span>
                                    </div>
                                  ) : (
                                    <div
                                      className="giveAdmin"
                                      onClick={() => {
                                        UnassignAdmin(member);
                                      }}
                                    >
                                      <span size={20} color={"#FFF"}>
                                        Unassign Admin
                                      </span>
                                    </div>
                                  )}
                                  <div
                                    className="removeMember"
                                    onClick={() => {
                                      handleRemoveConfirmation(index);
                                      setSelectedRemover(member);
                                    }}
                                  >
                                    <span>Remove member</span>
                                  </div>
                                </div>
                                <div
                                  className="close"
                                  onClick={() => {
                                    setShowMemberTools(false);
                                  }}
                                >
                                  <AiOutlineRight size={20} />
                                </div>
                              </div>

                              <div
                                className={`removeConfirmation ${removeConfirmation[index] && "removeConfirmation-active"}`}
                              >
                                <div
                                  className="confirm"
                                  onClick={() => {
                                    removeMember(member);
                                  }}
                                >
                                  <span>CONFIRM</span>
                                </div>
                                <div
                                  className="cancel"
                                  onClick={() => {
                                    handleCancelRemove();
                                  }}
                                >
                                  <span>CANCEL</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })}
                  </div>

                  {currentGroupUser?.owner ? (
                    <div className={`deleteGroup`}>
                      <div
                        className={`${deleteConfirmation ? "deactive-delete" : "active-delete"}`}
                      >
                        <ActionButton
                          background={"red"}
                          width={"100%"}
                          buttonText={"LEAVE & DELETE GROUP"}
                          justify={"center"}
                          onClick={(e) => {
                            deleteGroupConfirmation();
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                      </div>
                      <div
                        className={`confirm ${deleteConfirmation && "activeConfirm"}`}
                      >
                        <ActionButton
                          background={"red"}
                          width={"100%"}
                          buttonText={"CONFIRM"}
                          justify={"center"}
                          onClick={(e) => {
                            deleteGroup();
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                        <ActionButton
                          width={"100%"}
                          buttonText={"CANCEL"}
                          justify={"center"}
                          onClick={(e) => {
                            setDeleteConfirmation(false);
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`deleteGroup`}>
                      <div
                        className={`${leaveConfirmation ? "deactive-delete" : "active-delete"}`}
                      >
                        <ActionButton
                          background={"red"}
                          width={"100%"}
                          buttonText={"LEAVE GROUP"}
                          justify={"center"}
                          onClick={(e) => {
                            leaveGroupConfirmation();
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                      </div>
                      <div
                        className={`confirm ${leaveConfirmation && "activeConfirm"}`}
                      >
                        <ActionButton
                          background={"red"}
                          width={"100%"}
                          buttonText={"CONFIRM"}
                          justify={"center"}
                          onClick={(e) => {
                            leaveGroup();
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                        <ActionButton
                          width={"100%"}
                          buttonText={"CANCEL"}
                          justify={"center"}
                          onClick={(e) => {
                            setLeaveConfirmation(false);
                          }}
                          textColor={"#FFFFFF"}
                          fontWeight={"800"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                ref={chatImageRef}
                className={`chatImageContainer ${chatImage && !tools && "chatImageContainer-active"}`}
              >
                <div className="ImageContainer">
                  <div className="backContainer">
                    <AiOutlineArrowLeft
                      className="icon"
                      size={18}
                      onClick={() => {
                        handleCloseImage();
                      }}
                    />
                    <span>All Images in {data.user?.groupInfo?.groupName}</span>
                  </div>
                  <div className="AllImage">
                    {groupMessageByDate
                      .sort((a, b) => moment(a.date) - moment(b.date))
                      .map((item) => {
                        return (
                          <>
                            {item.messages.length !== 0 && (
                              <div className="groupDateContainer">
                                <GoCalendar size={16} />
                                <span className="groupDate">
                                  {moment(item.date).format("DD-MM") ==
                                  moment().format("DD-MM")
                                    ? "Today"
                                    : moment(item.date).format("ddd, DD-MM")}
                                </span>
                              </div>
                            )}
                            <div className="ImageContainer row">
                              {item &&
                                item.messages.length &&
                                item.messages.map((data) => {
                                  return (
                                    <a
                                      className="Image col-sm-4"
                                      download
                                      target={"_blank"}
                                      href={data[1]?.img}
                                    >
                                      <img
                                        className=""
                                        src={data[1]?.img}
                                        alt=""
                                      />
                                    </a>
                                  );
                                })}
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div
                ref={chatFileRef}
                className={`chatFileContainer ${chatFile && !tools && "chatFileContainer-active"}`}
              >
                <div className="FileContainer">
                  <div className="backContainer">
                    <AiOutlineArrowLeft
                      className="backButton"
                      size={18}
                      onClick={() => {
                        handleCloseFile();
                      }}
                    />
                    <span>All Files in {data.user?.groupInfo?.groupName}</span>
                  </div>
                  <div className="AllFile">
                    {messages && messages.length > 0 ? (
                      <>
                        {messages.map((item) => {
                          let arrOfArrays = Object.entries(item);
                          let sorted = arrOfArrays.sort((a, b) => {
                            return a[1].date - b[1].date;
                          });
                          return sorted
                            .filter(
                              (e) =>
                                e[1].file !== false && e[0] === user?.uid && e,
                            )
                            .map((val) => {
                              if (val[1].recall !== true) {
                                return (
                                  <a
                                    key={val[0]}
                                    className="fileElement"
                                    download
                                    target={"_blank"}
                                    href={val[1].file}
                                  >
                                    <div className="fileNameContainer">
                                      <AiFillFile
                                        size={17}
                                        color={"rgb(49, 49, 49)"}
                                      />
                                      <span>{val[1].fileName}</span>
                                    </div>
                                    <div className="fileDetails">
                                      <span>
                                        {parseInt(val[1].fileSize) < 1000000
                                          ? (
                                              parseInt(val[1].fileSize) / 1000
                                            ).toFixed(2) + " KB"
                                          : (
                                              parseInt(val[1].fileSize) /
                                              1000000
                                            ).toFixed(2) + " MB"}
                                      </span>
                                      <span>
                                        {moment(val[1].date).format("DD-MM") ===
                                        moment().format("DD-MM")
                                          ? "Today"
                                          : moment(val[1].date).format("DD-MM")}
                                      </span>
                                    </div>
                                  </a>
                                );
                              }
                            });
                        })}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>

              <div
                ref={chatHistoryRef}
                className={`chatHistoryContainer ${chatHistory && !tools && "chatHistoryContainer-active"}`}
              >
                <div className="historyContainer">
                  <div className="searchContainer">
                    <AiOutlineArrowLeft
                      className="icon"
                      size={18}
                      onClick={() => {
                        handleCloseHistory();
                      }}
                    />
                    <SearchField
                      placeholder="Search Chat"
                      onChange={(e) => {
                        setSearchChat(e.target.value);
                      }}
                      value={searchChat}
                      searchText={searchChat}
                      closeFunction={() => {
                        setSearchChat("");
                      }}
                    />
                  </div>
                  <div className="searchResult">
                    {searchChat === "" ? (
                      <div className="instruction">
                        <span className="normal">Search chat within</span>
                        <span className="groupName">
                          {data.user?.groupInfo?.groupName}
                        </span>
                      </div>
                    ) : (
                      <>
                        {searchResult.length > 0 ? (
                          <div className="result">
                            {searchResult
                              .sort((a, b) => moment(a.date) - moment(b.date))
                              .map((item) => {
                                return (
                                  <div
                                    key={item.id}
                                    className="resultSub"
                                    onClick={() => {
                                      handleFindMessage(item.id);
                                    }}
                                  >
                                    {item.senderId === user?.uid ? (
                                      <div className="details">
                                        <span>{user.displayName}</span>
                                        <span>
                                          {moment(item.date).format(
                                            "DD/MM/YY",
                                          ) === moment().format("DD/MM/YY")
                                            ? "Today"
                                            : moment(item.date).format(
                                                "DD/MM/YY",
                                              )}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        {groupUser &&
                                          groupUser.map(
                                            (user) =>
                                              user?.uid === item.senderId && (
                                                <div className="details">
                                                  <span>
                                                    {user.displayName}
                                                  </span>
                                                  <span>
                                                    {moment(item.date).format(
                                                      "DD/MM/YY",
                                                    ) ===
                                                    moment().format("DD/MM/YY")
                                                      ? "Today"
                                                      : moment(
                                                          item.date,
                                                        ).format("DD/MM/YY")}
                                                  </span>
                                                </div>
                                              ),
                                          )}
                                      </>
                                    )}
                                    <span>{item.text}</span>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="noResult">
                            <span>No Chat Found</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                ref={toolsContainerRef}
                className={`toolsContainer ${tools && "toolsContainer-active"}`}
              >
                <div className="userSettings">
                  <div className="muteSetting">
                    <div className="title">
                      <AiFillBell size={20} />
                      <span>Mute Notifications</span>
                    </div>
                    <Switch
                      checked={privateMuteState}
                      onChange={(e) => muteUser(e)}
                      onColor="#4BAB00"
                      onHandleColor="#FFFFFF"
                      handleDiameter={20}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      width={35}
                    />
                  </div>

                  <div className="fileSettings">
                    <div
                      className="mediaButton"
                      onClick={() => {
                        setChatImage(true);
                        setTools(false);
                      }}
                    >
                      <div className="title">
                        <MdOutlinePermMedia size={15} />
                        <span>Media</span>
                      </div>
                      <AiOutlineRight className="icon" size={15} />
                    </div>
                    <div
                      className="fileButton"
                      onClick={() => {
                        setChatFile(true);
                        setTools(false);
                      }}
                    >
                      <div className="title">
                        <MdFilePresent size={15} />
                        <span>File</span>
                      </div>
                      <AiOutlineRight className="icon" size={15} />
                    </div>
                    <div
                      className="historyButton"
                      onClick={() => {
                        setChatHistory(true);
                        setTools(false);
                      }}
                    >
                      <div className="title">
                        <MdHistory size={15} />
                        <span>Chat History</span>
                      </div>
                      <AiOutlineRight className="icon" size={15} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                ref={chatImageRef}
                className={`chatImageContainer ${chatImage && !tools && "chatImageContainer-active"}`}
              >
                <div className="ImageContainer">
                  <div className="backContainer">
                    <AiOutlineArrowLeft
                      className="icon"
                      size={18}
                      onClick={() => {
                        handleCloseImage();
                      }}
                    />
                    <span>All Images in {data.user?.groupInfo?.groupName}</span>
                  </div>
                  <div className="AllImage">
                    {groupMessageByDate
                      .sort((a, b) => moment(a.date) - moment(b.date))
                      .map((item) => {
                        return (
                          <>
                            {item.messages.length !== 0 && (
                              <div className="groupDateContainer">
                                <GoCalendar size={16} />
                                <span className="groupDate">
                                  {moment(item.date).format("DD-MM") ==
                                  moment().format("DD-MM")
                                    ? "Today"
                                    : moment(item.date).format("ddd, DD-MM")}
                                </span>
                              </div>
                            )}
                            <div className="ImageContainer row">
                              {item &&
                                item.messages.length &&
                                item.messages.map((data) => {
                                  if (data.recall !== true) {
                                    return (
                                      <a
                                        className="Image col-sm-4"
                                        download
                                        target={"_blank"}
                                        href={data?.img}
                                      >
                                        <img
                                          className=""
                                          src={data?.img}
                                          alt=""
                                        />
                                      </a>
                                    );
                                  }
                                })}
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div
                ref={chatFileRef}
                className={`chatFileContainer ${chatFile && !tools && "chatFileContainer-active"}`}
              >
                <div className="FileContainer">
                  <div className="backContainer">
                    <AiOutlineArrowLeft
                      className="backButton"
                      size={18}
                      onClick={() => {
                        handleCloseFile();
                      }}
                    />
                    <span>All Files with {data.user?.displayName}</span>
                  </div>
                  <div className="AllFile">
                    {messages && messages.length > 0 ? (
                      <>
                        {messages
                          .sort((a, b) => {
                            return a.date - b.date;
                          })
                          .filter((e) => e.file !== false && e)
                          .map((item) => {
                            if (item.recall !== true) {
                              return (
                                <a
                                  key={item.id}
                                  className="fileElement"
                                  download
                                  target="_blank"
                                  href={item.file}
                                >
                                  <div className="fileNameContainer">
                                    <AiFillFile
                                      size={17}
                                      color={"rgb(49, 49, 49)"}
                                    />
                                    <span>{item.fileName}</span>
                                  </div>
                                  <div className="fileDetails">
                                    <span>
                                      {parseInt(item.fileSize) < 1000000
                                        ? (
                                            parseInt(item.fileSize) / 1000
                                          ).toFixed(2) + " KB"
                                        : (
                                            parseInt(item.fileSize) / 1000000
                                          ).toFixed(2) + " MB"}
                                    </span>
                                    <span>
                                      {moment(item.date).format("DD-MM") ===
                                      moment().format("DD-MM")
                                        ? "Today"
                                        : moment(item.date).format("DD-MM")}
                                    </span>
                                  </div>
                                </a>
                              );
                            }
                          })}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>

              <div
                ref={chatHistoryRef}
                className={`chatHistoryContainer ${chatHistory && !tools && "chatHistoryContainer-active"}`}
              >
                <div className="historyContainer">
                  <div className="searchContainer">
                    <AiOutlineArrowLeft
                      className="icon"
                      size={18}
                      onClick={() => {
                        handleCloseHistory();
                      }}
                    />
                    <SearchField
                      placeholder="Search Chat"
                      onChange={(e) => {
                        setSearchChat(e.target.value);
                      }}
                      value={searchChat}
                      searchText={searchChat}
                      closeFunction={() => {
                        setSearchChat("");
                      }}
                    />
                  </div>
                  <div className="searchResult">
                    {searchChat === "" ? (
                      <div className="instruction">
                        <span className="normal">Search chat with</span>
                        <span className="groupName">
                          {data?.user?.displayName}
                        </span>
                      </div>
                    ) : (
                      <>
                        {searchResult.length > 0 ? (
                          <div className="result">
                            {searchResult
                              .sort((a, b) => moment(a.date) - moment(b.date))
                              .map((item) => {
                                return (
                                  <div
                                    key={item.id}
                                    className="resultSub"
                                    onClick={() => {
                                      handleFindMessage(item.id);
                                    }}
                                  >
                                    {item.senderId === user?.uid ? (
                                      <div className="details">
                                        <span>{user.displayName}</span>
                                        <span>
                                          {moment(item.date).format(
                                            "DD/MM/YY",
                                          ) === moment().format("DD/MM/YY")
                                            ? "Today"
                                            : moment(item.date).format(
                                                "DD/MM/YY",
                                              )}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="details">
                                        <span>{data.user.displayName}</span>
                                        <span>
                                          {moment(item.date).format(
                                            "DD/MM/YY",
                                          ) === moment().format("DD/MM/YY")
                                            ? "Today"
                                            : moment(item.date).format(
                                                "DD/MM/YY",
                                              )}
                                        </span>
                                      </div>
                                    )}
                                    <span>{item.text}</span>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="noResult">
                            <span>No Chat Found</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="chat">
          <div className="EmptyChatInfo">
            {/* <img src={require("../assets/img/chat-icon.png")} alt=""/> */}
            <div className="textContainer">
              <FaHandPointLeft size={20} />
              <span>Start a Chat</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
