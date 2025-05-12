import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  useRef,
} from "react";
import "./ChatBox.scss";
import { ChatContext } from "../ChatPage";
import { decodeToken, token } from "../../../store/tokenContext";
import VideoCall from "../../Call/Call";
import Success from "../../../Alert/Success";
import Error from "../../../Alert/Error";
import Emoji from "../../../Emoji/Emoji";
import user, { Account } from "../../../store/accountContext";
import InsertMessage from "../ChatItem/ChatItem";
import useSocket from "../../../store/socket";

export enum MessageType {
  text = "TEXT",
  image = "IMAGE",
  file="FILE",
  video="VIDEO",
  call="CALL",
}

export enum CallStatus {
  INVITED,
  MISSED,
  ONGOING,
  ENDED,
}

// export enum TargetType {
//   ROOM,
//   FRIEND,
// }

export enum CallType {
  voice,
  video,
}

export enum MessageStatus {
  sent,
  delivered,
  read,
}

export enum ParticipantType {
  lead,
  member,
}

export enum FriendStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
}

export enum ConversationType {
  GROUP,
  FRIEND,
}

export interface ConversationParticipant {
  id: number;
  userId: number;
  type: ParticipantType;
  createdAt: Date;
  user: User;
}

export interface ConversationVm {
  id: number;
  title: string;
  creatorId: number;
  channelId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  type: ConversationType;
  participants?: ConversationParticipant[];
}

// Message response types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

export interface Attachment {
  thumbUrl: string;
  fileUrl: string;
}

// export interface MessageItem {
//   id: number;
//   guid: string;
//   conversationId: number;
//   targetType: TargetType;
//   senderId: number;
//   messageType: MessageType;
//   content: string;
//   createdAt: string;
//   deletedAt: string | null;
//   callType: CallType;
//   callStatus: CallStatus;
//   status: MessageStatus;
//   user: User;
//   attachments: Attachment[];
// }

export interface MessageResponse {
  statusCode: number;
  message: string;
  data: {
    page: number;
    result: MessageDto[];
    size: number;
    totalPage: number;
    totalElement: number;
  };
}

export interface MessageDto {
  id?: number;
  conversationId: number;
  guid?: number;
  conversationType?: ConversationType;
  messageType: MessageType;
  content: string;
  callType?: CallType;
  callStatus?: CallStatus;
  status?: MessageStatus; // You can default this in your implementation logic
  timestamp?: Date;
  attachments?: Attachment[];
  user?: Account;
}

export interface CallDto extends MessageDto {
  callerInfomation: Account;
  signalData: string;
}

export interface CallResponseDto extends MessageDto {
  signal: string;
}

interface OtherInfo {
  name: string;
  image: string;
  type: ConversationType;
  participants?: ConversationParticipant[];
}

// Function to get other info from conversation
const getOtherInfo = (
  conversation: ConversationVm | undefined,
  currentUserId: string
): OtherInfo => {
  if (!conversation) {
    return {
      name: "All",
      image: "",
      type: ConversationType.FRIEND,
    };
  }

  if (conversation.type === ConversationType.GROUP) {
    return {
      name: conversation.title,
      image: "", // You might want to add a group image field to ConversationVm
      type: ConversationType.GROUP,
      participants: conversation.participants,
    };
  }

  // For friend conversation, find the other participant
  const otherParticipant = conversation.participants?.find(
    (p) => p.userId.toString() !== currentUserId
  );

  return {
    name: otherParticipant
      ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      : "Unknown",
    image: otherParticipant?.user.avatarUrl || "",
    type: ConversationType.FRIEND,
    participants: conversation.participants,
  };
};

