import { jwtDecode } from "jwt-decode";
import { decodeToken, getCookie } from './../store/tokenContext';
import React, { useContext, useEffect, useState ,createContext, useRef} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Success from "../Alert/Success";
import './Auth.scss'
import Error from "../Alert/Error";

const { username, sub } = decodeToken;
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
                'Content-Type': 'application/json',
            },
            body : JSON.stringify(formData),
        })
        .then(res => res.json())
        .then(data => {
            data = data.data;
            document.cookie = `access_token=${data.access_token}`;
            setHasLogin(true);
            setAlertTag(<Success value={[`Login Success`, 'You will navigate to chat page after 3s !']}/>);
            setTimeout(() => {
                setAlertTag('');
            }, 6000)
            window.location.href = '/home';
        })
        .catch(() => {
            setAlertTag(<Error value={[`Login Fail`, 'Error email or password !']}/>);
            setTimeout(() => {
                setAlertTag('');
            }, 8000)
        })
    }
    
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
                { !hasLogin ?
                    <form onSubmit={handleFormSubmit} className="form-login">
                        <div className="submit_center">
                            <h2 className="title">Welcome to QuineSN</h2>
                        </div>
                        <label>User Email</label>
                        <input
                            type="email"
                            name="username"
                            value={formData.username}
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
                            <NavLink className={'register'}>Touch me to register new account</NavLink>
                        </div>
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