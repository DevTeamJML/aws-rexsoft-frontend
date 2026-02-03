// import React, {
//   createContext,
//   useEffect,
//   useState,
//   useReducer,
//   useContext,
//   useRef,
// } from "react";
// import { auth } from "../firebaseInit";
// import { onAuthStateChanged } from "firebase/auth";
// import { useUserAuth } from "./UserAuthContext";
// import { db } from "../firebaseInit";
// import { ref, onValue, query, limitToLast } from "firebase/database";
// import { ChatContext } from "./UserChatContext";

// export const messageContext = createContext();

// export const MessageContextProvider = ({ children }) => {
//   const [messages, setMessages] = useState([]);
//   const [unreadMessages, setUnreadMessages] = useState([]);
//   const [unreadMessagesGroup, setUnreadMessagesGroup] = useState([]);
//   const { data, groupUser } = useContext(ChatContext);
//   const { user } = useUserAuth();

//   const LOADING_CHAT = false;

//   const loadingChatReducer = (state, action) => {
//     switch (action.type) {
//       case "LOADING":
//         return action.payload;
//     }
//   };

//   const [loadingChat, dispatchLoadingChat] = useReducer(
//     loadingChatReducer,
//     LOADING_CHAT
//   );

//   useEffect(() => {
//     const chatsRef = ref(db, 'chats/' + data.chatId + "/messages");
//     // const chatsRef = query(ref(db, 'chats/' + data.chatId + "/messages"), limitToLast(50));

//     const unsub = onValue(chatsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const allMessage = [];
//         const unreadMessage = [];
//         const unreadMessageGroup = [];

//         for (const [, msg] of Object.entries(snapshot.val())) {
//           allMessage.push(msg);
     
//           if (msg.text) {
//             if (!msg.hasRead) unreadMessage.push(msg);
//             else unreadMessageGroup.push(msg);
//           }
//         }

//         setMessages(allMessage);
//         setUnreadMessages(unreadMessage);
//         setUnreadMessagesGroup(unreadMessageGroup);
//       } else {
//         setMessages([]);
//       }
//     });

//     // const chatsRef = ref(db, 'chats/' + data.chatId + "/messages");
//     // const unsub = onValue(chatsRef, (snapshot) => {
//     //     if(snapshot.exists()){
//     //         let allMessage = []
//     //         let unreadMessage = []
//     //         let unreadMessageGroup = []
//     //         const data = Object.entries(snapshot.val());
//     //         for(var x = 0; x < data.length; x++){
//     //             allMessage.push(data[x][1])
//     //             if((data[x][1].text !== "" && data[x][1].text !== null)){
//     //                 if(data[x][1].hasRead === false){
//     //                     unreadMessage.push(data[x][1])
//     //                 }
//     //                 else{
//     //                     unreadMessageGroup.push(data[x][1])
//     //                 }
//     //             }
//     //         }
//     //         setUnreadMessagesGroup(unreadMessageGroup)
//     //         setUnreadMessages(unreadMessage)
//     //         setMessages(allMessage);
//     //     }
//     //     else{
//     //         setMessages([]);
//     //     }
//     // });

//     return () => {
//         unsub();
//     };
//   }, [data.chatId]);

//   const refs = messages.reduce((acc, value) => {
//     if (groupUser.length > 0) {
//       Object.entries(value).map((item) => {
//         return (acc[item[1].id] = React.createRef());
//       });
//       return acc;
//     } else {
//       acc[value.id] = React.createRef();
//       return acc;
//     }
//   }, {});

//   const INITIAL_STATE = "";

//   const messageReducer = (state, action) => {
//     switch (action.type) {
//       case "FOUND_MESSAGE":
//         return action.payload;
//     }
//   };

//   const [state, dispatchMessage] = useReducer(messageReducer, INITIAL_STATE);

//   const INITIAL_DOC = null;

//   const docReducer = (doc, action) => {
//     switch (action.type) {
//       case "CHOOSEN_FILE":
//         return action.payload;
//     }
//   };

//   const [doc, dispatchDoc] = useReducer(docReducer, INITIAL_DOC);

//   const INITIAL_QUOTE = null;

//   const quoteReducer = (doc, action) => {
//     switch (action.type) {
//       case "QUOTE":
//         return action.payload;
//     }
//   };

//   const [quote, dispatchQuote] = useReducer(quoteReducer, INITIAL_QUOTE);

//   const fileInputRef = React.createRef();
//   const imageInputRef = React.createRef();

//   return (
//     <messageContext.Provider
//       value={{
//         refs: refs,
//         fileInputRef: fileInputRef,
//         imageInputRef: imageInputRef,
//         messages: messages,
//         unreadMessages: unreadMessages,
//         unreadMessagesGroup: unreadMessagesGroup,
//         selectedMessage: state,
//         dispatchMessage,
//         doc: doc,
//         dispatchDoc,
//         quote: quote,
//         dispatchQuote,
//         dispatchLoadingChat,
//         loadingChat: loadingChat,
//       }}
//     >
//       {children}
//     </messageContext.Provider>
//   );
// };
