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
                            This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
                        </Typography>
                        <Divider />
                    </div>

                    <div className="tableau-responsive-wrapper">
                        <iframe
                            src="https://prod-apsoutheast-b.online.tableau.com/t/iambeastar-ed66b6ed6a/views/KCSKITCHENDASHBOARD/CustomerBehave?:embed=y&:toolbar=no"
                            className="tableau-iframe"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>
        </div>
    );
}

export default CustomerBehavior
