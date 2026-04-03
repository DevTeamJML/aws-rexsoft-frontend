import { Fragment, useContext, useEffect, useState } from "react";
import { AiFillFile, AiFillCamera } from "react-icons/ai";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { BiUndo, BiCheckDouble } from "react-icons/bi";
import { ref as ref_database, set } from "firebase/database";
import moment from "moment";
import { MessageContext } from "../ChatScrollContext";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { db } from "@/config/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { setDoc, setQuote } from "../../../../redux/slices/messageSlice";

const Message = ({ message }) => {
  const user = useSelectUser();
  const dispatch = useDispatch();

  const chat = useSelector((state) => state.chat.selectedChat);
  const chatId = useSelector((state) => state.chat.chatId);
  const groupUser = useSelector((state) => state.chat.groupUsers);

  const unreadMessages = useSelector((state) => state.message.unreadMessages);
  const unreadMessagesGroup = useSelector(
    (state) => state.message.unreadMessagesGroup,
  );
  const selectedMessage = useSelector(
    (state) => state.message.highlightedMessageId,
  );

  const [showTools, setShowTools] = useState(false);
  const { messageRefs } = useContext(MessageContext);

  const messages = useSelector((state) => state.message.messages);

  const [groupedUnread, setGroupedUnread] = useState([]);

  useEffect(() => {
    if (groupUser.length > 0 && user?.uid) {
      const groupReadMessage = unreadMessagesGroup.reduce((groups, item) => {
        for (var y = 0; y < groupUser.length; y++) {
          if (groupUser[y].uid !== user?.uid) {
            if (!groups[item[groupUser[y].uid]?.id]) {
              groups[item[groupUser[y].uid]?.id] = [];
            }
            groups[item[groupUser[y].uid]?.id].push(item[groupUser[y].uid]);
          }
        }
        return groups;
      }, {});

      const groupReadedMessage = Object.keys(groupReadMessage).map((id) => {
        return {
          id,
          messages: groupReadMessage[id],
        };
      });

      const checkstatus = groupReadedMessage.map((item) => {
        return {
          id: item.id,
          status: item.messages?.every(
            (read) =>
              read?.hasRead === true &&
              read?.text !== "" &&
              read?.text !== null,
          ),
        };
      });

      const status = checkstatus.reduce(
        (acc, val) => ({ ...acc, [val.id]: val.status }),
        {},
      );

      setGroupedUnread(status);
    }
  }, [unreadMessagesGroup]);

  // useEffect(() => {
  //   const ref = messageRefs?.[message.id];
  //   ref?.current?.scrollIntoView({ behavior: "auto" });
  // }, [messageRefs, message.id]);


  useEffect(() => {
    if (groupUser.length === 0) {
      if (unreadMessages.length !== 0) {
        for (var x = 0; x < unreadMessages.length; x++) {
          if (unreadMessages[x].senderId !== user?.uid) {
            set(
              ref_database(
                db,
                "chats/" +
                  chatId +
                  "/messages/" +
                  unreadMessages[x].id +
                  "/hasRead",
              ),
              true,
            );
          }
        }
      }
    } else if (
      groupUser.length > 0 &&
      message.senderId !== user?.uid &&
      message.hasRead === false
    ) {
      set(
        ref_database(
          db,
          "chats/" +
            chatId +
            "/messages/" +
            message.id +
            "/" +
            user?.uid +
            "/hasRead",
        ),
        true,
      );
    }
  }, [unreadMessagesGroup]);

  function recallMessage(item) {
    set(ref_database(db, `chats/${chatId}/messages/${item.id}/recall`), true);

    set(
      ref_database(db, `userChats/${user?.uid}/${chatId}/lastMessage/recall`),
      true,
    );

    set(
      ref_database(
        db,
        `userChats/${chat?.userInfo?.uid}/${chatId}/lastMessage/recall`,
      ),
      true,
    );
  }

  function recallGroupMessage(item) {
    if (groupUser.length > 0) {
      for (var x = 0; x < groupUser.length; x++) {
        set(
          ref_database(
            db,
            "chats/" +
              chatId +
              "/messages/" +
              item.id +
              "/" +
              groupUser[x].uid +
              "/recall",
          ),
          true,
        );
        set(
          ref_database(
            db,
            "userChats/" +
              groupUser[x].uid +
              "/" +
              chatId +
              "/lastMessage/recall",
          ),
          true,
        );
      }
    }
  }

  function quoteText(data) {
    dispatch(setQuote(data));
    dispatch(setDoc(null));
  }

  const handleFindMessage = (id) => {
    messageRefs[id].current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    dispatch(setHighlightedMessage(id));
  };

  return (
    <Fragment>
      {message && message.text !== "" && message.text !== null && (
        <>
          {groupUser.length > 0 ? (
            <div
              ref={messageRefs[message.id]}
              key={message.id}
              className={`message ${message.senderId === user?.uid && "owner"}`}
            >
              <div className="messageInfo">
                {message.senderId === user?.uid ? (
                  <img src={user.photoURL} alt="" />
                ) : (
                  groupUser &&
                  groupUser.map((element) => {
                    if (element.uid === message.senderId) {
                      return <img src={element.photoURL} alt="" />;
                    }
                  })
                )}
              </div>
              <div
                className={`${message.file ? "fileMessageContent" : "messageContent"}`}
                onMouseOver={() => {
                  setShowTools(true);
                }}
                onMouseLeave={() => {
                  setShowTools(false);
                }}
              >
                {message.text && (
                  <div className="MessageContainer">
                    <div
                      className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                    >
                      {parseInt(
                        moment
                          .duration(moment(moment()).diff(moment(message.date)))
                          .asMinutes(),
                      ) %
                        60 <
                        2 && (
                        <div className="recallContainer">
                          <BiUndo
                            className="recall"
                            size={18}
                            onClick={() => {
                              recallGroupMessage(message);
                            }}
                          />
                        </div>
                      )}
                      <div className="quoteContainer">
                        <BsFillChatQuoteFill
                          className="quote"
                          size={14}
                          onClick={() => {
                            quoteText(message);
                          }}
                        />
                      </div>
                      {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                    </div>

                    <div className="messageArea">
                      {groupUser &&
                        groupUser.map((element) => {
                          if (
                            element.uid === message.senderId &&
                            message.senderId !== user?.uid
                          ) {
                            return (
                              <span className="GroupUserName">
                                {element.displayName}
                              </span>
                            );
                          }
                        })}
                      {!message.recall ? (
                        <div
                          className={`MessageInfoContainer ${message.quote && "quoted"} ${selectedMessage === message.id && "spotlight"}`}
                        >
                          {message.quote && (
                            <div className="quoteReplyContainer">
                              {message.quoteType === "TEXT" && (
                                <div
                                  className="quoteText"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    handleFindMessage(message.quoteId);
                                  }}
                                >
                                  <span className="name">
                                    {message.quoteSender !== user?.uid
                                      ? groupUser &&
                                        groupUser.map((element) => {
                                          if (
                                            element.uid === message.quoteSender
                                          ) {
                                            return element.displayName;
                                          }
                                        })
                                      : user?.displayName}
                                  </span>
                                  <span className="text">{message.quote}</span>
                                </div>
                              )}
                              {message.quoteType === "IMG" && (
                                <div
                                  className="quoteImage"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    handleFindMessage(message.quoteId);
                                  }}
                                >
                                  <div className="containerForText">
                                    <span className="name">
                                      {message.quoteSender !== user?.uid
                                        ? groupUser &&
                                          groupUser.map((element) => {
                                            if (
                                              element.uid ===
                                              message.quoteSender
                                            ) {
                                              return element.displayName;
                                            }
                                          })
                                        : "You"}
                                    </span>
                                    <div className="infoContainer">
                                      <AiFillCamera size={14} />
                                      <span className="text">Photo</span>
                                    </div>
                                  </div>
                                  <div className="containerForImg">
                                    <img src={message.quote} alt="" />
                                  </div>
                                </div>
                              )}
                              {message.quoteType === "FILE" && (
                                <div
                                  className="quoteFile"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    handleFindMessage(message.quoteId);
                                  }}
                                >
                                  <span className="name">
                                    {message.quoteSender !== user?.uid
                                      ? groupUser &&
                                        groupUser.map((element) => {
                                          if (
                                            element.uid === message.quoteSender
                                          ) {
                                            return element.displayName;
                                          }
                                        })
                                      : "You"}
                                  </span>
                                  <div className="quoteFileContainer">
                                    <AiFillFile size={12} />
                                    <span>File</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <span
                            className={`messageData ${message.quote && "alignText"}`}
                          >
                            {message.text}
                          </span>
                        </div>
                      ) : (
                        <span className="MessageText_RECALLED">
                          Message has been recalled
                        </span>
                      )}
                    </div>

                    <div
                      className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                    >
                      {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                      <div className="quoteContainer">
                        <BsFillChatQuoteFill
                          className="quote"
                          size={14}
                          onClick={() => {
                            quoteText(message);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {message.img && (
                  <>
                    {!message.recall ? (
                      <div className="MessageContainerImg">
                        <div
                          className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {parseInt(
                            moment
                              .duration(
                                moment(moment()).diff(moment(message.date)),
                              )
                              .asMinutes(),
                          ) %
                            60 <
                            2 && (
                            <div className="recallContainer">
                              <BiUndo
                                className="recall"
                                size={18}
                                onClick={() => {
                                  recallGroupMessage(message);
                                }}
                              />
                            </div>
                          )}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                        </div>
                        <a href={message.img} target="_blank">
                          <img src={message.img} alt="" />
                        </a>
                        <div
                          className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="MessageText_RECALLED">
                        Message has been recalled
                      </span>
                    )}
                  </>
                )}
                {message.file && (
                  <>
                    {!message.recall ? (
                      <div className="fileContainer">
                        <div
                          className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {parseInt(
                            moment
                              .duration(
                                moment(moment()).diff(moment(message.date)),
                              )
                              .asMinutes(),
                          ) %
                            60 <
                            2 && (
                            <div className="recallContainer">
                              <BiUndo
                                className="recall"
                                size={18}
                                onClick={() => {
                                  recallGroupMessage(message);
                                }}
                              />
                            </div>
                          )}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                        </div>
                        <a
                          className="fileDesign"
                          href={message.file}
                          download
                          target="_blank"
                        >
                          <div className="logo">
                            <AiFillFile size={25} color={"rgb(49, 49, 49)"} />
                          </div>
                          <div className="fileDetails">
                            <span className="fileName">{message.fileName}</span>
                            <span className="fileSize">
                              {parseInt(message.fileSize) < 1000000
                                ? (parseInt(message.fileSize) / 1000).toFixed(
                                    2,
                                  ) + " KB"
                                : (
                                    parseInt(message.fileSize) / 1000000
                                  ).toFixed(2) + " MB"}
                            </span>
                          </div>
                        </a>
                        <div
                          className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="MessageText_RECALLED">
                        Message has been recalled
                      </span>
                    )}
                  </>
                )}
                <div className="MessageDetails">
                  <span className="MessageTime">
                    {moment(message.date).format("hh:mm A")}
                  </span>
                  {message.senderId === user?.uid && (
                    <BiCheckDouble
                      className={`unreadMessage ${groupedUnread[message.id] && "messageRead"}`}
                      size={20}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={messageRefs[message.id]}
              key={message.id}
              className={`message ${message.senderId === user?.uid && "owner"}`}
            >
              <div className="messageInfo">
                <img
                  src={
                    message.senderId === user?.uid
                      ? user.photoURL
                      : chat?.userInfo?.photoURL
                  }
                  alt=""
                />
              </div>
              <div
                className={`${message.file ? "fileMessageContent" : "messageContent"}`}
                onMouseOver={() => {
                  setShowTools(true);
                }}
                onMouseLeave={() => {
                  setShowTools(false);
                }}
              >
                {message.text && (
                  <div className="MessageContainer">
                    <div
                      className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                    >
                      {parseInt(
                        moment
                          .duration(moment(moment()).diff(moment(message.date)))
                          .asMinutes(),
                      ) %
                        60 <
                        2 && (
                        <div className="recallContainer">
                          <BiUndo
                            className="recall"
                            size={18}
                            onClick={() => {
                              recallMessage(message);
                            }}
                          />
                        </div>
                      )}
                      <div className="quoteContainer">
                        <BsFillChatQuoteFill
                          className="quote"
                          size={14}
                          onClick={() => {
                            quoteText(message);
                          }}
                        />
                      </div>
                      {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                    </div>
                    {!message.recall ? (
                      <div
                        className={`MessageInfoContainer ${message.appointment && "AppointmentNotification"} ${message.quote && "quoted"} ${selectedMessage === message.id && "spotlight"}`}
                      >
                        {message.quote && (
                          <div className="quoteReplyContainer">
                            {message.quoteType === "TEXT" && (
                              <div
                                className="quoteText"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  handleFindMessage(message.quoteId);
                                }}
                              >
                                <span className="name">
                                  {message.quoteSender !== user?.uid
                                    ? chat?.userInfo?.displayName
                                    : "You"}
                                </span>
                                <span className="text">{message.quote}</span>
                              </div>
                            )}
                            {message.quoteType === "IMG" && (
                              <div
                                className="quoteImage"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  handleFindMessage(message.quoteId);
                                }}
                              >
                                <div className="containerForText">
                                  <span className="name">
                                    {message.quoteSender !== user?.uid
                                      ? chat?.userInfo?.displayName
                                      : "You"}
                                  </span>
                                  <div className="infoContainer">
                                    <AiFillCamera size={14} />
                                    <span className="text">Photo</span>
                                  </div>
                                </div>
                                <div className="containerForImg">
                                  <img src={message.quote} alt="" />
                                </div>
                              </div>
                            )}
                            {message.quoteType === "FILE" && (
                              <div
                                className="quoteFile"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  handleFindMessage(message.quoteId);
                                }}
                              >
                                <span className="name">
                                  {message.quoteSender !== user?.uid
                                    ? chat?.userInfo?.displayName
                                    : "You"}
                                </span>
                                <div className="quoteFileContainer">
                                  <AiFillFile size={12} />
                                  <span>File</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <span
                          className={`messageData ${message.quote && "alignText"}`}
                        >
                          {message.text}
                        </span>
                      </div>
                    ) : (
                      <span className="MessageText_RECALLED">
                        Message has been recalled
                      </span>
                    )}
                    <div
                      className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                    >
                      {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                      <div className="quoteContainer">
                        <BsFillChatQuoteFill
                          className="quote"
                          size={14}
                          onClick={() => {
                            quoteText(message);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {message.img && (
                  <>
                    {!message.recall ? (
                      <div className="MessageContainerImg">
                        <div
                          className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {parseInt(
                            moment
                              .duration(
                                moment(moment()).diff(moment(message.date)),
                              )
                              .asMinutes(),
                          ) %
                            60 <
                            2 && (
                            <div className="recallContainer">
                              <BiUndo
                                className="recall"
                                size={18}
                                onClick={() => {
                                  recallMessage(message);
                                }}
                              />
                            </div>
                          )}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                        </div>
                        <a href={message.img} target="_blank">
                          <img src={message.img} alt="" />
                        </a>
                        <div
                          className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {/* <div className="emojiContainer">
                  <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                </div> */}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="MessageText_RECALLED">
                        Message has been recalled
                      </span>
                    )}
                  </>
                )}
                {message.file && (
                  <>
                    {!message.recall ? (
                      <div className="fileContainer">
                        <div
                          className={`MessageToolBox ${message.senderId === user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {parseInt(
                            moment
                              .duration(
                                moment(moment()).diff(moment(message.date)),
                              )
                              .asMinutes(),
                          ) %
                            60 <
                            2 && (
                            <div className="recallContainer">
                              <BiUndo
                                className="recall"
                                size={18}
                                onClick={() => {
                                  recallMessage(message);
                                }}
                              />
                            </div>
                          )}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                          {/* <div className="emojiContainer">
                    <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                  </div> */}
                        </div>
                        <a
                          className="fileDesign"
                          href={message.file}
                          download
                          target="_blank"
                        >
                          <div className="logo">
                            <AiFillFile size={25} color={"rgb(49, 49, 49)"} />
                          </div>
                          <div className="fileDetails">
                            <span className="fileName">{message.fileName}</span>
                            <span className="fileSize">
                              {parseInt(message.fileSize) < 1000000
                                ? (parseInt(message.fileSize) / 1000).toFixed(
                                    2,
                                  ) + " KB"
                                : (
                                    parseInt(message.fileSize) / 1000000
                                  ).toFixed(2) + " MB"}
                            </span>
                          </div>
                        </a>
                        <div
                          className={`MessageToolBox ${message.senderId !== user?.uid && showTools && !message.recall && "MessageToolBox-active"}`}
                        >
                          {/* <div className="emojiContainer">
                    <BiHappyHeartEyes className="emoji" size={18} onClick={() => { }}/>
                  </div> */}
                          <div className="quoteContainer">
                            <BsFillChatQuoteFill
                              className="quote"
                              size={14}
                              onClick={() => {
                                quoteText(message);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="MessageText_RECALLED">
                        Message has been recalled
                      </span>
                    )}
                  </>
                )}
                <div className="MessageDetails">
                  <span className="MessageTime">
                    {moment(message.date).format("hh:mm A")}
                  </span>
                  {message.senderId === user?.uid && (
                    <BiCheckDouble
                      className={`unreadMessage ${message.hasRead && "messageRead"}`}
                      size={20}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Fragment>
  );
};

export default Message;
