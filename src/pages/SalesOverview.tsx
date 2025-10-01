import '../css/SalesOverview.css';
import Sidebar from '../components/Sidebar';
import type React from 'react';
import { Divider, Typography } from '@mui/material';

interface SalesOverviewProps {
    currentUser: string
    onLogout: () => void
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ currentUser, onLogout }) => {
    return (
        <div className='overview-container'>
            <Sidebar onLogout={onLogout} />
                <div className="overview-content">
                    <div className="overview-header">
                        <h1>SALES OVERVIEW AND HISTORICAL DATA</h1>
                    </div>
                    <div className="helper-text">
                    <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
                        This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
                    </Typography>
                    <Divider />
                    </div>

                    <div className="chart-grid">
                        <div className="div1">
                            <div className="div1-content">Total Sales</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div2">
                            <div className="div2-content">Total Orders</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div3">
                            <div className="div3-content">Total Customers</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div4">
                            <div className="div4-content">Date Range</div>
                            <div className="date-range-container">
                                <input type="date" id="start-date" name="start-date" />
                                <span> to </span>
                                <input type="date" id="end-date" name="end-date" />
                            </div>
                        </div>
                        <div className="div5">
                            <div className="div5-content">Product Category Filter</div>
                            <select defaultValue={"all"} className="category-select" id='category-select'>
                                <option value="all">All</option>
                                <option value="category1">Bicol Express</option>
                                <option value="category2">Kare Kare</option>
                            </select>
                        </div>
                        <div className="div6">
                            <div className="div6-content">Monthly Sales Trend</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div7">
                            <div className="div7-content">Sales by Category per Month</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div8">
                            <div className="div8-content">Year Over Year Sales</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="div9">
                            <div className="div9-content">Sales by Category</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        </div>
                </div>
        </div>
    );
}

export default SalesOverview;
