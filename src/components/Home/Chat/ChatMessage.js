import React, { useContext, useEffect, useState ,createContext, useRef} from 'react';
import './ChatMessage.scss'
import { ChatContext } from './Chat';
import { decodeToken, token } from '../../store/tokenContext';
import InsertMessage from './InsertMessage';
import VideoCall from '../Call/Call';
import Success from '../../Alert/Success';
import Error from '../../Alert/Error';
import socket from '../socket';
import Emoji from '../../Emoji/Emoji';

const { username, sub, image } = decodeToken;
export function ChatMessage() {
    //name of other friend
    const [otherName, setOtherName] = useState(' ');
    // Get id chats with who friend ?
    const [ toId, setToId ] = useState('all');
    // Have new id friend chat
    const { isLoad, setIsLoad, isShowRecent,setIsShowRecent } = useContext(ChatContext);
    // Get chats recent with friend id
    const [ chatsFriendRecent, setChatsFriendRecent ] = useState([]);
    // is call
    const [isCall, setIsCall] = useState('none');
    // Alert tag
    const [alertTag, setAlertTag] = useState('');
    // Input of chat from
    const inputRef = useRef(null);
    // chat recent
    const [messageRecent, setMessageRecent] = useState([]);
    // submit button
    const submitRef = useRef(null);
    // show Emoji
    const [isEmoji, setIsEmoji] = useState(false);
    // list my groups
    const [myGroups, setMyGroups] = useState([]);
    // avatar other
    const [otherImage, setOtherImage] = useState('');
    // limit chat document
    const [chatLimit, setChatLimit] = useState(15);
    const [autoScroll, setAutoScroll] = useState(true);
    const [showLoad, setShowLoad] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API}/groups/mygroups`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            const result = data.data.map(item => item._id);
            setMyGroups(result);
        })
    }, [])

    //GET ID OTHER FRIEND
    useEffect(() => {
        setToId(isLoad);
        setAutoScroll(true);
        setChatLimit(15);
        inputRef.current.focus();
    }, [isLoad])

    // Get message recent with other friend now
    const fetchChat = () => {
        fetch(`${process.env.REACT_APP_API}/chats/with-id/${toId}?limit=${chatLimit}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            data = data.data;
            if(data) {
                setChatsFriendRecent(data.chats);
                setOtherName(data.otherName);
                setOtherImage(data.otherImage);
            }
            const messages = document.querySelector("#messages");
            if(data.chats.length > chatsFriendRecent.length) messages.scrollTop = messages.scrollTop + messages.scrollHeight/10;
            setShowLoad(false);
        })
        .catch(err => console.error(err));
    }
    useEffect(() => {
        fetchChat();
    }, [toId])
    
    // Render message recent with other friend now
    useEffect(() => {
        const old = [];
        (chatsFriendRecent || []).forEach((msg) => {
            old.push(<InsertMessage props={[msg, sub, toId]}/>);
        })
        setMessageRecent(old);
    }, [chatsFriendRecent]);

    // SEND message to sever
    function onSubmit(event) {
        console.log(toId);
        event.preventDefault();
        const input = document.getElementById('input');
        if (input.value.trim()) {
            socket.emit('sendMessage', {
                from_id: sub,
                from: username,
                content: input.value,
                to_id: toId,
                group: otherName
            });
            input.value = '';
            setAutoScroll(true);
            inputRef.current.focus();
        }
    }

    // scroll top extra and get message previous
    const overScroll = (e) => {
        if(e.target.scrollTop === 0) {
            setShowLoad(true);
            setChatLimit(chatLimit + 20);
            setAutoScroll(false);
            fetchChat();
        } else if(e.target.scrollTop + window.innerHeight <= e.target.scrollHeight){
            setAutoScroll(false);
        } else {
            setAutoScroll(true);
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
                    console.log('msg'); //(msg.from_id === sub && msg.to_id === toId)  || (msg.to_id === sub && msg.from_id === toId)
                    if((msg.from_id === sub)  || (msg.to_id === sub && msg.from_id === toId) || (toId === msg.to_id && myGroups.includes(msg.to_id)) ) {
                        setMessageRecent([...messageRecent, ...[<InsertMessage props={[msg, sub, toId]}/>]]);
                    } else if (msg.to_id === sub || myGroups.includes(msg.to_id)) {
                        setAlertTag(<Success value={[`${msg.group ? msg.group + ': ': '' } ${msg.from}`, [msg.content]]}/>);
                        setTimeout(() => {
                            setAlertTag('');
                        }, 6000)
                    }
                });
            }
        })();
        return function cleanup() {socket.off('messageComing')};
    }, [toId, messageRecent, myGroups]);

    // scroll to bottom
    useEffect(() => {
        const messages = document.querySelector("#messages");
        if(autoScroll) (messages.scrollTop = messages.scrollHeight)
        // else 
    }, [messageRecent])

    // check Profile
    const checkProfile = (e) => {
        console.log("checkProfile");
    };

//////////////////////////////////////////////////////       << SECTION FOR CALL >>       //////////////////////////////////////////////////

    // The ID of otherfriend that passed in call component to call by user
    const [option, setOption] = useState();
    //The friend is call current
    const [coop, setCoop] = useState('');

    const [resetCall, setResetCall] = useState(true);

    //Sending call
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
            setResetCall(false);
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
                <div className='show_recent' onClick={() => setIsShowRecent(!isShowRecent)}>X</div>
                <div className='profile'>
                    <img className='avatar' src={otherImage}/>
                    <div className='user-profile' onClick = { checkProfile }><b>{otherName ? otherName.slice(otherName.lastIndexOf(' '), otherName.length) : 'All'}</b></div>
                </div>
                <div className='call-icon'><img onClick = { goCall } src={isCall == 'none' ? 'https://cdn-icons-png.flaticon.com/128/901/901141.png' : 'https://cdn-icons-png.flaticon.com/128/9999/9999340.png'} /><div className='coop'>{coop} </div></div>
                <div className='profile'>
                    <div className='user-profile' onClick = { checkProfile }> Watashi <b>{username.slice(username.lastIndexOf(' '), username.length)}</b></div>
                    <img className='avatar' src={image}/>
                </div>
            </div>
            <div className='view-profile'></div>
            <div className="messages" id="messages" onScroll={overScroll}>
                <div class={'announ'}>
                    {showLoad ? <div className='load'>Load message previous</div> : <div></div>}
                </div>
                {(messageRecent || []).map((item, index) => <>{item}</> )}
            </div>
            <div className='video-call' style={{display: isCall}}>
                {resetCall ? <VideoCall props={option}/> : <></>}
            </div>
            <div className='chat-message'>
                <form id="form" className="form_chat" action="">
                    <textarea ref={inputRef} onInput={typing} onClick={() => {setIsEmoji(false); inputRef.current.focus(); inputRef.current.scrollTop = inputRef.current.scrollHeight}} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? submitRef.current.click() : ''} className='form_input' placeholder=" Kimi no nawa ? "  id="input" autocomplete="on"/>
                    <div onClick={() => {setIsEmoji(!isEmoji); inputRef.current.focus(); inputRef.current.scrollTop = inputRef.current.scrollHeight}} className='emoji_icon'>{isEmoji ? '🥰' : '😉'}</div>
                    {isEmoji ? <div className='emoji' ><Emoji value={inputRef}/></div> : <div></div>}
                    <button ref={submitRef} className='form_submit' onClick = { onSubmit }>Send</button>
                </form>
            </div>
        </>
    );
}

export default ChatMessage;