import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUser } from "../../../api/User.api";

const ProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setCurrentUser(data.data);
        setForm(data.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Only send allowed fields
      const payload = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        phone: form.phone,
      };
      await updateUser(payload);
      setCurrentUser({ ...currentUser, ...payload });
      setEditMode(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-md mt-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={currentUser.avatarUrl || "/user/friend.png"}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-[#e3f2fd] shadow"
          />
          {/* Telegram-like online indicator */}
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-[#4fbc6b] border-2 border-white rounded-full"></span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0088cc]">
            {form.firstName} {form.lastName}
          </h2>
        </div>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium w-28">First Name:</span>
            {editMode ? (
              <input
                type="text"
                name="firstName"
                value={form.firstName || ""}
                onChange={handleChange}
                className="flex-1 px-2 py-1 rounded border border-gray-200"
                placeholder="First Name"
              />
            ) : (
              <span className="text-gray-700">{currentUser.firstName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-28">Middle Name:</span>
            {editMode ? (
              <input
                type="text"
                name="middleName"
                value={form.middleName || ""}
                onChange={handleChange}
                className="flex-1 px-2 py-1 rounded border border-gray-200"
                placeholder="Middle Name"
              />
            ) : (
              <span className="text-gray-700">{currentUser.middleName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-28">Last Name:</span>
            {editMode ? (
              <input
                type="text"
                name="lastName"
                value={form.lastName || ""}
                onChange={handleChange}
                className="flex-1 px-2 py-1 rounded border border-gray-200"
                placeholder="Last Name"
              />
            ) : (
              <span className="text-gray-700">{currentUser.lastName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-28">Email:</span>
            <span className="text-gray-700">{currentUser.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-28">Phone:</span>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="flex-1 px-2 py-1 rounded border border-gray-200"
                placeholder="Phone"
              />
            ) : (
              <span className="text-gray-700">{currentUser.phone}</span>
            )}
          </div>
        </div>
        {editMode ? (
          <div className="flex gap-2 mt-6">
            <button
              className="px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium transition"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition"
              onClick={() => {
                setEditMode(false);
                setForm(currentUser);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="mt-6 px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium transition"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;