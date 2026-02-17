import axios from "axios";

const API_URL = "http://localhost:8000/api/debtors";

export const getDebtors = () => {
    return axios.get(API_URL);
};

export const getDebtor = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

export const createDebtor = (data) => {
    return axios.post(API_URL, data);
};

export const updateDebtor = (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
};

export const deleteDebtor = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
