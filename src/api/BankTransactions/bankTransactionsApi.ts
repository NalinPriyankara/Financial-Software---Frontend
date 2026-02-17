import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/bank-transactions";

export interface BankTransactionPayload {
  bank_account_id: number;
  type: "deposit" | "withdraw";
  amount: number;
  transaction_date: string;
  description?: string;
}

export const getBankTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createBankTransaction = async (data: BankTransactionPayload) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const deleteBankTransaction = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
