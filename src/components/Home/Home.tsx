import { useEffect, useState } from "react";
import Users from "./garbage/Users";
import Posts from "./garbage/Posts";
import Chat from "./Chat/ChatPage";
import "./Home.scss";
import { NavLink } from "react-router-dom";
import { ConversationProvider } from "../../hook/ConversationContext";

function Home(): JSX.Element {
  // const [isLogin, setIsLogin] = useState<boolean>(false);
  const [num, setNum] = useState<number>(0);

  const tabsName: JSX.Element[] = [
    <ConversationProvider>
      <Chat />
    </ConversationProvider>,
    <Users />,
    <Posts />,
  ];

  const handleTabs = (e: number): void => {
    setNum(e);
  };

  // useEffect(() => {
  //   if (localStorage.getItem("user")) setIsLogin(true);
  //   else setIsLogin(false);
  // }, []);

  return (
    <>
      <div className="header">
        <button className="btn" onClick={() => handleTabs(0)}>
          Chats
        </button>
        <button className="btn" onClick={() => handleTabs(1)}>
          Users
        </button>
        <button className="btn" onClick={() => handleTabs(2)}>
          Posts
        </button>
        <button
          className="btn"
          style={{ background: "#0F612F", color: "white" }}
          onClick={() => {
            document.cookie =
              "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/login";
          }}
        >
          Log out
        </button>
      </div>
      <div className="content">{tabsName[num]}</div>
    </>
  );
}

export default Home;
