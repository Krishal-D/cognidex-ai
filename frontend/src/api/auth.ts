import client from './client.ts';

export const authAPI = {
  async register(name: string, email: string, password: string) {
    const res = await client.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },

  async logout() {
    const res = await client.post('/auth/logout');
    return res.data;
  },

  async refresh() {
    const res = await client.post('/auth/refresh');
    return res.data;
  },
};
