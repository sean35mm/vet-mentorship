import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/loading';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Calendar,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';

const reviewSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  rating: z.number().min(1, 'Please provide a rating').max(5, 'Rating must be between 1-5'),
  feedback: z.string().min(10, 'Please provide detailed feedback (minimum 10 characters)'),
  wouldRecommend: z.boolean(),
  helpfulAspects: z.array(z.string()).optional(),
  improvementSuggestions: z.string().optional(),
  followUpInterest: z.boolean(),
  publicReview: z.boolean(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Session {
  id: string;
  date: string;
  duration: number;
  topic: string;
  mentor: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    company: string;
  };
}

interface ReviewFormProps {
  session: Session;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  session,
  onSubmit,
  loading = false,
  className,
}) => {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      sessionId: session.id,
      rating: 0,
      feedback: '',
      wouldRecommend: true,
      helpfulAspects: [],
      improvementSuggestions: '',
      followUpInterest: false,
      publicReview: true,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchedRating = watch('rating');
  const watchedHelpfulAspects = watch('helpfulAspects') || [];
  const watchedWouldRecommend = watch('wouldRecommend');
  const watchedFollowUpInterest = watch('followUpInterest');
  const watchedPublicReview = watch('publicReview');

  const onFormSubmit = async (data: ReviewFormData) => {
    await onSubmit(data);
  };

  const helpfulAspectOptions = [
    'Clear Communication',
    'Industry Expertise',
    'Practical Advice',
    'Career Guidance',
    'Technical Knowledge',
    'Networking Insights',
    'Leadership Tips',
    'Interview Preparation',
    'Resume Feedback',
    'Goal Setting',
  ];

  const toggleHelpfulAspect = (aspect: string) => {
    const current = watchedHelpfulAspects;
    if (current.includes(aspect)) {
      setValue('helpfulAspects', current.filter(a => a !== aspect));
    } else {
      setValue('helpfulAspects', [...current, aspect]);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Session Review
          </CardTitle>
          <CardDescription>
            Share your feedback to help improve the mentorship experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Session Info */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-4">
              <Avatar>
                {session.mentor.avatar && <AvatarImage src={session.mentor.avatar} />}
                <AvatarFallback>{session.mentor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{session.mentor.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.mentor.title} at {session.mentor.company}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(session.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {session.duration} minutes
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" >
                    {session.topic}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setValue('rating', rating)}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (hoveredRating ? rating <= hoveredRating : rating <= watchedRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
                {watchedRating > 0 && (
                  <span className="ml-2 text-sm font-medium">
                    {getRatingText(watchedRating)}
                  </span>
                )}
              </div>
              {errors.rating && (
                <p className="text-sm text-destructive">{errors.rating.message}</p>
              )}
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Would you recommend this mentor?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setValue('wouldRecommend', true)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md border transition-colors',
                    watchedWouldRecommend
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-background border-border hover:bg-muted'
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes, I would recommend
                </button>
                <button
                  type="button"
                  onClick={() => setValue('wouldRecommend', false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md border transition-colors',
                    !watchedWouldRecommend
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-background border-border hover:bg-muted'
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                  No, I would not recommend
                </button>
              </div>
            </div>

            {/* Helpful Aspects */}
            <div className="space-y-3">
              <label className="text-sm font-medium">What aspects were most helpful?</label>
              <div className="grid grid-cols-2 gap-2">
                {helpfulAspectOptions.map((aspect) => (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => toggleHelpfulAspect(aspect)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors',
                      watchedHelpfulAspects.includes(aspect)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-border hover:bg-muted'
                    )}
                  >
                    {watchedHelpfulAspects.includes(aspect) && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {aspect}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Detailed Feedback</label>
              <textarea
                {...register('feedback')}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                placeholder="Share your experience with this mentorship session. What did you learn? How did it help you?"
              />
              {errors.feedback && (
                <p className="text-sm text-destructive">{errors.feedback.message}</p>
              )}
            </div>

            {/* Improvement Suggestions */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Suggestions for Improvement (Optional)</label>
              <textarea
                {...register('improvementSuggestions')}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                placeholder="Any suggestions on how the session could have been improved?"
              />
            </div>

            {/* Follow-up Interest */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('followUpInterest')}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium">
                  I'm interested in scheduling follow-up sessions with this mentor
                </label>
              </div>
            </div>

            {/* Public Review */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('publicReview')}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium">
                  Make this review public to help other mentees
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Your name will be displayed with the review. You can change this setting later.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t">
              <Button type="submit" disabled={loading || watchedRating === 0}>
                {loading && <Spinner  className="mr-2" />}
                Submit Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { ReviewForm, type ReviewFormData, type Session };