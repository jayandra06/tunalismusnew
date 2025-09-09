import Course from "../models/Course.js";
import Batch from "../models/Batch.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

/**
 * Batch Management Service
 * Handles automatic batch creation, splitting, and leftover student management
 */

export class BatchManagementService {
  
  /**
   * Create batches for a course based on enrollment and configuration
   * @param {string} courseId - The course ID
   * @param {Object} options - Batch creation options
   * @returns {Object} Batch creation result with leftover information
   */
  static async createBatchesForCourse(courseId, options = {}) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Get current enrollments for the course
      const enrollments = await Enrollment.find({ 
        course: courseId, 
        status: { $in: ['enrolled', 'active'] } 
      });

      // Group enrollments by batch type
      const regularEnrollments = enrollments.filter(e => e.batchType === 'regular');
      const revisionEnrollments = enrollments.filter(e => e.batchType === 'revision');

      const result = {
        course: course,
        batches: [],
        leftoverBatches: [],
        summary: {
          totalStudents: enrollments.length,
          regularStudents: regularEnrollments.length,
          revisionStudents: revisionEnrollments.length,
          totalBatches: 0,
          leftoverStudents: 0
        }
      };

      // Create batches for regular students (even if no enrollments yet)
      if (course.batchTypes.regular.enabled) {
        const regularResult = await this.createBatchesForType(
          courseId, 
          'regular', 
          regularEnrollments, 
          course.batchSizeLimit,
          course.courseDuration,
          course.month,
          course.year
        );
        result.batches.push(...regularResult.batches);
        result.leftoverBatches.push(...regularResult.leftoverBatches);
      }

      // Create batches for revision students (even if no enrollments yet)
      if (course.batchTypes.revision.enabled) {
        const revisionResult = await this.createBatchesForType(
          courseId, 
          'revision', 
          revisionEnrollments, 
          course.batchSizeLimit,
          course.courseDuration,
          course.month,
          course.year
        );
        result.batches.push(...revisionResult.batches);
        result.leftoverBatches.push(...revisionResult.leftoverBatches);
      }

      // Update summary
      result.summary.totalBatches = result.batches.length;
      result.summary.leftoverStudents = result.leftoverBatches.reduce((sum, batch) => sum + batch.currentStudents, 0);

