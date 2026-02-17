import axios from "axios";

const API_URL = "http://localhost:8000/api/loan-installments";

export const getLoanInstallments = () => {
    return axios.get(API_URL);
};

export const getLoanInstallment = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

export const createLoanInstallment = (data) => {
    return axios.post(API_URL, data);
};

export const updateLoanInstallment = (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
};

export const deleteLoanInstallment = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
