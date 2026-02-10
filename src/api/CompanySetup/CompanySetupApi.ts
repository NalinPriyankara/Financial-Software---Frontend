import axios from "axios";

const API_URL = "http://localhost:8000/api/company-setup";

export const createCompany = async (companyData: FormData) => {
  try {
    const response = await axios.post(API_URL, companyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getCompanies = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getCompany = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// export const updateCompany = async (
//   id: string | number,
//   companyData: any
// ) => {
//   try {
//     const response = await axios.put(`${API_URL}/${id}`, companyData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error(error.response?.data || error);
//     throw error.response?.data || error;
//   }
// };

export const updateCompany = async (id: string | number, companyData: FormData) => {
  try {
    // Add _method=PUT to spoof PUT request since we're using POST for multipart
    companyData.append('_method', 'PUT');

    const response = await axios.post(`${API_URL}/${id}`, companyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteCompany = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
