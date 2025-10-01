import type React from "react"
import { useState } from "react"
import "../css/Register.css"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { 
  Divider, 
  Typography, 
  TextField, 
  MenuItem, 
  InputAdornment, 
  IconButton,
  Button
} from "@mui/material"

interface RegisterProps {
  onClose: () => void
  onSubmit: (user: { name: string; email: string; role: string; password: string }) => void
}

const Register: React.FC<RegisterProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Staff")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, email, role, password })
    onClose()
  }

  return (
    <div className="register-overlay" onClick={onClose}>
      <div className="register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="register-header">
          <h2>ADD USER</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <Typography variant="caption" sx={{ color: 'gray' }}>
          Fill in the details to add a new user
        </Typography>
        <Divider  />

        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            label="Name"
            variant="outlined"
            id="name"
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
            id="email"
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
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            required
            select
            helperText={!role ? "Please select a role" : ""}
            error={!role}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="" disabled><em>Select Role</em></MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>

          <TextField
            label="Password"
            variant="outlined"
            id="password"
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

          <div className="button-group">
                <Button 
                    variant="outlined" 
                    onClick={onClose}
                    sx={{ 
                        color: 'gray', 
                        padding: '5px 25px',
                        borderColor: 'gray', 
                        '&.MuiButton-outlined:hover': {  
                            backgroundColor: '#ec7a1c',
                            borderColor: '#ec7a1c',
                            color: 'white'
                        }, 
                        }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained" 
                    onClick={onClose}
                    type="submit"
                    sx={{ 
                        color: 'white', 
                        borderColor: 'gray', 
                        backgroundColor: '#ec7a1c',
                        padding: '5px 35px'
                        }}
                >
                    Add User
                </Button>
            </div>
        </form>
      </div>
    </div>
  )
}

export default Register