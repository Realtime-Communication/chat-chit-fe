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
    `${process.env.REACT_APP_API}/conversations/${id}/avatar`,
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

