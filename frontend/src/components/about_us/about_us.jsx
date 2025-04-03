import './about_us.css';
import { Icon } from '@iconify/react';
import CookieConsent from '../cookie_consent/cookie_consent'; 

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <div className="about-us-hero">
                <img src="../aboutus-main.jpg" alt="The game is just start" className="about-us-hero-image" />
                <div className="about-us-hero-text">
                    <h1>The game is </h1>
                    <h1>just start</h1>
                    <br />
                    <br />
                    <span className="about-us-logo">LOGICAL</span>
                </div>
            </div>

            <div className="about-us-content">
                <div className="about-us-text">
                    <h3>WHAT IS THE PURPOSE OF THIS WEBSITE FOR?</h3>
                    <p>
                        This website was created by Tran Thang, a student, a developer comes from Vietnam. 
                        At first, the programmer wants to make a website to practice how the algorithm works 
                        throughout fun games around us: Puzzle, Sudoku and Solitaire are the mind-games you 
                        already know about them.
                    </p>
                    <p>
                        As the creator of this website, I think that everyone can have a great time when 
                        playing the game and make your minds better on my website. Enjoy!
                    </p>
                </div>
            </div>

            <div className="about-us-question">
                <a href='/feedback'>Have a question? Come and ask us <Icon icon="mingcute:right-line" /> </a>
            </div>
        <CookieConsent/>
        </div>
    );
};

export default AboutUs;