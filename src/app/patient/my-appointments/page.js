'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MyAppointments() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in as a patient
    const patientData = localStorage.getItem('patient');
    if (!patientData) {
      router.push('/patient/login');
      return;
    }

    const parsedData = JSON.parse(patientData);
    setPatient(parsedData);
    fetchAppointments(parsedData.email);
  }, [router]);

  const fetchAppointments = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/patient?email=${email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();
      setAppointments(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const confirmation = window.confirm('Are you sure you want to cancel this appointment?');
      
      if (!confirmation) return;
      
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }
      
      // Refresh appointments after cancellation
      if (patient) {
        fetchAppointments(patient.email);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium inline-block';
      case 'completed':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium inline-block';
      case 'cancelled':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium inline-block';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium inline-block';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Button onClick={() => router.push('/patient')} variant="outline">
          Book New Appointment
        </Button>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <p>Loading your appointments...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">You haven't booked any appointments yet.</p>
              <Button onClick={() => router.push('/patient')}>
                Book Your First Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Appointment History</CardTitle>
            <CardDescription>
              View and manage all your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>{formatDate(appointment.date)}</TableCell>
                    <TableCell>{formatTime(appointment.timeSlot.startTime)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.doctor.name}</p>
                        <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.hospital.name}</TableCell>
                    <TableCell>
                      <div className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'scheduled' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 