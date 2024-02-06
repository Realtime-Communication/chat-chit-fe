import { useState } from "react";
import Users from "./Users";
import Posts from "./Posts";
import Chat from "./Chat/Chat";
import './index.scss';
// import VideoCall from "./Call/Call";
import TokenContextProvider from "../../store/tokenContext";

function Home() {
    
    const [num, setNum] = useState(0);
    const tabsName = [<Chat/>, <Users/>, <Posts/>];
    const handleTabs = (e) => {
        setNum(e);
    };
    return (
        <TokenContextProvider>
            <div className="header">
                <button className="btn" onClick={() => handleTabs(0)}>Chats</button>
                <button className="btn" onClick={() => handleTabs(1)}>Users</button>
                <button className="btn" onClick={() => handleTabs(2)}>Posts</button>
                <button className="btn" onClick={() => handleTabs(3)}>Calls</button>
            </div>
            <div className="content">{tabsName[num]}</div>
        </TokenContextProvider>
    )
}

export default Home;