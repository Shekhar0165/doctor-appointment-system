'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

export default function PatientLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  useEffect(() => {
    // Check if redirected after successful registration
    if (searchParams.get('success') === 'true') {
      setSuccess('Registration successful! Please login with your credentials.');
    }
  }, [searchParams]);
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/patients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Store patient data in localStorage
      localStorage.setItem('patient', JSON.stringify(result.data.patient));
      
      // Check if there's a returnUrl and redirect there, otherwise go to /patient
      const returnUrl = searchParams.get('returnUrl') || '/patient';
      router.push(returnUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Patient Login</CardTitle>
          <CardDescription>
            Login to access your appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="bg-green-50 p-4 mb-4 rounded border border-green-200">
              <p className="text-green-600">{success}</p>
            </div>
          )}
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/patient/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 