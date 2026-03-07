# Redux Store Usage Guide

This guide demonstrates how to use the Redux store in the Real Estate Admin Panel.

## Installation

The Redux store has been set up with the following packages:
- `@reduxjs/toolkit` - For modern Redux development
- `react-redux` - For React integration

## Store Structure

The store is organized into slices for different modules:
- `authSlice` - Authentication management
- `usersSlice` - User management
- `agentsSlice` - Agent management
- `propertiesSlice` - Property management
- `mediaSlice` - Media management
- `amenitiesSlice` - Amenities management
- `inquiriesSlice` - Inquiry management
- `appointmentsSlice` - Appointment management
- `reviewsSlice` - Review management
- `blogsSlice` - Blog management
- `adsSlice` - Advertisement management
- `reportsSlice` - Reports management
- `settingsSlice` - Settings management

## Basic Usage

### 1. Using Custom Hooks

Each slice has a corresponding custom hook:

```javascript
// Import hooks
import { useAuth, useUsers, useProperties } from '../store/hooks'

// In your component
const MyComponent = () => {
  const { auth, dispatch } = useAuth()
  const { users, dispatch: usersDispatch } = useUsers()
  const { properties, dispatch: propsDispatch } = useProperties()

  // Access state
  console.log(auth.user) // Current user
  console.log(users.loading) // Loading state
  console.log(properties.users) // Properties array

  // Dispatch actions
  const handleLogin = (credentials) => {
    dispatch(loginUser(credentials))
  }

  return <div>My Component</div>
}
```

### 2. Direct Redux Hooks

You can also use the generic Redux hooks:

```javascript
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { loginUser } from '../store/slices/authSlice'

const MyComponent = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(state => state.auth)

  const handleLogin = (credentials) => {
    dispatch(loginUser(credentials))
  }

  return <div>{authState.user?.name}</div>
}
```

## Authentication Example

```javascript
import { useAuth } from '../store/hooks'
import { loginUser, logoutUser } from '../store/slices/authSlice'

const LoginComponent = () => {
  const { auth, dispatch } = useAuth()

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap()
      // Login successful
    } catch (error) {
      // Handle error
      console.error(error)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  if (auth.loading) return <div>Loading...</div>

  return (
    <div>
      {auth.isAuthenticated ? (
        <div>
          <p>Welcome, {auth.user?.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}
```

## CRUD Operations Example

```javascript
import { useUsers } from '../store/hooks'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../store/slices/usersSlice'

const UsersComponent = () => {
  const { users, dispatch } = useUsers()

  // Load users
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  // Create user
  const handleCreateUser = async (userData) => {
    try {
      await dispatch(createUser(userData)).unwrap()
      // Success
    } catch (error) {
      // Handle error
    }
  }

  // Update user
  const handleUpdateUser = async (id, userData) => {
    try {
      await dispatch(updateUser({ id, userData })).unwrap()
      // Success
    } catch (error) {
      // Handle error
    }
  }

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
      // Success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <div>
      {users.loading && <div>Loading...</div>}
      {users.error && <div>Error: {users.error}</div>}
      
      <ul>
        {users.users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => handleUpdateUser(user._id, { name: 'New Name' })}>
              Update
            </button>
            <button onClick={() => handleDeleteUser(user._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Filtering and Pagination

```javascript
import { useProperties } from '../store/hooks'
import { fetchProperties, setFilters } from '../store/slices/propertiesSlice'

const PropertiesComponent = () => {
  const { properties, dispatch } = useProperties()

  // Apply filters
  const applyFilters = (filters) => {
    dispatch(setFilters(filters))
    dispatch(fetchProperties(filters))
  }

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    dispatch(fetchProperties({ 
      page, 
      limit: pageSize,
      ...properties.filters 
    }))
  }

  return (
    <div>
      <input
        placeholder="Search properties..."
        onChange={(e) => applyFilters({ search: e.target.value })}
      />
      
      <Table
        dataSource={properties.users}
        pagination={{
          current: properties.pagination.page,
          pageSize: properties.pagination.limit,
          total: properties.pagination.total,
          onChange: handlePageChange,
        }}
      />
    </div>
  )
}
```

## Error Handling

```javascript
import { useUsers } from '../store/hooks'
import { clearError } from '../store/slices/usersSlice'

const UsersComponent = () => {
  const { users, dispatch } = useUsers()

  // Show error messages
  useEffect(() => {
    if (users.error) {
      message.error(users.error)
      dispatch(clearError())
    }
  }, [users.error, dispatch])

  return <div>...</div>
}
```

## Best Practices

1. **Use custom hooks** for cleaner code and better type safety
2. **Handle loading states** to show loading indicators
3. **Clear errors** after displaying them
4. **Use async/await** with `unwrap()` for better error handling
5. **Dispatch actions** based on user interactions
6. **Keep components focused** on their specific responsibilities
7. **Use filters and pagination** for large datasets

## Migration from Context API

The Redux store replaces the previous AuthContext and Zustand setup:

**Before (Context API):**
```javascript
import { useAuth } from '../hooks/useAuth'
const { user, login, logout } = useAuth()
```

**After (Redux):**
```javascript
import { useAuth } from '../store/hooks'
import { loginUser, logoutUser } from '../store/slices/authSlice'
const { auth, dispatch } = useAuth()
dispatch(loginUser(credentials))
```

## File Structure

```
src/
├── store/
│   ├── index.js              # Store configuration
│   ├── hooks.js              # Custom hooks
│   ├── slices/               # Redux slices
│   └── README.md             # Store documentation
├── services/
│   └── api/                  # API services
└── examples/
    └── ReduxExample.jsx      # Complete example
```

This Redux store provides a centralized, predictable state management solution for the entire admin panel.
