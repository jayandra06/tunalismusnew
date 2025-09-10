import { NextRequest } from 'next/server'
import { GET as loginAPI } from '@/app/api/auth/login/route'

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectToDB: jest.fn(),
}))

// Mock the User model
jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 for missing credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await loginAPI(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('Email and password are required')
  })

  it('should return 401 for invalid credentials', async () => {
    const { User } = require('@/models/User')
    User.findOne.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await loginAPI(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toContain('Invalid credentials')
  })

  it('should return 200 for valid credentials', async () => {
    const { User } = require('@/models/User')
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      password: '$2a$10$hashedpassword',
    }
    User.findOne.mockResolvedValue(mockUser)

    // Mock bcrypt
    const bcrypt = require('bcryptjs')
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'correctpassword',
      }),
    })

    const response = await loginAPI(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toMatchObject({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
    })
  })
})
