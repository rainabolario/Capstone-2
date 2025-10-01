import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Divider } from '@mui/material';
import Sidebar from '../components/Sidebar';
import '../css/EditRecord.css';

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

const EditRecord: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); 

    const [record, setRecord] = useState<SalesRecord | null>(location.state?.record || null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (record) {
        setRecord({
            ...record,
            [name]: name === 'quantity' ? parseInt(value, 10) : value,
        });
        }
    };

    const handleSave = async () => {
        if (!record) return;
        console.log("Save Changes clicked");
        navigate(-1); // Go back to the previous page 
    };
    
    const handleCancel = () => {
        navigate(-1); // Go back without saving
    };

    if (!record) {
        return <p>Record not found.</p>;
    }

    return (
    <div className="edit-record-container">
        <Sidebar />
        <div className="edit-form-container">
            <h2>ORDER RECORD</h2>

            <div className="edit-form">
                <h3>Edit Order Record</h3>
                <Divider />
                <div className="edit-form-wrapper">
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Customer Name"
                        name="name"
                        value={record.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Date of Order"
                        name="date"
                        value={record.date}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="Time of Order"
                        name="time"
                        value={record.time}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="Day of Order"
                        name="day"
                        value={record.day}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Item"
                        name="item"
                        value={record.item}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="Item Size"
                        name="itemSize"
                        value={record.itemSize}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Order Type"
                        name="orderType"
                        value={record.orderType}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="Quantity"
                        name="quantity"
                        value={record.quantity}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Address"
                        name="address"
                        value={record.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-row">
                    <TextField
                        className="form-field"
                        label="Medium"
                        name="medium"
                        value={record.medium}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="MOP"
                        name="mop"
                        value={record.mop}
                        onChange={handleChange}
                    />
                    <TextField
                        className="form-field"
                        label="Total"
                        name="total"
                        value={record.total}
                        onChange={handleChange}
                    />
                </div>
                </div>
            </div>

            <div className="button-form-container">
                <Button
                    variant="outlined"
                    sx={{ 
                            color: 'gray',
                            borderColor: 'gray',
                            '&:hover': {
                                backgroundColor: '#EC7A1C',
                                color: 'white',
                                border: '1px solid #EC7A1C',
                            },
                            padding: '8px 25px',
                        }}
                    onClick={handleCancel}
                    >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    sx={{ 
                            color: 'white',
                            backgroundColor: '#EC7A1C',
                            '&:hover': {
                                backgroundColor: '#EC7A1C',
                                color: 'white',
                                border: 'none',
                            },
                            padding: '8px 25px',
                        }}
                    onClick={handleSave}
                >
                    Update Changes
                </Button>
            </div>
        </div>
    </div>
    );
};

export default EditRecord;