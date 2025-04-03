import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './user_information.css';
import axios from 'axios';

const UserInformation = ({ setShowModal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });

  const [editData, setEditData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const validatePassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return strongRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!userInfo.name.trim()) {
      newErrors.name = 'Name cannot be empty';
    }

    const {newPassword, confirmPassword } = editData;
    const pwdFieldsFilled = [newPassword, confirmPassword].filter(Boolean).length;

    if (pwdFieldsFilled > 0) {
      if (pwdFieldsFilled < 2) {
        newErrors.password = 'Please fill all password fields';
      }
      else if (newPassword !== confirmPassword) {
        newErrors.password = 'New passwords do not match';
      }
      else if (!validatePassword(newPassword)) {
        newErrors.password = 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:3000/api/auth/user',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setUserInfo({
          name: response.data.name,
          email: response.data.email
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (validateForm()) {
      try {
        // Tạo payload với trường oldPassword đặc biệt
        const payload = {
          name: userInfo.name,
          ...(editData.newPassword && { 
            oldPassword: 'otp_verified', 
            newPassword: editData.newPassword 
          })
        };
  
        await axios.put(
          'http://localhost:3000/api/auth/user',
          payload, // Sử dụng payload mới
          { withCredentials: true }
        );
  
        // Hiển thị thông báo và reset trạng thái
        let message = [];
        if (userInfo.name) message.push("Name changed successfully");
        if (editData.newPassword) message.push("Password changed successfully");
        
        setSuccessMessage(message.join(" and "));
        setTimeout(() => setSuccessMessage(''), 3000);
  
        setIsEditing(false);
        setShowConfirmModal(false);
        setEditData({ newPassword: '', confirmPassword: '' });
      } catch (err) {
        setErrors({ password: err.response?.data?.error || 'Update failed' });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEditClick = () => {
    if (isEditing) {
      const isValid = validateForm(); // Kiểm tra lỗi trước khi hiện confirm modal
      if (!isValid) return; // Nếu có lỗi thì dừng lại
      setShowConfirmModal(true);
    } else {
      setIsEditing(true);
    }
  };

  const sendOTP = async () => {
    try {
    await axios.post('http://localhost:3000/api/otp/send-otp', { email: userInfo.email });
    setOtpMessage({ text: 'OTP sent! Check your email', type: 'success' });
      // Set cooldown 60s
      setOtpCooldown(60);
      const interval = setInterval(() => {
        setOtpCooldown(c => {
          if (c <= 1) clearInterval(interval);
          return c > 0 ? c - 1 : 0;
        });
      }, 1000);
    
    } catch (err) {
      setOtpMessage({ text: err.response?.data?.error || 'Error sending OTP', type: 'error' });
    }
    };
    
  const verifyOTP = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/otp/verify-otp', {
          email: userInfo.email,
          otp
        });
        
        if (response.data.message === 'Login successful') {
          await handleSave();
          setShowConfirmModal(false);
          setSuccessMessage('Changes saved successfully!');
          setOtp(''); // Reset OTP field
        }
      } catch (err) {
        console.error('OTP verification error:', err);
        setOtpMessage({ 
          text: err.response?.data?.error || 'Invalid OTP', 
          type: 'error' 
        });
      }
    };

  return (
    <>
      <div className="user-information-overlay" onClick={() => setShowModal(false)} />
      
      <div className="user-information-modal">

      {successMessage && (<div className="user-information-success">{successMessage}</div>)}

        <div className="user-information-header">
          <h2 className="user-information-title">Account Information</h2>
          <Icon 
            icon="material-symbols:close"
            className="user-information-close"
            onClick={() => setShowModal(false)}
          />
        </div>

        {errors.name && <div className="user-information-error">{errors.name}</div>}
        {errors.password && <div className="user-information-error">{errors.password}</div>}

        {!isEditing ? (
          <div className="user-information-container">
            <div className="user-information-group">
              <div className="user-information-label">Name</div>
              <div className="user-information-value">{userInfo.name}</div>
            </div>
            <div className="user-information-group">
              <div className="user-information-label">Email</div>
              <div className="user-information-value">{userInfo.email}</div>
            </div>
          </div>
        ) : (
          <form className="user-information-form">
            <div className="user-information-input-group">
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                className={errors.name ? 'user-information-error-border' : ''}
              />
            </div>

            <hr style={{ margin: '15px 0', borderColor: '#3a3a44' }} />

            <div className="user-information-input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={editData.newPassword}
                onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                className={errors.password ? 'user-information-error-border' : ''}
              />
              <Icon 
                icon={showPassword ? "weui:eyes-on-outlined" : "weui:eyes-off-outlined"}
                className="user-information-password-toggle"
                onClick={togglePasswordVisibility}
              />
            </div>

            <div className="user-information-input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={editData.confirmPassword}
                onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})}
                className={errors.password ? 'user-information-error-border' : ''}
              />
              <Icon 
                icon={showPassword ? "weui:eyes-on-outlined" : "weui:eyes-off-outlined"}
                className="user-information-password-toggle"
                onClick={togglePasswordVisibility}
              />
            </div>
          </form>
        )}

        <button 
          className="user-information-edit-button" 
          onClick={handleEditClick} 
        >
          <Icon icon={isEditing ? 'material-symbols:save' : 'lucide:pen'} />
          <span>{isEditing ? 'Save' : 'Edit'}</span>
        </button>

        {showConfirmModal && (
          <div className="user-information-confirmation-modal">
          <div className="user-information-confirmation-content">
          <h3>Verify OTP to Save Changes</h3>
          {otpMessage && (
              <div className={`user-information-error ${otpMessage.type === 'success' ? 'success' : ''}`}>
                  {otpMessage.text}
              </div>
          )}

              <div className="user-information-otp-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="user-information-otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
                <button
                  type="button"
                  className="user-information-send-btn"
                  onClick={sendOTP}
                  disabled={otpCooldown > 0}
                >
                  {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : 'Send OTP'}
                </button>
              </div>

              <button 
                className="user-information-check-btn"
                onClick={verifyOTP}
              >
                Check OTP
              </button>
            </div>
          </div>
          )}
      </div>
    </>
  );
};

export default UserInformation;