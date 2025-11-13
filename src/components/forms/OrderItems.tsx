import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
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
  variant_id?: number;
}

interface Props {
  data: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}

type Category = { id: number; name: string };
type MenuItemData = { id: number; name: string; category_id: number };
type CategorySize = { id: number; size: string };

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
  const [customItemPrice, setCustomItemPrice] = useState<number | null>(null);
  const [hasSizes, setHasSizes] = useState(true);
  const [activePrice, setActivePrice] = useState<number | null>(null);

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category").select("id, name");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // --- FETCH MENU ITEMS AND SIZES ---
  useEffect(() => {
    if (!selectedCategoryId) {
      setMenuItems([]);
      setCategorySizes([]);
      return;
    }

    if (!isComplexCategory) {
      const fetchMenuItems = async () => {
        try {
          let categoryIdToUse = Number(selectedCategoryId);

          // If current category is PACKED MEAL, use FOOD TRAY category instead
          const currentCategory = categories.find(c => c.id === categoryIdToUse);
          if (currentCategory?.name?.toUpperCase() === "PACKED MEAL") {
            const { data: trayCategory } = await supabase
              .from("category")
              .select("id")
              .ilike("name", "FOOD TRAY")
              .maybeSingle();
            if (trayCategory?.id) categoryIdToUse = trayCategory.id;
          }

          const { data, error } = await supabase
            .from("menu_items")
            .select("id, name, category_id")
            .eq("category_id", categoryIdToUse);

          if (error) throw error;
          setMenuItems(data || []);
        } catch (err) {
          console.error("Error fetching menu items:", err);
          setMenuItems([]);
        }
      };

      fetchMenuItems();

    } else {
      const fetchMenuItems = async () => {
        const { data, error } = await supabase
          .from("menu_items")
          .select("id, name, category_id")
          .eq("category_id", selectedCategoryId);
        if (error) console.error("Error fetching menu items:", error);
        else setMenuItems(data || []);
      };
      fetchMenuItems();
    }

    if (hasSizes) {
      const fetchCategorySizes = async () => {
        try {
          const { data: items, error: itemsError } = await supabase
            .from("menu_items")
            .select("id")
            .eq("category_id", selectedCategoryId);
          if (itemsError) throw itemsError;

          const itemIds = items.map(i => i.id);

          const { data: variants, error: variantsError } = await supabase
            .from("menu_item_variants")
            .select("size_id")
            .in("menu_item_id", itemIds);
          if (variantsError) throw variantsError;

          const uniqueSizeIds = [...new Set(variants.map(v => v.size_id).filter(Boolean))];

          const { data: sizes, error: sizesError } = await supabase
            .from("category_sizes")
            .select("id, size")
            .in("id", uniqueSizeIds);
          if (sizesError) throw sizesError;

          setCategorySizes(sizes || []);
        } catch (err) {
          console.error("Error fetching sizes:", err);
          setCategorySizes([]);
        }
      };
      fetchCategorySizes();
    } else {
      setCategorySizes([]);
    }
  }, [selectedCategoryId, isComplexCategory, hasSizes]);

  // --- FETCH PRICE ---
  useEffect(() => {
    if (!selectedMenuItemId || (hasSizes && !selectedSizeId) || isComplexCategory) {
      setActivePrice(null);
      return;
    }

    const fetchRawMenuPrice = async () => {
      const menuName = menuItems.find(i => i.id === Number(selectedMenuItemId))?.name;
      if (!menuName) return;

      const { data: menuData, error } = await supabase
        .from("raw_menu")
        .select("price")
        .eq("category", Number(selectedCategoryId))
        .eq("name", menuName)
        .eq("size", hasSizes ? Number(selectedSizeId) : null)
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching raw menu price:", error);
        setActivePrice(null);
      } else if (menuData && menuData.price > 0) {
        setActivePrice(menuData.price);
      } else {
        setActivePrice(null);
      }
    };

    fetchRawMenuPrice();
  }, [selectedCategoryId, selectedMenuItemId, selectedSizeId, isComplexCategory, menuItems, hasSizes]);

  // --- HANDLE COMPLEX ITEM ---
  const handleComplexItemChange = (index: number, value: string) => {
    const newParts = [...complexItemParts];
    newParts[index] = value;
    setComplexItemParts(newParts);
  };

  const addComplexItemField = () => setComplexItemParts([...complexItemParts, ""]);
  const removeComplexItemField = (indexToRemove: number) => {
    if (complexItemParts.length <= 2) return;
    setComplexItemParts(complexItemParts.filter((_, idx) => idx !== indexToRemove));
  };
  const joinedComplexName = complexItemParts.map(p => p.trim()).filter(p => p).join(" + ");

  // --- HANDLE ADD ITEM ---
  const handleAdd = async () => {
    const category = categories.find(c => c.id === Number(selectedCategoryId));
    if (!category) return alert("Please select a category.");
    if (selectedQty < 1) return alert("Quantity must be at least 1.");

    const priceToUse = activePrice ?? customItemPrice;
    if (priceToUse == null || priceToUse <= 0) return alert("Please enter a price greater than 0.");

    let itemName = "";
    let variantId: number | undefined;

    try {
      if (isComplexCategory) {
        const parts = complexItemParts.map(p => p.trim()).filter(p => p);
        if (!parts.length) return alert("Please enter item parts.");

        const resolvedNames = parts
          .map(id => menuItems.find(i => i.id === Number(id))?.name)
          .filter((name): name is string => Boolean(name));

        if (resolvedNames.length === 0) return alert("Packed meal parts could not be resolved.");

        itemName = resolvedNames.join(" + ");

        let menuItemId: number;
        const { data: existingMenuItem } = await supabase
          .from("menu_items")
          .select("id")
          .eq("name", itemName)
          .maybeSingle();

        if (existingMenuItem && existingMenuItem.id) {
          menuItemId = existingMenuItem.id;
        } else {
          const { data: newMenuItem, error: newItemError } = await supabase
            .from("menu_items")
            .insert({ name: itemName, category_id: Number(selectedCategoryId) })
            .select("id")
            .single();
          if (newItemError || !newMenuItem) throw new Error("Failed to create menu item");
          menuItemId = newMenuItem.id;
        }

        if (category.name.toUpperCase().includes("PACKED MEAL")) {
          const { data: existingMeal } = await supabase
            .from("packed_meals")
            .select("id")
            .eq("name", itemName)
            .maybeSingle();

          let packedMealId: number;
          if (existingMeal && existingMeal.id) {
            packedMealId = existingMeal.id;
          } else {
            const { data: newMeal, error: mealError } = await supabase
              .from("packed_meals")
              .insert({ name: itemName })
              .select("id")
              .single();
            if (mealError || !newMeal) throw new Error("Failed to create packed meal");
            packedMealId = newMeal.id;
          }

          for (const partMenuItemId of parts) {
            const partIdNum = Number(partMenuItemId);
            if (!partIdNum) continue;

            const { data: partExists } = await supabase
              .from("menu_items")
              .select("id")
              .eq("id", partIdNum)
              .maybeSingle();

            if (!partExists || !partExists.id) continue;

            const { error: upsertError } = await supabase
              .from("packed_meal_items")
              .upsert([{ packed_meal_id: packedMealId, menu_item_id: partIdNum }], { onConflict: "packed_meal_id,menu_item_id" });

            if (upsertError) console.error("Failed to upsert packed_meal_items:", upsertError);
          }
        }

        const { data: existingVariant } = await supabase
          .from("menu_item_variants")
          .select("id")
          .eq("menu_item_id", menuItemId)
          .eq("size_id", hasSizes ? Number(selectedSizeId) : null)
          .maybeSingle();

        if (existingVariant && existingVariant.id) variantId = existingVariant.id;
        else {
          const { data: newVariant, error: variantError } = await supabase
            .from("menu_item_variants")
            .insert({
              menu_item_id: menuItemId,
              size_id: hasSizes ? Number(selectedSizeId) : null,
              price: priceToUse,
              is_active: true,
            })
            .select("id")
            .single();
          if (variantError || !newVariant) throw new Error("Failed to create variant");
          variantId = newVariant.id;
        }

        const newItem: OrderItem = {
          category: category.name,
          name: itemName,
          size: hasSizes ? categorySizes.find(s => s.id === Number(selectedSizeId))?.size || "N/A" : "N/A",
          qty: selectedQty,
          price: priceToUse,
          variant_id: variantId,
        };
        onChange([...data, newItem]);

      } else {
        const menuItem = menuItems.find(i => i.id === Number(selectedMenuItemId));
        if (!menuItem) return alert("Please select an item.");
        itemName = menuItem.name;

        const { data: existingVariant } = await supabase
          .from("menu_item_variants")
          .select("id")
          .eq("menu_item_id", menuItem.id)
          .eq("size_id", hasSizes ? Number(selectedSizeId) : null)
          .maybeSingle();

        if (existingVariant && existingVariant.id) variantId = existingVariant.id;
        else {
          const { data: newVariant, error: variantError } = await supabase
            .from("menu_item_variants")
            .insert({
              menu_item_id: menuItem.id,
              size_id: hasSizes ? Number(selectedSizeId) : null,
              price: priceToUse,
              is_active: true,
            })
            .select("id")
            .single();
          if (variantError || !newVariant) throw new Error("Failed to create variant");
          variantId = newVariant.id;
        }

        const newItem: OrderItem = {
          category: category.name,
          name: itemName,
          size: hasSizes ? categorySizes.find(s => s.id === Number(selectedSizeId))?.size || "N/A" : "N/A",
          qty: selectedQty,
          price: priceToUse,
          variant_id: variantId,
        };
        onChange([...data, newItem]);
      }

      setSelectedCategoryId("");
      setSelectedMenuItemId("");
      setSelectedSizeId("");
      setSelectedQty(1);
      setComplexItemParts(["", ""]);
      setCustomItemPrice(null);
      setIsComplexCategory(false);
      setHasSizes(true);
      setMenuItems([]);
      setCategorySizes([]);
      setActivePrice(null);

    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item. Check console for details.");
    }
  };

  const handleCategoryChange = async (e: SelectChangeEvent) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c.id === Number(categoryId));

    setSelectedCategoryId(categoryId);
    setSelectedMenuItemId("");
    setSelectedSizeId("");
    setComplexItemParts(["", ""]);
    setCustomItemPrice(0);
    setSelectedQty(1);

    const complex = category ? COMPLEX_CATEGORY_NAMES.includes(category.name) : false;
    const sizes = category ? !NO_SIZE_CATEGORIES.includes(category.name) : true;

    setIsComplexCategory(complex);
    setHasSizes(sizes);

    let categoryIdToUse = Number(categoryId);
    if (category?.name?.toUpperCase() === "PACKED MEAL") {
      const { data: trayCategory } = await supabase
        .from("category")
        .select("id")
        .ilike("name", "FOOD TRAY")
        .maybeSingle();
      if (trayCategory?.id) categoryIdToUse = trayCategory.id;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, category_id")
      .eq("category_id", categoryIdToUse);

    if (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
    } else {
      setMenuItems(data || []);
    }

    setCategorySizes([]);
  };

  const handleRemove = (idx: number) => onChange(data.filter((_, i) => i !== idx));

  const isNormalFlowInvalid =
    !selectedMenuItemId ||
    (hasSizes && !selectedSizeId) ||
    (activePrice === null && (customItemPrice === null || customItemPrice <= 0));

  const isComplexFlowInvalid =
    !joinedComplexName ||
    (activePrice === null && (customItemPrice === null || customItemPrice <= 0));

  return (
    <div className="order-items-container">
      <h3>Add Order Items</h3>
      <Divider sx={{ mb: 3 }} />

      <div className="order-item-fields">
        <div className="order-items-content">

          {/* Category */}
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name}
            value={categories.find(c => c.id === Number(selectedCategoryId)) || null}
            onChange={(_, newValue) => {
              handleCategoryChange({ target: { value: newValue?.id || "" } } as any);
            }}
            renderInput={(params) => <TextField {...params} label="Item Category" variant="outlined" fullWidth sx={{ mb: 2 }} />}
          />

          {/* Item Name / Complex Items */}
          {isComplexCategory ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {complexItemParts.map((part, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Autocomplete
                    options={menuItems}
                    getOptionLabel={(option) => option.name}
                    value={menuItems.find(i => i.id === Number(part)) || null}
                    onChange={(_, newValue) => handleComplexItemChange(index, newValue?.id.toString() || "")}
                    renderInput={(params) => <TextField {...params} label={`Item ${index + 1}`} variant="outlined" fullWidth />}
                    sx={{ flexGrow: 1 }} // Make it stretch
                  />

                  {index > 1 && (
                    <IconButton onClick={() => removeComplexItemField(index)} size="small">
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
                  "&:hover": { backgroundColor: "#ec7a1c", color: "white", borderColor: "#ec7a1c" },
                }}
              >
                Meal Item
              </Button>
            </Box>
          ) : (
            <Autocomplete
              options={menuItems}
              getOptionLabel={(option) => option.name}
              value={menuItems.find(i => i.id === Number(selectedMenuItemId)) || null}
              onChange={(_, newValue) => setSelectedMenuItemId(newValue?.id.toString() || "")}
              renderInput={(params) => <TextField {...params} label="Item Name" variant="outlined" fullWidth sx={{ mb: 2 }} />}
              disabled={!selectedCategoryId}
            />
          )}

          {/* Sizes and Quantity */}
          <div className="size-quantity-container">
            {hasSizes && (
              <FormControl component="fieldset" className="size-group" disabled={!selectedCategoryId}>
                <p>Size</p>
                <RadioGroup row value={selectedSizeId} onChange={e => setSelectedSizeId(e.target.value)} style={{ marginLeft: "24px" }}>
                  {categorySizes.map(s => <FormControlLabel key={s.id} value={s.id.toString()} control={<Radio />} label={s.size} />)}
                </RadioGroup>
              </FormControl>
            )}
            <TextField
              type="number"
              label="Quantity"
              value={selectedQty}
              onChange={e => setSelectedQty(Number(e.target.value))}
              sx={{ mb: 2, width: "30%" }}
              inputProps={{ min: 1 }}
              InputLabelProps={{ shrink: true }}
              disabled={!selectedCategoryId}
            />
          </div>

          {/* Price and Add Button */}
          <div className="price-button-container">
            <TextField
              type="number"
              label="Price per Item (₱)"
              placeholder="0"
              value={activePrice ?? (customItemPrice && customItemPrice > 0 ? customItemPrice : "")}
              onChange={(e) => {
                const val = e.target.value;
                setCustomItemPrice(val === "" ? null : Number(val));
              }}
              onFocus={(e) => {
                // clear field on first focus if value is 0
                if (e.target.value === "0") e.target.value = "";
              }}
              sx={{ mb: 2, width: "100%" }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
              disabled={activePrice !== null}
            />
            <Button
              variant={(isComplexCategory ? isComplexFlowInvalid : isNormalFlowInvalid) ? "outlined" : "contained"}
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAdd}
              sx={(isComplexCategory ? isComplexFlowInvalid : isNormalFlowInvalid)
                ? { borderColor: 'rgba(0,0,0,0.26)', color: 'rgba(0,0,0,0.26)' }
                : { backgroundColor: "#EC7A1C", "&:hover": { backgroundColor: "#d66c10" } }}
              disabled={isComplexCategory ? isComplexFlowInvalid : isNormalFlowInvalid}
            >
              {data.length === 0 ? "Add To Cart" : "Add Another Item"}
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
              <IconButton aria-label="delete" size="small" onClick={() => handleRemove(idx)} sx={{ position: "absolute", top: -5, right: -5, color: "rgba(0,0,0,0.54)" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <h5>{item.qty} × {item.name}</h5>
              <p>{item.category}</p>
              <p>{item.size}</p>
              <p>₱ {item.price} each</p>
              <p><strong>Subtotal: ₱ {item.price * item.qty}</strong></p>
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
}
