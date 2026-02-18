import React, { useMemo, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { createProductionItem } from "../../../api/ProductionItems/productionItemsApi";
import { getProductions } from "../../../api/Productions/productionsApi";
import { getItems } from "../../../api/Items/itemsApi";

interface FormState {
  production_id: string;
  item_id: string;
  quantity: string;
}

export default function AddProductionItemForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ production_id: "", item_id: "", quantity: "1" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { data: productions = [] } = useQuery<any>({ queryKey: ["productions"], queryFn: getProductions });
  const { data: items = [] } = useQuery<any>({ queryKey: ["items"], queryFn: getItems });
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
    if (!form.production_id) newErr.production_id = "Production is required";
    if (!form.item_id) newErr.item_id = "Item is required";
    if (!form.quantity || isNaN(Number(form.quantity))) newErr.quantity = "Quantity is required and must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { production_id: Number(form.production_id), item_id: Number(form.item_id), quantity: Number(form.quantity) };
      const res = await createProductionItem(payload as any);
      const created = res?.data ?? res;

      queryClient.setQueryData(["production-items"], (old: any) => {
        if (!old) return [created];
        if (Array.isArray(old)) return [...old, created];
        if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
        return [created];
      });

      queryClient.invalidateQueries({ queryKey: ["production-items"] });
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
      if (!data?.errors && !data?.message) { setErrorMessage("Failed to create production item. Please try again."); setErrorOpen(true); }
    }
  };

  const prodList = Array.isArray(productions) ? productions : (productions as any)?.data ?? [];
  const itemsList = Array.isArray(items) ? items : (items as any)?.data ?? [];

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Production Item</Typography>

        <Stack spacing={2}>
          <TextField id="production_id" label="Production" name="production_id" size="small" select fullWidth value={form.production_id} onChange={handleChange} error={!!errors.production_id} helperText={errors.production_id}>
            {prodList.map((p: any) => (<MenuItem key={p.id} value={String(p.id)}>{p.name ?? p.id}</MenuItem>))}
          </TextField>

          <TextField id="item_id" label="Item" name="item_id" size="small" select fullWidth value={form.item_id} onChange={handleChange} error={!!errors.item_id} helperText={errors.item_id}>
            {itemsList.map((it: any) => (<MenuItem key={it.id} value={String(it.id)}>{it.name}</MenuItem>))}
          </TextField>

          <TextField id="quantity" label="Quantity" name="quantity" type="number" inputProps={{ step: "1" }} size="small" fullWidth value={form.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 120 }}>Back</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "var(--pallet-blue)", width: isMobile ? "100%" : 160 }}>Add Item</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Production item created successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
