import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUser, changePassword } from "../../../api/User.api";

interface User {
  id: number;
  phone: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  type: string;
  isActive: boolean;
  isReported: boolean | null;
  isBlocked: boolean;
  preferences: string;
  createdAt: string;
  updatedAt: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      const userData = response.data;
      setCurrentUser(userData);
      setForm(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        phone: form.phone,  
      };
      await updateUser(payload);
      setCurrentUser({ ...currentUser, ...payload } as User);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwordForm);
      setPasswordMode(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      console.error("Error changing password:", err);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parsePreferences = (preferencesString: string) => {
    try {
      return JSON.parse(preferencesString);
    } catch {
      return {};
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-md mt-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088cc]"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-md mt-6">
        <div className="text-center text-red-500">Failed to load user data</div>
      </div>
    );
  }

  const preferences = parsePreferences(currentUser.preferences);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-md mt-6">
      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Avatar Section */}
        <div className="relative">
          <img
            src="/user/friend.png"
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-[#e3f2fd] shadow"
          />
          <span className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-white rounded-full ${
            currentUser.isActive ? 'bg-[#4fbc6b]' : 'bg-gray-400'
          }`}></span>
        </div>

        {/* User Name */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0088cc]">
            {form.firstName} {form.lastName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.type} • {currentUser.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>

        {/* Profile Information */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">First Name:</span>
              {editMode ? (
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName || ""}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="First Name"
                />
              ) : (
                <span className="text-gray-700">{currentUser.firstName}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">Middle Name:</span>
              {editMode ? (
                <input
                  type="text"
                  name="middleName"
                  value={form.middleName || ""}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Middle Name"
                />
              ) : (
                <span className="text-gray-700">{currentUser.middleName || '-'}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">Last Name:</span>
              {editMode ? (
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName || ""}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Last Name"
                />
              ) : (
                <span className="text-gray-700">{currentUser.lastName}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">Phone:</span>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Phone"
                />
              ) : (
                <span className="text-gray-700">{currentUser.phone}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">Email:</span>
              <span className="text-gray-700">{currentUser.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28 text-sm">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentUser.isBlocked 
                  ? 'bg-red-100 text-red-700' 
                  : currentUser.isReported 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {currentUser.isBlocked ? 'Blocked' : currentUser.isReported ? 'Reported' : 'Active'}
              </span>
            </div>
          </div>

          {/* Preferences */}
          {/* <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Theme:</span>
                <span className="capitalize">{preferences.theme || 'default'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Language:</span>
                <span className="uppercase">{preferences.language || 'en'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Notifications:</span>
                <span>{preferences.notifications ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div> */}

          {/* Account Info */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Created:</span>
                <span>{formatDate(currentUser.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Last Updated:</span>
                <span>{formatDate(currentUser.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
          {editMode ? (
            <>
              <button
                className="flex-1 px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium transition disabled:opacity-50"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition"
                onClick={() => {
                  setEditMode(false);
                  setForm(currentUser);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : passwordMode ? (
            <>
              <button
                className="flex-1 px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium transition disabled:opacity-50"
                onClick={handlePasswordSave}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition"
                onClick={() => {
                  setPasswordMode(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  });
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="flex-1 px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-full font-medium transition"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
              <button
                className="flex-1 px-6 py-2 bg-[#4fbc6b] hover:bg-[#45a85f] text-white rounded-full font-medium transition"
                onClick={() => setPasswordMode(true)}
              >
                Change Password
              </button>
            </>
          )}
        </div>

        {/* Password Change Form */}
        {passwordMode && (
          <div className="w-full mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;