import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Success from "../Alert/Success";
import Error from "../Alert/ErrorAlert";
import "./Auth.scss";

// Types
interface FormData {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: "USER" | "ADMIN";
}

interface RegisterRequest {
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

interface RegisterResponse {
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

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    phone: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: "USER", // Default role
  });

  const [alertTag, setAlertTag] = useState();

  const submitForm = (): void => {
    // Prepare data according to the new DTO structure
    const registrationData: RegisterRequest = {
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      isActive: true,
      isReported: false,
      isBlocked: false,
      role: formData.role,
    };

    fetch(`http://localhost:8080/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    })
      .then((res) => res.json())
      .then((data: RegisterResponse) => {
        if (data.statusCode === 201) {
          setAlertTag(
            <Success
              value={[
                `Register Success`,
                `Welcome ${data.data.firstName} ${data.data.lastName}! Redirecting to login page after 3s...`,
              ]}
            />
          );
          setTimeout(() => {
            setAlertTag(undefined);
            window.location.href = "/login";
          }, 3000);
        } else {
          setAlertTag(<Error value={[`Register Failed`, data.message]} />);
          setTimeout(() => {
            setAlertTag(undefined);
          }, 8000);
        }
      })
      .catch((error: Error) => {
        console.error("Registration error:", error);
        setAlertTag(
          <Error value={[`Register Failed`, "An error occurred during registration!"]} />
        );
        setTimeout(() => {
          setAlertTag(undefined);
        }, 8000);
      });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    
    // Validate required fields
    if (
      formData.email &&
      formData.password &&
      formData.firstName &&
      formData.lastName &&
      formData.phone
    ) {
      submitForm();
    } else {
      setAlertTag(
        <Error
          value={[
            `Register Failed`,
            "Please fill in all required fields (Email, Password, First Name, Last Name, Phone)!",
          ]}
        />
      );
      setTimeout(() => {
        setAlertTag(undefined);
      }, 8000);
    }
  };

  return (
    <>
      <div className="login-page">
        {alertTag}
        <form onSubmit={handleFormSubmit} className="form-login">
          <div className="submit_center">
            <h2 className="title">Create New Account</h2>
          </div>

          <label>Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>First Name*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label>Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
          />

          <label>Last Name*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label>Phone Number*</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="123-456-7890"
            required
          />

          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <div className="submit_center">
            <button type="submit">Register</button>
          </div>

          <div className="submit_center">
            <NavLink to="/login" className="register">
              Back To Login Page
            </NavLink>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;