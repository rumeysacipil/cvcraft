import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
}

export const cvApi = {
  list: () => api.get('/cvs'),
  get: (id) => api.get(`/cvs/${id}`),
  create: (data) => api.post('/cvs', data),
  update: (id, data) => api.put(`/cvs/${id}`, data),
  delete: (id) => api.delete(`/cvs/${id}`),
  duplicate: (id) => api.post(`/cvs/${id}/duplicate`),
  exportPdf: (id) => api.get(`/cvs/${id}/pdf`, { responseType: 'blob' }),
  exportPdfHtml: (id, body) => api.post(`/cvs/${id}/pdf-html`, body, { responseType: 'blob' }),
  importPdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cvs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  toggleShare: (id) => api.post(`/cvs/${id}/share`),
  getShared: (token) => api.get(`/shared/${token}`),
}

export const paymentApi = {
  subscriptionCheckout: () => api.post('/payment/checkout/subscription'),
  oneTimeCheckout: () => api.post('/payment/checkout/one-time'),
  getStatus: () => api.get('/payment/status'),
  verifySession: (sessionId) => api.post(`/payment/verify-session?sessionId=${sessionId}`),
  cancelSubscription: () => api.post('/payment/cancel'),
}

export const aiApi = {
  analyze: (cvId, targetJob, responseLang = 'TR') => api.post('/ai/analyze', { cvId, targetJob, responseLang }),
  translate: (cvId, targetLang) => api.post('/ai/translate', { cvId, targetLang }),
  coverLetter: (cvId, role, company, responseLang = 'TR') => api.post('/ai/cover-letter', { cvId, role, company, responseLang }),
  jobMatch: (cvId, jobDescription, responseLang = 'TR') => api.post('/ai/job-match', { cvId, jobDescription, responseLang }),
}

export const userApi = {
  me: () => api.get('/users/me'),
  update: (data) => api.patch('/users/me', data),
}

export default api
