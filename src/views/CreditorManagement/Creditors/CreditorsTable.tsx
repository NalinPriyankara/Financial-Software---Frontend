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
import { getCreditors, deleteCreditor } from "../../../api/Creditors/creditorsApi";
import { getSuppliers } from "../../../api/Suppliers/suppliersApi";

export default function CreditorsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: creditors = [], refetch } = useQuery({
    queryKey: ["creditors"],
    queryFn: async () => {
      const res = await getCreditors();
      return res.data ?? res;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await getSuppliers();
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
      await deleteCreditor(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete creditor. Please try again.");
      setErrorOpen(true);
    }
  };

  const formatAmount = (v: any) => {
    const n = Number(v);
    return Number.isNaN(n) ? (v ?? "") : n.toFixed(2);
  };

  const mapped = useMemo(() => {
    const map: Record<string, any> = {};
    (suppliers || []).forEach((s: any) => { map[String(s.id)] = s; });
    return (creditors || []).map((d: any) => ({
      id: d.id,
      supplier: d.supplier_name ?? (d.supplier?.name ?? (map[String(d.supplier_id)] && map[String(d.supplier_id)].name) ?? String(d.supplier_id ?? "")),
      amount: d.amount,
    }));
  }, [creditors, suppliers]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) =>
      String(r.supplier).toLowerCase().includes(q) ||
      String(r.amount).toLowerCase().includes(q)
    );
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Creditors" }];

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
          <PageTitle title="Creditors" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/creditors/add-creditor")}>Add Creditor</Button>
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
          <Table aria-label="creditors table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
                {paginated.length > 0 ? (
                paginated.map((d: any, index: number) => (
                  <TableRow key={d.id ?? `row-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{d.supplier}</TableCell>
                    <TableCell>{formatAmount(d.amount)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/creditors/update-creditor/${d.id}`)}>Edit</Button>
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedId(d.id); setOpenDeleteModal(true); }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={4}
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

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Creditor" content="Are you sure you want to delete this creditor?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
