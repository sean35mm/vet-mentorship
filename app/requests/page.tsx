'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { 
  MessageSquare,
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Inbox,
  Archive
} from 'lucide-react';

// Mock data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

const mockSentRequests = [
  {
    id: '1',
    mentor: { name: 'Sarah Johnson', avatar: undefined, title: 'Senior Software Engineer', company: 'Google' },
    topic: 'Career Transition Strategy',
    requestedDate: '2024-01-20',
    requestedTime: '14:00',
    duration: 60,
    status: 'pending' as const,
    message: 'Hi Sarah, I would love to get your insights on transitioning from military to tech...',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    mentor: { name: 'Mike Chen', avatar: undefined, title: 'Product Manager', company: 'Microsoft' },
    topic: 'Leadership Development',
    requestedDate: '2024-01-18',
    requestedTime: '10:00',
    duration: 90,
    status: 'accepted' as const,
    message: 'Looking for guidance on developing leadership skills in a tech environment...',
    createdAt: '2024-01-08T15:30:00Z',
    mentorResponse: 'Happy to help! Looking forward to our session.',
  },
  {
    id: '3',
    mentor: { name: 'Emily Davis', avatar: undefined, title: 'Engineering Manager', company: 'Amazon' },
    topic: 'Technical Interview Prep',
    requestedDate: '2024-01-15',
    requestedTime: '16:30',
    duration: 60,
    status: 'declined' as const,
    message: 'Need help preparing for technical interviews at FAANG companies...',
    createdAt: '2024-01-05T09:00:00Z',
    mentorResponse: 'Unfortunately, I\'m not available during that time. Please feel free to request another slot.',
  },
];

const mockReceivedRequests = [
  {
    id: '4',
    mentee: { name: 'Alex Rodriguez', avatar: undefined },
    topic: 'Entrepreneurship Guidance',
    requestedDate: '2024-01-25',
    requestedTime: '15:00',
    duration: 60,
    status: 'pending' as const,
    message: 'Hi John, I\'m interested in starting my own business and would love your guidance on the entrepreneurial journey...',
    createdAt: '2024-01-12T11:00:00Z',
  },
  {
    id: '5',
    mentee: { name: 'Lisa Wang', avatar: undefined },
    topic: 'Project Management',
    requestedDate: '2024-01-22',
    requestedTime: '13:30',
    duration: 90,
    status: 'pending' as const,
    message: 'Looking for advice on transitioning into project management roles in tech...',
    createdAt: '2024-01-11T14:20:00Z',
  },
  {
    id: '6',
    mentee: { name: 'David Kim', avatar: undefined },
    topic: 'Career Transition',
    requestedDate: '2024-01-19',
    requestedTime: '11:00',
    duration: 60,
    status: 'accepted' as const,
    message: 'Would appreciate guidance on making the transition from military to civilian career...',
    createdAt: '2024-01-09T16:45:00Z',
  },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = React.useState<'sent' | 'received'>('received');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
      case 'accepted':
        return 'bg-fire_brick-100 text-fire_brick-800';
      case 'pending':
        return 'bg-air_superiority_blue-100 text-air_superiority_blue-800';
      case 'declined':
        return 'bg-fire_brick-200 text-fire_brick-900';
      case 'completed':
        return 'bg-prussian_blue-100 text-prussian_blue-800';
      default:
        return 'bg-air_superiority_blue-100 text-prussian_blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredSentRequests = mockSentRequests.filter(request => {
    const matchesSearch = request.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReceivedRequests = mockReceivedRequests.filter(request => {
    const matchesSearch = request.mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);
    // In a real app, this would call a Convex mutation
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining request:', requestId);
    // In a real app, this would call a Convex mutation
  };

  const pendingReceivedCount = mockReceivedRequests.filter(r => r.status === 'pending').length;
  const pendingSentCount = mockSentRequests.filter(r => r.status === 'pending').length;

  return (
    <DashboardLayout
      title="My Requests"
      description="Manage your mentorship requests - both sent and received"
      user={mockUser}
      actions={
        <Button size="sm">
          <Send className="h-4 w-4 mr-2" />
          New Request
        </Button>
      }
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-air_superiority_blue-100 p-1 rounded-lg border border-air_superiority_blue-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-fire_brick-500 text-papaya_whip-500 shadow-sm'
                : 'text-prussian_blue-500 hover:text-fire_brick-600'
            }`}
          >
            <Inbox className="h-4 w-4 mr-2 inline" />
            Received
            {pendingReceivedCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-fire_brick-600 text-papaya_whip-500">
                {pendingReceivedCount}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-fire_brick-500 text-papaya_whip-500 shadow-sm'
                : 'text-prussian_blue-500 hover:text-fire_brick-600'
            }`}
          >
            <Send className="h-4 w-4 mr-2 inline" />
            Sent
            {pendingSentCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-air_superiority_blue-100 text-prussian_blue-600">
                {pendingSentCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-prussian_blue-400" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-papaya_whip-500 border-air_superiority_blue-200 text-prussian_blue-500 placeholder:text-prussian_blue-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-air_superiority_blue-200 bg-papaya_whip-500 px-3 py-2 text-sm text-prussian_blue-500 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire_brick-500 focus-visible:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {filteredReceivedRequests.map((request) => (
            <Card key={request.id} className="bg-papaya_whip-500 border-air_superiority_blue-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar>
                      {request.mentee.avatar && <AvatarImage src={request.mentee.avatar} />}
                      <AvatarFallback>{request.mentee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.mentee.name}</h3>
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{request.topic}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.requestedDate)} at {formatTime(request.requestedTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.duration} minutes
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {request.message}
                      </p>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredReceivedRequests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'You haven\'t received any mentorship requests yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {filteredSentRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    {request.mentor.avatar && <AvatarImage src={request.mentor.avatar} />}
                    <AvatarFallback>{request.mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.mentor.name}</h3>
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Sent {formatDate(request.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.mentor.title} at {request.mentor.company}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{request.topic}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(request.requestedDate)} at {formatTime(request.requestedTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {request.duration} minutes
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Your message:</p>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>
                      {request.mentorResponse && (
                        <div className="bg-primary/5 p-3 rounded-md border-l-4 border-primary">
                          <p className="text-sm font-medium mb-1">Mentor response:</p>
                          <p className="text-sm text-muted-foreground">{request.mentorResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredSentRequests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'You haven\'t sent any mentorship requests yet.'}
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
    </DashboardLayout>
  );
}
