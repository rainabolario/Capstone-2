import React from "react";
import Sidebar from "../components/Sidebar";
import "../css/WhatIfAnalysis.css";
import { Divider, Typography } from "@mui/material";

interface WhatIfAnalysisProps {
  currentUser?: string;
  onLogout: () => void;
}

const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ onLogout }) => {
  return (
    <div className="whatif-container">
      <Sidebar onLogout={onLogout} />
      <div className="whatif-content">
        <div className="whatif-header">
          <h1>WHAT-IF ANALYSIS</h1>
        </div>

        <div className="helper-text">
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
              This dashboard provides an overview of what-if scenarios. Use the tools below to filter the presented data, and visualize what-if scenarios over time.
          </Typography>
          <Divider />
        </div>

        <div className="tableau-responsive-wrapper">
            <iframe
                src="https://prod-apsoutheast-b.online.tableau.com/t/rhicarhichelleflorescics-89b56ea568/views/051125_PDS/WHAT-IF?:embed=y&:toolbar=no"
                className="tableau-iframe"
                frameBorder="0"
            ></iframe>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
