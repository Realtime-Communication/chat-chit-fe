import { Account } from "../components/store/accountContext";

export interface LoginResponse {
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
