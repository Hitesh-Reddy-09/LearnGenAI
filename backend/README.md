# LearnGenAI Backend

A robust Node.js backend API for the LearnGenAI platform - an AI-powered learning management system.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **AI Integration**: Google Generative AI for content generation
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Logging**: Winston logger with file and console output
- **Email**: Nodemailer for email notifications
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Express-validator and Joi for request validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Google AI API key

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LearnGen/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/learngen
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   │   ├── constants.js  # Application constants
│   │   ├── database.js   # Database connection
│   │   └── logger.js     # Winston logger
│   ├── models/          # Mongoose models (to be added)
│   ├── routes/          # API routes (to be added)
│   ├── controllers/     # Route controllers (to be added)
│   └── services/        # Business logic (to be added)
├── logs/               # Log files
├── uploads/            # File uploads (to be created)
├── server.js           # Main application entry point
├── package.json        # Dependencies and scripts
└── .env.example        # Environment variables template
```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (to be configured)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🔌 API Endpoints

### Health Check

- `GET /health` - Server health status

### API Info

- `GET /api` - API information and version

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Multiple rate limiters for different endpoints
- **Input Validation**: Request validation using express-validator
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security

## 📊 Logging

The application uses Winston for logging with the following features:

- Console logging with colors (development)
- File logging (production)
- Different log levels based on environment
- Error tracking and monitoring

## 🔗 Database

- **MongoDB**: NoSQL database with Mongoose ODM
- **Connection Pooling**: Optimized database connections
- **Error Handling**: Comprehensive database error handling
- **Graceful Shutdown**: Proper connection cleanup

## 🚦 Rate Limiting

Different rate limiters for various endpoints:

- **General**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **API**: 50-200 requests per 15 minutes (based on user role)
- **AI Generation**: 10-100 requests per hour (based on user role)
- **File Upload**: 20 uploads per hour

## 🔐 Environment Variables

| Variable            | Description               | Default                              |
| ------------------- | ------------------------- | ------------------------------------ |
| `NODE_ENV`          | Environment mode          | `development`                        |
| `PORT`              | Server port               | `5000`                               |
| `MONGODB_URI`       | MongoDB connection string | `mongodb://localhost:27017/learngen` |
| `JWT_SECRET`        | JWT signing secret        | `your-super-secret-jwt-key`          |
| `JWT_EXPIRES_IN`    | JWT expiration time       | `7d`                                 |
| `GOOGLE_AI_API_KEY` | Google AI API key         | Required                             |
| `SMTP_HOST`         | SMTP server host          | `smtp.gmail.com`                     |
| `SMTP_PORT`         | SMTP server port          | `587`                                |
| `SMTP_USER`         | SMTP username             | Required                             |
| `SMTP_PASS`         | SMTP password             | Required                             |
| `FRONTEND_URL`      | Frontend URL for CORS     | `http://localhost:5173`              |

## 🧪 Testing

Testing setup is prepared but not yet implemented. Future additions will include:

- Unit tests with Jest
- Integration tests
- API endpoint testing
- Database testing

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please contact the development team or create an issue in the repository.
