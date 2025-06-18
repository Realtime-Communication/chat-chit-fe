import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import { token } from "../../../store/TokenContext";
import Success from "../../../Alert/Success";
import Error from "../../../Alert/ErrorAlert";
import Emoji from "../../../Emoji/Emoji";
import user from "../../../store/accountContext";
import InsertMessage from "../ChatItem/ChatItem";
import socketService from "../../../../socket/Socket";
import { useConversation } from "../../../../hook/ConversationContext";
import { useCall } from "../../../../hook/CallContext";
import VideoCall from "../../Call/Call";
import UserInfoPanel from "./UserInfoPanel";
import {
  CallDto, CallResponseDto, ConversationType, ConversationVm,
  MessageDto, MessageResponse, MessageType, OtherInfo
} from "../../../../api/Chat.int";
import { getChatByConversationId, getConversationById } from "../../../../api/Chat.api";

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
  const [showUserInfoPanel, setShowUserInfoPanel] = useState<boolean>(false);

  useEffect(() => {
    if (conversationId) {
      setAutoScroll(true);
      setChatLimit(15);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && conversationId !== -1) {
      const respone = getConversationById(conversationId);
      respone
        .then((res) => res.json())
        .then((data) => {
          setConversationInfo(data.data);
        })
        .catch((err) => console.error(err));
    }
  }, [conversationId]);

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

  useEffect(() => {
    if (messagesRef.current && currentHeightOfChats !== undefined) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight - currentHeightOfChats;
    }
  }, [currentHeightOfChats]);

  const fetchChat = () => {    const respone = getChatByConversationId(conversationId ?? -1, chatLimit);
    respone
      .then((res) => res.json())
      .then((data: MessageResponse) => {
        console.log("Fetched messages:", data);
        if (data.data) {
          setChatsFriendRecent(data.data.result || []);
        }
        if (data.data.result.length === 0) {
          setShowLoad(false);
          setChatsFriendRecent([]);
        }
        const messages = document.querySelector(
          "#messages"
        ) as HTMLDivElement | null;
        if (messages) {
          setCurrentHeightOfChats(messages.scrollHeight);
        }
        setShowLoad(false);
      })
      .catch((err) => {
        console.error("Error fetching chat:", err)
        setChatsFriendRecent([]);
        setShowLoad(false);
      });
  };

  useEffect(() => {
    if (!conversationId) {
      setChatsFriendRecent([]);
      setMessageRecent([]);
    } else {
      fetchChat();
    }
  }, [conversationId]);

  useEffect(() => {
    console.log("Chats updated:", chatsFriendRecent);
    const old: JSX.Element[] = [];
    chatsFriendRecent.forEach((msg) => {
      old.push(<InsertMessage key={msg.id || Math.random()} props={[msg, conversationId]} />);
    });
    setMessageRecent(old);
  }, [chatsFriendRecent, conversationId]);

  useEffect(() => {
    console.log("MessageRecent updated:", messageRecent.length);
  }, [messageRecent]);

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

  const typing = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    socketService.emit("typing", { otherId: conversationId });
  };

  const handleComingMessage = (msg: any) => {
    console.log("Incoming message:", msg);
    if (msg.conversationId == conversationId) {
      console.log("Adding message to current conversation");
      setMessageRecent((prev) => [
        ...prev,
        <InsertMessage key={msg.id || Math.random()} props={[msg, conversationId]} />,
      ]);
      return;
    } else {
      setAlertTag(
        <Success
          value={[
            `${msg.conversationType === ConversationType.GROUP
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

  useEffect(() => {
    socketService.listen("messageComing", handleComingMessage);
    return () =>
      socketService.offListener("messageComing", handleComingMessage);
  }, [conversationId]);

  useEffect(() => {
    const messages = document.querySelector(
      "#messages"
    ) as HTMLDivElement | null;
    if (autoScroll && messages) {
      console.log("Auto scrolling to bottom");
      messages.scrollTop = messages.scrollHeight;
    }
  }, [messageRecent, autoScroll]);

  const checkProfile = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowUserInfoPanel(true);
  };

  const showCurrentUserProfile = () => {
    // Create a temporary otherInfo for current user display
    const currentUserInfo = {
      name: `${user.firstName} ${user.lastName}`,
      image: user.avatarUrl || "/user/friend.png",
      type: ConversationType.FRIEND,
      participants: [], // Empty to indicate current user
    };
    setOtherInfo(currentUserInfo);
    setShowUserInfoPanel(true);
  };

  const showOtherUserProfile = () => {
    // Restore the original otherInfo
    if (conversationInfo) {
      setOtherInfo(getOtherInfo(conversationInfo, user.id));
    }
    setShowUserInfoPanel(true);
  };

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
      setConversation(undefined);
    });

    socketService.listen("completeCloseCall", () => {
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

  const goCall = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <div className="flex flex-col h-full w-full bg-gray-100 border rounded">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border border-gray-200 bg-[#0088cc]">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-black text-xl"
            onClick={() => setIsShowRecent(!isShowRecent)}
          >
            <span className="material-icons">menu</span>
          </button>
          <img
            className="w-12 h-12 rounded-full object-cover border border-[#4fbc6b] cursor-pointer hover:opacity-80 transition"
            src={"/user/friend.png"}
            alt="avatar"
            onClick={showOtherUserProfile}
          />
          <div className="flex flex-col">
            <span className="text-black font-semibold text-lg">
              {otherInfo ? otherInfo.name : "All"}
            </span>
            {coop && (
              <span className="text-xs text-[#4fbc6b]">{coop}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full bg-[#4fbc6b] hover:bg-[#43a85c] transition"
            onClick={goCall}
            title="Call"
          >
            <img
              className="w-6 h-6"
              src={
                isCall == "none"
                  ? "https://cdn-icons-png.flaticon.com/128/901/901141.png"
                  : "https://cdn-icons-png.flaticon.com/128/9999/9999340.png"
              }
              alt="call"
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-black text-sm">You</span>
            <img
              className="w-10 h-10 rounded-full object-cover border border-[#4fbc6b] cursor-pointer hover:opacity-80 transition"
              src="/user/friend.png"
              alt="me"
              onClick={showCurrentUserProfile}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alertTag && <div className="px-6 pt-2">{alertTag}</div>}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gray-50"
        id="messages"
        onScroll={overScroll}
      >
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-500 mb-2">
          Debug: {messageRecent.length} messages, {chatsFriendRecent.length} chats
        </div>
        
        {showLoad && (
          <div className="flex justify-center mb-2">
            <span className="text-xs text-gray-400">Loading previous messages...</span>
          </div>
        )}
        {messageRecent && messageRecent.length > 0 ? (
          messageRecent.map((item, index) => (
            <React.Fragment key={`message-${index}`}>{item}</React.Fragment>
          ))
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-400">
            <span>No messages yet. Start a conversation!</span>
          </div>
        )}
      </div>

      {/* Video Call */}
      <div className="fixed inset-0 z-50" style={{ display: isCall }}>
        {callWindow}
      </div>

      {/* User Info Panel */}
      <UserInfoPanel
        isOpen={showUserInfoPanel}
        onClose={() => setShowUserInfoPanel(false)}
        otherInfo={otherInfo}
        conversationInfo={conversationInfo}
      />

      {/* Chat Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white rounded">
        <form
          id="form"
          className="flex items-end gap-2"
          onSubmit={onSubmit}
          autoComplete="off"
        >
          <div className="relative flex-1">
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
                  : undefined
              }
              className="w-full resize-none rounded-2xl px-4 py-3 bg-gray-100 text-black border border-[#4fbc6b] focus:outline-none"
              placeholder="Type a message..."
              id="input"
              rows={1}
              autoComplete="on"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              type="button"
              className="absolute right-2 bottom-2 text-xl"
              onClick={() => {
                setIsEmoji(!isEmoji);
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.scrollTop = inputRef.current.scrollHeight;
                }
              }}
              tabIndex={-1}
            >
              <span>{isEmoji ? "🥰" : "😉"}</span>
            </button>
            {isEmoji && (
              <div className="absolute left-0 bottom-12 z-10">
                <Emoji value={inputRef} />
              </div>
            )}
          </div>
          <button
            ref={submitRef}
            className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-full px-6 py-2 font-semibold transition"
            onClick={onSubmit}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
