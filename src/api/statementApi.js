import axiosInstance from './axiosInstance';

export const uploadStatement = async (file, password = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (password) {
    formData.append('password', password);
  }

  const response = await axiosInstance.post('/statements/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};