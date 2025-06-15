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