import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { getSupplierById, updateSupplier } from "../../../api/Suppliers/suppliersApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function UpdateSupplierForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ name: "", phone: "", email: "", address: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const c: any = await getSupplierById(Number(id));
        setForm({ name: c.name || "", phone: c.phone || "", email: c.email || "", address: c.address || "" });
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || "Failed to load supplier.");
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
    if (!form.name) newErr.name = "Name is required";
    if (!form.email) newErr.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErr.email = "Email is invalid";
    if (form.phone) {
      if (!/^\d{10,15}$/.test(form.phone)) {
        newErr.phone = "Phone must be 10 to 15 digits";
      }
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!validate()) return;
    try {
      const payload = { name: form.name, phone: form.phone || undefined, email: form.email, address: form.address || undefined };
      await updateSupplier(Number(id), payload);

      // fetch updated supplier and replace in cache
      const fresh: any = await getSupplierById(Number(id));
      queryClient.setQueryData(["suppliers"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return old.map((x) => (Number(x.id) === Number(id) ? fresh : x));
        return [fresh];
      });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });

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
        setErrorMessage("Failed to update supplier. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Update Supplier</Typography>

        <Stack spacing={2}>
          <TextField id="name" label="Name" name="name" size="small" fullWidth value={form.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
          <TextField id="phone" label="Phone" name="phone" type="tel" inputProps={{ maxLength: 15 }} size="small" fullWidth value={form.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} />
          <TextField id="email" label="Email" name="email" size="small" fullWidth value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
          <TextField id="address" label="Address" name="address" size="small" fullWidth value={form.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Update Supplier</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Supplier has been updated successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
