'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingForm({ doctor, hospital, onBookingComplete, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patient, setPatient] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  
  useEffect(() => {
    // Check if patient is logged in
    const patientData = localStorage.getItem('patient');
    if (patientData) {
      const parsedData = JSON.parse(patientData);
      setPatient(parsedData);
      
      // Pre-fill form fields with patient data
      setValue('name', parsedData.name);
      setValue('phone', parsedData.phone);
      setValue('email', parsedData.email);
    }
  }, [setValue]);
  
  // Fetch booked slots when date or doctor changes
  useEffect(() => {
    if (selectedDate && doctor._id) {
      fetchBookedSlots();
      
      // Set up a refresh interval to keep booked slots up to date
      const intervalId = setInterval(fetchBookedSlots, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(intervalId); // Cleanup on unmount or when dependencies change
    }
  }, [selectedDate, doctor._id]);
  
  // Function to fetch already booked slots for the selected date and doctor
  const fetchBookedSlots = async () => {
    try {
      const response = await fetch(`/api/appointments/booked?date=${selectedDate}&doctor=${doctor._id}`);
      
      if (!response.ok) {
        console.error('Failed to fetch booked slots');
        return;
      }
      
      const data = await response.json();
      setBookedSlots(data.data || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };
  
  // Get the current date in YYYY-MM-DD format for the min date attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get day of week from date
  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  
  // Filter available slots based on the selected day
  const availableSlots = selectedDate
    ? doctor.availableSlots.filter((slot) => slot.day === getDayOfWeek(selectedDate))
    : [];
  
  // Generate time slots in 1-hour increments for visual booking
  const generateTimeSlots = (slot) => {
    const slots = [];
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const endHour = parseInt(slot.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${hour.toString().padStart(2, '0')}:59`;
      slots.push({ startTime, endTime });
    }
    
    return slots;
  };
  
  // Generate all available 1-hour slots for the selected day
  const hourlySlots = availableSlots.flatMap(generateTimeSlots);
  
  // Format time for display
  const formatTime = (timeString) => {
    const hour = parseInt(timeString.split(':')[0]);
    if (hour < 12) {
      return `${hour}:00 AM`;
    } else if (hour === 12) {
      return "12:00 PM";
    } else {
      return `${hour - 12}:00 PM`;
    }
  };
  
  // Check if a slot is already booked
  const isSlotBooked = (slot) => {
    return bookedSlots.some(
      bookedSlot => 
        bookedSlot.startTime === slot.startTime &&
        bookedSlot.endTime === slot.endTime
    );
  };
  
  const onSubmit = async (formData) => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // If patient is logged in, use their data
      const patientData = patient ? {
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email
      } : {
        patientName: formData.name,
        patientPhone: formData.phone,
        patientEmail: formData.email
      };
      
      const appointmentData = {
        doctor: doctor._id,
        hospital: hospital._id,
        ...patientData,
        date: selectedDate,
        timeSlot: {
          ...selectedSlot,
          day: getDayOfWeek(selectedDate)
        },
        status: 'scheduled',
      };
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // If the error is because the slot is already booked, refresh the booked slots
        if (response.status === 409 || (response.status === 400 && result.message.includes('already booked'))) {
          await fetchBookedSlots();
          throw new Error(`${result.message} Please select another time slot.`);
        }
        throw new Error(result.message || 'Failed to book appointment');
      }
      
      setSuccess({
        appointmentData: {
          doctor: doctor.name,
          hospital: hospital.name,
          date: selectedDate ? format(new Date(selectedDate), 'PPPP') : 'Unknown date',
          time: selectedSlot.time,
          patientName: patientData.name,
        }
      });
      
      // Reset form
      reset();
      
      // Inform parent component of successful booking
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.message);
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (success) {
    const { appointmentData } = success;
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">Appointment Confirmed!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-700">
              Your appointment has been successfully booked. Here's a summary:
            </p>
            <div className="bg-white rounded-lg p-4 border border-green-100 space-y-2">
              <div className="flex">
                <div className="w-24 text-slate-500">Doctor:</div>
                <div className="font-medium">{appointmentData.doctor}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-slate-500">Hospital:</div>
                <div className="font-medium">{appointmentData.hospital}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-slate-500">Date:</div>
                <div className="font-medium">{appointmentData.date}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-slate-500">Time:</div>
                <div className="font-medium">{appointmentData.time}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-slate-500">Patient:</div>
                <div className="font-medium">{appointmentData.patientName}</div>
              </div>
            </div>
            <p className="text-sm text-green-600">
              A confirmation has been saved to your account. You can view all your appointments anytime.
            </p>
            <div className="flex space-x-3 pt-2">
              <Button 
                onClick={() => window.location.href = '/patient/my-appointments'}
                className="bg-green-600 hover:bg-green-700"
              >
                View My Appointments
              </Button>
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => setSuccess(null)}
              >
                Book Another Appointment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-slate-600">Processing your appointment...</p>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Book Your Appointment</CardTitle>
          <CardDescription>
            Selected Doctor: <strong>{doctor.name}</strong> ({doctor.specialization})
          </CardDescription>
          <CardDescription>
            Hospital: <strong>{hospital.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!patient && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">Login Required</h4>
                  <p className="text-sm text-blue-600">
                    You need to be logged in to book an appointment. You can continue filling out this form,
                    but you'll need to log in before the appointment can be confirmed.
                  </p>
                  <a 
                    href={`/patient/login?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                    className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 mt-2"
                  >
                    Log in now <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                required
              />
            </div>
            
            {selectedDate && (
              <div className="space-y-4">
                <Label>Select Time Slot</Label>
                {availableSlots.length === 0 ? (
                  <p className="text-amber-600">No available slots on {formatDate(selectedDate)}</p>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-100 p-3 rounded-md">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm">Available</span>
                        <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                        <span className="text-sm">Selected</span>
                        <div className="w-4 h-4 rounded-full bg-red-300"></div>
                        <span className="text-sm">Booked</span>
                      </div>
                      <p className="text-xs text-slate-500">Select a convenient time slot for your appointment</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Morning</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {hourlySlots
                          .filter(slot => parseInt(slot.startTime.split(':')[0]) < 12)
                          .map((slot, index) => {
                            const booked = isSlotBooked(slot);
                            return (
                              <button
                                key={index}
                                type="button"
                                className={`p-2 text-center border rounded-md text-sm transition-colors
                                  ${selectedSlot && selectedSlot.startTime === slot.startTime
                                    ? 'bg-slate-300 border-slate-400 font-medium'
                                    : booked
                                      ? 'bg-red-100 border-red-200 text-red-500 cursor-not-allowed'
                                      : 'bg-green-100 border-green-200 hover:bg-green-200'
                                  }`}
                                onClick={() => !booked && setSelectedSlot(slot)}
                                disabled={booked}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {slot.startTime.split(':')[0]}:00 AM
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Afternoon</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {hourlySlots
                          .filter(slot => parseInt(slot.startTime.split(':')[0]) >= 12 && parseInt(slot.startTime.split(':')[0]) < 17)
                          .map((slot, index) => {
                            const booked = isSlotBooked(slot);
                            return (
                              <button
                                key={index}
                                type="button"
                                className={`p-2 text-center border rounded-md text-sm transition-colors
                                  ${selectedSlot && selectedSlot.startTime === slot.startTime
                                    ? 'bg-slate-300 border-slate-400 font-medium'
                                    : booked
                                      ? 'bg-red-100 border-red-200 text-red-500 cursor-not-allowed'
                                      : 'bg-green-100 border-green-200 hover:bg-green-200'
                                  }`}
                                onClick={() => !booked && setSelectedSlot(slot)}
                                disabled={booked}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {parseInt(slot.startTime.split(':')[0]) > 12 
                                    ? `${parseInt(slot.startTime.split(':')[0]) - 12}:00 PM` 
                                    : `12:00 PM`
                                  }
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Evening</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {hourlySlots
                          .filter(slot => parseInt(slot.startTime.split(':')[0]) >= 17)
                          .map((slot, index) => {
                            const booked = isSlotBooked(slot);
                            return (
                              <button
                                key={index}
                                type="button"
                                className={`p-2 text-center border rounded-md text-sm transition-colors
                                  ${selectedSlot && selectedSlot.startTime === slot.startTime
                                    ? 'bg-slate-300 border-slate-400 font-medium'
                                    : booked
                                      ? 'bg-red-100 border-red-200 text-red-500 cursor-not-allowed'
                                      : 'bg-green-100 border-green-200 hover:bg-green-200'
                                  }`}
                                onClick={() => !booked && setSelectedSlot(slot)}
                                disabled={booked}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {parseInt(slot.startTime.split(':')[0]) - 12}:00 PM
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Your Information</h3>
              
              {patient ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex">
                    <div className="w-24 text-slate-500">Name:</div>
                    <div className="font-medium">{patient.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-slate-500">Phone:</div>
                    <div className="font-medium">{patient.phone}</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-slate-500">Email:</div>
                    <div className="font-medium">{patient.email}</div>
                  </div>
                  <p className="text-xs text-slate-500 italic mt-2">
                    Your profile information will be used for the appointment.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Full name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedDate || !selectedSlot}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 