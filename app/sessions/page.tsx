'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { 
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Play,
  MoreHorizontal,
  MapPin,
  User
} from 'lucide-react';

// Mock data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

const mockUpcomingSessions = [
  {
    id: '1',
    participant: { name: 'Sarah Johnson', avatar: undefined, role: 'mentee' as const },
    topic: 'Career Transition Strategy',
    scheduledDate: '2024-01-15',
    scheduledTime: '14:00',
    duration: 60,
    status: 'confirmed' as const,
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    notes: 'Discuss transition from military to tech industry',
    type: 'video' as const,
  },
  {
    id: '2',
    participant: { name: 'Mike Chen', avatar: undefined, role: 'mentor' as const },
    topic: 'Leadership Development',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00',
    duration: 90,
    status: 'pending' as const,
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Focus on developing leadership skills in tech environment',
    type: 'video' as const,
  },
  {
    id: '3',
    participant: { name: 'Emily Davis', avatar: undefined, role: 'mentee' as const },
    topic: 'Technical Interview Prep',
    scheduledDate: '2024-01-17',
    scheduledTime: '16:30',
    duration: 60,
    status: 'confirmed' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
    notes: 'Practice coding interviews and system design',
    type: 'video' as const,
  },
];

const mockCompletedSessions = [
  {
    id: '4',
    participant: { name: 'Alex Rodriguez', avatar: undefined, role: 'mentee' as const },
    topic: 'Entrepreneurship Guidance',
    scheduledDate: '2024-01-10',
    scheduledTime: '15:00',
    duration: 60,
    status: 'completed' as const,
    completedAt: '2024-01-10T16:00:00Z',
    rating: 5,
    feedback: 'Excellent session! Got great insights on starting a business.',
    notes: 'Discussed business plan and funding strategies',
    type: 'video' as const,
  },
  {
    id: '5',
    participant: { name: 'Lisa Wang', avatar: undefined, role: 'mentor' as const },
    topic: 'Project Management',
    scheduledDate: '2024-01-08',
    scheduledTime: '13:30',
    duration: 90,
    status: 'completed' as const,
    completedAt: '2024-01-08T15:00:00Z',
    rating: 4,
    feedback: 'Very helpful guidance on PM methodologies.',
    notes: 'Covered Agile and Scrum methodologies',
    type: 'video' as const,
  },
  {
    id: '6',
    participant: { name: 'David Kim', avatar: undefined, role: 'mentee' as const },
    topic: 'Career Transition',
    scheduledDate: '2024-01-05',
    scheduledTime: '11:00',
    duration: 60,
    status: 'completed' as const,
    completedAt: '2024-01-05T12:00:00Z',
    rating: 5,
    feedback: 'Amazing mentor! Helped me navigate my career change.',
    notes: 'Resume review and interview preparation',
    type: 'video' as const,
  },
];

export default function SessionsPage() {
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = React.useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours || '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const sessionDate = new Date(dateString);
    return today.toDateString() === sessionDate.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sessionDate = new Date(dateString);
    return tomorrow.toDateString() === sessionDate.toDateString();
  };

  const getDateLabel = (dateString: string) => {
    if (isToday(dateString)) return 'Today';
    if (isTomorrow(dateString)) return 'Tomorrow';
    return formatDate(dateString);
  };

  const filteredUpcomingSessions = mockUpcomingSessions.filter(session =>
    session.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedSessions = mockCompletedSessions.filter(session =>
    session.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinSession = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const handleRescheduleSession = (sessionId: string) => {
    console.log('Rescheduling session:', sessionId);
    // In a real app, this would open a reschedule modal
  };

  const handleCancelSession = (sessionId: string) => {
    console.log('Cancelling session:', sessionId);
    // In a real app, this would call a Convex mutation
  };

  const upcomingCount = mockUpcomingSessions.length;
  const completedCount = mockCompletedSessions.length;

  return (
    <DashboardLayout
      title="My Sessions"
      description="Manage your upcoming and completed mentorship sessions"
      user={mockUser}
      actions={
        <Button >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      }
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2 inline" />
            Upcoming
            {upcomingCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {upcomingCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle className="h-4 w-4 mr-2 inline" />
            Completed
            {completedCount > 0 && (
              <Badge variant="outline" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {completedCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {filteredUpcomingSessions.map((session) => (
            <Card key={session.id} className={isToday(session.scheduledDate) ? 'border-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar>
                      {session.participant.avatar && <AvatarImage src={session.participant.avatar} />}
                      <AvatarFallback>{session.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{session.participant.name}</h3>
                        <Badge variant="outline" >
                          {session.participant.role}
                        </Badge>
                        <Badge className={getStatusColor(session.status)} variant="secondary">
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                        {isToday(session.scheduledDate) && (
                          <Badge variant="destructive" >
                            Today
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{session.topic}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {getDateLabel(session.scheduledDate)} at {formatTime(session.scheduledTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.duration} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          Video call
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          <strong>Notes:</strong> {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {session.status === 'confirmed' && (
                      <Button
                        
                        onClick={() => handleJoinSession(session.meetingLink)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    )}
                    <div className="relative">
                      <Button variant="outline" >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {/* In a real app, this would be a dropdown menu */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredUpcomingSessions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'No sessions match your search criteria.'
                    : 'You don\'t have any upcoming mentorship sessions.'}
                </p>
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Find Mentors
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Completed Sessions */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {filteredCompletedSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    {session.participant.avatar && <AvatarImage src={session.participant.avatar} />}
                    <AvatarFallback>{session.participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{session.participant.name}</h3>
                        <Badge variant="outline" >
                          {session.participant.role}
                        </Badge>
                        <Badge className={getStatusColor(session.status)} variant="secondary">
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.scheduledDate)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{session.topic}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} minutes
                      </div>
                      {session.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {session.rating}/5
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {session.notes && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Session notes:</p>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      )}
                      
                      {session.feedback && (
                        <div className="bg-primary/5 p-3 rounded-md border-l-4 border-primary">
                          <p className="text-sm font-medium mb-1">
                            {session.participant.role === 'mentee' ? 'Mentee feedback:' : 'Mentor feedback:'}
                          </p>
                          <p className="text-sm text-muted-foreground">{session.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredCompletedSessions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No completed sessions</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No sessions match your search criteria.'
                    : 'You haven\'t completed any mentorship sessions yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
