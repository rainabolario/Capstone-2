import "../css/Help.css";
import Sidebar from "../components/Sidebar";

const Help: React.FC = () => {
  return (
    <div className="help-container">
      <Sidebar />
      <div className="help-content">
        <h1>Help Center</h1>
        <p>If you need assistance, please contact support.</p>
      </div>
    </div>
  );
}

export default Help;
