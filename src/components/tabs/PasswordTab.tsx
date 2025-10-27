import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { supabase } from "../../supabaseClient";

const PasswordTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Re-authenticate before password change
  const reauthenticate = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setSuccessMessage("");
    setLoading(true);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;

      if (!email) {
        setPasswordError("No authenticated user found. Please log in again.");
        setLoading(false);
        return;
      }

      // Re-authenticate first
      const reauthError = await reauthenticate(email, currentPassword);
      if (reauthError) {
        setPasswordError("Incorrect current password.");
        setLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordError(error.message);
      } else {
        setSuccessMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      console.error("Change password error:", err);
      setPasswordError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const isCurrentPasswordError = passwordError.includes("Incorrect current password");
  const isNewPasswordError = !isCurrentPasswordError && passwordError !== "";

  return (
    <div className="password-container">
      <h2>Password</h2>
      <div className="password-content">
        <TextField
          fullWidth
          margin="normal"
          type={showCurrentPassword ? "text" : "password"}
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={isCurrentPasswordError}
          helperText={isCurrentPasswordError ? passwordError : ""}
          placeholder="Enter current password"
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showCurrentPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          margin="normal"
          type={showNewPassword ? "text" : "password"}
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={isNewPasswordError}
          helperText={isNewPasswordError ? passwordError : ""}
          placeholder="Enter new password"
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showNewPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          margin="normal"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={isNewPasswordError}
          placeholder="Re-enter new password"
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      {passwordError && <div style={{ color: "red", marginTop: 8 }}>{passwordError}</div>}
      {successMessage && (
        <div style={{ color: "green", marginTop: 8 }}>{successMessage}</div>
      )}

      <div className="button-content">
        <button
          className="edit-button"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default PasswordTab;