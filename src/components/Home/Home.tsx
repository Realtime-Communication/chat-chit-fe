import { useState } from "react";
import Users from "./garbage/Users";
import Posts from "./garbage/Posts";
import Chat from "./Chat/ChatPage";
import { ConversationProvider } from "../../hook/ConversationContext";

function Home(): JSX.Element {
  const [num, setNum] = useState<number>(0);

  const tabs = [
    {
      name: "Chats",
      component: (
        <ConversationProvider>
          <Chat />
        </ConversationProvider>
      ),
    },
    { name: "Users", component: <Users /> },
    { name: "Posts", component: <Posts /> },
  ];

  const handleLogout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-2xl font-bold text-[#0088cc] tracking-tight">
            Chat Chit
          </h1>
        </div>
        <div className="flex gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setNum(index)}
              className={`px-5 py-2 rounded-full font-medium transition duration-200 text-base ${num === index
                ? "bg-[#e3f2fd] text-[#0088cc] shadow"
                : "hover:bg-[#f1f5f9] text-gray-600"
                }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-4 px-5 py-2 bg-[#ff5c5c] hover:bg-[#e44c4c] text-white rounded-full font-medium transition duration-200 shadow"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="">{tabs[num].component}</main>
    </div>
  );
}

export default Home;
