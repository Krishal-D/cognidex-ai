import axios from 'axios'

const client = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
})
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url?.includes('/auth/refresh')
        ) {
            original._retry = true

            try {
                const res = await client.post('/auth/refresh')
                const newToken = res.data.token

                localStorage.setItem('token', newToken)

                original.headers = original.headers || {}
                original.headers.Authorization = `Bearer ${newToken}`

                return client(original)
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default client