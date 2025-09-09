# Multi-Portal Authentication System

## Overview

This project now features a comprehensive multi-portal authentication system with role-based access control for three distinct user types: **Admin**, **Trainer**, and **Student**. Each portal has its own dedicated login interface, dashboard, and feature set.

## 🚀 Features

### ✅ Completed Features

1. **Separate Login Portals**
   - `/admin/login` - Admin portal login (Red theme)
   - `/trainer/login` - Trainer portal login (Blue theme)
   - `/student/login` - Student portal login (Green theme)
   - `/login` - Universal login with portal selection

2. **Role-Based Access Control**
   - Admin: Full system access
   - Trainer: Training management access
   - Student: Learning platform access
   - Hierarchical permissions (Admin > Trainer > Student)

3. **Enhanced Middleware**
   - Portal-specific route protection
   - Automatic role-based redirects
   - API route authorization
   - Token validation and refresh

4. **Dashboard Layouts**
   - Admin Dashboard: System management, analytics, user management
   - Trainer Dashboard: Batch management, student progress, materials
   - Student Dashboard: Course access, progress tracking, schedule

5. **Security Features**
   - JWT-based authentication
   - Role-based API protection
   - Unauthorized access handling
   - Session management

## 🏗️ Architecture

### File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.js          # Admin login portal
│   │   └── dashboard/
│   │       ├── layout.js          # Admin dashboard layout
│   │       └── page.js            # Admin dashboard main page
│   ├── trainer/
│   │   ├── login/page.js          # Trainer login portal
│   │   └── dashboard/
│   │       ├── layout.js          # Trainer dashboard layout
│   │       └── page.js            # Trainer dashboard main page
│   ├── student/
│   │   ├── login/page.js          # Student login portal
│   │   └── dashboard/
│   │       ├── layout.js          # Student dashboard layout
│   │       └── page.js            # Student dashboard main page
│   ├── login/page.js              # Universal login page
│   ├── unauthorized/page.js       # Access denied page
│   └── api/
│       ├── admin/stats/route.js   # Admin statistics API
│       ├── trainer/stats/route.js # Trainer statistics API
│       └── student/stats/route.js # Student statistics API
├── middleware.js                  # Enhanced route protection
└── providers/
    └── auth-provider.jsx          # Updated auth context
```

### Authentication Flow

1. **User Access**: User visits portal-specific login or universal login
2. **Role Validation**: System validates credentials and role
3. **Token Generation**: JWT token created with user ID and role
4. **Portal Redirect**: User redirected to appropriate dashboard
5. **Route Protection**: Middleware validates access to protected routes
6. **Session Management**: Token stored in localStorage, validated on each request

## 🎨 Portal Themes

### Admin Portal (Red Theme)
- **Primary Color**: Red (#DC2626)
- **Features**: System management, user administration, analytics
- **Access Level**: Full system access

### Trainer Portal (Blue Theme)
- **Primary Color**: Blue (#2563EB)
- **Features**: Batch management, student progress, materials
- **Access Level**: Training management access

### Student Portal (Green Theme)
- **Primary Color**: Green (#16A34A)
- **Features**: Course access, progress tracking, schedule
- **Access Level**: Learning platform access

## 🔐 Security Implementation

### Middleware Protection

```javascript
// Route protection based on role hierarchy
if (pathname.startsWith("/admin/") && payload.role !== "admin") {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

if (pathname.startsWith("/trainer/") && !["admin", "trainer"].includes(payload.role)) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

if (pathname.startsWith("/student/") && !["admin", "trainer", "student"].includes(payload.role)) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
```

### API Route Protection

```javascript
// API routes protected by role
if (pathname.startsWith("/api/admin/") && payload.role !== "admin") {
  return NextResponse.json({ message: "Admin access required" }, { status: 403 });
}
```

## 🚦 Usage Guide

### For Developers

1. **Adding New Protected Routes**:
   ```javascript
   // Add to middleware.js matcher
   export const config = {
     matcher: ["/api/:path*", "/admin/:path*", "/trainer/:path*", "/student/:path*"]
   };
   ```

2. **Creating Role-Specific Components**:
   ```javascript
   // Use auth context to check user role
   const { user, isAuthenticated } = useAuth();
   
   if (user?.role === 'admin') {
     // Admin-specific content
   }
   ```

3. **API Route Protection**:
   ```javascript
   // Check user role in API routes
   const userRole = req.headers.get("X-User-Role");
   if (userRole !== "admin") {
     return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
   }
   ```

### For Users

1. **Admin Access**:
   - Visit `/admin/login`
   - Use admin credentials
   - Access full system management

2. **Trainer Access**:
   - Visit `/trainer/login`
   - Use trainer credentials
   - Manage batches and students

3. **Student Access**:
   - Visit `/student/login`
   - Use student credentials
   - Access learning materials

## 🔧 Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key

# Database
MONGODB_URI=your-mongodb-connection-string

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### User Roles

```javascript
// Defined in src/lib/auth.js
const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer", 
  STUDENT: "student",
};

const roleHierarchy = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.TRAINER, ROLES.STUDENT],
  [ROLES.TRAINER]: [ROLES.TRAINER, ROLES.STUDENT],
  [ROLES.STUDENT]: [ROLES.STUDENT],
};
```

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Portals**:
   - Admin: http://localhost:3000/admin/login
   - Trainer: http://localhost:3000/trainer/login
   - Student: http://localhost:3000/student/login
   - Universal: http://localhost:3000/login

## 📊 Dashboard Features

### Admin Dashboard
- System statistics overview
- User management
- Course management
- Payment tracking
- Analytics and reports

### Trainer Dashboard
- Batch management
- Student progress tracking
- Session scheduling
- Material management
- Performance metrics

### Student Dashboard
- Course enrollment
- Progress tracking
- Schedule viewing
- Material downloads
- Certificate management

## 🔄 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile responsiveness improvements
- [ ] Multi-language support
- [ ] Advanced role permissions
- [ ] Audit logging
- [ ] Two-factor authentication

## 🐛 Troubleshooting

### Common Issues

1. **Unauthorized Access**:
   - Check user role in database
   - Verify JWT token validity
   - Ensure proper middleware configuration

2. **Redirect Loops**:
   - Check middleware matcher configuration
   - Verify route protection logic
   - Ensure proper token handling

3. **Dashboard Not Loading**:
   - Check API route permissions
   - Verify database connections
   - Check console for errors

## 📝 License

This project is part of the Tunalismus learning platform.

---

**Note**: This authentication system is built on top of your existing custom JWT implementation, providing a robust, scalable, and secure multi-portal experience for all user types.

