import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../../api/User.api";

const Profile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    getCurrentUser()
      .then((data) => setCurrentUser(data.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const editProfile = () => {

  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-md mt-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            // src={currentUser.avatarUrl}
            src={"/user/friend.png"}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-[#e3f2fd] shadow"
          />
          {/* Telegram-like online indicator */}
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-[#4fbc6b] border-2 border-white rounded-full"></span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0088cc]">
            {currentUser.firstName} {currentUser.lastName}
          </h2>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#0088cc]">Email</span>
            <span className="text-gray-700">{currentUser.email}</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#0088cc]">First Name</span>
            <span className="text-gray-700">{currentUser.firstName}</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#0088cc]">Middle Name</span>
            <span className="text-gray-700">{currentUser.middleName}</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#0088cc]">Last Name</span>
            <span className="text-gray-700">{currentUser.lastName}</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#0088cc]">Phone</span>
            <span className="text-gray-700">{currentUser.phone}</span>
          </div>
        </div>
        <button className="mt-6 px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8]
         text-white rounded-full font-medium transition"
          onClick={editProfile}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;