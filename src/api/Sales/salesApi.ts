import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/sales";

export interface SalePayload {
  invoice_no: string;
  customer_id: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  sale_date: string;
  created_by: number;
}

export const getSales = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getSale = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createSale = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateSale = async (id: number, data: SalePayload) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteSale = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
