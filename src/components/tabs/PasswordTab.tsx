import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

interface PasswordTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError: string;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  handleChangePassword: () => Promise<void>;
}

const PasswordTab: React.FC<PasswordTabProps> = ({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordError,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  handleChangePassword,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading] = useState(false);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
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
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
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
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      {passwordError && <div style={{ color: "red", marginTop: 8 }}>{passwordError}</div>}

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
