import React, { use, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import Draggable from "react-draggable";
import "./Call.scss";
import socketService from "../../../../socket/Socket";
import user from "../../../store/accountContext";
import { useCall } from "../../../../hook/CallContext";
import SimplePeer from "simple-peer";
import { CallDto, CallResponseDto, CallStatus, CallType, MessageType, User } from "../../../../api/Chat.int";
interface SignalData {
  signal: any;
}

interface CallParticipant {
  // participantId: number; // Changed to number to match userId
  // participantInfo: User;
  userVideo: HTMLVideoElement | undefined;
  peer: SimplePeer.Instance | null;
  signal: string | null; // Added signal property
}

// flow: Gửi stream của mình cho người khác
// flow: Nhận stream từ người khác
// flow: Nhận stream từ người khác

function VideoCall() {
  const { conversation } = useCall();
  const [myConversationState, setMyConversationState] = useState<
    CallDto | undefined
  >(undefined);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState<User | undefined>(undefined);
  const [signalComing, setSignalComing] = useState<string[]>([]);
  const [callerSignal, setCallerSignal] = useState<string>("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideos = useRef<CallParticipant[]>([]);
  const peersRef = useRef<Map<number, SimplePeer.Instance>>(new Map());

  const [isCaller, setIsCaller] = useState(true);
  const [direction, setDirection] = useState(false);
  const [optionCall, setOptionCall] = useState(false);

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

    socketService.listen("receivedSignal", (data: CallDto) => {
      setReceivingCall(true);
      setCallerSignal(data.signal);
      // setSignalComing((signalComing) => [...signalComing, data.signal]);
    });
  }, [conversation]);

  useEffect(() => {
    setReceivingCall(false);
    setCaller(undefined);
    setCallerSignal("");
    setCallAccepted(false);
    setCallEnded(false);
    setIsCaller(true);

    userVideos.current = [];
    // connectionRef.current = null;

    setMyConversationState({
      conversationId: conversation?.id,
      conversationType: conversation?.type,
      content: `📞 We have a video call from ${"name"} 📞 at ${new Date().toLocaleString(
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
      trickle: false,
      stream: stream,
      initiator: true,
    });

    const callParticipant: CallParticipant = {
      userVideo: undefined,
      peer: null,
      signal: null,
    };

    peer.once("signal", (data: SignalData) => {
      console.log("call user 2");
      socketService.emit("callUser", {
        ...myConversationState,
        signal: data,
      });
    });

    peer.on("stream", (stream: MediaStream) => {
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;

      callParticipant.userVideo = videoElement;
      userVideos.current.push(callParticipant);
    });

    socketService.listen("callAccepted", (call: CallResponseDto) => {
      setCallAccepted(true);
      peer.signal(call.signal);
    });

    callParticipant.peer = peer;
  };

  const joinCallAndSendSignal = () => {
    setIsCaller(false);
    setCallAccepted(true);

    const peer = new Peer({
      trickle: false,
      stream: stream,
      initiator: false,
    });

    const callParticipant: CallParticipant = {
      userVideo: undefined,
      peer: null,
      signal: null,
    };

    peer.once("signal", (data: string) => {
      socketService.emit("answerCall", {
        ...myConversationState,
        signal: data,
      });
    });

    peer.on("stream", (stream: MediaStream) => {
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      callParticipant.userVideo = videoElement;
      userVideos.current.push(callParticipant);
    });

    peer.signal(callerSignal);
    callParticipant.peer = peer;
  };

  const refuseCall = () => {
    socketService.emit("refuseCall", myConversationState);
  };

  const leaveCall = () => {
    setCallEnded(true);
    userVideos.current.forEach((userVideo) => {
      if (userVideo.peer) {
        try {
          console.log("prepare removeStream");
          userVideo.peer.removeStream(stream!);
          if (userVideo.peer.writable) {
            userVideo.peer.send("something");
            console.log("has write something");
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
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
                    {userVideos.current[0] ? "Calling..." : "Start Call"}
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
              <h1 className="call-from">{"name"} Calling . . .</h1>
              <button className="call-ac" onClick={joinCallAndSendSignal}>
                Answer
              </button>
              <button className="call-ac" onClick={refuseCall}>
                Refuse
              </button>
            </div>
          ) : null}

          <div className={direction ? "video-flex-column" : "video-flex-row"}>
            <div className="my-video">
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
                        : joinCallAndSendSignal
                      : undefined
                  }
                  autoPlay
                  style={{ width: "300px" }}
                />
              )}
            </div>

            <div className="user-video">
              {callAccepted && !callEnded
                ? userVideos.current.map((userVideo, index) => {
                    return (
                      <video
                        className="rounded-full"
                        playsInline
                        ref={(el) => {
                          if (
                            el &&
                            userVideo &&
                            userVideo.userVideo?.srcObject
                          ) {
                            el.srcObject = userVideo.userVideo.srcObject;
                          }
                        }}
                        onDoubleClick={leaveCall}
                        autoPlay
                        style={{ width: "300px" }}
                      />
                    );
                  })
                : null}
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
                <button onClick={joinCallAndSendSignal}>Answer</button>
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
