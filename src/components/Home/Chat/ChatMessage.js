import React, { useContext, useEffect, useState ,createContext, useRef} from 'react';
import './ChatMessage.scss'
import { ChatContext } from './Chat';
import { jwtDecode } from 'jwt-decode'
import { insertMessage } from './InsertMessage'
import { getCookie } from '../../store/tokenContext';

import socket from '../socket';
import VideoCall from '../Call/Call';
import Success from '../alert/Success';
import Error from '../alert/Error';
export const ClickContext = createContext();

export function ChatMessage() {
    const token = getCookie('access_token');
    const { username, sub } = jwtDecode(token);

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

    //GET ID OTHER FRIEND
    useEffect(() => {
        setToId(isLoad);
    }, [isLoad])


    // Get message recent with other friend now
    useEffect(() => {
        fetch(`https://quinerrealtime.onrender.com/chats/api/GetChatWithId/${toId}`, {
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
        });
    }, [toId])

    // Render message recent with other friend now
    useEffect(() => {
        const messages = document.querySelector("#messages");
        const elementRemove = document.querySelectorAll("#messages > div");
        if(elementRemove) {
            elementRemove.forEach((e) => {
                e.remove();
            })
        }
        (chatsFriendRecent || []).forEach((msg) => {
            const item = insertMessage(msg, sub);
            messages.appendChild(item);
        })
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
        }
    }

    // RENDER incoming message realtime
    useEffect(() => {
        (async () => {
            if (!socket.current) {
                socket.on("messageComing", (msg) => {
                    if((msg.from_id === sub && msg.to_id === toId)  || (msg.to_id === sub && msg.from_id === toId)) {
                        const messages = document.querySelector("#messages");
                        const item = insertMessage(msg, sub);
                        messages.appendChild(item);
                        messages.scrollTop = messages.scrollHeight;
                    } else if (msg.to_id === sub) {
                        setAlertTag(<Success value={[`Has message from ${msg.from} !`, [msg.content]]}/>);
                        setTimeout(() => {
                            setAlertTag('');
                        }, 5000)
                    }
                });
            }
        })();
        return function cleanup() {socket.off('messageComing')}
    }, [toId]); 

    //Check Profile 
    const checkProfile = (e) => {
        console.log("checkProfile");
    };

/////////////////////////////////////          << SECTION FOR CALL >>        //////////////////////////////////////////////////

    // The ID of otherfriend that passed in call component to call by user
    const [option, setOption] = useState();
    //The friend is call current
    const [coop, setCoop] = useState('');

    //Sender call
    const goCall = (e) => {
       if(isCall == 'none') {
            setCoop(otherName);
            setOption(toId);
            setIsCall('flex');
       } else {
            window.alert('To End Up Call, You Must Click `End Call` On View Call');
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
        });
        // Open call component and confirm call
        socket.on('open_call', (data) => {
            setIsCall('flex');
            setCoop(data.from);
        });
        // socket.on('close_call', (data) => {
        //     setCoop('');
        //     setOption('');
        // });
        socket.on('refuse_call', () => {
            setCoop('');
            setOption('');
            setIsCall('none');
            console.log('refuse');
        })
        socket.on('complete_close_call', () => {
            console.log('complete_close_call');
            setCoop('');
            setOption('');
            setIsCall('none');
        });
        socket.on('give_up_call', () => {
            setCoop('');
            setOption('');
            setIsCall('none');
        });
    }, []);

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
            <div className="messages" id="messages"></div>
            <div className='video-call' style={{display: isCall}}>
                {isCall == 'flex' ?  <VideoCall props={option}/> : <></>}
            </div>
            <div className='chat-message'>
                <form id="form" className="form_chat" action="">
                    <textarea className='form_input' row="1" placeholder=" Type here something..." style={{resize: 'vertical', maxHeight: '25vh', minHeight: "5vh"}} id="input" autocomplete="off"/>
                    <button className='form_submit' onClick = { onSubmit }>Send</button>
                </form>
            </div>
        </>
    );
}

export default ChatMessage;