import ChatMessage from './ChatMessage';
import { ChatsRecent } from './ChatRecent';
import './Chat.scss'
import StateContextProvider from '../../store/stateContext';
import { createContext, useState } from 'react';

//A
export const ChatContext = createContext({
    isLoad: 'all',
    setIsLoad: () => {},
    setIsShowRecent: () => {}
});
export function Chat() {
    const  [ isLoad, setIsLoad ] = useState('all');
    const  [ isShowRecent, setIsShowRecent ] = useState(true);
    const setId = (id) => {
        setIsLoad(id);
    }
    const objectShowChatRecent = {
        display: 'flex',
        width: '100%'
    };
    const objectHideChatRecent = {
        display: 'none',
    };
    const userWidth = window.innerWidth;
    console.log(userWidth);
    return (
        <ChatContext.Provider value={{ isLoad: isLoad, setIsLoad: setId, isShowRecent: isShowRecent, setIsShowRecent }}>
                <div className="chat">
                    <div className='chat_recent' style={userWidth <= 500 ? isShowRecent ? objectShowChatRecent : objectHideChatRecent : {}}>
                        <ChatsRecent/>
                        {/* {isShowRecent && <div className='show_recent' onClick={() => setIsShowRecent(!isShowRecent)}>X</div>} */}
                    </div>
                    <div className='chat_message' style={userWidth <= 500 ? isShowRecent ? objectHideChatRecent : objectShowChatRecent : {}}>
                        <ChatMessage/>
                    </div>
                </div>
        </ChatContext.Provider>
    )
}

export default Chat;