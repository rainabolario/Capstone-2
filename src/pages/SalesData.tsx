import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../css/SalesData.css";
import { AddOutlined, Inventory2Outlined, EditOutlined } from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import { Checkbox, Typography, Divider, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
  archived?: boolean;
}

interface SalesDataProps {
  onLogout?: () => void;
}

const SalesData: React.FC<SalesDataProps> = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const userRole = localStorage.getItem("userRole");

  const fetchData = async () => {
    // <CHANGE> Simplified query to fetch directly from flat raw_orders table
    const { data, error } = await supabase
      .from("raw_orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("[v0] Supabase fetch error:", error);
      return;
    }

    // <CHANGE> Direct mapping since raw_orders is already denormalized
    const formatted: SalesRecord[] = data.map((record: any) => ({
      id: record.id,
      name: record.name || "Unknown",
      time: record.time || "",
      date: record.date || "",
      day: record.day || "",
      item: record.item || "N/A",
      itemSize: record.item_size || "N/A",
      orderType: record.order_type || "N/A",
      quantity: record.quantity || 0,
      address: record.address || "",
      medium: record.medium_y || "N/A",
      mop: record.mop_y || "N/A",
      total: record.total_amount || 0,
      archived: record.archived || false,
    }));

    setSalesData(formatted);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "raw_orders" },
        fetchData
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "raw_orders" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleAddRecord = () => {
    if (userRole !== "Admin") return;
    navigate("/addrecord");
  };

  const handleArchiveRecord = async () => {
    if (userRole !== "Admin") {
      alert("Only Admins can archive records.");
      return;
    }

    if (selectedRecords.size === 0) {
      alert("Please select at least one record to archive.");
      return;
    }

    const idsToArchive = Array.from(selectedRecords);
    const { error } = await supabase
      .from("raw_orders")
      .update({ archived: true })
      .in("id", idsToArchive);

    if (error) {
      console.error("Error archiving records:", error);
      alert("Failed to archive records.");
    } else {
      alert("Selected records archived successfully!");
      setSelectedRecords(new Set());
      fetchData();
    }
  };

  const handleEditRecord = () => {
    if (userRole !== "Admin") {
      alert("Only Admins can edit records.");
      return;
    }

    if (selectedRecords.size === 1) {
      const editId = selectedRecords.values().next().value;
      const recordToEdit = salesData.find((record) => record.id === editId);
      if (recordToEdit) navigate(`/editrecord/${editId}`, { state: { record: recordToEdit } });
    } else {
      alert("Please select exactly one record to edit.");
    }
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  const filteredData = salesData
    .filter((record) => !record.archived)
    .filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const numSelected = selectedRecords.size;
  const rowCount = filteredData.length;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(filteredData.map((r) => r.id));
      setSelectedRecords(newSelected);
      return;
    }
    setSelectedRecords(new Set());
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="sales-data-container">
        <div className="header-section">
          <div className="header-left">
            <h1 className="page-title">SALES DATA</h1>
          </div>
        </div>
        <Typography variant="caption" sx={{ color: "gray", fontSize: "14px", mb: 1, mt: 1 }}>
          This contains a detailed list of all transactions. {userRole === "Admin" && "You can add, edit, or archive records as needed."}
        </Typography>
        <Divider />

        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="sales-search-button">
              <SearchIcon className="search-icon" />
            </button>
          </div>

          {userRole === "Admin" && (
            <div className="action-buttons">
              <Button
                variant="outlined"
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 25px",
                }}
                onClick={handleAddRecord}
                startIcon={<AddOutlined style={{ fontSize: 20 }} />}
              >
                Add Record
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 25px",
                }}
                onClick={handleArchiveRecord}
                startIcon={<Inventory2Outlined style={{ fontSize: 20 }} />}
                disabled={selectedRecords.size === 0}
              >
                Archive Record
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 25px",
                }}
                onClick={handleEditRecord}
                startIcon={<EditOutlined style={{ fontSize: 20 }} />}
                disabled={selectedRecords.size !== 1}
              >
                Edit Record
              </Button>
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                {userRole === "Admin" && (
                  <th>
                    <Checkbox
                      color="primary"
                      indeterminate={numSelected > 0 && numSelected < rowCount}
                      checked={rowCount > 0 && numSelected === rowCount}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Order Time</th>
                <th>Order Date</th>
                <th>Order Day</th>
                <th>Item</th>
                <th>Item Size</th>
                <th>Order Type</th>
                <th>Quantity</th>
                <th>Medium</th>
                <th>MOP</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr key={record.id}>
                    {userRole === "Admin" && (
                      <td>
                        <Checkbox
                          sx={{
                            color: "#9ca3af",
                            "&.Mui-checked": { color: "#EC7A1C" },
                          }}
                          checked={selectedRecords.has(record.id)}
                          onChange={() => toggleRecordSelection(record.id)}
                        />
                      </td>
                    )}
                    <td>{record.name}</td>
                    <td>{record.time}</td>
                    <td>{record.date}</td>
                    <td>{record.day}</td>
                    <td>{record.item}</td>
                    <td>{record.itemSize}</td>
                    <td>{record.orderType}</td>
                    <td>{record.quantity}</td>
                    <td>{record.medium}</td>
                    <td>{record.mop}</td>
                    <td>₱ {record.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesData;