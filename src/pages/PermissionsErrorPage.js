import { useNavigate } from "react-router";
import { useAuthStore } from "../providers/auth";

// Update PermissionsError component to show different messages based on user type
const PermissionsErrorPage = () => {

    const userPermissions = useAuthStore(state => state.userPermissions);

    const navigate = useNavigate();

    let message = '';
    let buttonText = '';
    let buttonAction = () => { };

    if (userPermissions === 'research') {
        message = 'This feature is only available for admin users. Please contact your administrator for access.';
        buttonText = 'View Pricing';
        buttonAction = () => {
            navigate('/pricing');
        };
    }

    return (
        <div className="permissions-error-container">
            <div className="permissions-error-content">
                <div className="lock-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h2>Access Restricted</h2>
                <p>{message}</p>
                <button
                    className="upgrade-button"
                    onClick={buttonAction}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default PermissionsErrorPage;