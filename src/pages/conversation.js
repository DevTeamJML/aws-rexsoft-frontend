import React, { useState, useEffect, Fragment, useContext } from "react";
import { useSelectIsAdmin } from "../../redux/slices/companySlice";
import ChatSidebar from "@/components/Conversation/chats/ChatSidebar";
import Chat from "@/components/Conversation/chats/Chat";
import { MessageContextProvider } from "@/components/Conversation/ChatScrollContext";
import { useSelector } from "react-redux";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

function Conversations(props) {
  const isSuperAdmin = useSelectIsAdmin();
  const Conversation_Group = useSelector(
    (state) => state.chat.conversationGroup,
  );

  const router = useRouter();

  return (
    <>
      <div
        className="d-flex flex-row"
        style={{
          height: "100vh",
          transition: "all 0.5s",
          background: "#F8FAFA",
          overflow: "hidden",
        }}
      >
        <div className="page-container">
          <div className="title-container">
            <h1 style={{display:"flex", alignItems:"center", gap: "10px"}}><MdArrowBack style={{cursor:"pointer"}} onClick={() => {router.back()}}/> {"Conversation"}</h1>
          </div>

          <div className="home">
            <div className="container">
              <MessageContextProvider>
                <ChatSidebar
                  isSuperAdmin={isSuperAdmin}
                  Conversation_Group={Conversation_Group}
                />
                <Chat />
              </MessageContextProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Conversations;
