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
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../components/BreadCrumb";
import PageTitle from "../../../components/PageTitle";
import SearchBar from "../../../components/SearchBar";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import theme from "../../../theme";
import { getLoanInstallments, deleteLoanInstallment } from "../../../api/LoanInstallments/loanInstallmentsApi";
import { getLoans } from "../../../api/Loans/loansApi";

export default function LoanInstallmentsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: installmentsRes = [], refetch } = useQuery({ queryKey: ["loan-installments"], queryFn: getLoanInstallments });
  const { data: loansRes = [] } = useQuery({ queryKey: ["loans"], queryFn: getLoans });

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteLoanInstallment(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      await refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete installment. Please try again.");
      setErrorOpen(true);
    }
  };

  const installments = Array.isArray(installmentsRes) ? installmentsRes : (installmentsRes as any)?.data ?? [];
  const loans = Array.isArray(loansRes) ? loansRes : (loansRes as any)?.data ?? [];

  const loansMap = useMemo(() => {
    const m: Record<number, string> = {};
    (loans || []).forEach((ln: any) => {
      m[ln.id] = ln.loan_name ?? `${ln.loan_name ?? ""}`;
    });
    return m;
  }, [loans]);

  const mapped = useMemo(() => {
    return (installments || []).map((it: any) => ({
      id: it.id,
      loan_id: it.loan_id,
      loan_name: it.loan?.loan_name ?? loansMap[it.loan_id] ?? "-",
      amount: it.amount,
      payment_date: it.payment_date,
    }));
  }, [installments, loansMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) =>
      String(r.loan_name).toLowerCase().includes(q) ||
      String(r.amount).toLowerCase().includes(q) ||
      String(r.payment_date).toLowerCase().includes(q)
    );
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Loan Installments" }];

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
          <PageTitle title="Loan Installments" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/loan/add-loan-installment")}>
            Add Installment
          </Button>
          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search installments..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="loan installments table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Loan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `installment-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.loan_name}</TableCell>
                    <TableCell>{Number(r.amount ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{r.payment_date}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedId(r.id); setOpenDeleteModal(true); }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={5}
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

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Installment" content="Are you sure you want to delete this installment?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
