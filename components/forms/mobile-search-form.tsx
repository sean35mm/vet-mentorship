'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MobileDrawer, ResponsiveButtonGroup } from '../ui/responsive-card';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Briefcase, 
  Star,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';

const searchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  industry: z.array(z.string()).optional(),
  militaryBranch: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional(),
  availability: z.enum(['any', 'weekdays', 'evenings', 'weekends']).optional(),
  experience: z.enum(['any', '1-3', '4-7', '8-15', '15+']).optional(),
  rating: z.number().min(0).max(5).optional(),
  responseTime: z.enum(['any', 'within-hour', 'within-day', 'within-week']).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface MobileSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  loading?: boolean;
  initialData?: Partial<SearchFormData>;
  className?: string;
}

const MobileSearchForm: React.FC<MobileSearchFormProps> = ({
  onSearch,
  loading = false,
  initialData,
  className,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
      location: '',
      industry: [],
      militaryBranch: [],
      expertise: [],
      availability: 'any',
      experience: 'any',
      rating: 0,
      responseTime: 'any',
      ...initialData,
    },
  });

  const watchedValues = watch();

  // Update active filters count
  React.useEffect(() => {
    const filters = [];
    if (watchedValues.location) filters.push('location');
    if (watchedValues.industry?.length) filters.push('industry');
    if (watchedValues.militaryBranch?.length) filters.push('military');
    if (watchedValues.expertise?.length) filters.push('expertise');
    if (watchedValues.availability !== 'any') filters.push('availability');
    if (watchedValues.experience !== 'any') filters.push('experience');
    if (watchedValues.rating && watchedValues.rating > 0) filters.push('rating');
    if (watchedValues.responseTime !== 'any') filters.push('response');
    
    setActiveFilters(filters);
  }, [watchedValues]);

  const onSubmit = (data: SearchFormData) => {
    onSearch(data);
    setShowFilters(false);
  };

  const clearFilters = () => {
    reset({
      query: watchedValues.query,
      location: '',
      industry: [],
      militaryBranch: [],
      expertise: [],
      availability: 'any',
      experience: 'any',
      rating: 0,
      responseTime: 'any',
    });
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Government',
    'Consulting', 'Manufacturing', 'Retail', 'Non-profit', 'Startup'
  ];

  const militaryBranches = [
    'Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'
  ];

  const expertiseAreas = [
    'Leadership', 'Career Transition', 'Technical Skills', 'Entrepreneurship',
    'Project Management', 'Communication', 'Networking', 'Interview Prep'
  ];

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Search Bar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Main search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register('query')}
                placeholder="Search mentors by name, skills, or company..."
                className="pl-10 pr-4 h-12"
              />
            </div>

            {/* Mobile action buttons */}
            <ResponsiveButtonGroup className="w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex-1 relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </ResponsiveButtonGroup>
          </form>

          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Filters:</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedValues.location && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {watchedValues.location}
                  </Badge>
                )}
                {watchedValues.industry?.map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {item}
                  </Badge>
                ))}
                {watchedValues.militaryBranch?.map((branch) => (
                  <Badge key={branch} variant="secondary" className="text-xs">
                    {branch}
                  </Badge>
                ))}
                {watchedValues.expertise?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {watchedValues.availability !== 'any' && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {watchedValues.availability}
                  </Badge>
                )}
                {watchedValues.rating && watchedValues.rating > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {watchedValues.rating}+ stars
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Filters Drawer */}
      <MobileDrawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Search Filters"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <Input
              {...register('location')}
              placeholder="City, State or Remote"
              className="w-full"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="inline h-4 w-4 mr-1" />
              Industry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {industries.map((industry) => (
                <label key={industry} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={industry}
                    {...register('industry')}
                    className="rounded border-gray-300"
                  />
                  <span>{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Military Branch */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Military Branch
            </label>
            <div className="grid grid-cols-2 gap-2">
              {militaryBranches.map((branch) => (
                <label key={branch} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={branch}
                    {...register('militaryBranch')}
                    className="rounded border-gray-300"
                  />
                  <span>{branch}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Expertise Areas
            </label>
            <div className="grid grid-cols-1 gap-2">
              {expertiseAreas.map((area) => (
                <label key={area} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={area}
                    {...register('expertise')}
                    className="rounded border-gray-300"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Availability
            </label>
            <select {...register('availability')} className="w-full p-2 border rounded-md">
              <option value="any">Any time</option>
              <option value="weekdays">Weekdays</option>
              <option value="evenings">Evenings</option>
              <option value="weekends">Weekends</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Years of Experience
            </label>
            <select {...register('experience')} className="w-full p-2 border rounded-md">
              <option value="any">Any experience</option>
              <option value="1-3">1-3 years</option>
              <option value="4-7">4-7 years</option>
              <option value="8-15">8-15 years</option>
              <option value="15+">15+ years</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Star className="inline h-4 w-4 mr-1" />
              Minimum Rating
            </label>
            <select {...register('rating', { valueAsNumber: true })} className="w-full p-2 border rounded-md">
              <option value={0}>Any rating</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={4.5}>4.5+ stars</option>
            </select>
          </div>

          {/* Response Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Response Time
            </label>
            <select {...register('responseTime')} className="w-full p-2 border rounded-md">
              <option value="any">Any response time</option>
              <option value="within-hour">Within 1 hour</option>
              <option value="within-day">Within 1 day</option>
              <option value="within-week">Within 1 week</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="flex-1"
            >
              Clear Filters
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </MobileDrawer>
    </div>
  );
};

export { MobileSearchForm, type SearchFormData };
