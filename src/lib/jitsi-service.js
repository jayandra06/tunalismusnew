/**
 * Jitsi Meet Service
 * Handles Jitsi Meet integration for batch classes
 */

const crypto = require('crypto');

class JitsiService {
  constructor() {
    this.domain = process.env.JITSI_DOMAIN || 'meet.tunalismus.com';
    this.appId = process.env.JITSI_APP_ID || 'tunalismus';
    this.roomPrefix = process.env.JITSI_ROOM_PREFIX || 'batch';
  }

  /**
   * Generate a unique room name for a batch
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name for display
   * @returns {string} - The room name
   */
  generateRoomName(batchId, courseName = '') {
    // Create a clean room name: batch-{batchId}-{courseSlug}
    const courseSlug = courseName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    
    return `${this.roomPrefix}-${batchId}-${courseSlug}`;
  }

  /**
   * Generate a Jitsi Meet URL for a batch
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name
   * @param {Object} user - The user joining the meeting
   * @param {Object} options - Additional options
   * @returns {string} - The Jitsi Meet URL
   */
  generateMeetingUrl(batchId, courseName, user, options = {}) {
    const roomName = this.generateRoomName(batchId, courseName);
    
    // Base URL
    let url = `https://${this.domain}/${roomName}`;
    
    // Use the working format based on your test results
    const hashParams = [];
    
    // Primary approach: userInfo.displayName with quotes (Test 2 - WORKED)
    if (user.name) {
      hashParams.push(`userInfo.displayName="${encodeURIComponent(user.name)}"`);
    }
    
    // Backup approach: userInfo.displayName without quotes (Test 3 - WORKED)
    if (user.name) {
      hashParams.push(`userInfo.displayName=${encodeURIComponent(user.name)}`);
    }
    
    // Add email if available
    if (user.email) {
      hashParams.push(`userInfo.email=${encodeURIComponent(user.email)}`);
    }
    
    // Test A worked - minimal configuration is best!
    // No additional config needed since basic userInfo parameters work
    
    // Build final URL with hash parameters
    const finalUrl = `${url}#${hashParams.join('&')}`;
    
    return finalUrl;
  }

  /**
   * Generate a meeting link for a trainer (moderator)
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name
   * @param {Object} trainer - The trainer information
   * @returns {string} - The Jitsi Meet URL for trainer
   */
  generateTrainerMeetingUrl(batchId, courseName, trainer) {
    return this.generateMeetingUrl(batchId, courseName, trainer, {
      moderator: true,
      password: this.generateRoomPassword(batchId)
    });
  }

  /**
   * Generate a meeting link for a student
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name
   * @param {Object} student - The student information
   * @returns {string} - The Jitsi Meet URL for student
   */
  generateStudentMeetingUrl(batchId, courseName, student) {
    return this.generateMeetingUrl(batchId, courseName, student, {
      moderator: false
    });
  }

  /**
   * Generate a meeting link for an admin
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name
   * @param {Object} admin - The admin information
   * @returns {string} - The Jitsi Meet URL for admin
   */
  generateAdminMeetingUrl(batchId, courseName, admin) {
    return this.generateMeetingUrl(batchId, courseName, admin, {
      moderator: true,
      password: this.generateRoomPassword(batchId)
    });
  }

  /**
   * Generate a room password for moderator access
   * @param {string} batchId - The batch ID
   * @returns {string} - The room password
   */
  generateRoomPassword(batchId) {
    // Generate a consistent password based on batch ID and a secret
    const secret = process.env.JITSI_ROOM_SECRET || 'tunalismus-secret-key';
    const hash = crypto.createHash('sha256').update(`${batchId}-${secret}`).digest('hex');
    return hash.substring(0, 8).toUpperCase();
  }

  /**
   * Get meeting information for a batch
   * @param {string} batchId - The batch ID
   * @param {string} courseName - The course name
   * @returns {Object} - Meeting information
   */
  getMeetingInfo(batchId, courseName) {
    const roomName = this.generateRoomName(batchId, courseName);
    const password = this.generateRoomPassword(batchId);
    
    return {
      roomName,
      password,
      domain: this.domain,
      baseUrl: `https://${this.domain}/${roomName}`,
      displayName: `${courseName} - Batch Class`
    };
  }

  /**
   * Validate if a user can join a meeting
   * @param {string} batchId - The batch ID
   * @param {Object} user - The user information
   * @param {string} userRole - The user's role
   * @returns {boolean} - Whether the user can join
   */
  canJoinMeeting(batchId, user, userRole) {
    // All authenticated users can join meetings
    // Additional validation can be added here based on enrollment status, etc.
    return user && userRole && ['trainer', 'student', 'admin'].includes(userRole);
  }

  /**
   * Get meeting status (if needed for future features)
   * @param {string} batchId - The batch ID
   * @returns {Object} - Meeting status information
   */
  getMeetingStatus(batchId) {
    // This could be extended to check actual meeting status via Jitsi API
    return {
      isActive: true,
      participantCount: 0,
      startTime: null,
      endTime: null
    };
  }
}

// Export singleton instance
const jitsiService = new JitsiService();
export default jitsiService;

