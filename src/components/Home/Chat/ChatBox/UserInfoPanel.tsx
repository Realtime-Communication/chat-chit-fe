import React, { useEffect, useState } from "react";
import { ConversationType, ConversationParticipant } from "../../../../api/Chat.int";
import { DetailedUser, UserResponse, Friend } from "../../../../api/User.int";
import { getCurrentUser, getUserById, fetchFriendsAPI, getAllFriends } from "../../../../api/User.api";
import { kickParticipant, leaveGroup, deleteConversation, addParticipant } from "../../../../api/Chat.api";
import user from "../../../store/accountContext";
import { toast } from "react-toastify";

interface UserInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  otherInfo: {
    name: string;
    image: string;
    type: ConversationType;
    participants?: ConversationParticipant[];
  };
  conversationInfo?: any;
}

interface FriendData {
  id: number;
  requesterId: number;
  receiverId: number;
  status: "ACCEPTED" | "PENDING" | "REJECTED";
  createdAt: string;
  requester: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({
  isOpen,
  onClose,
  otherInfo,
  conversationInfo,
}) => {
  const [currentUser, setCurrentUser] = useState<DetailedUser | null>(null);
  const [otherUser, setOtherUser] = useState<DetailedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [kicking, setKicking] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [addingMembers, setAddingMembers] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const currentUserFromStore = user;

  // For friend conversation, find the other participant
  const otherParticipant = otherInfo.participants?.find(
    (p) => p.userId !== currentUserFromStore.id
  );

  // Check if current user is admin/lead
  const isCurrentUserAdmin = otherInfo.participants?.some(
    p => p.userId === currentUserFromStore.id && p.type === 'lead'
  );

  // Handle kick participant
  const handleKickParticipant = async (participantId: number) => {
    if (!conversationInfo?.id) return;
    
    try {
      setKicking(participantId);
      await kickParticipant(conversationInfo.id, participantId);
      toast.success('Participant has been removed');
      onClose();
    } catch (err) {
      console.error('Failed to kick participant:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to remove participant');
    } finally {
      setKicking(null);
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (!conversationInfo?.id) return;
    
    if (!window.confirm('Are you sure you want to leave this group? You will no longer be able to see messages from this group.')) {
      return;
    }
    
    try {
      setLeaving(true);
      await leaveGroup(conversationInfo.id, currentUserFromStore.id);
      toast.success('You have left the group successfully');
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Failed to leave group:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to leave group');
    } finally {
      setLeaving(false);
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!conversationInfo?.id) return;
    
    const isGroup = otherInfo.type === ConversationType.GROUP;
    const confirmMessage = isGroup 
      ? 'Are you sure you want to delete this group? This action cannot be undone and all messages will be permanently lost.'
      : 'Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently lost.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      setDeleting(true);
      const response = await deleteConversation(conversationInfo.id);
      
      if (response.data?.success) {
        toast.success(response.data.message || 'Conversation deleted successfully');
        onClose();
        window.location.reload();
      } else {
        throw new Error(response.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete conversation');
    } finally {
      setDeleting(false);
    }
  };

  // Handle add members to group
  const handleAddMembers = async () => {
    if (!conversationInfo?.id || !selectedFriend) return;
    
    try {
      setAddingMembers(true);
      
      const otherFriend = getOtherFriend(selectedFriend);
      await addParticipant(conversationInfo.id, otherFriend.id);
      
      toast.success(`${otherFriend.firstName} ${otherFriend.lastName} added successfully`);
      setShowAddMember(false);
      setSelectedFriend(null);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Failed to add member:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddingMembers(false);
    }
  };

  // Toggle friend selection for adding to group
  const toggleFriendSelection = (friend: FriendData) => {
    setSelectedFriend(selectedFriend && selectedFriend.id === friend.id ? null : friend);
  };

  // Get the other friend from friendship data
  const getOtherFriend = (friendship: FriendData) => {
    if (friendship.requesterId === currentUserFromStore.id) {
      return friendship.receiver;
    } else {
      return friendship.requester;
    }
  };

  // Fetch friends for adding to group
  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const data = await getAllFriends("desc", 1, 100, "", ["firstName", "lastName", "email"]);
      if (data.statusCode === 200) {
        const friends: FriendData[] = data.data.result || [];
        const acceptedFriends = friends.filter(friendship => friendship.status === "ACCEPTED");
        setFriends(acceptedFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setFriendsLoading(false);
    }
  };

  // Check if a friend is already in the group
  const isFriendInGroup = (friendId: number) => {
    const existingParticipantIds = otherInfo.participants?.map(p => p.userId) || [];
    return existingParticipantIds.includes(friendId);
  };

  // Check if we're showing current user info (when participants is empty)
  const isShowingCurrentUser = otherInfo.participants && otherInfo.participants.length === 0;
  
  // Get all participants with their roles for group conversations
  const participantsWithRoles = otherInfo.participants?.map(participant => ({
    ...participant,
    isCurrentUser: participant.userId === currentUserFromStore.id
  })) || [];
  
  // Filter and sort participants
  const filteredAndSortedParticipants = [...participantsWithRoles]
    .filter(participant => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${participant.user?.firstName || ''} ${participant.user?.lastName || ''}`.toLowerCase();
      const username = participant.user?.username?.toLowerCase() || '';
      return fullName.includes(searchLower) || username.includes(searchLower);
    })
    .sort((a, b) => {
      if (a.type === 'lead' && b.type !== 'lead') return -1;
      if (a.type !== 'lead' && b.type === 'lead') return 1;
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      return 0;
    });

  // Fetch user information
  useEffect(() => {
    if (!isOpen) return;

    const fetchUserInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isShowingCurrentUser) {
          const response: UserResponse = await getCurrentUser();
          setCurrentUser(response.data);
        } else if (otherParticipant) {
          const response: UserResponse = await getUserById(otherParticipant.userId);
          setOtherUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isOpen, isShowingCurrentUser, otherParticipant]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('user-info-panel-overlay')) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Parse preferences JSON
  const parsePreferences = (preferences: string) => {
    try {
      return JSON.parse(preferences);
    } catch {
      return {};
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 user-info-panel-overlay">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isShowingCurrentUser ? "Your Profile" : 
             otherInfo.type === ConversationType.FRIEND ? "User Profile" : "Group Info"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088cc]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Avatar and Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={otherInfo.image || "/user/friend.png"}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#e3f2fd] shadow-lg"
                  />
                  <span className="absolute bottom-2 right-2 w-6 h-6 bg-[#4fbc6b] border-2 border-white rounded-full"></span>
                </div>
                <h3 className="text-2xl font-bold text-[#0088cc] mt-4 text-center">
                  {otherInfo.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {isShowingCurrentUser ? "You" : 
                   otherInfo.type === ConversationType.FRIEND ? "Friend" : `Group • ${otherInfo.participants?.length || 0} members`}
                </p>
              </div>

              {/* Group Participants Section */}
              {otherInfo.type === ConversationType.GROUP && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Participants</h4>
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {filteredAndSortedParticipants.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No participants found
                      </div>
                    ) : (
                      filteredAndSortedParticipants.map((participant) => (
                        <div 
                          key={participant.userId} 
                          className={`flex items-center justify-between p-3 rounded-lg ${participant.isCurrentUser ? 'bg-blue-50' : 'bg-gray-50'}`}
                        >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src="/user/friend.png"
                              alt={participant.user?.firstName || 'User'}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              participant.user?.isActive ? 'bg-[#4fbc6b]' : 'bg-gray-400'
                            }`}></span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {participant.user?.firstName} {participant.user?.lastName}
                              {participant.isCurrentUser && ' (You)'}
                            </p>
                            <p className="text-xs text-gray-500">@{participant.user?.username || 'user'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            participant.type === 'lead' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {participant.type === 'lead' ? 'Admin' : 'Member'}
                          </span>
                          {isCurrentUserAdmin && !participant.isCurrentUser && participant.type !== 'lead' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to remove ${participant.user?.firstName} from the group?`)) {
                                  handleKickParticipant(participant.userId);
                                }
                              }}
                              disabled={kicking === participant.userId}
                              className="text-red-500 hover:text-red-700 text-sm p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                              title="Remove from group"
                            >
                              {kicking === participant.userId ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Current User Information */}
              {isShowingCurrentUser && currentUser && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">
                          {currentUser.firstName} {currentUser.middleName} {currentUser.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{currentUser.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Type:</span>
                        <span className="font-medium">{currentUser.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${currentUser.isActive ? 'text-[#4fbc6b]' : 'text-gray-500'}`}>
                          {currentUser.isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className={`font-medium ${currentUser.isBlocked ? 'text-red-500' : 'text-[#4fbc6b]'}`}>
                          {currentUser.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium">{currentUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(currentUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(currentUser.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported:</span>
                        <span className={`font-medium ${currentUser.isReported ? 'text-red-500' : 'text-[#4fbc6b]'}`}>
                          {currentUser.isReported ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  {currentUser.preferences && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(parsePreferences(currentUser.preferences)).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-lg py-2 font-medium transition">
                      Edit Profile
                    </button>
                    <button className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-lg py-2 font-medium transition">
                      Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Other User Information (for friend conversations) */}
              {otherInfo.type === ConversationType.FRIEND && otherUser && !isShowingCurrentUser && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">
                          {otherUser.firstName} {otherUser.middleName} {otherUser.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{otherUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{otherUser.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Type:</span>
                        <span className="font-medium">{otherUser.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${otherUser.isActive ? 'text-[#4fbc6b]' : 'text-gray-500'}`}>
                          {otherUser.isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className={`font-medium ${otherUser.isBlocked ? 'text-red-500' : 'text-[#4fbc6b]'}`}>
                          {otherUser.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium">{otherUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(otherUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(otherUser.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported:</span>
                        <span className={`font-medium ${otherUser.isReported ? 'text-red-500' : 'text-[#4fbc6b]'}`}>
                          {otherUser.isReported ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  {otherUser.preferences && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(parsePreferences(otherUser.preferences)).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-lg py-2 font-medium transition">
                      Send Message
                    </button>
                    <button className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-lg py-2 font-medium transition">
                      Call
                    </button>
                  </div>

                  {/* Delete Conversation Button */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleDeleteConversation}
                      disabled={deleting}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Conversation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Group Information (for group conversations) */}
              {otherInfo.type === ConversationType.GROUP && !isShowingCurrentUser && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Group Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group Name:</span>
                        <span className="font-medium">{conversationInfo?.title || otherInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium">{otherInfo.participants?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {conversationInfo?.createdAt ? new Date(conversationInfo.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-lg py-2 font-medium transition">
                      Group Settings
                    </button>
                    <button 
                      className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-lg py-2 font-medium transition"
                      onClick={() => {
                        setShowAddMember(true);
                        fetchFriends();
                      }}
                    >
                      Add Member
                    </button>
                  </div>

                  {/* Leave Group Button */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleLeaveGroup}
                      disabled={leaving}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2"
                    >
                      {leaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Leaving...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Leave Group
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delete Group Button */}
                  {isCurrentUserAdmin && (
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={handleDeleteConversation}
                        disabled={deleting}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2"
                      >
                        {deleting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Group
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Add Members to Group</h3>
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setSelectedFriend(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {friendsLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4fbc6b] mx-auto mb-2"></div>
                    <p>Loading friends...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No friends available to add</p>
                    <p className="text-sm mt-2">You don't have any friends to add to this group</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Select a friend to add to the group:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {friends.map((friendship) => {
                          const otherFriend = getOtherFriend(friendship);
                          const isInGroup = isFriendInGroup(otherFriend.id);
                          
                          return (
                            <div
                              key={friendship.id}
                              className={`p-3 rounded-lg border transition ${
                                isInGroup 
                                  ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                                  : selectedFriend && selectedFriend.id === friendship.id
                                    ? "bg-[#4fbc6b] text-white border-[#4fbc6b] cursor-pointer"
                                    : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-[#4fbc6b] hover:text-white hover:border-[#4fbc6b] cursor-pointer"
                              }`}
                              onClick={() => !isInGroup && toggleFriendSelection(friendship)}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src="/user/friend.png"
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                />
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {otherFriend.firstName} {otherFriend.lastName}
                                    {isInGroup && (
                                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                        Already in group
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm opacity-75">
                                    {otherFriend.email}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    otherFriend.isActive ? 'bg-[#4fbc6b]' : 'bg-gray-400'
                                  }`}></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedFriend && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {getOtherFriend(selectedFriend).firstName} {getOtherFriend(selectedFriend).lastName}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] disabled:bg-gray-300 text-white rounded-lg py-2 font-medium transition flex items-center justify-center gap-2"
                        onClick={handleAddMembers}
                        disabled={!selectedFriend || addingMembers}
                      >
                        {addingMembers ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                          </>
                        ) : selectedFriend ? (
                          `Add ${getOtherFriend(selectedFriend).firstName} ${getOtherFriend(selectedFriend).lastName}`
                        ) : (
                          "Select a friend to add"
                        )}
                      </button>
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-2 font-medium transition"
                        onClick={() => {
                          setShowAddMember(false);
                          setSelectedFriend(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoPanel; 
