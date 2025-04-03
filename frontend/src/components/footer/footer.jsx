import './footer.css';
import { Icon } from '@iconify/react';

  const Footer = () => {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/" className="logo-footer">LOGICAL</a>
            <div className="footer-section">
              <a className="footer-link-big">Getting started</a>
              <a href="/" className="footer-link-small">Home</a>
              <a href="/aboutus" className="footer-link-small">About us</a>
              <a href="#" className="footer-link-small">Term of service</a>
            </div>
            <div className="footer-section">
              <a className="footer-link-big">Account</a>
              <a href="/login" className="footer-link-small">Log in</a>
              <a href="/signup" className="footer-link-small">Sign up</a>
              <a href="/feedback" className="footer-link-small">Feedback</a>
            </div>
            <div className="footer-section">
              <a className="footer-link-big">Follow us on social media</a>
                <div className='social-icons'>
                  <a href="https://facebook.com"><Icon icon="mdi:facebook" /></a>
                  <a href="https://github.com/tranthangok/LOGICAL"><Icon icon="mdi:github" /></a>
                  <a href="https://youtube.com"><Icon icon="mdi:youtube" /></a>
                  <a href="https://www.figma.com/design/BpH19IB9MdYnl3fjUaWGEM/LOGICAL?node-id=0-1&p=f&t=eb5FRuWUiItinfFm-0"><Icon icon="fa-brands:figma" /></a>
                </div>
              <a className="footer-link-small">logical.playgaming@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-line"></div>
          <div className="footer-copyright">
            <span className="copyright-text">2025 LOGICAL</span>
            <span className="copyright-logo">©</span>
          </div>
        </div>
      </footer>
    );
  };

  export default Footer;