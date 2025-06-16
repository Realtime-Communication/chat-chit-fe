import React, { useRef, useState } from "react";
import user from "../../../store/accountContext";
import socketService from "../../../../socket/Socket";
import { deleteChat } from "../../../../api/Chat.api";
import { MessageDto } from "../../../../api/Chat.int";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];

interface InsertMessageProps {
  props: [MessageDto, number | undefined];
}

export function InsertMessage({ props }: InsertMessageProps) {
  const [msg, conversationId] = props;

  const [showOption, setShowOption] = useState<boolean>(false);
  const [showDate, setShowDate] = useState<boolean>(false);
  const content = (msg.content || "").split(" ");
  const contentRef = useRef<HTMLDivElement>(null);

  const onMouse = () => {
    setShowOption((prev) => !prev);
  };

  const isDelete = () => {
    if (msg.id === undefined) {
      return;
    }
    const response = deleteChat(msg.id);

    if (window.confirm("Are you sure you want to delete this message?")) {
      response.then(() => {
        socketService.emit("delete_message", { otherId: conversationId });
        if (contentRef.current) {
          contentRef.current.innerHTML = "<b>Message has been deleted</b>";
        }
        setShowOption(false);
      });
    }
  };

  // Telegram-like style
  const isMine = msg.user?.id === user.id;

  return (
    <div
      className={`flex w-full mb-2 ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-end max-w-[75%] ${isMine ? "flex-row-reverse" : ""
          }`}
      >
        {/* Avatar for others */}
        {!isMine && (
          <div className="mr-2">
            <img
              src={
                msg.user?.avatarUrl ||
                "https://ui-avatars.com/api/?name=U"
              }
              alt="avatar"
              className="w-8 h-8 rounded-full border border-gray-200"
            />
          </div>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div
            className={`
              px-4 py-2 rounded-2xl shadow
              ${isMine
                ? "bg-[#e3f2fd] text-[#222] rounded-br-md"
                : "bg-white text-[#222] border border-gray-200 rounded-bl-md"
              }
              cursor-pointer transition
              hover:ring-2 hover:ring-[#b3e5fc]
            `}
            onClick={onMouse}
            ref={contentRef}
          >
            {/* Sender name for group/others */}
            {!isMine && (
              <div className="text-xs font-semibold text-[#0088cc] mb-1">
                {msg.user?.firstName} {msg.user?.lastName}
              </div>
            )}
            <span className="break-words">
              {content.map((item: string | undefined, index: React.Key | null | undefined) => {
                const isImage =
                  typeof item === "string" &&
                  (imageExtensions.some((ext) => item.endsWith("." + ext)) ||
                    item.startsWith("data:image") ||
                    (item.startsWith("https://") &&
                      (item.endsWith(".jpg") ||
                        item.endsWith(".png") ||
                        item.endsWith(".jpeg") ||
                        item.endsWith(".gif"))));
                return isImage ? (
                  <a
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="inline-block"
                  >
                    <img
                      src={item}
                      alt="content"
                      className="max-w-[220px] max-h-[220px] rounded-lg my-1 border border-gray-200"
                    />
                  </a>
                ) : (
                  <span key={index}>{item + " "}</span>
                );
              })}
            </span>
            {/* Timestamp */}
            <div className="flex justify-end mt-1">
              <span className="text-[11px] text-gray-400">
                {msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : ""}
              </span>
            </div>
          </div>

          {/* Options menu */}
          {showOption && (
            <div
              className={`absolute z-10 ${isMine ? "right-0" : "left-0"
                } top-full mt-1 bg-white border border-gray-200 rounded shadow-md flex flex-col min-w-[100px]`}
            >
              {/* {isMine && (
                <button
                  className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-t"
                  onClick={isDelete}
                >
                  Delete
                </button>
              )} */}
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b"
                onClick={() => setShowDate((prev) => !prev)}
              >
                {showDate ? "Hide Info" : "Show Info"}
              </button>
            </div>
          )}

          {/* Date info */}
          {showDate && (
            <div className="mt-1 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 shadow">
              {msg.timestamp
                ? new Date(msg.timestamp).toLocaleString()
                : "No date"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InsertMessage;
