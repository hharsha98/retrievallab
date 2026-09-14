import { useEffect, useState } from 'react'
import { api } from './api'

export function useApiStatus() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    api<{ status: string }>('/api/health').then((h) => setStatus(h.status)).catch(() => setStatus('offline'))
  }, [])
  return status
}
