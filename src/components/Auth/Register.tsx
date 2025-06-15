import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Error from "../Alert/ErrorAlert";
import { registerAccount} from "../../api/Auth.api";
import Success from "../Alert/Success";
import { FormData, RegisterRequest } from "../../api/Auth.int";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    phone: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: "USER",
  });

  const [alertTag, setAlertTag] = useState<React.ReactNode>(undefined);

  const submitForm = async() => {
    const registrationData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      role: formData.role,
      isActive: true,
      isReported: false,
      isBlocked: false,
    };

    try {
      await registerAccount(registrationData);
      setAlertTag(
        <Success value={["Register Success", "You have successfully registered!"]} />
      );
      setTimeout(() => {
        setAlertTag(undefined);
        navigate("/login");
      }, 3000);
    } catch (error) {
        setAlertTag(
          <Error value={["Register Failed", "An error occurred during registration!"]} />
        );
        setTimeout(() => setAlertTag(undefined), 8000);
      }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email, password, phone, firstName, lastName } = formData;
    if (email && password && phone && firstName && lastName) {
      submitForm();
    } else {
      setAlertTag(
        <Error
          value={["Register Failed", "Please fill in all required fields!"]}
        />
      );
      setTimeout(() => setAlertTag(undefined), 8000);
    }
  };

  return (
    <div className="min-h-screen bg-[#d2eaf1] flex items-center justify-center px-4">
      {/* Alert */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
        {alertTag}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center text-[#0088cc] mb-6">
          Create New Account
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block font-medium">First Name*</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div>
            <label className="block font-medium">Last Name*</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-style"
              placeholder="123-456-7890"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-style"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0088cc] hover:bg-[#007ab8] text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <NavLink to="/login" className="text-[#0088cc] hover:underline">
            Back to Login Page
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Register;
