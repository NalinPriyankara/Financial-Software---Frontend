import axios from "axios";

const API_URL = "http://localhost:8000/api/bank-accounts";

export const getBankAccounts = async () => {
    return await axios.get(API_URL);
};

export const getBankAccount = async (id) => {
    return await axios.get(`${API_URL}/${id}`);
};

export const createBankAccount = async (data) => {
    return await axios.post(API_URL, data);
};

export const updateBankAccount = async (id, data) => {
    return await axios.put(`${API_URL}/${id}`, data);
};

export const updateBankAccountBalance = async (id, balance) => {
    // Use PATCH to update only the balance field when supported by the backend
    return await axios.patch(`${API_URL}/${id}`, { balance });
};

export const deleteBankAccount = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};
