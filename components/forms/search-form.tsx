import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
  ChevronUp
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

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  loading?: boolean;
  initialData?: Partial<SearchFormData>;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  loading = false,
  initialData,
  className,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = React.useState(0);

  const form = useForm<SearchFormData>({
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

  const { register, handleSubmit, watch, setValue, reset } = form;
  const watchedValues = watch();

  // Count active filters
  React.useEffect(() => {
    let count = 0;
    if (watchedValues.location) count++;
    if (watchedValues.industry && watchedValues.industry.length > 0) count++;
    if (watchedValues.militaryBranch && watchedValues.militaryBranch.length > 0) count++;
    if (watchedValues.expertise && watchedValues.expertise.length > 0) count++;
    if (watchedValues.availability && watchedValues.availability !== 'any') count++;
    if (watchedValues.experience && watchedValues.experience !== 'any') count++;
    if (watchedValues.rating && watchedValues.rating > 0) count++;
    if (watchedValues.responseTime && watchedValues.responseTime !== 'any') count++;
    setActiveFiltersCount(count);
  }, [watchedValues]);

  const onFormSubmit = (data: SearchFormData) => {
    onSearch(data);
  };

  const clearAllFilters = () => {
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
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Government',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Non-Profit',
    'Aerospace',
    'Energy',
  ];

  const militaryBranches = [
    'Army',
    'Navy',
    'Air Force',
    'Marines',
    'Coast Guard',
    'Space Force',
  ];

  const expertiseAreas = [
    'Leadership',
    'Career Transition',
    'Technical Skills',
    'Entrepreneurship',
    'Project Management',
    'Sales & Marketing',
    'Finance & Accounting',
    'Human Resources',
    'Operations',
    'Strategy',
    'Data Analysis',
    'Software Development',
  ];

  const toggleArrayValue = (field: keyof SearchFormData, value: string) => {
    const currentValues = (watchedValues[field] as string[]) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value) as any);
    } else {
      setValue(field, [...currentValues, value] as any);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Mentors
          </CardTitle>
          <CardDescription>
            Search for mentors based on your preferences and needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Main Search */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  {...register('query')}
                  placeholder="Search by name, skills, company, or keywords..."
                  className="text-base"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Input
                {...register('location')}
                placeholder="Location"
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" >
                    {activeFiltersCount}
                  </Badge>
                )}
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-6 p-4 border rounded-lg bg-muted/50">
                {/* Industry */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Industry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => (
                      <Button
                        key={industry}
                        type="button"
                        variant={
                          (watchedValues.industry || []).includes(industry)
                            ? "default"
                            : "outline"
                        }
                        
                        onClick={() => toggleArrayValue('industry', industry)}
                      >
                        {industry}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Military Branch */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Military Branch</label>
                  <div className="flex flex-wrap gap-2">
                    {militaryBranches.map((branch) => (
                      <Button
                        key={branch}
                        type="button"
                        variant={
                          (watchedValues.militaryBranch || []).includes(branch)
                            ? "default"
                            : "outline"
                        }
                        
                        onClick={() => toggleArrayValue('militaryBranch', branch)}
                      >
                        {branch}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Expertise */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Areas of Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {expertiseAreas.map((area) => (
                      <Button
                        key={area}
                        type="button"
                        variant={
                          (watchedValues.expertise || []).includes(area)
                            ? "default"
                            : "outline"
                        }
                        
                        onClick={() => toggleArrayValue('expertise', area)}
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Availability & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Availability */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability
                    </label>
                    <select
                      {...register('availability')}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="any">Any time</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="evenings">Evenings</option>
                      <option value="weekends">Weekends</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Years of Experience</label>
                    <select
                      {...register('experience')}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="any">Any experience</option>
                      <option value="1-3">1-3 years</option>
                      <option value="4-7">4-7 years</option>
                      <option value="8-15">8-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>
                </div>

                {/* Rating & Response Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Minimum Rating */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Minimum Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setValue('rating', rating)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              'h-6 w-6 transition-colors',
                              rating <= (watchedValues.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        </button>
                      ))}
                      {(watchedValues.rating || 0) > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          
                          onClick={() => setValue('rating', 0)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Response Time</label>
                    <select
                      {...register('responseTime')}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="any">Any response time</option>
                      <option value="within-hour">Within 1 hour</option>
                      <option value="within-day">Within 1 day</option>
                      <option value="within-week">Within 1 week</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedValues.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {watchedValues.location}
                    <button
                      type="button"
                      onClick={() => setValue('location', '')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {(watchedValues.industry || []).map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <button
                      type="button"
                      onClick={() => toggleArrayValue('industry', industry)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {(watchedValues.militaryBranch || []).map((branch) => (
                  <Badge key={branch} variant="secondary" className="flex items-center gap-1">
                    {branch}
                    <button
                      type="button"
                      onClick={() => toggleArrayValue('militaryBranch', branch)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {(watchedValues.expertise || []).map((area) => (
                  <Badge key={area} variant="secondary" className="flex items-center gap-1">
                    {area}
                    <button
                      type="button"
                      onClick={() => toggleArrayValue('expertise', area)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {watchedValues.availability && watchedValues.availability !== 'any' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {watchedValues.availability}
                    <button
                      type="button"
                      onClick={() => setValue('availability', 'any')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {watchedValues.experience && watchedValues.experience !== 'any' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {watchedValues.experience} years
                    <button
                      type="button"
                      onClick={() => setValue('experience', 'any')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {(watchedValues.rating || 0) > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {watchedValues.rating}+ stars
                    <button
                      type="button"
                      onClick={() => setValue('rating', 0)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {watchedValues.responseTime && watchedValues.responseTime !== 'any' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {watchedValues.responseTime.replace('-', ' ')}
                    <button
                      type="button"
                      onClick={() => setValue('responseTime', 'any')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { SearchForm, type SearchFormData };