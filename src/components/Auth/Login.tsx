import { jwtDecode } from "jwt-decode";
import { token } from "../store/TokenContext";
import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { NavLink } from "react-router-dom";
import Success from "../Alert/Success";
import "./Auth.scss";
import ErrorAlert from "../Alert/ErrorAlert";
import { Account } from "../store/accountContext";

interface LoginResponse {
  statusCode: string,
  message: string,
  data: {
    user: Account;
    accessToken: string;
  };
}

const Login: React.FC = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [hasLogin, setHasLogin] = useState(false);
  const [alertTag, setAlertTag] = useState<JSX.Element | string>();

  useEffect(() => {
    // You can optionally decode an existing token or check for login
    // if (token) {
    //   const decoded = jwtDecode(token) as { email?: string; sub?: string };
    //   if (decoded.email && decoded.sub) {
    //     setHasLogin(true);
    //   }
    // }
  }, []);

  const submitForm = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result: LoginResponse = await res.json();
      const data = result.data;

      if (!data?.accessToken) throw new Error("Login failed");

      document.cookie = `accessToken=${data.accessToken}`;
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log(`access_token=${data.accessToken}`);
      setHasLogin(true);

      setAlertTag(
        <Success
          value={["Login Success", "You will navigate to chat page after 3s !"]}
        />
      );
      setTimeout(() => {
        setAlertTag("");
      }, 6000);

    } catch (error) {
      setAlertTag(
        <ErrorAlert value={["Login Fail", "Error email or password !"]} />
      );
      
      setTimeout(() => {
        setAlertTag("");
      }, 8000);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitForm();
  };

  return (
    <div className="login-page">
      {alertTag}
      {!hasLogin ? (
        <form onSubmit={handleFormSubmit} className="form-login">
          <div className="submit_center">
            <h2 className="title">Welcome To Talk Together</h2>
          </div>
          <label>User Email</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="submit_center">
            <button type="submit">Login</button>
          </div>
          <div className="submit_center">
            <NavLink to="/register" className={"register"}>
              Touch me to register new account
            </NavLink>
          </div>
          <div className="notice">
            The server takes a few minutes to start up for the new day
          </div>
        </form>
      ) : (
        (window.location.href = "/home")
      )}
    </div>
  );
};

export default Login;
