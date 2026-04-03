import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import Message from "./Message";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import {
  AiFillMinusCircle,
  AiFillFile,
  AiFillCloseCircle,
  AiFillCamera,
} from "react-icons/ai";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { MessageContext } from "../ChatScrollContext";
import { setDoc, setQuote } from "../../../../redux/slices/messageSlice";
import { ConstructionOutlined } from "@mui/icons-material";

const Messages = ({}) => {
  const { fileInputRef, imageInputRef } = useContext(MessageContext);
  const bottomRef = useRef(null);

  const dispatch = useDispatch();

  const messages = useSelector((state) => state.message.messages);
  const doc = useSelector((state) => state.message.doc);
  const quote = useSelector((state) => state.message.quote);
  const user = useSelectUser();
  const chat = useSelector((state) => state.chat.selectedChat);
  const groupUser = useSelector((state) => state.chat.groupUsers);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groups = messages?.reduce((groups, item) => {
    if (groupUser.length > 0) {
      Object.entries(item).map((data) => {
        if (data[0] === user?.uid) {
          var date = moment(data[1].date).format();
          const newDate = date.split("T")[0];
          if (!groups[newDate]) {
            groups[newDate] = [];
          }
          groups[newDate].push(data);
        }
      });
      return groups;
    } else {
      var date = moment(item.date).format();
      const newDate = date.split("T")[0];
      if (!groups[newDate]) {
        groups[newDate] = [];
      }
      groups[newDate].push(item);
      return groups;
    }
  }, {});

  const groupMessageByDate = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];

    const groups = messages.reduce((acc, item) => {
      if (!item) return acc;

      // GROUP CHAT
      if (groupUser?.length > 0 && user?.uid) {
        Object.entries(item || {}).forEach(([key, value]) => {
          if (!value || key !== user?.uid) return;

          const rawDate = value?.date;
          if (!rawDate) return;

          const date = moment(rawDate).format().split("T")[0];

          if (!acc[date]) acc[date] = [];
          acc[date].push([key, value]);
        });
      }

      // PRIVATE CHAT
      else {
        const rawDate = item?.date;
        if (!rawDate) return acc;

        const date = moment(rawDate).format().split("T")[0];

        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
      }

      return acc;
    }, {});

    return Object.keys(groups)
      .map((date) => ({
        date,
        messages: (groups[date] || []).sort((a, b) => {
          const aDate = groupUser?.length > 0 ? a?.[1]?.date : a?.date;
          const bDate = groupUser?.length > 0 ? b?.[1]?.date : b?.date;

          return (aDate || 0) - (bDate || 0);
        }),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [messages, groupUser, user?.uid]);

  function handleRemoveImage(index) {
    const newDoc = doc.data.filter((_, pos) => pos !== index);

    if (newDoc.length === 0) {
      dispatch(setDoc(null));
      imageInputRef.current.value = null;
    } else {
      dispatch(
        setDoc({
          type: "image",
          data: newDoc,
        }),
      );
    }
  }

  function handleRemoveFile(index) {
    const newDoc = doc.data.filter((_, pos) => pos !== index);

    if (newDoc.length === 0) {
      dispatch(setDoc(null));
      fileInputRef.current.value = null;
    } else {
      dispatch(
        setDoc({
          type: "file",
          data: newDoc,
        }),
      );
    }
  }

  function handleRemoveQuote() {
    dispatch(setQuote(null));
  }

  return (
    <>
      <div
        className={`messages height-x-extend ${doc && "height-extend"} ${quote && "height-extend-quote"}`}
      >
        <>
          {groupUser.length > 0 ? (
            <>
              {groupMessageByDate
                .sort((a, b) => moment(a.date) - moment(b.date))
                .map((item) => {
                  return (
                    <>
                      {item.messages.length !== 0 && (
                        <div className="groupDateContainer">
                          <span className="groupDate">
                            {moment(item.date).format("DD-MM") ==
                            moment().format("DD-MM")
                              ? "Today"
                              : moment(item.date).format("ddd, DD-MM")}
                          </span>
                        </div>
                      )}
                      {item.messages
                        .sort((a, b) => moment(a[1].date) - moment(b[1].date))
                        .map((m) => {
                          return <Message message={m[1]} key={m[1].id} />;
                        })}
                    </>
                  );
                })}
            </>
          ) : (
            <>
              {groupMessageByDate
                .sort((a, b) => moment(a.date) - moment(b.date))
                .map((item) => {
                  return (
                    <>
                      {item.messages.length !== 0 && (
                        <div className="groupDateContainer">
                          <span className="groupDate">
                            {moment(item.date).format("DD-MM") ==
                            moment().format("DD-MM")
                              ? "Today"
                              : moment(item.date).format("ddd, DD-MM")}
                          </span>
                        </div>
                      )}
                      {item.messages
                        .sort((a, b) => moment(a.date) - moment(b.date))
                        .map((m) => {
                          {
                            /* console.log(m) */
                          }
                          return <Message message={m} key={m.id} />;
                        })}

                      <div ref={bottomRef} />
                    </>
                  );
                })}
            </>
          )}
        </>
      </div>

      <div
        className={`extend-container ${doc && !quote && "extend-container-active"}`}
      >
        {doc &&
          !quote &&
          doc.type === "image" &&
          doc.data.map((image, index) => {
            return (
              <div className="element">
                <img src={URL.createObjectURL(image)} alt="" />
                <AiFillMinusCircle
                  onClick={() => {
                    handleRemoveImage(index);
                  }}
                  className="icon"
                  size={20}
                  color={"red"}
                />
              </div>
            );
          })}
        {doc &&
          !quote &&
          doc.type === "file" &&
          doc.data.map((file, index) => {
            return (
              <div className="fileElement">
                <AiFillFile size={17} color={"rgb(49, 49, 49)"} />
                <span>{file.name}</span>
                <AiFillMinusCircle
                  onClick={() => {
                    handleRemoveFile(index);
                  }}
                  className="icon"
                  size={17}
                  color={"red"}
                />
              </div>
            );
          })}
        <span className="limit">Size Limit to 5MB*</span>
      </div>

      <div
        className={`extend-container-quote ${quote && "extend-container-quote-active"}`}
      >
        {quote && quote.text && (
          <div className="quoteContainer">
            <div className="detail">
              {groupUser.length > 0 ? (
                groupUser.map((item) => {
                  if (item.uid === quote.senderId) {
                    return <span className="name">{item.displayName}</span>;
                  }
                })
              ) : quote.senderId === user?.uid ? (
                <span>{user?.displayName}</span>
              ) : (
                <span>{chat?.userInfo?.displayName}</span>
              )}
              <span className="text">{quote.text}</span>
            </div>
          </div>
        )}
        {quote && quote.img && (
          <div className="quoteContainerImg">
            <div className="detail">
              {groupUser.length > 0 ? (
                groupUser.map((item) => {
                  if (item.uid === quote.senderId) {
                    return <span className="name">{item.displayName}</span>;
                  }
                })
              ) : quote.senderId === user?.uid ? (
                <span>{user?.displayName}</span>
              ) : (
                <span>{chat?.userInfo?.displayName}</span>
              )}
              <div className="image">
                <AiFillCamera size={15} />
                <span>Photo</span>
              </div>
            </div>
            <img src={quote.img} alt="" />
          </div>
        )}
        {quote && quote.file && (
          <div className="quoteContainerFile">
            <div className="detail">
              {groupUser.length > 0 ? (
                groupUser.map((item) => {
                  if (item.uid === quote.senderId) {
                    return <span className="name">{item.displayName}</span>;
                  }
                })
              ) : quote.senderId === user?.uid ? (
                <span>{user?.displayName}</span>
              ) : (
                <span>{chat?.userInfo?.displayName}</span>
              )}
              <div className="file">
                <AiFillFile size={15} />
                <span>File</span>
              </div>
            </div>
            <div className="fileDesign">
              <div className="logo">
                <AiFillFile size={20} color={"rgb(49, 49, 49)"} />
              </div>
              <div className="fileDetails">
                <span className="fileName">{quote.fileName}</span>
                <span className="fileSize">
                  {parseInt(quote.fileSize) < 1000000
                    ? (parseInt(quote.fileSize) / 1000).toFixed(2) + " KB"
                    : (parseInt(quote.fileSize) / 1000000).toFixed(2) + " MB"}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="remove">
          <AiFillCloseCircle
            size={20}
            onClick={() => {
              handleRemoveQuote();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Messages;
