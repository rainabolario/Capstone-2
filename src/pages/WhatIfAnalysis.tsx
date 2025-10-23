import React from "react";
import Sidebar from "../components/Sidebar";
import "../css/WhatIfAnalysis.css";
import { Divider, Typography } from "@mui/material";

interface WhatIfAnalysisProps {
  currentUser?: string;
  onLogout: () => void;
}

const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="whatif-container">
      <Sidebar onLogout={onLogout} />
      <div className="whatif-content">
        <div className="whatif-header">
          <h1>WHAT-IF ANALYSIS</h1>
        </div>

        <div className="helper-text">
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
              This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
          </Typography>
          <Divider />
        </div>

        <div className="tableau-responsive-wrapper">
            <iframe
                src="https://prod-apsoutheast-b.online.tableau.com/t/iambeastar-ed66b6ed6a/views/KCSKITCHENDASHBOARD/WhatIf?:embed=y&:toolbar=no"
                className="tableau-iframe"
                frameBorder="0"
            ></iframe>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
