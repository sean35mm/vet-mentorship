import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/loading';
import { Plus, Trash2, Clock } from 'lucide-react';

const timeSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

const availabilitySchema = z.object({
  availability: z.array(timeSlotSchema),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;
type TimeSlot = z.infer<typeof timeSlotSchema>;

interface AvailabilityFormProps {
  initialData?: AvailabilityFormData;
  onSubmit: (data: AvailabilityFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  className,
}) => {
  const [availability, setAvailability] = React.useState<TimeSlot[]>(
    initialData?.availability || []
  );

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      availability: initialData?.availability || [],
    },
  });

  const { handleSubmit } = form;

  const daysOfWeek = [
    'Sunday',
    'Monday', 
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const timeOptions: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTime(timeString);
      timeOptions.push({ value: timeString, label: displayTime });
    }
  }

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: TimeSlot = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
    };
    setAvailability([...availability, newSlot]);
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value } as TimeSlot;
    setAvailability(updated);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const validateTimeSlot = (slot: TimeSlot): string | null => {
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    
    if (startMinutes >= endMinutes) {
      return 'Start time must be before end time';
    }
    
    if (endMinutes - startMinutes < 60) {
      return 'Time slot must be at least 1 hour long';
    }
    
    return null;
  };

  const getSlotsByDay = (dayOfWeek: number) => {
    return availability
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  const onFormSubmit = async (data: AvailabilityFormData) => {
    // Validate all time slots
    const errors = availability.map(validateTimeSlot).filter(Boolean);
    if (errors.length > 0) {
      alert('Please fix the time slot errors before saving.');
      return;
    }

    // Check for overlapping slots on the same day
    for (let day = 0; day < 7; day++) {
      const daySlots = getSlotsByDay(day);
      for (let i = 0; i < daySlots.length - 1; i++) {
        const current = daySlots[i];
        const next = daySlots[i + 1];
        
        if (current && next && timeToMinutes(current.endTime) > timeToMinutes(next.startTime)) {
          alert(`Overlapping time slots found on ${daysOfWeek[day]}. Please fix before saving.`);
          return;
        }
      }
    }

    await onSubmit({ availability });
  };

  const getTotalHours = () => {
    return availability.reduce((total, slot) => {
      const startMinutes = timeToMinutes(slot.startTime);
      const endMinutes = timeToMinutes(slot.endTime);
      return total + (endMinutes - startMinutes) / 60;
    }, 0);
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Set Your Availability
          </CardTitle>
          <CardDescription>
            Define when you're available for mentorship sessions. Each slot should be at least 1 hour long.
          </CardDescription>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total hours per week: <strong>{getTotalHours().toFixed(1)}</strong></span>
            <span>Time slots: <strong>{availability.length}</strong></span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {daysOfWeek.map((dayName, dayIndex) => {
                const daySlots = getSlotsByDay(dayIndex);
                
                return (
                  <div key={dayIndex} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{dayName}</h3>
                      <Button
                        type="button"
                        variant="outline"
                        
                        onClick={() => addTimeSlot(dayIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Slot
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {daySlots.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-md text-center">
                          No availability set for {dayName}
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const error = validateTimeSlot(slot);
                          
                          return (
                            <div
                              key={slot.originalIndex}
                              className={cn(
                                'p-3 border rounded-md space-y-2',
                                error ? 'border-destructive bg-destructive/5' : 'border-border'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <select
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(slot.originalIndex, 'startTime', e.target.value)}
                                  className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                                >
                                  {timeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                
                                <span className="text-muted-foreground">to</span>
                                
                                <select
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(slot.originalIndex, 'endTime', e.target.value)}
                                  className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                                >
                                  {timeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  
                                  onClick={() => removeTimeSlot(slot.originalIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {error && (
                                <p className="text-sm text-destructive">{error}</p>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" >
                                  {((timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)) / 60).toFixed(1)}h
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  
                  onClick={() => {
                    // Add standard business hours (9-5) for weekdays
                    const businessHours: TimeSlot[] = [];
                    for (let day = 1; day <= 5; day++) {
                      businessHours.push({
                        dayOfWeek: day,
                        startTime: '09:00',
                        endTime: '17:00',
                      });
                    }
                    setAvailability([...availability, ...businessHours]);
                  }}
                >
                  Add Business Hours (Mon-Fri 9-5)
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  
                  onClick={() => {
                    // Add evening hours for weekdays
                    const eveningHours: TimeSlot[] = [];
                    for (let day = 1; day <= 5; day++) {
                      eveningHours.push({
                        dayOfWeek: day,
                        startTime: '18:00',
                        endTime: '21:00',
                      });
                    }
                    setAvailability([...availability, ...eveningHours]);
                  }}
                >
                  Add Evening Hours (Mon-Fri 6-9pm)
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  
                  onClick={() => setAvailability([])}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t">
              <Button type="submit" disabled={loading || availability.length === 0}>
                {loading && <Spinner  className="mr-2" />}
                Save Availability
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const hour = parseInt(String(hours || 0));
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes || 0).padStart(2, "0")} ${ampm}`;
}

export { AvailabilityForm, type AvailabilityFormData, type TimeSlot };