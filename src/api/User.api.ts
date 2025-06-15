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