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
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Breadcrumb from "../../../components/BreadCrumb";
import PageTitle from "../../../components/PageTitle";
import SearchBar from "../../../components/SearchBar";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import theme from "../../../theme";
import { getProductionItems, deleteProductionItem } from "../../../api/ProductionItems/productionItemsApi";
import { getProductions } from "../../../api/Productions/productionsApi";
import { getItems } from "../../../api/Items/itemsApi";

export default function ProductionItemsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: pisRes = [], refetch } = useQuery({ queryKey: ["production-items"], queryFn: getProductionItems });
  const { data: productionsRes = [] } = useQuery({ queryKey: ["productions"], queryFn: getProductions });
  const { data: itemsRes = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const queryClient = useQueryClient();

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteProductionItem(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["production-items"] });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete production item. Please try again.");
      setErrorOpen(true);
    }
  };

  const pis = Array.isArray(pisRes) ? pisRes : (pisRes as any)?.data ?? [];
  const productions = Array.isArray(productionsRes) ? productionsRes : (productionsRes as any)?.data ?? [];
  const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes as any)?.data ?? [];

  const productionsMap = useMemo(() => {
    const m: Record<number, string> = {};
    (productions || []).forEach((p: any) => { m[p.id] = p.name ?? String(p.id); });
    return m;
  }, [productions]);

  const itemsMap = useMemo(() => {
    const m: Record<number, string> = {};
    (items || []).forEach((it: any) => { m[it.id] = it.name ?? String(it.id); });
    return m;
  }, [items]);

  const mapped = useMemo(() => {
    return (pis || []).map((r: any) => ({ id: r.id, production_id: r.production_id, item_id: r.item_id, quantity: r.quantity, production_name: productionsMap[r.production_id] ?? "-", item_name: itemsMap[r.item_id] ?? "-" }));
  }, [pis, productionsMap, itemsMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) => String(r.production_name).toLowerCase().includes(q) || String(r.item_name).toLowerCase().includes(q) || String(r.quantity).toLowerCase().includes(q));
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Production Items" }];

  return (
    <Stack>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, marginY: 2, borderRadius: 1, overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <PageTitle title="Production Items" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/production/add-production-item")}>Add Item</Button>
          <Button variant="outlined" onClick={() => navigate("/production/view-productions")}>Back</Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search production items..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="production items table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Production</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `pi-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.production_name}</TableCell>
                    <TableCell>{r.item_name}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/production/update-production-item/${r.id}`)}>Edit</Button>
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

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Production Item" content="Are you sure you want to delete this production item?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
