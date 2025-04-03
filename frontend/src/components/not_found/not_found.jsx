import './not_found.css'

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404 - Page Not Found</h1>
            <p className="not-found-text">
                Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
            <a href="/" className="not-found-button">
                Go Back Home
            </a>
        </div>
    );
};

export default NotFound;