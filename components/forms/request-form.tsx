import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Spinner } from '../ui/loading';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const requestSchema = z.object({
  mentorId: z.string().min(1, 'Mentor is required'),
  requestedDate: z.date({
    required_error: 'Please select a date',
  }),
  requestedTime: z.string().min(1, 'Please select a time'),
  duration: z.number().min(30).max(180, 'Duration must be between 30-180 minutes'),
  topic: z.string().min(1, 'Topic is required'),
  message: z.string().min(10, 'Please provide more details (minimum 10 characters)'),
  urgency: z.enum(['low', 'medium', 'high']),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  responseTime: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface RequestFormProps {
  mentor: Mentor;
  availableSlots?: TimeSlot[];
  onSubmit: (data: RequestFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const RequestForm: React.FC<RequestFormProps> = ({
  mentor,
  availableSlots = [],
  onSubmit,
  loading = false,
  className,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [availableTimesForDate, setAvailableTimesForDate] = React.useState<TimeSlot[]>([]);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      mentorId: mentor.id,
      duration: 60,
      urgency: 'medium',
      topic: '',
      message: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchedDate = watch('requestedDate');
  const watchedTime = watch('requestedTime');
  const watchedDuration = watch('duration');

  // Mock available times for selected date
  React.useEffect(() => {
    if (selectedDate) {
      // In a real app, this would fetch available times from the API
      const mockTimes: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
      ];
      setAvailableTimesForDate(mockTimes);
    } else {
      setAvailableTimesForDate([]);
    }
  }, [selectedDate]);

  const onFormSubmit = async (data: RequestFormData) => {
    await onSubmit(data);
  };

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', description: 'Flexible timing' },
    { value: 'medium', label: 'Medium Priority', description: 'Within a week' },
    { value: 'high', label: 'High Priority', description: 'ASAP' },
  ];

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  const commonTopics = [
    'Career Transition',
    'Leadership Development',
    'Technical Skills',
    'Interview Preparation',
    'Networking',
    'Work-Life Balance',
    'Entrepreneurship',
    'Industry Insights',
  ];

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Mentorship Session
          </CardTitle>
          <CardDescription>
            Send a mentorship request to connect with your chosen mentor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mentor Info */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-4">
              <Avatar>
                {mentor.avatar && <AvatarImage src={mentor.avatar} />}
                <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.title} at {mentor.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">⭐</span>
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                  <Badge variant="outline" >
                    <Clock className="h-3 w-3 mr-1" />
                    {mentor.responseTime}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mentor.expertise.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" >
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <Badge variant="secondary" >
                      +{mentor.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">What would you like to discuss?</label>
              <Input
                {...register('topic')}
                placeholder="e.g., Career transition from military to tech"
                {...(errors.topic?.message && { errorMessage: errors.topic.message })}
              />
              <div className="flex flex-wrap gap-2">
                {commonTopics.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    
                    onClick={() => setValue('topic', topic)}
                    className="text-xs"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Preferred Date
              </label>
              <div className="border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setValue('requestedDate', date || new Date());
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              {errors.requestedDate && (
                <p className="text-sm text-destructive">{errors.requestedDate.message}</p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Times
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimesForDate.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={watchedTime === slot.time ? "default" : "outline"}
                      
                      disabled={!slot.available}
                      onClick={() => setValue('requestedTime', slot.time)}
                      className={cn(
                        'justify-center',
                        !slot.available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {slot.time}
                      {!slot.available && (
                        <span className="ml-1 text-xs">Taken</span>
                      )}
                    </Button>
                  ))}
                </div>
                {errors.requestedTime && (
                  <p className="text-sm text-destructive">{errors.requestedTime.message}</p>
                )}
              </div>
            )}

            {/* Duration */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Session Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={watchedDuration === option.value ? "default" : "outline"}
                    
                    onClick={() => setValue('duration', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Priority Level</label>
              <div className="space-y-2">
                {urgencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      {...register('urgency')}
                      value={option.value}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.value === 'high' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                        {option.value === 'medium' && <Clock className="h-4 w-4 text-blue-500" />}
                        {option.value === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Message to Mentor</label>
              <textarea
                {...register('message')}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                placeholder="Tell your mentor about your background, what you hope to achieve, and any specific questions you have..."
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Tip: Include your background, goals, and specific questions to help your mentor prepare
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t">
              <Button type="submit" disabled={loading || !selectedDate || !watchedTime}>
                {loading && <Spinner  className="mr-2" />}
                Send Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { RequestForm, type RequestFormData, type Mentor, type TimeSlot };