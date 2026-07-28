import api from './api.js';

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerUser(userData) {
  const { data } = await api.post('/auth/register', userData);
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
