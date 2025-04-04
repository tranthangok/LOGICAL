import { useState, useEffect } from 'react';
import './navbar.css';
import { Icon } from '@iconify/react';
import UserInformation from './user_information';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('https://logical-backend.vercel.app/api/auth/logout');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      navigate('/?logoutSuccess=true');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Hiển thị null nếu đang loading
  if (isLoading) return null;

  return (
    <nav className="navbar">
      <a href="/" className="logo-navbar">LOGICAL</a>
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/sudoku">Sudoku</a>
        <a href="/puzzle">Puzzle</a>
        <a href="/solitaire">Solitaire</a>
      </div>
      
      {isLoggedIn ? (
        <>
          <div className="navbar-dropdown"> 
            <Icon 
                icon="material-symbols:account-circle" 
                fontSize={40}
                style={{ cursor: 'pointer', color: '#fff' }}
                onClick={() => setShowDropdown(!showDropdown)}
            />
            <div className={`navbar-dropdown-content ${showDropdown ? 'show' : ''}`}>
                <div className="navbar-dropdown-item" 
                    onClick={() => {
                        setShowAccountModal(true);
                        setShowDropdown(false);
                    }}
                >
                    Account information
                </div>
                <a href="/feedback" className="navbar-dropdown-item">
                  <span>Feedback</span>
                </a>
                <div className="navbar-dropdown-item" onClick={handleLogout}>
                    Log out
                </div>
            </div>
        </div>
        </>
      ) : (
        <div className="navbar-auth">
          <a href="/login">Login</a>
          <a href="/signup" className="navbar-signup">Sign Up</a>
        </div>
      )}
      <div className='navbar-menu-container'>
            <a onClick={() => setOpenMenu(true)}><Icon icon="material-symbols:menu" /></a>
      </div>

      {showAccountModal && <UserInformation setShowModal={setShowAccountModal} />}

      <div className={`drawer ${openMenu ? 'open' : ''}`}>
        <div className="drawer-content">
          <a href="/" className="drawer-link">
            <span>Home</span>
            <Icon icon="mingcute:right-line" />
          </a>
          <a href="/sudoku" className="drawer-link">
            <span>Sudoku</span>
            <Icon icon="mingcute:right-line" />
          </a>
          <a href="/puzzle" className="drawer-link">
            <span>Puzzle</span>
            <Icon icon="mingcute:right-line" />
          </a>
          <a href="/solitaire" className="drawer-link">
            <span>Solitaire</span>
            <Icon icon="mingcute:right-line" />
          </a>
          
          {isLoggedIn ? (
            <>
              <a 
                className="drawer-link"
                onClick={() => {
                  setShowAccountModal(true);
                  setOpenMenu(false);
                }}
              >
                <span>Account Information</span>
                <Icon icon="mingcute:right-line" />
              </a>
              <a href="/feedback" className="drawer-link">
                <span>Feedback</span>
                <Icon icon="mingcute:right-line" />
              </a>
              <div className="drawer-link" onClick={handleLogout}>
                  <span>Log out</span>
                  <Icon icon="mingcute:right-line" />
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="drawer-link">
                <span>Login</span>
                <Icon icon="mingcute:right-line" />
              </a>
              <a href="/signup" className="drawer-link">
                <span>Sign Up</span>
                <Icon icon="mingcute:right-line" />
              </a>
            </>
          )}
          
          <a className="close-drawer" onClick={() => setOpenMenu(false)}>
            <Icon icon="material-symbols:close" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;