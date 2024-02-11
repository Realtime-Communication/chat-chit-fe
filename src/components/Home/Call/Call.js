import React, { useContext, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "../../store/tokenContext";
import { ClickContext } from "../Chat/ChatMessage";
import Draggable, {DraggableCore} from "react-draggable";
import './call.scss'
import socket from "../socket";
const token = getCookie('access_token');
const info = () => {
    try {
        return jwtDecode(token);
    } catch (error) {
        return {};
    }
}
const { username, sub } = info();
function VideoCall(props) {
    
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");

    const userVideo = useRef({});
    const connectionRef = useRef(null);
    const myVideo = useRef({});

    // useEffect(() => {
    //     console.log('myVideo  ', myVideo);
    // }, [myVideo])
    // useEffect(() => {
    //     console.log('userVideo', userVideo);
    // }, [userVideo])

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
        })
        .catch((error) => {
            console.error("Error accessing media devices:", error);
        });

        socket.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });
    }, []);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
        })
        .catch((error) => {
            console.error("Error accessing media devices:", error);
        });
    }, []);
    
    const callUser = (id) => {
        console.log("call uer 1");
        socket.emit('sendMessage', {
            from_id: sub,
            from: username,
            content: `<b>We are have a video call from ${username}</b>`,
            to_id: id
        });
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });
        peer.once("signal", (data) => {
            console.log("call uer 2");
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: sub,
                name: username,
            });
        });

        peer.once("stream", (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
                console.log("at nguoi goi");
            }
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        console.log('click ac');
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.once("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.once("stream", (stream) => {
        if (userVideo.current) {
            console.log("at nguoi nghe");
            userVideo.current.srcObject = stream;
        }
        });
        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const refuseCall = (e) => {
        socket.emit('refuse_call', {
            otherId: caller
        })
    }

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            try {
                setStream(null);
                console.log("repare destroy");
                connectionRef.current.removeStream(stream);
                console.log("Had destroy");
            } catch (error) {
                console.log(error);
            }
        }
        socket.emit('complete_close_call', {});
    };

    // Direction video
    const [direction, setDirection] = useState(false);
    const changeDirection = (e) => {
        setDirection(!direction);
    }

  return (
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
                    (!receivingCall && (
                        <div>
                            <button
                                className="start-call"
                                onClick={() => callUser(props.props)}
                            >
                                Start Call
                            </button>
                            <button
                                className="give-up-call"
                                onClick={() => {
                                    socket.emit('give_up_call', {
                                        otherId: props.props
                                    });
                                }}
                            >
                                Give Up
                            </button>
                        </div>
                    ))
                )}
            </div>

            {receivingCall && !callAccepted ? (
            <div className="button-call">
                <h1 className="call-from">{name} Calling . . .</h1>
                <button
                    className="call-ac"
                    onClick={answerCall}
                >
                Answer
                </button>
                <button
                    className="call-ac"
                    onClick={refuseCall}
                >
                Refuse
                </button>
            </div>
            ) : null}




            <div className={direction ? 'video-flex-column' : 'video-flex-row'}>
                <div className="my-video">
                    {stream && (
                    <video
                        className="rounded-full"
                        playsInline
                        muted
                        ref={myVideo}
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
                            autoPlay
                            style={{ width: "300px" }}
                        />
                    ) : (
                        <></>
                    )}
                </div>
            </div>

        </div>
    </Draggable>
  );
}

export default VideoCall;

