import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './puzzle.css';
import PuzzlePlayHistory from './puzzle_play_history';
import LoginSignupAuthNotification from '../login_signup_authnotification/login_signup_authnotification';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Puzzle = () => {
    const navigate = useNavigate();
    const [pieces, setPieces] = useState('');
    const [timeMode, setTimeMode] = useState('Endless');
    const [timeValue, setTimeValue] = useState('');
    const [hintMode, setHintMode] = useState('Unlimited');
    const [hintLimit, setHintLimit] = useState('');
    const [errors, setErrors] = useState({
        pieces: false,
        time: false,
        hint: false
    });
    const [showHistory, setShowHistory] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const validateTimeFormat = (time) => {
        const timePattern = /^([0-5]?\d):([0-5]\d)$/;
        return timePattern.test(time);
    };

    const handleStartPlay = () => {
        let newErrors = {
            pieces: !pieces,
            time: timeMode === 'Counting' && (!timeValue || !validateTimeFormat(timeValue)),
            hint: hintMode === 'Limited' && (!hintLimit || isNaN(hintLimit) || hintLimit < 1)
        };

        if (newErrors.pieces || newErrors.time || newErrors.hint) {
            setErrors(newErrors);
            return;
        }

        navigate('/puzzle-play', {
            state: {
                pieces: parseInt(pieces),
                timeMode,
                timeLimit: timeMode === 'Counting' ? timeValue : null,
                hintMode,
                hintLimit: hintMode === 'Limited' ? parseInt(hintLimit) : null
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
        <div className="puzzle-container">
            <div className="puzzle-settings-wrapper">
                <div className="puzzle-settings">
                    <div className="puzzle-setting-group">
                        <span className="puzzle-title">Number of pieces</span>
                        <div className="puzzle-option-group">
                            {['3x3', '4x4', '5x5'].map((label) => {
                                const size = parseInt(label.split('x')[0], 10);
                                const value = size * size;
                                return (
                                    <div
                                        key={label}
                                        className={`puzzle-option ${pieces === String(value) ? 'active' : ''}`}
                                        onClick={() => {
                                            setPieces(String(value));
                                            setErrors(prev => ({...prev, pieces: false}));
                                        }}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                        {errors.pieces && (
                            <div className="puzzle-error">Please choose number of pieces</div>
                        )}
                    </div>

                    <div className="puzzle-setting-group">
                        <span className="puzzle-title">Time</span>
                        <div className="puzzle-option-group">
                            <select
                                className="puzzle-input"
                                value={timeMode}
                                onChange={(e) => {
                                    setTimeMode(e.target.value);
                                    setErrors(prev => ({...prev, time: false}));
                                }}
                            >
                                <option>Endless</option>
                                <option>Counting</option>
                            </select>
                            {timeMode === 'Counting' && (
                                <>
                                    <input
                                        className={`puzzle-input ${errors.time ? 'error' : ''}`}
                                        type="text"
                                        value={timeValue}
                                        onChange={(e) => {
                                            setTimeValue(e.target.value);
                                            setErrors(prev => ({...prev, time: false}));
                                        }}
                                        placeholder="MM:SS"
                                    />
                                    {errors.time && (
                                        <div className="puzzle-error">
                                            {!timeValue ? 'Time is required' : 'Invalid time format (MM:SS)'}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="puzzle-setting-group">
                        <span className="puzzle-title">Hint Mode (Only available in 3x3)</span>
                        <div className="puzzle-option-group">
                            <select
                                className="puzzle-input"
                                value={hintMode}
                                onChange={(e) => {
                                    setHintMode(e.target.value);
                                    setErrors(prev => ({...prev, hint: false}));
                                }}
                            >
                                <option>Unlimited</option>
                                <option>Limited</option>
                            </select>
                            {hintMode === 'Limited' && (
                                <>
                                    <input
                                        className={`puzzle-input ${errors.hint ? 'error' : ''}`}
                                        type="number"
                                        min="1"
                                        value={hintLimit}
                                        onChange={(e) => {
                                            setHintLimit(e.target.value);
                                            setErrors(prev => ({...prev, hint: false}));
                                        }}
                                        placeholder="Number of hints"
                                    />
                                    {errors.hint && (
                                        <div className="puzzle-error">
                                            {!hintLimit ? 'Hint limit is required' : 'Must be at least 1'}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <button 
                        className="puzzle-button-primary"
                        onClick={handleStartPlay}
                    >
                        Start to play
                    </button>
                    <button 
                        className="puzzle-history-link"
                        onClick={() => setShowHistory(true)}
                    >
                        Play history
                    </button>

                    {showHistory && (
                        <div className="puzzle-history-modal">
                            {isAuthenticated ? (
                                <PuzzlePlayHistory onClose={() => setShowHistory(false)} />
                            ) : (
                                <LoginSignupAuthNotification onClose={() => setShowHistory(false)} />
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CookieConsent/>
        </div>
    );
};

export default Puzzle;
