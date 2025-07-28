'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { ResponsiveButtonGroup, HideOnMobile, ShowOnMobile } from './responsive-card';
import { 
  Star,
  MapPin,
  Briefcase,
  Clock,
  MessageSquare,
  Calendar,
  Users,
  Award,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    company: string;
    location: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    expertise: string[];
    militaryBranch: string;
    yearsOfService: number;
    bio: string;
    availability: string;
    totalSessions: number;
    isVerified?: boolean;
  };
  onViewProfile: (mentorId: string) => void;
  onSendMessage: (mentorId: string) => void;
  onScheduleSession: (mentorId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'mobile';
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onViewProfile,
  onSendMessage,
  onScheduleSession,
  className,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact' || variant === 'mobile';

  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200 cursor-pointer',
      {
        'p-3': variant === 'mobile',
        'p-4': variant === 'compact',
        'p-6': variant === 'default',
      },
      className
    )}>
      <CardContent className="p-0">
        {/* Mobile Layout */}
        <ShowOnMobile>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <Avatar className="flex-shrink-0">
                {mentor.avatar && <AvatarImage src={mentor.avatar} />}
                <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base truncate">{mentor.name}</h3>
                  {mentor.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {mentor.title} at {mentor.company}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{mentor.rating}</span>
                    <span className="text-xs text-muted-foreground">({mentor.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">{mentor.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {mentor.bio}
            </p>

            {/* Military Info */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-muted-foreground" />
                <span>{mentor.militaryBranch}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{mentor.totalSessions} sessions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{mentor.responseTime}</span>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1">
              {mentor.expertise.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs px-2 py-1">
                  {skill}
                </Badge>
              ))}
              {mentor.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{mentor.expertise.length - 3} more
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(mentor.id)}
                className="flex-1 text-xs"
              >
                View Profile
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
              <Button
                size="sm"
                onClick={() => onScheduleSession(mentor.id)}
                className="flex-1 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </ShowOnMobile>

        {/* Desktop Layout */}
        <HideOnMobile>
          <div className="flex items-start space-x-4">
            <Avatar className="flex-shrink-0 h-12 w-12">
              {mentor.avatar && <AvatarImage src={mentor.avatar} />}
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    {mentor.isVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {mentor.title} at {mentor.company}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{mentor.rating}</span>
                  <span className="text-muted-foreground">({mentor.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Info Row */}
              <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{mentor.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{mentor.militaryBranch} • {mentor.yearsOfService} years</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{mentor.totalSessions} sessions completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Responds {mentor.responseTime}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {mentor.bio}
              </p>

              {/* Expertise and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 4} more
                    </Badge>
                  )}
                </div>

                <ResponsiveButtonGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile(mentor.id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage(mentor.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onScheduleSession(mentor.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </ResponsiveButtonGroup>
              </div>
            </div>
          </div>
        </HideOnMobile>
      </CardContent>
    </Card>
  );
};
