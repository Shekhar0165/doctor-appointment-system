'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BookingForm from './components/BookingForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientBooking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Book appointment
  const [patient, setPatient] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
    
    // Check if patient is logged in
    const patientData = localStorage.getItem('patient');
    if (patientData) {
      setPatient(JSON.parse(patientData));
    }
  }, []);
  
  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch doctors');
      }
      
      setDoctors(result.data);
    } catch (error) {
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch hospitals');
      }
      
      setHospitals(result.data);
    } catch (error) {
      setError('Failed to load hospitals. Please try again later.');
    }
  };
  
  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    setSelectedDoctor(doctor);
    
    // Also set the doctor's hospital
    if (doctor && doctor.hospital) {
      setSelectedHospital(doctor.hospital);
    }
  };
  
  const handleHospitalSelect = (hospitalId) => {
    if (hospitalId === 'all') {
      setSelectedHospital(null);
      setSelectedDoctor(null);
      return;
    }
    
    const hospital = hospitals.find((h) => h._id === hospitalId);
    setSelectedHospital(hospital);
    
    // Filter doctors by the selected hospital
    setSelectedDoctor(null);
  };
  
  const handleBookingComplete = () => {
    setSelectedDoctor(null);
    setStep(1);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('patient');
    setPatient(null);
  };
  
  const handleNextStep = () => {
    if (!patient) {
      // Redirect to login page with return URL
      router.push(`/patient/login?returnUrl=${encodeURIComponent('/patient')}`);
      return;
    }
    
    setStep(2);
  };
  
  const filteredDoctors = selectedHospital
    ? doctors.filter((doctor) => doctor.hospital._id === selectedHospital._id)
    : doctors;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        {patient ? (
          <div className="flex items-center gap-4">
            <p className="text-sm">Welcome, {patient.name}</p>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <div>
            <Link href="/patient/login">
              <Button variant="outline" size="sm">
                Login to book appointments
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {loading ? (
        <p>Loading doctors...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : step === 1 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select a Doctor</CardTitle>
              <CardDescription>
                Choose a hospital and doctor for your appointment
                {!patient && (
                  <p className="mt-2 text-amber-600">
                    Note: You'll need to login before completing your booking.
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital/Clinic</Label>
                <Select 
                  onValueChange={handleHospitalSelect}
                  value={selectedHospital?._id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedHospital ? (
                      <SelectItem value="all">All Hospitals</SelectItem>
                    ) : null}
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDoctors.length === 0 ? (
                  <p>No doctors available for the selected criteria.</p>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <Card 
                      key={doctor._id} 
                      className={`cursor-pointer transition ${
                        selectedDoctor?._id === doctor._id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleDoctorSelect(doctor._id)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <CardDescription>
                          {doctor.specialization}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">{doctor.hospital.name}</p>
                        <p className="text-sm mt-2">
                          Available slots: {doctor.availableSlots.length}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedDoctor}
                >
                  Next: Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <BookingForm 
          doctor={selectedDoctor} 
          hospital={selectedHospital} 
          onBookingComplete={handleBookingComplete}
          onCancel={() => setStep(1)}
          patient={patient}
        />
      )}
    </div>
  );
} 