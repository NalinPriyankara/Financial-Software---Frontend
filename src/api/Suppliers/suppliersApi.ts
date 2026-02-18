import axios from "axios";

const API_URL = "http://localhost:8000/api/suppliers";

export interface SupplierPayload {
  name: string;
  phone?: string;
  email: string;
  address?: string;
}

export interface Supplier extends SupplierPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createSupplier = async (
  payload: SupplierPayload
): Promise<Supplier> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateSupplier = async (
  id: number,
  payload: SupplierPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
