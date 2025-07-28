'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { SearchForm, type SearchFormData } from '../../components/forms/search-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Modal } from '../../components/ui/modal';
import { 
  Star,
  MapPin,
  Briefcase,
  Clock,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';

// Mock data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

const mockMentors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: undefined,
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviewCount: 47,
    responseTime: 'within 2 hours',
    expertise: ['Leadership', 'Career Transition', 'Technical Skills'],
    militaryBranch: 'Army',
    yearsOfService: 8,
    bio: 'Former Army officer turned tech leader. Passionate about helping veterans transition into successful tech careers.',
    availability: 'weekdays',
    hourlyRate: null,
    totalSessions: 156,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: undefined,
    title: 'Product Manager',
    company: 'Microsoft',
    location: 'Seattle, WA',
    rating: 4.8,
    reviewCount: 32,
    responseTime: 'within 4 hours',
    expertise: ['Product Management', 'Strategy', 'Leadership'],
    militaryBranch: 'Navy',
    yearsOfService: 6,
    bio: 'Navy veteran with 10+ years in product management. Love helping fellow veterans navigate corporate environments.',
    availability: 'evenings',
    hourlyRate: null,
    totalSessions: 89,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Emily Davis',
    avatar: undefined,
    title: 'Engineering Manager',
    company: 'Amazon',
    location: 'Austin, TX',
    rating: 4.7,
    reviewCount: 28,
    responseTime: 'within 1 day',
    expertise: ['Engineering Management', 'Team Building', 'Technical Leadership'],
    militaryBranch: 'Air Force',
    yearsOfService: 4,
    bio: 'Air Force veteran leading engineering teams at scale. Focused on helping veterans develop leadership skills.',
    availability: 'weekends',
    hourlyRate: null,
    totalSessions: 67,
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    avatar: undefined,
    title: 'Startup Founder & CEO',
    company: 'TechVet Solutions',
    location: 'Denver, CO',
    rating: 4.9,
    reviewCount: 41,
    responseTime: 'within 1 hour',
    expertise: ['Entrepreneurship', 'Startup Strategy', 'Fundraising'],
    militaryBranch: 'Marines',
    yearsOfService: 12,
    bio: 'Marine veteran and serial entrepreneur. Built multiple successful startups and love mentoring aspiring veteran entrepreneurs.',
    availability: 'weekdays',
    hourlyRate: null,
    totalSessions: 134,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: undefined,
    title: 'VP of Engineering',
    company: 'Stripe',
    location: 'New York, NY',
    rating: 4.8,
    reviewCount: 35,
    responseTime: 'within 6 hours',
    expertise: ['Engineering Leadership', 'Scaling Teams', 'Technical Strategy'],
    militaryBranch: 'Coast Guard',
    yearsOfService: 5,
    bio: 'Coast Guard veteran leading engineering at high-growth fintech. Passionate about diversity and inclusion in tech.',
    availability: 'weekdays',
    hourlyRate: null,
    totalSessions: 98,
    isAvailable: true,
  },
  {
    id: '6',
    name: 'David Kim',
    avatar: undefined,
    title: 'Data Science Director',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    rating: 4.6,
    reviewCount: 22,
    responseTime: 'within 1 day',
    expertise: ['Data Science', 'Machine Learning', 'Analytics'],
    militaryBranch: 'Army',
    yearsOfService: 7,
    bio: 'Army intelligence officer turned data science leader. Help veterans break into data science and analytics roles.',
    availability: 'evenings',
    hourlyRate: null,
    totalSessions: 54,
    isAvailable: true,
  },
];

