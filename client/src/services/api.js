import axios from 'axios';
import store from '../store';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// File services
export const fileService = {
  uploadFile: (formData) => {
    // Get user info from Redux store
    const state = store.getState();
    const { user, token } = state.auth;

    if (!token) {
      return Promise.reject(new Error('Please log in to upload files'));
    }

    if (!user || !user._id) {
      return Promise.reject(new Error('User information not loaded. Please try again.'));
    }

    // Log the form data for debugging
    console.log('Uploading file:', {
      fileName: formData.get('file')?.name,
      fileSize: formData.get('file')?.size,
      fileType: formData.get('file')?.type,
      folder: formData.get('folder'),
      tags: formData.get('tags'),
      userId: user._id
    });

    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      },
    });
  },
  getFileDetails: (id) => api.get(`/files/details/${id}`),
  updateFileTags: (id, tags) => api.put(`/files/${id}/tags`, { tags }),
  deleteFile: async (id) => {
    try {
      // Get the file from the Redux store instead of making an API call
      const state = store.getState();
      const { user, token } = state.auth;
      const file = state.files.files.find(f => f._id === id);
      
      if (!token) {
        throw new Error('Please log in to delete files');
      }

      if (!user || !user._id) {
        throw new Error('User information not loaded. Please try again.');
      }
      
      if (!file || !file.public_id) {
        throw new Error('File not found or missing public_id');
      }

      // Encode the public_id to handle special characters like '/'
      const encodedPublicId = encodeURIComponent(file.public_id);
      console.log('Deleting file with public_id:', file.public_id);
      console.log('Encoded public_id:', encodedPublicId);
      
      const response = await api.delete(`/files/delete/${encodedPublicId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.message === 'File deleted successfully') {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error in deleteFile:', error);
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(errorMessage || 'Failed to delete file');
    }
  },
  fetchFiles: () => {
    const state = store.getState();
    const { token } = state.auth;

    if (!token) {
      return Promise.reject(new Error('Please log in to view files'));
    }

    console.log('Making API request to fetch files...');
    return api.get('/files');
  },
};

// User services
export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default api; 