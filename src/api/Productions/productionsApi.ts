import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/productions";

export interface ProductionPayload {
  production_date: string;
  notes?: string;
  created_by: number;
}

export const getProductions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createProduction = async (data: ProductionPayload) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateProduction = async (id: number, data: ProductionPayload) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteProduction = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
