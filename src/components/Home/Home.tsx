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
    <div className="min-h-screen bg-[#E6F0F3]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#0088cc] text-white shadow-md">
        <h1 className="text-xl font-semibold">Chat Chit</h1>
        <div className="flex gap-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setNum(index)}
              className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                num === index
                  ? "bg-white text-[#0088cc]"
                  : "hover:bg-white/20"
              }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 bg-[#ff5c5c] hover:bg-[#e44c4c] text-white rounded-md font-medium transition duration-200"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{tabs[num].component}</main>
    </div>
  );
}

export default Home;
