# Redux Store Setup

This directory contains the Redux store configuration for the Real Estate Admin Panel.

## Structure

```
store/
├── index.js              # Main store configuration
├── hooks.js              # Custom hooks for accessing store slices
├── slices/               # Redux Toolkit slices
│   ├── authSlice.js      # Authentication state management
│   ├── usersSlice.js     # Users management
│   ├── agentsSlice.js    # Agents management
│   ├── propertiesSlice.js # Properties management
│   ├── mediaSlice.js     # Media management
│   ├── amenitiesSlice.js # Amenities management
│   ├── inquiriesSlice.js # Inquiries management
│   ├── appointmentsSlice.js # Appointments management
│   ├── reviewsSlice.js   # Reviews management
│   ├── blogsSlice.js     # Blogs management
│   ├── adsSlice.js       # Ads management
│   ├── reportsSlice.js   # Reports management
│   └── settingsSlice.js  # Settings management
└── README.md             # This file
```

## Usage

### Custom Hooks

Each slice has a corresponding custom hook for easy access:

```javascript
// Auth
import { useAuth } from '../store/hooks'
const { auth, dispatch } = useAuth()

// Users
import { useUsers } from '../store/hooks'
const { users, dispatch } = useUsers()

// Properties
import { useProperties } from '../store/hooks'
const { properties, dispatch } = useProperties()
```

### Direct Access

You can also use the generic hooks:

```javascript
import { useAppSelector, useAppDispatch } from '../store/hooks'

const dispatch = useAppDispatch()
const authState = useAppSelector(state => state.auth)
```

### Actions

Each slice exports actions for state management:

```javascript
import { loginUser, logoutUser, clearError } from '../store/slices/authSlice'

// Login
dispatch(loginUser(credentials))

// Logout
dispatch(logoutUser())

// Clear errors
dispatch(clearError())
```

## Auth Slice

The auth slice handles authentication state including:

- User login/logout
- User registration
- Profile updates
- Authentication status
- Token management

### Auth Actions

- `loginUser(credentials)` - Login user
- `registerUser(userData)` - Register new user
- `getCurrentUser()` - Get current user from token
- `logoutUser()` - Logout user
- `updateProfile(userData)` - Update user profile
- `clearError()` - Clear auth errors
- `clearAuth()` - Clear all auth state

### Auth State

```javascript
{
  user: null | User,
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

## Other Slices

Each module slice follows a similar pattern with:

- CRUD operations
- Status toggles
- Filtering and pagination
- Statistics
- Error handling

## Integration

The store is integrated in `main.jsx` with the Redux Provider:

```javascript
import { Provider } from 'react-redux'
import { store } from './store'

<Provider store={store}>
  <App />
</Provider>
```

## API Integration

All slices use corresponding API services from `src/services/api/`. These services handle the actual HTTP requests to the backend.

## Best Practices

1. Use the custom hooks for cleaner code
2. Handle async operations with Redux Toolkit's `createAsyncThunk`
3. Use the loading states for UI feedback
4. Clear errors after displaying them
5. Use filters and pagination for large datasets
6. Keep the store structure normalized
