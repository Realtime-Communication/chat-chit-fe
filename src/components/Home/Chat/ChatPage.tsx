import { useEffect, useState } from "react";
import { Conversation } from "./Conversation/Conversation";
import { ChatBox } from "./ChatBox/ChatBox";
import { useConversation } from "../../../hook/ConversationContext";
import { CallProvider } from "../../../hook/CallContext";

export function Chat() {
  const {
    conversationId,
    setConversationId,
    isShowRecent,
    setIsShowRecent,
  } = useConversation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);

  // Cập nhật khi thay đổi kích thước cửa sổ
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar hội thoại */}
      <div
        className={`transition-all duration-300 ${
          isMobile
            ? isShowRecent
              ? "w-full"
              : "hidden"
            : "w-[30%] border-r border-gray-300"
        }`}
      >
        <div className="h-full relative">
          <Conversation />
          {isMobile && isShowRecent && (
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setIsShowRecent(false)}
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Hộp thoại chat */}
      <div
        className={`transition-all duration-300 flex-1 ${
          isMobile
            ? isShowRecent
              ? "hidden"
              : "w-full"
            : "w-[70%]"
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
