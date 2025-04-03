import { useState, useEffect } from 'react';
import './feedback.css';
import axios from 'axios';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const Feedback = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [feedbackError, setFeedbackError] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [timeoutId, setTimeoutId] = useState(null);

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
            if (response.data) {
              setName(response.data.name);
              setEmail(response.data.email);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        fetchUserData();
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !feedback) {
            setFormError('Please fill in all fields.');
            return;
        } else {
            setFormError('');
        }

        if (!name) {
            setNameError('Please enter your name.');
        } else {
            setNameError('');
        }

        if (!email) {
            setEmailError('Please enter your email.');
        } else {
            setEmailError('');
        }

        if (!feedback) {
            setFeedbackError('Please enter your feedback.');
        } else {
            setFeedbackError('');
        }

        if (name && email && feedback) {
            try {
                await axios.post('http://localhost:3000/api/feedback/send-feedback', {
                    name,
                    email,
                    feedback
                });
                setFeedback('');
                setFormError('');
                clearTimeout(timeoutId);
                setSuccessMessage('Feedback submitted successfully!');
                const newTimeoutId = setTimeout(() => setSuccessMessage(''), 3000);
                setTimeoutId(newTimeoutId);
            } catch (_err) {
                clearTimeout(timeoutId);
                setErrorMessage('Failed to submit feedback. Please try again.');
                const newTimeoutId = setTimeout(() => setErrorMessage(''), 3000);
                setTimeoutId(newTimeoutId);
            }
        }
    };

    return (
        <div className="feedback-container">
            <div className="feedback-text-container">
                <h1>Feedback</h1>
                <p>In here you can send your complaints or some of improvements that you think it is good for the website.</p>
                <br/>
                <p>We will reply after 1-7 business days. Thank you!</p>
            </div>
            <div className="feedback-form-container">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Your name" 
                        className="input-feedback-field" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        readOnly={!!email}
                    />
                    {nameError && <p className="error-message-feedback">{nameError}</p>}
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        className="input-feedback-field" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={!!email}
                    />
                    {emailError && <p className="error-message-feedback">{emailError}</p>}
                    <textarea 
                        placeholder="Your feedback/ opinion" 
                        className="input-feedback-field" 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="5"
                    />
                    {feedbackError && <p className="error-message-feedback">{feedbackError}</p>}
                    {formError && <p className="error-message-feedback">{formError}</p>}
                    <button type="submit" className="submit-feedback-button">Submit</button>
                </form>
            </div>
            {successMessage && (
                <div className="feedback-custom-alert success">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="feedback-custom-alert error">
                    {errorMessage}
                </div>
            )}
            <CookieConsent/>
        </div>
    );
};

export default Feedback;