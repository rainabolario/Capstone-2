import "../css/Account.css";
import Sidebar from "../components/Sidebar";
import { OctagonAlert } from "lucide-react";

interface AccountProps {
  onLogout?: () => void;
}

const Account: React.FC<AccountProps> = ({ onLogout }) => {
    return (
        <div className="account-container">
        <Sidebar onLogout={onLogout} />
        <div className="account-content">
            <h1>ACCOUNT SETTINGS</h1>
            <div className="account-settings-content">
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

                <div className="delete-container">
                    <h2>Delete Account</h2>
                    <div className="delete-content">
                        <div className="delete-instructions">
                            <h3><OctagonAlert /> Warning</h3>
                            <p>Deleting your account is irreversible. All your data will be permanently removed. Please confirm your email and type DELETE to proceed.</p>
                        </div>
                        <div className="type-email-container">
                            <p>Type your email address to confirm deletion of account</p>
                            <input type="email" placeholder="your@email.com" />
                        </div>
                        <div className="type-delete-container">
                            <p>Type DELETE to confirm</p>
                            <input type="text" placeholder="DELETE" />
                        </div>
                    </div>
                    <div className="button-content">
                        <button className="edit-button">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Account;
