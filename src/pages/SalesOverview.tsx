import '../css/SalesOverview.css';
import Sidebar from '../components/Sidebar';
import type React from 'react';
import { Divider, Typography } from '@mui/material';

interface SalesOverviewProps {
    currentUser: string;
    onLogout: () => void;
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ onLogout }) => {
    return (
        <div className="overview-container">
            <Sidebar onLogout={onLogout} />
            <div className="overview-content">
                <div className="overview-header">
                    <h1>SALES OVERVIEW AND HISTORICAL DATA</h1>
                </div>
                <div className="helper-text">
                    <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb: 1, mt: 1 }}>
                        This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
                    </Typography>
                    <Divider />
                </div>
                    <div className='tableau-responsive-wrapper'>
                        <iframe
                            src="https://prod-apsoutheast-b.online.tableau.com/t/iambeastar-ed66b6ed6a/views/KCSKITCHENDASHBOARD/SalesOverview?:embed=y&:toolbar=no"
                            className="tableau-iframe"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>
            </div> 
    );
};

export default SalesOverview;
