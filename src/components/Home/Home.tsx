import { useState } from "react";
import Posts from "./garbage/Posts";
import Chat from "./Chat/ChatPage";
import { ConversationProvider } from "../../hook/ConversationContext";
import ProfilePage from "./Profile/ProfilePage";
import FriendPage from "./Friends/FriendPage";

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
    { name: "Profile", component: <ProfilePage /> },
    { name: "Friends", component: <FriendPage /> },
    // { name: "Posts", component: <Posts /> },
  ];

  const handleLogout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-[#0088cc] tracking-tight">
            Chat Chit
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setNum(index)}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-full font-medium transition duration-200 text-base ${num === index
                ? "bg-[#e3f2fd] text-[#0088cc] shadow"
                : "hover:bg-[#f1f5f9] text-gray-600"
                }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-0 sm:ml-4 px-4 sm:px-5 py-2 bg-[#ff5c5c] hover:bg-[#e44c4c] text-white rounded-full font-medium transition duration-200 shadow"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full mx-auto">
        {tabs[num].component}
      </main>
    </div>
  );
}

export default Home;
