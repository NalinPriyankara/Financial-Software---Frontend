import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { createStock } from "../../../api/Stocks/stocksApi";
import { getItems } from "../../../api/Items/itemsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormState {
  item_id: string;
  quantity: string;
}

export default function AddStockForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ item_id: "", quantity: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { data: items = [] } = useQuery<any>({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await getItems();
      return res;
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.item_id) newErr.item_id = "Item is required";
    if (!form.quantity || isNaN(Number(form.quantity))) newErr.quantity = "Quantity is required and must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { item_id: Number(form.item_id), quantity: Number(form.quantity) };
      const res = await createStock(payload as any);
      const created = res;

      queryClient.setQueryData(["stocks"], (old: any) => {
        if (!old) return [created];
        if (Array.isArray(old)) return [...old, created];
        if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
        return [created];
      });

      setOpen(true);
    } catch (err: any) {
      console.error(err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        const fieldErrors: Partial<FormState> = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          (fieldErrors as any)[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors((p) => ({ ...p, ...fieldErrors }));
      }
      if (data?.message && !data?.errors) {
        setErrorMessage(String(data.message));
        setErrorOpen(true);
      }
      if (!data?.errors && !data?.message) {
        setErrorMessage("Failed to create stock. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Stock</Typography>

        <Stack spacing={2}>
          <TextField id="item_id" label="Item" name="item_id" size="small" select fullWidth value={form.item_id} onChange={handleChange} error={!!errors.item_id} helperText={errors.item_id}>
            {(Array.isArray(items) ? items : (items as any)?.data ?? []).map((it: any) => (
              <MenuItem key={it.id} value={String(it.id)}>{it.name}</MenuItem>
            ))}
          </TextField>

          <TextField id="quantity" label="Quantity" name="quantity" type="number" size="small" fullWidth value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Stock</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Stock created successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
