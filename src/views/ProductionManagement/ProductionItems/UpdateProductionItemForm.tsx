import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { getProductionItems, updateProductionItem } from "../../../api/ProductionItems/productionItemsApi";
import { getProductions } from "../../../api/Productions/productionsApi";
import { getItems } from "../../../api/Items/itemsApi";

export default function UpdateProductionItemForm() {
  const { id } = useParams();
  const itemId = Number(id);
  const { data: pis = [] } = useQuery<any>({ queryKey: ["production-items"], queryFn: getProductionItems });
  const { data: productions = [] } = useQuery<any>({ queryKey: ["productions"], queryFn: getProductions });
  const { data: items = [] } = useQuery<any>({ queryKey: ["items"], queryFn: getItems });
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

 

  useEffect(() => {
    const list = Array.isArray(pis) ? pis : (pis as any)?.data ?? [];
    const found = list.find((p: any) => Number(p.id) === itemId);
    if (found) {
      setForm({ production_id: String(found.production_id ?? ""), item_id: String(found.item_id ?? ""), quantity: String(found.quantity ?? "1") });
    }
  }, [pis, itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: any = {};
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
      await updateProductionItem(itemId, payload as any);

      try {
        const updated = { ...(payload as any), id: itemId };
        queryClient.setQueryData(["production-items"], (old: any) => {
          if (!old) return [updated];
          if (Array.isArray(old)) return old.map((p: any) => (p.id === itemId ? updated : p));
          if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.map((p: any) => (p.id === itemId ? updated : p)) };
          return old;
        });
      } catch (e) {
        console.warn("Failed optimistic update for production-items", e);
      }

      queryClient.invalidateQueries({ queryKey: ["production-items"] });
      setOpen(true);
    } catch (err: any) {
      console.error(err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        const fieldErrors: any = {};
        Object.entries(data.errors).forEach(([k, v]) => { (fieldErrors as any)[k] = Array.isArray(v) ? v.join(" ") : String(v); });
        setErrors((p: any) => ({ ...p, ...fieldErrors }));
      }
      if (data?.message && !data?.errors) { setErrorMessage(String(data.message)); setErrorOpen(true); }
      if (!data?.errors && !data?.message) { setErrorMessage("Failed to update production item. Please try again."); setErrorOpen(true); }
    }
  };

  const prodList = Array.isArray(productions) ? productions : (productions as any)?.data ?? [];
  const itemsList = Array.isArray(items) ? items : (items as any)?.data ?? [];

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Update Production Item</Typography>

        <Stack spacing={2}>
          <TextField id="production_id" label="Production" name="production_id" size="small" select fullWidth value={form.production_id || ""} onChange={handleChange} error={!!errors.production_id} helperText={errors.production_id}>
            {prodList.map((p: any) => (<MenuItem key={p.id} value={String(p.id)}>{p.name ?? p.id}</MenuItem>))}
          </TextField>

          <TextField id="item_id" label="Item" name="item_id" size="small" select fullWidth value={form.item_id || ""} onChange={handleChange} error={!!errors.item_id} helperText={errors.item_id}>
            {itemsList.map((it: any) => (<MenuItem key={it.id} value={String(it.id)}>{it.name}</MenuItem>))}
          </TextField>

          <TextField id="quantity" label="Quantity" name="quantity" type="number" inputProps={{ step: "1" }} size="small" fullWidth value={form.quantity || ""} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 120 }}>Back</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "var(--pallet-blue)", width: isMobile ? "100%" : 160 }}>Update Item</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Production item updated successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
