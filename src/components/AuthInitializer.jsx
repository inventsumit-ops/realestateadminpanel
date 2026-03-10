import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from '../store/slices/authSlice'

const AuthInitializer = () => {
  const dispatch = useDispatch()
  const { token, isAuthenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    // Only attempt to get current user if we have a token but no user data
    if (token && !isAuthenticated && !loading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, isAuthenticated, loading])

  return null
}

export default AuthInitializer
