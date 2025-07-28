'use client';

import * as React from 'react';
import { useQuery } from 'convex/react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { api } from '../../convex/_generated/api';
import ProfileCompletionModal from '../../components/forms/profile-completion-modal';
import { DashboardLayout } from '../../components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ChartContainer,
  MultiLineChart,
  SimpleAreaChart,
  DonutChart,
  StatCard,
} from '../../components/ui/charts';
import { 
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  BarChart3,
  Activity,
  Target,
  Award,
  Zap,
  BookOpen,
  Timer
} from 'lucide-react';





const mockUpcomingSessions = [
  {
    id: '1',
    mentee: { name: 'Sarah Johnson', avatar: undefined },
    topic: 'Career Transition Strategy',
    date: '2024-01-15',
    time: '14:00',
    duration: 60,
    status: 'confirmed' as const,
  },
  {
    id: '2',
    mentee: { name: 'Mike Chen', avatar: undefined },
    topic: 'Leadership Development',
    date: '2024-01-16',
    time: '10:00',
    duration: 90,
    status: 'pending' as const,
  },
];

const mockRecentRequests = [
  {
    id: '1',
    mentee: { name: 'Alex Rodriguez', avatar: undefined },
    topic: 'Entrepreneurship Guidance',
    requestedDate: '2024-01-20',
    status: 'pending' as const,
    createdAt: '2024-01-10T10:00:00Z',
  },
];

