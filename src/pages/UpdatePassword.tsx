import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import "../css/ForgotPassword.css"; 

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            setLoading(false);
            return;
        }

        // Supabase function updates the password for the logged-in user (from the reset link)
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setErrorMessage(error.message);
        } else {
            setSuccessMessage('Password updated successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        }

        setLoading(false);
    };

    return (
        <>
            <div className="header-bar">
              <img src="/Kc's lola-logo.png" alt="KC's Kitchen Logo" className="header-logo" />
              <span>{"KC's Kitchen"}</span>
            </div>

            <div className="login-container">
                <div className="login-overlay" />
                <div className="login-logo" />
                <div className="forgot-form-box">
                    <h2 className="forgot-title">RESET PASSWORD</h2>
                    <p className="forgot-subtitle">Enter your new password below.</p>

                    <form onSubmit={handleUpdatePassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                required
                            />
                        </div>

                        {successMessage && <div className="success-message">{successMessage}</div>}
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdatePassword;