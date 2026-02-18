import axios from "axios";

const API_URL = "http://localhost:8000/api/sale-items";

export interface SaleItemPayload {
  sale_id: number;
  item_id: number;
  quantity: number;
  price: number;
  total?: number;
}

export interface SaleItem extends SaleItemPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getSaleItems = async (params?: any): Promise<SaleItem[]> => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const getSaleItemById = async (id: number): Promise<SaleItem> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createSaleItem = async (
  payload: SaleItemPayload
): Promise<{ message: string; data: SaleItem }> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateSaleItem = async (
  id: number,
  payload: SaleItemPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteSaleItem = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
