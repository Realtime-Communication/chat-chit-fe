import React, { use, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import Draggable from "react-draggable";
import "./call.scss";
import {
  ConversationVm,
  CallType,
  CallStatus,
  ConversationType,
  CallDto,
  User,
  CallResponseDto,
  MessageType,
} from "../Chat/ChatBox/ChatBox";
import socketService from "../../../socket/Socket";
import user from "../../store/accountContext";
import { useCall } from "../../../hook/CallContext";

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
  const [optionCall, setOptionCall] = useState(false);
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
      content: `📞 We have a video call from ${'name'} 📞 at ${new Date().toLocaleString(
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
    console.log("call user 1");
    socketService.emit("sendMessage", myConversationState);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.once("signal", (data: SignalData) => {
      console.log("call user 2");
      socketService.emit("callUser", { ...myConversationState, signal: data });
    });

    peer.on("stream", (stream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
        console.log("Caller received signal!");
      }
    });

    socketService.listen("callAccepted", (call: CallResponseDto) => {
      console.log("user had accept");
      setCallAccepted(true);
      peer.signal(call.signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setIsCaller(false);
    console.log("click accept");
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
        console.log("Receiver received signal!");
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
        console.log("prepare removeStream");
        connectionRef.current.removeStream(stream!);
        if (connectionRef.current.writable) {
          connectionRef.current.send("something");
          console.log("has write something");
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
    <div className="call-page">
      <Draggable>
        <div className="video-call">
          <div className="button-call">
            {callAccepted && !callEnded ? (
              <div>
                <button className="give-up-call" onClick={leaveCall}>
                  End Call
                </button>
                <button className="start-call" onClick={changeDirection}>
                  C.Direction
                </button>
              </div>
            ) : (
              !receivingCall && (
                <div>
                  <button className="start-call" onClick={callUser}>
                    {connectionRef.current ? "Calling..." : "Start Call"}
                  </button>
                  <button
                    className="give-up-call"
                    onClick={() => {
                      socketService.emit("giveUpCall", myConversationState);
                    }}
                  >
                    Give Up
                  </button>
                </div>
              )
            )}
          </div>

          {receivingCall && !callAccepted ? (
            <div className="button-call">
              <h1 className="call-from">{'name'} Calling . . .</h1>
              <button className="call-ac" onClick={answerCall}>
                Answer
              </button>
              <button className="call-ac" onClick={refuseCall}>
                Refuse
              </button>
            </div>
          ) : null}

          <div className={direction ? "video-flex-column" : "video-flex-row"}>
            <div className="video--">
              {stream && (
                <video
                  className="rounded-full"
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
                  style={{ width: "300px" }}
                />
              )}
            </div>

            <div className="user-video">
              {callAccepted && !callEnded ? (
                <video
                  className="rounded-full"
                  playsInline
                  ref={userVideo}
                  onDoubleClick={leaveCall}
                  autoPlay
                  style={{ width: "300px" }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Draggable>
      <div className="option-call">
        {optionCall ? (
          <div className="option-call">
            {callAccepted && !callEnded ? (
              <button onClick={leaveCall}>Stop Call</button>
            ) : (
              !receivingCall && (
                <>
                  <button onClick={callUser}>Start Call</button>
                  <button
                    onClick={() => {
                      socketService.emit("giveUpCall", myConversationState);
                    }}
                  >
                    Give Up
                  </button>
                </>
              )
            )}
            {receivingCall && !callAccepted ? (
              <>
                <button onClick={answerCall}>Answer</button>
                <button onClick={refuseCall}>Refuse</button>
              </>
            ) : null}
            <button
              onClick={(e) => {
                const target = e.currentTarget.parentElement;
                if (target) target.classList.toggle("option-column");
              }}
            >
              C.Direction
            </button>
            <button
              onClick={() => setOptionCall(false)}
              className="button-option"
            >
              Close Option
            </button>
          </div>
        ) : (
          <button onClick={() => setOptionCall(true)} className="button-option">
            Option Call
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoCall;
