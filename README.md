Skill Swap Platform
A full-stack web application for skill exchange built with Next.js, MongoDB, and JWT authentication.

Features
User Authentication: Register, login, logout with JWT tokens
Profile Management: Create and edit user profiles with skills
Skill Discovery: Search and filter users by skills and availability
Swap Requests: Send, receive, accept, and reject skill exchange requests
Real-time Updates: Live status updates for requests
Responsive Design: Mobile-friendly interface
Tech Stack
Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
Backend: Next.js API Routes, Node.js
Database: MongoDB
Authentication: JWT with bcrypt password hashing
Deployment: Vercel (frontend), MongoDB Atlas (database)
Getting Started
Prerequisites
Node.js 18+
MongoDB (local or Atlas)
npm or yarn
Installation
Clone the repository: ```bash git clone cd skill-swap-platform ```

Install dependencies: ```bash npm install ```

Set up environment variables: ```bash cp .env.local.example .env.local ```

Edit .env.local with your MongoDB connection string and JWT secret: ```env MONGODB_URI=mongodb://localhost:27017/skillswap JWT_SECRET=your-super-secure-jwt-secret-key-here NEXT_PUBLIC_APP_URL=http://localhost:3000 ```

Start the development server: ```bash npm run dev ```

Open http://localhost:3000 in your browser.

Database Setup
The application will automatically create the necessary collections when you first run it. No manual database setup is required.

Collections Created:
users - User profiles and authentication data
swapRequests - Skill exchange requests between users
API Endpoints
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
GET /api/auth/me - Get current user
POST /api/auth/forgot-password - Send password reset email
Users
GET /api/users - Get public user profiles (with search/filter)
PUT /api/users/profile - Update user profile
Swap Requests
POST /api/swap-requests - Create new swap request
GET /api/swap-requests - Get user's swap requests
PUT /api/swap-requests/[id] - Accept/reject swap request
Deployment
Frontend (Vercel)
Push your code to GitHub
Connect your repository to Vercel
Add environment variables in Vercel dashboard
Deploy
Database (MongoDB Atlas)
Create a MongoDB Atlas account
Create a new cluster
Get your connection string
Update MONGODB_URI in your environment variables
Security Features
Password hashing with bcrypt
JWT token authentication
HTTP-only cookies for token storage
Input validation and sanitization
Protected API routes
CORS configuration
Contributing
Fork the repository
Create a feature branch
Make your changes
Add tests if applicable
Submit a pull request
License
This project is licensed under the MIT License.
