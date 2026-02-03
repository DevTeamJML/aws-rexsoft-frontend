// import { useContext, useEffect, useState } from "react";
// import { useUserAuth } from "../context/UserAuthContext";
// import { ChatContext } from "../context/UserChatContext";
// import { messageContext } from "../context/ChatScrollContext";
// import moment from "moment";
// import { NotificationContext } from "../context/NotificationContext";

// const Chats = () => {

//   const [selectedChat, setSelectedChat] = useState();

//   const { user } = useUserAuth();
//   const { dispatch, chats, unreadCount } = useContext(ChatContext);
//   const { dispatchDoc, fileInputRef, imageInputRef, dispatchQuote } = useContext(messageContext);
//   const { allUserList } = useContext(NotificationContext);

//   const [newChats, setNewChats] = useState([]);

//   const handleSelect = (u) => {

//     dispatchDoc({ type:"CHOOSEN_FILE", payload: null })
//     dispatchQuote({ type:"QUOTE", payload: null})
//     if(imageInputRef.current || fileInputRef.current){
//       imageInputRef.current.value = null;
//       fileInputRef.current.value = null;
//     }
//     if(u.groupInfo){
//       setSelectedChat(u);
//       dispatch({ type:"CHANGE_GROUP", payload: u })
//     } else {
//       setSelectedChat(u);
//       dispatch({ type:"CHANGE_USER", payload: u })
//     }
//   };

//   useEffect(() => {

//     if(chats){
//       const filteredChats = Object.entries(chats).filter(chat => {
//         // If the chat has groupInfo, add it to the filtered array and move to the next chat
//         if (chat[1].groupInfo) {
//           return true;
//         }
        
//         // Check if the chat's uid exists in allUserList
//         return allUserList.some(user => user.uid === chat[1].userInfo.uid);
//       });
      
//       setNewChats(filteredChats);
//     }

//   },[chats, allUserList])

//   return (
//     <div className="chats">
//       {newChats && newChats.sort((a, b) => b[1].date - a[1].date).map((chat) => {
//         if(chat[1].groupInfo){
//           return(
//             <div className={`userChat ${chat[1].userInfo === selectedChat?.userInfo && "selectedChat"}`} key={chat[0]} onClick={() => handleSelect({
//                 userInfo: chat[1].userInfo, 
//                 groupInfo: chat[1].groupInfo
//               })}>
//               <div className="chatsImage">
//                 <img src={chat[1].groupInfo.photoURL} alt="" />
//               </div>
//               <div className="userChatInfo">
//                 <div className="firstLine">
//                   <span className="name">{chat[1].groupInfo.groupName}</span>
//                   <span className="message">{!chat[1].lastMessage?.recall ? chat[1].lastMessage?.text : "message recalled"}</span>
//                 </div>
//                 <div className="secondLine">
//                   <span className="date">{moment(chat[1].date).format("DD/MM") !== moment().format("DD/MM") ? moment(chat[1].date).format("DD/MM") : "Today"}</span>
//                   {unreadCount.map(item => {
//                     if(item.id === chat[0]){
//                       return(
//                         <div key={item.id} className={`unreadMessage ${item.messages !== 0 && 'unreadMessage-active'}`}>
//                           <span>{item.messages < 100 ? item.messages : '...'}</span>
//                         </div>
//                       )
//                     }
//                   })}
//                 </div>
//               </div>
//             </div>
//           )
//         } else{
//           return(
//             <div className={`userChat ${chat[1].userInfo?.uid === selectedChat?.uid && "selectedChat"}`} key={chat[0]} onClick={() => handleSelect(chat[1].userInfo)}>
//               {allUserList && allUserList?.map(user => {
//                 if(user.uid === chat[1].userInfo?.uid){
//                   return(
//                     <>
//                     <div className="chatsImage">
//                       <img src={user?.photoURL} alt="" />
//                     </div>
//                     <div className="userChatInfo">
//                       <div className="firstLine">
//                         <span className="name">{user?.displayName}</span>
//                         <span className="message">{!chat[1].lastMessage?.recall ? chat[1].lastMessage?.text : "message recalled"}</span>
//                       </div>
//                       <div className="secondLine">
//                         <span className="date">{moment(chat[1].date).format("DD/MM") !== moment().format("DD/MM") ? moment(chat[1].date).format("DD/MM") : "Today"}</span>
//                         {unreadCount.map(item => {
//                           if(item.id === chat[0]){
//                             return(
//                               <div className={`unreadMessage ${item.messages !== 0 && 'unreadMessage-active'}`}>
//                                 <span>{item.messages < 100 ? item.messages : '...'}</span>
//                               </div>
//                             )
//                           }
//                         })}
//                       </div>
//                     </div>
//                     </>
//                   )
//                 }
//               })}
//             </div>
//           )
//         }
//       })}
//     </div>
//   );
// };

// export default Chats;