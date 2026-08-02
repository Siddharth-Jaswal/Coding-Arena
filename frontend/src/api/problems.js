import apiClient from './client';

export const problemApi = {
  getProblems: () => apiClient.get('/api/problems'),
  getProblem: (id) => apiClient.get(`/api/problems/${id}`),
};
