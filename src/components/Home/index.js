import { useContext, useEffect, useState } from "react";
import Users from "./Users";
import Posts from "./Posts";
import Chat from "./Chat/Chat";
import './index.scss';
import { jwtDecode } from "jwt-decode";
import { getCookie } from "../store/tokenContext";
import { NavLink } from "react-router-dom";
const token = getCookie('access_token');
  const info = () => {
  try {
      return jwtDecode(token);
  } catch (error) {
      return {};
  }
}
const { username, sub } = info();
function Home() {
    const [hasLogin, setHasLogin] = useState(false);
    const [num, setNum] = useState(0);
    const tabsName = [<Chat/>, <Users/>, <Posts/>];
    const handleTabs = (e) => {setNum(e)};
    useEffect(() => {
        if(username && sub) setHasLogin(true);
        else setHasLogin(false);
    }, [])
    return (
        <>
            <div>
                {hasLogin ? 
                    <><div className="header">
                        <button className="btn" onClick={() => handleTabs(0)}>Chats</button>
                        <button className="btn" onClick={() => handleTabs(1)}>Users</button>
                        <button className="btn" onClick={() => handleTabs(2)}>Posts</button>
                        <button className="btn" style={{background: '#0F612F', color: 'white'}} onClick={
                            () => { 
                                document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                window.location.href = '/login';
                            }
                        }>Log out</button>
                    </div><div className="content">{tabsName[num]}</div></>
                : 
                    <div className="login-again">
                        <div>Maybe You Have Not Account !</div>
                        <NavLink to='/login'>Login</NavLink>
                    </div>
                }
            </div>
        </>
    )
}

export default Home;