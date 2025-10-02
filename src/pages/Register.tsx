import type React from "react";
import { useState } from "react";
import "../css/Register.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Divider,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Button
} from "@mui/material";
import { supabase } from "../supabaseClient";

interface RegisterProps {
  onClose: () => void;
  onSubmit: (user: { id: string; name: string; email: string; role: string }) => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,15}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordRegex.test(password)) {
      setError(
        "Password must have 1 uppercase, 1 lowercase, 1 number, 1 special character, and be 6–15 characters long."
      );
      return;
    }

    setLoading(true);

    // Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Insert into users table for extra info
      const { data: userData, error: userError } = await supabase
        .from("users") // Make sure this table exists
        .insert([
          { id: authData.user.id, name, email, role }
        ])
        .select()
        .single();

      setLoading(false);

      if (userError) {
        setError(userError.message);
      } else if (userData) {
        onSubmit(userData);
        onClose();
      }
    }
  };

  return (
    <div className="register-overlay" onClick={onClose}>
      <div className="register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="register-header">
          <h2>ADD USER</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <Typography variant="caption" sx={{ color: "gray" }}>
          Fill in the details to add a new user
        </Typography>
        <Divider />

        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@ust.edu.ph"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Role"
            variant="outlined"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            required
            select
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>

          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "gray", "&:hover": { color: "#ec7a1c" } }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}

          <div className="button-group">
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: "gray",
                padding: "5px 25px",
                borderColor: "gray",
                "&.MuiButton-outlined:hover": {
                  backgroundColor: "#ec7a1c",
                  borderColor: "#ec7a1c",
                  color: "white",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                color: "white",
                borderColor: "gray",
                backgroundColor: "#ec7a1c",
                padding: "5px 35px",
              }}
            >
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
