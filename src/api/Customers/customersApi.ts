import axios from "axios";

const API_URL = "http://localhost:8000/api/customers";

export interface CustomerPayload {
  name: string;
  phone?: string;
  email: string;
  address?: string;
}

export interface Customer extends CustomerPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createCustomer = async (
  payload: CustomerPayload
): Promise<Customer> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateCustomer = async (
  id: number,
  payload: CustomerPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