export default function DashboardPage() {
  // Get authenticated user from Clerk
  const { user } = useUser();
  
  // Get current user from Convex auth
  const currentUser = useQuery(api.queries.auth.getCurrentUser);
  
  // Profile completion modal state
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  
  // For now, skip the analytics queries until we have proper user data in Convex
  // These would need the user to be created in the Convex database first
  const analytics = null; // useQuery(api.queries.analytics.getDashboardAnalytics, { userId: currentUser?.id });
  const mentorshipAreas = null; // useQuery(api.queries.analytics.getMentorshipAreasAnalytics, { userId: currentUser?.id });
  const userProfile = null; // useQuery(api.queries.users.getUserById, { userId: currentUser?.id });
  
  // Show modal if profile is not complete
  // React.useEffect(() => {
  //   if (userProfile && !userProfile.profileComplete) {
  //     setShowProfileModal(true);
  //   }
  // }, [userProfile]);

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
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Prepare chart data - using mock data for now
  const weeklyTrendData: any[] = []; // analytics?.weeklyTrend || [];
  const requestStatusData: any[] = []; // analytics?.requestStatusCounts ? [...] : [];
  const mentorshipAreasData: any[] = []; // mentorshipAreas?.slice(0, 5) || [];

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-papaya_whip-500">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-prussian_blue-500 mb-4">Welcome to MVT</h1>
            <p className="text-prussian_blue-400 mb-8">Please sign in to access your dashboard</p>
            <SignInButton>
              <Button size="lg" className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500">Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's what's happening with your mentorship activities."
      user={{
        name: currentUser?.name || user?.fullName || user?.firstName || 'User',
        email: currentUser?.email || user?.primaryEmailAddress?.emailAddress || '',
        avatar: currentUser?.profilePictureUrl || user?.imageUrl,
        unreadNotifications: 0, // This would come from a notifications query
      }}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="shadow-soft">
            <Calendar className="h-4 w-4 mr-2" />
            Set Availability
          </Button>
          <Button size="sm" className="shadow-soft">
            <Plus className="h-4 w-4 mr-2" />
            Find Mentors
          </Button>
        </div>
      }
    >
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-fire_brick-500 to-fire_brick-600 text-papaya_whip-500 shadow-medium border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name || user?.fullName || user?.firstName || 'User'}! 👋</h2>
                <p className="text-papaya_whip-500/80">
                  You have 0 pending requests and 0 upcoming sessions.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 text-papaya_whip-500/80">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">Keep up the great work!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-prussian_blue-400">Total Sessions</p>
                  <p className="text-3xl font-bold text-prussian_blue-500">0</p>
                  <div className="flex items-center text-sm text-fire_brick-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-fire_brick-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-fire_brick-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-prussian_blue-400">Completed Sessions</p>
                  <p className="text-3xl font-bold text-prussian_blue-500">0</p>
                  <div className="flex items-center text-sm text-fire_brick-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-fire_brick-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-fire_brick-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-prussian_blue-400">Total Hours</p>
                  <p className="text-3xl font-bold text-prussian_blue-500">0h</p>
                  <div className="flex items-center text-sm text-fire_brick-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-fire_brick-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-fire_brick-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-lift shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-prussian_blue-400">Average Rating</p>
                  <p className="text-3xl font-bold text-prussian_blue-500">0</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-air_superiority_blue-300" />
                    ))}
                  </div>
                </div>
                <div className="h-12 w-12 bg-fire_brick-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-fire_brick-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Trend Chart */}
          <Card className="shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-prussian_blue-500">
                <TrendingUp className="h-5 w-5 text-fire_brick-500" />
                Weekly Activity Trend
              </CardTitle>
              <CardDescription className="text-prussian_blue-400">Sessions and hours over the last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer height={300}>
                <MultiLineChart
                  data={weeklyTrendData}
                  xKey="week"
                  lines={[
                    { key: 'sessions', color: '#B91C1C', name: 'Sessions' },
                    { key: 'hours', color: '#1E3A8A', name: 'Hours' },
                  ]}
                />
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Request Status Distribution */}
          <Card className="shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-prussian_blue-500">
                <BarChart3 className="h-5 w-5 text-fire_brick-500" />
                Request Status Distribution
              </CardTitle>
              <CardDescription className="text-prussian_blue-400">Breakdown of all mentorship requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer height={300}>
                <DonutChart
                  data={requestStatusData}
                  centerText="0"
                />
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-air_superiority_blue-100 border-air_superiority_blue-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500 text-prussian_blue-500">Overview</TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500 text-prussian_blue-500">Sessions</TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500 text-prussian_blue-500">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity Summary */}
              <Card className="shadow-soft bg-papaya_whip-500 border-air_superiority_blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-prussian_blue-500">
                    <Activity className="h-5 w-5 text-fire_brick-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-prussian_blue-400">Your activity summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-fire_brick-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-fire_brick-500 rounded-full"></div>
                      <span className="font-medium text-prussian_blue-500">Sessions This Week</span>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-air_superiority_blue-100 text-prussian_blue-500">
                      0
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-air_superiority_blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-air_superiority_blue-500 rounded-full"></div>
                      <span className="font-medium text-prussian_blue-500">Pending Requests</span>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-air_superiority_blue-100 text-prussian_blue-500">
                      0
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-fire_brick-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-fire_brick-500 rounded-full"></div>
                      <span className="font-medium text-prussian_blue-500">Upcoming Sessions</span>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-air_superiority_blue-100 text-prussian_blue-500">
                      0
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-air_superiority_blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-air_superiority_blue-500 rounded-full"></div>
                      <span className="font-medium text-prussian_blue-500">Total Reviews</span>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-air_superiority_blue-100 text-prussian_blue-500">
                      0
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Areas */}
              {mentorshipAreasData.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Top Mentorship Areas
                    </CardTitle>
                    <CardDescription>Most requested topics in your sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentorshipAreasData.map((area, index) => (
                        <div key={area.area} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <span className="font-medium">{area.area}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(area.count / Math.max(...mentorshipAreasData.map(a => a.count))) * 100} className="w-20" />
                            <span className="text-sm text-muted-foreground w-8">{area.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Your scheduled mentorship sessions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUpcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar>
                        <AvatarImage src={session.mentee.avatar} />
                        <AvatarFallback>{session.mentee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.mentee.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{session.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(session.date)} at {formatTime(session.time)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <Timer className="h-3 w-3 mr-1" />
                            {session.duration}min
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)} variant="secondary">
                        {session.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {session.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                  {mockUpcomingSessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming sessions</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule a Session
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Requests</CardTitle>
                    <CardDescription>New mentorship requests awaiting response</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentRequests.map((request) => (
                    <div key={request.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar>
                        <AvatarImage src={request.mentee.avatar} />
                        <AvatarFallback>{request.mentee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{request.mentee.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{request.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested for {formatDate(request.requestedDate)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                        <Button size="sm">
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                  {mockRecentRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending requests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-lift cursor-pointer shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Find Mentors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover experienced mentors in your field
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Browse Mentors
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift cursor-pointer shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Manage Availability</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update your schedule and availability
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Set Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift cursor-pointer shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed insights into your mentorship impact
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Profile Completion Modal - Disabled for now */}
      {/* {currentUser?.id && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          userId={currentUser.id as Id<'users'>}
          onComplete={() => {
            setShowProfileModal(false);
            // Optionally refresh user data
          }}
        />
      )} */}
    </DashboardLayout>
      </Authenticated>
    </>
  );
}
