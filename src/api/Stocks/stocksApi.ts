import axios from "axios";

const API_URL = "http://localhost:8000/api/stocks";

export interface StockPayload {
  item_id: number;
  quantity: number;
}

export interface Stock extends StockPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getStocks = async (): Promise<Stock[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createStock = async (
  payload: StockPayload
): Promise<Stock> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateStock = async (
  id: number,
  payload: StockPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteStock = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
