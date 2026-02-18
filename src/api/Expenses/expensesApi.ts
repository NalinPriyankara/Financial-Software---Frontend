import axios from "axios";
import queryClient from "../../state/queryClient";

const API_URL = "http://127.0.0.1:8000/api/expenses";

export interface ExpensePayload {
  title: string;
  amount: number;
  expense_date: string;
  description?: string;
  created_by?: number;
}

export const getExpenses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createExpense = async (data: ExpensePayload) => {
  const currentUser = queryClient.getQueryData<any>(["current-user"]);
  const payload = {
    ...data,
    created_by: data.created_by ?? currentUser?.id,
  };

  const response = await axios.post(API_URL, payload);
  return response.data;
};

export const updateExpense = async (id: number, data: ExpensePayload) => {
  const currentUser = queryClient.getQueryData<any>(["current-user"]);
  const payload = {
    ...data,
    created_by: data.created_by ?? currentUser?.id,
  };

  const response = await axios.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
