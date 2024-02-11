import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import './ChatRecent.scss';
import { ChatContext } from './Chat';
import { jwtDecode } from 'jwt-decode';
import { getCookie } from '../../store/tokenContext';
import socket from '../socket';
const token = getCookie('access_token');
const info = () => {
    try {
        return jwtDecode(token);
    } catch (error) {
        return {};
    }
}
const { username, sub } = info();
export function ChatsRecent() {

    const [listOnline, setListOnline] = useState([]);

    const {isLoad, setIsLoad} = useContext(ChatContext);

    const [lastChatsId, setLastChatsId] = useState([]);
    const [lastChatsObj, setLastChatsObj] = useState([]);

    //users is typing with you
    const [userTyping, setUserTyping] = useState([]);

    const itemRef = useRef(null);

    const onclick = (e) => {
        const target = e.target.closest(".recent-item");
        const before = itemRef.current.getElementsByClassName("current-recent");
        if(before[0]) before[0].classList.remove("current-recent");
        target.classList.add("current-recent");
        setIsLoad(target.getAttribute('data-id'));
    }

    const [chatRecent, setChatRecent] = useState([]);
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API}/chats/api/friendschats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            setChatRecent(data);
        })
        .catch(err => console.error(err));
    }, []);

    //Last chats
    const fetchLastMessage = () => {
        fetch(`${process.env.REACT_APP_API}/chats/api/getlastchats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            const [x, y] = data;
            setLastChatsId(x);
            setLastChatsObj(y);
        })
        .catch(err => console.error(err));
    }

    useEffect(() => {
        const old = chatRecent;
        old.forEach( item => {
            const index = lastChatsId.indexOf(item._id);
            if(lastChatsObj[index]) {
                item.msgTime = lastChatsObj[index].msgTime;
                item.content = lastChatsObj[index].from + ': ' + lastChatsObj[index].content + ` (${item.msgTime})`;
            } else item.msgTime = '0';
        });
        old.sort((a, b) => new Date(b.msgTime) - new Date(a.msgTime))
        setChatRecent([...old]);
    }, [lastChatsObj])

    useEffect(() => {
        socket.on("loadLastMessage", (msg) => {
            fetchLastMessage();
        })
        fetchLastMessage();
    }, []);
 
    useEffect(() => {
        socket.on('listOnline', (data) => {
            setListOnline(data.listOnline);
        })
    }, [])

    // Listen typing message
    useEffect(() => {
        socket.on('typing', (data) => {
            const index = userTyping.indexOf(data.otherId);
            if(index == -1) {
                setUserTyping([...userTyping, ...[data.otherId]]);
                const index = userTyping.indexOf(data.otherId);
                setTimeout(() => {
                    const tmp = userTyping;
                    tmp.splice(index, 1);
                    setUserTyping([...tmp]);
                }, 3000);
            }
        })
    }, [])

    return (
        <>
            <div className='chat-recent' ref={itemRef} >
                <div className='recent-item current-recent' onClick={ onclick } data-id='all' key=''>
                    <div className='chat-name' onClick={ onclick } data-id='all'>Global</div>
                    <div className='chat-content'></div>
                </div>
                {(chatRecent || []).map((item, index) => {
                    return (
                        <div className='recent-item' onClick={ onclick } data-id={item._id} key={index}>
                            <div className='chat-wrap'>
                                <div className='chat-name'>{item.userName}</div>
                                {listOnline.indexOf(item._id) != -1 ? <div className={userTyping.indexOf(item._id) != -1 ? 'chat-status-online typing' :'chat-status-online'}></div> : <div className='chat-status-offline'></div>}
                            </div>
                            
                            {userTyping.indexOf(item._id) != -1  ? <div className='typing'><i>This User Is Typing</i></div> : <div className='chat-content' data-id={item._id}><i>{item.content}</i></div>}
                        </div>
                    )
                })}
            </div>
        </>
    );
}

export default ChatsRecent;