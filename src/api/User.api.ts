import { token } from "../components/store/TokenContext";

export const addFriend = async (body: Record<string, any>) => {
  const response = await fetch(`http://localhost:8080/friends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to add friend");
  }
  return response;
};

export const fetchFriendRequestedAPI = async (currentPage: number) => {
  const response = await fetch(
    `http://localhost:8080/friends/requested?page=${currentPage}&size=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch friend requests");
  }
  const data = await response.json();
  return data;
};

export const fetchFriendsAPI = async () => {
  const response = await fetch(
    `http://localhost:8080/friends/accepted?page=1&size=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch friends");
  }
  const data = await response.json();
  return data;
};

export const postFriendRequest = async (requestId: number) => {
  const response = await fetch(`http://localhost:8080/friends/${requestId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to post friend request");
  }
  return response.json();
};

export const fetchFriendAddParticipant = async () => {
  const response = await fetch(
    `http://localhost:8080/friends?page=1&size=100`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch friends");
  }
  const data = await response.json();
  return data;
};

export const addParticipantToConversation = async (conversationId: number , body: Record<string, any>) => {
  const response = await fetch(
    `http://localhost:8080/conversations/${conversationId}/participants`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  );
  if (!response.ok) {
    throw new Error("Failed to add participant to conversation");
  }
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch("http://localhost:8080/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  return response.json(); // Trả về dữ liệu người dùng
};

export const updateUser = async (body: Record<string, any>) => {
  const response = await fetch("http://localhost:8080/users", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json(); // Trả về dữ liệu user mới (nếu có)
};

export const getUserById = async (userId: number) => {
  const response = await fetch(`http://localhost:8080/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
};
