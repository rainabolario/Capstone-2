import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../css/SalesData.css";
import {
  AddOutlined,
  Inventory2Outlined,
  EditOutlined,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownloadOutlined,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import {
  Checkbox,
  Typography,
  Divider,
  Button,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Popover,
  Box,
} from "@mui/material";

interface SalesRecord {
  id: string;
  ordersId: string;
  name: string;
  time: string;
  date: string;
  day: string;
  item: string;
  itemSize: string;
  quantity: number;
  medium: string;
  mop: string;
  total: number;
  archived?: boolean;
}

const SalesData: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(0);
  const [filterYear, setFilterYear] = useState<string>("All");
  const [appliedFilterYear, setAppliedFilterYear] = useState<string>("All");
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  const pageSize = 100;
  const userRole = localStorage.getItem("userRole");

  // ============================================================
  // 🔹 Fetch all order_items in batches
  // ============================================================
  const fetchAllSales = async () => {
    try {
      setLoading(true);
      setProgress(0);

      const batchSize = 1000;
      let allRows: any[] = [];
      let from = 0;
      let to = batchSize - 1;

      while (true) {
        const { data, error, count } = await supabase
          .from("order_items")
          .select(
            `
            id,
            quantity,
            subtotal,
            orders (
              id,
              order_date,
              order_time,
              total_amount,
              medium:medium_id(name),
              mop:mop_id(name),
              customer:customer_id(name),
              is_active
            ),
            variant:variant_id (
              id,
              price,
              menu_item:menu_item_id (name),
              size:category_sizes(size)
            )
          `,
            { count: "exact" }
          )
          .order("id", { ascending: true })
          .range(from, to);

        if (error) {
          console.error("❌ Fetch error:", error);
          break;
        }

        if (!data || data.length === 0) break;

        allRows = allRows.concat(data);
        from += batchSize;
        to += batchSize;

        const totalCount = count || 72600;
        setProgress(Math.min((allRows.length / totalCount) * 100, 100));

        if (data.length < batchSize) break;
      }

      const formatted = allRows
        .filter((item) => item.orders?.is_active !== false)
        .map((item) => {
          const rawDate = item.orders?.order_date || "1970-01-01";
          let parsedDate = new Date(rawDate);
          if (isNaN(parsedDate.getTime())) parsedDate = new Date("1970-01-01");

          const pad = (n: number) => n.toString().padStart(2, "0");
          const dateStr = `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}`;
          const dayStr = parsedDate.toLocaleDateString("en-US", { weekday: "long" });

          let timeStr = item.orders?.order_time || "00:00:00";
          const timeParts = timeStr.split(":");
          if (timeParts.length === 3) {
            timeStr = `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}:${timeParts[2].padStart(2, "0")}`;
          } else {
            timeStr = "00:00:00";
          }

          return {
            id: item.id,
            ordersId: item.orders?.id || "",
            name: item.orders?.customer?.name || "N/A",
            date: dateStr,
            time: timeStr,
            day: dayStr,
            item: item.variant?.menu_item?.name || "N/A",
            itemSize: item.variant?.size?.size || "N/A",
            quantity: item.quantity || 0,
            medium: item.orders?.medium?.name || "N/A",
            mop: item.orders?.mop?.name || "N/A",
            total: Number(item.subtotal || item.orders?.total_amount || 0),
          };
        });

      formatted.sort((a, b) => {
        const dtA = new Date(`${a.date}T${a.time}`).getTime() || 0;
        const dtB = new Date(`${b.date}T${b.time}`).getTime() || 0;
        return dtB - dtA;
      });

      setSalesData(formatted);
      setProgress(100);
    } catch (err) {
      console.error("⚠️ Failed to fetch:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
  fetchAllSales();
  const channel = supabase
    .channel("realtime-orders")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchAllSales)
    .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, fetchAllSales)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}, []);


  const handleAddRecord = () => {
    if (userRole === "Admin") navigate("/addrecord");
  };

  const handleEditRecord = () => {
    if (userRole !== "Admin") {
      alert("Only Admins can edit records.");
      return;
    }

    if (selectedRecords.size !== 1) {
      alert("Please select exactly one record to edit.");
      return;
    }

    const selectedId = Array.from(selectedRecords)[0];
    const recordToEdit = salesData.find((r) => r.id === selectedId);
    if (!recordToEdit) return alert("Failed to find the selected record.");

    const composedId = `${recordToEdit.ordersId}-${recordToEdit.id}`;
    navigate(`/editrecord/${composedId}`, {
      state: { record: { ...recordToEdit, id: composedId } },
    });
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

    const orderIds = Array.from(selectedRecords)
      .map((id) => salesData.find((r) => r.id === id)?.ordersId)
      .filter(Boolean);

    const { error } = await supabase.from("orders").update({ is_active: false }).in("id", orderIds);
    if (error) {
      console.error("Error archiving:", error);
      alert("Failed to archive records.");
    } else {
      alert("Records archived successfully!");
      setSelectedRecords(new Set());
      fetchAllSales();
    }
  };

  // ============================================================
  // 🔹 Filters + Pagination
  // ============================================================
  const filteredData = salesData.filter((r) => {
    const matchesSearch = Object.values(r).some((v) =>
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesYear =
      appliedFilterYear === "All" || new Date(r.date).getFullYear().toString() === appliedFilterYear;
    return matchesSearch && matchesYear;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const from = page * pageSize;
  const to = Math.min(filteredData.length, from + pageSize - 1);
  const paginatedData = filteredData.slice(from, to + 1);
  const rowCount = filteredData.length;
  const uniqueYears = Array.from(new Set(salesData.map((r) => new Date(r.date).getFullYear()))).sort((a, b) => b - a);

  // ============================================================
  // 🔹 Generate CSV
  // ============================================================
  const generateCSV = () => {
    if (!filteredData.length) {
      alert("No data to export.");
      return;
    }

    const headers = ["Date", "Day", "Time", "Customer", "Item", "Size", "Qty", "Medium", "MOP", "Total"];
    const rows = filteredData.map((r) => [
      r.date,
      r.day,
      r.time,
      r.name,
      r.item,
      r.itemSize,
      r.quantity,
      r.medium,
      r.mop,
      r.total.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sales_report_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => setFilterAnchorEl(null);
  const isFilterOpen = Boolean(filterAnchorEl);

  // ============================================================
  // 🔹 Render
  // ============================================================
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
          Complete transaction details. {userRole === "Admin" && "Admins can manage all records."}
        </Typography>

        <Divider />

        {/* Action bar */}
        <div className="action-bar">
          <div className="search-filter-wrapper">
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "gray", mr: 1 }} />,
              }}
              sx={{
                flex: 1,
                maxWidth: 250,
                mr: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: "8px",
                  "&.Mui-focused fieldset": { borderColor: "#EC7A1C" },
                },
              }}
            />

            <Tooltip title="Show/Hide Filters" arrow placement="top">
              <IconButton
                onClick={handleFilterClick}
                sx={{
                  mr: 0.5,
                  color: "black",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Generate CSV Report" arrow placement="top">
              <IconButton
                onClick={generateCSV}
                sx={{
                  color: "black",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                }}
              >
                <FileDownloadOutlined />
              </IconButton>
            </Tooltip>
          </div>

          {userRole === "Admin" && (
            <div className="action-buttons">
              <Button
                variant="outlined"
                onClick={handleAddRecord}
                startIcon={<AddOutlined />}
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 20px",
                }}
              >
                Add Record
              </Button>

              <Button
                variant="outlined"
                onClick={handleEditRecord}
                startIcon={<EditOutlined />}
                disabled={selectedRecords.size !== 1}
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 25px",
                }}
              >
                Edit Record
              </Button>

              <Button
                variant="outlined"
                onClick={handleArchiveRecord}
                startIcon={<Inventory2Outlined />}
                disabled={selectedRecords.size === 0}
                sx={{
                  color: "black",
                  border: "none",
                  "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                  padding: "8px 25px",
                }}
              >
                Archive Record
              </Button>
            </div>
          )}
        </div>

        <Popover
          open={isFilterOpen}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={filterYear}
                label="Year"
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {uniqueYears.map((y) => (
                  <MenuItem key={y} value={y.toString()}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setAppliedFilterYear(filterYear);
                setPage(0);
                handleFilterClose();
              }}
              sx={{
                mr: 1,
                color: "#EC7A1C",
                borderColor: "#EC7A1C",
                "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
              }}
            >
              Apply Filter
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setFilterYear("All");
                setAppliedFilterYear("All");
                setPage(0);
                handleFilterClose();
              }}
              sx={{
                color: "#EC7A1C",
                borderColor: "#EC7A1C",
                "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
              }}
            >
              Clear Filter
            </Button>
          </Box>
        </Popover>

        <Box sx={{ position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderRadius: "8px",
              }}
            >
              <Typography variant="body2" sx={{ color: "#EC7A1C" }}>
                Loading all {salesData.length || "…"} records ({progress.toFixed(0)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#fcd5beff",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#EC7A1C" },
                  width: "70%",
                  maxWidth: "100%",
                  mt: 1,
                }}
              />
            </Box>
          )}

          {/* Table */}
          <div className="table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      sx={{
                        color: "#9ca3af",
                        "&.Mui-checked": { color: "white" },
                        "&.MuiCheckbox-indeterminate": { color: "white" },
                      }}
                      checked={
                        selectedRecords.size > 0 &&
                        selectedRecords.size === paginatedData.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecords(new Set(paginatedData.map((r) => r.id)));
                        } else {
                          setSelectedRecords(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Medium</th>
                  <th>MOP</th>
                  <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Checkbox
                      sx={{
                        color: "gray",
                        "&.Mui-checked": { color: "#EC7A1C" },
                      }}
                      checked={selectedRecords.has(r.id)}
                      onChange={(e) => {
                        const newSel = new Set(selectedRecords);
                        e.target.checked ? newSel.add(r.id) : newSel.delete(r.id);
                        setSelectedRecords(newSel);
                      }}
                    />
                  </td>
                  <td>{r.date}</td>
                  <td>{r.day}</td>
                  <td>{r.time}</td>
                  <td>{r.name}</td>
                  <td>{r.item}</td>
                  <td>{r.itemSize}</td>
                  <td>{r.quantity}</td>
                  <td>{r.medium}</td>
                  <td>{r.mop}</td>
                  <td>₱ {r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={12}>
                  <div className="pagination-container">
                    <span className="pagination-info">
                      Page {page + 1} of {totalPages}
                    </span>
                    <input
                      type="number"
                      className="pagination-input"
                      value={page + 1}
                      min={1}
                      max={totalPages}
                      onChange={(e) => {
                        const inputPage = Number(e.target.value);
                        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
                          setPage(inputPage - 1);
                        }
                      }}
                    />
                    <button
                      className="pagination-button"
                      disabled={page === 0}
                      onClick={() => setPage(0)}
                    >
                      ⏮
                    </button>
                    <button
                      className="pagination-button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    >
                      ←
                    </button>
                    <button
                      className="pagination-button"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    >
                      →
                    </button>
                    <button
                      className="pagination-button"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage(totalPages - 1)}
                    >
                      ⏭
                    </button>
                    <span className="pagination-summary">
                      {rowCount > 0
                        ? `Showing ${from + 1}-${Math.min(to + 1, rowCount)} of ${rowCount}`
                        : "No records"}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        </Box>
      </div>
    </div>
  );
};

export default SalesData;
