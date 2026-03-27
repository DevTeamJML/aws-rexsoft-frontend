import React, { useState, useEffect, Fragment, useContext } from "react";
import { useSelectIsAdmin } from "../../redux/slices/companySlice";
import ChatSidebar from "@/components/Conversation/chats/ChatSidebar";
import Chat from "@/components/Conversation/chats/Chat";
import { MessageContextProvider } from "@/components/Conversation/ChatScrollContext";

function Conversations(props) {
  const isSuperAdmin = useSelectIsAdmin();

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
            <h1>{"Conversation"}</h1>
          </div>

          <div className="container">
            <MessageContextProvider>
              <Chat />
            </MessageContextProvider>

            {/* <ChatSidebar
              isSuperAdmin={isSuperAdmin}
            //   Conversation_Group={Conversation_Group}
            />
            <Chat /> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Conversations;
