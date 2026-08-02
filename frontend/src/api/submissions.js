import apiClient from './client';

export const submissionApi = {
  createSubmission: (data) => apiClient.post('/api/submissions', data),
  getSubmission: (id) => apiClient.get(`/api/submissions/${id}`),
};
