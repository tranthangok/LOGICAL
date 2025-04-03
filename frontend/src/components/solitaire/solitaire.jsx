import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './solitaire.css';
import SolitairePlayHistory from './solitaire_play_history';
import LoginSignupAuthNotification from '../login_signup_authnotification/login_signup_authnotification';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Solitaire = () => {
    const [time, setTime] = useState('Endless');
    const [hints, setHints] = useState('Unlimited');
    const [timeValue, setTimeValue] = useState('');
    const [hintsValue, setHintsValue] = useState('');
    const [errors, setErrors] = useState({
        time: false,
        hints: false
    });
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {   
        if (time !== 'Counting') setTimeValue('');
        if (hints !== 'Limited') setHintsValue('');
    }, [time, hints]);

    const validateTimeFormat = (time) => {
        const timePattern = /^([0-5]?\d):([0-5]\d)$/;
        return timePattern.test(time);
    };

    const handleStartPlay = () => {
        let newErrors = {
            time: time === 'Counting' && (!timeValue || !validateTimeFormat(timeValue)),
            hints: hints === 'Limited' && (!hintsValue || isNaN(hintsValue) || hintsValue < 1)
        };

        if (newErrors.time || newErrors.hints) {
            setErrors(newErrors);
            return;
        }

        navigate('/solitaire-play', {
            state: {
                timeMode: time,
                timeLimit: timeValue,
                hintMode: hints,
                hintLimit: hintsValue
            }
        });
    };

    useEffect(() => {
        const checkAuth = () => {
          const token = localStorage.getItem('token');
          setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []);

    return (
        <div className="solitaire-container">
            <div className="solitaire-settings-wrapper">
                <div className="solitaire-settings">
                    <div className="solitaire-setting-group">
                        <span className="solitaire-title">Time</span>
                        <select
                            className="solitaire-select"
                            value={time}
                            onChange={(e) => {
                                setTime(e.target.value);
                                setErrors(prev => ({...prev, time: false}));
                            }}
                        >
                            <option>Endless</option>
                            <option>Counting</option>
                        </select>
                        {time === 'Counting' && (
                            <div className="solitaire-input-fields">
                                <input
                                    className={`solitaire-input ${errors.time ? 'solitaire-input-error' : ''}`}
                                    type="text"
                                    value={timeValue}
                                    onChange={(e) => {
                                        setTimeValue(e.target.value);
                                        setErrors(prev => ({...prev, time: false}));
                                    }}
                                    placeholder="MM:SS"
                                />
                                {errors.time && (
                                    <div className="solitaire-error">
                                        {!timeValue ? 'Time is required' : 'Invalid time format (MM:SS)'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="solitaire-setting-group">
                        <span className="solitaire-title">Hints</span>
                        <select
                            className="solitaire-select"
                            value={hints}
                            onChange={(e) => {
                                setHints(e.target.value);
                                setErrors(prev => ({...prev, hints: false}));
                            }}
                        >
                            <option>Unlimited</option>
                            <option>Limited</option>
                        </select>
                        {hints === 'Limited' && (
                            <div className="solitaire-input-fields">
                                <input
                                    className={`solitaire-input ${errors.hints ? 'solitaire-input-error' : ''}`}
                                    type="number"
                                    min="1"
                                    value={hintsValue}
                                    onChange={(e) => {
                                        setHintsValue(e.target.value);
                                        setErrors(prev => ({...prev, hints: false}));
                                    }}
                                    placeholder="Number of hints"
                                />
                                {errors.hints && (
                                    <div className="solitaire-error">
                                        {!hintsValue ? 'Hints are required' : 'Must be at least 1'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className="solitaire-button-primary"
                        onClick={handleStartPlay}
                    >
                        Start Game
                    </button>
                    <button 
                        className="solitaire-history-link"
                        onClick={() => setShowHistory(true)}
                        >
                        Play history
                        </button>

                        {showHistory && (
                            <div className="solitaire-history-modal">
                                {isAuthenticated ? (
                                <SolitairePlayHistory onClose={() => setShowHistory(false)} />
                                ) : (
                                <LoginSignupAuthNotification onClose={() => setShowHistory(false)} />
                                )}
                            </div>
                        )}
                </div>
            </div>

            <div className="solitaire-image">
                <img src="./solitaire-gaming.jpg" alt="Solitaire" />
            </div>
            <CookieConsent/>
        </div>
    );
};

export default Solitaire;