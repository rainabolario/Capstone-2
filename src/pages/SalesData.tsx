import React, { useState, useEffect } from "react"; 
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../css/SalesData.css";
import { AddOutlined, Inventory2Outlined, EditOutlined } from "@mui/icons-material";
import { supabase } from "../supabaseClient";

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

const SalesData: React.FC<SalesDataProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  // 🔹 Fetch data from Supabase
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        archived,
        customers (
          name, unit, street, barangay, city, order_mode, payment_mode
        ),
        order_items (
          name, size, category, qty, price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    // Flatten orders and include archived flag
    const formatted: SalesRecord[] = data.flatMap((order: any) =>
      order.order_items.map((item: any) => ({
        id: order.id, // ✅ Use the UUID directly
        name: order.customers?.name || "Unknown",
        time: new Date(order.created_at).toLocaleTimeString(),
        date: new Date(order.created_at).toLocaleDateString(),
        day: new Date(order.created_at).toLocaleDateString("en-US", { weekday: "long" }),
        item: item.name,
        itemSize: item.size,
        orderType: item.category,
        quantity: item.qty,
        address: `${order.customers?.unit || ""} ${order.customers?.street || ""}, ${order.customers?.barangay || ""}, ${order.customers?.city || ""}`,
        medium: order.customers?.order_mode || "", // ✅ Shows the actual order_mode
        mop: order.customers?.payment_mode || "",
        total: item.price * item.qty,
        archived: order.archived || false,
      }))
    );

    setSalesData(formatted);
  };

  useEffect(() => {
    fetchData();

    // 🔹 Real-time subscription (INSERT & UPDATE)
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, fetchData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRecord = () => {
    navigate("/addrecord");
  };

  // 🔹 Archive selected records
  const handleArchiveRecord = async () => {
    if (selectedRecords.size === 0) {
      alert("Please select at least one record to archive.");
      return;
    }

    const idsToArchive = Array.from(selectedRecords); // ✅ Send UUIDs directly

    const { error } = await supabase
      .from("orders")
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
    console.log("Edit Record clicked");
  };

  // 🔹 Toggle selection by UUID only
  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // 🔹 Filtered rows (exclude archived & search)
  const filteredData = salesData
    .filter((record) => !record.archived)
    .filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="sales-data-container">
        <div className="header-section">
          <div className="header-left">
            <h1 className="page-title">SALES DATA</h1>
          </div>
        </div>

        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleAddRecord}>
              <AddOutlined style={{ fontSize: 20 }} /> Add Record
            </button>
            <button className="btn btn-secondary" onClick={handleArchiveRecord}>
              <Inventory2Outlined style={{ fontSize: 20 }} /> Archive Record
            </button>
            <button className="btn btn-secondary" onClick={handleEditRecord}>
              <EditOutlined style={{ fontSize: 20 }} /> Edit Record
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredData.length > 0 &&
                      filteredData.every(r => selectedRecords.has(r.id))
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedRecords(new Set(filteredData.map(r => r.id)))
                        : setSelectedRecords(new Set())
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
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => toggleRecordSelection(record.id)}
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
