import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="py-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Doctor Appointment System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book appointments with top doctors online easily and conveniently.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>For Patients</CardTitle>
            <CardDescription>
              Book appointments with doctors based on your medical needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Find available doctors, view their schedules, and book appointments at your convenience. 
              No registration required - just provide your details and you're set!
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/patient" className="w-full">
              <Button className="w-full">Book an Appointment</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Hospitals & Clinics</CardTitle>
            <CardDescription>
              Manage your doctors and appointment schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Add doctors to your hospital profile, set their availability, and manage appointment requests. 
              Simple and streamlined management for your healthcare facility.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/hospital" className="w-full">
              <Button className="w-full">Hospital Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border p-4 rounded-lg text-center">
            <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="font-semibold text-lg">Find a Doctor</h3>
            <p className="text-gray-600">Browse our list of qualified doctors and specialists</p>
          </div>

          <div className="border p-4 rounded-lg text-center">
            <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="font-semibold text-lg">Choose a Time Slot</h3>
            <p className="text-gray-600">Select from available time slots that work for you</p>
          </div>

          <div className="border p-4 rounded-lg text-center">
            <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="font-semibold text-lg">Confirm Appointment</h3>
            <p className="text-gray-600">Enter your details and confirm your booking</p>
          </div>
        </div>
      </section>
    </div>
  );
}
