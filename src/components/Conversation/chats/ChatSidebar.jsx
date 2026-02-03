// import React, { useEffect, useState, useContext } from 'react'
// import Chats from './Chats'
// import ChatSearch from './ChatSearch'
// import { useUserAuth } from '../context/UserAuthContext'
// import { MdGroupAdd } from "react-icons/md";
// import { onValue, ref, set } from 'firebase/database';
// import { ref as ref_storage, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../firebaseInit';
// import { BiArrowBack } from "react-icons/bi";
// import C_Search from '../components/C_Search';
// import { AiFillCloseCircle, AiOutlineCheck } from 'react-icons/ai';
// import { BsArrowRightShort } from 'react-icons/bs';
// import { FaCameraRetro } from 'react-icons/fa';
// import { ChatContext } from '../context/UserChatContext';

// const ChatSidebar = (props) => {

//   const isSuperAdmin = props.isSuperAdmin;
//   const Conversation_Group = props.Conversation_Group;

//   const { dispatch } = useContext(ChatContext);

//   const { user } = useUserAuth();
//   const [currPage, setCurrPage] = useState("CHATS");
//   const [users, setUsers] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [selectedUser, setSelectedUser] = useState([]);
//   const [groupIcon, setGroupIcon] = useState(null);
//   const [groupName, setGroupName] = useState("");
//   const [currUser, setCurrUser] = useState(null);

//   const [isLoading, setIsLoading] = useState(false);

//   function user_handleSnapshot(snapshot) {
//     var returnArr = [];

//     snapshot.forEach(function(childSnapshot) {
//         var item = childSnapshot.val();
//         item.key = childSnapshot.key;
//         if(item.uid !== user.uid){
//           returnArr.push(item);
//         }
//         else{
//           setCurrUser(item)
//         }
//     });
    
//     setUsers(returnArr)

//   };

//   function reloadUser() {
//     const userRef = ref(db, "users/");

//     try{
//       onValue(userRef, (snapshot) => {
//         user_handleSnapshot(snapshot)
//       });
//     }catch(err){
//       console.log(err)
//     }
//   }

//   useEffect(() => {

//     const userRef = ref(db, "users/");

//     try{
//       onValue(userRef, (snapshot) => {
//         user_handleSnapshot(snapshot)
//       });
//     }catch(err){
//       console.log(err)
//     }

//   },[user])

//   const handleAddGroup = () => {
//     setCurrPage("ADD_MEMBER_GROUP")
//     setSelectedUser([])
//     reloadUser()
//   }

//   const handleBackChats = () => {
//     setCurrPage("CHATS")
//     setSelectedUser([])
//     reloadUser()
//   }

//   const handleSelectedUser = (uid) => {

//     var tempSelectedUser = []

//     tempSelectedUser.push(...selectedUser, uid)
    
//     setSelectedUser(tempSelectedUser);

//     var newArray = users.filter(function(item) {
//         return !tempSelectedUser.find(function(e) {
//           return item.uid === e.uid
//         })
//       }
//     );

//     setUsers(newArray)

//   }

//   const handleRemoveSelected = (uid) => {
//     var tempSelectedUser = []

//     tempSelectedUser.push(...users, uid)
    
//     setUsers(tempSelectedUser);

//     var newArray = selectedUser.filter(function(item) {
//         return !tempSelectedUser.find(function(e) {
//           return item.uid === e.uid
//         })
//       }
//     );

//     setSelectedUser(newArray)
//   }

//   const handleConfirmUserGroup = () => {
//     setCurrPage("ADD_TITLE")
//   }

//   const handleBackGroupMember = () => {
//     setCurrPage("ADD_MEMBER_GROUP")
//   }

//   function handleInputGroupIcon(value){
//     const fileSize = value.size;
//     const fileMB = Math.round((fileSize / 1024));
//     if(fileMB >= 4096){
//       alert("File too Big, please select a file less than 4mb")    
//     }else{
//       setGroupIcon(value)
//     }
//   }
    

//   const handleCreateGroupChat = () => {

//     //Loading handling
//     setIsLoading(true)

    
//     const dateNow = Date.now();
    
//     const combinedId = selectedUser.reduce((a, b) => {
//       return a.uid + b.uid + dateNow
//     })

//     if(groupIcon){

