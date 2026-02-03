// import React, { useContext, useEffect, useState } from "react";
// import { db } from "../firebaseInit";
// import { set, ref, onValue, push, child, update } from "firebase/database";
// import { useUserAuth } from "../context/UserAuthContext";
// import moment from "moment";
// import C_Search from "../components/C_Search";
// import { ChatContext } from "../context/UserChatContext";
// import { NotificationContext } from "../context/NotificationContext";

// const ChatSearch = () => {

//   //useEffect check search text length

//   const { user } = useUserAuth();

//   const { dispatch } = useContext(ChatContext);
//   const { allUserList } = useContext(NotificationContext);

//   const [username, setUsername] = useState("");
//   const [targetUser, setTargetUser] = useState([]);
//   const [err, setErr] = useState(false);

//   useEffect(() => {
//     if(username !== "") {
//       const searchResult = allUserList.filter(item => {
//         if(item?.displayName?.toLocaleLowerCase().includes(username.toLocaleLowerCase()) && item?.uid !== user?.uid){
//           return item
//         }
//       })
//       setTargetUser(searchResult)
//     }
//     else{
//       setTargetUser([])
//     }
//   },[username])

//   const handleSelect = (index) => {

//     const combinedId = user.uid > targetUser[index].uid ? user.uid + targetUser[index].uid : targetUser[index].uid + user.uid

//     const chatsRef = ref(db, "chats/" + combinedId);

//     const dateNow = Date.now()

//     try{
//       onValue(chatsRef, async (snapshot) => {

//         if(!snapshot.exists()){
//           await set(ref(db, 'userChats/' + user.uid + '/' + combinedId), {
//             userInfo: {
//               uid: targetUser[index].uid,
//               displayName: targetUser[index].displayName,
//               photoURL: targetUser[index].photoURL
//             },
//             date: dateNow,
//             mute: false
//           })

//           await set(ref(db, 'userChats/' + targetUser[index].uid + '/' + combinedId), {
//             userInfo: {
//               uid: user.uid,
//               displayName: user.displayName,
//               photoURL: user.photoURL
//             },
//             date: dateNow,
//             mute: false
//           })
//         }
        
//       });

//       dispatch({ type:"CHANGE_USER", payload: {
//         uid: targetUser[index].uid,
//         displayName: targetUser[index].displayName,
//         photoURL: targetUser[index].photoURL
//       }})

//     }catch(err){
//       console.log(err)
//     }

//     setTargetUser([])
//     setUsername("")

//   }
  
//   return (
//     <div className="search">
//       <div className="searchForm">
//           <C_Search
//             placeholder="Find a user"
//             onChange={(e) => {
//               setUsername(e.target.value);
//             }}
//             value={username}
//             searchText={username}
//             closeFunction={() => {
//               setUsername("");
//             }}
//           />
//       </div>
//       {targetUser.length > 0 &&
//         targetUser.map((item, index) => {
//           return(
//             <div key={item.uid} className="userChat" onClick={() => { handleSelect(index) }}>
//               <img src={item.photoURL} alt="" />
//               <div className="userChatInfo">
//                 <span className="name">{item.displayName}</span>
//               </div>
//             </div>
//           )
//         })
//       }
//     </div>
//   );
// };

// export default ChatSearch;