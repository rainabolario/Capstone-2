import type React from "react"
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { TextField, Select, MenuItem } from "@mui/material";

interface User {
  id: string
  name: string
  email: string 
  role: string
}

interface ProfileTabProps {
  user: User | null
  isEditing: boolean
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  saveProfile: () => Promise<void>
  cancelEdit: () => void
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  isEditing,
  loading,
  setUser,
  setIsEditing,
  saveProfile,
  cancelEdit
}) => {
  return (
    <>
      <div className="profile-container">
        <h2>Profile Information</h2>

        {user && (
        <div className="profile-content">
          <div className="name-container">
            <TextField
              fullWidth
              type="text"
              label="Name"
              placeholder="Enter your name"
              value={user?.name || ""}
              disabled={!isEditing}
              onChange={e => setUser(prev => prev ? { ...prev, name: e.target.value } : prev)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
            />
          </div>
          <div className="email-role-wrapper">
          <div className="email-container">
            <TextField
              fullWidth 
              type="email"
              label="Email"
              placeholder="your@email.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
              value={user?.email || ""}
              disabled={!isEditing}
              onChange={e => setUser(prev => prev ? { ...prev, email: e.target.value } : prev)}
            />
          </div>
          <div className="role-container">
            <Select
              fullWidth
              name="role" 
              id="role"
              value={user?.role || ""}
              disabled={!isEditing}
              onChange={e => setUser(prev => prev ? { ...prev, role: e.target.value } : prev)}
              sx={{
                '& .MuiSelect-root': {
                  borderRadius: '10px'
                }
              }}
            >
              <MenuItem value="None">Select a Role</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </div>
          </div>
        </div>
        )}

        <div className="button-content">
          {isEditing ? (
            <>
              <button
                className="edit-button"
                onClick={saveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="delete-button"
                onClick={cancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="delete-container">
        <h2>Delete Account</h2>
        <div className="delete-instructions">
          <WarningAmberRoundedIcon sx={{ height: 24 }}/>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <div className="delete-content">
          <div className="type-email-container">
            <TextField
              fullWidth 
              type="email" 
              label="To confirm, type your email in the box below"
              placeholder="your@email.com" 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <div className="type-delete-container">
            <TextField 
              fullWidth 
              type="text" 
              label="To confirm, type 'DELETE' in the box below"
              placeholder="delete" 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px'
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </div>
        <div className="button-content">
          <button className="delete-button">Delete Account</button>
        </div>
      </div>
    </>
  )
}

export default ProfileTab