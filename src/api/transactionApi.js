import axiosInstance from './axiosInstance';

export const getAllTransactions = async () => {
  const response = await axiosInstance.get('/transactions');
  return response.data;
};

export const getTransactionsByMonth = async (yearMonth) => {
  const response = await axiosInstance.get(`/transactions/month/${yearMonth}`);
  return response.data;
};

export const getTransactionsByCategory = async (category) => {
  const response = await axiosInstance.get(`/transactions/category/${category}`);
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await axiosInstance.get(`/transactions/${id}`);
  return response.data;
};

export const correctTransaction = async (id, newCategory) => {
  const response = await axiosInstance.put(`/transactions/${id}/correct`, {
    newCategory,
  });
  return response.data;
};