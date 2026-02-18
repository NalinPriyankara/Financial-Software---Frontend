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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../components/BreadCrumb";
import PageTitle from "../../../components/PageTitle";
import SearchBar from "../../../components/SearchBar";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import theme from "../../../theme";
import { getBankTransactions, deleteBankTransaction } from "../../../api/BankTransactions/bankTransactionsApi";
import { getBankAccounts } from "../../../api/BankAccounts/bankAccountsApi";

export default function BankTransactionsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: transactions = [], refetch } = useQuery<any>({
    queryKey: ["bank-transactions"],
    queryFn: async () => {
      const res = await getBankTransactions();
      return res;
    },
  });

  const { data: accountsData = [] } = useQuery<any>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await getBankAccounts();
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
      await deleteBankTransaction(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete transaction. Please try again.");
      setErrorOpen(true);
    }
  };

  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.data ?? [];
  const accountsMap = useMemo(() => {
    const m: Record<number, string> = {};
    (accounts || []).forEach((a: any) => {
      if (!a) return;
      m[Number(a.id)] = String(a.account_name ?? a.bank_name ?? "");
    });
    return m;
  }, [accounts]);

  const txList = Array.isArray(transactions) ? transactions : transactions?.data ?? [];

  const mapped = useMemo(() => {
    return (txList || []).map((t: any) => ({
      id: t.id,
      bank_account_id: t.bank_account_id,
      type: t.type,
      amount: t.amount,
      transaction_date: t.transaction_date ? String(t.transaction_date).split("T")[0] : t.transaction_date,
      description: t.description,
      account_name: t.bank_account?.account_name ?? accountsMap[t.bank_account_id] ?? "",
    }));
  }, [txList, accountsMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) =>
      String(r.account_name ?? "").toLowerCase().includes(q) ||
      String(r.type).toLowerCase().includes(q) ||
      String(r.amount).toLowerCase().includes(q) ||
      String(r.transaction_date).toLowerCase().includes(q)
    );
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Bank Transactions" }];

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
          <PageTitle title="Bank Transactions" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/bank/add-bank-transaction")}>
            Add Transaction
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search transactions..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="bank transactions table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.account_name}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{Number(r.amount).toFixed(2)}</TableCell>
                    <TableCell>{r.transaction_date}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedId(r.id); setOpenDeleteModal(true); }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={7}
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

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Transaction" content="Are you sure you want to delete this transaction?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
