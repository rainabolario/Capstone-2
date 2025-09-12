import "../css/SalesForecast.css"
import Sidebar from "../components/Sidebar"

interface SalesForecastProps {
  currentUser: string
  onLogout: () => void
}

const SalesForecast: React.FC<SalesForecastProps> = ({ }) => {
    return (
        <div className='forecast-container'>
            <Sidebar />
                <div className="forecast-content">
                    <div className="forecast-header">
                        <h1>SALES FORECAST</h1>
                    </div>
                    <div className="forecast-grid">
                        <div className="forecast-div1">
                            <div className="div1-content">Forecast of Total Sales</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="forecast-div2">
                            <div className="div2-content">Product Category</div>
                            <select defaultValue={"category1"} name="product-category1" id="product-category1">
                                <option value="category1">Category 1</option>
                                <option value="category2">Category 2</option>
                                <option value="category3">Category 3</option>
                            </select>
                        </div>
                        <div className="forecast-div3">
                            <div className="div3-content">Date Range</div>
                            <div className="date-range-container">
                                <input type="date" id="start-date" name="start-date" />
                                <span> to </span>
                                <input type="date" id="end-date" name="end-date" />
                            </div>
                        </div>
                        <div className="forecast-div4">
                            <div className="div4-content">Recommendations</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="forecast-div5-title">
                            <h3>Forecast by Category</h3>
                        </div>
                        <div className="forecast-div5">
                            <div className="div5-content">Product Category</div>
                            <select defaultValue={"category1"} name="product-category2" id="product-category2">
                                <option value="category1">Category 1</option>
                                <option value="category2">Category 2</option>
                                <option value="category3">Category 3</option>
                            </select>
                        </div>
                        <div className="forecast-div6-title">
                            <h3>Linear Regression Of Services</h3>
                        </div>
                        <div className="forecast-div6">
                            <div className="div6-content">Sales Category</div>
                            <select defaultValue={"category1"} name="sales-category" id="sales-category">
                                <option value="category1">Category 1</option>
                                <option value="category2">Category 2</option>
                                <option value="category3">Category 3</option>
                            </select>
                        </div>
                        <div className="forecast-div7">
                            <div className="div7-content">Food Trays</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        <div className="forecast-div8">
                            <div className="div8-content">Catering</div>
                            <div className="placeholder">Chart Placeholder</div>
                        </div>
                        </div>
                </div>
        </div>
    );
}

export default SalesForecast