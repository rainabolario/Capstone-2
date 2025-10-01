import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/ArchivedData.css";
import { supabase } from "../supabaseClient";
import { 
  Checkbox,
  Typography,
  Divider,
  Button
} from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';

interface SalesRecord {
  id: string;
  name: string;
  time: string;
  date: string;
  day: string;
  item: string;
  itemSize: string;
  orderType: string;
  quantity: number;
  address: string;
  medium: string;
  mop: string;
  total: number;
}

const ArchivedData: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ✅ Fetch archived records from Supabase
  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        customers (
          name, unit, street, barangay, city, payment_mode, order_mode
        ),
        order_items (
          name, size, category, qty, price
        )
      `)
      .eq("archived", true); // ✅ only archived

    if (error) {
      console.error("Error fetching archived data:", error);
    } else {
      const formatted = data.map((order: any) => ({
        id: order.id,
        name: order.customers?.name || "",
        time: new Date(order.created_at).toLocaleTimeString(),
        date: new Date(order.created_at).toLocaleDateString(),
        day: new Date(order.created_at).toLocaleDateString("en-US", { weekday: "long" }),
        item: order.order_items?.map((i: any) => i.name).join(", ") || "",
        itemSize: order.order_items?.map((i: any) => i.size).join(", ") || "",
        orderType: order.order_items?.map((i: any) => i.category).join(", ") || "",
        quantity: order.order_items?.reduce((acc: number, i: any) => acc + (i.qty || 0), 0) || 0,
        address: `${order.customers?.unit || ""} ${order.customers?.street || ""} ${order.customers?.barangay || ""} ${order.customers?.city || ""}`.trim(),
        medium: order.customers?.order_mode || "", // ✅ reflect order_mode
        mop: order.customers?.payment_mode || "",
        total: order.total_amount || 0,
      }));
      setSalesData(formatted);
    }

    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // ✅ Toggle checkbox
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Restore selected records
  const handleRestore = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one record to restore.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ archived: false })
      .in("id", selectedIds);

    if (error) {
      console.error("Error restoring records:", error);
      alert("Failed to restore records.");
    } else {
      alert("Records restored successfully.");
      setSelectedIds([]);
      fetchArchived();
    }
  };

  const filteredData = salesData.filter((record) =>
    Object.values(record).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function onLogout(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onLogout={onLogout} />
      <div className="archived-data-container">
        {/* Header Section */}
        <div className="archived-header-section">
          <div className="header-left">
            <h1 className="archived-page-title">ARCHIVED DATA</h1>
          </div>
        </div>
        <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
          This contains all previously archived items. You can restore them to the sales data page.
        </Typography>
        <Divider />

        {/* Action Bar */}
        <div className="archived-action-bar">
          <div className="archived-search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="archived-search-input"
            />
            <button className="archived-search-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>

          <Button
            variant="outlined"
            onClick={handleRestore}
            startIcon={<RestoreIcon />}
            sx={{ 
              color: 'black',
              border: 'none',
              padding: '8px 25px',
                '&:hover': { 
                  backgroundColor: '#ff8c42', 
                  color: 'white',
                },
                '&.Mui-disabled': {
                  border: 'none', 
                }
              }} 
            disabled={selectedIds.length === 0}
          >
            Restore Selected
          </Button>
        </div>

        {/* Data Table */}
        <div className="archived-table-container">
          {loading ? (
            <p>Loading archived records...</p>
          ) : (
            <table className="archived-table">
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      color="primary"
                      indeterminate={selectedIds.length > 0 && selectedIds.length < filteredData.length}
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedIds(filteredData.map((r) => r.id))
                          : setSelectedIds([])
                      }
                    />
                  </th>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Item</th>
                  <th>Item Size</th>
                  <th>Order Type</th>
                  <th>Quantity</th>
                  <th>Address</th>
                  <th>Medium</th>
                  <th>MOP</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <Checkbox
                          sx={{ 
                            color: 'gray', 
                            '&.Mui-checked': { 
                              color: '#ff8c42' 
                            } 
                            }}
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelect(record.id)}
                        />
                      </td>
                      <td>{record.name}</td>
                      <td>{record.time}</td>
                      <td>{record.date}</td>
                      <td>{record.day}</td>
                      <td>{record.item}</td>
                      <td>{record.itemSize}</td>
                      <td>{record.orderType}</td>
                      <td>{record.quantity}</td>
                      <td>{record.address}</td>
                      <td>{record.medium}</td>
                      <td>{record.mop}</td>
                      <td>{record.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center" }}>
                      No archived records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivedData;
