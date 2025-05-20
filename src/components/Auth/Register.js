// import { jwtDecode } from "jwt-decode";
// import React, {
//   useContext,
//   useEffect,
//   useState,
//   createContext,
//   useRef,
// } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import Success from "../Alert/Success";
// import "./Auth.scss";
// import Error from "../Alert/ErrorAlert";

// function Register() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     phone: "",
//     address: "",
//     image: "",
//   });

//   const [alertTag, setAlertTag] = useState();

//   const submitForm = () => {
//     fetch(`http://localhost:8080/auth/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.statusCode === 201) {
//           setAlertTag(
//             <Success
//               value={[`Register Success`, "Back to login page after 3s !"]}
//             />
//           );
//           setTimeout(() => {
//             setAlertTag("");
//             window.location.href = "/login";
//           }, 3000);
//         } else {
//           setAlertTag(<Error value={[`Register Fail`, data.message]} />);
//           setTimeout(() => {
//             setAlertTag("");
//           }, 8000);
//         }
//       })
//       .catch(() => {
//         setAlertTag(<Error value={[`Register Fail`, "Happen Error !"]} />);
//         setTimeout(() => {
//           setAlertTag("");
//         }, 8000);
//       });
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleFormSubmit = (event) => {
//     event.preventDefault();
//     if (formData.email && formData.password && formData.name) submitForm();
//     else {
//       setAlertTag(
//         <Error
//           value={[`Register Fail`, "Please fullfill significant infomation !"]}
//         />
//       );
//       setTimeout(() => {
//         setAlertTag("");
//       }, 8000);
//     }
//   };

//   return (
//     <>
//       <div className="login-page">
//         {alertTag}
//         <form onSubmit={handleFormSubmit} className="form-login">
//           <div className="submit_center">
//             <h2 className="title">
//               mitsuha@gmail.com/mitsuha & taki@gmail.com/taki
//             </h2>
//           </div>
//           <label>User Email*</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//           />
//           <label>Name*</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//           />
//           <label>Password*</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//           />
//           <label>Phone Number*</label>
//           <input
//             type="number"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//           />
//           <label>Address</label>
//           <input
//             type="text"
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//           />
//           <label>Image (Link)</label>
//           <input
//             type="text"
//             name="image"
//             value={formData.image}
//             onChange={handleChange}
//           />
//           <img src={formData.image} className="review-avatar"></img>
//           <div className="submit_center">
//             <button type="submit">Register</button>
//           </div>
//           <div className="submit_center">
//             <NavLink to="/login" className={"register"}>
//               Back To Login Page
//             </NavLink>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

// export default Register;