      return result;

    } catch (error) {
      console.error('Error creating batches for course:', error);
      throw error;
    }
  }

  /**
   * Create batches for a specific batch type (regular or revision)
   * @param {string} courseId - The course ID
   * @param {string} batchType - 'regular' or 'revision'
   * @param {Array} enrollments - Array of enrollments
   * @param {number} batchSizeLimit - Maximum students per batch
   * @param {number} courseDuration - Course duration in months
   * @param {number} month - Course month
   * @param {number} year - Course year
   * @returns {Object} Batch creation result
   */
  static async createBatchesForType(courseId, batchType, enrollments, batchSizeLimit, courseDuration, month, year) {
    const result = {
      batches: [],
      leftoverBatches: []
    };

    // If no enrollments, create at least one empty batch for the course
    if (enrollments.length === 0) {
      const existingBatches = await Batch.find({ 
        course: courseId, 
        batchType: batchType 
      }).sort({ batchNumber: -1 });
      
      const nextBatchNumber = existingBatches.length > 0 ? existingBatches[0].batchNumber + 1 : 1;

      const emptyBatch = await this.createBatch(
        courseId,
        batchType,
        nextBatchNumber,
        batchSizeLimit,
        [], // No enrollments
        courseDuration,
        month,
        year
      );

      result.batches.push(emptyBatch);
      return result;
    }

    // Calculate number of full batches
    const fullBatches = Math.floor(enrollments.length / batchSizeLimit);
    const leftoverStudents = enrollments.length % batchSizeLimit;

    // Get existing batch count for this type
    const existingBatches = await Batch.find({ 
      course: courseId, 
      batchType: batchType 
    }).sort({ batchNumber: -1 });
    
    const nextBatchNumber = existingBatches.length > 0 ? existingBatches[0].batchNumber + 1 : 1;

    // Create full batches
    for (let i = 0; i < fullBatches; i++) {
      const batchNumber = nextBatchNumber + i;
      const startIndex = i * batchSizeLimit;
      const endIndex = startIndex + batchSizeLimit;
      const batchEnrollments = enrollments.slice(startIndex, endIndex);

      const batch = await this.createBatch(
        courseId,
        batchType,
        batchNumber,
        batchSizeLimit,
        batchEnrollments,
        courseDuration,
        month,
        year
      );

      result.batches.push(batch);
    }

    // Handle leftover students
    if (leftoverStudents > 0) {
      const leftoverBatchNumber = nextBatchNumber + fullBatches;
      const startIndex = fullBatches * batchSizeLimit;
      const leftoverEnrollments = enrollments.slice(startIndex);

      const leftoverBatch = await this.createBatch(
        courseId,
        batchType,
        leftoverBatchNumber,
        batchSizeLimit,
        leftoverEnrollments,
        courseDuration,
        month,
        year,
        true // isLeftoverBatch
      );

      result.leftoverBatches.push(leftoverBatch);
    }

    return result;
  }

  /**
   * Create a single batch
   * @param {string} courseId - The course ID
   * @param {string} batchType - 'regular' or 'revision'
   * @param {number} batchNumber - Batch number
   * @param {number} maxStudents - Maximum students for the batch
   * @param {Array} enrollments - Array of enrollments to assign
   * @param {number} courseDuration - Course duration in months
   * @param {number} month - Course month
   * @param {number} year - Course year
   * @param {boolean} isLeftoverBatch - Whether this is a leftover batch
   * @returns {Object} Created batch
   */
  static async createBatch(courseId, batchType, batchNumber, maxStudents, enrollments, courseDuration, month, year, isLeftoverBatch = false) {
    // Get course to inherit instructor
    const course = await Course.findById(courseId);
    
    // Calculate start and end dates
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month - 1 + courseDuration, 0); // Last day of the final month

    const batch = new Batch({
      batchNumber,
      batchType,
      course: courseId,
      maxStudents,
      currentStudents: enrollments.length,
      startDate,
      endDate,
      duration: courseDuration,
      isLeftoverBatch,
      status: 'upcoming',
      instructor: course?.instructor || null, // Inherit instructor from course
      name: `${batchType.charAt(0).toUpperCase() + batchType.slice(1)} Batch ${batchNumber}` // Add name field
    });

    await batch.save();

    // Assign enrollments to the batch
    for (const enrollment of enrollments) {
      enrollment.batch = batch._id;
      await enrollment.save();
    }

    return batch;
  }

  /**
   * Handle leftover batch - merge or leave as separate
   * @param {string} batchId - The leftover batch ID
   * @param {string} action - 'merge' or 'leave'
   * @param {string} targetBatchId - Target batch ID for merging (if action is 'merge')
   * @returns {Object} Result of the action
   */
  static async handleLeftoverBatch(batchId, action, targetBatchId = null) {
    try {
      const leftoverBatch = await Batch.findById(batchId);
      if (!leftoverBatch) {
        throw new Error('Leftover batch not found');
      }

      if (!leftoverBatch.isLeftoverBatch) {
        throw new Error('Batch is not a leftover batch');
      }

      if (action === 'merge' && targetBatchId) {
        return await this.mergeBatches(leftoverBatch, targetBatchId);
      } else if (action === 'leave') {
        // Just mark as confirmed (no longer a leftover batch)
        leftoverBatch.isLeftoverBatch = false;
        await leftoverBatch.save();
        return { success: true, message: 'Leftover batch kept as separate batch' };
      } else {
        throw new Error('Invalid action or missing target batch ID');
      }

    } catch (error) {
      console.error('Error handling leftover batch:', error);
      throw error;
    }
  }

  /**
   * Merge two batches
   * @param {Object} sourceBatch - The batch to merge from
   * @param {string} targetBatchId - The batch to merge into
   * @returns {Object} Merge result
   */
  static async mergeBatches(sourceBatch, targetBatchId) {
    try {
      const targetBatch = await Batch.findById(targetBatchId);
      if (!targetBatch) {
        throw new Error('Target batch not found');
      }

      // Check if merge is possible (capacity check)
      const totalStudents = sourceBatch.currentStudents + targetBatch.currentStudents;
      if (totalStudents > targetBatch.maxStudents) {
        throw new Error('Cannot merge: would exceed target batch capacity');
      }

      // Get enrollments from source batch
      const sourceEnrollments = await Enrollment.find({ batch: sourceBatch._id });

      // Transfer enrollments to target batch
      for (const enrollment of sourceEnrollments) {
        enrollment.batch = targetBatch._id;
        await enrollment.save();
      }

      // Update target batch student count
      targetBatch.currentStudents = totalStudents;
      await targetBatch.save();

      // Delete source batch
      await Batch.findByIdAndDelete(sourceBatch._id);

      return {
        success: true,
        message: `Successfully merged ${sourceBatch.currentStudents} students into target batch`,
        mergedStudents: sourceBatch.currentStudents,
        targetBatch: targetBatch
      };

    } catch (error) {
      console.error('Error merging batches:', error);
      throw error;
    }
  }

  /**
   * Get batch distribution summary for a course
   * @param {string} courseId - The course ID
   * @returns {Object} Batch distribution summary
   */
  static async getBatchDistributionSummary(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const batches = await Batch.find({ course: courseId });
      const enrollments = await Enrollment.find({ 
        course: courseId, 
        status: { $in: ['enrolled', 'active'] } 
      });

      const summary = {
        course: course,
        totalStudents: enrollments.length,
        totalBatches: batches.length,
        batchTypes: {
          regular: {
            batches: batches.filter(b => b.batchType === 'regular'),
            students: enrollments.filter(e => e.batchType === 'regular').length
          },
          revision: {
            batches: batches.filter(b => b.batchType === 'revision'),
            students: enrollments.filter(e => e.batchType === 'revision').length
          }
        },
        leftoverBatches: batches.filter(b => b.isLeftoverBatch),
        capacityUtilization: {
          totalCapacity: course.totalCapacity,
          usedCapacity: enrollments.length,
          availableCapacity: course.totalCapacity - enrollments.length,
          utilizationPercentage: Math.round((enrollments.length / course.totalCapacity) * 100)
        }
      };

      return summary;

    } catch (error) {
      console.error('Error getting batch distribution summary:', error);
      throw error;
    }
  }

  /**
   * Recalculate batches when enrollment changes
   * @param {string} courseId - The course ID
   * @returns {Object} Recalculation result
   */
  static async recalculateBatches(courseId) {
    try {
      // Get current course and batches
      const course = await Course.findById(courseId);
      const existingBatches = await Batch.find({ course: courseId });

      // Delete existing batches (enrollments will be unassigned)
      await Batch.deleteMany({ course: courseId });

      // Recreate batches
      const result = await this.createBatchesForCourse(courseId);

      return {
        success: true,
        message: 'Batches recalculated successfully',
        result: result
      };

    } catch (error) {
      console.error('Error recalculating batches:', error);
      throw error;
    }
  }
}

export default BatchManagementService;
