import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/ArchivedData.css";
import { supabase } from "../supabaseClient";
import { Checkbox, Typography, Divider, Button } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
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
  medium: string;
  mop: string;
  total: number;
}

interface Props {
  fetchSalesData: () => Promise<void>; // passed from SalesData page
}

const ArchivedData: React.FC<Props> = ({ fetchSalesData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchArchived();

    // Realtime listener for other clients
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "broadcast",
        { event: "refresh_sales_data" },
        async () => {
          await fetchArchived();
          await fetchSalesData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Fetch archived records
  const fetchArchived = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_date,
        order_time,
        order_mode,
        total_amount,
        customers(name),
        medium:medium_id(name),
        mop:mop_id(name),
        order_items(
          id,
          quantity,
          subtotal,
          variant_id(
            id,
            menu_items(name),
            category_sizes(size)
          )
        )
      `)
      .eq("is_active", false)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching archived data:", error);
      setSalesData([]);
    } else {
      const formatted: SalesRecord[] = (data || []).flatMap((order: any) =>
        (order.order_items || []).map((item: any) => ({
          id: `${order.id}-${item.id}`,
          name: order.customers?.name || "N/A",
          time: order.order_time || "",
          date: order.order_date || "",
          day: order.order_date
            ? new Date(order.order_date).toLocaleDateString("en-US", { weekday: "long" })
            : "",
          item: item.variant_id?.menu_items?.name || "N/A",
          itemSize: item.variant_id?.category_sizes?.size || "N/A",
          orderType: order.order_mode || "N/A",
          quantity: item.quantity || 0,
          medium: order.medium?.name || "N/A",
          mop: order.mop?.name || "N/A",
          total: item.subtotal || order.total_amount || 0,
        }))
      );
      setSalesData(formatted);
    }

    setLoading(false);
  };

  // ✅ Toggle checkbox
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Restore archived records
  const handleRestore = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one record to restore.");
      return;
    }

    const orderIds = Array.from(
      new Set(selectedIds.map((id) => Number(id.split("-")[0])))
    );

    const { error } = await supabase
      .from("orders")
      .update({ is_active: true })
      .in("id", orderIds);

    if (error) {
      console.error("Error restoring records:", error);
      alert("Failed to restore records.");
    } else {
      alert("Records restored successfully!");
      setSelectedIds([]);

      // Refresh both tables
      await fetchArchived();
      await fetchSalesData();

      // Realtime broadcast
      await supabase.channel("orders-realtime").send({
        type: "broadcast",
        event: "refresh_sales_data",
        payload: { message: "records restored" },
      });
    }
  };

  // ✅ Filtered search
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
        <div className="archived-header-section">
          <div className="header-left">
            <h1 className="archived-page-title">ARCHIVED DATA</h1>
          </div>
        </div>

        <Typography
          variant="caption"
          sx={{ color: "gray", fontSize: "14px", mb: 1, mt: 1 }}
        >
          This contains all previously archived items. You can restore them to
          the sales data page.
        </Typography>
        <Divider />

        <div className="archived-action-bar">
          <div className="archived-search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="sales-search-button">
              <SearchIcon className="search-icon" />
            </button>
          </div>

          <Button
            variant="outlined"
            onClick={handleRestore}
            startIcon={<RestoreIcon />}
            sx={{
              color: "black",
              border: "none",
              padding: "8px 25px",
              "&:hover": {
                backgroundColor: "#ff8c42",
                color: "white",
              },
            }}
            disabled={userRole !== "Admin" || selectedIds.length === 0}
          >
            Restore Selected
          </Button>
        </div>

        <div className="archived-table-container">
          {loading ? (
            <p>Loading archived records...</p>
          ) : (
            <table className="archived-table">
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      sx={{
                        color: "#9ca3af",
                        "&.Mui-checked": { color: "white" },
                        "&.MuiCheckbox-indeterminate": { color: "white" },
                      }}
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredData.length
                      }
                      checked={
                        selectedIds.length === filteredData.length &&
                        filteredData.length > 0
                      }
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
                            color: "gray",
                            "&.Mui-checked": { color: "#ff8c42" },
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
                      <td>{record.medium}</td>
                      <td>{record.mop}</td>
                      <td>₱ {record.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center" }}>
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
