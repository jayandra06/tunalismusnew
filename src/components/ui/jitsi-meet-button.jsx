"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Users, 
  Clock, 
  Lock,
  ExternalLink,
  Play,
  Square
} from "lucide-react";
import { useSession } from "next-auth/react";
import jitsiService from "@/lib/jitsi-service";

export default function JitsiMeetButton({ 
  batchId, 
  batchName, 
  meetingUrl, 
  roomPassword, 
  isActive = false,
  userRole = 'student',
  onMeetingStart,
  onMeetingEnd,
  onMeetingJoin,
  className = ""
}) {
  const { data: session, status } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const canModerate = userRole === 'trainer' || userRole === 'admin';
  const canStart = canModerate && !isActive;
  const canEnd = canModerate && isActive;

  // Generate meeting URL with user information
  const generateMeetingUrl = () => {
    if (meetingUrl) {
      return meetingUrl;
    }
    
    // Use JitsiService to generate URL with user info
    if (session?.user) {
      const user = {
        name: session.user.name || (userRole === 'admin' ? 'Admin' : userRole === 'trainer' ? 'Trainer' : 'Student'),
        email: session.user.email || ''
      };
      
      if (userRole === 'admin') {
        return jitsiService.generateAdminMeetingUrl(batchId, batchName || 'Class', user);
      } else if (userRole === 'trainer') {
        return jitsiService.generateTrainerMeetingUrl(batchId, batchName || 'Class', user);
      } else {
        return jitsiService.generateStudentMeetingUrl(batchId, batchName || 'Class', user);
      }
    }
    
    // Fallback URL without user info
    return `https://meet.tunalismus.com/batch-${batchId}-${batchName?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'class'}`;
  };

  const finalMeetingUrl = generateMeetingUrl();

  const handleStartMeeting = async () => {
    if (!canStart) return;
    
    // Check if user is authenticated
    if (status === 'loading') {
      console.log('Session is loading, please wait...');
      return;
    }
    
    if (!session) {
      console.error('User not authenticated. Please log in.');
      return;
    }
    
    setIsStarting(true);
    try {
      const response = await fetch(`/api/meetings/batch/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        if (onMeetingStart) onMeetingStart();
        // Open meeting in new tab
        window.open(finalMeetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to start meeting:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          console.error('Access denied. You may not have permission to start this meeting.');
        } else {
          console.error(`Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error starting meeting:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleJoinMeeting = async () => {
    // Check if user is authenticated
    if (status === 'loading') {
      console.log('Session is loading, please wait...');
      return;
    }
    
    if (!session) {
      console.error('User not authenticated. Please log in.');
      return;
    }
    
    setIsJoining(true);
    try {
      const response = await fetch(`/api/meetings/batch/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        if (onMeetingJoin) onMeetingJoin();
        // Open meeting in new tab
        window.open(finalMeetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to join meeting:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          console.error('Access denied. You may not have permission to join this meeting.');
        } else {
          console.error(`Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!canEnd) return;
    
    // Check if user is authenticated
    if (status === 'loading') {
      console.log('Session is loading, please wait...');
      return;
    }
    
    if (!session) {
      console.error('User not authenticated. Please log in.');
      return;
    }
    
    setIsEnding(true);
    try {
      const response = await fetch(`/api/meetings/batch/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'end'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        if (onMeetingEnd) onMeetingEnd();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to end meeting:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          console.error('Access denied. You may not have permission to end this meeting.');
        } else {
          console.error(`Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const getButtonText = () => {
    if (status === 'loading') return "Loading...";
    if (isStarting) return "Starting...";
    if (isJoining) return "Joining...";
    if (isEnding) return "Ending...";
    if (canStart) return "Start Class";
    if (canEnd) return "End Class";
    if (isActive) return "🎥 Join Live Class";
    return "Join Class";
  };

  const getButtonIcon = () => {
    if (status === 'loading') return <Clock className="h-4 w-4" />;
    if (isStarting || isJoining) return <Clock className="h-4 w-4" />;
    if (isEnding) return <Square className="h-4 w-4" />;
    if (canStart) return <Play className="h-4 w-4" />;
    if (canEnd) return <Square className="h-4 w-4" />;
    if (isActive) return <Video className="h-4 w-4" />;
    return <Video className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (canStart) return "default";
    if (canEnd) return "destructive";
    if (isActive) return "default";
    return "outline";
  };

  const handleClick = () => {
    if (canStart) {
      handleStartMeeting();
    } else if (canEnd) {
      handleEndMeeting();
    } else {
      handleJoinMeeting();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        onClick={handleClick}
        disabled={status === 'loading' || isStarting || isJoining || isEnding || !session}
        variant={getButtonVariant()}
        className="w-full"
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>
      
      {/* Meeting Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Room: {batchName}</span>
        </div>
        
        {canModerate && roomPassword && (
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Password: {roomPassword}</span>
          </div>
        )}
        
        {isActive && (
          <div className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function JitsiMeetButtonCompact({ 
  batchId, 
  batchName,
  meetingUrl, 
  isActive = false,
  userRole = 'student',
  onMeetingStart,
  onMeetingEnd,
  onMeetingJoin,
  className = ""
}) {
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);

  const canModerate = userRole === 'trainer' || userRole === 'admin';
  const canStart = canModerate && !isActive;
  const canEnd = canModerate && isActive;

  // Generate meeting URL with user information
  const generateMeetingUrl = () => {
    if (meetingUrl) {
      return meetingUrl;
    }
    
    // Use JitsiService to generate URL with user info
    if (session?.user) {
      const user = {
        name: session.user.name || (userRole === 'admin' ? 'Admin' : userRole === 'trainer' ? 'Trainer' : 'Student'),
        email: session.user.email || ''
      };
      
      if (userRole === 'admin') {
        return jitsiService.generateAdminMeetingUrl(batchId, batchName || 'Class', user);
      } else if (userRole === 'trainer') {
        return jitsiService.generateTrainerMeetingUrl(batchId, batchName || 'Class', user);
      } else {
        return jitsiService.generateStudentMeetingUrl(batchId, batchName || 'Class', user);
      }
    }
    
    // Fallback URL without user info
    return `https://meet.tunalismus.com/batch-${batchId}-${batchName?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'class'}`;
  };

  const finalMeetingUrl = generateMeetingUrl();

  const handleClick = async () => {
    if (canStart) {
      // Start meeting
      try {
        await fetch(`/api/meetings/batch/${batchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' }),
          credentials: 'include'
        });
        if (onMeetingStart) onMeetingStart();
      } catch (error) {
        console.error('Error starting meeting:', error);
      }
    } else if (canEnd) {
      // End meeting
      try {
        await fetch(`/api/meetings/batch/${batchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'end' }),
          credentials: 'include'
        });
        if (onMeetingEnd) onMeetingEnd();
      } catch (error) {
        console.error('Error ending meeting:', error);
      }
    } else {
      // Join meeting
      setIsJoining(true);
      try {
        await fetch(`/api/meetings/batch/${batchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join' }),
          credentials: 'include'
        });
        if (onMeetingJoin) onMeetingJoin();
      } catch (error) {
        console.error('Error joining meeting:', error);
      } finally {
        setIsJoining(false);
      }
    }
    
    // Open meeting in new tab
    window.open(finalMeetingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isJoining}
      variant={canStart ? "default" : canEnd ? "destructive" : "outline"}
      size="sm"
      className={className}
    >
      {isJoining ? (
        <Clock className="h-4 w-4" />
      ) : canStart ? (
        <Play className="h-4 w-4" />
      ) : canEnd ? (
        <Square className="h-4 w-4" />
      ) : (
        <Video className="h-4 w-4" />
      )}
    </Button>
  );
}

