import React, { useMemo, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { createProductionItem, updateProductionItem } from "../../../api/ProductionItems/productionItemsApi";
import { createStock, updateStock } from "../../../api/Stocks/stocksApi";
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

      // check if a production-item for this production + item already exists
      const piCache = queryClient.getQueryData<any>(["production-items"]);
      const piList = Array.isArray(piCache) ? piCache : (piCache && (piCache as any).data) ? (piCache as any).data : [];
      const existingPI = (piList || []).find((p: any) => Number(p.production_id) === Number(payload.production_id) && Number(p.item_id) === Number(payload.item_id));

      let created: any = null;

      if (existingPI) {
        // update existing production-item by increasing quantity
        try {
          const newQty = Number(existingPI.quantity ?? 0) + Number(payload.quantity ?? 0);
          const resUpd = await updateProductionItem(existingPI.id, { production_id: payload.production_id, item_id: payload.item_id, quantity: newQty } as any);
          created = (resUpd as any)?.data ?? { ...(existingPI), quantity: newQty };

          // update cache for production-items
          queryClient.setQueryData(["production-items"], (old: any) => {
            if (!old) return [created];
            if (Array.isArray(old)) return old.map((p: any) => (p.id === existingPI.id ? created : p));
            if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.map((p: any) => (p.id === existingPI.id ? created : p)) };
            return old;
          });
        } catch (err: any) {
          console.error("Failed to update existing production-item:", err);
          const server = err?.response || err;
          const data = server?.data || err;
          if (data?.message) { setErrorMessage(String(data.message)); setErrorOpen(true); }
          else { setErrorMessage("Failed to update production item. Please try again."); setErrorOpen(true); }
          return;
        }
      } else {
        // create new production-item
        const res = await createProductionItem(payload as any);
        created = (res as any)?.data ?? res;

        // update production-items cache
        queryClient.setQueryData(["production-items"], (old: any) => {
          if (!old) return [created];
          if (Array.isArray(old)) return [...old, created];
          if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
          return [created];
        });
      }

      // Sync stocks: add the added quantity to stock (same for create or update case)
      try {
        const itemId = Number(payload.item_id);
        const qtyToAdd = Number(payload.quantity ?? 0);

        if (qtyToAdd <= 0) {
          // nothing to add
        } else {
          const stocksCache = queryClient.getQueryData<any>(["stocks"]);
          const stocksList = Array.isArray(stocksCache) ? stocksCache : (stocksCache && (stocksCache as any).data) ? (stocksCache as any).data : [];

          const existing = (stocksList || []).find((s: any) => Number(s.item_id) === itemId || Number(s.item?.id) === itemId);

          if (existing) {
            const newQty = Number(existing.quantity ?? 0) + qtyToAdd;
            try {
              await updateStock(existing.id, { item_id: itemId, quantity: newQty });
              // update cache
              queryClient.setQueryData(["stocks"], (old: any) => {
                const list = Array.isArray(old) ? old : (old && old.data) ? old.data : [];
                const updated = (list || []).map((s: any) => (s.id === existing.id ? { ...s, quantity: newQty } : s));
                if (Array.isArray(old)) return updated;
                return { ...(old || {}), data: updated };
              });
            } catch (err) {
              console.error("Failed to update existing stock:", err);
            }
          } else {
            try {
              const createdStockRes = await createStock({ item_id: itemId, quantity: qtyToAdd } as any);
              const createdStock = (createdStockRes as any)?.data ?? createdStockRes;
              queryClient.setQueryData(["stocks"], (old: any) => {
                if (!old) return [createdStock];
                if (Array.isArray(old)) return [...old, createdStock];
                if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, createdStock] };
                return [createdStock];
              });
            } catch (err) {
              console.error("Failed to create stock record:", err);
            }
          }
        }
      } catch (syncErr) {
        console.error("Stock sync error:", syncErr);
      }

      queryClient.invalidateQueries({ queryKey: ["production-items"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
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
