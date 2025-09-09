# Tunalismus - Complete Language Learning Platform

A comprehensive language learning platform with advanced admin portal, trainer dashboard, and student portal built with Next.js 15, NextAuth, and MongoDB.

## 🚀 Features

### 🔐 Authentication System
- **NextAuth Integration**: Secure authentication with JWT tokens
- **Role-based Access Control**: Admin, Trainer, and Student roles
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic session handling and refresh

### 👨‍💼 Admin Portal
- **Dashboard**: Real-time statistics and analytics
- **User Management**: Complete CRUD operations for users
- **Course Management**: Create, edit, and manage courses
- **Advanced Batch Management**: Automatic batch creation and distribution
- **Enrollment Management**: Track and manage student enrollments
- **Payment Tracking**: Monitor payments and transactions
- **Settings Panel**: Platform configuration and customization

### 🎓 Trainer Portal
- **Dashboard**: Trainer-specific analytics and overview
- **Batch Management**: Manage assigned batches
- **Student Management**: Track student progress
- **Schedule Management**: Manage class schedules
- **Materials Management**: Upload and manage course materials

### 👨‍🎓 Student Portal
- **Dashboard**: Personal learning dashboard
- **Course Access**: View enrolled courses
- **Progress Tracking**: Monitor learning progress
- **Schedule View**: View class schedules
- **Materials Access**: Download course materials

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **UI Components**: Radix UI, Lucide React
- **Styling**: Tailwind CSS with dark mode support
- **Payment**: Razorpay integration
- **Email**: Nodemailer with SMTP

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tunalismus-revision-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Email Configuration
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Application Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Seed complete data (users, courses, batches, enrollments, payments)
   npm run seed-complete
   
   # Or seed basic accounts only
   npm run seed
   
   # Clear and reseed database
   npm run clear-seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔑 Default Login Credentials

After seeding the database, you can login with:

| Role | Email | Password | Portal |
|------|-------|----------|---------|
| **Admin** | `admin@tunalismus.com` | `admin@1234` | `/admin/login` |
| **Trainer** | `trainer@tunalismus.com` | `trainer@1234` | `/trainer/login` |
| **Student** | `student@tunalismus.com` | `student@1234` | `/student/login` |

## 📊 Admin Portal Features

### Dashboard
- Real-time statistics (users, courses, revenue)
- Quick action buttons
- Visual analytics with charts
- Recent activity feed

### User Management
- Create, edit, delete users
- Role assignment (Admin, Trainer, Student)
- Status management (Active, Invited)
- Search and filtering

### Course Management
- Create courses with detailed configuration
- Batch type management (Regular, Revision)
- Pricing configuration
- Course status management
- Advanced search and filtering

### Batch Management (Advanced)
- **Automatic Batch Creation**: Based on enrollment and course settings
- **Smart Distribution**: Regular and revision batch types
- **Leftover Batch Handling**: Intelligent management of incomplete batches
- **Batch Merging**: Merge leftover batches with existing ones
- **Capacity Management**: Automatic capacity calculations
- **Instructor Assignment**: Assign trainers to batches

### Enrollment Management
- Track student enrollments
- Payment status monitoring
- Batch assignment
- Enrollment status management

### Payment Management
- Payment tracking and history
- Transaction monitoring
- Revenue analytics
- Payment method management

### Settings
- Platform configuration
- Email settings
- Payment gateway settings
- Security settings
- Notification preferences
- Appearance customization

## 🏗️ Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin portal pages
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── users/            # User management
│   │   ├── courses/          # Course management
│   │   ├── enrollments/      # Enrollment management
│   │   ├── payments/         # Payment management
│   │   └── settings/         # Platform settings
│   ├── api/                  # API routes
│   │   ├── admin/           # Admin API endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   └── ...              # Other API endpoints
│   ├── trainer/             # Trainer portal
│   ├── student/             # Student portal
│   └── ...                  # Other pages
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── layouts/             # Layout components
│   └── system/              # System components
├── lib/
│   ├── auth.js              # NextAuth configuration
│   ├── mongodb.js           # Database connection
│   └── batch-management-service.js  # Batch management logic
├── models/                  # MongoDB models
└── middleware.js            # Route protection middleware
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run seed         # Seed basic accounts
npm run seed-complete # Seed complete data
npm run clear-seed   # Clear and reseed database
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission system
- **Route Protection**: Middleware-based route security
- **Password Hashing**: bcrypt for secure password storage
- **CSRF Protection**: Built-in CSRF protection
- **Environment Variables**: Secure configuration management

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Dark Mode**: Complete dark/light theme support
- **Accessibility**: WCAG compliant components
- **Cross-browser**: Compatible with all modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Video conferencing integration
- [ ] AI-powered learning recommendations
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ using Next.js, NextAuth, and MongoDB**