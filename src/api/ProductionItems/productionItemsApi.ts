import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/production-items";

export interface ProductionItemPayload {
  production_id: number;
  item_id: number;
  quantity: number;
}

export const getProductionItems = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createProductionItem = async (data: ProductionItemPayload) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateProductionItem = async (id: number, data: ProductionItemPayload) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteProductionItem = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
