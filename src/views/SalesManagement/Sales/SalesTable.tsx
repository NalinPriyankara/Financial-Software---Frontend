import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  Typography,
  useMediaQuery,
  Theme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../components/BreadCrumb";
import PageTitle from "../../../components/PageTitle";
import SearchBar from "../../../components/SearchBar";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import theme from "../../../theme";
import { getSales, deleteSale } from "../../../api/Sales/salesApi";
import { getUsers } from "../../../api/UserManagement/userManagement";
import { getCustomers } from "../../../api/Customers/customersApi";

export default function SalesTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: salesData = [], refetch } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const data = await getSales();
      return data;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res;
    },
  });

  const formatAmount = (v: any) => {
    const n = Number(v);
    return Number.isNaN(n) ? (v ?? "") : n.toFixed(2);
  };

  const salesMapped = useMemo(() => {
    const custMap: Record<string, any> = {};
    (customers || []).forEach((c: any) => { custMap[String(c.id)] = c; });
    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[String(u.id)] = u; });
    return (salesData || []).map((s: any) => ({
      id: s.id,
      invoice_no: s.invoice_no,
      customer: s.customer_name ?? (s.customer?.name ?? (custMap[String(s.customer_id)] && custMap[String(s.customer_id)].name) ?? String(s.customer_id ?? "")),
      total_amount: s.total_amount,
      paid_amount: s.paid_amount,
      balance: s.balance ?? (s.total_amount - s.paid_amount),
      sale_date: s.sale_date,
      created_by: (userMap[String(s.created_by)] && (userMap[String(s.created_by)].first_name ?? userMap[String(s.created_by)].fullName)) || String(s.created_by),
    }));
  }, [salesData, users]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return salesMapped;
    const q = searchQuery.toLowerCase();
    return salesMapped.filter((r: any) =>
      String(r.invoice_no).toLowerCase().includes(q) ||
      String(r.customer).toLowerCase().includes(q) ||
      String(r.total_amount).toLowerCase().includes(q) ||
      String(r.paid_amount).toLowerCase().includes(q) ||
      String(r.sale_date).toLowerCase().includes(q) ||
      String(r.created_by).toLowerCase().includes(q)
    );
  }, [salesMapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteSale(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete sale. Please try again.");
      setErrorOpen(true);
    }
  };

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Sales" }];

  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <PageTitle title="Sales" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/sales/add-sale")}>
            Add Sale
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")}>Back</Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="sales table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Invoice No</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Sale Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((s: any, index: number) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{s.invoice_no}</TableCell>
                    <TableCell>{s.customer}</TableCell>
                    <TableCell>{formatAmount(s.total_amount)}</TableCell>
                    <TableCell>{formatAmount(s.paid_amount)}</TableCell>
                    <TableCell>{formatAmount(s.balance)}</TableCell>
                    <TableCell>{s.sale_date}</TableCell>
                    <TableCell>{s.created_by}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/sales/update-sale/${s.id}`)}>Edit</Button>
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedId(s.id); setOpenDeleteModal(true); }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                    colSpan={9}
                  count={filtered.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  showFirstButton
                  showLastButton
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Sale" content="Are you sure you want to delete this sale?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
