import ChatMessage from './ChatMessage';
import { ChatsRecent } from './ChatRecent';
import './Chat.scss'
import StateContextProvider from '../../../store/stateContext';
import { createContext, useState } from 'react';

//A
export const ChatContext = createContext({
    isLoad: 'all',
    setIsLoad: () => {}
});
export function Chat() {
    const  [ isLoad, setIsLoad ] = useState('all');
    const setId = (id) => {
        setIsLoad(id);
    }
    return (
        <ChatContext.Provider value={{ isLoad: isLoad, setIsLoad: setId }}>
            {/* <StateContextProvider> */}
            <x/>
                <div className="chat">
                    <div className='chat_recent'>
                        <ChatsRecent/>
                    </div>
                    <div className='chat_message'>
                        <ChatMessage/>
                    </div>
                </div>
            {/* </StateContextProvider> */}
        </ChatContext.Provider>
    )
}

export default Chat;