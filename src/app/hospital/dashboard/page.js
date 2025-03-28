'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddDoctorForm from '../components/AddDoctorForm';

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if the user is logged in
    const hospitalData = localStorage.getItem('hospital');
    if (!hospitalData) {
      router.push('/hospital');
      return;
    }
    
    setHospital(JSON.parse(hospitalData));
    fetchDoctors();
    fetchAppointments();
  }, [router]);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const hospitalData = JSON.parse(localStorage.getItem('hospital'));
      
      const response = await fetch('/api/doctors');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch doctors');
      }
      
      // Filter doctors by hospital ID
      const filteredDoctors = result.data.filter(
        (doctor) => doctor.hospital._id === hospitalData._id
      );
      
      setDoctors(filteredDoctors);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const hospitalData = JSON.parse(localStorage.getItem('hospital'));
      
      const response = await fetch('/api/appointments');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch appointments');
      }
      
      // Filter appointments by hospital ID
      const filteredAppointments = result.data.filter(
        (appointment) => appointment.hospital._id === hospitalData._id
      );
      
      setAppointments(filteredAppointments);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('hospital');
    router.push('/hospital');
  };
  
  const handleDoctorAdded = () => {
    fetchDoctors();
  };
  
  if (!hospital) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{hospital.name} Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Manage your doctors and their availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Doctor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                  </DialogHeader>
                  <AddDoctorForm hospitalId={hospital._id} onDoctorAdded={handleDoctorAdded} />
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <p>Loading doctors...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : doctors.length === 0 ? (
              <p>No doctors found. Add your first doctor to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>View and manage patient appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading appointments...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : appointments.length === 0 ? (
              <p>No appointments found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>{appointment.doctor.name}</TableCell>
                      <TableCell>
                        {new Date(appointment.date).toLocaleDateString()} 
                        ({appointment.timeSlot.startTime} - {appointment.timeSlot.endTime})
                      </TableCell>
                      <TableCell>
                        <span className={
                          appointment.status === 'scheduled' ? 'text-blue-500' :
                          appointment.status === 'completed' ? 'text-green-500' :
                          'text-red-500'
                        }>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 