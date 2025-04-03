import { useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import './login_without_password.css';

const LoginWithoutPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const sendOTP = async () => {
    setEmailError('');
    
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/otp/send-otp', { email });
      setMessage({ text: 'OTP sent! Check your email', type: 'success' });
      
      const waitTimes = [0, 60, 120, 180, 300];
      const newCooldown = waitTimes[attempts] || 0;
      setCooldown(newCooldown);
      setAttempts(a => a + 1);

      const interval = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) clearInterval(interval);
          return c > 0 ? c - 1 : 0;
        });
      }, 1000);

    } catch (err) {
      const errorMsg = err.response?.data?.error;
      if (errorMsg === 'Email not found') {
        setEmailError('Email not found');
      }

      setMessage({ text: errorMsg || 'Error', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/api/otp/verify-otp', { email, otp });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
        setTimeout(() => window.location.href = '/', 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      if (errorMsg === 'Email not found') {
        setEmailError('Email not found');
      }
      setMessage({ text: errorMsg || 'Invalid OTP', type: 'error' });
    }
  };

  return (
    <div className="loginwithoutpass-overlay">
      <div className="loginwithoutpass-modal">
        <div className="loginwithoutpass-header">
          <h2>Login without password</h2>
          <Icon 
            icon="material-symbols:close-rounded" 
            className="loginwithoutpass-close-icon" 
            onClick={onClose} 
          />
        </div>
        
        <form className="loginwithoutpass-form" onSubmit={verifyOTP}>
          <input
            type="email"
            className="loginwithoutpass-input"
            placeholder="Your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            required
          />
          {emailError && <span className="loginwithoutpass-error">{emailError}</span>}
          
          <div className="loginwithoutpass-otp-group">
            <input
              type="text"
              placeholder="Enter OTP"
              className="loginwithoutpass-otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
            <button
              type="button"
              className="loginwithoutpass-send-btn"
              onClick={sendOTP}
              disabled={cooldown > 0 || isLoading}
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Send OTP'}
            </button>
          </div>

          <button type="submit" className="loginwithoutpass-submit-btn">
            Login with OTP
          </button>
        </form>

        <p className="loginwithoutpass-note">
          <em>If you forgot your password, you can change after you login in Account Information section.</em>
        </p>

        {message && (
          <div className={`loginwithoutpass-alert ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginWithoutPassword;