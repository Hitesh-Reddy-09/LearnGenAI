# Frontend-Backend Authentication Integration

This document describes the complete authentication integration between the LearnGen frontend and backend.

## 🏗️ Architecture Overview

The authentication system follows a JWT-based architecture with the following components:

### Backend (Node.js/Express)

- **JWT Authentication**: Access tokens + refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Email Verification**: Nodemailer integration
- **Rate Limiting**: Express-rate-limit protection
- **Input Validation**: Joi schema validation
- **Role-Based Access**: User roles (user, admin)

### Frontend (React)

- **Context API**: Global auth state management
- **Axios Interceptors**: Automatic token handling
- **Protected Routes**: Route-level authentication
- **Form Validation**: Client-side validation
- **Error Handling**: Comprehensive error management

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

#### Backend (.env)

```env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5002/api
```

## 🚀 Features

### Authentication Features

- ✅ User registration with email verification
- ✅ User login with JWT tokens
- ✅ Password reset via email
- ✅ Token refresh mechanism
- ✅ Secure logout
- ✅ Remember me functionality
- ✅ Role-based access control

### Security Features

- ✅ Password strength validation
- ✅ Rate limiting on auth endpoints
- ✅ CSRF protection
- ✅ Secure HTTP headers
- ✅ Input sanitization
- ✅ JWT token expiration
- ✅ Refresh token rotation

### UI/UX Features

- ✅ Responsive authentication modals
- ✅ Loading states and error handling
- ✅ Form validation with real-time feedback
- ✅ Dark/light theme support
- ✅ Smooth animations and transitions
- ✅ User profile management
- ✅ Password change functionality

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── AuthModal.jsx          # Authentication modal
│   │       ├── UserMenu.jsx           # User dropdown menu
│   │       └── ProtectedRoute.jsx     # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx            # Global auth state
│   ├── services/
│   │   └── api.js                     # API service layer
│   └── pages/
│       └── ResetPassword.jsx          # Password reset page
```

## 🔌 API Integration

### API Service (`src/services/api.js`)

The API service provides a centralized way to interact with the backend:

```javascript
import { authAPI } from "../services/api";

// Register user
const result = await authAPI.register({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
});

// Login user
const result = await authAPI.login({
  email: "john@example.com",
  password: "SecurePass123!",
});

// Get current user
const result = await authAPI.getMe();

// Logout user
const result = await authAPI.logout();
```

### Axios Interceptors

Automatic token handling:

- **Request Interceptor**: Adds JWT token to all requests
- **Response Interceptor**: Handles token refresh and error responses

```javascript
// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // Redirect to login if refresh fails
    }
    return Promise.reject(error);
  }
);
```

## 🎯 Usage Examples

### Using AuthContext

```javascript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn({
      email: "user@example.com",
      password: "password123",
    });

    if (result.success) {
      // Redirect or show success message
    } else {
      // Handle error
      console.error(result.error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
}
```

### Protected Routes

```javascript
import ProtectedRoute from "../components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Authentication Modal

```javascript
import AuthModal from "../components/auth/AuthModal";

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAuthModal(true)}>Sign In</button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </div>
  );
}
```

## 🧪 Testing

### Run Integration Tests

```bash
cd frontend
node test-integration.js
```

### Manual Testing Checklist

- [ ] User registration with valid data
- [ ] User registration with invalid data (validation)
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Password reset flow
- [ ] Email verification (if configured)
- [ ] Token refresh mechanism
- [ ] Protected route access
- [ ] Unauthorized access handling
- [ ] Logout functionality
- [ ] User profile updates
- [ ] Password change functionality

## 🔒 Security Considerations

### Frontend Security

- **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
- **Input Validation**: Client-side validation with server-side verification
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based CSRF protection

### Backend Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: Server-side validation and sanitization
- **CORS Configuration**: Proper CORS setup for frontend communication

## 🚨 Error Handling

### Common Error Scenarios

1. **Network Errors**: Automatic retry with exponential backoff
2. **Authentication Errors**: Automatic token refresh or redirect to login
3. **Validation Errors**: User-friendly error messages
4. **Server Errors**: Graceful degradation with user feedback

### Error Response Format

```javascript
{
  success: false,
  message: "Error message",
  error: {
    message: "Detailed error message",
    details: "Additional error details"
  }
}
```

## 🔄 State Management

### AuthContext State

```javascript
const authState = {
  user: null | UserObject,
  isLoading: boolean,
  error: string | null,
  isAuthenticated: boolean,
};
```

### User Object Structure

```javascript
const user = {
  _id: "user_id",
  name: "John Doe",
  email: "john@example.com",
  role: "user" | "admin",
  isEmailVerified: boolean,
  avatar: "avatar_url",
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z",
};
```

## 📱 Responsive Design

The authentication components are fully responsive:

- **Mobile**: Stacked layout with touch-friendly buttons
- **Tablet**: Side-by-side layout with improved spacing
- **Desktop**: Full-width modal with optimal spacing

## 🎨 Theming

Authentication components support both light and dark themes:

- **Light Theme**: Clean, modern design with subtle shadows
- **Dark Theme**: Dark backgrounds with proper contrast
- **Automatic Switching**: Follows system theme preferences

## 🔧 Customization

### Styling Customization

All components use Tailwind CSS classes and can be easily customized:

```javascript
// Custom button styles
<Button className="bg-custom-blue hover:bg-custom-blue-dark">
  Custom Button
</Button>

// Custom modal styles
<AuthModal className="max-w-lg" />
```

### Functionality Customization

The authentication system is modular and can be extended:

```javascript
// Custom auth hooks
const useCustomAuth = () => {
  const auth = useAuth();

  // Add custom functionality
  const customLogin = async (credentials) => {
    // Custom login logic
    return auth.signIn(credentials);
  };

  return { ...auth, customLogin };
};
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production API URLs
2. **HTTPS**: Ensure all communication is over HTTPS
3. **CORS**: Configure CORS for production domains
4. **Rate Limiting**: Adjust rate limits for production traffic
5. **Monitoring**: Add error tracking and analytics
6. **CDN**: Use CDN for static assets
7. **Caching**: Implement proper caching strategies

### Environment Setup

```bash
# Production environment variables
VITE_API_URL=https://api.learngen.com/api
NODE_ENV=production
```

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token debugging
- [React Router Documentation](https://reactrouter.com/) - Routing guide
- [Axios Documentation](https://axios-http.com/) - HTTP client guide
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 🤝 Contributing

When contributing to the authentication system:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Consider security implications
5. Test across different devices and browsers

## 📞 Support

For issues or questions about the authentication integration:

1. Check the troubleshooting section
2. Review the error logs
3. Test with the integration test script
4. Create an issue with detailed information

---

**Note**: This authentication system is designed for development and testing. For production use, additional security measures should be implemented based on your specific requirements.
