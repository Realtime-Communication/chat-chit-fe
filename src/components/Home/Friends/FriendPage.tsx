import React, { useEffect, useState } from "react";
interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  username?: string;
  phone?: string;
  email?: string;
}

const FriendPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   getFriends()
  //     .then((res) => {
  //       setFriends(res.data.result || []);
  //       setLoading(false);
  //     })
  //     .catch(() => setLoading(false));
  // }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-6">
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-8">
        <h2 className="text-2xl font-bold text-[#0088cc] mb-4 text-center">
          Friends
        </h2>
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading...</div>
        ) : friends.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No friends found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="flex items-center gap-4 py-4 hover:bg-[#f7f8fa] transition rounded-xl px-2"
              >
                <img
                  src={
                    friend.avatarUrl ||
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(
                      `${friend.firstName} ${friend.lastName}`
                    ) +
                    "&background=0088cc&color=fff"
                  }
                  alt="avatar"
                  className="w-12 h-12 rounded-full border-2 border-[#e3f2fd] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#0088cc] truncate">
                    {friend.firstName} {friend.lastName}
                  </div>
                  <div className="text-gray-500 text-sm truncate">
                    @{friend.username || "unknown"}
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    {friend.phone || friend.email || ""}
                  </div>
                </div>
                {/* Telegram-like online indicator (for demo, always online) */}
                <span className="w-3 h-3 bg-[#4fbc6b] rounded-full border-2 border-white"></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendPage;