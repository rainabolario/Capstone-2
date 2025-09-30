import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "../../css/OrderItems.css";

interface OrderItem {
  category: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface Props {
  data: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}

const categories = ["Food Trays", "Frozen Delights", "Others"];
const itemsByCategory: Record<string, string[]> = {
  "Food Trays": ["Kare Kare", "Bicol Express", "Adobo"],
  "Frozen Delights": ["Sinigang", "Caldereta"],
  "Others": ["Bagoong", "Sampelot"],
};
const sizes = ["Mini", "Small", "Salo Salo", "Fiesta"];

// 🔹 price list
const priceList: Record<string, number> = {
  "Kare Kare": 1200,
  "Bicol Express": 1000,
  "Adobo": 900,
  "Sinigang": 800,
  "Caldereta": 850,
  "Bagoong": 150,
  "Sampelot": 200,
};

export default function OrderItems({ data, onChange }: Props) {
  const [current, setCurrent] = useState<OrderItem>({
    category: "",
    name: "",
    size: "",
    qty: 1,
    price: 0,
  });

  const handleAdd = () => {
    if (!current.category || !current.name || !current.size) return;

    const price = priceList[current.name] || 0; // auto-assign price
    onChange([...data, { ...current, price }]);

    // reset form
    setCurrent({ category: "", name: "", size: "", qty: 1, price: 0 });
  };

  const updateField = (field: keyof OrderItem, value: string | number) => {
    setCurrent({ ...current, [field]: value });
  };

  return (
    <div className="order-items-container">
      <h3>Add Order Items</h3>
      <Divider sx={{ mb: 3 }} />

      <div className="order-item-fields">
        {/* --- Input Section --- */}
        <div className="order-items-content">
          {/* Category */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="cat-label" shrink>
              Item Category
            </InputLabel>
            <Select
              labelId="cat-label"
              value={current.category}
              onChange={(e: SelectChangeEvent) =>
                updateField("category", e.target.value)
              }
              displayEmpty
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span style={{ color: "#9e9e9e" }}>Select category</span>
                )
              }
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Item Name */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="name-label" shrink>
              Item Name
            </InputLabel>
            <Select
              labelId="name-label"
              value={current.name}
              onChange={(e: SelectChangeEvent) =>
                updateField("name", e.target.value)
              }
              disabled={!current.category}
              displayEmpty
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span style={{ color: "#9e9e9e" }}>Select item</span>
                )
              }
            >
              {(itemsByCategory[current.category] || []).map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Size + Quantity */}
          <div className="size-quantity-container">
            <FormControl component="fieldset" className="size-group">
              <p>Size</p>
              <RadioGroup
                row
                value={current.size}
                onChange={(e) => updateField("size", e.target.value)}
                style={{ color: "black", marginLeft: "24px" }}
              >
                {sizes.map((s) => (
                  <FormControlLabel
                    key={s}
                    value={s}
                    control={<Radio />}
                    label={s}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              type="number"
              label="Quantity"
              value={current.qty}
              onChange={(e) => updateField("qty", Number(e.target.value))}
              sx={{ mb: 2, width: "30%" }}
              inputProps={{ min: 1 }}
            />
          </div>

          {/* Add Button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ borderColor: "#EC7A1C", color: "#EC7A1C" }}
          >
            Add Another Order
          </Button>
        </div>

        <Divider orientation="vertical" flexItem />

        {/* --- Order List --- */}
        <div className="order-items-list">
          <h4>Order List</h4>
          {data.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              No items added yet.
            </Typography>
          )}
          {data.map((item, idx) => (
            <Box key={idx} sx={{ mb: 2, ml: 2 }}>
              <h5>
                {item.qty} × {item.name}
              </h5>
              <p>{item.category}</p>
              <p>{item.size}</p>
              <p>₱ {item.price} each</p>
              <p>
                <strong>Subtotal: ₱ {item.price * item.qty}</strong>
              </p>
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
}
