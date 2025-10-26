import * as React from "react";
import { useState } from "react";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { TextField, Select, MenuItem } from "@mui/material";
import { supabase } from "../../supabaseClient";


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProfileTabProps {
  user: User | null;
  isEditing: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  saveProfile: () => Promise<void>;
  cancelEdit: () => void;
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>; // optional if you keep list
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  isEditing,
  loading,
  setUser,
  setIsEditing,
  saveProfile,
  cancelEdit,
}) => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  // ✅ Uses Supabase logic instead of /api endpoint
  const deactivateAccount = async () => {
    if (!user) {
      alert("No user found.");
      return;
    }

    if (confirmEmail !== user.email || confirmText.toUpperCase() !== "DEACTIVATE") {
      alert("Please type your email and 'DEACTIVATE' correctly to confirm.");
      return;
    }

    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate your account? You will be logged out immediately."
    );
    if (!confirmDeactivate) return;

    try {
      setDeactivating(true);

      const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", user.id);

      if (error) throw error;

      alert("Account deactivated successfully. Logging out...");

      // Clear session
      localStorage.removeItem("token");
      sessionStorage.clear();
      setUser(null);
      await supabase.auth.signOut();

      window.location.href = "/login";
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert("Failed to deactivate account.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div>
      <div className="profile-container">
        <h2>Profile Information</h2>

        {user ? (
          <div className="profile-content">
            <div className="name-container">
              <TextField
                fullWidth
                label="Name"
                value={user.name || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
              />
            </div>

            <div className="email-role-wrapper">
              <TextField
                fullWidth
                label="Email"
                value={user.email || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, email: e.target.value } : prev))
                }
              />

              <Select
                fullWidth
                value={user.role || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, role: e.target.value } : prev))
                }
              >
                <MenuItem value="">Select a Role</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </div>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}

        <div className="button-content">
          {isEditing ? (
            <>
              <button onClick={saveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={cancelEdit} disabled={loading}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
      </div>

      <div className="delete-container">
        <h2>Deactivate Account</h2>
        <div className="delete-instructions">
          <WarningAmberRoundedIcon sx={{ height: 24 }} />
          <p>Once you deactivate your account, you’ll be logged out immediately. No reactivation.</p>
        </div>

        <div className="delete-content">
          <TextField
            fullWidth
            type="email"
            label="Type your email to confirm"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
          <TextField
            fullWidth
            type="text"
            label="Type 'DEACTIVATE' to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <div className="button-content">
          <button onClick={deactivateAccount} disabled={deactivating}>
            {deactivating ? "Deactivating..." : "Deactivate Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
