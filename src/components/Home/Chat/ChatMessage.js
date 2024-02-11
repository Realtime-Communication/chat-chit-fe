import React, { useContext, useEffect, useState ,createContext, useRef} from 'react';
import './ChatMessage.scss'
import { ChatContext } from './Chat';
import { jwtDecode } from 'jwt-decode'
import { getCookie } from '../../store/tokenContext';
import InsertMessage from './InsertMessage';
import VideoCall from '../Call/Call';
import Success from '../alert/Success';
import Error from '../alert/Error';
import socket from '../socket';
export const ClickContext = createContext();
const token = getCookie('access_token');
const info = () => {
    try {
        return jwtDecode(token);
    } catch (error) {
        return {};
    }
}
const { username, sub } = info();

export function ChatMessage() {
    //name of other friend
    const [otherName, setOtherName] = useState(' ');
    // Get id chats with who friend ?
    const [ toId, setToId ] = useState('all');
    // Have new id friend chat
    const { isLoad, setIsLoad } = useContext(ChatContext);
    // Get chats recent with friend id
    const [ chatsFriendRecent, setChatsFriendRecent ] = useState([]);
    // is call
    const [isCall, setIsCall] = useState('none');
    // calling
    const [calling, setCalling] = useState('');
    // Alert tag
    const [alertTag, setAlertTag] = useState('');
    // Input of chat from
    const inputRef = useRef(null);
    // chat recent
    const [messageRecent, setMessageRecent] = useState([]);
    // submit button
    const submitRef = useRef(null);
   

    //GET ID OTHER FRIEND
    useEffect(() => {
        setToId(isLoad);
        inputRef.current.focus();
    }, [isLoad])

    // Get message recent with other friend now
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API}/chats/api/GetChatWithId/${toId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            if(data) {
                setChatsFriendRecent(data.chats);
                setOtherName(data.otherName);
            }
        })
        .catch(err => console.error(err));
    }, [toId])

    // Render message recent with other friend now
    useEffect(() => {
        const messages = document.querySelector("#messages");
        const old = [];
        (chatsFriendRecent || []).forEach((msg) => {
            old.push(<InsertMessage props={[msg, sub]}/>);
        })
        setMessageRecent(old);
        messages.scrollTop = messages.scrollHeight;
    }, [chatsFriendRecent])

    // SEND message to sever
    function onSubmit(event) {
        console.log(toId);
        event.preventDefault();
        const input = document.getElementById('input');
        if (input.value) {
            socket.emit('sendMessage', {
                from_id: sub,
                from: username,
                content: input.value,
                to_id: toId
            });
            input.value = '';
            inputRef.current.focus();
        }
    }

    // user is typing
    const typing = (e) => {
        socket.emit('typing', {otherId: toId})
    }

    // RENDER incoming message realtime
    useEffect(() => {
        (async () => {
            if (!socket.current) {
                socket.on("messageComing", (msg) => {
                    if((msg.from_id === sub && msg.to_id === toId)  || (msg.to_id === sub && msg.from_id === toId)) {
                        setMessageRecent([...messageRecent, ...[<InsertMessage props={[msg, sub]}/>]]);
                    } else if (msg.to_id === sub) {
                        setAlertTag(<Success value={[`Has message from ${msg.from} !`, [msg.content]]}/>);
                        setTimeout(() => {
                            setAlertTag('');
                        }, 5000)
                    }
                });
                const messages = document.querySelector("#messages");
                messages.scrollTop = messages.scrollHeight;
            }
        })();
        return function cleanup() {socket.off('messageComing')}
    }, [toId, messageRecent]); 

    //Check Profile 
    const checkProfile = (e) => {
        console.log("checkProfile");
    };

////////////////////////////////////////////       << SECTION FOR CALL >>       //////////////////////////////////////////////////

    // The ID of otherfriend that passed in call component to call by user
    const [option, setOption] = useState();
    //The friend is call current
    const [coop, setCoop] = useState('');

    const [resetCall, setResetCall] = useState(true);

    //Sender call
    const goCall = (e) => {
       if(isCall === 'none') {
            setCoop('You calling to '+ otherName);
            setOption(toId);
            setIsCall('flex');
       } else {
            window.alert('To CALL/ANSWER doubleClick on `your` screen! \nTo STOP doubleClick on `other` screen \nOr You Can Click Button On Scrren !');
       }
    };
    // Receiver call
    useEffect(() => {
        // user no online
        socket.on('user_not_online', () => {
            setAlertTag(<Error value={['Not Online', 'Current this user not online, pls contact him after !']}/>);
            setIsCall('none');
            setTimeout(() => {
                setAlertTag('');
            }, 5000)
            setOption('');
            setCoop('');
        });
        // Open call component and confirm call
        socket.on('open_call', (data) => {
            setIsCall('flex');
            setCoop(data.callerName + ' calling to you');
        });
        
        socket.on('refuse_call', () => {
            setCoop('');
            setOption(null);
            setIsCall('none');
            console.log('refuse');
            setResetCall(false);
        })
        socket.on('complete_close_call', () => {
            console.log('complete_close_call');
            setCoop('');
            setOption(null);
            setIsCall('none');
            setResetCall(false);
        });
        socket.on('give_up_call', () => {
            setCoop('');
            setOption('');
            setIsCall('none');
            setResetCall(false);
        });
    }, []);
    useEffect(() => {
        if(!resetCall) setResetCall(true);
    }, [resetCall])

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <>
            {alertTag}
            <div className='header-bar'>
                <div className='user-profile' onClick = { checkProfile }><b>{otherName ? otherName.slice(otherName.lastIndexOf(' '), otherName.length) : 'All'}</b></div>
                <div className='call-icon'><img onClick = { goCall } className='call-icon' src={isCall == 'none' ? 'https://cdn-icons-png.flaticon.com/128/901/901141.png' : 'https://cdn-icons-png.flaticon.com/128/9999/9999340.png'} />{coop} </div>
                <div className='user-profile' onClick = { checkProfile }> Mình là <b>{username.slice(username.lastIndexOf(' '), username.length)}</b></div>
            </div>
            <div className='view-profile'></div>
            <div className="messages" id="messages">
                {(messageRecent || []).map((item, index) => <div key={index} className='message-can-dalete'>{item}</div>)}
            </div>
            <div className='video-call' style={{display: isCall}}>
                {resetCall ? <VideoCall props={option}/> : <></>}
            </div>
            <div className='chat-message'>
                <form id="form" className="form_chat" action="">
                    <textarea ref={inputRef} onInput={typing} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? submitRef.current.click() : ''} className='form_input' row="1" placeholder=" Type here something..." style={{resize: 'vertical', maxHeight: '25vh', minHeight: "5vh"}} id="input" autocomplete="on"/>
                    <button ref={submitRef} className='form_submit' onClick = { onSubmit } >Send</button>
                </form>
            </div>
        </>
    );
}

export default ChatMessage;