//       const storageRef = ref_storage(storage, "/chatGroupIcons/" + combinedId);
//       const uploadTask = uploadBytesResumable(storageRef, groupIcon);

//       uploadTask.on('state_changed',
//       (snapshot) => {
//         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log('Upload is ' + progress + '% done');
//         switch (snapshot.state) {
//           case 'paused':
//             console.log('Upload is paused');
//             break;
//           case 'running':
//             console.log('Upload is running');
//             break;
//         }
//       }, 
//       (error) => {

//       }, 
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

//           var dispatchData = {
//             userInfo: combinedId,
//             date: dateNow,
//             groupInfo: {
//               groupName: groupName,
//               photoURL: downloadURL
//             }
//           }

//           dispatch({ type:"CHANGE_GROUP", payload: dispatchData })

//           for(var x = 0; x < selectedUser.length; x++){

//             set(ref(db, 'userChats/' + selectedUser[x].uid + '/' + combinedId), {
//               userInfo: combinedId,
//               date: dateNow,
//               groupInfo: {
//                 groupName: groupName,
//                 photoURL: downloadURL
//               }
//             })

//             set(ref(db, 'groupChats/' + combinedId + '/' + selectedUser[x].uid), {
//               admin: false,
//               owner: false,
//               mute: false,
//               uid: selectedUser[x].uid,
//               displayName: selectedUser[x].displayName,
//               photoURL: selectedUser[x].photoURL
//             })

//             set(ref(db, 'userChats/' + user.uid + '/' + combinedId), {
//               userInfo: combinedId,
//               date: dateNow,
//               groupInfo: {
//                 groupName: groupName,
//                 photoURL: downloadURL
//               }
//             })
  
//             set(ref(db, 'groupChats/' + combinedId + '/' + user.uid), {
//               admin: true,
//               owner: true,
//               mute: false,
//               uid: user.uid,
//               displayName: user.displayName,
//               photoURL: user.photoURL
//             })

//           }

//           setGroupIcon(null)
//           setGroupName("")
//           setIsLoading(false)
//           setCurrPage("CHATS")
          
//         });
//       }
//       )

//     } else {

//       var dispatchData = {
//         userInfo: combinedId, 
//         groupInfo: {
//           groupName: groupName,
//           photoURL: 'https://firebasestorage.googleapis.com/v0/b/rexsoft-crm.appspot.com/o/default_group.jpeg?alt=media&token=0e170b9c-7c26-40b5-ba8a-4e52923ec57e'
//         }
//       }

//       dispatch({ type:"CHANGE_GROUP", payload: dispatchData })

//       for(var x = 0; x < selectedUser.length; x++){

//         set(ref(db, 'userChats/' + selectedUser[x].uid + '/' + combinedId), {
//           userInfo: combinedId,
//           date: dateNow,
//           groupInfo: {
//             groupName: groupName,
//             photoURL: 'https://firebasestorage.googleapis.com/v0/b/rexsoft-crm.appspot.com/o/default_group.jpeg?alt=media&token=0e170b9c-7c26-40b5-ba8a-4e52923ec57e'
//           }
//         })

//         set(ref(db, 'groupChats/' + combinedId + '/' + selectedUser[x].uid), {
//           admin: false,
//           owner: false,
//           mute: false,
//           uid: selectedUser[x].uid,
//           displayName: selectedUser[x].displayName,
//           photoURL: selectedUser[x].photoURL
//         })

//         set(ref(db, 'userChats/' + user.uid + '/' + combinedId), {
//           userInfo: combinedId,
//           date: dateNow,
//           groupInfo: {
//             groupName: groupName,
//             photoURL: 'https://firebasestorage.googleapis.com/v0/b/rexsoft-crm.appspot.com/o/default_group.jpeg?alt=media&token=0e170b9c-7c26-40b5-ba8a-4e52923ec57e'
//           }
//         })
  
//         set(ref(db, 'groupChats/' + combinedId + '/' + user.uid), {
//           admin: true,
//           owner: true,
//           mute: false,
//           uid: user.uid,
//           displayName: user.displayName,
//           photoURL: user.photoURL
//         })

//       }

//       setGroupIcon(null)
//       setGroupName("")
//       setIsLoading(false)
//       setCurrPage("CHATS")
      
//     }

//   }

