import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  MouseEvent,
  DragEvent,
} from "react";
// Removed: import "./Conversation.scss";
import { token } from "../../../store/TokenContext";
import AddParticipant from "./AddParticipant";
import user from "../../../store/accountContext";
import socketService from "../../../../socket/Socket";
import { useConversation } from "../../../../hook/ConversationContext";
import {
  ConversationType, CreateConversationResponse, Friend, FriendRequest,
  FriendRequestApiResponse, FriendRequestResponse, IConversation
}
  from "../../../../api/User.int";
import { createConversation, fetchConversationsAPI, updateImageUrl, uploadImage } from "../../../../api/Chat.api";
import { addFriend, fetchFriendRequestedAPI, fetchFriendsAPI, postFriendRequest } from "../../../../api/User.api";

export function Conversation() {
  const { conversationId, setConversationId, isShowRecent, setIsShowRecent } =
    useConversation();

  const [conversationRecent, setConversationRecent] = useState<IConversation[]>([]);
  const [listOnline, setListOnline] = useState<number[]>([]);
  const [userTyping, setUserTyping] = useState<number[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [email, setEmail] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendRequest | null>(null);
  const [conversationTitle, setConversationTitle] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [showFriendSelection, setShowFriendSelection] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedConversationForImage, setSelectedConversationForImage] =
    useState<IConversation | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    socketService.listen("timerEvent", () => {
      setIsLoading(!isLoading);
    });
    fetchFriendRequested();
    fetchConversations();
    fetchFriends();
  }, [isLoading]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest(
      ".recent-item"
    ) as HTMLElement | null;
    const before = itemRef.current?.getElementsByClassName("current-recent");
    if (before?.[0]) {
      before[0].classList.remove("current-recent");
    }
    if (target) {
      target.classList.add("current-recent");
      const tartgetId = target.getAttribute("data-id") || "";
      changeIsLoadValue(+tartgetId);
      setIsShowRecent(false);
    }
  };

  const changeIsLoadValue = (value: number) => {
    setConversationId(value);
  };

  const mapApiResponseToConversation = (item: any): IConversation => {
    const lastMsg = item.lastMessage;
    const content = lastMsg
      ? `${lastMsg.user?.firstName || "User"}: ${lastMsg.content}`
      : "";

    if (item.conversationType === ConversationType.FRIEND) {
      const otherParticipant = item.participants.find(
        (p: any) => p.userId !== user.id
      );
      const title = otherParticipant
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : item.title;

      return {
        id: item.id,
        name: title,
        image: item.avatarUrl || "",
        msgTime: lastMsg?.createdAt ?? item.updatedAt,
        content,
        conversationType: item.conversationType,
        participants: item.participants,
      };
    } else {
      return {
        id: item.id,
        name: item.title,
        image: item.avatarUrl || "",
        msgTime: lastMsg?.createdAt ?? item.updatedAt,
        content,
        conversationType: item.conversationType,
        participants: item.participants,
      };
    }
  };

  const fetchConversations = async () => {
    try {
      const json = await fetchConversationsAPI();
      const conversations = json.data?.result ?? [];

      const formatted: IConversation[] = conversations
        .map(mapApiResponseToConversation)
        .sort(
          (a: any, b: any) =>
            new Date(b.msgTime).getTime() - new Date(a.msgTime).getTime()
        );
      setConversationId(formatted.at(0)?.id);
      setConversationRecent(formatted);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  useEffect(() => {
    socketService.listen("loadLastMessage", fetchConversations);
    return () =>
      socketService.offListener("loadLastMessage", fetchConversations);
  }, []);

  useEffect(() => {
    socketService.listen("listOnline", (data: { listOnline: number[] }) => {
      setListOnline(data.listOnline);
    });
  }, []);

  useEffect(() => {
    socketService.listen("typing", (data: { otherId: number }) => {
      if (!userTyping.includes(data.otherId)) {
        setUserTyping((prev) => [...prev, data.otherId]);
        setTimeout(() => {
          setUserTyping((prev) => prev.filter((id) => id !== data.otherId));
        }, 3000);
      }
    });
  }, [userTyping]);

  const handleAddFriend = async () => {
    try {
      const response = await addFriend({ email });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 201) {
          alert("Friend request sent successfully!");
          setEmail("");
          setShowAddFriend(false);
          fetchFriendRequested();
        } else {
          alert(data.message || "Failed to send friend request");
        }
      } else {
        alert("Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Error sending friend request");
    }
  };

  const fetchFriendRequested = async () => {
    try {
      const data = await fetchFriendRequestedAPI(currentPage);
      if (data.statusCode === 200) {
        const friendData: FriendRequestResponse = data.data;
        setFriendRequests(friendData.result);
        setTotalPages(friendData.totalPage);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const data: FriendRequestApiResponse = await fetchFriendsAPI();
      if (data.statusCode === 200) {
        const friends: Friend[] = data.data.result.map((request) => {
          if (request.requesterId === user.id) {
            return request.receiver;
          }
          return request.requester;
        });
        setFriends(friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedFriends.length === 0) {
      alert("Please select at least one friend");
      return;
    }

    const body = {
      title: conversationTitle || "New Conversation",
      channelId: 2,
      avatarUrl:
        "https://st.gamevui.vn/images/image/gamehanhdong/Songoku-bao-ve-size-111x111-znd.jpg",
      participants: selectedFriends.map((friend) => ({
        userId: friend.id,
        type: "MEMBER",
      })),
    };

    try {
      const data = await createConversation(body);
      if (data.statusCode === 201) {
        const conversationData: CreateConversationResponse = data.data;
        const newConversation: IConversation = {
          id: conversationData.id,
          name: conversationData.title,
          image: conversationData.avatar_url,
          msgTime: conversationData.created_at,
          content: "",
          conversationType: ConversationType.GROUP,
          participants: conversationData.participants.map((p) => ({
            id: p.id,
            userId: p.user_id,
            name: `${p.user.firstName} ${p.user.lastName}`,
            type: p.type,
          })),
        };
        setConversationRecent((prev) => [newConversation, ...prev]);
        setShowCreateConversation(false);
        setShowFriendSelection(false);
        setSelectedFriends([]);
        setConversationTitle("");
      } else {
        alert(data.message || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Error creating conversation");
    }
  };

  const handleFriendRequest = async (requestId: number, accept: boolean) => {
    try {
      const data = await postFriendRequest(requestId);
      if (data.statusCode === 201) {
        const friendRequest = friendRequests.find(
          (req) => req.id === requestId
        );
        if (friendRequest) {
          setSelectedFriend(friendRequest);
          setShowCreateConversation(true);
        }
        fetchFriendRequested();
        fetchConversations();
      } else {
        alert(data.message || "Failed to handle friend request");
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
      alert("Error handling friend request");
    }
  };

  useEffect(() => {
    fetchFriendRequested();
  }, [currentPage]);

  const pendingRequests = friendRequests.filter(
    (req) => req.status === "PENDING"
  );

  const handleConversationClick = (conversation: IConversation) => {
    // setSelectedConversation(conversation);
    // setShowAddParticipant(true);
  };

  const handleParticipantAdded = () => {
    fetchConversations();
  };

  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f.id === friend.id);
      if (isSelected) {
        return prev.filter((f) => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleImageClick = (conversation: IConversation, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedConversationForImage(conversation);
    setImageUrl(conversation.image);
    setShowImageModal(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError("");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setUploadError("Please drop an image file");
        return;
      }
      await handleImageUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const data = await uploadImage(formData, selectedConversationForImage?.id || 0);
      if (data.statusCode === 200) {
        setImageUrl(data.data.avatarUrl);
        setConversationRecent((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversationForImage?.id
              ? { ...conv, image: data.data.avatarUrl }
              : conv
          )
        );
      } else {
        setUploadError(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image");
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      setUploadError("Please enter an image URL");
      return;
    }

    const body = {
      avatarUrl: imageUrl,
    };

    try {
      const data = await updateImageUrl(body, selectedConversationForImage?.id || 0);
      if (data.statusCode === 200) {
        setConversationRecent((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversationForImage?.id
              ? { ...conv, image: imageUrl }
              : conv
          )
        );
        setShowImageModal(false);
      } else {
        setUploadError(data.message || "Failed to update image URL");
      }
    } catch (error) {
      console.error("Error updating image URL:", error);
      setUploadError("Failed to update image URL");
    }
  };

  return (
    <>
      <div
        className="w-full h-full bg-gray-100 flex flex-col border-r border-gray-100 max-w-[380px] min-w-[320px] 
        overflow-y-auto border rounded"
        ref={itemRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#0088cc] gap-3">
          <span className="text-lg font-semibold text-white">Chats</span>
          <div className="flex">
            <button
              className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-full py-1 text-sm font-medium"
              onClick={() => setShowAddFriend(!showAddFriend)}
            >
              Add Friend
            </button>
            <button
              className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-full py-1 text-sm font-medium"
              onClick={() => setShowCreateConversation(!showCreateConversation)}
            >
              New Conversation
            </button>
            <button
              className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded-full py-1 text-sm font-medium"
              onClick={() => setShowFriendRequests(!showFriendRequests)}
            >
              Friend Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="absolute z-50 left-1/2 top-1/4 -translate-x-1/2 bg-[#232d36] rounded-lg shadow-lg p-6 w-80 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded px-3 py-2 bg-[#2a3942] text-white border border-[#4fbc6b] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded px-3 py-2"
                onClick={handleAddFriend}
              >
                Send Request
              </button>
              <button
                className="flex-1 bg-[#232d36] hover:bg-[#2a3942] text-white rounded px-3 py-2 border border-[#4fbc6b]"
                onClick={() => setShowAddFriend(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Create Conversation Modal */}
        {showCreateConversation && (
          <div className="absolute z-50 left-1/2 top-1/4 -translate-x-1/2 bg-[#232d36] rounded-lg shadow-lg p-6 w-96 flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-white mb-2">Create New Conversation</h3>
            <input
              type="text"
              placeholder="Enter conversation title"
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              className="rounded px-3 py-2 bg-[#2a3942] text-white border border-[#4fbc6b] focus:outline-none"
            />
            {!showFriendSelection ? (
              <button
                className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded px-3 py-2"
                onClick={() => {
                  setShowFriendSelection(true);
                  fetchFriends();
                }}
              >
                Select Friends
              </button>
            ) : (
              <div>
                <h4 className="text-white font-medium mb-1">Select Friends</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`cursor-pointer px-2 py-1 rounded-full border text-sm ${selectedFriends.some((f) => f.id === friend.id)
                        ? "bg-[#4fbc6b] text-white border-[#4fbc6b]"
                        : "bg-[#2a3942] text-white border-[#4fbc6b] hover:bg-[#4fbc6b] hover:text-white"
                        }`}
                      onClick={() => toggleFriendSelection(friend)}
                    >
                      {friend.firstName} {friend.lastName}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-300 mb-2">
                  Selected: {selectedFriends.length}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded px-3 py-2"
                onClick={handleCreateConversation}
              >
                Create
              </button>
              <button
                className="flex-1 bg-[#232d36] hover:bg-[#2a3942] text-white rounded px-3 py-2 border border-[#4fbc6b]"
                onClick={() => {
                  setShowCreateConversation(false);
                  setShowFriendSelection(false);
                  setSelectedFriends([]);
                  setConversationTitle("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Friend Requests Modal */}
        {showFriendRequests && (
          <div className="absolute z-50 left-1/2 top-1/4 -translate-x-1/2 bg-[#232d36] rounded-lg shadow-lg p-6 w-96 flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-white mb-2">Friend Requests</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {pendingRequests.length === 0 && (
                <div className="text-gray-400 text-center">No pending friend requests</div>
              )}
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between bg-[#2a3942] rounded px-3 py-2">
                  <div>
                    <div className="text-white font-medium">
                      {request.requester.firstName} {request.requester.lastName}
                    </div>
                    <div className="text-xs text-gray-400">{request.requester.email}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded px-2 py-1 text-xs"
                      onClick={() => handleFriendRequest(request.id, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-[#232d36] hover:bg-[#2a3942] text-white rounded px-2 py-1 text-xs border border-[#4fbc6b]"
                      onClick={() => handleFriendRequest(request.id, false)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="bg-[#232d36] hover:bg-[#2a3942] text-white rounded px-3 py-2 border border-[#4fbc6b] mt-2"
              onClick={() => setShowFriendRequests(false)}
            >
              Close
            </button>
          </div>
        )}

        {/* Change Conversation Image Modal */}
        {/* {showImageModal && selectedConversationForImage && (
          <div className="absolute z-50 left-1/2 top-1/4 -translate-x-1/2 bg-[#232d36] rounded-lg shadow-lg p-6 w-96 flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-white mb-2">Change Conversation Image</h3>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer ${isDragging ? "border-[#4fbc6b] bg-[#2a3942]" : "border-[#4fbc6b]"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                style={{ display: "none" }}
              />
              <p className="text-gray-300 text-sm mb-2">Drag and drop an image here or click to select</p>
              {selectedConversationForImage.image && (
                <img
                  src={selectedConversationForImage.image}
                  alt="Current conversation"
                  className="w-16 h-16 rounded-full object-cover border border-[#4fbc6b] mb-2"
                />
              )}
            </div>
            <div>
              <p className="text-gray-300 text-xs mb-1">Or enter image URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 rounded px-3 py-2 bg-[#2a3942] text-white border border-[#4fbc6b] focus:outline-none"
                />
                <button
                  className="bg-[#4fbc6b] hover:bg-[#43a85c] text-white rounded px-3 py-2"
                  onClick={handleUrlSubmit}
                >
                  Update
                </button>
              </div>
            </div>
            {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
            <button
              className="bg-[#232d36] hover:bg-[#2a3942] text-white rounded px-3 py-2 border border-[#4fbc6b] mt-2"
              onClick={() => {
                setShowImageModal(false);
                setSelectedConversationForImage(null);
                setImageUrl("");
                setUploadError("");
              }}
            >
              Close
            </button>
          </div>
        )} */}

        {/* Conversation List */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {conversationRecent.map((item) => (
            <div
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-[#232d36] transition ${conversationId === item.id ? "bg-[#232d36]" : ""
                }`}
              onClick={handleClick}
              data-id={item.id}
              key={item.id}
            >
              <div
                className="relative"
                onClick={(e) => handleImageClick(item, e)}
              >
                <img
                  // src={item.image || "/user/friend.png"}
                  src={"/user/friend.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border border-[#4fbc6b]"
                />
                {listOnline.includes(item.id) ? (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#232d36] ${userTyping.includes(item.id)
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-[#4fbc6b]"
                      }`}
                  />
                ) : (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#232d36] bg-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {item.msgTime
                      ? new Date(item.msgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </span>
                </div>
                <div className="text-sm text-gray-400 truncate">
                  {userTyping.includes(item.id) ? (
                    <span className="italic text-[#4fbc6b]">Typing...</span>
                  ) : (
                    <span className="italic">{item.content}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Conversation;
