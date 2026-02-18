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
import Breadcrumb from "../../components/BreadCrumb";
import PageTitle from "../../components/PageTitle";
import SearchBar from "../../components/SearchBar";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ErrorModal from "../../components/ErrorModal";
import theme from "../../theme";
import { getExpenses, deleteExpense } from "../../api/Expenses/expensesApi";
import { getUsers } from "../../api/UserManagement/userManagement";

export default function ExpensesTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: expenses = [], refetch } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await getExpenses();
      return res;
    },
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getUsers();
      return res;
    },
  });

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteExpense(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete expense. Please try again.");
      setErrorOpen(true);
    }
  };

  const formatAmount = (v: any) => {
    const n = Number(v);
    return Number.isNaN(n) ? (v ?? "") : n.toFixed(2);
  };

  const expenseList = Array.isArray(expenses) ? expenses : expenses?.data ?? [];
  const users = Array.isArray(usersData) ? usersData : usersData?.data ?? [];

  const usersMap = useMemo(() => {
    const m: Record<string | number, string> = {};
    (users || []).forEach((u: any) => {
      if (!u) return;
      m[Number(u.id)] = String(u.first_name ?? u.name ?? "");
    });
    return m;
  }, [users]);

  const mapped = useMemo(() => {
    return (expenseList || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      expense_date: e.expense_date,
      description: e.description,
      created_by: e.created_by,
      created_by_name: (e?.created_by && typeof e.created_by === "object") ? (e.created_by.first_name ?? e.created_by.name) : (usersMap[e.created_by] ?? ""),
    }));
  }, [expenseList, usersMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) =>
      String(r.title).toLowerCase().includes(q) ||
      String(r.amount).toLowerCase().includes(q) ||
      String(r.expense_date).toLowerCase().includes(q)
    );
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Expenses" }];

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
          <PageTitle title="Expenses" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/expenses/add-expense")}>Add Expense</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")}>Back</Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search expenses..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="expenses table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Expense Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{formatAmount(r.amount)}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.expense_date}</TableCell>
                    <TableCell>{r.created_by_name}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/expenses/update-expense/${r.id}`)}>Edit</Button>
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedId(r.id); setOpenDeleteModal(true); }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={6}
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

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Expense" content="Are you sure you want to delete this expense?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
