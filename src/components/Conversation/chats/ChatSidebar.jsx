import React, { useEffect, useState, useContext } from "react";
import Chats from "./Chats";
import ChatSearch from "./ChatSearch";
import { MdGroupAdd } from "react-icons/md";
import { onValue, ref, set } from "firebase/database";
import {
  ref as ref_storage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { BiArrowBack } from "react-icons/bi";
import { AiFillCloseCircle, AiOutlineCheck } from "react-icons/ai";
import { BsArrowRightShort } from "react-icons/bs";
import { FaCameraRetro } from "react-icons/fa";
import SearchField from "@/components/FormComponents/SearchField";
import { useDispatch } from "react-redux";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { db, storage } from "@/config/firebaseConfig";
import { setGroupChat } from "../../../../redux/slices/chatSlice";
import { useMemo } from "react";

const ChatSidebar = (props) => {
  const isSuperAdmin = props.isSuperAdmin;
  const Conversation_Group = props.Conversation_Group || false;

  const dispatch = useDispatch();

  const user = useSelectUser();
  const [currPage, setCurrPage] = useState("CHATS");
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState([]);
  const [groupIcon, setGroupIcon] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [currUser, setCurrUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  function user_handleSnapshot(snapshot) {
    var returnArr = [];

    snapshot.forEach(function (childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;
      if (item.uid !== user?.uid) {
        returnArr.push(item);
      } else {
        setCurrUser(item);
      }
    });

    setUsers(returnArr);
  }

  useEffect(() => {
    const userRef = ref(db, "users/");

    const unsubscribe = onValue(userRef, (snapshot) => {
      user_handleSnapshot(snapshot);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddGroup = () => {
    setCurrPage("ADD_MEMBER_GROUP");
    setSelectedUser([]);
    setSearchText("");
    // reloadUser();
  };

  const handleBackChats = () => {
    setCurrPage("CHATS");
    setSelectedUser([]);
    // reloadUser();
  };

  const handleSelectedUser = (userObj) => {
    setSelectedUser((prev) =>
      prev.some((u) => u.uid === userObj.uid) ? prev : [...prev, userObj],
    );

    setUsers((prev) => prev.filter((item) => item.uid !== userObj.uid));
  };

  const handleRemoveSelected = (userObj) => {
    setUsers((prev) => [...prev, userObj]);

    setSelectedUser((prev) => prev.filter((item) => item.uid !== userObj.uid));
  };

  const handleConfirmUserGroup = () => {
    setCurrPage("ADD_TITLE");
  };

  const handleBackGroupMember = () => {
    setCurrPage("ADD_MEMBER_GROUP");
  };

  function handleInputGroupIcon(value) {
    const fileSize = value.size;
    const fileMB = Math.round(fileSize / 1024);
    if (fileMB >= 4096) {
      alert("File too Big, please select a file less than 4mb");
    } else {
      setGroupIcon(value);
    }
  }

  const handleCreateGroupChat = async () => {
    setIsLoading(true);

    const dateNow = Date.now();

    const combinedId =
      user?.uid + selectedUser.map((u) => u.uid).join("") + dateNow;

    const defaultImage =
      "https://firebasestorage.googleapis.com/v0/b/rexsoft-crm.appspot.com/o/default_group.jpeg?alt=media&token=0e170b9c-7c26-40b5-ba8a-4e52923ec57e";

    try {
      let photoURL = defaultImage;

      // upload if have icon
      if (groupIcon) {
        const storageRef = ref_storage(
          storage,
          "/chatGroupIcons/" + combinedId,
        );
        const uploadTask = uploadBytesResumable(storageRef, groupIcon);

        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed", null, reject, async () => {
            photoURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          });
        });
      }

      const dispatchData = {
        chatId: combinedId,
        isGroup: true,
        groupInfo: {
          groupName,
          photoURL,
        },
      };

      dispatch(
        setGroupChat({
          group: {
            userInfo: combinedId,
            groupInfo: {
              groupName,
              photoURL,
            },
          },
        }),
      );

      // create for all members
      const allMembers = [...selectedUser, user];

      for (const member of allMembers) {
        await set(ref(db, `userChats/${member.uid}/${combinedId}`), {
          userInfo: combinedId,
          date: dateNow,
          groupInfo: {
            groupName,
            photoURL,
          },
        });

        await set(ref(db, `groupChats/${combinedId}/${member.uid}`), {
          admin: member.uid === user?.uid,
          owner: member.uid === user?.uid,
          mute: false,
          uid: member.uid,
          displayName: member.displayName,
          photoURL: member.photoURL,
        });
      }

      setGroupIcon(null);
      setGroupName("");
      setCurrPage("CHATS");
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  };

  const filteredUsers = useMemo(() => {
    const keyword = searchText.toLowerCase();

    return users
      ?.filter((item) => {
        const name = item.displayName || ""; // fallback
        return name.toLowerCase().includes(keyword);
      })
      ?.sort((a, b) =>
        (a.displayName || "").localeCompare(b.displayName || ""),
      );
  }, [users, searchText]);

  return (
    <>
      {currPage === "ADD_MEMBER_GROUP" && (
        <div className="SidebarAddGroup">
          <div className="backChatContainer">
            <BiArrowBack
              className="backBtn"
              size={20}
              color={"#4F4F4F"}
              onClick={handleBackChats}
            />
            <div className="searchContainer">
              <SearchField
                placeholder="Find user"
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                value={searchText}
                searchText={searchText}
                closeFunction={() => {
                  setSearchText("");
                }}
              />
            </div>
          </div>
          <div className="selectedUserContainer">
            {selectedUser &&
              selectedUser.map((item) => {
                return (
                  <div className="selectedUserToGroup">
                    <span>{item.displayName}</span>
                    <div>
                      <AiFillCloseCircle
                        className="removeSelectedUserBtn"
                        size={16}
                        color={"white"}
                        onClick={() => {
                          handleRemoveSelected(item);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          {filteredUsers?.length === 0 && (
            <div className="noUserFound">No users found</div>
          )}

          {filteredUsers?.map((item) => {
            return (
              <div
                className="SidebarListUser"
                onClick={() => handleSelectedUser(item)}
                key={item.uid}
              >
                <div className="ListUserDetails">
                  <img src={item.photoURL} alt="" />
                  <span>{item.displayName}</span>
                </div>
              </div>
            );
          })}
          {selectedUser.length > 1 && (
            <div className="NextContainer">
              <BsArrowRightShort
                onClick={handleConfirmUserGroup}
                size={30}
                color={"white"}
              />
            </div>
          )}
        </div>
      )}
      {currPage === "CHATS" && (
        <div className="Sidebar">
          <div className="SidebarToolsContainer">
            <div className="SidebarProfile">
              <img src={user?.photoURL} alt="" />
              <div className="userDetails">
                <span className="name">{user?.displayName}</span>
              </div>
            </div>
            {(isSuperAdmin || Conversation_Group) && (
              <div className="SidebarAddGroupBtn">
                <MdGroupAdd
                  className="AddGroupBtn"
                  size={25}
                  color={"#4F4F4F"}
                  onClick={handleAddGroup}
                />
              </div>
            )}
          </div>
          <ChatSearch />
          <Chats />
        </div>
      )}
      {currPage === "ADD_TITLE" && (
        <div className={`SidebarAddTitle ${isLoading && "showLoading"}`}>
          {/* <C_Loading_Login isLoading={isLoading}/> */}
          <div
            className={`SidebarAddTitleWrapper ${isLoading && "hideWrapper"}`}
          >
            <div className="backGroupContainer">
              <BiArrowBack
                className="backGroupBtn"
                size={20}
                color={"#4F4F4F"}
                onClick={handleBackGroupMember}
              />
            </div>
            <div className="GroupInfoContainer">
              <input
                type="file"
                style={{ display: "none" }}
                id="file"
                onChange={(e) => handleInputGroupIcon(e.target.files[0])}
                accept="image/*"
              />
              <label htmlFor="file">
                {groupIcon ? (
                  <div className="displayImageContainer">
                    <img src={URL.createObjectURL(groupIcon)} alt="" />
                  </div>
                ) : (
                  <div className="addImageContainer">
                    <FaCameraRetro
                      className="addImageIcon"
                      size={30}
                      color="rgb(217, 217, 217)"
                    />
                    <span>Group Icon</span>
                  </div>
                )}
              </label>
              <div className="addGroupTitleContainer">
                <input
                  placeholder={"Group Name"}
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="selectedUserToGroup">
              {selectedUser &&
                selectedUser.map((item) => {
                  return <img key={item.uid} src={item.photoURL} alt="" />;
                })}
            </div>
            {groupName !== "" && (
              <div className="CompleteContainer">
                <AiOutlineCheck
                  onClick={handleCreateGroupChat}
                  size={30}
                  color={"white"}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