//   return (
//     <>
//     {currPage === "ADD_MEMBER_GROUP" &&
//       <div className="SidebarAddGroup">
//         <div className='backChatContainer'>
//           <BiArrowBack className='backBtn' size={20} color={"#4F4F4F"} onClick={handleBackChats}/>
//           <div className='searchContainer'>
//             <C_Search
//               placeholder="Find user"
//               onChange={(e) => {
//                 setSearchText(e.target.value);
//               }}
//               value={searchText}
//               searchText={searchText}
//               closeFunction={() => {
//                 setSearchText("");
//               }}
//             />
//           </div>
//         </div>
//         <div className='selectedUserContainer'>
//         {selectedUser && selectedUser.map(item => {
//           return(
//             <div className='selectedUserToGroup'>
//               <span>{item.displayName}</span>
//               <div>
//               <AiFillCloseCircle className='removeSelectedUserBtn' size={16} color={"white"} onClick={() => { handleRemoveSelected(item) }}/>
//               </div>
//             </div>
//           )
//         })
//         }
//         </div>
//         {users &&
//           users?.sort((a, b) => a?.displayName?.localeCompare(b?.displayName)).map(item => {
//               return(
//                 <div className='SidebarListUser' onClick={(e) => handleSelectedUser(item)} key={item.uid}>
//                   <div className='ListUserDetails'>
//                     <img src={item.photoURL} alt=""/>
//                     <span>{item.displayName}</span>
//                   </div>
//                 </div>
//               )
//           })
//         }
//         {selectedUser.length > 1 &&
//         <div className='NextContainer'>
//           <BsArrowRightShort onClick={handleConfirmUserGroup} size={30} color={'white'}/>
//         </div>
//         }
//       </div>
//     }
//     {currPage === "CHATS" &&
//       <div className="Sidebar">
//         <div className='SidebarToolsContainer'>
//           <div className='SidebarProfile'>
//             <img src={user.photoURL} alt=""/>
//             <div className='userDetails'>
//             <span className='name'>{user.displayName}</span>
//             </div>
//           </div>
//           {(isSuperAdmin || Conversation_Group) &&
//             <div className='SidebarAddGroupBtn'>
//               <MdGroupAdd className='AddGroupBtn' size={25} color={"#4F4F4F"} onClick={handleAddGroup}/>
//             </div>
//           }
//         </div>
//         <ChatSearch/>
//         <Chats/>
//       </div>
//     }
//     {currPage === "ADD_TITLE" &&
//       <div className={`SidebarAddTitle ${isLoading && 'showLoading'}`}>
//         {/* <C_Loading_Login isLoading={isLoading}/> */}
//         <div className={`SidebarAddTitleWrapper ${isLoading && 'hideWrapper'}`}>
//           <div className='backGroupContainer'>
//             <BiArrowBack className='backGroupBtn' size={20} color={"#4F4F4F"} onClick={handleBackGroupMember}/>
//           </div>
//           <div className='GroupInfoContainer'>
//             <input type="file" style={{ display: 'none' }} id="file" onChange={e => handleInputGroupIcon(e.target.files[0])} accept="image/*"/>
//             <label htmlFor="file">
//             {groupIcon ?
//               <div className='displayImageContainer'>
//                 <img src={URL.createObjectURL(groupIcon)} alt=''/>
//               </div>
//               :
//               <div className='addImageContainer'>    
//                 <FaCameraRetro className='addImageIcon' size={30} color="rgb(217, 217, 217)"/>
//                 <span>Group Icon</span>
//               </div>
//             }
//             </label>
//             <div className='addGroupTitleContainer'>
//               <input
//                 placeholder={"Group Name"}
//                 value={groupName}
//                 onChange={(e) => {
//                   setGroupName(e.target.value)
//                 }}
//               />
//             </div>
//           </div>
//           <div className='selectedUserToGroup'>
//             {selectedUser && selectedUser.map(item => {
//               return(
//                   <img src={item.photoURL} alt=""/>
//               )
//             })
//             }
//           </div>
//           {groupName !== "" &&
//             <div className='CompleteContainer'>
//               <AiOutlineCheck onClick={handleCreateGroupChat} size={30} color={'white'}/>
//             </div>
//           }
//         </div>
//       </div>
//     }
//     </>
//   )
// }

// export default ChatSidebar