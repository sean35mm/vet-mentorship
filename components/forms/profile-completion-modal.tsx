'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  User, 
  MapPin, 
  Shield, 
  Briefcase, 
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  userId: Id<'users'>;
  onComplete: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  militaryBranch: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force' | '';
  militaryRank: string;
  yearsOfService: number;
  currentRole: string;
  company: string;
  industry: string;
  skills: string[];
  isMentor: boolean;
  isMentee: boolean;
  mentorshipAreas: string[];
}

const MILITARY_BRANCHES = [
  'Army',
  'Navy', 
  'Air Force',
  'Marines',
  'Coast Guard',
  'Space Force'
] as const;

const INDUSTRIES = [
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
  'Other'
];

const MENTORSHIP_AREAS = [
  'Career Transition',
  'Leadership Development',
  'Technical Skills',
  'Entrepreneurship',
  'Networking',
  'Interview Preparation',
  'Resume Writing',
  'Industry Knowledge',
  'Work-Life Balance',
  'Professional Development'
];

export default function ProfileCompletionModal({ 
  isOpen, 
  userId, 
  onComplete 
}: ProfileCompletionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    militaryBranch: '',
    militaryRank: '',
    yearsOfService: 0,
    currentRole: '',
    company: '',
    industry: '',
    skills: [],
    isMentor: false,
    isMentee: true,
    mentorshipAreas: []
  });

  const completeProfile = useMutation(api.mutations.users.completeProfile);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleInputChange('skills', skills);
  };

  const toggleMentorshipArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      mentorshipAreas: prev.mentorshipAreas.includes(area)
        ? prev.mentorshipAreas.filter(a => a !== area)
        : [...prev.mentorshipAreas, area]
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim() && formData.bio.trim();
      case 2:
        return formData.location.trim();
      case 3:
        return formData.militaryBranch && formData.militaryRank.trim() && formData.yearsOfService > 0;
      case 4:
        return formData.industry.trim() && formData.skills.length > 0;
      case 5:
        return (formData.isMentor || formData.isMentee) && formData.mentorshipAreas.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) return;

    setIsSubmitting(true);
    try {
      await completeProfile({
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        militaryBranch: formData.militaryBranch as any,
        militaryRank: formData.militaryRank,
        yearsOfService: formData.yearsOfService,
        currentRole: formData.currentRole || undefined,
        company: formData.company || undefined,
        industry: formData.industry,
        skills: formData.skills,
        isMentor: formData.isMentor,
        isMentee: formData.isMentee,
        mentorshipAreas: formData.mentorshipAreas,
      });
      onComplete();
    } catch (error) {
      console.error('Error completing profile:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-fire_brick-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-prussian_blue-500 mb-2">Personal Information</h3>
              <p className="text-prussian_blue-400">Let's start with the basics</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Smith"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                  Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your military experience, and your career goals..."
                  rows={4}
                  className="w-full px-3 py-2 border border-air_superiority_blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire_brick-500 focus:border-fire_brick-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-fire_brick-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-prussian_blue-500 mb-2">Location</h3>
              <p className="text-prussian_blue-400">Where are you based?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State or City, Country"
                className="border-air_superiority_blue-300 focus:border-fire_brick-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-fire_brick-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-prussian_blue-500 mb-2">Military Background</h3>
              <p className="text-prussian_blue-400">Tell us about your service</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                  Military Branch *
                </label>
                <select
                  value={formData.militaryBranch}
                  onChange={(e) => handleInputChange('militaryBranch', e.target.value)}
                  className="w-full px-3 py-2 border border-air_superiority_blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire_brick-500 focus:border-fire_brick-500"
                >
                  <option value="">Select your branch</option>
                  {MILITARY_BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    Rank *
                  </label>
                  <Input
                    value={formData.militaryRank}
                    onChange={(e) => handleInputChange('militaryRank', e.target.value)}
                    placeholder="e.g., Captain, Sergeant"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    Years of Service *
                  </label>
                  <Input
                    type="number"
                    value={formData.yearsOfService}
                    onChange={(e) => handleInputChange('yearsOfService', parseInt(e.target.value) || 0)}
                    placeholder="4"
                    min="1"
                    max="50"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-fire_brick-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-prussian_blue-500 mb-2">Professional Information</h3>
              <p className="text-prussian_blue-400">Your career and skills</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                  Target Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-air_superiority_blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire_brick-500 focus:border-fire_brick-500"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    Current Role
                  </label>
                  <Input
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    placeholder="Software Engineer"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Google"
                    className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-2">
                  Skills * (comma-separated)
                </label>
                <Input
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="Leadership, Project Management, JavaScript, etc."
                  className="border-air_superiority_blue-300 focus:border-fire_brick-500"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-fire_brick-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-prussian_blue-500 mb-2">Mentorship Preferences</h3>
              <p className="text-prussian_blue-400">How do you want to participate?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-3">
                  I want to be a: *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.isMentee 
                        ? 'border-fire_brick-500 bg-fire_brick-50' 
                        : 'border-air_superiority_blue-300 hover:border-fire_brick-300'
                    }`}
                    onClick={() => handleInputChange('isMentee', !formData.isMentee)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-medium text-prussian_blue-500">Mentee</div>
                      <div className="text-sm text-prussian_blue-400">Seeking guidance</div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.isMentor 
                        ? 'border-fire_brick-500 bg-fire_brick-50' 
                        : 'border-air_superiority_blue-300 hover:border-fire_brick-300'
                    }`}
                    onClick={() => handleInputChange('isMentor', !formData.isMentor)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-medium text-prussian_blue-500">Mentor</div>
                      <div className="text-sm text-prussian_blue-400">Providing guidance</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-prussian_blue-500 mb-3">
                  Mentorship Areas * (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MENTORSHIP_AREAS.map(area => (
                    <Badge
                      key={area}
                      variant={formData.mentorshipAreas.includes(area) ? "default" : "outline"}
                      className={`cursor-pointer justify-center py-2 transition-all ${
                        formData.mentorshipAreas.includes(area)
                          ? 'bg-fire_brick-500 text-papaya_whip-500 hover:bg-fire_brick-600'
                          : 'border-air_superiority_blue-300 text-prussian_blue-500 hover:border-fire_brick-300'
                      }`}
                      onClick={() => toggleMentorshipArea(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-papaya_whip-500 border-air_superiority_blue-200">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold text-prussian_blue-500">
            Complete Your Profile
          </DialogTitle>
          <p className="text-prussian_blue-400 mt-2">
            Help us match you with the right mentors and opportunities
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-prussian_blue-400 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-6 border-t border-air_superiority_blue-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-air_superiority_blue-300 text-prussian_blue-500 hover:bg-air_superiority_blue-50"
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedToNext() || isSubmitting}
              className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500"
            >
              {isSubmitting ? 'Completing...' : 'Complete Profile'}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}