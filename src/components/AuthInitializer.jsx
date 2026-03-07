import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getCurrentUser } from '../store/slices/authSlice'

const AuthInitializer = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  return null
}

export default AuthInitializer
