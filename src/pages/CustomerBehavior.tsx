import "../css/CustomerBehavior.css"
import Sidebar from "../components/Sidebar"
import { Divider, Typography } from "@mui/material"

interface CustomerBehaviorProps {
  currentUser: string
  onLogout: () => void
}

const CustomerBehavior: React.FC<CustomerBehaviorProps> = ({ onLogout }) => {
    return (
        <div className='forecast-container'>
            <Sidebar onLogout={onLogout} />
                <div className="behavior-content">
                    <div className="behavior-header">
                        <h1>CUSTOMER BEHAVIOR AND TRENDS</h1>
                    </div>
                    <div className="helper-text">
                        <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
                            This dashboard provides an overview of customer preferences. Use the tools below to filter the presented data, and visualize customer behavior and trends over time.
                        </Typography>
                        <Divider />
                    </div>

                    <div className="tableau-responsive-wrapper">
                        <iframe
                            src="https://prod-apsoutheast-b.online.tableau.com/t/rhicarhichelleflorescics-89b56ea568/views/051125_PDS/CUSTOMER?:embed=y&:toolbar=no&:refresh=yes"
                            className="tableau-iframe"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>
        </div>
    );
}

export default CustomerBehavior
