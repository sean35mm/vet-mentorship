'use client';

import * as React from 'react';

// Force dynamic rendering since this page requires user context
export const dynamic = 'force-dynamic';
import { useQuery } from 'convex/react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import ProfileCompletionModal from '@/components/forms/profile-completion-modal';
import { DashboardLayout } from '@/components/layout/layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  MultiLineChart,
  SimpleAreaChart,
  DonutChart,
  StatCard,
} from '@/components/ui/charts';
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
  Timer,
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
        <div className='flex min-h-screen items-center justify-center bg-papaya_whip-500'>
          <div className='text-center'>
            <h1 className='mb-4 text-4xl font-bold text-prussian_blue-500'>
              Welcome to MVT
            </h1>
            <p className='mb-8 text-prussian_blue-400'>
              Please sign in to access your dashboard
            </p>
            <SignInButton>
              <Button
                size='lg'
                className='bg-fire_brick-500 text-papaya_whip-500 hover:bg-fire_brick-600'
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <DashboardLayout
          title='Dashboard'
          description="Welcome back! Here's what's happening with your mentorship activities."
          user={{
            name:
              currentUser?.name || user?.fullName || user?.firstName || 'User',
            email:
              currentUser?.email ||
              user?.primaryEmailAddress?.emailAddress ||
              '',
            avatar: currentUser?.profilePictureUrl || user?.imageUrl,
            unreadNotifications: 0, // This would come from a notifications query
          }}
          actions={
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' className='shadow-soft'>
                <Calendar className='mr-2 h-4 w-4' />
                Set Availability
              </Button>
              <Button size='sm' className='shadow-soft'>
                <Plus className='mr-2 h-4 w-4' />
                Find Mentors
              </Button>
            </div>
          }
        >
          <div className='animate-fade-in space-y-8'>
            {/* Welcome Banner */}
            <Card className='shadow-medium border-0 bg-gradient-to-r from-fire_brick-500 to-fire_brick-600 text-papaya_whip-500'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='mb-2 text-2xl font-bold'>
                      Welcome back,{' '}
                      {currentUser?.name ||
                        user?.fullName ||
                        user?.firstName ||
                        'User'}
                      ! 👋
                    </h2>
                    <p className='text-papaya_whip-500/80'>
                      You have 0 pending requests and 0 upcoming sessions.
                    </p>
                  </div>
                  <div className='hidden md:block'>
                    <div className='flex items-center space-x-2 text-papaya_whip-500/80'>
                      <Zap className='h-5 w-5' />
                      <span className='text-sm'>Keep up the great work!</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <Card className='hover-lift shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-prussian_blue-400'>
                        Total Sessions
                      </p>
                      <p className='text-3xl font-bold text-prussian_blue-500'>
                        0
                      </p>
                      <div className='mt-1 flex items-center text-sm text-fire_brick-500'>
                        <TrendingUp className='mr-1 h-3 w-3' />
                        +12% from last month
                      </div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-fire_brick-100'>
                      <Users className='h-6 w-6 text-fire_brick-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='hover-lift shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-prussian_blue-400'>
                        Completed Sessions
                      </p>
                      <p className='text-3xl font-bold text-prussian_blue-500'>
                        0
                      </p>
                      <div className='mt-1 flex items-center text-sm text-fire_brick-500'>
                        <TrendingUp className='mr-1 h-3 w-3' />
                        +8% from last month
                      </div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-fire_brick-100'>
                      <CheckCircle className='h-6 w-6 text-fire_brick-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='hover-lift shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-prussian_blue-400'>
                        Total Hours
                      </p>
                      <p className='text-3xl font-bold text-prussian_blue-500'>
                        0h
                      </p>
                      <div className='mt-1 flex items-center text-sm text-fire_brick-500'>
                        <TrendingUp className='mr-1 h-3 w-3' />
                        +15% from last month
                      </div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-fire_brick-100'>
                      <Clock className='h-6 w-6 text-fire_brick-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='hover-lift shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-prussian_blue-400'>
                        Average Rating
                      </p>
                      <p className='text-3xl font-bold text-prussian_blue-500'>
                        0
                      </p>
                      <div className='mt-1 flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className='h-3 w-3 text-air_superiority_blue-300'
                          />
                        ))}
                      </div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-fire_brick-100'>
                      <Star className='h-6 w-6 text-fire_brick-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              {/* Weekly Trend Chart */}
              <Card className='shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-prussian_blue-500'>
                    <TrendingUp className='h-5 w-5 text-fire_brick-500' />
                    Weekly Activity Trend
                  </CardTitle>
                  <CardDescription className='text-prussian_blue-400'>
                    Sessions and hours over the last 8 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer height={300}>
                    <MultiLineChart
                      data={weeklyTrendData}
                      xKey='week'
                      lines={[
                        { key: 'sessions', color: '#B91C1C', name: 'Sessions' },
                        { key: 'hours', color: '#1E3A8A', name: 'Hours' },
                      ]}
                    />
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Request Status Distribution */}
              <Card className='shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-prussian_blue-500'>
                    <BarChart3 className='h-5 w-5 text-fire_brick-500' />
                    Request Status Distribution
                  </CardTitle>
                  <CardDescription className='text-prussian_blue-400'>
                    Breakdown of all mentorship requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer height={300}>
                    <DonutChart data={requestStatusData} centerText='0' />
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue='overview' className='space-y-6'>
              <TabsList className='grid w-full grid-cols-3 border-air_superiority_blue-200 bg-air_superiority_blue-100'>
                <TabsTrigger
                  value='overview'
                  className='text-prussian_blue-500 data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500'
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value='sessions'
                  className='text-prussian_blue-500 data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500'
                >
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value='requests'
                  className='text-prussian_blue-500 data-[state=active]:bg-fire_brick-500 data-[state=active]:text-papaya_whip-500'
                >
                  Requests
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                  {/* Recent Activity Summary */}
                  <Card className='shadow-soft border-air_superiority_blue-200 bg-papaya_whip-500'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-prussian_blue-500'>
                        <Activity className='h-5 w-5 text-fire_brick-500' />
                        Recent Activity
                      </CardTitle>
                      <CardDescription className='text-prussian_blue-400'>
                        Your activity summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='bg-fire_brick-50 flex items-center justify-between rounded-lg p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-2 w-2 rounded-full bg-fire_brick-500'></div>
                          <span className='font-medium text-prussian_blue-500'>
                            Sessions This Week
                          </span>
                        </div>
                        <Badge
                          variant='secondary'
                          className='bg-air_superiority_blue-100 font-bold text-prussian_blue-500'
                        >
                          0
                        </Badge>
                      </div>

                      <div className='bg-air_superiority_blue-50 flex items-center justify-between rounded-lg p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-2 w-2 rounded-full bg-air_superiority_blue-500'></div>
                          <span className='font-medium text-prussian_blue-500'>
                            Pending Requests
                          </span>
                        </div>
                        <Badge
                          variant='secondary'
                          className='bg-air_superiority_blue-100 font-bold text-prussian_blue-500'
                        >
                          0
                        </Badge>
                      </div>

                      <div className='bg-fire_brick-50 flex items-center justify-between rounded-lg p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-2 w-2 rounded-full bg-fire_brick-500'></div>
                          <span className='font-medium text-prussian_blue-500'>
                            Upcoming Sessions
                          </span>
                        </div>
                        <Badge
                          variant='secondary'
                          className='bg-air_superiority_blue-100 font-bold text-prussian_blue-500'
                        >
                          0
                        </Badge>
                      </div>

                      <div className='bg-air_superiority_blue-50 flex items-center justify-between rounded-lg p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-2 w-2 rounded-full bg-air_superiority_blue-500'></div>
                          <span className='font-medium text-prussian_blue-500'>
                            Total Reviews
                          </span>
                        </div>
                        <Badge
                          variant='secondary'
                          className='bg-air_superiority_blue-100 font-bold text-prussian_blue-500'
                        >
                          0
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mentorship Areas */}
                  {mentorshipAreasData.length > 0 && (
                    <Card className='shadow-soft'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Target className='h-5 w-5 text-primary' />
                          Top Mentorship Areas
                        </CardTitle>
                        <CardDescription>
                          Most requested topics in your sessions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {mentorshipAreasData.map((area, index) => (
                            <div
                              key={area.area}
                              className='flex items-center justify-between'
                            >
                              <div className='flex items-center gap-3'>
                                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary'>
                                  {index + 1}
                                </div>
                                <span className='font-medium'>{area.area}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Progress
                                  value={
                                    (area.count /
                                      Math.max(
                                        ...mentorshipAreasData.map(a => a.count)
                                      )) *
                                    100
                                  }
                                  className='w-20'
                                />
                                <span className='w-8 text-sm text-muted-foreground'>
                                  {area.count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='sessions' className='space-y-6'>
                <Card className='shadow-soft'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle>Upcoming Sessions</CardTitle>
                        <CardDescription>
                          Your scheduled mentorship sessions
                        </CardDescription>
                      </div>
                      <Button variant='ghost' size='sm'>
                        View All
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {mockUpcomingSessions.map(session => (
                        <div
                          key={session.id}
                          className='flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50'
                        >
                          <Avatar>
                            <AvatarImage src={session.mentee.avatar} />
                            <AvatarFallback>
                              {session.mentee.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate font-medium'>
                              {session.mentee.name}
                            </p>
                            <p className='truncate text-sm text-muted-foreground'>
                              {session.topic}
                            </p>
                            <div className='mt-1 flex items-center gap-2'>
                              <span className='text-sm text-muted-foreground'>
                                {formatDate(session.date)} at{' '}
                                {formatTime(session.time)}
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                <Timer className='mr-1 h-3 w-3' />
                                {session.duration}min
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(session.status)}
                            variant='secondary'
                          >
                            {session.status === 'confirmed' && (
                              <CheckCircle className='mr-1 h-3 w-3' />
                            )}
                            {session.status === 'pending' && (
                              <AlertCircle className='mr-1 h-3 w-3' />
                            )}
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                      {mockUpcomingSessions.length === 0 && (
                        <div className='py-8 text-center text-muted-foreground'>
                          <Calendar className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p>No upcoming sessions</p>
                          <Button variant='outline' className='mt-4'>
                            <Plus className='mr-2 h-4 w-4' />
                            Schedule a Session
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='requests' className='space-y-6'>
                <Card className='shadow-soft'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle>Recent Requests</CardTitle>
                        <CardDescription>
                          New mentorship requests awaiting response
                        </CardDescription>
                      </div>
                      <Button variant='ghost' size='sm'>
                        View All
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {mockRecentRequests.map(request => (
                        <div
                          key={request.id}
                          className='flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50'
                        >
                          <Avatar>
                            <AvatarImage src={request.mentee.avatar} />
                            <AvatarFallback>
                              {request.mentee.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate font-medium'>
                              {request.mentee.name}
                            </p>
                            <p className='truncate text-sm text-muted-foreground'>
                              {request.topic}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              Requested for {formatDate(request.requestedDate)}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <Button size='sm' variant='outline'>
                              Decline
                            </Button>
                            <Button size='sm'>Accept</Button>
                          </div>
                        </div>
                      ))}
                      {mockRecentRequests.length === 0 && (
                        <div className='py-8 text-center text-muted-foreground'>
                          <MessageSquare className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p>No pending requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <Card className='hover-lift shadow-soft cursor-pointer'>
                <CardContent className='p-6 text-center'>
                  <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                    <Users className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h3 className='mb-2 font-semibold'>Find Mentors</h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Discover experienced mentors in your field
                  </p>
                  <Button variant='outline' size='sm' className='w-full'>
                    Browse Mentors
                  </Button>
                </CardContent>
              </Card>

              <Card className='hover-lift shadow-soft cursor-pointer'>
                <CardContent className='p-6 text-center'>
                  <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                    <Calendar className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                  <h3 className='mb-2 font-semibold'>Manage Availability</h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Update your schedule and availability
                  </p>
                  <Button variant='outline' size='sm' className='w-full'>
                    Set Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card className='hover-lift shadow-soft cursor-pointer'>
                <CardContent className='p-6 text-center'>
                  <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                    <BarChart3 className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                  <h3 className='mb-2 font-semibold'>View Analytics</h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Detailed insights into your mentorship impact
                  </p>
                  <Button variant='outline' size='sm' className='w-full'>
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
