import apiClient from './client';

export const userApi = {
  getUser: (id) => apiClient.get(`/api/users/${id}`),
  createUser: (data) => apiClient.post('/api/users', data),
  getUserSubmissions: (id) => apiClient.get(`/api/users/${id}/submissions`),
};
