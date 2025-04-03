import { useNavigate } from 'react-router-dom';
import './login_signup_authnotification.css';

const LoginSignupAuthNotification = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="login-signup-authnotification-modal">
      <div className="login-signup-authnotification-content">
        <h3>Log in to save your results</h3>
        <div className="login-signup-authnotification-buttons">
          <button 
            className="login-signup-authnotification-btn login"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="login-signup-authnotification-btn signup"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
        <button 
          className="login-signup-authnotification-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginSignupAuthNotification;