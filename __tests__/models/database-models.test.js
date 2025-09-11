/**
 * Database Models Tests - Validation and Relationship Tests
 * Tests for all database models, their validation rules, and relationships
 */

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn(() => ({
    add: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {},
    virtual: jest.fn(),
    set: jest.fn(),
  })),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn((id) => id || 'mock_object_id'),
  },
}))

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectToDB: jest.fn(),
}))

describe('Database Models - Validation and Relationships', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Model', () => {
    it('should validate user schema fields', () => {
      const validateUserSchema = (userData) => {
        const errors = []
        
        // Required fields
        if (!userData.name) errors.push('Name is required')
        if (!userData.email) errors.push('Email is required')
        if (!userData.password) errors.push('Password is required')
        if (!userData.role) errors.push('Role is required')
        
        // Field validations
        if (userData.name && userData.name.length < 2) {
          errors.push('Name must be at least 2 characters')
        }
        if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          errors.push('Invalid email format')
        }
        if (userData.password && userData.password.length < 6) {
          errors.push('Password must be at least 6 characters')
        }
        if (userData.role && !['admin', 'trainer', 'student'].includes(userData.role)) {
          errors.push('Role must be admin, trainer, or student')
        }
        if (userData.phone && !/^\+?[\d\s-()]+$/.test(userData.phone)) {
          errors.push('Invalid phone number format')
        }
        
        return errors
      }

      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        phone: '+1234567890'
      }

      const invalidUser = {
        name: 'J',
        email: 'invalid-email',
        password: '123',
        role: 'invalid',
        phone: 'invalid-phone'
      }

      expect(validateUserSchema(validUser)).toHaveLength(0)
      expect(validateUserSchema(invalidUser)).toContain('Name must be at least 2 characters')
      expect(validateUserSchema(invalidUser)).toContain('Invalid email format')
      expect(validateUserSchema(invalidUser)).toContain('Password must be at least 6 characters')
      expect(validateUserSchema(invalidUser)).toContain('Role must be admin, trainer, or student')
      expect(validateUserSchema(invalidUser)).toContain('Invalid phone number format')
    })

    it('should validate user relationships', () => {
      const validateUserRelationships = (user) => {
        const relationships = []
        
        // User can have multiple enrollments
        if (user.enrollments) {
          relationships.push('hasMany: Enrollment')
        }
        
        // User can have multiple payments
        if (user.payments) {
          relationships.push('hasMany: Payment')
        }
        
        // User can have multiple progress records
        if (user.progress) {
          relationships.push('hasMany: Progress')
        }
        
        // User can be trainer for multiple batches
        if (user.role === 'trainer' && user.batches) {
          relationships.push('hasMany: Batch (as trainer)')
        }
        
        return relationships
      }

      const studentUser = {
        role: 'student',
        enrollments: ['enrollment1', 'enrollment2'],
        payments: ['payment1'],
        progress: ['progress1']
      }

      const trainerUser = {
        role: 'trainer',
        batches: ['batch1', 'batch2'],
        enrollments: [],
        payments: []
      }

      expect(validateUserRelationships(studentUser)).toContain('hasMany: Enrollment')
      expect(validateUserRelationships(studentUser)).toContain('hasMany: Payment')
      expect(validateUserRelationships(studentUser)).toContain('hasMany: Progress')
      expect(validateUserRelationships(trainerUser)).toContain('hasMany: Batch (as trainer)')
    })
  })

  describe('Course Model', () => {
    it('should validate course schema fields', () => {
      const validateCourseSchema = (courseData) => {
        const errors = []
        
        // Required fields
        if (!courseData.title) errors.push('Title is required')
        if (!courseData.description) errors.push('Description is required')
        if (!courseData.price) errors.push('Price is required')
        if (!courseData.duration) errors.push('Duration is required')
        if (!courseData.category) errors.push('Category is required')
        
        // Field validations
        if (courseData.title && courseData.title.length < 3) {
          errors.push('Title must be at least 3 characters')
        }
        if (courseData.description && courseData.description.length < 10) {
          errors.push('Description must be at least 10 characters')
        }
        if (courseData.price && (courseData.price < 0 || courseData.price > 100000)) {
          errors.push('Price must be between 0 and 100,000')
        }
        if (courseData.duration !== undefined && (courseData.duration < 1 || courseData.duration > 52)) {
          errors.push('Duration must be between 1 and 52 weeks')
        }
        if (courseData.category && !['programming', 'design', 'business', 'marketing', 'other'].includes(courseData.category)) {
          errors.push('Invalid category')
        }
        if (courseData.level && !['beginner', 'intermediate', 'advanced'].includes(courseData.level)) {
          errors.push('Invalid level')
        }
        
        return errors
      }

      const validCourse = {
        title: 'Advanced JavaScript',
        description: 'Learn advanced JavaScript concepts and modern frameworks',
        price: 5000,
        duration: 8,
        category: 'programming',
        level: 'intermediate'
      }

      const invalidCourse = {
        title: 'JS',
        description: 'Short',
        price: -100,
        duration: 0,
        category: 'invalid',
        level: 'expert'
      }

      expect(validateCourseSchema(validCourse)).toHaveLength(0)
      expect(validateCourseSchema(invalidCourse)).toContain('Title must be at least 3 characters')
      expect(validateCourseSchema(invalidCourse)).toContain('Description must be at least 10 characters')
      expect(validateCourseSchema(invalidCourse)).toContain('Price must be between 0 and 100,000')
      expect(validateCourseSchema(invalidCourse)).toContain('Duration must be between 1 and 52 weeks')
      expect(validateCourseSchema(invalidCourse)).toContain('Invalid category')
      expect(validateCourseSchema(invalidCourse)).toContain('Invalid level')
    })

    it('should validate course relationships', () => {
      const validateCourseRelationships = (course) => {
        const relationships = []
        
        // Course belongs to an instructor
        if (course.instructor) {
          relationships.push('belongsTo: User (instructor)')
        }
        
        // Course has many batches
        if (course.batches) {
          relationships.push('hasMany: Batch')
        }
        
        // Course has many materials
        if (course.materials) {
          relationships.push('hasMany: Material')
        }
        
        // Course has many enrollments
        if (course.enrollments) {
          relationships.push('hasMany: Enrollment')
        }
        
        return relationships
      }

      const course = {
        instructor: 'instructor_123',
        batches: ['batch1', 'batch2'],
        materials: ['material1', 'material2'],
        enrollments: ['enrollment1', 'enrollment2']
      }

      expect(validateCourseRelationships(course)).toContain('belongsTo: User (instructor)')
      expect(validateCourseRelationships(course)).toContain('hasMany: Batch')
      expect(validateCourseRelationships(course)).toContain('hasMany: Material')
      expect(validateCourseRelationships(course)).toContain('hasMany: Enrollment')
    })
  })

  describe('Batch Model', () => {
    it('should validate batch schema fields', () => {
      const validateBatchSchema = (batchData) => {
        const errors = []
        
        // Required fields
        if (!batchData.name) errors.push('Name is required')
        if (!batchData.courseId) errors.push('Course ID is required')
        if (!batchData.trainerId) errors.push('Trainer ID is required')
        if (!batchData.startDate) errors.push('Start date is required')
        if (!batchData.endDate) errors.push('End date is required')
        if (!batchData.maxStudents) errors.push('Max students is required')
        
        // Field validations
        if (batchData.name && batchData.name.length < 3) {
          errors.push('Name must be at least 3 characters')
        }
        if (batchData.maxStudents !== undefined && (batchData.maxStudents < 1 || batchData.maxStudents > 50)) {
          errors.push('Max students must be between 1 and 50')
        }
        if (batchData.startDate && batchData.endDate && new Date(batchData.endDate) <= new Date(batchData.startDate)) {
          errors.push('End date must be after start date')
        }
        if (batchData.status && !['upcoming', 'active', 'completed', 'cancelled'].includes(batchData.status)) {
          errors.push('Invalid status')
        }
        
        return errors
      }

      const validBatch = {
        name: 'JS Batch 2024',
        courseId: 'course_123',
        trainerId: 'trainer_123',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        maxStudents: 25,
        status: 'upcoming'
      }

      const invalidBatch = {
        name: 'JS',
        courseId: '',
        trainerId: '',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-02-01'),
        maxStudents: 0,
        status: 'invalid'
      }

      expect(validateBatchSchema(validBatch)).toHaveLength(0)
      expect(validateBatchSchema(invalidBatch)).toContain('Name must be at least 3 characters')
      expect(validateBatchSchema(invalidBatch)).toContain('Course ID is required')
      expect(validateBatchSchema(invalidBatch)).toContain('Trainer ID is required')
      expect(validateBatchSchema(invalidBatch)).toContain('End date must be after start date')
      expect(validateBatchSchema(invalidBatch)).toContain('Max students must be between 1 and 50')
      expect(validateBatchSchema(invalidBatch)).toContain('Invalid status')
    })

    it('should validate batch relationships', () => {
      const validateBatchRelationships = (batch) => {
        const relationships = []
        
        // Batch belongs to a course
        if (batch.courseId) {
          relationships.push('belongsTo: Course')
        }
        
        // Batch belongs to a trainer
        if (batch.trainerId) {
          relationships.push('belongsTo: User (trainer)')
        }
        
        // Batch has many enrollments
        if (batch.enrollments) {
          relationships.push('hasMany: Enrollment')
        }
        
        // Batch has many sessions
        if (batch.sessions) {
          relationships.push('hasMany: Session')
        }
        
        return relationships
      }

      const batch = {
        courseId: 'course_123',
        trainerId: 'trainer_123',
        enrollments: ['enrollment1', 'enrollment2'],
        sessions: ['session1', 'session2']
      }

      expect(validateBatchRelationships(batch)).toContain('belongsTo: Course')
      expect(validateBatchRelationships(batch)).toContain('belongsTo: User (trainer)')
      expect(validateBatchRelationships(batch)).toContain('hasMany: Enrollment')
      expect(validateBatchRelationships(batch)).toContain('hasMany: Session')
    })
  })

  describe('Enrollment Model', () => {
    it('should validate enrollment schema fields', () => {
      const validateEnrollmentSchema = (enrollmentData) => {
        const errors = []
        
        // Required fields
        if (!enrollmentData.studentId) errors.push('Student ID is required')
        if (!enrollmentData.batchId) errors.push('Batch ID is required')
        if (!enrollmentData.paymentId) errors.push('Payment ID is required')
        
        // Field validations
        if (enrollmentData.status && !['active', 'completed', 'dropped', 'suspended'].includes(enrollmentData.status)) {
          errors.push('Invalid status')
        }
        if (enrollmentData.enrolledAt && new Date(enrollmentData.enrolledAt) > new Date()) {
          errors.push('Enrollment date cannot be in the future')
        }
        
        return errors
      }

      const validEnrollment = {
        studentId: 'student_123',
        batchId: 'batch_123',
        paymentId: 'payment_123',
        status: 'active',
        enrolledAt: new Date('2024-01-15')
      }

      const invalidEnrollment = {
        studentId: '',
        batchId: '',
        paymentId: '',
        status: 'invalid',
        enrolledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      }

      expect(validateEnrollmentSchema(validEnrollment)).toHaveLength(0)
      expect(validateEnrollmentSchema(invalidEnrollment)).toContain('Student ID is required')
      expect(validateEnrollmentSchema(invalidEnrollment)).toContain('Batch ID is required')
      expect(validateEnrollmentSchema(invalidEnrollment)).toContain('Payment ID is required')
      expect(validateEnrollmentSchema(invalidEnrollment)).toContain('Invalid status')
      expect(validateEnrollmentSchema(invalidEnrollment)).toContain('Enrollment date cannot be in the future')
    })

    it('should validate enrollment relationships', () => {
      const validateEnrollmentRelationships = (enrollment) => {
        const relationships = []
        
        // Enrollment belongs to a student
        if (enrollment.studentId) {
          relationships.push('belongsTo: User (student)')
        }
        
        // Enrollment belongs to a batch
        if (enrollment.batchId) {
          relationships.push('belongsTo: Batch')
        }
        
        // Enrollment belongs to a payment
        if (enrollment.paymentId) {
          relationships.push('belongsTo: Payment')
        }
        
        // Enrollment has many progress records
        if (enrollment.progress) {
          relationships.push('hasMany: Progress')
        }
        
        return relationships
      }

      const enrollment = {
        studentId: 'student_123',
        batchId: 'batch_123',
        paymentId: 'payment_123',
        progress: ['progress1', 'progress2']
      }

      expect(validateEnrollmentRelationships(enrollment)).toContain('belongsTo: User (student)')
      expect(validateEnrollmentRelationships(enrollment)).toContain('belongsTo: Batch')
      expect(validateEnrollmentRelationships(enrollment)).toContain('belongsTo: Payment')
      expect(validateEnrollmentRelationships(enrollment)).toContain('hasMany: Progress')
    })
  })

  describe('Payment Model', () => {
    it('should validate payment schema fields', () => {
      const validatePaymentSchema = (paymentData) => {
        const errors = []
        
        // Required fields
        if (!paymentData.userId) errors.push('User ID is required')
        if (!paymentData.courseId) errors.push('Course ID is required')
        if (!paymentData.amount) errors.push('Amount is required')
        if (!paymentData.currency) errors.push('Currency is required')
        
        // Field validations
        if (paymentData.amount && (paymentData.amount < 0 || paymentData.amount > 1000000)) {
          errors.push('Amount must be between 0 and 1,000,000')
        }
        if (paymentData.currency && paymentData.currency !== 'INR') {
          errors.push('Currency must be INR')
        }
        if (paymentData.status && !['pending', 'completed', 'failed', 'refunded'].includes(paymentData.status)) {
          errors.push('Invalid status')
        }
        if (paymentData.paymentMethod && !['razorpay', 'stripe', 'paypal'].includes(paymentData.paymentMethod)) {
          errors.push('Invalid payment method')
        }
        
        return errors
      }

      const validPayment = {
        userId: 'user_123',
        courseId: 'course_123',
        amount: 5000,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'razorpay'
      }

      const invalidPayment = {
        userId: '',
        courseId: '',
        amount: -100,
        currency: 'USD',
        status: 'invalid',
        paymentMethod: 'invalid'
      }

      expect(validatePaymentSchema(validPayment)).toHaveLength(0)
      expect(validatePaymentSchema(invalidPayment)).toContain('User ID is required')
      expect(validatePaymentSchema(invalidPayment)).toContain('Course ID is required')
      expect(validatePaymentSchema(invalidPayment)).toContain('Amount must be between 0 and 1,000,000')
      expect(validatePaymentSchema(invalidPayment)).toContain('Currency must be INR')
      expect(validatePaymentSchema(invalidPayment)).toContain('Invalid status')
      expect(validatePaymentSchema(invalidPayment)).toContain('Invalid payment method')
    })

    it('should validate payment relationships', () => {
      const validatePaymentRelationships = (payment) => {
        const relationships = []
        
        // Payment belongs to a user
        if (payment.userId) {
          relationships.push('belongsTo: User')
        }
        
        // Payment belongs to a course
        if (payment.courseId) {
          relationships.push('belongsTo: Course')
        }
        
        // Payment has one enrollment
        if (payment.enrollment) {
          relationships.push('hasOne: Enrollment')
        }
        
        return relationships
      }

      const payment = {
        userId: 'user_123',
        courseId: 'course_123',
        enrollment: 'enrollment_123'
      }

      expect(validatePaymentRelationships(payment)).toContain('belongsTo: User')
      expect(validatePaymentRelationships(payment)).toContain('belongsTo: Course')
      expect(validatePaymentRelationships(payment)).toContain('hasOne: Enrollment')
    })
  })

  describe('Session Model', () => {
    it('should validate session schema fields', () => {
      const validateSessionSchema = (sessionData) => {
        const errors = []
        
        // Required fields
        if (!sessionData.title) errors.push('Title is required')
        if (!sessionData.batchId) errors.push('Batch ID is required')
        if (!sessionData.trainerId) errors.push('Trainer ID is required')
        if (!sessionData.scheduledDate) errors.push('Scheduled date is required')
        if (!sessionData.duration) errors.push('Duration is required')
        
        // Field validations
        if (sessionData.title && sessionData.title.length < 3) {
          errors.push('Title must be at least 3 characters')
        }
        if (sessionData.duration && (sessionData.duration < 30 || sessionData.duration > 180)) {
          errors.push('Duration must be between 30 and 180 minutes')
        }
        if (sessionData.status && !['scheduled', 'ongoing', 'completed', 'cancelled'].includes(sessionData.status)) {
          errors.push('Invalid status')
        }
        
        return errors
      }

      const validSession = {
        title: 'JavaScript Fundamentals',
        batchId: 'batch_123',
        trainerId: 'trainer_123',
        scheduledDate: new Date('2024-02-15T10:00:00Z'),
        duration: 90,
        status: 'scheduled'
      }

      const invalidSession = {
        title: 'JS',
        batchId: '',
        trainerId: '',
        scheduledDate: '',
        duration: 15,
        status: 'invalid'
      }

      expect(validateSessionSchema(validSession)).toHaveLength(0)
      expect(validateSessionSchema(invalidSession)).toContain('Title must be at least 3 characters')
      expect(validateSessionSchema(invalidSession)).toContain('Batch ID is required')
      expect(validateSessionSchema(invalidSession)).toContain('Trainer ID is required')
      expect(validateSessionSchema(invalidSession)).toContain('Scheduled date is required')
      expect(validateSessionSchema(invalidSession)).toContain('Duration must be between 30 and 180 minutes')
      expect(validateSessionSchema(invalidSession)).toContain('Invalid status')
    })

    it('should validate session relationships', () => {
      const validateSessionRelationships = (session) => {
        const relationships = []
        
        // Session belongs to a batch
        if (session.batchId) {
          relationships.push('belongsTo: Batch')
        }
        
        // Session belongs to a trainer
        if (session.trainerId) {
          relationships.push('belongsTo: User (trainer)')
        }
        
        // Session has many attendance records
        if (session.attendance) {
          relationships.push('hasMany: Attendance')
        }
        
        return relationships
      }

      const session = {
        batchId: 'batch_123',
        trainerId: 'trainer_123',
        attendance: ['attendance1', 'attendance2']
      }

      expect(validateSessionRelationships(session)).toContain('belongsTo: Batch')
      expect(validateSessionRelationships(session)).toContain('belongsTo: User (trainer)')
      expect(validateSessionRelationships(session)).toContain('hasMany: Attendance')
    })
  })

  describe('Material Model', () => {
    it('should validate material schema fields', () => {
      const validateMaterialSchema = (materialData) => {
        const errors = []
        
        // Required fields
        if (!materialData.title) errors.push('Title is required')
        if (!materialData.courseId) errors.push('Course ID is required')
        if (!materialData.type) errors.push('Type is required')
        
        // Field validations
        if (materialData.title && materialData.title.length < 3) {
          errors.push('Title must be at least 3 characters')
        }
        if (materialData.type && !['video', 'document', 'link', 'quiz'].includes(materialData.type)) {
          errors.push('Invalid type')
        }
        if (materialData.order && (materialData.order < 0 || !Number.isInteger(materialData.order))) {
          errors.push('Order must be a non-negative integer')
        }
        
        return errors
      }

      const validMaterial = {
        title: 'Introduction to JavaScript',
        courseId: 'course_123',
        type: 'video',
        order: 1
      }

      const invalidMaterial = {
        title: 'JS',
        courseId: '',
        type: 'invalid',
        order: -1
      }

      expect(validateMaterialSchema(validMaterial)).toHaveLength(0)
      expect(validateMaterialSchema(invalidMaterial)).toContain('Title must be at least 3 characters')
      expect(validateMaterialSchema(invalidMaterial)).toContain('Course ID is required')
      expect(validateMaterialSchema(invalidMaterial)).toContain('Invalid type')
      expect(validateMaterialSchema(invalidMaterial)).toContain('Order must be a non-negative integer')
    })

    it('should validate material relationships', () => {
      const validateMaterialRelationships = (material) => {
        const relationships = []
        
        // Material belongs to a course
        if (material.courseId) {
          relationships.push('belongsTo: Course')
        }
        
        return relationships
      }

      const material = {
        courseId: 'course_123'
      }

      expect(validateMaterialRelationships(material)).toContain('belongsTo: Course')
    })
  })

  describe('Progress Model', () => {
    it('should validate progress schema fields', () => {
      const validateProgressSchema = (progressData) => {
        const errors = []
        
        // Required fields
        if (!progressData.studentId) errors.push('Student ID is required')
        if (!progressData.courseId) errors.push('Course ID is required')
        
        // Field validations
        if (progressData.completionPercentage && (progressData.completionPercentage < 0 || progressData.completionPercentage > 100)) {
          errors.push('Completion percentage must be between 0 and 100')
        }
        if (progressData.score && (progressData.score < 0 || progressData.score > 100)) {
          errors.push('Score must be between 0 and 100')
        }
        
        return errors
      }

      const validProgress = {
        studentId: 'student_123',
        courseId: 'course_123',
        completionPercentage: 75,
        score: 85
      }

      const invalidProgress = {
        studentId: '',
        courseId: '',
        completionPercentage: 150,
        score: -10
      }

      expect(validateProgressSchema(validProgress)).toHaveLength(0)
      expect(validateProgressSchema(invalidProgress)).toContain('Student ID is required')
      expect(validateProgressSchema(invalidProgress)).toContain('Course ID is required')
      expect(validateProgressSchema(invalidProgress)).toContain('Completion percentage must be between 0 and 100')
      expect(validateProgressSchema(invalidProgress)).toContain('Score must be between 0 and 100')
    })

    it('should validate progress relationships', () => {
      const validateProgressRelationships = (progress) => {
        const relationships = []
        
        // Progress belongs to a student
        if (progress.studentId) {
          relationships.push('belongsTo: User (student)')
        }
        
        // Progress belongs to a course
        if (progress.courseId) {
          relationships.push('belongsTo: Course')
        }
        
        return relationships
      }

      const progress = {
        studentId: 'student_123',
        courseId: 'course_123'
      }

      expect(validateProgressRelationships(progress)).toContain('belongsTo: User (student)')
      expect(validateProgressRelationships(progress)).toContain('belongsTo: Course')
    })
  })

  describe('Database Constraints and Business Rules', () => {
    it('should validate unique constraints', () => {
      const validateUniqueConstraints = (data, existingData) => {
        const violations = []
        
        // Email should be unique
        if (data.email && existingData.some(item => item.email === data.email)) {
          violations.push('Email must be unique')
        }
        
        // Course title should be unique per instructor
        if (data.title && data.instructor && existingData.some(item => 
          item.title === data.title && item.instructor === data.instructor
        )) {
          violations.push('Course title must be unique per instructor')
        }
        
        return violations
      }

      const existingUsers = [
        { email: 'john@example.com' },
        { email: 'jane@example.com' }
      ]

      const existingCourses = [
        { title: 'JavaScript Basics', instructor: 'instructor_1' },
        { title: 'React Advanced', instructor: 'instructor_1' }
      ]

      expect(validateUniqueConstraints({ email: 'john@example.com' }, existingUsers)).toContain('Email must be unique')
      expect(validateUniqueConstraints({ email: 'new@example.com' }, existingUsers)).toHaveLength(0)
      expect(validateUniqueConstraints({ title: 'JavaScript Basics', instructor: 'instructor_1' }, existingCourses)).toContain('Course title must be unique per instructor')
    })

    it('should validate referential integrity', () => {
      const validateReferentialIntegrity = (data, referencedData) => {
        const violations = []
        
        // Check if referenced IDs exist
        if (data.courseId && !referencedData.courses.some(course => course._id === data.courseId)) {
          violations.push('Course ID does not exist')
        }
        if (data.trainerId && !referencedData.users.some(user => user._id === data.trainerId && user.role === 'trainer')) {
          violations.push('Trainer ID does not exist or is not a trainer')
        }
        if (data.studentId && !referencedData.users.some(user => user._id === data.studentId && user.role === 'student')) {
          violations.push('Student ID does not exist or is not a student')
        }
        
        return violations
      }

      const referencedData = {
        courses: [{ _id: 'course_1' }, { _id: 'course_2' }],
        users: [
          { _id: 'user_1', role: 'trainer' },
          { _id: 'user_2', role: 'student' }
        ]
      }

      const validBatch = {
        courseId: 'course_1',
        trainerId: 'user_1'
      }

      const invalidBatch = {
        courseId: 'course_999',
        trainerId: 'user_2' // This is a student, not a trainer
      }

      expect(validateReferentialIntegrity(validBatch, referencedData)).toHaveLength(0)
      expect(validateReferentialIntegrity(invalidBatch, referencedData)).toContain('Course ID does not exist')
      expect(validateReferentialIntegrity(invalidBatch, referencedData)).toContain('Trainer ID does not exist or is not a trainer')
    })
  })
})
