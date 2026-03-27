import {
  createContext,
  useEffect,
  useState,
  useReducer,
  useContext,
} from "react";
import { ref, onValue } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { db } from "@/config/firebaseConfig";
import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const user = useSelectUser();
  const allUserList = useSelectAllCompanyUsers();
  const [groupUserInfo, setGroupUserInfo] = useState([]);

  const [chats, setChats] = useState([]);
  const [ChatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState([]);

  const reduxDispatch = useDispatch();
  const { selectedChat, chatId } = useSelector((state) => state.chat);
  const [chatIdList, setChatIdList] = useState([]);

  const dispatch = (action) => {
    if (action.type === "CHANGE_USER") {
      reduxDispatch(
        setPrivateChat({
          currentUserId: user.uid,
          user: action.payload,
        }),
      );
    }

    if (action.type === "CHANGE_GROUP") {
      reduxDispatch(
        setGroupChat({
          group: action.payload,
        }),
      );
    }
  };
  useEffect(() => {
    const groupChatsRef = ref(db, "groupChats/" + chatId);
    const unsub = onValue(groupChatsRef, (snapshot) => {
      if (snapshot.exists()) {
        let allUser = [];
        const data = Object.entries(snapshot.val());
        for (var x = 0; x < data?.length; x++) {
          allUser.push(data[x][1]);
        }
        const filteredUsers = allUser.filter((user) => {
          return allUserList.some((listUser) => listUser.uid === user.uid);
        });

        setGroupUserInfo(filteredUsers);
      } else {
        setGroupUserInfo([]);
      }
    });

    return () => {
      unsub();
    };
  }, [chatId]);

  useEffect(() => {
    let tempData = [];

    const chatsRef = ref(db, "userChats/" + user?.uid);
    const unsub = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      setChats(data);
      data &&
        Object.entries(data).map((item) => {
          tempData.push(item[0]);
        });
      setChatIdList(tempData);
    });

    return () => {
      unsub();
    };
  }, [user]);

  useEffect(() => {
    if (chatIdList?.length > 0) {
      const unreadRef = ref(db, "chats");
      onValue(unreadRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const intersection = Object.entries(data).filter((element) =>
            chatIdList.includes(element[0]),
          );
          setChatMessages(intersection);
        }
      });
    }
  }, [chatId]);

  useEffect(() => {
    if (ChatMessages?.length > 0) {
      const categorizeMessage = ChatMessages.map((item) => {
        if (item[1]?.messages) {
          const countUnreadPM = Object.entries(item[1]?.messages).filter(
            (value) => {
              // if((value[1].text !== "" && value[1].text !== null)){
              //   if(value[1].id){
              //     if(value[1].senderId !== user?.uid && value[1].hasRead === false){
              //       return value[1]
              //     }
              //   }else{
              //     if(value[1][user?.uid] !== undefined){
              //       if(value[1][user?.uid].senderId !== user?.uid && value[1][user?.uid].hasRead === false){
              //         return value[1][user?.uid]
              //       }
              //     }
              //   }
              // }
              if (value[1].id) {
                if (
                  value[1].senderId !== user?.uid &&
                  value[1].hasRead === false &&
                  value[1].text !== "" &&
                  value[1].text !== null
                ) {
                  // return value[1]
                  return true;
                }
              } else {
                if (
                  value[1][user?.uid] !== undefined &&
                  value[1][user?.uid].text !== "" &&
                  value[1][user?.uid].text !== null
                ) {
                  if (
                    value[1][user?.uid].senderId !== user?.uid &&
                    value[1][user?.uid].hasRead === false
                  ) {
                    // return value[1][user?.uid]
                    return true;
                  }
                }
              }

              return false;
            },
          )?.length;

          return {
            id: item[0],
            messages: countUnreadPM,
          };
        }
      });

      setUnreadCount(categorizeMessage);
    }
  }, [ChatMessages]);
  return (
    <ChatContext.Provider
      value={{
        data: {
          chatId,
          user: selectedChat,
        },
        groupUser: groupUserInfo,
        dispatch, // still works!
        chats,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
