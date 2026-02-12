import axios from "axios";
import api from "../apiClient";

const API_URL = "http://localhost:8000/api/upload-data";

export interface UploadData {
  id: number;
  file_name: string;
  stored_name: string;
  format: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Get all uploads
export const getUploads = async (): Promise<UploadData[]> => {
  try {
    const response = await api.get<UploadData[]>(API_URL);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Upload files (accept single File or array of Files)
export const uploadFile = async (files: File | File[], userId?: number): Promise<UploadData[]> => {
  try {
    const results: UploadData[] = [];

    const postSingle = async (f: File) => {
      const formData = new FormData();
      // backend expects field name 'file' (per controller)
      formData.append('file', f);
      if (userId !== undefined) formData.append('user_id', String(userId));

      const res = await api.post<{ data: UploadData }>(API_URL, formData);

      // controller returns { message, data }
      const payload = (res.data as any)?.data ?? res.data;
      return payload as UploadData;
    };

    if (Array.isArray(files)) {
      for (const f of files) {
        const r = await postSingle(f);
        results.push(r);
      }
    } else {
      const r = await postSingle(files);
      results.push(r);
    }

    return results;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Delete upload
export const deleteUpload = async (id: number) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
