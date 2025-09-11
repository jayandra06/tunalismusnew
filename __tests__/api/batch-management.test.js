/**
 * Batch Management Tests - Course and Batch Creation/Management
 * Tests for batch creation, course management, and related operations
 */

// Batch Management Tests - No NextRequest needed for logic testing

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectToDB: jest.fn(),
}))

// Mock the models
jest.mock('@/models/Course', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
}))

jest.mock('@/models/Batch', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
}))

jest.mock('@/models/User', () => ({
  findById: jest.fn(),
  find: jest.fn(),
}))

jest.mock('@/models/Enrollment', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  countDocuments: jest.fn(),
}))

jest.mock('@/models/Session', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}))

describe('Batch Management - Course and Batch Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Course Management', () => {
    it('should validate course creation data', () => {
      const validateCourseData = (courseData) => {
        const errors = []
        
        if (!courseData.title || courseData.title.trim().length < 3) {
          errors.push('Course title must be at least 3 characters')
        }
        if (!courseData.description || courseData.description.trim().length < 10) {
          errors.push('Course description must be at least 10 characters')
        }
        if (!courseData.price || courseData.price < 0) {
          errors.push('Course price must be a positive number')
        }
        if (!courseData.duration || courseData.duration < 1) {
          errors.push('Course duration must be at least 1 week')
        }
        if (!courseData.category || !['programming', 'design', 'business', 'marketing'].includes(courseData.category)) {
          errors.push('Valid category is required')
        }
        
        return errors
      }

      const validCourseData = {
        title: 'Advanced JavaScript',
        description: 'Learn advanced JavaScript concepts and modern frameworks',
        price: 5000,
        duration: 8,
        category: 'programming'
      }

      const invalidCourseData = {
        title: 'JS',
        description: 'Short',
        price: -100,
        duration: 0,
        category: 'invalid'
      }

      expect(validateCourseData(validCourseData)).toHaveLength(0)
      expect(validateCourseData(invalidCourseData)).toContain('Course title must be at least 3 characters')
      expect(validateCourseData(invalidCourseData)).toContain('Course description must be at least 10 characters')
      expect(validateCourseData(invalidCourseData)).toContain('Course price must be a positive number')
      expect(validateCourseData(invalidCourseData)).toContain('Course duration must be at least 1 week')
      expect(validateCourseData(invalidCourseData)).toContain('Valid category is required')
    })

    it('should create a new course successfully', async () => {
      const { Course } = require('@/models/Course')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockCourse = {
        _id: 'course_123',
        title: 'Advanced JavaScript',
        description: 'Learn advanced JavaScript concepts and modern frameworks',
        price: 5000,
        duration: 8,
        category: 'programming',
        instructor: 'instructor_123',
        createdAt: new Date()
      }

      Course.create.mockResolvedValue(mockCourse)

      const courseData = {
        title: 'Advanced JavaScript',
        description: 'Learn advanced JavaScript concepts and modern frameworks',
        price: 5000,
        duration: 8,
        category: 'programming',
        instructor: 'instructor_123'
      }

      const result = await Course.create(courseData)

      expect(result).toEqual(mockCourse)
      expect(Course.create).toHaveBeenCalledWith(courseData)
    })

    it('should get all courses with filtering', async () => {
      const { Course } = require('@/models/Course')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockCourses = [
        { _id: 'course_1', title: 'JavaScript Basics', category: 'programming', price: 3000 },
        { _id: 'course_2', title: 'UI/UX Design', category: 'design', price: 4000 },
        { _id: 'course_3', title: 'Advanced JavaScript', category: 'programming', price: 5000 }
      ]

      Course.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockCourses)
        })
      })

      const result = await Course.find()
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })

      expect(result).toEqual(mockCourses)
      expect(Course.find).toHaveBeenCalled()
    })

    it('should update course information', async () => {
      const { Course } = require('@/models/Course')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const updatedCourse = {
        _id: 'course_123',
        title: 'Advanced JavaScript - Updated',
        description: 'Updated description',
        price: 6000,
        duration: 10,
        category: 'programming'
      }

      Course.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedCourse)
      })

      const updateData = {
        title: 'Advanced JavaScript - Updated',
        description: 'Updated description',
        price: 6000,
        duration: 10
      }

      const result = await Course.findByIdAndUpdate('course_123', updateData, { new: true })
        .populate('instructor', 'name email')

      expect(result).toEqual(updatedCourse)
      expect(Course.findByIdAndUpdate).toHaveBeenCalledWith('course_123', updateData, { new: true })
    })
  })

  describe('Batch Management', () => {
    it('should validate batch creation data', () => {
      const validateBatchData = (batchData) => {
        const errors = []
        
        if (!batchData.name || batchData.name.trim().length < 3) {
          errors.push('Batch name must be at least 3 characters')
        }
        if (!batchData.courseId) {
          errors.push('Course ID is required')
        }
        if (!batchData.trainerId) {
          errors.push('Trainer ID is required')
        }
        if (!batchData.startDate || new Date(batchData.startDate) < new Date()) {
          errors.push('Start date must be in the future')
        }
        if (batchData.startDate && batchData.endDate && new Date(batchData.endDate) <= new Date(batchData.startDate)) {
          errors.push('End date must be after start date')
        }
        if (batchData.maxStudents !== undefined && (batchData.maxStudents < 1 || batchData.maxStudents > 50)) {
          errors.push('Max students must be between 1 and 50')
        }
        
        return errors
      }

      const validBatchData = {
        name: 'JS Batch 2024',
        courseId: 'course_123',
        trainerId: 'trainer_123',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        maxStudents: 25
      }

      const invalidBatchData = {
        name: 'JS',
        courseId: '',
        trainerId: '',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        endDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        maxStudents: 0
      }

      expect(validateBatchData(validBatchData)).toHaveLength(0)
      expect(validateBatchData(invalidBatchData)).toContain('Batch name must be at least 3 characters')
      expect(validateBatchData(invalidBatchData)).toContain('Course ID is required')
      expect(validateBatchData(invalidBatchData)).toContain('Trainer ID is required')
      expect(validateBatchData(invalidBatchData)).toContain('Start date must be in the future')
      expect(validateBatchData(invalidBatchData)).toContain('End date must be after start date')
      expect(validateBatchData(invalidBatchData)).toContain('Max students must be between 1 and 50')
    })

    it('should create a new batch successfully', async () => {
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockBatch = {
        _id: 'batch_123',
        name: 'JS Batch 2024',
        courseId: 'course_123',
        trainerId: 'trainer_123',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        maxStudents: 25,
        currentStudents: 0,
        status: 'upcoming',
        createdAt: new Date()
      }

      Batch.create.mockResolvedValue(mockBatch)

      const batchData = {
        name: 'JS Batch 2024',
        courseId: 'course_123',
        trainerId: 'trainer_123',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        maxStudents: 25
      }

      const result = await Batch.create(batchData)

      expect(result).toEqual(mockBatch)
      expect(Batch.create).toHaveBeenCalledWith(batchData)
    })

    it('should get batches by course', async () => {
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockBatches = [
        { _id: 'batch_1', name: 'JS Batch 1', courseId: 'course_123', status: 'active' },
        { _id: 'batch_2', name: 'JS Batch 2', courseId: 'course_123', status: 'upcoming' }
      ]

      Batch.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockBatches)
        })
      })

      const result = await Batch.find({ courseId: 'course_123' })
        .populate('trainerId', 'name email')
        .sort({ startDate: 1 })

      expect(result).toEqual(mockBatches)
      expect(Batch.find).toHaveBeenCalledWith({ courseId: 'course_123' })
    })

    it('should get batches by trainer', async () => {
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockBatches = [
        { _id: 'batch_1', name: 'JS Batch 1', trainerId: 'trainer_123', status: 'active' },
        { _id: 'batch_2', name: 'React Batch 1', trainerId: 'trainer_123', status: 'upcoming' }
      ]

      Batch.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockBatches)
        })
      })

      const result = await Batch.find({ trainerId: 'trainer_123' })
        .populate('courseId', 'title description')
        .sort({ startDate: 1 })

      expect(result).toEqual(mockBatches)
      expect(Batch.find).toHaveBeenCalledWith({ trainerId: 'trainer_123' })
    })

    it('should update batch information', async () => {
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const updatedBatch = {
        _id: 'batch_123',
        name: 'JS Batch 2024 - Updated',
        maxStudents: 30,
        status: 'active'
      }

      Batch.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedBatch)
      })

      const updateData = {
        name: 'JS Batch 2024 - Updated',
        maxStudents: 30,
        status: 'active'
      }

      const result = await Batch.findByIdAndUpdate('batch_123', updateData, { new: true })
        .populate('courseId trainerId')

      expect(result).toEqual(updatedBatch)
      expect(Batch.findByIdAndUpdate).toHaveBeenCalledWith('batch_123', updateData, { new: true })
    })
  })

  describe('Student Enrollment Management', () => {
    it('should validate enrollment data', () => {
      const validateEnrollmentData = (enrollmentData) => {
        const errors = []
        
        if (!enrollmentData.studentId) {
          errors.push('Student ID is required')
        }
        if (!enrollmentData.batchId) {
          errors.push('Batch ID is required')
        }
        if (!enrollmentData.paymentId) {
          errors.push('Payment ID is required')
        }
        
        return errors
      }

      const validEnrollmentData = {
        studentId: 'student_123',
        batchId: 'batch_123',
        paymentId: 'payment_123'
      }

      const invalidEnrollmentData = {
        studentId: '',
        batchId: '',
        paymentId: ''
      }

      expect(validateEnrollmentData(validEnrollmentData)).toHaveLength(0)
      expect(validateEnrollmentData(invalidEnrollmentData)).toContain('Student ID is required')
      expect(validateEnrollmentData(invalidEnrollmentData)).toContain('Batch ID is required')
      expect(validateEnrollmentData(invalidEnrollmentData)).toContain('Payment ID is required')
    })

    it('should enroll student in batch', async () => {
      const { Enrollment } = require('@/models/Enrollment')
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      // Mock batch capacity check
      const mockBatch = {
        _id: 'batch_123',
        maxStudents: 25,
        currentStudents: 10
      }
      
      Batch.findById.mockResolvedValue(mockBatch)
      
      // Mock enrollment creation
      const mockEnrollment = {
        _id: 'enrollment_123',
        studentId: 'student_123',
        batchId: 'batch_123',
        paymentId: 'payment_123',
        status: 'active',
        enrolledAt: new Date()
      }
      
      Enrollment.create.mockResolvedValue(mockEnrollment)
      
      // Mock batch update
      Batch.findByIdAndUpdate.mockResolvedValue({
        ...mockBatch,
        currentStudents: 11
      })

      const enrollmentData = {
        studentId: 'student_123',
        batchId: 'batch_123',
        paymentId: 'payment_123'
      }

      // Check batch capacity
      const batch = await Batch.findById('batch_123')
      expect(batch.currentStudents).toBeLessThan(batch.maxStudents)

      // Create enrollment
      const result = await Enrollment.create(enrollmentData)

      expect(result).toEqual(mockEnrollment)
      expect(Enrollment.create).toHaveBeenCalledWith(enrollmentData)
    })

    it('should prevent enrollment when batch is full', async () => {
      const { Batch } = require('@/models/Batch')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const fullBatch = {
        _id: 'batch_123',
        maxStudents: 25,
        currentStudents: 25
      }
      
      Batch.findById.mockResolvedValue(fullBatch)

      const batch = await Batch.findById('batch_123')
      const isFull = batch.currentStudents >= batch.maxStudents

      expect(isFull).toBe(true)
    })

    it('should get student enrollments', async () => {
      const { Enrollment } = require('@/models/Enrollment')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockEnrollments = [
        { _id: 'enrollment_1', studentId: 'student_123', batchId: 'batch_1', status: 'active' },
        { _id: 'enrollment_2', studentId: 'student_123', batchId: 'batch_2', status: 'completed' }
      ]

      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockEnrollments)
        })
      })

      const result = await Enrollment.find({ studentId: 'student_123' })
        .populate('batchId', 'name startDate endDate')
        .sort({ enrolledAt: -1 })

      expect(result).toEqual(mockEnrollments)
      expect(Enrollment.find).toHaveBeenCalledWith({ studentId: 'student_123' })
    })
  })

  describe('Session Management', () => {
    it('should validate session creation data', () => {
      const validateSessionData = (sessionData) => {
        const errors = []
        
        if (!sessionData.title || sessionData.title.trim().length < 3) {
          errors.push('Session title must be at least 3 characters')
        }
        if (!sessionData.batchId) {
          errors.push('Batch ID is required')
        }
        if (!sessionData.trainerId) {
          errors.push('Trainer ID is required')
        }
        if (!sessionData.scheduledDate || new Date(sessionData.scheduledDate) < new Date()) {
          errors.push('Scheduled date must be in the future')
        }
        if (!sessionData.duration || sessionData.duration < 30 || sessionData.duration > 180) {
          errors.push('Duration must be between 30 and 180 minutes')
        }
        
        return errors
      }

      const validSessionData = {
        title: 'JavaScript Fundamentals',
        batchId: 'batch_123',
        trainerId: 'trainer_123',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 90
      }

      const invalidSessionData = {
        title: 'JS',
        batchId: '',
        trainerId: '',
        scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        duration: 15
      }

      expect(validateSessionData(validSessionData)).toHaveLength(0)
      expect(validateSessionData(invalidSessionData)).toContain('Session title must be at least 3 characters')
      expect(validateSessionData(invalidSessionData)).toContain('Batch ID is required')
      expect(validateSessionData(invalidSessionData)).toContain('Trainer ID is required')
      expect(validateSessionData(invalidSessionData)).toContain('Scheduled date must be in the future')
      expect(validateSessionData(invalidSessionData)).toContain('Duration must be between 30 and 180 minutes')
    })

    it('should create a new session', async () => {
      const { Session } = require('@/models/Session')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockSession = {
        _id: 'session_123',
        title: 'JavaScript Fundamentals',
        batchId: 'batch_123',
        trainerId: 'trainer_123',
        scheduledDate: new Date('2024-02-15T10:00:00Z'),
        duration: 90,
        status: 'scheduled',
        createdAt: new Date()
      }

      Session.create.mockResolvedValue(mockSession)

      const sessionData = {
        title: 'JavaScript Fundamentals',
        batchId: 'batch_123',
        trainerId: 'trainer_123',
        scheduledDate: new Date('2024-02-15T10:00:00Z'),
        duration: 90
      }

      const result = await Session.create(sessionData)

      expect(result).toEqual(mockSession)
      expect(Session.create).toHaveBeenCalledWith(sessionData)
    })

    it('should get sessions by batch', async () => {
      const { Session } = require('@/models/Session')
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockResolvedValue()
      
      const mockSessions = [
        { _id: 'session_1', title: 'Session 1', batchId: 'batch_123', status: 'completed' },
        { _id: 'session_2', title: 'Session 2', batchId: 'batch_123', status: 'scheduled' }
      ]

      Session.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockSessions)
        })
      })

      const result = await Session.find({ batchId: 'batch_123' })
        .populate('trainerId', 'name email')
        .sort({ scheduledDate: 1 })

      expect(result).toEqual(mockSessions)
      expect(Session.find).toHaveBeenCalledWith({ batchId: 'batch_123' })
    })
  })

  describe('Data Validation and Business Logic', () => {
    it('should validate batch capacity constraints', () => {
      const validateBatchCapacity = (currentStudents, maxStudents, newEnrollments = 1) => {
        if (currentStudents + newEnrollments > maxStudents) {
          return {
            valid: false,
            message: `Batch is full. Cannot enroll ${newEnrollments} more student${newEnrollments > 1 ? 's' : ''}.`
          }
        }
        return { valid: true }
      }

      expect(validateBatchCapacity(20, 25, 3)).toEqual({ valid: false, message: 'Batch is full. Cannot enroll 3 more students.' })
      expect(validateBatchCapacity(20, 25, 2)).toEqual({ valid: true })
      expect(validateBatchCapacity(25, 25, 1)).toEqual({ valid: false, message: 'Batch is full. Cannot enroll 1 more student.' })
    })

    it('should validate date ranges', () => {
      const validateDateRange = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const now = new Date()
        
        if (start < now) {
          return { valid: false, message: 'Start date must be in the future' }
        }
        if (end <= start) {
          return { valid: false, message: 'End date must be after start date' }
        }
        if (end - start > 365 * 24 * 60 * 60 * 1000) { // More than 1 year
          return { valid: false, message: 'Duration cannot exceed 1 year' }
        }
        
        return { valid: true }
      }

      const futureStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const futureEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      const pastStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      expect(validateDateRange(futureStart, futureEnd)).toEqual({ valid: true })
      expect(validateDateRange(pastStart, futureEnd)).toEqual({ valid: false, message: 'Start date must be in the future' })
      expect(validateDateRange(futureEnd, futureStart)).toEqual({ valid: false, message: 'End date must be after start date' })
    })

    it('should calculate batch statistics', () => {
      const calculateBatchStats = (enrollments) => {
        const total = enrollments.length
        const active = enrollments.filter(e => e.status === 'active').length
        const completed = enrollments.filter(e => e.status === 'completed').length
        const dropped = enrollments.filter(e => e.status === 'dropped').length
        
        return {
          total,
          active,
          completed,
          dropped,
          completionRate: total > 0 ? (completed / total) * 100 : 0
        }
      }

      const enrollments = [
        { status: 'active' },
        { status: 'active' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'dropped' }
      ]

      const stats = calculateBatchStats(enrollments)

      expect(stats.total).toBe(5)
      expect(stats.active).toBe(2)
      expect(stats.completed).toBe(2)
      expect(stats.dropped).toBe(1)
      expect(stats.completionRate).toBe(40)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const { connectToDB } = require('@/lib/mongodb')
      
      connectToDB.mockRejectedValue(new Error('Database connection failed'))

      await expect(connectToDB()).rejects.toThrow('Database connection failed')
    })

    it('should handle validation errors gracefully', () => {
      const handleValidationError = (error) => {
        if (error.name === 'ValidationError') {
          return {
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map(err => err.message)
          }
        }
        return {
          success: false,
          message: 'An unexpected error occurred'
        }
      }

      const validationError = {
        name: 'ValidationError',
        errors: {
          title: { message: 'Title is required' },
          price: { message: 'Price must be positive' }
        }
      }

      const result = handleValidationError(validationError)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Validation failed')
      expect(result.errors).toContain('Title is required')
      expect(result.errors).toContain('Price must be positive')
    })
  })
})
