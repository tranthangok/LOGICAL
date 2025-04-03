import { useState } from 'react';
import './cookie_consent.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(() => {
        // Kiểm tra sessionStorage khi khởi tạo
        return sessionStorage.getItem('cookieConsent') === null;
    });

    const handleAccept = () => {
        sessionStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        sessionStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-container">
            <div className="cookie-content">
                <p className="cookie-text">
                We use cookies to enhance your experience. By continuing to use the site, you agree to our
                <a href="/" className="cookie-policy-link"> cookie policies.</a>
                </p>
                <div className="cookie-buttons">
                    <button className="cookie-btn accept" onClick={handleAccept}>Accept</button>
                    <button className="cookie-btn decline" onClick={handleDecline}>Decline</button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;