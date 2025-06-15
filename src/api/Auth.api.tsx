import { Account } from "../components/store/accountContext";

interface LoginResponse {
  statusCode: string,
  message: string,
  data: {
    user: Account;
    accessToken: string;
  };
}

export interface FormData {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: "USER" | "ADMIN";
}

export interface RegisterRequest {
  phone: string;
  email: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  isActive: boolean;
  isReported: boolean;
  isBlocked: boolean;
  role: "USER" | "ADMIN";
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    middleName: string;
    isActive: boolean;
    role: "USER" | "ADMIN";
  };
}

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