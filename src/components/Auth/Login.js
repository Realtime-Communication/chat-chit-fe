import { jwtDecode } from "jwt-decode";
import { decodeToken, getCookie } from "../store/tokenContext";
import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  useRef,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Success from "../Alert/Success";
import "./Auth.scss";
import Error from "../Alert/Error";

const { email, sub } = decodeToken;
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [hasLogin, setHasLogin] = useState(false);

  const [alertTag, setAlertTag] = useState();

  useEffect(() => {
    if (email && sub) setHasLogin(true);
    else setHasLogin(false);
  }, []);

  const submitForm = () => {
    fetch(`http://localhost:8080/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        data = data.data;
        document.cookie = `accessToken=${data.accessToken}`;
        localStorage.setItem("user", JSON.stringify(data.user))
        console.log(`access_token=${data.accessToken}`)
        setHasLogin(true);
        setAlertTag(
          <Success
            value={[
              `Login Success`,
              "You will navigate to chat page after 3s !",
            ]}
          />
        );
        setTimeout(() => {
          setAlertTag("");
        }, 6000);
        // window.location.href = "/home";
      })
      .catch(() => {
        setAlertTag(
          <Error value={[`Login Fail`, "Error email or password !"]} />
        );
        setTimeout(() => {
          setAlertTag("");
        }, 8000);
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submitForm();
  };

  return (
    <>
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
          <>{(window.location.href = "/home")}</>
        )}
      </div>
    </>
  );
}

export default Login;
