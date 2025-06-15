import React, { useState, FormEvent, ChangeEvent } from "react";
import { NavLink } from "react-router-dom";
import { loginAccount } from "../../api/Auth.api";
import ErrorAlert from "../Alert/ErrorAlert";
const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [hasLogin, setHasLogin] = useState(false);
  const [alertTag, setAlertTag] = useState<JSX.Element | string>();

  const submitForm = async () => {
    try {
      await loginAccount(formData);
      setHasLogin(true);
      window.location.href = "/home";
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
    <div className="min-h-screen flex items-center justify-center bg-[#e8f0fe]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        {alertTag && <div className="mb-4">{alertTag}</div>}

        <h2 className="text-2xl font-semibold text-center text-[#0088cc] mb-6">
          Welcome to Talk Together
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              User Email
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#0088cc] hover:bg-[#007ab8] text-white font-semibold py-2 px-6 rounded-full transition duration-300"
            >
              Login
            </button>
          </div>

          <div className="text-center">
            <NavLink to="/register" className="text-[#0088cc] hover:underline">
              Don't have an account? Register
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
