import { useContext, useEffect, useState } from "react";
import Users from "./Users";
import Posts from "./Posts";
import Chat from "./Chat/Chat";
import './index.scss';
import { jwtDecode } from "jwt-decode";
import { decodeToken, getCookie } from "../store/tokenContext";
import { NavLink } from "react-router-dom";

const { username, sub } = decodeToken;
function Home() {
    const [isLogin, setIsLogin] = useState(false);
    const [num, setNum] = useState(0);
    const tabsName = [<Chat/>, <Users/>, <Posts/>];
    const handleTabs = (e) => {setNum(e)};
    useEffect(() => {
        if(username && sub) setIsLogin(true);
        else setIsLogin(false);
    }, [])
    return (
        <>
            <div>
                {isLogin ? 
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
                    <div className="not_account">
                        <div className="login-again">
                            <div>Maybe You Dont Have Account !</div>
                            <NavLink className={'button-login'} to='/login'>Login</NavLink>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Home;