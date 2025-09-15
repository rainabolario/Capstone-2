import { Typography, List, ListItem, ListItemText } from "@mui/material";
import { Dayjs } from "dayjs";
import "../../css/ReviewSubmit.css";
import { Divider } from "@mui/material";

interface Customer {
  name: string;
  unit: string;
  street: string;
  barangay: string;
  city: string;
  date: Dayjs | null;
  time: Dayjs | null;
  paymentMode: string;
}

interface OrderItem {
  category: string;
  name: string;
  size: string;
  qty: number;
}

interface Props {
  data: {
    customer: Customer;
    items: OrderItem[];
  };
}

export default function ReviewSubmit({ data }: Props) {
  const { customer, items } = data;
  return (
    <div className="review-submit-container">
      <h3>Review & Finalize</h3>
      <Divider />
      <h4>Customer Information</h4>
      <div className="customer-information-wrapper">
      <div className="customer-information-container">
      <div className="customer-fields-container">
        <div className="customer-labels">Name</div>
        <div className="customer-values">{customer.name}</div>
      </div>
      <div className="customer-fields-container"> 
        <div className="customer-labels">Address</div>
        <div className="customer-values">{`${customer.unit}, ${customer.street}, ${customer.barangay}, ${customer.city}`}</div>
      </div>
      </div>
      <div className="customer-fields-container">
        <div className="customer-labels">Medium</div>
        <div className="customer-values">----</div>
      </div>
      </div>

      <h4>Order Details</h4>
      <div className="order-details-wrapper">
      <div className="customer-fields-container">
        <div className="customer-labels">Order Date</div>
        <div className="customer-values">{customer.date ? customer.date.format("YYYY-MM-DD") : ""}</div>
      </div>
      <div className="customer-fields-container">
        <div className="customer-labels">Order Time</div>
        <div className="customer-values">{customer.time ? customer.time.format("HH:mm") : ""}</div>
      </div>
      <div className="customer-fields-container">
        <div className="customer-labels">Payment Mode</div>
        <div className="customer-values">{customer.paymentMode}</div>
      </div>
      </div>
      
      <Divider />

      <h4>Order Items</h4>
      <List disablePadding>
          {items.map((item, i) => (
            <ListItem key={i} className="item-row">
              <ListItemText
                primary={`${item.name} `}
                secondary={`${item.category} • ${item.size}`}
              />
              <Typography className="item-qty">Qty: {item.qty}</Typography>
            </ListItem>
          ))}
        </List>
      <Divider />

      <h4>Order Summary</h4>
      <div className="order-summary-wrapper">
          <div className="total-items">
            <p>Total Items</p>
            <p>0</p>
          </div>
          <div className="total-categories">
            <p>Total Order Categories</p>
            <p>0</p>
          </div>
          <div className="total-amount">
            <p>Total Amount</p>
            <p>₱ 0.00</p>
          </div>
      </div>
    </div>
  );
}
