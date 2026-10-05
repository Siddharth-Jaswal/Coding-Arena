import apiClient from './client';

export const friendsApi = {
  getFriends: () => apiClient.get('/api/friends'),
  getRequests: () => apiClient.get('/api/friends/requests'),
  sendRequest: (target) => apiClient.post('/api/friends/request', { target }),
  respondToRequest: (requestId, action) => apiClient.post('/api/friends/respond', { requestId, action }),
  removeFriend: (friendId) => apiClient.delete(`/api/friends/${friendId}`),
  searchUsers: (query) => apiClient.get(`/api/friends/search?q=${encodeURIComponent(query)}`)
};
