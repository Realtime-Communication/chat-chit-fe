import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  MouseEvent,
} from "react";
import "./Conversation.scss";
import { ChatContext } from "../ChatPage";
import { token } from "../../../store/tokenContext";
import useSocket from "../../../store/socket";
export enum ConversationType {
  GROUP = 0,
  FRIEND = 1,
}

interface Participant {
  id: number;
  name?: string;
  userId: number;
  type: string;
}

interface Message {
  senderId: number;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  name: string;
  image: string;
  msgTime: string;
  content: string;
  conversationType: ConversationType;
  participants: Participant[];
}

interface FriendRequest {
  id: number;
  requester_id: number;
  receiver_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  receiver: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface FriendRequestResponse {
  page: number;
  size: number;
  totalPage: number;
  totalElement: number;
  result: FriendRequest[];
}

export function ChatsRecent() {
  const socket: any = useSocket;  
  const context = useContext(ChatContext);

  if (!context) return null;

  const { isLoad, setIsLoad, isShowRecent, setIsShowRecent } = context;

  const [chatRecent, setChatRecent] = useState<Conversation[]>([]);
  const [listOnline, setListOnline] = useState<number[]>([]);
  const [userTyping, setUserTyping] = useState<number[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [email, setEmail] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemRef = useRef<HTMLDivElement>(null);

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
    setIsLoad(value);
  };

  useEffect(() => {
    console.log("sdfffffffffffffffffffffff");
  }, [isLoad]);

  const mapApiResponseToConversation = (item: any): Conversation => {
    const lastMsg = item.lastMessage;
    const content = lastMsg
      ? `${lastMsg.user?.firstName || "User"}: ${lastMsg.content}`
      : "";

    if (item.participants.length <= 2)
        return {
          id: item.id,
          name: item.title,
          image: "", // TODO: Assign user/group image if available
          msgTime: lastMsg?.createdAt ?? "0",
          content,
          conversationType: item.conversationType,
          participants: item.participants,
        };
    else 
      return {
        id: item.id,
        name: item.title,
        image: "", // TODO: Assign user/group image if available
        msgTime: lastMsg?.createdAt ?? "0",
        content,
        conversationType: item.conversationType,
        participants: item.participants,
      };
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API}/conversations?page=1&size=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      const conversations = json.data?.result ?? [];

      const formatted: Conversation[] = conversations
        .map(mapApiResponseToConversation)
        .sort(
          (a: any, b: any) =>
            new Date(b.msgTime).getTime() - new Date(a.msgTime).getTime()
        );
      console.log(formatted);
      setChatRecent(formatted);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    socket.on("loadLastMessage", fetchConversations);
    return () => socket.off("loadLastMessage", fetchConversations);
  }, [socket]);

  useEffect(() => {
    socket.on("listOnline", (data: { listOnline: number[] }) => {
      setListOnline(data.listOnline);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("typing", (data: { otherId: number }) => {
      if (!userTyping.includes(data.otherId)) {
        setUserTyping((prev) => [...prev, data.otherId]);
        setTimeout(() => {
          setUserTyping((prev) => prev.filter((id) => id !== data.otherId));
        }, 3000);
      }
    });
  }, [socket, userTyping]);

  const handleAddFriend = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 201) {
          alert('Friend request sent successfully!');
          setEmail('');
          setShowAddFriend(false);
          fetchFriendRequests();
        } else {
          alert(data.message || 'Failed to send friend request');
        }
      } else {
        alert('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API}/friends?page=${currentPage}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        const friendData: FriendRequestResponse = data.data;
        setFriendRequests(friendData.result);
        setTotalPages(friendData.totalPage);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleFriendRequest = async (requestId: number, accept: boolean) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API}/friends/${requestId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (data.statusCode === 201) {
        fetchFriendRequests();
        fetchConversations();
      } else {
        alert(data.message || 'Failed to handle friend request');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      alert('Error handling friend request');
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [currentPage]);

  const pendingRequests = friendRequests.filter(req => req.status === 'PENDING');

  return (
    <>
      <div className="chat-recent" ref={itemRef}>
        <div className="friend-actions">
          <button 
            className="add-friend-btn"
            onClick={() => setShowAddFriend(!showAddFriend)}
          >
            Add Friend
          </button>
          <button 
            className="friend-requests-btn"
            onClick={() => setShowFriendRequests(!showFriendRequests)}
          >
            Friend Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </button>
        </div>

        {showAddFriend && (
          <div className="add-friend-modal">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleAddFriend}>Send Request</button>
            <button onClick={() => setShowAddFriend(false)}>Cancel</button>
          </div>
        )}

        {showFriendRequests && (
          <div className="friend-requests-list">
            {pendingRequests.map((request) => (
              <div key={request.id} className="friend-request-item">
                <div className="request-info">
                  <span className="name">
                    {request.requester.first_name} {request.requester.last_name}
                  </span>
                  <span className="email">{request.requester.email}</span>
                </div>
                <div className="request-actions">
                  <button onClick={() => handleFriendRequest(request.id, true)}>Accept</button>
                  <button onClick={() => handleFriendRequest(request.id, false)}>Decline</button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="no-requests">No pending friend requests</div>
            )}
          </div>
        )}

        <div
          className="recent-item current-recent example"
          onClick={handleClick}
          data-id="all"
          key="all"
        >
          <div className="item-wrap" />
        </div>

        {chatRecent.map((item) => (
          <div
            className="recent-item"
            onClick={handleClick}
            data-id={item.id}
            key={item.id}
          >
            <div className="avatar">
              <img src={item.image || "/default-avatar.png"} alt="avatar" />
            </div>
            {listOnline.includes(item.id) ? (
              <div
                className={
                  userTyping.includes(item.id)
                    ? "chat-status-online typing"
                    : "chat-status-online"
                }
              />
            ) : (
              <div className="chat-status-offline" />
            )}
            <div className="item-wrap">
              <div className="chat-wrap">
                <div className="chat-name">{item.name}</div>
              </div>
              <div className="chat-content">
                {userTyping.includes(item.id) ? (
                  <i>This user is typing...</i>
                ) : (
                  <i>{item.content}</i>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ChatsRecent;
