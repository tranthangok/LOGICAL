import { useState, useEffect } from 'react';
import './login.css';
import { Icon } from '@iconify/react';
import LoginWithoutPass from './login_without_password';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);
    const [showWithoutPass, setShowWithoutPass] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return regex.test(password);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        if (!validateEmail(newEmail)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (!validatePassword(newPassword)) {
            setPasswordError('You must input your password with at least 8 letters with 1 capital letter (A-Z), 1 normal letter (a-z) and 1 number (1-9).');
        } else {
            setPasswordError('');
        }
    };

    axios.defaults.withCredentials = true;
    const handleSubmit = async (e) => {
        e.preventDefault();
        let hasError = false;
    
        // Validate email và password trước khi gửi request
        if (!validateEmail(email)) {
            setEmailError('Invalid email format');
            hasError = true;
        }
        if (!validatePassword(password)) {
            setPasswordError('Password does not match the requirements');
            hasError = true;
        }
        if (hasError) return;

        axios.post('https://logical-backend.vercel.app/api/auth/login', { email, password })
            .then(result => {
                if (result.status === 200) {
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('user', JSON.stringify(result.data.user));
                    setSuccessMessage('Login successfully! Redirecting...');
                    const newTimeoutId = setTimeout(() => {
                        setSuccessMessage('');
                        navigate('/');
                      }, 3000);
                    setTimeoutId(newTimeoutId);
                } else {
                    throw new Error(result.data);
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                setSuccessMessage('');
                const errorMessage = err.response?.data?.error || 'Invalid email or password';
                setApiError(errorMessage);
                const newTimeoutId = setTimeout(() => setApiError(''), 3000);
                setTimeoutId(newTimeoutId);
                if (err.response?.data === "Login failed! Please verify your email") {
                    setApiError('Please verify your email to login');
                }
            });
    };

    return (
        <div className="login-container">
            <div className="login-text-container">
                <h1>Join us,
                <br />
                Unlimited fun.</h1>
                <p>New to <span className="login-logo">LOGICAL</span>? <p>Sign up your account <a href="/signup" className="logintosignup-link">here</a></p></p>
            </div>
            <div className="login-form-container">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        className="input-login-field" 
                        value={email}
                        onChange={handleEmailChange}
                    />
                    {emailError && <p className="error-message-login">{emailError}</p>}
                    <div className="password-toggle">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Your password" 
                            className="input-login-field" 
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        <span 
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <Icon icon={showPassword ? "weui:eyes-off-outlined" : "weui:eyes-on-outlined"} />
                        </span>
                    </div>
                    {passwordError && <p className="error-message-login">Password does not match the requirements</p>}
                    <span className="login-password-hint">
                        Your password must be at least 8 characters, including 1 uppercase letter (A-Z), 1 lowercase letter (a-z), and 1 number (1-9).
                    </span>
                    <a className='login-forgotpassword' onClick={() => setShowWithoutPass(true)}>Login without password</a>
                    <button type="submit" className="submit-login-button">Submit</button>
                </form>
            </div>
            {successMessage && <div className="login-custom-alert success">{successMessage}</div>}
            {apiError && <div className="login-custom-alert error">{apiError}</div>}

            {showWithoutPass && <LoginWithoutPass onClose={() => setShowWithoutPass(false)} />}
            <CookieConsent/>
        </div>
    );
};

export default Login;