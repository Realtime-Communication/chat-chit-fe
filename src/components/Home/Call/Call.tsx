import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import socketService from "../../../socket/Socket";
import user from "../../store/accountContext";
import { useCall } from "../../../hook/CallContext";
import { CallDto, CallResponseDto, CallStatus, CallType, MessageType, User } from "../../../api/Chat.int";

interface SignalData {
  signal: any;
}

function VideoCall() {
  const { conversation, setConversation } = useCall();
  const [myConversationState, setMyConversationState] = useState<CallDto | undefined>(undefined);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState<User | undefined>(undefined);
  const [callerSignal, setCallerSignal] = useState<string>("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);

  const [isCaller, setIsCaller] = useState(true);
  const [direction, setDirection] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    socketService.listen("callUser", (data: CallDto) => {
      setReceivingCall(true);
      setCaller(data.callerInfomation);
      setCallerSignal(data.signal);
    });
  }, [conversation]);

  useEffect(() => {
    setReceivingCall(false);
    setCaller(undefined);
    setCallerSignal("");
    setCallAccepted(false);
    setCallEnded(false);
    setIsCaller(true);

    userVideo.current = null;
    connectionRef.current = null;

    setMyConversationState({
      conversationId: conversation?.id,
      conversationType: conversation?.type,
      content: `📞 We have a video call 📞 at ${new Date().toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      )}`,
      callType: CallType.voice,
      callStatus: CallStatus.INVITED,
      callerInfomation: user,
      signal: "",
      messageType: MessageType.video,
      conversation: conversation,
    });
  }, [conversation]);

  const callUser = () => {
    setIsCaller(false);
    socketService.emit("sendMessage", myConversationState);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.once("signal", (data: SignalData) => {
      socketService.emit("callUser", { ...myConversationState, signal: data });
    });

    peer.on("stream", (stream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socketService.listen("callAccepted", (call: CallResponseDto) => {
      setCallAccepted(true);
      peer.signal(call.signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setIsCaller(false);
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.once("signal", (data: string) => {
      socketService.emit("answerCall", {
        ...myConversationState,
        signal: data,
      });
    });

    peer.on("stream", (stream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const refuseCall = () => {
    socketService.emit("refuseCall", myConversationState);
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      try {
        connectionRef.current.removeStream(stream!);
        if (connectionRef.current.writable) {
          connectionRef.current.send("something");
        }
      } catch (error) {
        console.log(error);
      }
    }
    socketService.emit("completeCloseCall", myConversationState);
  };

  const changeDirection = () => {
    setDirection(!direction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
              alt="Telegram"
              className="w-7 h-7"
            />
            <span className="font-semibold text-[#0088cc] text-lg">Video Call</span>
          </div>
          <button
            className="text-gray-400 hover:text-red-500 text-2xl"
            onClick={leaveCall}
            title="End Call"
          >
            ✕
          </button>
        </div>

        {/* Video Area */}
        <div className={`flex ${direction ? "flex-col" : "flex-row"} gap-2 sm:gap-4 items-center justify-center`}>
          {/* My Video */}
          <div className="flex flex-col items-center">
            <video
              className="rounded-xl border border-gray-200 bg-gray-100 w-32 h-32 sm:w-48 sm:h-48 object-cover"
              playsInline
              muted
              ref={myVideo}
              onDoubleClick={
                isCaller
                  ? !receivingCall
                    ? callUser
                    : answerCall
                  : undefined
              }
              autoPlay
            />
            <span className="text-xs text-gray-500 mt-1">You</span>
          </div>
          {/* User Video */}
          <div className="flex flex-col items-center">
            {callAccepted && !callEnded ? (
              <>
                <video
                  className="rounded-xl border border-gray-200 bg-gray-100 w-32 h-32 sm:w-48 sm:h-48 object-cover"
                  playsInline
                  ref={userVideo}
                  onDoubleClick={leaveCall}
                  autoPlay
                />
                <span className="text-xs text-gray-500 mt-1">
                  {caller?.firstName || "Other"}
                </span>
              </>
            ) : (
              <div className="w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                <span className="text-sm">Waiting...</span>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex flex-col gap-2 mt-2">
          {callAccepted && !callEnded ? (
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 bg-[#ff5c5c] hover:bg-[#e44c4c] text-white rounded-full font-medium"
                onClick={leaveCall}
              >
                End Call
              </button>
              <button
                className="px-4 py-2 bg-[#e3f2fd] hover:bg-[#b3e5fc] text-[#0088cc] rounded-full font-medium"
                onClick={changeDirection}
              >
                Change Layout
              </button>
            </div>
          ) : !receivingCall ? (
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium"
                onClick={callUser}
                disabled={!!connectionRef.current}
              >
                {connectionRef.current ? "Calling..." : "Start Call"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium"
                onClick={() => socketService.emit("giveUpCall", myConversationState)}
              >
                Give Up
              </button>
            </div>
          ) : null}

          {receivingCall && !callAccepted && (
            <div className="flex flex-col gap-2 items-center">
              <span className="font-medium text-[#0088cc] text-base">
                {caller?.firstName || "Someone"} is calling...
              </span>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-full font-medium"
                  onClick={answerCall}
                >
                  Answer
                </button>
                <button
                  className="px-4 py-2 bg-[#ff5c5c] hover:bg-[#e44c4c] text-white rounded-full font-medium"
                  onClick={refuseCall}
                >
                  Refuse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCall;
