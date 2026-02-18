import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { getCreditor, updateCreditor } from "../../../api/Creditors/creditorsApi";
import { getSuppliers } from "../../../api/Suppliers/suppliersApi";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormState {
  supplier_id: string;
  amount: string;
}

export default function UpdateCreditorForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ supplier_id: "", amount: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await getSuppliers();
      return res;
    },
  });
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const c: any = await getCreditor(Number(id));
        const payload = c.data ?? c;
        setForm({ supplier_id: String(payload.supplier_id ?? ""), amount: String(payload.amount ?? "") });
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || "Failed to load creditor.");
        setErrorOpen(true);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.supplier_id) newErr.supplier_id = "Supplier is required";
    if (!form.amount) newErr.amount = "Amount is required";
    else if (isNaN(Number(form.amount))) newErr.amount = "Amount must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!validate()) return;
    try {
      const payload = { supplier_id: Number(form.supplier_id), amount: Number(form.amount) };
      await updateCreditor(Number(id), payload);

      // fetch updated creditor and replace in cache
      const fresh: any = await getCreditor(Number(id));
      const freshRes = fresh?.data ?? fresh;
      const freshData = freshRes?.data ?? freshRes;

      // normalize supplier_name using suppliers cache (if available)
      const suppliersMap: Record<string, any> = {};
      (suppliers || []).forEach((s: any) => { suppliersMap[String(s.id)] = s; });
      const normalized = {
        ...(freshData || {}),
        supplier_name: (freshData && (freshData.supplier_name || (freshData.supplier && freshData.supplier.name))) || (suppliersMap[String(freshData?.supplier_id)] && suppliersMap[String(freshData?.supplier_id)].name) || String(freshData?.supplier_id ?? ""),
      };

      queryClient.setQueryData(["creditors"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return old.map((x) => (Number(x.id) === Number(id) ? normalized : x));
        return [normalized];
      });
      queryClient.invalidateQueries({ queryKey: ["creditors"] });

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
        setErrorMessage("Failed to update creditor. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Update Creditor</Typography>

        <Stack spacing={2}>
          <TextField id="supplier_id" select label="Supplier" name="supplier_id" size="small" fullWidth value={form.supplier_id} onChange={handleChange} error={!!errors.supplier_id} helperText={errors.supplier_id}>
            <MenuItem value="">Select supplier</MenuItem>
            {(suppliers || []).map((s: any) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.name} — {s.email}</MenuItem>
            ))}
          </TextField>
          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Update Creditor</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Creditor has been updated successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
