import { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../css/OrderItems.css";
import { supabase } from "../../supabaseClient";

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

type Category = {
  id: number;
  name: string;
};

type MenuItemData = {
  id: number;
  name: string;
  category_id: number;
};

type CategorySize = {
  id: number;
  size: string;
};

const COMPLEX_CATEGORY_NAMES = ["PACKED MEAL"];
const NO_SIZE_CATEGORIES = ["PACKED MEAL", "STREET FOOD GRAZING CART"];

export default function OrderItems({ data, onChange }: Props) {
  // State to hold data fetched from Supabase
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [categorySizes, setCategorySizes] = useState<CategorySize[]>([]);

  // State for user selections
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const [isComplexCategory, setIsComplexCategory] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState(0);
  
  const [hasSizes, setHasSizes] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category").select("id, name");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setMenuItems([]);
      setCategorySizes([]);
      return;
    }

    if (!isComplexCategory) {
      const fetchMenuItems = async () => {
        const { data, error } = await supabase
          .from("menu_items")
          .select("id, name, category_id")
          .eq("category_id", selectedCategoryId);

        if (error) console.error("Error fetching menu items:", error);
        else setMenuItems(data || []);
      };
      fetchMenuItems();
    } else {
      setMenuItems([]); 
    }

    // Fetch category sizes
    if (hasSizes) {
      const fetchCategorySizes = async () => {
        // 1. Get all item IDs
        const { data: items, error: itemsError } = await supabase
          .from("menu_items")
          .select("id")
          .eq("category_id", selectedCategoryId);

        if (itemsError) {
          console.error("Error getting item IDs for sizes:", itemsError);
          return;
        }
        const itemIds = items.map((i) => i.id);

        // 2. Get all variants
        const { data: variants, error: variantsError } = await supabase
          .from("menu_item_variants")
          .select("size_id")
          .in("menu_item_id", itemIds);

        if (variantsError) {
          console.error("Error getting variants for sizes:", variantsError);
          return;
        }

        // 3. Get unique size IDs, filtering out NULLs
        const uniqueSizeIds = [
          ...new Set(variants.map((v) => v.size_id).filter((id) => id !== null)),
        ];

        // 4. Fetch size details
        const { data: sizes, error: sizesError } = await supabase
          .from("category_sizes")
          .select("id, size")
          .in("id", uniqueSizeIds);

        if (sizesError) {
          console.error("Error fetching size details:", sizesError);
        } else {
          const validSizes = (sizes || []).filter(
            (size) => size.size !== null && size.size !== "NULL"
          );
          setCategorySizes(validSizes);
        }
      };
      fetchCategorySizes();
    } else {
      setCategorySizes([]); 
    }
  }, [selectedCategoryId, isComplexCategory, hasSizes]); 

  const handleAdd = () => {
    // Find the selected category object
    const category = categories.find((c) => c.id === Number(selectedCategoryId));

    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (selectedQty < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (customItemPrice <= 0) {
      alert("Please enter a price greater than 0.");
      return;
    }

    let newItem: OrderItem;

    if (isComplexCategory) {
      if (!customItemName) {
        alert("Please enter an item name.");
        return;
      }

      newItem = {
        category: category.name,
        name: customItemName,
        size: "N/A",
        qty: selectedQty,
        price: customItemPrice,
      };
    } else {
      const menuItem = menuItems.find((i) => i.id === Number(selectedMenuItemId));

      if (!menuItem) {
        alert("Please fill in all required fields: Item Name.");
        return;
      }

      let sizeName = "N/A";

      // Only check for size if the category is supposed to have them
      if (hasSizes) {
        const size = categorySizes.find((s) => s.id === Number(selectedSizeId));
        if (!size) {
          alert("Please fill in all required fields: Size.");
          return;
        }
        sizeName = size.size;
      }

      // Build the OrderItem object
      newItem = {
        category: category.name,
        name: menuItem.name,
        size: sizeName, 
        qty: selectedQty,
        price: customItemPrice,
      };
    }

    onChange([...data, newItem]);

    // Reset form by clearing selections
    setSelectedCategoryId("");
    setSelectedMenuItemId("");
    setSelectedSizeId("");
    setSelectedQty(1);
    setCustomItemName("");
    setCustomItemPrice(0);
    setIsComplexCategory(false);
    setHasSizes(true); 
    setMenuItems([]);
    setCategorySizes([]);
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c.id === Number(categoryId));

    // Reset all fields
    setSelectedCategoryId(categoryId);
    setSelectedMenuItemId("");
    setSelectedSizeId("");
    setCustomItemName("");
    setCustomItemPrice(0);
    setSelectedQty(1);

    // Check if it's a complex (text input) category
    if (category && COMPLEX_CATEGORY_NAMES.includes(category.name)) {
      setIsComplexCategory(true);
    } else {
      setIsComplexCategory(false);
    }
    
    // Check if the category has sizes
    if (category && NO_SIZE_CATEGORIES.includes(category.name)) {
      setHasSizes(false);
    } else {
      setHasSizes(true);
    }
  };

  const handleItemChange = (e: SelectChangeEvent) => {
    setSelectedMenuItemId(e.target.value);
  };

  // Handle remove item from list
  const handleRemove = (indexToRemove: number) => {
    const newData = data.filter((_, idx) => idx !== indexToRemove);
    onChange(newData);
  };

  const isNormalFlowInvalid =
    !selectedMenuItemId || (hasSizes && !selectedSizeId) || customItemPrice <= 0;
  const isComplexFlowInvalid = !customItemName || customItemPrice <= 0;

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
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: "#9e9e9e" }}>Select category</span>;
                }
                const categoryName = categories.find(
                  (c) => c.id === Number(selected)
                )?.name;
                return categoryName || "";
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isComplexCategory ? (
            <TextField
              label="Item Name"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value.toUpperCase())}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="name-label" shrink>
                Item Name
              </InputLabel>
              <Select
                labelId="name-label"
                value={selectedMenuItemId}
                onChange={handleItemChange}
                disabled={!selectedCategoryId}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: "#9e9e9e" }}>Select item</span>;
                  }
                  const itemName = menuItems.find(
                    (i) => i.id === Number(selected)
                  )?.name;
                  return itemName || "";
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <div className="size-quantity-container">
            {hasSizes && (
              <FormControl
                component="fieldset"
                className="size-group"
                disabled={!selectedCategoryId}
              >
                <p>Size</p>
                <RadioGroup
                  row
                  value={selectedSizeId}
                  onChange={(e) => setSelectedSizeId(e.target.value)}
                  style={{ color: "black", marginLeft: "24px" }}
                >
                  {categorySizes.map((size) => (
                    <FormControlLabel
                      key={size.id}
                      value={size.id}
                      control={<Radio />}
                      label={size.size}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            <TextField
              type="number"
              label="Quantity"
              value={selectedQty}
              onChange={(e) => setSelectedQty(Number(e.target.value))}
              sx={{ mb: 2, width: "30%" }}
              inputProps={{ min: 1 }}
              InputLabelProps={{ shrink: true }}
              disabled={!selectedCategoryId}
            />
          </div>

          <div className="price-button-container">
            <TextField
              type="number"
              label="Price per Item (₱)"
              value={customItemPrice === 0 ? "" : customItemPrice}
              onChange={(e) => setCustomItemPrice(Number(e.target.value))}
              sx={{ mb: 2, width: "100%" }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
              disabled={!selectedCategoryId}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ borderColor: "#EC7A1C", color: "#EC7A1C" }}
              disabled={
                !selectedCategoryId ||
                (isComplexCategory ? isComplexFlowInvalid : isNormalFlowInvalid)
              }
            >
              Add Another Order
            </Button>
          </div>
        </div>

        <Divider orientation="vertical" flexItem />

        {/* Order List */}
        <div className="order-items-list">
          <h4>Order List</h4>
          {data.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              No items added yet.
            </Typography>
          )}
          {data.map((item, idx) => (
            <Box key={idx} sx={{ mb: 2, ml: 2, position: "relative" }}>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => handleRemove(idx)}
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
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