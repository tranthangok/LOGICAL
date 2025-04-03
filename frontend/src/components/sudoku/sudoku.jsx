import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './sudoku.css';
import SudokuPlayHistory from './sudoku_play_history';
import LoginSignupAuthNotification from '../login_signup_authnotification/login_signup_authnotification';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Sudoku = () => {
    const [difficulty, setDifficulty] = useState('Easy');
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

        navigate('/sudoku-play', {
            state: {
                difficulty,
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
        <div className="sudoku-container">
            <div className="sudoku-settings-wrapper">
                <div className="sudoku-settings">
                    <div className="sudoku-setting-group">
                        <span className="sudoku-title">Choose difficulty</span>
                        <select
                            className="sudoku-select"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                            <option>Asian</option>
                        </select>
                    </div>

                    <div className="sudoku-setting-group">
                        <span className="sudoku-title">Time</span>
                        <select
                            className="sudoku-select"
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
                            <div className="sudoku-input-fields">
                                <input
                                    className={`sudoku-input ${errors.time ? 'sudoku-input-error' : ''}`}
                                    type="text"
                                    value={timeValue}
                                    onChange={(e) => {
                                        setTimeValue(e.target.value);
                                        setErrors(prev => ({...prev, time: false}));
                                    }}
                                    placeholder="MM:SS"
                                />
                                {errors.time && (
                                    <div className="sudoku-error">
                                        {!timeValue ? 'Time is required' : 'Invalid time format (MM:SS)'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="sudoku-setting-group">
                        <span className="sudoku-title">Hints</span>
                        <select
                            className="sudoku-select"
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
                            <div className="sudoku-input-fields">
                                <input
                                    className={`sudoku-input ${errors.hints ? 'sudoku-input-error' : ''}`}
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
                                    <div className="sudoku-error">
                                        {!hintsValue ? 'Hints are required' : 'Must be at least 1'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className="sudoku-button-primary"
                        onClick={handleStartPlay}
                    >
                        Start to play
                    </button>
                    <button 
                        className="sudoku-history-link"
                        onClick={() => setShowHistory(true)}
                        >
                        Play history
                        </button>

                        {showHistory && (
                            <div className="sudoku-history-modal">
                                {isAuthenticated ? (
                                <SudokuPlayHistory onClose={() => setShowHistory(false)} />
                                ) : (
                                <LoginSignupAuthNotification onClose={() => setShowHistory(false)} />
                                )}
                            </div>
                        )}
                </div>
            </div>

            <div className="sudoku-image">
                <img src="./home-sudoku.jpg" alt="Sudoku" />
            </div>
            <CookieConsent/>
        </div>
    );
};

export default Sudoku;