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
import { getSaleItems, deleteSaleItem } from "../../../api/SaleItems/saleItemsApi";
import { getSales } from "../../../api/Sales/salesApi";
import { getItems } from "../../../api/Items/itemsApi";

export default function SaleItemsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: saleItemsRes = [], refetch } = useQuery({ queryKey: ["sale-items"], queryFn: getSaleItems });
  const { data: salesRes = [] } = useQuery({ queryKey: ["sales"], queryFn: getSales });
  const { data: itemsRes = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteSaleItem(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      await refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || "Failed to delete sale item. Please try again.");
      setErrorOpen(true);
    }
  };

  const saleItems = Array.isArray(saleItemsRes) ? saleItemsRes : (saleItemsRes as any)?.data ?? [];
  const sales = Array.isArray(salesRes) ? salesRes : (salesRes as any)?.data ?? [];
  const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes as any)?.data ?? [];

  const salesMap = useMemo(() => {
    const m: Record<number, string> = {};
    (sales || []).forEach((s: any) => { m[s.id] = s.invoice_no; });
    return m;
  }, [sales]);

  const itemsMap = useMemo(() => {
    const m: Record<number, string> = {};
    (items || []).forEach((it: any) => { m[it.id] = it.name; });
    return m;
  }, [items]);

  const mapped = useMemo(() => {
    return (saleItems || []).map((si: any) => ({
      id: si.id,
      sale_id: si.sale_id,
      sale_invoice: si.sale?.invoice_no ?? salesMap[si.sale_id] ?? "-",
      item_id: si.item_id,
      item_name: si.item?.name ?? itemsMap[si.item_id] ?? "-",
      quantity: si.quantity,
      price: si.price,
      total: si.total,
    }));
  }, [saleItems, salesMap, itemsMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((r: any) =>
      String(r.sale_invoice).toLowerCase().includes(q) ||
      String(r.item_name).toLowerCase().includes(q) ||
      String(r.quantity).toLowerCase().includes(q) ||
      String(r.price).toLowerCase().includes(q) ||
      String(r.total).toLowerCase().includes(q)
    );
  }, [mapped, searchQuery]);

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const breadcrumbItems = [{ title: "Home", href: "/home" }, { title: "Sale Items" }];

  return (
    <Stack>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, marginY: 2, borderRadius: 1, overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <PageTitle title="Sale Items" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={() => navigate("/sales/add-sale-item")}>
            Add Sale Item
          </Button>
          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </Stack>
      </Box>

      <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search sale items..." />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="sale items table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Sale</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `si-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.sale_invoice}</TableCell>
                    <TableCell>{r.item_name}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{Number(r.price ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(r.total ?? 0).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="contained" size="small" onClick={() => navigate(`/sales/update-sale-item/${r.id}`)}>Edit</Button>
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
                <TablePagination rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]} colSpan={7} count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} showFirstButton showLastButton />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>

      <DeleteConfirmationModal open={openDeleteModal} title="Delete Sale Item" content="Are you sure you want to delete this sale item?" handleClose={() => setOpenDeleteModal(false)} handleReject={() => setSelectedId(null)} deleteFunc={handleDelete} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
