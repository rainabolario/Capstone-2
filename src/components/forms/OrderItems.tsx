import React, { useState, useEffect } from "react";
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
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [categorySizes, setCategorySizes] = useState<CategorySize[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const [isComplexCategory, setIsComplexCategory] = useState(false);
  const [complexItemParts, setComplexItemParts] = useState<string[]>(["", ""]);
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

    const selectedCategory = categories.find(
      (c) => c.id === Number(selectedCategoryId)
    );
    const categoryName = selectedCategory?.name || "";

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

    // ✅ Handle size logic
    if (hasSizes) {
      if (categoryName === "FROZEN DELIGHT") {
        // Directly set size options to Big and Small
        setCategorySizes([
          { id: 1, size: "BIG" },
          { id: 2, size: "SMALL" },
        ]);
      } else {
        // Otherwise, fetch from Supabase normally
        const fetchCategorySizes = async () => {
          const { data: items, error: itemsError } = await supabase
            .from("menu_items")
            .select("id")
            .eq("category_id", selectedCategoryId);

          if (itemsError) {
            console.error("Error getting item IDs for sizes:", itemsError);
            return;
          }
          const itemIds = items.map((i) => i.id);

          const { data: variants, error: variantsError } = await supabase
            .from("menu_item_variants")
            .select("size_id")
            .in("menu_item_id", itemIds);

          if (variantsError) {
            console.error("Error getting variants for sizes:", variantsError);
            return;
          }

          const uniqueSizeIds = [
            ...new Set(
              variants.map((v) => v.size_id).filter((id) => id !== null)
            ),
          ];

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
      }
    } else {
      setCategorySizes([]);
    }
  }, [selectedCategoryId, isComplexCategory, hasSizes, categories]);

  const handleComplexItemChange = (index: number, value: string) => {
    const newParts = [...complexItemParts];
    newParts[index] = value.toUpperCase();
    setComplexItemParts(newParts);
  };

  const addComplexItemField = () => {
    setComplexItemParts([...complexItemParts, ""]);
  };

  const removeComplexItemField = (indexToRemove: number) => {
    // Only allow removing fields if there are more than 2
    if (complexItemParts.length <= 2) return;
    const newParts = complexItemParts.filter(
      (_, index) => index !== indexToRemove
    );
    setComplexItemParts(newParts);
  };

  const joinedComplexName = complexItemParts
    .map((p) => p.trim()) // Get rid of whitespace
    .filter((p) => p) // Filter out empty strings
    .join(" + "); 

  const handleAdd = () => {
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
      if (!joinedComplexName) {
        alert("Please enter an item name.");
        return;
      }

      newItem = {
        category: category.name,
        name: joinedComplexName,
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
      if (hasSizes) {
        const size = categorySizes.find((s) => s.id === Number(selectedSizeId));
        if (!size) {
          alert("Please fill in all required fields: Size.");
          return;
        }
        sizeName = size.size;
      }

      newItem = {
        category: category.name,
        name: menuItem.name,
        size: sizeName,
        qty: selectedQty,
        price: customItemPrice,
      };
    }

    onChange([...data, newItem]);
    setSelectedCategoryId("");
    setSelectedMenuItemId("");
    setSelectedSizeId("");
    setSelectedQty(1);
    setComplexItemParts(["", ""]);
    setCustomItemPrice(0);
    setIsComplexCategory(false);
    setHasSizes(true);
    setMenuItems([]);
    setCategorySizes([]);
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c.id === Number(categoryId));

    setSelectedCategoryId(categoryId);
    setSelectedMenuItemId("");
    setSelectedSizeId("");
    setComplexItemParts(["", ""]);
    setCustomItemPrice(0);
    setSelectedQty(1);

    if (category && COMPLEX_CATEGORY_NAMES.includes(category.name)) {
      setIsComplexCategory(true);
    } else {
      setIsComplexCategory(false);
    }

    if (category && NO_SIZE_CATEGORIES.includes(category.name)) {
      setHasSizes(false);
    } else {
      setHasSizes(true);
    }
  };

  const handleItemChange = (e: SelectChangeEvent) => {
    setSelectedMenuItemId(e.target.value);
  };

  const handleRemove = (indexToRemove: number) => {
    const newData = data.filter((_, idx) => idx !== indexToRemove);
    onChange(newData);
  };

  const isNormalFlowInvalid =
    !selectedMenuItemId || (hasSizes && !selectedSizeId) || customItemPrice <= 0;
  const isComplexFlowInvalid = !joinedComplexName || customItemPrice <= 0;

  return (
    <div className="order-items-container">
      <h3>Add Order Items</h3>
      <Divider sx={{ mb: 3 }} />

      <div className="order-item-fields">
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
                if (!selected)
                  return <span style={{ color: "#9e9e9e" }}>Select category</span>;
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {complexItemParts.map((part, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <TextField
                    label={`Item ${index + 1}`}
                    value={part}
                    onChange={(e) =>
                      handleComplexItemChange(index, e.target.value)
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      mb: 1
                    }}
                  />
                  {index > 1 && (
                    <IconButton
                      onClick={() => removeComplexItemField(index)}
                      size="small"
                      aria-label="remove item part"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                onClick={addComplexItemField}
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{
                  alignSelf: "flex-start",
                  color: "#ec7a1c",
                  borderColor: "#ec7a1c",
                  padding: '6px 16px', 
                    "&:hover": { 
                      backgroundColor: "#ec7a1c",
                      color: "white",
                      borderColor: "#ec7a1c",
                    },
                 }}
              >
                Meal Item
              </Button>
            </Box>
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
                  if (!selected)
                    return <span style={{ color: "#9e9e9e" }}>Select item</span>;
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
            {(() => {
              const isButtonDisabled =
                !selectedCategoryId ||
                (isComplexCategory ? isComplexFlowInvalid : isNormalFlowInvalid);

              return (
                <Button
                  variant={isButtonDisabled ? "outlined" : "contained"}
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAdd}
                  sx={
                    isButtonDisabled
                      ? { 
                          borderColor: 'rgba(0, 0, 0, 0.26)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        } 
                      : {
                          backgroundColor: "#EC7A1C",
                          "&:hover": {
                            backgroundColor: "#d66c10",
                          },
                        }
                  }
                  disabled={isButtonDisabled}
                >
                  {data.length === 0 ? "Add To Cart" : "Add Another Item"}
                </Button>
              );
            })()}
          </div>
        </div>

        <Divider orientation="vertical" flexItem />

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
