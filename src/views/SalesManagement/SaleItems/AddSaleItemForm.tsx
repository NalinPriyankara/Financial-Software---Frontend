import React, { useState, useMemo } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { createSaleItem } from "../../../api/SaleItems/saleItemsApi";
import { getSales } from "../../../api/Sales/salesApi";
import { getItems } from "../../../api/Items/itemsApi";

interface FormState {
  sale_id: string;
  item_id: string;
  quantity: string;
  price: string;
}

export default function AddSaleItemForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ sale_id: "", item_id: "", quantity: "1", price: "0" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { data: sales = [] } = useQuery<any>({ queryKey: ["sales"], queryFn: getSales });
  const { data: items = [] } = useQuery<any>({ queryKey: ["items"], queryFn: getItems });
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // when item is selected, auto-fill price from item's selling_price
    if (name === "item_id") {
      const list = Array.isArray(items) ? items : (items as any)?.data ?? [];
      const sel = list.find((it: any) => String(it.id) === String(value) || it.id === Number(value));
      const priceVal = sel ? String(sel.selling_price ?? sel.sellingPrice ?? "0") : "";
      setForm((p) => ({ ...p, [name]: value, price: priceVal }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const computedTotal = useMemo(() => {
    const q = Number(form.quantity || 0);
    const p = Number(form.price || 0);
    return Number((q * p).toFixed(2));
  }, [form.quantity, form.price]);

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.sale_id) newErr.sale_id = "Sale is required";
    if (!form.item_id) newErr.item_id = "Item is required";
    if (!form.quantity || isNaN(Number(form.quantity))) newErr.quantity = "Quantity is required and must be a number";
    if (!form.price || isNaN(Number(form.price))) newErr.price = "Price is required and must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { sale_id: Number(form.sale_id), item_id: Number(form.item_id), quantity: Number(form.quantity), price: Number(form.price), total: computedTotal };
      const res = await createSaleItem(payload as any);
      const created = res?.data ?? res;

      queryClient.setQueryData(["sale-items"], (old: any) => {
        if (!old) return [created];
        if (Array.isArray(old)) return [...old, created];
        if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
        return [created];
      });

      queryClient.invalidateQueries({ queryKey: ["sale-items"] });

      setOpen(true);
    } catch (err: any) {
      console.error(err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        const fieldErrors: Partial<FormState> = {};
        Object.entries(data.errors).forEach(([k, v]) => { (fieldErrors as any)[k] = Array.isArray(v) ? v.join(" ") : String(v); });
        setErrors((p) => ({ ...p, ...fieldErrors }));
      }
      if (data?.message && !data?.errors) { setErrorMessage(String(data.message)); setErrorOpen(true); }
      if (!data?.errors && !data?.message) { setErrorMessage("Failed to create sale item. Please try again."); setErrorOpen(true); }
    }
  };

  const salesList = Array.isArray(sales) ? sales : (sales as any)?.data ?? [];
  const itemsList = Array.isArray(items) ? items : (items as any)?.data ?? [];

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Sale Item</Typography>

        <Stack spacing={2}>
          <TextField id="sale_id" label="Sale" name="sale_id" size="small" select fullWidth value={form.sale_id} onChange={handleChange} error={!!errors.sale_id} helperText={errors.sale_id}>
            {salesList.map((s: any) => (<MenuItem key={s.id} value={String(s.id)}>{s.invoice_no}</MenuItem>))}
          </TextField>

          <TextField id="item_id" label="Item" name="item_id" size="small" select fullWidth value={form.item_id} onChange={handleChange} error={!!errors.item_id} helperText={errors.item_id}>
            {itemsList.map((it: any) => (<MenuItem key={it.id} value={String(it.id)}>{it.name}</MenuItem>))}
          </TextField>

          <TextField id="quantity" label="Quantity" name="quantity" type="number" inputProps={{ step: "1" }} size="small" fullWidth value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />

          <TextField id="price" label="Price" name="price" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.price} onChange={handleChange} error={!!errors.price} helperText={errors.price} />

          <TextField id="total" label="Total" name="total" type="number" size="small" fullWidth value={computedTotal.toFixed(2)} disabled />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 120 }}>Back</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "var(--pallet-blue)", width: isMobile ? "100%" : 160 }}>Add Item</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Sale item created successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
