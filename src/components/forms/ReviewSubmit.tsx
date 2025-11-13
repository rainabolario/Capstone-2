import { Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import { Dayjs } from "dayjs";
import "../../css/ReviewSubmit.css";

// --- Interfaces ---
export interface Customer {
  name: string;
  date: Dayjs | null;
  time: Dayjs | null;
  paymentMode: string;
  orderMode: string;
}

interface OrderItem {
  category: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface Props {
  data: {
    customer: Customer;
    items: OrderItem[];
  };
}

// --- Component ---
export default function ReviewSubmit({ data }: Props) {
  const { customer, items } = data;

  // ✅ Totals
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalCategories = new Set(items.map((item) => item.category)).size;
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="review-submit-container">
      <h3>Review & Finalize</h3>
      <Divider />

      {/* --- Customer Info --- */}
      <h4>Customer Information</h4>
      <div className="customer-information-wrapper">
        <div className="customer-information-container">
          <div className="customer-fields-container">
            <div className="customer-labels">Name</div>
            <div className="customer-values">{customer.name}</div>
          </div>
        </div>
        <div className="customer-fields-container">
          <div className="customer-labels">Order Mode</div>
          <div className="customer-values">
            {customer.orderMode}
          </div>
        </div>
      </div>

      {/* --- Order Details --- */}
      <h4>Order Details</h4>
      <div className="order-details-wrapper">
        <div className="customer-fields-container">
          <div className="customer-labels">Order Date</div>
          <div className="customer-values">
            {customer.date ? customer.date.format("YYYY-MM-DD") : ""}
          </div>
        </div>
        <div className="customer-fields-container">
          <div className="customer-labels">Order Time</div>
          <div className="customer-values">
            {customer.time ? customer.time.format("HH:mm") : ""}
          </div>
        </div>
        <div className="customer-fields-container">
          <div className="customer-labels">Payment Mode</div>
          <div className="customer-values">{customer.paymentMode}</div>
        </div>
      </div>

      <Divider />

      {/* --- Order Items --- */}
      <h4>Order Items</h4>
      <List disablePadding>
        {items.map((item, i) => (
          <ListItem key={i} className="item-row">
            <ListItemText
              primary={item.name}
              secondary={`${item.category} • ${item.size}`}
            />
            <Typography className="item-qty">
              {item.qty} × ₱{item.price} = ₱{(item.qty * item.price).toFixed(2)}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* --- Summary --- */}
      <h4>Order Summary</h4>
      <div className="order-summary-wrapper">
        <div className="total-items">
          <p>Total Items</p>
          <p>{totalItems}</p>
        </div>
        <div className="total-categories">
          <p>Total Order Categories</p>
          <p>{totalCategories}</p>
        </div>
        <div className="total-amount">
          <p>Total Amount</p>
          <p>₱ {totalAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
