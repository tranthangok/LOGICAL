import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react'; 
import './signup.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CookieConsent from '../cookie_consent/cookie_consent';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);

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

    const validateName = (name) => {
        const regex = /^[A-Za-z\sÀ-ỹ]+$/; // Cho phép khoảng trắng và tiếng Việt
        return regex.test(name);
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

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        
        // Kiểm tra match ngay khi nhập
        if (password !== newConfirmPassword) {
          setConfirmPasswordError('Passwords do not match');
        } else {
          setConfirmPasswordError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setFormError('');

        let hasError = false;

        if (!name || !email || !password || !confirmPassword) {
            setFormError('Please fill in all fields.');
            return;
        } else {
            setFormError('');
        }

        if (!validateName(name)) {
            setNameError('Only alphabetic characters and spaces are allowed');
        } else {
            setNameError('');
        }

        if (!validateEmail(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }

        if (!validatePassword(password)) {
            setPasswordError('You must input your password with at least 8 letters with 1 capital letter (A-Z), 1 normal letter (a-z) and 1 number (1-9).');
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        axios.post('https://logical-backend.vercel.app/api/auth/signup', {name, email, password}, { 
            headers: { 'Content-Type': 'application/json' }
          })
        .then(result => {
            clearTimeout(timeoutId);
            setApiError('');
            setSuccessMessage('Account created successfully! Verify link sent, please check your inbox.');
            const newTimeoutId = setTimeout(() => {
                setSuccessMessage('');
                navigate('/login');
            }, 3000);
            setTimeoutId(newTimeoutId);
        })
        .catch(err => {
            clearTimeout(timeoutId);
            setSuccessMessage('');
            const errorMessage = err.response?.data?.error === 'This email has been used' 
                ? 'This email has been used' 
                : 'An error occurred. Please try again.';
            setApiError(errorMessage);
            const newTimeoutId = setTimeout(() => setApiError(''), 3000);
            setTimeoutId(newTimeoutId);
        });
    }

    return (
        <div className="signup-container">
            <div className="signup-text-container">
                <h1>Join us,<br />Unlimited fun.</h1>
                <p>Already at <span className="signup-logo">LOGICAL</span>? <p>Login your account <a href="/login" className="signuptologin-link">here</a></p></p>
            </div>
            <div className="signup-form-container">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Your name" 
                        className="input-signup-field" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && <p className="error-message-signup">{nameError}</p>}
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        className="input-signup-field" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailError && <p className="error-message-signup">{emailError}</p>}
                    <div className="password-toggle">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="New password" 
                            className="input-signup-field" 
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
                    {passwordError && <p className="error-message-signup">{passwordError}</p>}
                    <div className="password-toggle">
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Re-type password" 
                            className="input-signup-field" 
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange} // Sửa thành hàm mới
                        />
                        <span 
                            className="password-toggle-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Icon icon={showConfirmPassword ? "weui:eyes-off-outlined" : "weui:eyes-on-outlined"} />
                        </span>
                    </div>
                    {confirmPasswordError && <p className="error-message-signup">{confirmPasswordError}</p>}
                    {formError && <p className="error-message-signup">{formError}</p>}
                    <button type="submit" className="submit-signup-button">Submit</button>
                </form>
            </div>
            {successMessage && <div className="signup-custom-alert success">{successMessage}</div>}
            {apiError && <div className="signup-custom-alert error">{apiError}</div>}

            {/* Cập nhật thông báo lỗi name */}
            {nameError && <p className="signup-error-message-signup">{nameError}</p>}
            <CookieConsent/>
        </div>
    );
};

export default Signup;