import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/UserManage.css";
import { Checkbox, Button, Divider, Typography, TextField, Box, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { User2Icon } from "lucide-react";
import Register from "./Register";
import EditUserModal from "./EditAccount";
import { supabase } from "../supabaseClient";

interface UserManagementProps {
  onLogout?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff" | string;
  is_active?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [openRegister, setOpenRegister] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch only active users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true) // ✅ Only fetch active users
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setUsers(data as User[]);
      }
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      u.is_active !== false // ✅ Hide deactivated users
  );

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked)
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    else setSelectedUsers(new Set());
  };

  const handleOpenEditModal = () => {
    const selectedId = selectedUsers.values().next().value;
    const user = users.find((u) => u.id === selectedId);
    if (user) {
      setUserToEdit(user);
      setOpenEditModal(true);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setOpenEditModal(false);
    setUserToEdit(null);
    setSelectedUsers(new Set());
  };

  // ✅ Deactivate user(s)
  const handleDeactivateUser = async () => {
    if (selectedUsers.size === 0) return;

    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate the selected user(s)?"
    );
    if (!confirmDeactivate) return;

    const idsToDeactivate = Array.from(selectedUsers);

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .in("id", idsToDeactivate);

      if (error) throw error;

      // ✅ Update local state (remove deactivated users)
      setUsers((prev) => prev.filter((u) => !idsToDeactivate.includes(u.id)));

      setSelectedUsers(new Set());
      alert("User(s) deactivated successfully!");
    } catch (err) {
      console.error("Error deactivating users:", err);
      alert("Failed to deactivate user(s).");
    }
  };

  return (
    <div className="user-management-container">
      <Sidebar />
      <div className="user-management-content">
        <div className="header-section">
          <h2>USER MANAGEMENT</h2>
        </div>

        <Typography
          variant="caption"
          sx={{ color: "gray", fontSize: 14, mb: 1, mt: 1 }}
        >
          Manage all user profiles here. You can add, edit, or deactivate users
          as needed.
        </Typography>

        <Divider />

        {/* 🔍 Search + Buttons */}
        <div className="action-bar">
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
                "&.Mui-focused fieldset": {
                  borderColor: "#EC7A1C",
                },
              }
            }}
          />

          <div className="action-buttons">
            <Button
              variant="outlined"
              sx={{
                color: "black",
                border: "none",
                "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                padding: "8px 25px",
              }}
              startIcon={<User2Icon />}
              onClick={() => setOpenRegister(true)}
            >
              Add User
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "black",
                border: "none",
                "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                padding: "8px 25px",
              }}
              disabled={selectedUsers.size !== 1}
              startIcon={<EditIcon />}
              onClick={handleOpenEditModal}
            >
              Edit User
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "black",
                border: "none",
                "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
                padding: "8px 25px",
              }}
              disabled={selectedUsers.size === 0}
              startIcon={<DeleteIcon />}
              onClick={handleDeactivateUser}
            >
              Deactivate User
            </Button>
          </div>
        </div>

        {/* 🧾 User Table */}
        <Box sx={{ position: "relative", minHeight: "300px"}}>
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
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}>
              <CircularProgress sx={{ color: "#EC7A1C"}} />
              <Typography variant="body2" sx={{ color: "#EC7A1C", mt: 2 }}>
                Loading users...
              </Typography>
            </Box>
          )}

          <div className="users-table-container">
              {!loading && filteredUsers.length === 0 ? (
                <Typography sx={{ mt: 2, textAlign: "center"}}>No users found.</Typography>
              ) : !loading && filteredUsers.length > 0 ? (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>
                        <Checkbox
                          indeterminate={
                            selectedUsers.size > 0 &&
                            selectedUsers.size < filteredUsers.length
                          }
                          checked={
                            filteredUsers.length > 0 &&
                            selectedUsers.size === filteredUsers.length
                          }
                          onChange={handleSelectAll}
                          sx={{
                            color: "#9ca3af", 
                            "&.Mui-checked": {
                              color: "white", 
                            },
                            "&.MuiCheckbox-indeterminate": {
                              color: "white", 
                            },
                          }}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <Checkbox
                          sx={{
                            color: "gray",
                            "&.Mui-checked": {
                              color: "#EC7A1C", 
                            },
                          }}
                            checked={selectedUsers.has(u.id)}
                            onChange={() => handleSelectUser(u.id)}
                          />
                        </td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null }
          </div>
        </Box>
      </div>

      {/* Register Modal */}
      {openRegister && (
        <Register
          onClose={() => setOpenRegister(false)}
          onSubmit={(newUser: User) => {
            setUsers((prev) => [
              ...prev,
              { ...newUser, role: newUser.role as "Admin" | "Staff" },
            ]);
          }}
        />
      )}

      {/* Edit Modal */}
      {openEditModal && userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
