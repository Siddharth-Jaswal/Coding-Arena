import apiClient from './client';

export const userApi = {
  getMe: () => apiClient.get('/api/users/me'),
  updateProfile: (data) => apiClient.patch('/api/users/me', data),
  getMySubmissions: (limit = 10, offset = 0) => apiClient.get(`/api/users/me/submissions?limit=${limit}&offset=${offset}`),
  getMySolvedProblems: () => apiClient.get('/api/users/me/solved'),
};
