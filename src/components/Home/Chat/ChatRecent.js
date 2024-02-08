import React, { createContext, useContext, useEffect, useState } from 'react';
import './ChatRecent.scss';
import { ChatContext } from './Chat';
import { jwtDecode } from 'jwt-decode';
import { getCookie } from '../../store/tokenContext';

export function ChatsRecent() {

    const token = getCookie('access_token');
    const { username, sub } = jwtDecode(token);

    const {isLoad, setIsLoad} = useContext(ChatContext);

    const onclick = (e) => {
        const now = e.target.parentNode;
        const parent = now.parentNode;
        const before = parent.getElementsByClassName("current-recent");
        if(before[0]) before[0].classList.remove("current-recent");
        now.classList.add("current-recent");
        setIsLoad(e.target.getAttribute('data-id'));
    }

    const [chatRecent, setChatRecent] = useState([]);

    useEffect(() => {
        fetch(`https://quinerrealtime.onrender.com/chats/api/friendschats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            setChatRecent(data);
        })
    }, [])
    useEffect(() => {
        // socket.on( 'messageComing', (msg) => {
        //     fetch(`http://localhost:8000/chats/api/mychats`, {
        //         headers: {
        //           Authorization: `Bearer ${token}`,
        //         },
        //     })
        //     .then(res => res.json())
        //     .then(data => {
        //         setChatRecent(data);
        //     })
        // })
    }, []);

    return (
        <>
            <div className='chat-recent'>
                <div className='recent-item current-recent' onClick={ onclick } data-id='all' key=''> 
                    <div className='chat-name' onClick={ onclick } data-id='all'>Global</div>
                    <div className='chat-content'></div>
                </div>
                {(chatRecent || []).map((item, index) => {
                    return (
                        <div className='recent-item' onClick={ onclick } data-id={item._id} key={index}> 
                            <div className='chat-name' data-id={item._id} onClick={ onclick }>{item.userName}</div>
                            <div className='chat-content' data-id={item._id}>{item.content}</div>
                        </div>
                    )
                })}
            </div>
        </>
    );
}

export default ChatsRecent;