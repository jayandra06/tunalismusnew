import { authOptions, authorize } from '@/lib/auth'

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectToDB: jest.fn(),
}))

// Mock the User model
jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('NextAuth Configuration', () => {
    it('should have correct auth options configuration', () => {
      expect(authOptions).toBeDefined()
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].name).toBe('credentials')
      expect(authOptions.session.strategy).toBe('jwt')
      expect(authOptions.session.maxAge).toBe(30 * 24 * 60 * 60) // 30 days
    })

    it('should have correct cookie configuration', () => {
      expect(authOptions.cookies.sessionToken).toBeDefined()
      expect(authOptions.cookies.sessionToken.options.httpOnly).toBe(true)
      expect(authOptions.cookies.sessionToken.options.sameSite).toBe('lax')
      expect(authOptions.cookies.sessionToken.options.secure).toBe(process.env.NODE_ENV === 'production')
    })

    it('should have correct pages configuration', () => {
      expect(authOptions.pages.signIn).toBe('/login')
    })
  })

  describe('Credentials Provider Authorization', () => {
    it('should return null for missing credentials', async () => {
      const provider = authOptions.providers[0]
      const result = await provider.authorize({})
      expect(result).toBeNull()
    })

    it('should return null for missing email', async () => {
      const provider = authOptions.providers[0]
      const result = await provider.authorize({ password: 'password123' })
      expect(result).toBeNull()
    })

    it('should return null for missing password', async () => {
      const provider = authOptions.providers[0]
      const result = await provider.authorize({ email: 'test@example.com' })
      expect(result).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      User.findOne.mockResolvedValue(null)

      const provider = authOptions.providers[0]
      const result = await provider.authorize({
        email: 'nonexistent@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
      expect(connectToDB).toHaveBeenCalled()
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' })
    })

    it('should return null for invalid password', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      const bcrypt = require('bcryptjs')
      
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        password: '$2a$10$hashedpassword',
      }

      connectToDB.mockResolvedValue()
      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)

      const provider = authOptions.providers[0]
      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result).toBeNull()
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', '$2a$10$hashedpassword')
    })

    it('should return user object for valid credentials', async () => {
      const { User } = require('@/models/User')
      const { connectToDB } = require('@/lib/mongodb')
      const bcrypt = require('bcryptjs')
      
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        password: '$2a$10$hashedpassword',
        profileImage: 'profile.jpg'
      }

      connectToDB.mockResolvedValue()
      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)

      const provider = authOptions.providers[0]
      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'correctpassword'
      })

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        image: 'profile.jpg'
      })
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', '$2a$10$hashedpassword')
    })

    it('should handle database connection errors', async () => {
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockRejectedValue(new Error('Database connection failed'))

      const provider = authOptions.providers[0]
      const result = await provider.authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
    })
  })

  describe('JWT Callback', () => {
    it('should add user data to token', () => {
      const jwtCallback = authOptions.callbacks.jwt
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student'
      }
      const mockToken = { sub: 'user123' }

      const result = jwtCallback({ token: mockToken, user: mockUser })

      expect(result.role).toBe('student')
      expect(result.id).toBe('user123')
      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
    })

    it('should preserve existing token data when no user', () => {
      const jwtCallback = authOptions.callbacks.jwt
      const mockToken = { 
        sub: 'user123',
        role: 'student',
        email: 'test@example.com'
      }

      const result = jwtCallback({ token: mockToken, user: null })

      expect(result).toEqual(mockToken)
    })
  })

  describe('Session Callback', () => {
    it('should add token data to session', () => {
      const sessionCallback = authOptions.callbacks.session
      const mockToken = {
        sub: 'user123',
        role: 'student',
        email: 'test@example.com',
        name: 'Test User'
      }
      const mockSession = {
        user: {
          id: undefined,
          role: undefined,
          email: undefined,
          name: undefined
        }
      }

      const result = sessionCallback({ session: mockSession, token: mockToken })

      expect(result.user.id).toBe('user123')
      expect(result.user.role).toBe('student')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.name).toBe('Test User')
    })

    it('should handle missing token', () => {
      const sessionCallback = authOptions.callbacks.session
      const mockSession = {
        user: {
          id: undefined,
          role: undefined,
          email: undefined,
          name: undefined
        }
      }

      const result = sessionCallback({ session: mockSession, token: null })

      expect(result).toEqual(mockSession)
    })
  })

  describe('Authorization Helper', () => {
    it('should return false for no user role', () => {
      expect(authorize('admin', null)).toBe(false)
      expect(authorize('admin', undefined)).toBe(false)
    })

    it('should return true for admin accessing any role', () => {
      expect(authorize('admin', 'admin')).toBe(true)
      expect(authorize('trainer', 'admin')).toBe(true)
      expect(authorize('student', 'admin')).toBe(true)
    })

    it('should return true for matching roles', () => {
      expect(authorize('trainer', 'trainer')).toBe(true)
      expect(authorize('student', 'student')).toBe(true)
    })

    it('should return false for non-matching roles', () => {
      expect(authorize('admin', 'trainer')).toBe(false)
      expect(authorize('admin', 'student')).toBe(false)
      expect(authorize('trainer', 'student')).toBe(false)
    })
  })

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.NEXTAUTH_SECRET).toBeDefined()
    })

    it('should have correct debug setting', () => {
      expect(authOptions.debug).toBe(process.env.NODE_ENV === 'development')
    })
  })
})
