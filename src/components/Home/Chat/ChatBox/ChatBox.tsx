import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  useRef,
} from "react";
import "./ChatBox.scss";
import { token } from "../../../store/TokenContext";
import Success from "../../../Alert/Success";
import Error from "../../../Alert/ErrorAlert";
import Emoji from "../../../Emoji/Emoji";
import user, { Account } from "../../../store/accountContext";
import InsertMessage from "../ChatItem/ChatItem";
import socketService from "../../../../socket/Socket";
import { useConversation } from "../../../../hook/ConversationContext";
import { CallProvider, useCall } from "../../../../hook/CallContext";
import VideoCall from "../../Call/Call";

export enum MessageType {
  text = "TEXT",
  image = "IMAGE",
  file = "FILE",
  video = "VIDEO",
  call = "CALL",
}

export enum CallStatus {
  INVITED = "INVITED",
  MISSED = "MISSED",
  ONGOING = "ONGOING",
  ENDED = "ENDED",
}

export enum CallType {
  voice = "VOICE",
  video = "VIDEO",
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
  sid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface Attachment {
  thumbUrl: string;
  fileUrl: string;
}

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
  conversationId: number | undefined;
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

export interface CallDto extends Partial<MessageDto> {
  callerInfomation?: Account;
  signal: string;
  conversation?: ConversationVm;
}

export interface CallResponseDto extends Partial<MessageDto> {
  signal: string;
  callerInfomation: Account;
  conversation: ConversationVm;
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
  currentUserId: number
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
    (p) => p.userId !== currentUserId
  );

  if (conversation.participants && conversation.participants?.length <= 2) {
    return {
      name: otherParticipant
        ? `Friend: ${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : "Unknown",
      image:
        otherParticipant?.user.avatarUrl ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
      type: ConversationType.FRIEND,
      participants: conversation.participants,
    };
  }

  return {
    name: "Group: " + conversation.title,
    image:
      otherParticipant?.user.avatarUrl ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg2EeQe-qNJinTWuKmUVZwpQnXkt6DudNoBQ&s",
    type: ConversationType.GROUP,
    participants: conversation.participants,
  };
};

export function ChatBox() {
  const { conversationId, setConversationId, isShowRecent, setIsShowRecent } =
    useConversation();
  const { conversation, setConversation } = useCall();

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    name: "All",
    image: "",
    type: ConversationType.FRIEND,
  });

  const [callWindow, setCallWindow] = useState<JSX.Element | undefined>(
    <VideoCall />
  );
  const [conversationInfo, setConversationInfo] = useState<ConversationVm>();
  const [chatsFriendRecent, setChatsFriendRecent] = useState<MessageDto[]>([]);
  const [isCall, setIsCall] = useState<"none" | "flex">("none");
  const [alertTag, setAlertTag] = useState<JSX.Element | string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messageRecent, setMessageRecent] = useState<JSX.Element[]>([]);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const [chatLimit, setChatLimit] = useState<number>(15);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showLoad, setShowLoad] = useState<boolean>(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [currentHeightOfChats, setCurrentHeightOfChats] = useState<
    number | undefined
  >(undefined);
  const [coop, setCoop] = useState<string>("");

  // Update conversation when isLoad changes
  // useEffect(() => {
  //   if (conversationIdTransfer) {
  //     setConversationId(conversationIdTransfer);
  //     setAutoScroll(true);
  //     setChatLimit(15);
  //     if (inputRef.current) {
  //       inputRef.current.focus();
  //     }
  //   }
  // }, [conversationIdTransfer]);
  useEffect(() => {
    if (conversationId) {
      setAutoScroll(true);
      setChatLimit(15);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [conversationId]);

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
        .then((data) => {
          setConversationInfo(data.data);
        })
        .catch((err) => console.error(err));
    }
  }, [conversationId]);

  // Update other info when conversation changes
  useEffect(() => {
    if (conversationInfo) {
      setOtherInfo(getOtherInfo(conversationInfo, user.id));
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
          setChatsFriendRecent(data.data.result || []);
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
    console.log(conversationId);
    if (!conversationId) {
      setChatsFriendRecent([]);
    } else fetchChat();
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
    if (!conversationId) return;

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

      socketService.emit("sendMessage", msg);
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
    socketService.emit("typing", { otherId: conversationId });
  };

  const handleComingMessage = (msg: any) => {
    const tmp = user;
    console.log("xxxxxxxxxxxx " + tmp);
    if (msg.conversationId == conversationId) {
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

  useEffect(() => {}, []);

  // useEffect(() => {
  //   socketService.listen("listOnline", (data: { listOnline: number[] }) => {
  //     setListOnline(data.listOnline);
  //   });
  // }, [socket]);

  // RENDER incoming message realtime
  useEffect(() => {
    socketService.listen("messageComing", handleComingMessage);
    return () =>
      socketService.offListener("messageComing", handleComingMessage);
  }, [conversationId, messageRecent]);

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
    socketService.listen("userNotOnline", () => {
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
      setConversation(undefined);

      setCoop("");
    });

    socketService.listen("openCall", (data: CallResponseDto) => {
      setIsCall("flex");
      setConversation(data.conversation);
    });

    socketService.listen("refuseCall", () => {
      setCoop("");
      setIsCall("none");
      console.log("refuse");
      setConversation(undefined);
    });

    socketService.listen("completeCloseCall", () => {
      console.log("complete_close_call");
      setCoop("");
      setConversation(undefined);

      setIsCall("none");
    });

    socketService.listen("giveUpCall", (data: CallDto) => {
      setCoop("");
      setIsCall("none");
      if (data.user?.id === user.id) setConversation(undefined);
    });

    return () => {
      socketService.offListener("userNotOnline");
      socketService.offListener("openCall");
      socketService.offListener("refuseCall");
      socketService.offListener("completeCloseCall");
      socketService.offListener("giveUpCall");
    };
  }, []);

  // Sending call
  const goCall = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isCall === "none") {
      setConversation(conversationInfo);
      setCoop(`You calling to ${otherInfo.name}`);
      setIsCall("flex");
    } else {
      window.alert(
        "To CALL/ANSWER doubleClick on `your` screen! \nTo STOP doubleClick on `other` screen \nOr You Can Click Button On Screen !"
      );
    }
  };

  return (
    <>
      <div>Channel ID = {conversationId}</div>

      {alertTag}
      <div className="header-bar">
        <div
          className="show_recent"
          onClick={() => setIsShowRecent(!isShowRecent)}
        >
          X
        </div>
        <div className="profile">
          <img
            className="avatar"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdeJLB5FW0B08j_swtauclJvI1vSoDFNIgjQ&s"
          />
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
          <img
            className="avatar"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqTVkhCTegQ52T8whAahZj7gNfvJOywWFlOg&s"
          />
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
        {/* {resetCall && option ? ( */}
        {callWindow}
        {/* ) : null} */}
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
