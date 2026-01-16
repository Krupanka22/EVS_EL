# Pothole Detection Platform - Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Backend Setup

### 1. Install MongoDB
Make sure MongoDB is installed and running on your system.
- Windows: Download from https://www.mongodb.com/try/download/community
- Start MongoDB service: `net start MongoDB` (run as administrator)

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create or edit the `.env` file in the backend folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pothole-detection
JWT_SECRET=your_secure_jwt_secret_key_change_this
JWT_EXPIRE=7d
```

### 4. Start Backend Server
```bash
cd backend
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The backend server will run on http://localhost:5000

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start React Development Server
```bash
npm start
```

The frontend will run on http://localhost:3000

## API Endpoints

### Citizen Authentication
- **POST** `/api/citizen/register` - Register new citizen
- **POST** `/api/citizen/login` - Citizen login
- **GET** `/api/citizen/profile/:id` - Get citizen profile

### Authority Authentication
- **POST** `/api/authority/register` - Register new authority
- **POST** `/api/authority/login` - Authority login
- **GET** `/api/authority/profile/:id` - Get authority profile

## User Types

### Citizen
- Can register and login
- Can submit pothole reports
- Can track their reports
- Earn points and badges

### Authority
- Requires admin verification after registration
- Can view and manage all reports
- Can assign teams and update report status
- Access to analytics dashboard

## Database Collections

1. **citizens** - Stores citizen user data
2. **authorities** - Stores authority user data
3. **potholereports** - Stores pothole report data (schema ready)

## Testing the Application

### Register a Citizen
1. Navigate to Citizen Login page
2. Click "Register here"
3. Fill in the registration form
4. Submit and login automatically

### Register an Authority
1. Navigate to Authority Login page
2. Click "Register here"
3. Fill in the registration form with employee details
4. Submit (account will need admin verification)
5. To test immediately, manually update the database:
   ```javascript
   // In MongoDB shell or Compass
   db.authorities.updateOne(
     { email: "your@email.com" },
     { $set: { isVerified: true } }
   )
   ```

## Default MongoDB Connection
- Host: localhost
- Port: 27017
- Database: pothole-detection

## Security Notes
- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add HTTPS in production
- Validate and sanitize all inputs

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### CORS Error
- Backend already configured with CORS
- Ensure backend is running on port 5000
- Check frontend API URLs point to localhost:5000

### Port Already in Use
- Change PORT in backend .env file
- Update frontend API URLs accordingly
