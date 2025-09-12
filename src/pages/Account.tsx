import "../css/Account.css";
import Sidebar from "../components/Sidebar";

const Account: React.FC = () => {
    return (
        <div className="account-container">
        <Sidebar />
        <div className="account-content">
            <h1>Account Settings</h1>
            <div className="account-content">
                <p>Manage your account information and settings here.</p>
                <form>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" />
                </div>
                <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
        </div>
    );
}

export default Account;
