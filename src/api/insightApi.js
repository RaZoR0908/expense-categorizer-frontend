import axiosInstance from './axiosInstance';

export const getMonthlyInsights = async (month) => {
  const response = await axiosInstance.get('/insights/monthly', {
    params: { month },
  });
  return response.data;
};

export const getYearlyInsights = async (year) => {
  const response = await axiosInstance.get('/insights/yearly', {
    params: { year },
  });
  return response.data;
};

export const getMonthComparison = async (currentMonth, previousMonth) => {
  const response = await axiosInstance.get('/insights/comparison', {
    params: { currentMonth, previousMonth },
  });
  return response.data;
};