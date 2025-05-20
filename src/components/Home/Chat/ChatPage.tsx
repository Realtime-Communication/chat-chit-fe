import React, { Context, createContext, useEffect, useState } from "react";
import { Conversation } from "./Conversation/Conversation";
import "./ChatPage.scss";
import { ChatBox } from "./ChatBox/ChatBox";
import {
  ConversationProvider,
  useConversation,
} from "../../../hook/ConversationContext";
import { CallProvider } from "../../../hook/CallContext";

// // Define the shape of the context
// export interface ChatContextType {
//   conversationIdTransfer: number;
//   setConversationIdTransfer: React.Dispatch<React.SetStateAction<number>>;
//   isShowRecent: boolean;
//   setIsShowRecent: React.Dispatch<React.SetStateAction<boolean>>;
// }

// // Create the context with default values
// export let ChatContext = createContext<ChatContextType>({
//   conversationIdTransfer: -1,
//   setConversationIdTransfer: () => {}, // no-op function
//   isShowRecent: true,
//   setIsShowRecent: () => {}, // no-op function
// });

export function Chat() {
  const { conversationId, setConversationId, isShowRecent, setIsShowRecent } =
    useConversation();

  const objectShowChatRecent: React.CSSProperties = {
    display: "flex",
    width: "100%",
  };

  const objectHideChatRecent: React.CSSProperties = {
    display: "none",
  };

  const userWidth: number = window.innerWidth;
  console.log(userWidth);

  return (
    <>
      {
        <div className="chat">
          <div
            className="chat_recent"
            style={
              userWidth <= 500
                ? isShowRecent
                  ? objectShowChatRecent
                  : objectHideChatRecent
                : {}
            }
          >
            <Conversation />
            {isShowRecent && (
              <div
                className="show_recent"
                onClick={() => setIsShowRecent(!isShowRecent)}
              >
                X
              </div>
            )}
          </div>
          <div
            className="chat_message"
            style={
              userWidth <= 500
                ? isShowRecent
                  ? objectHideChatRecent
                  : objectShowChatRecent
                : {}
            }
          >
            <CallProvider>
              <ChatBox />
            </CallProvider>
          </div>
        </div>
      }
    </>
  );
}

export default Chat;
