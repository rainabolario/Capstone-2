import type React from "react"
import "../css/Account.css"
import Sidebar from "../components/Sidebar"
import { BookOpen, Settings, CheckCircle, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import ProfileTab from "../components/tabs/ProfileTab"
import PasswordTab from "../components/tabs/PasswordTab"

interface AccountProps {
  onLogout?: () => void
}

interface User {
  id: string
  name: string
  email: string 
  role: string
}

const Account: React.FC<AccountProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "security">("profile")

  // User profile states
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    console.log("Current Supabase session:", data.session);
  });
  fetchUserData();
}, []);


  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      console.log("authUser", authUser)
      if (authError) throw authError
      if (!authUser) throw new Error("No user logged in")
      
      const { data, error: userTableError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()
      if (userTableError) throw userTableError
      if (!data) throw new Error("User data not found")

      setUser(data)
      setOriginalUser(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError("");

    // Make sure of the user's email to perform the check
    if (!user || !user.email) {
      setPasswordError("Could not find user information. Please refresh.");
      return;
    }

    // Add validation for the current password field
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill out all fields.");
      return;
    }

    // Verify the user's current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError("Incorrect current password. Please try again.");
      return; // Stop the function if the password is wrong
    }

    // Validate the new password
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("New password cannot be the same as the current password.");
      return;
    }

    // Update the user's password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setPasswordError(updateError.message);
    } else {
      setSuccess("Password updated successfully!"); 
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000); 
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error("No user to save.");

      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          role: user.role
        })
        .eq('id', user.id);

      if (error) throw error;

      setOriginalUser(user);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setUser(originalUser);
    setIsEditing(false);
  };


  return (
    <div className="account-container">
      <Sidebar onLogout={onLogout} />
      <div className="account-content">
        <div className="account-header">
          <h1>MY ACCOUNT</h1>
          <p className="account-subtitle">
            Manage your personal profile and account preferences. Update your details and ensure your information is
            accurate
          </p>
        </div>

        {(success || error) && (
          <div className={`notification-banner ${success ? 'success' : 'error'}`}>
            {success ? 
              <CheckCircle className="warning-icon" /> : 
              <Shield className="warning-icon" />
            }
            <div className="warning-content">
              <h3>{success ? 'Success' : 'An Error Occurred'}</h3>
              <p>{success || error}</p>
            </div>
          </div>
        )}

        <div className="account-main-layout">
          <div className="account-tabs">
            <button
              className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <BookOpen className="tab-icon" />
              Profile
            </button>
            <button
              className={`tab-button ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <Settings className="tab-icon" />
              Change Password
            </button>
          </div>

          <div className="account-settings-content">
            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                isEditing={isEditing}
                loading={loading}
                setUser={setUser}
                setIsEditing={setIsEditing}
                saveProfile={saveProfile}
                cancelEdit={cancelEdit}
              />
            )}

            {activeTab === "password" && (
              <PasswordTab
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                passwordError={passwordError}
                setCurrentPassword={setCurrentPassword}
                setNewPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
                handleChangePassword={handleChangePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account