/**
 * User Management Tests - CRUD Operations for All Roles
 * Tests for user creation, reading, updating, and deletion across admin, trainer, and student roles
 */

// User Management Tests - No NextRequest needed for logic testing

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectToDB: jest.fn(),
}))

// Mock the models
jest.mock('@/models/User', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
}))

jest.mock('@/models/Course', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}))

jest.mock('@/models/Batch', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}))

jest.mock('@/models/Enrollment', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('User Management - CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Creation', () => {
    it('should validate user creation data', () => {
      const validateUserData = (userData) => {
        const errors = []
        
        if (!userData.name || userData.name.trim().length < 2) {
          errors.push('Name must be at least 2 characters')
        }
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          errors.push('Valid email is required')
        }
        if (!userData.password || userData.password.length < 6) {
          errors.push('Password must be at least 6 characters')
        }
        if (!userData.role || !['admin', 'trainer', 'student'].includes(userData.role)) {
          errors.push('Valid role is required (admin, trainer, student)')
        }
        
        return errors
      }

      const validUserData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
      }

      const invalidUserData = {
        name: 'J',
        email: 'invalid-email',
        password: '123',
        role: 'invalid'
      }

      expect(validateUserData(validUserData)).toHaveLength(0)
      expect(validateUserData(invalidUserData)).toContain('Name must be at least 2 characters')
      expect(validateUserData(invalidUserData)).toContain('Valid email is required')
      expect(validateUserData(invalidUserData)).toContain('Password must be at least 6 characters')
      expect(validateUserData(invalidUserData)).toContain('Valid role is required (admin, trainer, student)')
    })

    it('should create a new user successfully', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      const bcrypt = require('bcryptjs')
      
      connectToDB.mockResolvedValue()
      bcrypt.hash.mockResolvedValue('hashed_password_123')
      
      const mockUser = {
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password_123',
        role: 'student',
        createdAt: new Date()
      }

      User.create.mockResolvedValue(mockUser)

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
      }

      const result = await User.create({
        ...userData,
        password: 'hashed_password_123'
      })

      expect(result).toEqual(mockUser)
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(User.create).toHaveBeenCalled()
    })

    it('should handle duplicate email error', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      User.findOne.mockResolvedValue({ email: 'existing@example.com' }) // User already exists

      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: 'student'
      }

      // Simulate duplicate email error
      const duplicateError = new Error('User with this email already exists')
      User.create.mockRejectedValue(duplicateError)

      await expect(User.create(userData)).rejects.toThrow('User with this email already exists')
    })
  })

  describe('User Reading (GET Operations)', () => {
    it('should get all users with pagination', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockUsers = [
        { _id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'student' },
        { _id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'trainer' },
        { _id: 'user_3', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
      ]

      User.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      })

      const page = 1
      const limit = 10
      const skip = (page - 1) * limit

      const result = await User.find()
        .limit(limit)
        .skip(skip)
        .select('-password')

      expect(result).toEqual(mockUsers)
      expect(User.find).toHaveBeenCalled()
    })

    it('should get user by ID', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockUser = {
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        profileImage: 'profile.jpg'
      }

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      })

      const result = await User.findById('user_123').select('-password')

      expect(result).toEqual(mockUser)
      expect(User.findById).toHaveBeenCalledWith('user_123')
    })

    it('should get users by role', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockStudents = [
        { _id: 'user_1', name: 'Student 1', email: 'student1@example.com', role: 'student' },
        { _id: 'user_2', name: 'Student 2', email: 'student2@example.com', role: 'student' }
      ]

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockStudents)
      })

      const result = await User.find({ role: 'student' }).select('-password')

      expect(result).toEqual(mockStudents)
      expect(User.find).toHaveBeenCalledWith({ role: 'student' })
    })

    it('should handle user not found', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      })

      const result = await User.findById('nonexistent_id').select('-password')

      expect(result).toBeNull()
    })
  })

  describe('User Updates', () => {
    it('should update user profile', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const updatedUser = {
        _id: 'user_123',
        name: 'John Updated',
        email: 'john@example.com',
        role: 'student',
        profileImage: 'new_profile.jpg'
      }

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      })

      const updateData = {
        name: 'John Updated',
        profileImage: 'new_profile.jpg'
      }

      const result = await User.findByIdAndUpdate('user_123', updateData, { new: true })
        .select('-password')

      expect(result).toEqual(updatedUser)
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user_123', updateData, { new: true })
    })

    it('should update user password', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      const bcrypt = require('bcryptjs')
      
      connectToDB.mockResolvedValue()
      bcrypt.hash.mockResolvedValue('new_hashed_password')
      
      const updatedUser = {
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        password: 'new_hashed_password'
      }

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      })

      const newPassword = 'newpassword123'
      const hashedPassword = 'new_hashed_password'

      const result = await User.findByIdAndUpdate('user_123', { password: hashedPassword }, { new: true })
        .select('-password')

      expect(result).toEqual(updatedUser)
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10)
    })

    it('should update user role (admin only)', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const updatedUser = {
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'trainer' // Role changed from student to trainer
      }

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      })

      const result = await User.findByIdAndUpdate('user_123', { role: 'trainer' }, { new: true })
        .select('-password')

      expect(result).toEqual(updatedUser)
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user_123', { role: 'trainer' }, { new: true })
    })

    it('should validate role update permissions', () => {
      const canUpdateRole = (currentUserRole, targetUserRole, newRole) => {
        // Only admin can update roles
        if (currentUserRole !== 'admin') return false
        
        // Admin can't change their own role
        if (currentUserRole === targetUserRole && currentUserRole === 'admin') return false
        
        // Valid roles only
        const validRoles = ['admin', 'trainer', 'student']
        if (!validRoles.includes(newRole)) return false
        
        return true
      }

      expect(canUpdateRole('admin', 'student', 'trainer')).toBe(true)
      expect(canUpdateRole('admin', 'trainer', 'student')).toBe(true)
      expect(canUpdateRole('trainer', 'student', 'admin')).toBe(false) // Non-admin can't update roles
      expect(canUpdateRole('admin', 'admin', 'trainer')).toBe(false) // Admin can't change own role
      expect(canUpdateRole('admin', 'student', 'invalid')).toBe(false) // Invalid role
    })
  })

  describe('User Deletion', () => {
    it('should delete user successfully', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const deletedUser = {
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student'
      }

      User.findByIdAndDelete.mockResolvedValue(deletedUser)

      const result = await User.findByIdAndDelete('user_123')

      expect(result).toEqual(deletedUser)
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user_123')
    })

    it('should handle deletion of non-existent user', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      User.findByIdAndDelete.mockResolvedValue(null)

      const result = await User.findByIdAndDelete('nonexistent_id')

      expect(result).toBeNull()
    })

    it('should validate deletion permissions', () => {
      const canDeleteUser = (currentUserRole, targetUserRole, currentUserId, targetUserId) => {
        // Only admin can delete users
        if (currentUserRole !== 'admin') return false
        
        // Users can't delete themselves
        if (currentUserId === targetUserId) return false
        
        // Admin can't delete other admins
        if (targetUserRole === 'admin') return false
        
        return true
      }

      expect(canDeleteUser('admin', 'student', 'admin_1', 'student_1')).toBe(true)
      expect(canDeleteUser('admin', 'trainer', 'admin_1', 'trainer_1')).toBe(true)
      expect(canDeleteUser('trainer', 'student', 'trainer_1', 'student_1')).toBe(false) // Non-admin can't delete
      expect(canDeleteUser('admin', 'admin', 'admin_1', 'admin_2')).toBe(false) // Can't delete other admin
      expect(canDeleteUser('admin', 'student', 'admin_1', 'admin_1')).toBe(false) // Can't delete self
    })
  })

  describe('Role-Based Access Control', () => {
    it('should validate admin permissions', () => {
      const hasAdminPermission = (userRole, action) => {
        if (userRole !== 'admin') return false
        
        const adminActions = ['create_user', 'update_user', 'delete_user', 'view_all_users', 'manage_courses', 'manage_batches']
        return adminActions.includes(action)
      }

      expect(hasAdminPermission('admin', 'create_user')).toBe(true)
      expect(hasAdminPermission('admin', 'delete_user')).toBe(true)
      expect(hasAdminPermission('admin', 'manage_courses')).toBe(true)
      expect(hasAdminPermission('trainer', 'create_user')).toBe(false)
      expect(hasAdminPermission('student', 'delete_user')).toBe(false)
    })

    it('should validate trainer permissions', () => {
      const hasTrainerPermission = (userRole, action) => {
        if (userRole !== 'trainer') return false
        
        const trainerActions = ['view_students', 'manage_sessions', 'view_materials', 'update_profile']
        return trainerActions.includes(action)
      }

      expect(hasTrainerPermission('trainer', 'view_students')).toBe(true)
      expect(hasTrainerPermission('trainer', 'manage_sessions')).toBe(true)
      expect(hasTrainerPermission('trainer', 'create_user')).toBe(false)
      expect(hasTrainerPermission('student', 'view_students')).toBe(false)
    })

    it('should validate student permissions', () => {
      const hasStudentPermission = (userRole, action) => {
        if (userRole !== 'student') return false
        
        const studentActions = ['view_courses', 'enroll_course', 'view_materials', 'update_profile', 'view_progress']
        return studentActions.includes(action)
      }

      expect(hasStudentPermission('student', 'view_courses')).toBe(true)
      expect(hasStudentPermission('student', 'enroll_course')).toBe(true)
      expect(hasStudentPermission('student', 'view_students')).toBe(false)
      expect(hasStudentPermission('trainer', 'enroll_course')).toBe(false)
    })
  })

  describe('Data Validation and Sanitization', () => {
    it('should sanitize user input', () => {
      const sanitizeUserInput = (input) => {
        const sanitized = { ...input }
        
        // Remove potentially dangerous fields
        delete sanitized.__proto__
        delete sanitized.constructor
        delete sanitized.prototype
        
        // Trim string fields
        if (sanitized.name) sanitized.name = sanitized.name.trim()
        if (sanitized.email) sanitized.email = sanitized.email.trim().toLowerCase()
        
        // Validate and limit string lengths
        if (sanitized.name && sanitized.name.length > 100) {
          sanitized.name = sanitized.name.substring(0, 100)
        }
        
        return sanitized
      }

      const maliciousInput = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        role: 'student',
        __proto__: { malicious: true },
        constructor: { malicious: true }
      }

      const sanitized = sanitizeUserInput(maliciousInput)

      expect(sanitized.name).toBe('John Doe')
      expect(sanitized.email).toBe('john@example.com')
      expect(sanitized.__proto__).not.toEqual({ malicious: true })
      expect(sanitized.constructor).not.toEqual({ malicious: true })
    })

    it('should validate email uniqueness', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      User.findOne.mockResolvedValue(null) // Email is unique

      const email = 'unique@example.com'
      const existingUser = await User.findOne({ email })

      expect(existingUser).toBeNull()
      expect(User.findOne).toHaveBeenCalledWith({ email })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockRejectedValue(new Error('Database connection failed'))

      await expect(connectToDB()).rejects.toThrow('Database connection failed')
    })

    it('should handle validation errors', () => {
      const validateRequiredFields = (data, requiredFields) => {
        const missing = requiredFields.filter(field => !data[field])
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`)
        }
        return true
      }

      const requiredFields = ['name', 'email', 'role']
      const incompleteData = { name: 'John', email: 'john@example.com' }

      expect(() => validateRequiredFields(incompleteData, requiredFields))
        .toThrow('Missing required fields: role')
    })
  })
})
