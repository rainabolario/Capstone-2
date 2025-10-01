
import type React from "react"

import "../css/Account.css"
import Sidebar from "../components/Sidebar"
import { BookOpen, Settings, Shield, CheckCircle } from "lucide-react"
import { useState } from "react"

interface AccountProps {
  onLogout?: () => void
}

const Account: React.FC<AccountProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "security">("profile")
  const [securityQuestionsSet, setSecurityQuestionsSet] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [securityQuestions, setSecurityQuestions] = useState({
    question1: "",
    answer1: "",
    question2: "",
    answer2: "",
    question3: "",
    answer3: "",
  })

  const handleSaveSecurityQuestions = () => {
    if (
      !securityQuestions.question1 ||
      !securityQuestions.answer1 ||
      !securityQuestions.question2 ||
      !securityQuestions.answer2 ||
      !securityQuestions.question3 ||
      !securityQuestions.answer3
    ) {
      alert("Please fill in all security questions and answers")
      return
    }
    setShowConfirmModal(true)
  }

  const confirmSaveSecurityQuestions = () => {
    setSecurityQuestionsSet(true)
    setShowConfirmModal(false)
    setShowSuccessModal(true)
  }

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

        <div className={`security-warning-banner ${securityQuestionsSet ? "success" : ""}`}>
          {securityQuestionsSet ? <CheckCircle className="warning-icon" /> : <Shield className="warning-icon" />}
          <div className="warning-content">
            <h3>{securityQuestionsSet ? "Security Questions Set Up" : "Security Questions Not Set Up"}</h3>
            <p>
              {securityQuestionsSet
                ? "Your security questions have been successfully configured. You can use them for account recovery."
                : "You have not set up your security questions yet. These questions are essential for account recovery if you forgot your password."}
            </p>
          </div>
        </div>

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
            <button
              className={`tab-button ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield className="tab-icon" />
              Security Questions
            </button>
          </div>

          <div className="account-settings-content">
            {activeTab === "profile" && (
              <>
                <div className="profile-container">
                  <h2>Profile Information</h2>
                  <div className="profile-content">
                    <div className="first-name-container">
                      <p>First Name</p>
                      <input type="text" placeholder="First Name" />
                    </div>
                    <div className="last-name-container">
                      <p>Last Name</p>
                      <input type="text" placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="profile-content">
                    <div className="email-container">
                      <p>Email</p>
                      <input type="email" placeholder="your@email.com" />
                    </div>
                    <div className="role-container">
                      <p>Role</p>
                      <select name="role" id="role">
                        <option value="admin">Admin</option>
                        <option value="user">Staff</option>
                        <option value="viewer">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="button-content">
                    <button className="edit-button">Edit</button>
                  </div>
                </div>

                <div className="delete-container">
                  <h2>Delete Account</h2>
                  <div className="delete-instructions">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                  <div className="delete-content">
                    <div className="type-email-container">
                      <p>To confirm, type your email in the box below</p>
                      <input type="email" placeholder="your@email.com" />
                    </div>
                    <div className="type-delete-container">
                      <p>To confirm, type "delete" in the box below</p>
                      <input type="text" placeholder="delete" />
                    </div>
                  </div>
                  <div className="button-content">
                    <button className="delete-button">Delete Account</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "password" && (
              <div className="password-container">
                <h2>Password</h2>
                <div className="password-content">
                  <div className="current-password-container">
                    <p>Current Password</p>
                    <input type="password" placeholder="Current Password" />
                  </div>
                  <div className="new-password-container">
                    <p>New Password</p>
                    <input type="password" placeholder="New Password" />
                  </div>
                  <div className="reenter-password-container">
                    <p>Re-enter New Password</p>
                    <input type="password" placeholder="Re-enter New Password" />
                  </div>
                </div>
                <div className="button-content">
                  <button className="edit-button">Update Password</button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="security-container">
                <h2>SECURITY QUESTIONS</h2>
                <p className="security-description">
                  Please select three security questions and provide answers. These will be used to verify your identity
                  if you need to reset your password.
                </p>

                <div className="security-question-group">
                  <label>SECURITY QUESTION 1:</label>
                  <select
                    className="security-select"
                    value={securityQuestions.question1}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, question1: e.target.value })}
                  >
                    <option value="">Select a question</option>
                    <option value="pet">What was the name of your first pet?</option>
                    <option value="city">In what city were you born?</option>
                    <option value="school">What is the name of your elementary school?</option>
                    <option value="food">What is your favorite food?</option>
                  </select>
                  <label className="answer-label">YOUR ANSWER:</label>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    className="security-input"
                    value={securityQuestions.answer1}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, answer1: e.target.value })}
                  />
                </div>

                <div className="security-question-group">
                  <label>SECURITY QUESTION 2:</label>
                  <select
                    className="security-select"
                    value={securityQuestions.question2}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, question2: e.target.value })}
                  >
                    <option value="">Select a question</option>
                    <option value="pet">What was the name of your first pet?</option>
                    <option value="city">In what city were you born?</option>
                    <option value="school">What is the name of your elementary school?</option>
                    <option value="food">What is your favorite food?</option>
                  </select>
                  <label className="answer-label">YOUR ANSWER:</label>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    className="security-input"
                    value={securityQuestions.answer2}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, answer2: e.target.value })}
                  />
                </div>

                <div className="security-question-group">
                  <label>SECURITY QUESTION 3:</label>
                  <select
                    className="security-select"
                    value={securityQuestions.question3}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, question3: e.target.value })}
                  >
                    <option value="">Select a question</option>
                    <option value="pet">What was the name of your first pet?</option>
                    <option value="city">In what city were you born?</option>
                    <option value="school">What is the name of your elementary school?</option>
                    <option value="food">What is your favorite food?</option>
                  </select>
                  <label className="answer-label">YOUR ANSWER:</label>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    className="security-input"
                    value={securityQuestions.answer3}
                    onChange={(e) => setSecurityQuestions({ ...securityQuestions, answer3: e.target.value })}
                  />
                </div>

                <div className="button-content">
                  <button className="edit-button" onClick={handleSaveSecurityQuestions}>
                    Save Security Questions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Security Questions</h3>
            <p>Are you sure you want to save these security questions? Make sure you remember your answers.</p>
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="modal-confirm" onClick={confirmSaveSecurityQuestions}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CheckCircle className="success-icon" />
            <h3>Security Questions Saved Successfully</h3>
            <p>Your security questions have been configured and can now be used for account recovery.</p>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={() => setShowSuccessModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account