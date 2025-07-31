<img width="1902" height="929" alt="Screenshot 2025-07-12 174818" src="https://github.com/user-attachments/assets/e89cf752-924e-49bf-9883-17b9257c1812" />

## 📌 Skill Swap Platform

A full-stack web application for skill exchange built with **Next.js, MongoDB, and JWT authentication**.

---

### 🚀 **Features**

* 🔑 **User Authentication:** Register, login, logout with JWT tokens
* 👤 **Profile Management:** Create and edit user profiles with skills
* 🔍 **Skill Discovery:** Search and filter users by skills and availability
* 🔄 **Swap Requests:** Send, receive, accept, and reject skill exchange requests
* ⚡ **Real-time Updates:** Live status updates for requests
* 📱 **Responsive Design:** Mobile-friendly interface

---

### 🛠️ **Tech Stack**

* **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
* **Backend:** Next.js API Routes, Node.js
* **Database:** MongoDB
* **Authentication:** JWT with bcrypt password hashing
* **Deployment:** Vercel (frontend), MongoDB Atlas (database)

---

### 🏁 **Getting Started**

#### ✅ Prerequisites

* Node.js 18+
* MongoDB (local or Atlas)
* npm or yarn

---

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skill-swap-platform.git
cd skill-swap-platform

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secure-jwt-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🗄️ Database Setup

The application will **automatically create the necessary collections** when you first run it.

Collections:

* `users` - User profiles and authentication data
* `swapRequests` - Skill exchange requests between users

---

### 📡 API Endpoints

#### **Authentication**

* `POST /api/auth/register` → Register new user
* `POST /api/auth/login` → Login user
* `POST /api/auth/logout` → Logout user
* `GET /api/auth/me` → Get current user
* `POST /api/auth/forgot-password` → Send password reset email

#### **Users**

* `GET /api/users` → Get public user profiles (with search/filter)
* `PUT /api/users/profile` → Update user profile

#### **Swap Requests**

* `POST /api/swap-requests` → Create new swap request
* `GET /api/swap-requests` → Get user's swap requests
* `PUT /api/swap-requests/[id]` → Accept/reject swap request

---

### 🚀 Deployment

#### **Frontend (Vercel)**

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

#### **Database (MongoDB Atlas)**

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in environment variables

---

### 🔒 Security Features

* Password hashing with **bcrypt**
* JWT token authentication
* HTTP-only cookies for token storage
* Input validation and sanitization
* Protected API routes
* CORS configuration

---

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

### 📜 License

This project is licensed under the **MIT License**.

---

### ✅ Instructions to add it:

1. Create a new file in your project root:

```
README.md
```

2. Paste the above content.
3. Commit and push:

```bash
git add README.md
git commit -m "Added README"
git push origin main
```
