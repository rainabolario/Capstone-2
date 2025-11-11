import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (email: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message); 
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
      .from('users') // Your public.users table
      .select('role')
      .eq('id', data.user.id) // Get profile matching the logged-in user's ID
      .single();
      
      const userRole = profile?.role || 'Staff'; // Default to 'Staff' if role not found

      if (data.user && data.user.email) {
        onLogin(data.user.email, userRole);

        // 🔹 Trigger sync in the background
        try {
          const res = await fetch('https://capstone-2-tg05.onrender.com/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: data.user.email }),
          });

          const result = await res.json();
          console.log('Sync result:', result);
        } catch (syncErr) {
          console.error('Sync error:', syncErr);
        }

        navigate("/salesoverview");
      } else {
        setError("Login successful, but user email is not available.");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
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
        <div className="login-form-box">
          <h2 className="login-title">LOGIN</h2>
          <p className="login-subtitle">
            Enter your email and password below to login to your account
          </p>

          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="forgot-password">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="submit-button">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
