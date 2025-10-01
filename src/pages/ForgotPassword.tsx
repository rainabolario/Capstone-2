import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/ForgotPassword.css"

type Step = "email" | "security" | "reset" | "success"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [answers, setAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Mock security questions
  const questions = [
    "In which city were you born?",
    "What was the name of your first pet?",
    "What was the street you lived on in third grade?",
  ]

  // Check if user is locked out
  useEffect(() => {
    if (currentStep === "security" && email) {
      const storedLockout = localStorage.getItem(`lockout_${email}`)
      if (storedLockout) {
        const lockoutDate = new Date(storedLockout)
        const now = new Date()
        const timeDiff = lockoutDate.getTime() - now.getTime()

        if (timeDiff > 0) {
          setIsLocked(true)
          setLockoutTime(lockoutDate)
        } else {
          localStorage.removeItem(`lockout_${email}`)
          localStorage.removeItem(`attempts_${email}`)
        }
      }

      const storedAttempts = localStorage.getItem(`attempts_${email}`)
      if (storedAttempts) {
        setAttemptsRemaining(Number.parseInt(storedAttempts))
      }
    }
  }, [currentStep, email])

  // Update lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const timeDiff = lockoutTime.getTime() - now.getTime()

        if (timeDiff <= 0) {
          setIsLocked(false)
          setLockoutTime(null)
          setAttemptsRemaining(3)
          localStorage.removeItem(`lockout_${email}`)
          localStorage.removeItem(`attempts_${email}`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLocked, lockoutTime, email])

  const getRemainingTime = () => {
    if (!lockoutTime) return ""
    const now = new Date()
    const diff = lockoutTime.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert("Please enter your email address")
      return
    }
    setCurrentStep("security")
  }

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      return
    }

    if (!answers.answer1 || !answers.answer2 || !answers.answer3) {
      setErrorMessage("Please answer all security questions")
      return
    }

    // Mock verification - accept "test" as correct answer
    const isCorrect =
      answers.answer1.toLowerCase() === "test" &&
      answers.answer2.toLowerCase() === "test" &&
      answers.answer3.toLowerCase() === "test"

    if (isCorrect) {
      localStorage.removeItem(`attempts_${email}`)
      localStorage.removeItem(`lockout_${email}`)
      setErrorMessage("")
      setCurrentStep("reset")
    } else {
      const newAttempts = attemptsRemaining - 1
      setAttemptsRemaining(newAttempts)
      localStorage.setItem(`attempts_${email}`, newAttempts.toString())

      if (newAttempts === 0) {
        const lockout = new Date()
        lockout.setHours(lockout.getHours() + 1)
        setLockoutTime(lockout)
        setIsLocked(true)
        localStorage.setItem(`lockout_${email}`, lockout.toISOString())
        setErrorMessage("Too many incorrect attempts. Your account has been locked for 1 hour.")
      } else {
        setErrorMessage(
          `One or more answers are incorrect. You have ${newAttempts} ${newAttempts === 1 ? "attempt" : "attempts"} remaining.`,
        )
      }
    }
  }

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      alert("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    const hasCapital = /[A-Z]/.test(newPassword)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    const isLongEnough = newPassword.length >= 8

    if (!hasCapital || !hasSpecial || !isLongEnough) {
      alert("Password must be 8 characters long, contain one capital letter, and one special character")
      return
    }

    setCurrentStep("success")
    setTimeout(() => {
      navigate("/login")
    }, 3000)
  }

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

        <div className="forgot-form-box" style={{ minHeight: currentStep === "security" ? "430px" : "auto" }}>
          {/* ========== FORGOT PASSWORD ========== */}
          {currentStep === "email" && (
            <>
              <h2 className="forgot-title">FORGOT PASSWORD</h2>
                <p className="forgot-subtitle">Enter your email address to reset your password</p>

              <form onSubmit={handleEmailSubmit}>
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

                <button type="submit" className="submit-button">
                  Continue
                </button>

                <button type="button" className="orange-button"
                onClick={() => {
                    navigate("/login"); 
                }}
                >
                Back to Login
                </button>
              </form>
            </>
          )}

          {/* ========== SECURITY QUESTIONS ========== */}
          {currentStep === "security" && (
            <>
              <h2 className="forgot-title">SECURITY QUESTIONS</h2>
              <p className="forgot-subtitle">Answer the following security questions to verify your identity</p>

              {errorMessage && (
                <div
                  style={{
                    backgroundColor: isLocked ? "#fee2e2" : "#fed7aa",
                    border: `1px solid ${isLocked ? "#ef4444" : "#fb923c"}`,
                    borderRadius: "8px",
                    padding: "12px 15px",
                    marginBottom: "15px",
                    fontSize: "0.9rem",
                    color: isLocked ? "#991b1b" : "#9a3412",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {isLocked && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    padding: "12px 15px",
                    marginBottom: "15px",
                    fontSize: "0.9rem",
                    color: "#991b1b",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Account locked. Time remaining: {getRemainingTime()}
                </div>
              )}

              <form onSubmit={handleSecuritySubmit}>
                <div className="form-group">
                  <label>{questions[0]}</label>
                  <input
                    type="text"
                    value={answers.answer1}
                    onChange={(e) => setAnswers({ ...answers, answer1: e.target.value })}
                    placeholder="Enter your answer"
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{questions[1]}</label>
                  <input
                    type="text"
                    value={answers.answer2}
                    onChange={(e) => setAnswers({ ...answers, answer2: e.target.value })}
                    placeholder="Enter your answer"
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{questions[2]}</label>
                  <input
                    type="text"
                    value={answers.answer3}
                    onChange={(e) => setAnswers({ ...answers, answer3: e.target.value })}
                    placeholder="Enter your answer"
                    disabled={isLocked}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLocked}
                  style={{ opacity: isLocked ? 0.5 : 1 }}
                >
                  Verify Answers
                </button>

                <div className="forgot-password-page">
                <button
                    type="button"
                    className="forgot-password"
                    onClick={(e) => {
                    e.preventDefault()
                    setCurrentStep("email")
                    setErrorMessage("")
                    }}
                >
                    Back to Forgot Password
                </button>
                </div>
              </form>
            </>
          )}

          {/* ========== RESET PASSWORD ========== */}
          {currentStep === "reset" && (
            <>
              <h2 className="forgot-title">RESET PASSWORD</h2>
              <p className="forgot-subtitle">Enter your new password</p>

              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--dark-gray)", marginTop: "5px", marginBottom: "0" }}>
                    Password must be 8 characters long, one capital letter, and one special character
                  </p>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-button">
                  Reset Password
                </button>

                <div className="forgot-password">
                  <a href="/login" style={{ color: "var(--dark-gray)" }}>
                    Back to Login
                  </a>
                </div>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {currentStep === "success" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  margin: "0 auto 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="forgot-title">Password Reset Successful!</h2>
              <p className="forgot-subtitle">Your password has been successfully reset.</p>
              <p style={{ color: "var(--dark-gray)", marginTop: "20px" }}>Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ForgotPassword