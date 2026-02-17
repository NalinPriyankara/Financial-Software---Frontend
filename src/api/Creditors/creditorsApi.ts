import axios from "axios";

const API_URL = "http://localhost:8000/api/creditors";

export const getCreditors = () => {
    return axios.get(API_URL);
};

export const getCreditor = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

export const createCreditor = (data) => {
    return axios.post(API_URL, data);
};

export const updateCreditor = (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
};

export const deleteCreditor = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
