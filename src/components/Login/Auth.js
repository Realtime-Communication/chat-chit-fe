import { jwtDecode } from "jwt-decode";
import { getCookie } from './../store/tokenContext';
import React, { useContext, useEffect, useState ,createContext, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Success from "../Home/alert/Success";
import Error from "../Home/alert/Error";
import './Auth.scss'
const token = getCookie('access_token');
  const info = () => {
  try {
      return jwtDecode(token);
  } catch (error) {
      return {};
  }
}
const { username, sub } = info();
function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [hasLogin, setHasLogin] = useState(false);

    const [alertTag, setAlertTag] = useState();

    useEffect(() => {
        if(username && sub) setHasLogin(true);
        else setHasLogin(false);
    }, [])

    const submitForm = () => {
        fetch(`${process.env.REACT_APP_API}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Important header for JSON
            },
            body : JSON.stringify(formData),
        })
        .then(res => res.json())
        .then(data => {
            if(data.access_token) {
                document.cookie = `access_token=${data.access_token}`;
                setHasLogin(true);
                setAlertTag(<Success value={[`Login Success`, 'You will navigate to chat page after 3s !']}/>);
                setTimeout(() => {
                    setAlertTag('');
                }, 3000)
                window.location.href = '/home';
            } else {
                setAlertTag(<Error value={[`Login Fail`, 'Error email or password !']}/>);
                setTimeout(() => {
                    setAlertTag('');
                }, 2500)
            }
        })
    }
    
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        console.log('username:', formData.username);
        console.log('password:', formData.password);
        submitForm();
    };

    return (
        <> 
            <div>
                {alertTag}
                {!hasLogin ?
                    <form onSubmit={handleFormSubmit} className="form-login">
                        <label>User Email:</label>
                        <input
                            type="email"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button type="submit">Submit</button>
                    </form>
                :
                    <>
                        {window.location.href = '/home'}
                    </>
                }
            </div>
        </>
    )
}

export default Login;