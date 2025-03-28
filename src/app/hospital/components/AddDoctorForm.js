'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function AddDoctorForm({ hospitalId, onDoctorAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slots, setSlots] = useState([{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const doctorData = {
        ...data,
        hospital: hospitalId,
        availableSlots: slots,
      };
      
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add doctor');
      }
      
      setSuccess('Doctor added successfully!');
      reset();
      setSlots([{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
      
      // Notify parent component
      if (onDoctorAdded) {
        onDoctorAdded();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };
  
  const addSlot = () => {
    setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };
  
  const removeSlot = (index) => {
    if (slots.length > 1) {
      const newSlots = [...slots];
      newSlots.splice(index, 1);
      setSlots(newSlots);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Doctor Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Doctor name is required' })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          {...register('specialization', { required: 'Specialization is required' })}
        />
        {errors.specialization && (
          <p className="text-sm text-red-500">{errors.specialization.message}</p>
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
        <Label>Available Time Slots</Label>
        {slots.map((slot, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
            <Select 
              value={slot.day} 
              onValueChange={(value) => handleSlotChange(index, 'day', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="time"
              value={slot.startTime}
              onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
            />
            
            <Input
              type="time"
              value={slot.endTime}
              onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeSlot(index)}
              disabled={slots.length === 1}
            >
              ×
            </Button>
          </div>
        ))}
        
        <Button type="button" variant="outline" size="sm" onClick={addSlot}>
          Add Time Slot
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding Doctor...' : 'Add Doctor'}
      </Button>
    </form>
  );
} 