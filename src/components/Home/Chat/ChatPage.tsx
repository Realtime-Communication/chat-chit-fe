import { useEffect, useState } from "react";
import { Conversation } from "./Conversation/Conversation";
import { ChatBox } from "./ChatBox/ChatBox";
import { useConversation } from "../../../hook/ConversationContext";
import { CallProvider } from "../../../hook/CallContext";

export function Chat() {
  const {
    isShowRecent,
    setIsShowRecent,
  } = useConversation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 gap-1">
      {/* Sidebar (Conversation List) */}
      <div
        className={`transition-all duration-300 bg-white ${isMobile
            ? isShowRecent
              ? "w-full absolute z-20 left-0 top-0 h-full shadow-lg"
              : "hidden"
            : "w-[350px] border-r border-gray-200"
          }`}
      >
        <div className="h-full relative">
          <Conversation />
          {isMobile && isShowRecent && (
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setIsShowRecent(false)}
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`transition-all duration-300 flex-1 flex flex-col rounded ${isMobile
            ? isShowRecent
              ? "hidden"
              : "w-full"
            : ""
          }`}
      >
        <CallProvider>
          <ChatBox />
        </CallProvider>
      </div>
    </div>
  );
}

export default Chat;
