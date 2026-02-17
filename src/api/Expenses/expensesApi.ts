import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/expenses";

export interface ExpensePayload {
  title: string;
  amount: number;
  expense_date: string;
  description?: string;
  created_by: number;
}

export const getExpenses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createExpense = async (data: ExpensePayload) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateExpense = async (id: number, data: ExpensePayload) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
