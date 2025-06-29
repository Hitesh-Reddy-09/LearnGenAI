# LearnGenAI - AI-Powered Learning Platform

A comprehensive learning management system powered by artificial intelligence, featuring dynamic course generation, personalized learning experiences, and intelligent assessment systems.

## 🚀 Features

### **AI-Powered Learning**

- **Dynamic Content Generation**: AI-generated courses, lessons, and quizzes
- **Personalized Learning**: Adaptive content based on user preferences and progress
- **Smart Assessments**: Intelligent quiz generation with automatic grading
- **Content Enhancement**: AI-powered content optimization and suggestions

### **Learning Management**

- **Course Management**: Create, edit, and manage comprehensive courses
- **Progress Tracking**: Detailed learning analytics and progress monitoring
- **Certificate System**: Automated certificate generation with verification
- **User Engagement**: Streak tracking, achievements, and gamification

### **User Experience**

- **Modern UI**: Beautiful, responsive design with dark/light theme support
- **Real-time Updates**: Live progress tracking and notifications
- **Mobile Responsive**: Optimized for all devices and screen sizes
- **Accessibility**: WCAG compliant design for inclusive learning

## 📁 Project Structure

```
LearnGen/
├── frontend/                 # React.js Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── main.jsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                  # Node.js Backend API
│   ├── src/
│   │   ├── models/          # MongoDB/Mongoose models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── server.js            # Express server entry point
│   └── package.json         # Backend dependencies
└── README.md                # Project documentation
```

## 🛠️ Technology Stack

### **Frontend**

- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client for API communication

### **Backend**

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **Google AI** - AI content generation
- **Winston** - Logging system
- **Helmet** - Security middleware

### **AI & External Services**

- **Google Generative AI** - Content generation
- **Google APIs** - Additional AI services
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Google AI API Key**

## 🚀 Quick Start

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd LearnGen
```

### **2. Backend Setup**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

### **4. Access the Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Configuration

### **Environment Variables**

#### **Backend (.env)**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learngen

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### **Frontend (.env)**

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=LearnGenAI
```

## 📊 Database Models

### **User Model**

- Authentication and authorization
- Learning progress tracking
- Preferences and settings
- Engagement metrics

### **Course Model**

- Course content and structure
- Enrollment and completion tracking
- Ratings and reviews
- AI generation metadata

### **Lesson Model**

- Individual lesson content
- Video and resource support
- Progress tracking
- Sequential ordering

### **Quiz Model**

- Multiple question types
- Automatic grading
- Attempt tracking
- Performance analytics

### **Certificate Model**

- Automated certificate generation
- Verification system
- PDF generation
- Status management

## 🔌 API Endpoints

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### **Courses**

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### **Lessons**

- `GET /api/lessons` - Get lessons
- `POST /api/lessons` - Create lesson
- `GET /api/lessons/:id` - Get lesson details
- `PUT /api/lessons/:id` - Update lesson

### **Quizzes**

- `GET /api/quizzes` - Get quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt

### **Certificates**

- `GET /api/certificates` - Get user certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/verify/:hash` - Verify certificate

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **CORS Protection** - Cross-origin resource sharing configuration
- **Rate Limiting** - API rate limiting for abuse prevention
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js for security headers
- **SQL Injection Protection** - Mongoose ODM protection

## 📈 Performance Features

- **Database Indexing** - Optimized MongoDB indexes
- **Caching** - Response caching for improved performance
- **Compression** - Response compression
- **Pagination** - Efficient data pagination
- **Lazy Loading** - Frontend lazy loading for better UX

## 🧪 Testing

### **Backend Testing**

```bash
cd backend
npm test
```

### **Frontend Testing**

```bash
cd frontend
npm test
```

## 📦 Deployment

### **Backend Deployment**

```bash
cd backend
npm run build
npm start
```

### **Frontend Deployment**

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### **Phase 1** ✅

- [x] Basic project structure
- [x] User authentication
- [x] Course management
- [x] Basic AI integration

### **Phase 2** 🚧

- [ ] Advanced AI features
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Social learning features

### **Phase 3** 📋

- [ ] Machine learning recommendations
- [ ] Virtual reality integration
- [ ] Advanced gamification
- [ ] Enterprise features

---

**Built with ❤️ by the LearnGenAI Team**
