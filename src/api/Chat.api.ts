import { token } from "../components/store/TokenContext";

export const fetchConversationsAPI = async () => {
  const res = await fetch(
    `http://localhost:8080/conversations?page=1&size=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch conversations");
  }
  const data = await res.json();
  return data;
};

export const createConversation = async (body: Record<string, any>) => {
  const res = await fetch(`http://localhost:8080/conversations/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Failed to create conversation");
  }
  return res.json();
}

export const uploadImage = async (formData: FormData, id: number) => {
  const response = await fetch(
    `http://localhost:8080/conversations/${id}/avatar`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to upload image");
  }
  return response.json();
}

export const updateImageUrl = async (body: Record<string, any>, id: number) => {
  const response = await fetch(
    `http://localhost:8080/conversations/${id}/avatar`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update image URL");
  }
  return response.json();
}

export const deleteChat = async (id: number) => {
  const response = await fetch(
    `http://localhost:8080/chats/delete/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete chat");
  }
  return response;
}

export const getConversationById = async (id: number) => {
  const response = await fetch(
    `http://localhost:8080/conversations/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch conversation by ID");
  }
  return response;
};

export const getChatByConversationId = async (conversationId: number, chatLimit: number) => {
  const response = await fetch(
    `http://localhost:8080/conversations/${conversationId}/message?page=1&size=${chatLimit}&order=desc`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  if (!response.ok) {
    throw new Error("Failed to fetch chat by conversation ID");
  }
  return response;
};

export const kickParticipant = async (conversationId: number, targetUserId: number) => {
  const res = await fetch('http://localhost:8080/conversations/kick', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, targetUserId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to kick participant');
  }

  return res.json();
};

export const leaveGroup = async (conversationId: number, targetUserId: number) => {
  const res = await fetch('http://localhost:8080/conversations/leave', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, targetUserId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to leave group');
  }

  return res.json();
};
