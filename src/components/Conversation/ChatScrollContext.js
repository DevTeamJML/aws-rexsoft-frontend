"use client";

import React, { createContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export const MessageContext = createContext();

export const MessageContextProvider = ({ children }) => {
  const messages = useSelector((state) => state.message.messages);

  const messageRefs = useRef({});

  useEffect(() => {
    const currentIds = new Set(messages.map((m) => m.id));

    // add new refs
    messages.forEach((msg) => {
      if (!msg || !msg.id) return;

      if (!messageRefs.current[msg.id]) {
        messageRefs.current[msg.id] = React.createRef();
      }
    });

    // cleanup old refs
    Object.keys(messageRefs.current).forEach((id) => {
      if (!currentIds.has(id)) {
        delete messageRefs.current[id];
      }
    });
  }, [messages]);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  return (
    <MessageContext.Provider
      value={{
        messageRefs: messageRefs.current,
        fileInputRef,
        imageInputRef,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
