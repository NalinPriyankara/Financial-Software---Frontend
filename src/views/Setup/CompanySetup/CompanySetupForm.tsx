import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Grid,
  FormHelperText,
} from "@mui/material";
import theme from "../../../theme";
import { createCompany, getCompanies } from "../../../api/CompanySetup/CompanySetupApi";
import { useNavigate } from "react-router";
import ErrorModal from "../../../components/ErrorModal";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";

interface CompanyFormData {
  name: string;
  address: string;
  phone_number: string;
  fax_number?: string;
  email_address: string;
  official_company_number: string;
  company_website: string;
  GSTNo: string;
  home_currency: string;
  annual_turnover_estimate: string;
  company_logo?: File | null;
  delete_company_logo?: boolean;
  company_logo_on_views?: boolean;
  owner_name: string;
  owner_email: string;
  owner_telephone: string;

  fiscal_year: string;
  tax_periods?: number;
  tax_last_period?: number;
  no_of_workers: number;
  business_type: string;
  company_brief: string;
}

export default function CompanySetupForm() {
  // Default lists to avoid relying on external map data
  const defaultCurrencies = [
    { id: "USD", currency_name: "USD" },
    { id: "EUR", currency_name: "EUR" },
  ];

  const defaultFiscalYears = [
    { id: "1", fiscal_year_from: "2024-01-01", fiscal_year_to: "2024-12-31", closed: true },
    { id: "2", fiscal_year_from: "2025-01-01", fiscal_year_to: "2025-12-31", closed: true },
    { id: "3", fiscal_year_from: "2026-01-01", fiscal_year_to: "2026-12-31", closed: false },
  ];

  const navigate = useNavigate();

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    address: "",
    phone_number: "",
    fax_number: "",
    email_address: "",
    official_company_number: "",
    company_website: "",
    GSTNo: "",
    home_currency: defaultCurrencies[0].id,
    annual_turnover_estimate: "",
    company_logo: null,
    delete_company_logo: false,
    company_logo_on_views: false,
    owner_name: "",
    owner_email: "",
    owner_telephone: "",
    fiscal_year: defaultFiscalYears[0].id,
    tax_periods: undefined,
    tax_last_period: undefined,
    no_of_workers: 0,
    business_type: "",
    company_brief: "",
  });

  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkExistingData = async () => {
      try {
        const data = await getCompanies();
        if (data && data.length > 0) {
          navigate(`/setup/companysetup/update-company-setup/${data[0].id}`);
          return;
        }
      } catch (error) {
        console.error("Failed to check existing company data:", (error as any)?.message || error);
      }
    };

    checkExistingData();
  }, [navigate]);

  const validate = (): boolean => {
    const newErrors: Partial<CompanyFormData> = {};

    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    else if (!/^[0-9]+$/.test(String(formData.phone_number))) newErrors.phone_number = "Invalid phone number";
    if (!formData.email_address) newErrors.email_address = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email_address)) newErrors.email_address = "Invalid email";
    if (!formData.official_company_number) newErrors.official_company_number = "Company number is required";
    if (!formData.home_currency) newErrors.home_currency = "Currency is required";
    if (!formData.fiscal_year) newErrors.fiscal_year = "Fiscal year is required";
    if (formData.tax_periods !== undefined && (isNaN(Number(formData.tax_periods)) || Number(formData.tax_periods) < 0))
      newErrors.tax_periods = "Invalid number" as any;
    if (formData.tax_last_period !== undefined && (isNaN(Number(formData.tax_last_period)) || Number(formData.tax_last_period) < 0))
      newErrors.tax_last_period = "Invalid number" as any;
    if (!formData.no_of_workers || Number(formData.no_of_workers) <= 0) newErrors.no_of_workers = "Enter number of workers" as any;
    // Additional basic validations could be added for owner fields, turnover, etc.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target?.name;
    if (!name) return;

    let value: any;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'file') {
      value = target.files ? target.files[0] : null;
    } else {
      value = target.value;
    }

    // Convert numeric inputs
    if (['tax_periods', 'tax_last_period', 'no_of_workers'].includes(name)) {
      if (value === '' || value === undefined) value = undefined;
      else value = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value } as any));
  };

  const handleSubmit = async () => {
    const isValid = validate();

    if (isValid) {
      try {
        const formDataToSend = new FormData();
        for (const key in formData) {
          const value = (formData as any)[key];
          if (value !== null && value !== undefined && value !== '') {
            if (value instanceof File) {
              formDataToSend.append(key, value);
            } else if (typeof value === 'boolean') {
              formDataToSend.append(key, value ? '1' : '0');
            } else {
              formDataToSend.append(key, String(value));
            }
          }
        }

        const response = await createCompany(formDataToSend);
        if (response && response.id) {
          navigate(`/setup/companysetup/update-company-setup/${response.id}`);
        } else {
          window.history.back();
        }
        setOpen(true);
      } catch (error: any) {
        console.error("createCompany error:", error?.response?.status, error?.message || error);
        // Do not expose API payloads or loaded data to the user. Show a generic message only.
        setErrorMessage("Failed to save company setup. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          width: "100%",
          maxWidth: "1200px",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Company Setup
        </Typography>

        <Grid container spacing={4}>
          {/* Left Section - General Settings */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">General Settings</Typography>
              <Divider />

              <TextField
                label="Name (to appear on reports)"
                name="name"
                size="small"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                label="Address"
                name="address"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />

              <TextField
                label="Phone Number"
                name="phone_number"
                size="small"
                fullWidth
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />

              <TextField
                label="Fax Number"
                name="fax_number"
                size="small"
                fullWidth
                value={formData.fax_number}
                onChange={handleChange}
              />

              <TextField
                label="Email Address"
                name="email_address"
                size="small"
                fullWidth
                value={formData.email_address}
                onChange={handleChange}
                error={!!errors.email_address}
                helperText={errors.email_address}
              />

              <TextField
                label="Official Company Number"
                name="official_company_number"
                size="small"
                fullWidth
                value={formData.official_company_number}
                onChange={handleChange}
                error={!!errors.official_company_number}
                helperText={errors.official_company_number}
              />

              <TextField
                label="Company Website"
                name="company_website"
                size="small"
                fullWidth
                value={formData.company_website}
                onChange={handleChange}
              />

              <TextField
                label="GST Number"
                name="GSTNo"
                size="small"
                fullWidth
                value={formData.GSTNo}
                onChange={handleChange}
              />

              <FormControl size="small" fullWidth error={!!errors.home_currency}>
                <InputLabel>Home Currency</InputLabel>
                <Select
                  name="home_currency"
                  value={formData.home_currency}
                  onChange={handleChange}
                  label="Home Currency"
                >
                  {defaultCurrencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.currency_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.home_currency}</FormHelperText>
              </FormControl>

              <TextField
                label="Annual Turnover Estimate"
                name="annual_turnover_estimate"
                size="small"
                fullWidth
                value={formData.annual_turnover_estimate}
                onChange={handleChange}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">New Company Logo (.jpg)</Typography>
                <input type="file" name="company_logo" onChange={handleChange} />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="delete_company_logo"
                    checked={formData.delete_company_logo}
                    onChange={handleChange}
                  />
                }
                label="Delete Company Logo"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.company_logo_on_views}
                    onChange={handleChange}
                    name="company_logo_on_views"
                  />
                }
                label="Company Logo on Views"
              />

              <TextField
                label="Owner Name"
                name="owner_name"
                size="small"
                fullWidth
                value={formData.owner_name}
                onChange={handleChange}
              />

              <TextField
                label="Owner Email"
                name="owner_email"
                size="small"
                fullWidth
                value={formData.owner_email}
                onChange={handleChange}
              />

              <TextField
                label="Owner Telephone"
                name="owner_telephone"
                size="small"
                fullWidth
                value={formData.owner_telephone}
                onChange={handleChange}
              />
            </Stack>
          </Grid>

          {/* Right Section - Ledger & Options */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">General Ledger Settings</Typography>
              <Divider />

              <Typography variant="subtitle1">Fiscal Year</Typography>

              <FormControl size="small" fullWidth error={!!errors.fiscal_year}>
                <InputLabel>Fiscal Year</InputLabel>
                <Select
                  name="fiscal_year"
                  value={formData.fiscal_year}
                  onChange={handleChange}
                  label="Fiscal Year"
                >
                  {defaultFiscalYears.map((fy) => (
                    <MenuItem key={fy.id} value={fy.id}>
                      {fy.fiscal_year_from} - {fy.fiscal_year_to} - {fy.closed ? 'Closed' : 'Active'}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.fiscal_year}</FormHelperText>
              </FormControl>

              <TextField
                label="Tax Periods (months)"
                name="tax_periods"
                size="small"
                fullWidth
                value={formData.tax_periods}
                onChange={handleChange}
                error={!!errors.tax_periods}
                helperText={errors.tax_periods}
              />

              <TextField
                label="Last Tax Period (months back)"
                name="tax_last_period"
                size="small"
                fullWidth
                value={formData.tax_last_period}
                onChange={handleChange}
                error={!!errors.tax_last_period}
                helperText={errors.tax_last_period}
              />

              <TextField
                label="Number of Workers"
                name="no_of_workers"
                size="small"
                fullWidth
                value={formData.no_of_workers}
                onChange={handleChange}
              />

              <TextField
                label="Business Type"
                name="business_type"
                size="small"
                fullWidth
                value={formData.business_type}
                onChange={handleChange}
              />

              <TextField
                label="Company Brief"
                name="company_brief"
                size="small"
                fullWidth
                multiline
                rows={4}
                value={formData.company_brief}
                onChange={handleChange}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Button onClick={() => navigate('/dashboard')} fullWidth={true} sx={{ sm: { width: "auto" } }}>
            Back
          </Button>

          <Button
            variant="contained"
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
            fullWidth={true}
          >
            Create
          </Button>
        </Box>
      </Paper>
      <AddedConfirmationModal
        open={open}
        title="Success"
        content="Company setup has been added successfully!"
        addFunc={async () => { }}
        handleClose={() => setOpen(false)}
        onSuccess={() => window.history.back()}
      />
      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}