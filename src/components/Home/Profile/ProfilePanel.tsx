import React from "react";
import { UserProfile } from "../../../api/User.int";

interface ProfilePanelProps {
  user: UserProfile | null;
  onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-4">
          <img
            src={user.isActive ? "/user/friend.png" : "/user/group.jpg"}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-[#e3f2fd] shadow"
          />
          <h2 className="text-xl font-bold text-[#0088cc]">
            {user.firstName} {user.middleName} {user.lastName}
          </h2>
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Email:</span>
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Phone:</span>
              <span className="text-gray-700">{user.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Type:</span>
              <span className="text-gray-700">{user.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Active:</span>
              <span className="text-gray-700">{user.isActive ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Blocked:</span>
              <span className="text-gray-700">{user.isBlocked ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Reported:</span>
              <span className="text-gray-700">{user.isReported ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Created At:</span>
              <span className="text-gray-700">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Updated At:</span>
              <span className="text-gray-700">{new Date(user.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Preferences:</span>
              <span className="text-gray-700 break-all">{user.preferences}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel; 
