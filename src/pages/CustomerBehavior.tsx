import "../css/CustomerBehavior.css"
import Sidebar from "../components/Sidebar"

interface CustomerBehaviorProps {
  currentUser: string
  onLogout: () => void
}

const CustomerBehavior: React.FC<CustomerBehaviorProps> = ({}) => {
    return (
        <div className='forecast-container'>
            <Sidebar />
                <div className="behavior-content">
                    <div className="behavior-header">
                        <h1>CUSTOMER BEHAVIOR AND TRENDS</h1>
                    </div>
                    <div className="behavior-grid">
                        <div className="behavior-div1">
                            <div className="div1-content">Churn Rate</div>
                        </div>
                        <div className="behavior-div2">
                            <div className="div2-content">Total Customers</div>
                        </div>
                        <div className="behavior-div3">
                            <div className="div3-content">Total Churned Customers</div>
                        </div>
                        <div className="behavior-div4">
                            <div className="div4-content">Order Channel</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div5">
                            <div className="div5-content">Order Frequency Segments</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div6">
                            <div className="div6-content">Monthly Customer Churn Rate</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div7">
                            <div className="div7-content">Average Order Value Trend</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div8">
                            <div className="div8-content">Repeat vs One-Time Customers</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div9">
                            <div className="div9-content">Purchase Timing Day of the Week</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="behavior-div10">
                            <div className="div10-content">Purchase Timing Hour of the Day</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        </div>
                </div>
        </div>
    );
}

export default CustomerBehavior
