'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { ReviewForm, type ReviewFormData, type Session } from '../../components/forms/review-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { 
  Star,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  Calendar,
  User,
  Award,
  BarChart3,
  Plus,
  Eye,
  Reply,
  Flag,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Mock data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

const mockReviews = [
  {
    id: '1',
    sessionId: 'session_1',
    reviewer: {
      id: 'user_1',
      name: 'Sarah Johnson',
      avatar: undefined,
      title: 'Software Engineer',
      company: 'Google',
    },
    reviewee: {
      id: 'user_2',
      name: 'John Smith',
      avatar: undefined,
      title: 'Senior Engineering Manager',
      company: 'Microsoft',
    },
    rating: 5,
    feedback: 'John provided excellent guidance on transitioning from military to tech. His insights on leadership and technical skills were invaluable. The session was well-structured and he gave actionable advice.',
    helpfulAspects: ['Clear Communication', 'Industry Expertise', 'Practical Advice'],
    sessionTopic: 'Career Transition Strategy',
    sessionDate: '2024-01-10',
    createdAt: '2024-01-11T10:00:00Z',
    isPublic: true,
    wouldRecommend: true,
    mentorResponse: 'Thank you Sarah! It was great working with you. Best of luck with your transition!',
    respondedAt: '2024-01-11T14:30:00Z',
  },
  {
    id: '2',
    sessionId: 'session_2',
    reviewer: {
      id: 'user_3',
      name: 'Mike Chen',
      avatar: undefined,
      title: 'Product Manager',
      company: 'Amazon',
    },
    reviewee: {
      id: 'user_2',
      name: 'John Smith',
      avatar: undefined,
      title: 'Senior Engineering Manager',
      company: 'Microsoft',
    },
    rating: 4,
    feedback: 'Great session on leadership development. John shared practical examples from his experience and provided useful frameworks for team management.',
    helpfulAspects: ['Leadership Tips', 'Practical Advice', 'Career Guidance'],
    sessionTopic: 'Leadership Development',
    sessionDate: '2024-01-08',
    createdAt: '2024-01-09T16:00:00Z',
    isPublic: true,
    wouldRecommend: true,
  },
  {
    id: '3',
    sessionId: 'session_3',
    reviewer: {
      id: 'user_4',
      name: 'Emily Davis',
      avatar: undefined,
      title: 'Data Scientist',
      company: 'Netflix',
    },
    reviewee: {
      id: 'user_2',
      name: 'John Smith',
      avatar: undefined,
      title: 'Senior Engineering Manager',
      company: 'Microsoft',
    },
    rating: 5,
    feedback: 'Exceptional mentorship session! John helped me understand the technical interview process and provided great tips for system design questions.',
    helpfulAspects: ['Technical Knowledge', 'Interview Preparation', 'Clear Communication'],
    sessionTopic: 'Technical Interview Prep',
    sessionDate: '2024-01-05',
    createdAt: '2024-01-06T09:00:00Z',
    isPublic: true,
    wouldRecommend: true,
    mentorResponse: 'Thanks Emily! You\'re well-prepared and I\'m confident you\'ll do great in your interviews.',
    respondedAt: '2024-01-06T11:15:00Z',
  },
];

const mockPendingReviews = [
  {
    id: 'session_4',
    date: '2024-01-12',
    duration: 60,
    topic: 'Entrepreneurship Guidance',
    mentor: {
      id: 'mentor_1',
      name: 'Alex Rodriguez',
      avatar: undefined,
      title: 'Startup Founder',
      company: 'TechVet Solutions',
    },
  },
  {
    id: 'session_5',
    date: '2024-01-14',
    duration: 90,
    topic: 'Project Management',
    mentor: {
      id: 'mentor_2',
      name: 'Lisa Wang',
      avatar: undefined,
      title: 'VP of Engineering',
      company: 'Stripe',
    },
  },
];

const mockStats = {
  totalReviews: 24,
  averageRating: 4.8,
  fiveStarReviews: 18,
  recommendationRate: 96,
  responseRate: 85,
  totalSessions: 28,
};

interface ReviewCardProps {
  review: typeof mockReviews[0];
  onReply?: (reviewId: string) => void;
  onFlag?: (reviewId: string) => void;
  showModerationActions?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onReply, 
  onFlag, 
  showModerationActions = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              {review.reviewer.avatar && <AvatarImage src={review.reviewer.avatar} />}
              <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{review.reviewer.name}</h4>
              <p className="text-sm text-muted-foreground">
                {review.reviewer.title} at {review.reviewer.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {review.wouldRecommend && (
              <Badge variant="secondary" >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Recommends
              </Badge>
            )}
            {showModerationActions && (
              <Button
                variant="ghost"
                
                onClick={() => onFlag?.(review.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Session: {review.sessionTopic}</span>
            <span>•</span>
            <span>{formatDate(review.sessionDate)}</span>
          </div>

          <p className="text-muted-foreground">{review.feedback}</p>

          {review.helpfulAspects && review.helpfulAspects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.helpfulAspects.map((aspect) => (
                <Badge key={aspect} variant="outline" >
                  {aspect}
                </Badge>
              ))}
            </div>
          )}

          {review.mentorResponse && (
            <div className="mt-4 p-3 bg-primary/5 rounded-md border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  {review.reviewee.avatar && <AvatarImage src={review.reviewee.avatar} />}
                  <AvatarFallback>{review.reviewee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{review.reviewee.name}</span>
                <span className="text-xs text-muted-foreground">
                  {review.respondedAt && formatDate(review.respondedAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{review.mentorResponse}</p>
            </div>
          )}

          {!review.mentorResponse && onReply && (
            <Button
              variant="outline"
              
              onClick={() => onReply(review.id)}
              className="mt-2"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = React.useState<'received' | 'given' | 'pending'>('received');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [replyingToReview, setReplyingToReview] = React.useState<string | null>(null);

  const filteredReviews = mockReviews.filter(review =>
    review.reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.sessionTopic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitReview = async (data: ReviewFormData) => {
    console.log('Submitting review:', data);
    // In a real app, this would call a Convex mutation
    setIsReviewModalOpen(false);
    setSelectedSession(null);
  };

  const handleWriteReview = (session: typeof mockPendingReviews[0]) => {
    const sessionData: Session = {
      id: session.id,
      date: session.date,
      duration: session.duration,
      topic: session.topic,
      mentor: session.mentor,
    };
    setSelectedSession(sessionData);
    setIsReviewModalOpen(true);
  };

  const handleReplyToReview = (reviewId: string) => {
    setReplyingToReview(reviewId);
    // In a real app, this would open a reply modal or form
    console.log('Replying to review:', reviewId);
  };

  const handleFlagReview = (reviewId: string) => {
    console.log('Flagging review:', reviewId);
    // In a real app, this would call a moderation API
  };

  return (
    <DashboardLayout
      title="Reviews"
      description="Manage your mentorship reviews and feedback"
      user={mockUser}
      actions={
        <Button >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{mockStats.totalReviews}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{mockStats.averageRating}</p>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                  <p className="text-2xl font-bold">{mockStats.fiveStarReviews}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommendation Rate</p>
                  <p className="text-2xl font-bold">{mockStats.recommendationRate}%</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2 inline" />
              Received ({mockReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('given')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'given'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="h-4 w-4 mr-2 inline" />
              Given (12)
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Pending ({mockPendingReviews.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReply={handleReplyToReview}
                onFlag={handleFlagReview}
              />
            ))}
            
            {filteredReviews.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Try adjusting your search criteria.'
                      : 'Reviews from your mentees will appear here.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessions Awaiting Review</CardTitle>
                <CardDescription>
                  Complete your reviews to help improve the mentorship experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingReviews.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          {session.mentor.avatar && <AvatarImage src={session.mentor.avatar} />}
                          <AvatarFallback>{session.mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{session.mentor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.mentor.title} at {session.mentor.company}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{session.topic}</span>
                            <span>•</span>
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleWriteReview(session)}>
                        <Star className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'given' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Reviews You've Given</h3>
              <p className="text-muted-foreground">
                Reviews you've written for your mentors will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Submission Modal */}
      {selectedSession && (
        <Modal
          open={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedSession(null);
          }}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Write Review</h2>
            <ReviewForm
              session={selectedSession}
              onSubmit={handleSubmitReview}
            />
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
