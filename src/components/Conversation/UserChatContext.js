// import { createContext, useEffect, useState, useReducer, useContext } from "react";
// import { auth } from "../firebaseInit";
// import { onAuthStateChanged } from "firebase/auth";
// import { useUserAuth } from "./UserAuthContext";
// import { db } from "../firebaseInit";
// import { ref, onValue } from "firebase/database";
// import { NotificationContext } from "./NotificationContext";

// export const ChatContext = createContext();

// export const ChatContextProvider = ({ children }) => {

//     const { user } = useUserAuth();
//     const { allUserList } = useContext(NotificationContext);
//     const [groupUserInfo, setGroupUserInfo] = useState([]);

//     const [chats, setChats] = useState([]);
//     const [chatId, setChatId] = useState([]);
//     const [ChatMessages, setChatMessages] = useState([]);
//     const [unreadCount, setUnreadCount] = useState([]);
    
//     const INITIAL_STATE = {
//         chatId: "null",
//         user: {}
//     }

//     const chatReducer = (state, action) => {
//         switch(action.type){
//             case "CHANGE_USER":
//                 return {
//                     user: action.payload,
//                     chatId: user?.uid > action.payload.uid
//                         ? user?.uid + action.payload.uid
//                         : action.payload.uid + user?.uid
//                 };
//             case "CHANGE_GROUP":
//                 return {
//                     user: action.payload,
//                     chatId: action.payload.userInfo
//                 };
//             case "UPDATE_GROUP":
//                 return{
//                     user: action.payload,
//                     chatId: action.payload.userInfo
//                 }
//             default:
//                 return state;
//         };
//     };

//     const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);
    
//     useEffect(() => {

//     const groupChatsRef = ref(db, 'groupChats/' + state.chatId);
//     const unsub = onValue(groupChatsRef, (snapshot) => {
//         if(snapshot.exists()){
//           let allUser = []
//           const data = Object.entries(snapshot.val());
//           for(var x = 0; x < data?.length; x++){
//               allUser.push(data[x][1])
//           }
//           const filteredUsers = allUser.filter(user => {
//             return allUserList.some(listUser => listUser.uid === user.uid);
//           });

//           setGroupUserInfo(filteredUsers)
//         }else {
//           setGroupUserInfo([])
//         }
//       });

//       return () => {
//           unsub();
//       };

//     }, [state.chatId]);


//     useEffect(() => {
          
//       let tempData = [];

//       const chatsRef = ref(db, 'userChats/' + user?.uid);
//       const unsub = onValue(chatsRef, (snapshot) => {
//         const data = snapshot.val();
//         setChats(data)
//         data && Object.entries(data).map(item => {
//           tempData.push(item[0]);
//         })
//         setChatId(tempData);
//       });

//       return () => {
//         unsub();
//       };
    
//     },[user])
    
//     useEffect(() => {
//       if(chatId?.length > 0){
//         const unreadRef = ref(db, 'chats');
//         onValue(unreadRef, (snapshot) => {
//           if(snapshot.exists()){
//             const data = snapshot.val()
//             const intersection = Object.entries(data).filter(element => chatId.includes(element[0]));
//             setChatMessages(intersection)
//           };
//         });
//       };
//     },[chatId]);
  
//     useEffect(() => {
//       if(ChatMessages?.length > 0){
//         const categorizeMessage = ChatMessages.map(item => {
//           if(item[1]?.messages){
//             const countUnreadPM = Object.entries(item[1]?.messages).filter(value => {
//               // if((value[1].text !== "" && value[1].text !== null)){
//               //   if(value[1].id){
//               //     if(value[1].senderId !== user?.uid && value[1].hasRead === false){
//               //       return value[1]
//               //     }
//               //   }else{
//               //     if(value[1][user?.uid] !== undefined){
//               //       if(value[1][user?.uid].senderId !== user?.uid && value[1][user?.uid].hasRead === false){
//               //         return value[1][user?.uid]
//               //       }
//               //     }
//               //   }
//               // }
//               if(value[1].id){
//                 if(value[1].senderId !== user?.uid 
//                   && value[1].hasRead === false 
//                   && (value[1].text !== "" && value[1].text !== null)){
//                   // return value[1]
//                   return true;
//                 }
//               }else{
//                 if(value[1][user?.uid] !== undefined 
//                   && (value[1][user?.uid].text !== "" && value[1][user?.uid].text !== null)){
//                   if(value[1][user?.uid].senderId !== user?.uid && value[1][user?.uid].hasRead === false){
//                     // return value[1][user?.uid]
//                     return true;
//                   }
//                 }
//               }

//               return false;
//             })?.length
    
//             return {
//               id: item[0],
//               messages: countUnreadPM
//             }
//           }
//         });
  
//         setUnreadCount(categorizeMessage);
  
//       }
      
//     },[ChatMessages])

//   return (
//       <ChatContext.Provider value={{ data: state, groupUser: groupUserInfo, dispatch, chats: chats, unreadCount: unreadCount }}>
//           {children}
//       </ChatContext.Provider>
//   );

// };