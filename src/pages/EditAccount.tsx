import React, { useState, useEffect } from "react";
import "../css/Register.css"; 
import {
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    MenuItem,
    Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // MUI icons for password

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Staff';
    password?: string;
}

interface EditAccountProps {
    user: User;
    onClose: () => void;
    onSubmit: (updatedUser: User) => void;
}

const EditAccount: React.FC<EditAccountProps> = ({ user, onClose, onSubmit }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
        ...user,
        name,
        email,
        role,
        ...(password && { password }),
        });
        onClose();
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="register-overlay" onClick={onClose}>
        <div className="register-modal" onClick={(e) => e.stopPropagation()}>
            <div className="register-header">
                <h2>EDIT USER</h2>
            <button className="close-button" onClick={onClose}>×</button>
            </div>

            <Typography variant="caption" sx={{ color: 'gray' }}>
            Edit the details below to update the user's profile
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <form onSubmit={handleSubmit} className="register-form">
            <TextField
                label="Name"
                variant="outlined"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
            />

            <TextField
                label="Email"
                variant="outlined"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />

            <TextField
                label="Role"
                variant="outlined"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Staff')}
                fullWidth
                select
            >
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
            </TextField>

            <TextField
                label="New Password (Optional)"
                variant="outlined"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                placeholder="Enter new password"
                helperText="Leave blank to keep current password"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
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
                        padding: '5px 25px',
                        }}
                >
                    Save Changes
                </Button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default EditAccount;