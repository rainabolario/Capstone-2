import "../css/SalesForecast.css"
import Sidebar from "../components/Sidebar"
import { Divider, Typography } from "@mui/material"

interface SalesForecastProps {
  currentUser: string
  onLogout: () => void
}

const SalesForecast: React.FC<SalesForecastProps> = ({ currentUser, onLogout }) => {
    return (
        <div className='forecast-container'>
            <Sidebar onLogout={onLogout} />
                <div className="forecast-content">
                    <div className="forecast-header">
                        <h1>SALES FORECAST</h1>
                    </div>
                    <div className="helper-text">
                    <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
                        This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
                    </Typography>
                    <Divider />
                    </div>
                    <div className="div1">
                        <div className="div1-content">Total Sales</div>
                        <iframe
                            src="https://prod-apsoutheast-b.online.tableau.com/t/iambeastar-ed66b6ed6a/views/KCSKITCHENDASHBOARD/SalesForecast?:embed=y&:toolbar=no"
                            width="1000"
                            height="800"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>
        </div>
    );
}

export default SalesForecast
