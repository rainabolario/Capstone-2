import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import "../css/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  
  // State for showing feedback to the user
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // This is the core Supabase function for password resets
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is the URL of the page where users will set their new password.
      redirectTo: 'http://localhost:5173/update-password', // Change this after development
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("If an account exists for this email, a password reset link has been sent.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="header-bar">
        <img src="/Kc's lola-logo.png" alt="KC's Kitchen Logo" className="header-logo" />
        <span>{"KC's Kitchen"}</span>
        <a href="/need-help" className="need-help-link">
          Need Help?
        </a>
      </div>

      <div className="login-container">
        <div className="login-overlay" />
        <div className="login-logo" />

        <div className="forgot-form-box">
          <h2 className="forgot-title">FORGOT PASSWORD</h2>
          <p className="forgot-subtitle">Enter your email address to reset your password</p>

          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                required
              />
            </div>

            {/* Display success or error messages here */}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              className="orange-button"
              onClick={() => {
                navigate("/login");
              }}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;