import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect, useRef, useState } from "react";
import { getCookie, token } from "../../store/tokenContext";
import socket from "../socket";
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];

export function InsertMessage(props) {
    const [msg, id, toId] = props.props;
    const [ showOption, setShowOption ] = useState(false);
    const [ showDate, setShowDate ] = useState(false);
    const content = (msg.content || '').split(' ');
    const contentRef = useRef(null);
    const onMouse = (e) => {
        setShowOption(!showOption);
    };
    const isDelete = () => {
        
        if(window.confirm('Are you sure you want to delete this message ?')) {
            console.log(msg._id);
            fetch(`${process.env.REACT_APP_API}/chats/delete/${msg._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((data) => {
                socket.emit('delete_message', { otherId: toId })
                contentRef.current.innerHTML = '<b>Message has been delete</b>';
                setShowOption(false);
            })
        }
    };
    return (
        <div class={msg.from_id === id ? "message-right" : "message-left"}>
            <div className="transparent"></div>
            <div class="message-wrap">
                { showOption && msg.from_id === id ? 
                    <div className="option-chat">
                        <button onClick={isDelete}>D.Hard</button>
                        <button onClick={() => setShowDate(!showDate)}>More</button>
                    </div> : <></>
                }
                <div className="wrap-option">
                    {msg.from_id === id ?  '': <div class="user-coming">{msg.from}</div>}
                    <div class="user-content" onClick={onMouse}>
                        <i class="message-content" ref={contentRef}>
                            {(content).map(item => {
                                if (imageExtensions.some(ext => item.endsWith('.' + ext)) || item.startsWith("data:image") || item.startsWith("https://")) 
                                    return <>  <a href={item} target="blank">{<img src={item}/>}</a> </>;
                                else return item + ' ';
                            })}
                        </i>
                    </div>
                    { showDate ? <div class=""><i class="" style={{color: 'white', background: 'green', fontSize: '12px', borderRadius: '20px', padding: '1px 3px'}}>{msg.msgTime}</i></div> : <></>}
                </div>
                { showOption && msg.from_id !== id ? 
                    <div className="option-chat">
                        <button>Delete</button>
                        <button onClick={() => setShowDate(!showDate)}>More</button>
                    </div> : <></>
                }
            </div>
        </div>
    )
}

export default InsertMessage;