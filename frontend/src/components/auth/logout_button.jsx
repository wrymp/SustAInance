import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const LogoutButton = ({ className = "logout-button" }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className={className}>
            🚪 Logout
        </button>
    );
};

export default LogoutButton;