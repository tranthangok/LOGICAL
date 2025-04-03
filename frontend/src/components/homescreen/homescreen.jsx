import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './homescreen.css';
import { Icon } from '@iconify/react';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Homescreen = () => {
  const location = useLocation();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    if (location.search.includes('logoutSuccess=true')) {
      setShowLogoutAlert(true);
      const timer = setTimeout(() => setShowLogoutAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="homescreen-container">
      {showLogoutAlert && (
        <div className="homescreennavbar-custom-alert success">
          Logout successfully!
        </div>
      )}
      <div className="homescreen-information">
        <div className="homescreen-firstcontent">
          <h1 className="homescreen-title">Games With Benefits</h1>
          <p className="homescreen-description">
            Train your logical thinking and memories throughout fun games. Play along in your breaks, your freetime and so on. 
            <br />
            Make yourself better everyday.
          </p>
          <a href="/signup" className="homescreen-signup-button">Sign Up</a>
        </div>
        <div className="homescreen-image-container">
          <img src="../home-controller.png" alt="Home Controller" className="homescreen-firstimage" />
        </div>
      </div>

      <div className="games-category-container">
        <h2 className="games-category-title">Our Games Category</h2>
        <div className="games-category-list">
          <div className="game-card">
            <div className="game-image-container">
              <img src="./home-sudoku.jpg" alt="Sudoku" className="homegame-image" />
            </div>
            <a href="/sudoku" className="game-name">
              <span>Sudoku</span>
              <Icon icon="mingcute:right-line" />
            </a>
          </div>
          <div className="game-card">
            <div className="game-image-container">
              <img src="./home-puzzle.jpg" alt="Puzzle" className="homegame-image" />
            </div>
            <a href="/puzzle" className="game-name">
              <span>Puzzle</span>
              <Icon icon="mingcute:right-line" />
            </a>
          </div>
          <div className="game-card">
            <div className="game-image-container">
              <img src="./home-solitaire.jpg" alt="Solitaire" className="homegame-image" />
            </div>
            <a href="/solitaire" className="game-name">
              <span>Solitaire</span>
              <Icon icon="mingcute:right-line" />
            </a>
          </div>
        </div>
      </div>

      {/* Phần About Us */}
      <div className='home-about-us-big'>
        <div className="home-about-us-container">
          <div className="home-about-us-image-container">
            <img src="./home-aboutus.jpeg" alt="About Us" className="home-about-us-image" />
          </div>
          <div className="home-about-us-content">
            <h2 className="home-about-us-title">About Us</h2>
            <p className="home-about-us-description">
              This website was created by a passionate and delightful team. We aim to make a mind-playground for everyone in the breaks. All of us can enjoy and play with friends!
            </p>
            <a href="/aboutus" className="find-out-more-button">Find out more</a>
          </div>
        </div>
      </div>
      <CookieConsent/>
    </div>
  );
};

export default Homescreen;