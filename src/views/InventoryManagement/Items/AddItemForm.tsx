import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { createItem } from "../../../api/Items/itemsApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

const CATEGORY_OPTIONS = ["pcs", "kg", "box", "other"];

interface FormState {
  name: string;
  category: string;
  unit: string;
  selling_price: string;
}

export default function AddItemForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ name: "", category: "", unit: "", selling_price: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.name) newErr.name = "Name is required";
    if (!form.category) newErr.category = "Category is required";
    if (!form.unit) newErr.unit = "Unit is required";
    if (!form.selling_price || isNaN(Number(form.selling_price))) newErr.selling_price = "Selling price is required and must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { name: form.name, category: form.category, unit: form.unit, selling_price: Number(form.selling_price) };
      const res = await createItem(payload as any);
      const created = res;

      queryClient.setQueryData(["items"], (old: any) => {
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
        setErrorMessage("Failed to create item. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Item</Typography>

        <Stack spacing={2}>
          <TextField id="name" label="Name" name="name" size="small" fullWidth value={form.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />

          <TextField id="category" label="Category" name="category" size="small" fullWidth value={form.category} onChange={handleChange} error={!!errors.category} helperText={errors.category} />

          <TextField id="unit" label="Unit" name="unit" size="small" select fullWidth value={form.unit} onChange={handleChange} error={!!errors.unit} helperText={errors.unit}>
            {CATEGORY_OPTIONS.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField>

          <TextField id="selling_price" label="Selling Price" name="selling_price" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.selling_price} onChange={handleChange} error={!!errors.selling_price} helperText={errors.selling_price} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Item</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Item created successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
