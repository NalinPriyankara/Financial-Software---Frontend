import axios from "axios";

const API_URL = "http://localhost:8000/api/items";

export interface ItemPayload {
  name: string;
  category: string;
  unit: string;
  selling_price: number;
}

export interface Item extends ItemPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getItems = async (): Promise<Item[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getItemById = async (id: number): Promise<Item> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createItem = async (
  payload: ItemPayload
): Promise<Item> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateItem = async (
  id: number,
  payload: ItemPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteItem = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
