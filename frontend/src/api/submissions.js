import apiClient from './client';

export const submissionApi = {
  createSubmission: (data) => apiClient.post('/api/submissions', data),
  getSubmission: (id) => apiClient.get(`/api/submissions/${id}`),
  getProblemSubmissions: (problemId) => apiClient.get(`/api/submissions/problem/${problemId}`),
  runCode: (data) => apiClient.post('/api/run', data),
};
