import React, { useContext, useEffect, useRef, useState } from "react";
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
export function InsertMessage(props) {
    const [msg, id] = props.props;
    const content = (msg.content || '').split(' ') ;
    const onclick = (e) => {
        console.log('x');
    };
    return (
        <div class={msg.from_id === id ? "message-right" : "message-left"}>
            <div class="message-wrap">
                <div class="user-coming">{msg.from_id === id ? msg.from  + ' [Me] ': msg.from}</div>
                <div class="user-content" >
                    <i class="message-content" onClick={onclick}>
                        {(content).map(item => {
                            if (imageExtensions.some(ext => item.endsWith('.' + ext)) || item.startsWith("data:image") || item.startsWith("https://")) 
                                return <> <img src={item}/> <a href={item} target="blank">{item}</a> </>;
                            else return item + ' ';
                        })}
                    </i>
                </div>
                <div class=""><i class="">{msg.msgTime}</i></div>
            </div>
        </div>
    );
}

export default InsertMessage;