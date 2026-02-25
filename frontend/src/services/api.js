import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'multipart/form-data' },
})

export const analyzePDFs = async (files) => {
  try {
    const formData = new FormData()
    files.forEach(file => formData.append('pdfs', file))

    const response = await api.post('/analyze-pdf', formData)
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error')
    } else if (error.request) {
      throw new Error('No response from server')
    } else {
      throw new Error('Failed to upload')
    }
  }
}

export default api