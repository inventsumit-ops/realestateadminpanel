import { useDispatch, useSelector } from 'react-redux'

// Auth hooks
export const useAuth = () => {
  const auth = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  return { auth, dispatch }
}

// Users hooks
export const useUsers = () => {
  const users = useSelector((state) => state.users)
  const dispatch = useDispatch()
  return { users, dispatch }
}

// Agents hooks
export const useAgents = () => {
  const agents = useSelector((state) => state.agents)
  const dispatch = useDispatch()
  return { agents, dispatch }
}

// Properties hooks
export const useProperties = () => {
  const properties = useSelector((state) => state.properties)
  const dispatch = useDispatch()
  return { properties, dispatch }
}

// Media hooks
export const useMedia = () => {
  const media = useSelector((state) => state.media)
  const dispatch = useDispatch()
  return { media, dispatch }
}

// Amenities hooks
export const useAmenities = () => {
  const amenities = useSelector((state) => state.amenities)
  const dispatch = useDispatch()
  return { amenities, dispatch }
}

// Inquiries hooks
export const useInquiries = () => {
  const inquiries = useSelector((state) => state.inquiries)
  const dispatch = useDispatch()
  return { inquiries, dispatch }
}

// Appointments hooks
export const useAppointments = () => {
  const appointments = useSelector((state) => state.appointments)
  const dispatch = useDispatch()
  return { appointments, dispatch }
}

// Reviews hooks
export const useReviews = () => {
  const reviews = useSelector((state) => state.reviews)
  const dispatch = useDispatch()
  return { reviews, dispatch }
}

// Blogs hooks
export const useBlogs = () => {
  const blogs = useSelector((state) => state.blogs)
  const dispatch = useDispatch()
  return { blogs, dispatch }
}

// Ads hooks
export const useAds = () => {
  const ads = useSelector((state) => state.ads)
  const dispatch = useDispatch()
  return { ads, dispatch }
}

// Reports hooks
export const useReports = () => {
  const reports = useSelector((state) => state.reports)
  const dispatch = useDispatch()
  return { reports, dispatch }
}

// Settings hooks
export const useSettings = () => {
  const settings = useSelector((state) => state.settings)
  const dispatch = useDispatch()
  return { settings, dispatch }
}

// Generic hook for accessing any slice
export const useAppSelector = useSelector
export const useAppDispatch = () => useDispatch()