interface MentorCardProps {
  mentor: typeof mockMentors[0];
  onViewProfile: (mentor: typeof mockMentors[0]) => void;
  onRequestSession: (mentor: typeof mockMentors[0]) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onViewProfile, onRequestSession }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-12 w-12">
            {mentor.avatar && <AvatarImage src={mentor.avatar} />}
            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
              {mentor.isAvailable && (
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Available" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {mentor.title} at {mentor.company}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              {mentor.location}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{mentor.rating}</span>
                <span className="text-muted-foreground">({mentor.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{mentor.responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" >
              {mentor.militaryBranch}
            </Badge>
            <Badge variant="outline" >
              {mentor.yearsOfService} years service
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
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

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {mentor.bio}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{mentor.totalSessions} sessions completed</span>
          <span className="capitalize">{mentor.availability} availability</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            
            onClick={() => onViewProfile(mentor)}
            className="flex-1"
          >
            View Profile
          </Button>
          <Button
            
            onClick={() => onRequestSession(mentor)}
            disabled={!mentor.isAvailable}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface MentorProfileModalProps {
  mentor: typeof mockMentors[0] | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestSession: (mentor: typeof mockMentors[0]) => void;
}

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({
  mentor,
  isOpen,
  onClose,
  onRequestSession,
}) => {
  if (!mentor) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            {mentor.avatar && <AvatarImage src={mentor.avatar} />}
            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{mentor.name}</h2>
            <p className="text-muted-foreground mb-2">
              {mentor.title} at {mentor.company}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              {mentor.location}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{mentor.rating}</span>
                <span className="text-muted-foreground">({mentor.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Responds {mentor.responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Military Background</h3>
          <div className="flex gap-2">
            <Badge variant="outline">
              {mentor.militaryBranch}
            </Badge>
            <Badge variant="outline">
              {mentor.yearsOfService} years of service
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Areas of Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-muted-foreground">{mentor.bio}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{mentor.totalSessions}</div>
            <div className="text-sm text-muted-foreground">Sessions Completed</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold capitalize">{mentor.availability}</div>
            <div className="text-sm text-muted-foreground">Availability</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onRequestSession(mentor);
              onClose();
            }}
            disabled={!mentor.isAvailable}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Session
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default function SearchPage() {
  const [searchResults, setSearchResults] = React.useState(mockMentors);
  const [selectedMentor, setSelectedMentor] = React.useState<typeof mockMentors[0] | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const resultsPerPage = 6;
  const totalPages = Math.ceil(searchResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const handleSearch = async (searchData: SearchFormData) => {
    setIsLoading(true);
    setCurrentPage(1);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mentors based on search criteria
    let filtered = mockMentors;
    
    if (searchData.query) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchData.query!.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchData.query!.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchData.query!.toLowerCase()) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(searchData.query!.toLowerCase()))
      );
    }
    
    if (searchData.location) {
      filtered = filtered.filter(mentor =>
        mentor.location.toLowerCase().includes(searchData.location!.toLowerCase())
      );
    }
    
    if (searchData.militaryBranch && searchData.militaryBranch.length > 0) {
      filtered = filtered.filter(mentor =>
        searchData.militaryBranch!.includes(mentor.militaryBranch)
      );
    }
    
    if (searchData.expertise && searchData.expertise.length > 0) {
      filtered = filtered.filter(mentor =>
        searchData.expertise!.some(skill =>
          mentor.expertise.some(mentorSkill =>
            mentorSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    if (searchData.availability && searchData.availability !== 'any') {
      filtered = filtered.filter(mentor =>
        mentor.availability === searchData.availability
      );
    }
    
    if (searchData.rating && searchData.rating > 0) {
      filtered = filtered.filter(mentor => mentor.rating >= searchData.rating!);
    }
    
    setSearchResults(filtered);
    setIsLoading(false);
  };

  const handleViewProfile = (mentor: typeof mockMentors[0]) => {
    setSelectedMentor(mentor);
    setIsProfileModalOpen(true);
  };

  const handleRequestSession = (mentor: typeof mockMentors[0]) => {
    console.log('Requesting session with:', mentor.name);
    // In a real app, this would navigate to the request form or open a modal
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout
      title="Find Mentors"
      description="Discover experienced veteran mentors to guide your career journey"
      user={mockUser}
    >
      <div className="space-y-8">
        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={isLoading} />

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {searchResults.length} mentor{searchResults.length !== 1 ? 's' : ''} found
            </h2>
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, searchResults.length)} of {searchResults.length} results
            </p>
          </div>
          
          {/* Sort Options */}
          <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option value="rating">Highest Rated</option>
            <option value="sessions">Most Sessions</option>
            <option value="response">Fastest Response</option>
            <option value="recent">Recently Active</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && (
          <>
            {currentResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentResults.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onViewProfile={handleViewProfile}
                    onRequestSession={handleRequestSession}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters to find more mentors.
                  </p>
                  <Button variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        mentor={selectedMentor}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onRequestSession={handleRequestSession}
      />
    </DashboardLayout>
  );
}
