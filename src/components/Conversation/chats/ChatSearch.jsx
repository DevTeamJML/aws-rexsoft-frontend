import React, { useEffect, useMemo, useState } from "react";
import { set, ref, get } from "firebase/database";
import SearchField from "@/components/FormComponents/SearchField";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { useSelectAllCompanyUsers } from "../../../../redux/slices/companySlice";
import { useDispatch } from "react-redux";
import { db } from "@/config/firebaseConfig";
import { setPrivateChat } from "../../../../redux/slices/chatSlice";

const ChatSearch = () => {
  const user = useSelectUser();

  const allUserList = useSelectAllCompanyUsers();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [targetUser, setTargetUser] = useState([]);

  const normalizedUsers = useMemo(() => {
    return allUserList.map((u) => ({
      ...u,
      uid: u.user_id,
      displayName: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
    }));
  }, [allUserList]);

  useEffect(() => {
    if (!username) {
      setTargetUser([]);
      return;
    }

    const searchResult = normalizedUsers.filter(
      (item) =>
        item?.displayName?.toLowerCase().includes(username.toLowerCase()) &&
        item?.uid !== user?.uid,
    );

    setTargetUser(searchResult);
  }, [username, normalizedUsers, user]);

  const handleSelect = async (selectedUser) => {
    if (!user?.uid || !selectedUser?.uid) return;

    const combinedId = [user.uid, selectedUser.uid].sort().join("");

    const chatsRef = ref(db, "chats/" + combinedId);
    const dateNow = Date.now();

    try {
      const snapshot = await get(chatsRef);

      if (!snapshot.exists()) {
        try {
          await set(ref(db, `chats/${combinedId}`), {
            messages: {},
            init: true
          });
          console.log("CHAT WRITE SUCCESS");
        } catch (e) {
          console.error("CHAT WRITE FAILED:", e);
        }
        // create chat for current user
        await set(ref(db, `userChats/${user.uid}/${combinedId}`), {
          userInfo: {
            uid: selectedUser.uid,
            displayName: selectedUser.displayName,
            photoURL: selectedUser.photoURL,
          },
          date: dateNow,
          mute: false,
          lastMessage: {
            text: "",
            recall: false,
          },
        });

        // create chat for target user
        await set(ref(db, `userChats/${selectedUser.uid}/${combinedId}`), {
          userInfo: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          date: dateNow,
          mute: false,
          lastMessage: {
            text: "",
            recall: false,
          },
        });
      }

      dispatch(
        setPrivateChat({
          currentUserId: user?.uid,
          user: selectedUser,
          chatId: combinedId,
        }),
      );

    } catch (err) {
      console.error(err);
    }

    setTargetUser([]);
    setUsername("");
  };

  return (
    <div className="search">
      <div className="searchForm">
        <SearchField
          placeholder="Find a user"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          closeFunction={() => setUsername("")}
        />
      </div>

      {targetUser.length > 0 &&
        targetUser.map((item) => (
          <div
            key={item.uid}
            className="userChat"
            onClick={() => handleSelect(item)}
          >
            <img src={item.photoURL} alt="" />
            <div className="userChatInfo">
              <span className="name">{item.displayName}</span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ChatSearch;