export function ChatBox() {
  const socket: any = useSocket;
  if (!socket) return;

  const context = useContext(ChatContext);
  if (!context) return null;

  const { isLoad, setIsLoad, isShowRecent, setIsShowRecent } = context;

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    name: "All",
    image: "",
    type: ConversationType.FRIEND,
  });
  const [conversationId, setConversationId] = useState<number>(-1);
  const [conversationInfo, setConversationInfo] = useState<ConversationVm>();
  const [chatsFriendRecent, setChatsFriendRecent] = useState<MessageDto[]>([]);
  const [isCall, setIsCall] = useState<"none" | "flex">("none");
  const [alertTag, setAlertTag] = useState<JSX.Element | string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messageRecent, setMessageRecent] = useState<JSX.Element[]>([]);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const [myGroups, setMyGroups] = useState<number[]>([]);
  const [chatLimit, setChatLimit] = useState<number>(15);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showLoad, setShowLoad] = useState<boolean>(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [currentHeightOfChats, setCurrentHeightOfChats] = useState<
    number | undefined
  >(undefined);
  const [option, setOption] = useState<number | undefined>(undefined);
  const [coop, setCoop] = useState<string>("");
  const [resetCall, setResetCall] = useState<boolean>(true);

  // Update conversation when isLoad changes
  useEffect(() => {
    if (isLoad) {
      setConversationId(isLoad);
      setAutoScroll(true);
      setChatLimit(15);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isLoad]);

  // Fetch conversation info
  useEffect(() => {
    if (conversationId && conversationId !== -1) {
      fetch(`http://localhost:8080/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data: ConversationVm) => {
          setConversationInfo(data);
        })
        .catch((err) => console.error(err));
    }
  }, [conversationId]);

  // Update other info when conversation changes
  useEffect(() => {
    if (conversationInfo) {
      setOtherInfo(getOtherInfo(conversationInfo, user.id.toString()));
    }
  }, [conversationInfo]);

  useEffect(() => {
    const messages = document.querySelector(
      "#messages"
    ) as HTMLDivElement | null;
    if (messages) {
      messagesRef.current = messages;
      setCurrentHeightOfChats(messages.scrollHeight);
    }
  }, []);

  // Keep old position before fetch
  useEffect(() => {
    if (messagesRef.current && currentHeightOfChats !== undefined) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight - currentHeightOfChats;
    }
  }, [currentHeightOfChats]);

  // useEffect(() => {
  //   fetch(`http://localhost:8080/conversations/${conversationId}/messages`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data: { data: { _id: string }[] }) => {
  //       const result = data.data.map((item) => item._id);
  //       setMyGroups(result);
  //     });
  // }, []);

  // Get message recent with other friend now
  const fetchChat = () => {
    fetch(
      `http://localhost:8080/conversations/${conversationId}/message?page=1&size=${chatLimit}&order=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data: MessageResponse) => {
        if (data.data) {
          setChatsFriendRecent(data.data.result);
          // setOtherName(data.data.otherName);
          // setOtherImage(data.data.otherImage);
        }
        const messages = document.querySelector(
          "#messages"
        ) as HTMLDivElement | null;
        if (messages) {
          setCurrentHeightOfChats(messages.scrollHeight);
        }
        setShowLoad(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchChat();
  }, [conversationId]);

  // Render message recent with other friend now
  useEffect(() => {
    const old: JSX.Element[] = [];
    chatsFriendRecent.forEach((msg) => {
      old.push(<InsertMessage props={[msg, conversationId]} />);
    });
    setMessageRecent(old);
  }, [chatsFriendRecent]);

  // SEND message to server
  function onSubmit(
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FormEvent<HTMLFormElement>
  ) {
    console.log(conversationId);
    event.preventDefault();
    const input = document.getElementById(
      "input"
    ) as HTMLTextAreaElement | null;

    if (input?.value.trim()) {
      const msg: MessageDto = {
        conversationId: conversationId,
        conversationType: conversationInfo?.type,
        messageType: MessageType.text,
        content: input.value,
      };

      socket.emit("sendMessage", msg);
      input.value = "";

      setAutoScroll(true);
      if (inputRef.current) inputRef.current.focus();
    }
  }

  // Scroll top extra and get message previous
  const overScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0) {
      setShowLoad(true);
      setChatLimit((prev) => prev + 20);
      setAutoScroll(false);
      fetchChat();
    } else if (target.scrollTop + window.innerHeight <= target.scrollHeight) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
    }
  };

  // User is typing
  const typing = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    socket.emit("typing", { otherId: conversationId });
  };

  const handleComingMessage = (msg: any) => {
    const tmp = user;
    console.log("xxxxxxxxxxxx " + tmp);
    if (
      msg.conversationId == conversationId
    ) {
      console.log("HERE 1");
      setMessageRecent((prev) => [
        ...prev,
        <InsertMessage props={[msg, conversationId]} />,
      ]);
      return;
    } else {
      console.log("HERE 2");
      setAlertTag(
        <Success
          value={[
            `${
              msg.conversationType === ConversationType.GROUP
                ? "Group message from: " + msg.user?.lastName + ": "
                : ""
            } ${msg.user?.lastName}`,
            [msg.content],
          ]}
        />
      );
      setTimeout(() => setAlertTag(""), 6000);
    }
  };

  useEffect(() => {}, [socket]);

  // useEffect(() => {
  //   socket.on("listOnline", (data: { listOnline: number[] }) => {
  //     setListOnline(data.listOnline);
  //   });
  // }, [socket]);

  // RENDER incoming message realtime
  useEffect(() => {
    socket.on("messageComing", handleComingMessage);
    return () => socket.off("messageComing", handleComingMessage);
  }, [conversationId, messageRecent, myGroups]);

  // Scroll to bottom
  useEffect(() => {
    const messages = document.querySelector(
      "#messages"
    ) as HTMLDivElement | null;
    if (autoScroll && messages) messages.scrollTop = messages.scrollHeight;
  }, [messageRecent]);

  // Check Profile
  const checkProfile = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("checkProfile");
  };

  // SECTION OF CALLING
  // const goCall = (e: React.MouseEvent<HTMLImageElement>) => {
  //   if (isCall === "none") {
  //     setCoop("You calling to " + otherName);
  //     setOption(conversationId);
  //     setIsCall("flex");
  //   } else {
  //     window.alert(
  //       "To CALL/ANSWER doubleClick on `your` screen! \nTo STOP doubleClick on `other` screen \nOr You Can Click Button On Screen !"
  //     );
  //   }
  // };

  // Receiver call
  useEffect(() => {
    socket.on("user_not_online", () => {
      setAlertTag(
        <Error
          value={[
            "Not Online",
            "Current this user not online, pls contact him after !",
          ]}
        />
      );
      setIsCall("none");
      setTimeout(() => setAlertTag(""), 5000);
      setOption(undefined);
      setCoop("");
      setResetCall(false);
    });

    socket.on("open_call", (data: { callerName: string }) => {
      setIsCall("flex");
      setCoop(data.callerName + " calling to you");
    });

    socket.on("refuse_call", () => {
      setCoop("");
      setOption(undefined);
      setIsCall("none");
      console.log("refuse");
      setResetCall(false);
    });

    socket.on("complete_close_call", () => {
      console.log("complete_close_call");
      setCoop("");
      setOption(undefined);
      setIsCall("none");
      setResetCall(false);
    });

    socket.on("give_up_call", () => {
      setCoop("");
      setOption(undefined);
      setIsCall("none");
      setResetCall(false);
    });

    return () => {
      socket.off("user_not_online");
      socket.off("open_call");
      socket.off("refuse_call");
      socket.off("complete_close_call");
      socket.off("give_up_call");
    };
  }, []);

  useEffect(() => {
    if (!resetCall) setResetCall(true);
  }, [resetCall]);

  // Sending call
  const goCall = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isCall === "none") {
      setCoop(`You calling to ${otherInfo.name}`);
      setOption(conversationId);
      setIsCall("flex");
    } else {
      window.alert(
        "To CALL/ANSWER doubleClick on `your` screen! \nTo STOP doubleClick on `other` screen \nOr You Can Click Button On Screen !"
      );
    }
  };

  return (
    <>
      <div>Channel ID = {isLoad}</div>

      {alertTag}
      <div className="header-bar">
        <div
          className="show_recent"
          onClick={() => setIsShowRecent(!isShowRecent)}
        >
          X
        </div>
        <div className="profile">
          <img className="avatar" src={otherInfo.image} />
          <div className="user-profile" onClick={checkProfile}>
            <b>{otherInfo ? otherInfo.name : "All"}</b>
          </div>
        </div>
        <div className="call-icon">
          <img
            onClick={goCall}
            src={
              isCall == "none"
                ? "https://cdn-icons-png.flaticon.com/128/901/901141.png"
                : "https://cdn-icons-png.flaticon.com/128/9999/9999340.png"
            }
          />
          <div className="coop">{coop} </div>
        </div>
        <div className="profile">
          <div className="user-profile" onClick={checkProfile}>
            {" "}
            Watashi <b>{user.lastName}</b>
          </div>
          <img className="avatar" src={user.avatarUrl} />
        </div>
      </div>
      <div className="view-profile"></div>
      <div className="messages" id="messages" onScroll={overScroll}>
        <div className={"announ"}>
          {showLoad ? (
            <div className="load">Load message previous</div>
          ) : (
            <div></div>
          )}
        </div>
        {(messageRecent || []).map((item, index) => {
          return <>{item}</>;
        })}
      </div>
      <div className="video-call" style={{ display: isCall }}>
        {resetCall ? <VideoCall props={option} /> : <></>}
      </div>
      <div className="chat-message">
        <form id="form" className="form_chat" action="">
          <textarea
            ref={inputRef}
            onInput={typing}
            onClick={() => {
              setIsEmoji(false);
              inputRef?.current?.focus();
              if (inputRef.current)
                inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey
                ? submitRef?.current?.click()
                : ""
            }
            className="form_input"
            placeholder=" Kimi no nawa ? "
            id="input"
            autoComplete="on"
          />
          <div
            onClick={() => {
              setIsEmoji(!isEmoji);
              if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.scrollTop = inputRef.current.scrollHeight;
              }
            }}
            className="emoji_icon"
          >
            {isEmoji ? "🥰" : "😉"}
          </div>
          {isEmoji ? (
            <div className="emoji">
              <Emoji value={inputRef} />
            </div>
          ) : (
            <div></div>
          )}
          <button ref={submitRef} className="form_submit" onClick={onSubmit}>
            Send
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatBox;
