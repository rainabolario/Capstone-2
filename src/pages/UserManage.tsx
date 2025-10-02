import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/UserManage.css";
import { Checkbox, Button, Divider, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { User2Icon } from "lucide-react";
import Register from "./Register";
import EditUserModal from "./EditAccount";
import { supabase } from "../supabaseClient";

interface User {
  id: string;           
  name: string;
  email: string;
  role: "Admin" | "Staff" | string;
}


const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [openRegister, setOpenRegister] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").order("name", { ascending: true });
    if (error) console.error("Error fetching users:", error);
    else setUsers(data as User[]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
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
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setOpenEditModal(false);
    setUserToEdit(null);
    setSelectedUsers(new Set());
  };

  return (
    <div className="user-management-container">
      <Sidebar />
      <div className="user-management-content">
        <h2>USER MANAGEMENT</h2>
        <Typography variant="caption" sx={{ color: "gray", fontSize: 14, mb: 1, mt: 1 }}>
          Manage all user profiles here. You can add, edit, or delete users as needed.
        </Typography>
        <Divider />

        <div className="action-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <SearchIcon className="search-icon" />
          </div>
          <div className="buttons-container">
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
                "&.Mui-disabled": { border: "none" },
                padding: "8px 25px",
              }}
              disabled={selectedUsers.size === 0}
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
                "&.Mui-disabled": { border: "none" },
                padding: "8px 25px",
              }}
              disabled={selectedUsers.size === 0}
              startIcon={<DeleteIcon />}
            >
              Delete User
            </Button>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    color="primary"
                    indeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length}
                    checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                    onChange={handleSelectAll}
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
                      color="primary"
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
        </div>
      </div>

      {openRegister && (
        <Register
          onClose={() => setOpenRegister(false)}
          onSubmit={(newUser) => { setUsers((prev) => [
                ...prev,
                { ...newUser, role: newUser.role as "Admin" | "Staff" } 
            ]);
            }}
        />
      )}

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