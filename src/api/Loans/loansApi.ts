import axios from "axios";

const API_URL = "http://localhost:8000/api/loans";

export interface LoanPayload {
  loan_name: string;
  total_amount: number;
  paid_amount?: number;
  balance?: number;
  interest_rate?: number | null;
  start_date: string;
  end_date?: string | null;
}

export interface Loan extends LoanPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

export const getLoans = async (): Promise<Loan[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getLoanById = async (id: number): Promise<Loan> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createLoan = async (
  payload: LoanPayload
): Promise<Loan> => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateLoan = async (
  id: number,
  payload: LoanPayload
): Promise<void> => {
  await axios.put(`${API_URL}/${id}`, payload);
};

export const deleteLoan = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
