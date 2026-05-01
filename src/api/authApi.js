import axiosInstance from './axiosInstance';

export const registerUser = async (fullName, email, password) => {
  const response = await axiosInstance.post('/auth/register', {
    fullName,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};