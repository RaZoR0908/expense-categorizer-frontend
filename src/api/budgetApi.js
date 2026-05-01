import axiosInstance from './axiosInstance';

export const getAllBudgets = async () => {
  const response = await axiosInstance.get('/budgets');
  return response.data;
};

export const createBudget = async (category, monthlyLimit) => {
  const response = await axiosInstance.post('/budgets', {
    category,
    monthlyLimit,
  });
  return response.data;
};

export const getBudgetStatus = async (month) => {
  const response = await axiosInstance.get('/budgets/status', {
    params: { month },
  });
  return response.data;
};

export const getBudgetById = async (id) => {
  const response = await axiosInstance.get(`/budgets/${id}`);
  return response.data;
};

export const updateBudget = async (id, category, monthlyLimit) => {
  const response = await axiosInstance.put(`/budgets/${id}`, {
    category,
    monthlyLimit,
  });
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await axiosInstance.delete(`/budgets/${id}`);
  return response.data;
};