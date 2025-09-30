import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/UserManage.css";
import { Checkbox, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { User2Icon } from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Staff';
    password?: string; 
    }

    const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

    useEffect(() => {
        const initialUsers: User[] = [
        { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Admin" },
        { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "Staff" },
        { id: 3, name: "Peter Jones", email: "peter.jones@example.com", role: "Staff" },
        ];
        setUsers(initialUsers);
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUsers(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        return newSelected;
        });
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
        const allUserIds = new Set(filteredUsers.map(u => u.id));
        setSelectedUsers(allUserIds);
        } else {
        setSelectedUsers(new Set());
        }
    };

    const numSelected = selectedUsers.size;
    const rowCount = filteredUsers.length;

    return (
        <div className="user-management-container">
        <Sidebar />
        <div className="user-management-content">
            <h2>USER MANAGEMENT</h2>

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
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: '#EC7A1C',
                                color: 'white',
                            },
                            padding: '8px 25px',
                        }}
                        startIcon={<User2Icon />}
                    >
                        Add User
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ 
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: '#EC7A1C',
                                color: 'white',
                            },
                            '&.Mui-disabled': {
                                border: 'none', 
                            },
                            padding: '8px 25px',
                        }}
                        disabled={numSelected === 0}
                        startIcon={<EditIcon />}
                    >
                        Edit User
                    </Button>
                    <Button 
                        variant="outlined" 
                        sx={{ 
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: '#EC7A1C',
                                color: 'white',
                            },
                            '&.Mui-disabled': {
                                border: 'none', 
                            },
                            padding: '8px 25px',
                        }}
                        disabled={numSelected === 0}
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
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={handleSelectAll}
                    />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Password</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                    <td>
                        <Checkbox
                        color="primary"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>********</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
};

export default UserManagement;