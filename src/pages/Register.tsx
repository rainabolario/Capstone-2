import type React from "react"
import { useState } from "react"
import "../css/Register.css"
import { Eye, EyeOff } from "lucide-react"

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

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@ust.edu.ph"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button">
              Add User
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register