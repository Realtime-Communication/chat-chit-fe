import { LoginResponse } from "./Auth.int";

export const loginAccount = async (body: Record<string, any>) => {
  const res = await fetch(`http://localhost:8080/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result: LoginResponse = await res.json();
  const data = result.data;

  if (!data?.accessToken) throw new Error("Login failed");

  document.cookie = `accessToken=${data.accessToken}`;
  localStorage.setItem("user", JSON.stringify(data.user));
};

export const registerAccount = async (body: Record<string, any>) => {
  const res = await fetch(`http://localhost:8080/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const result = await res.json();
  return result.data;
}