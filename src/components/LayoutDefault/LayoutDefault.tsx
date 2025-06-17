import { Outlet } from "react-router-dom";

function LayoutDefault() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col">
      {/* Telegram-like header */}
      {/* <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
            alt="Telegram"
            className="w-8 h-8"
          />
          <span className="text-xl sm:text-2xl font-bold text-[#0088cc] tracking-tight">
            Chat Chit
          </span>
        </div>
      </header> */}
      {/* Main content */}
      <main className="flex-1 w-full max-w-full mx-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutDefault;
