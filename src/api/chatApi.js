import axiosInstance from './axiosInstance';

export const sendMessage = async (message) => {
  const response = await axiosInstance.post('/chat/message', {
    message,
  });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await axiosInstance.get('/chat/history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await axiosInstance.delete('/chat/history');
  return response.data;
};