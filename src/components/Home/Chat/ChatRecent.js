import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import './ChatRecent.scss';
import { ChatContext } from './Chat';
import socket from '../socket';
import { token } from '../../store/tokenContext';

export function ChatsRecent() {

    const [listOnline, setListOnline] = useState([]);

    const {isLoad, setIsLoad, isShowRecent,setIsShowRecent } = useContext(ChatContext);

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
        setIsShowRecent(false);
    }

    const [chatRecent, setChatRecent] = useState([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API}/chats/conversations`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            const [friends, groups] = data.data;
            const groupsId = groups.map(item => item._id);
            console.log(groupsId);
            socket.emit('join_groups', groupsId);
            setChatRecent([...friends, ...groups]);
        })
        .catch(err => console.error(err));
    }, []);

    //Last chats
    const fetchLastMessage = () => {
        fetch(`${process.env.REACT_APP_API}/chats/getlastchats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            const [x, y] = data.data;
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
            console.log('csa');
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
            if(index === -1) {
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
                <div className='recent-item current-recent example' onClick={ onclick } data-id='all' key=''>
                    <div className='item-wrap'></div> 
                </div>
                {(chatRecent || []).map((item, index) => {
                    return (
                        <div className='recent-item' onClick={ onclick } data-id={item._id} key={index}>
                            <div className='avatar'><img src={item.image}/></div>
                            {listOnline.indexOf(item._id) != -1 ? <div className={userTyping.indexOf(item._id) != -1 ? 'chat-status-online typing' :'chat-status-online'}></div> : <div className='chat-status-offline'></div>}
                            <div className='item-wrap'>
                                <div className='chat-wrap'>
                                    <div className='chat-name'>{item.name}</div>
                                </div>
                                {userTyping.indexOf(item._id) != -1  ? <div className='typing'><i>This User Is Typing</i></div> : <div className='chat-content' data-id={item._id}><i>{item.content}</i></div>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    );
}

export default ChatsRecent;