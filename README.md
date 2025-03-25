# Doctor Appointment System

A full-stack Next.js application for booking doctor appointments. The system allows hospitals to manage their doctors and patients to book appointments with available doctors.

## Features

### For Hospitals/Clinics
- Login to the hospital dashboard
- Add doctors with their specializations and available time slots
- View and manage appointments

### For Patients
- Browse available doctors by hospital or specialization
- View doctor availability
- Book appointments with doctors
- Receive confirmation of successful bookings

## Tech Stack

- **Frontend**: Next.js, React, shadcn UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **State Management**: React hooks, local storage
- **Form Handling**: React Hook Form
- **HTTP Requests**: Fetch API

## Getting Started

### Prerequisites
- Node.js 14.x or later
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd doctor-appointment-system
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/doctor-appointment-system
JWT_SECRET=your_jwt_secret_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Project Structure

```
├── public/
├── src/
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── doctors/          # Doctor API endpoints
│   │   │   ├── hospitals/        # Hospital API endpoints
│   │   │   └── appointments/     # Appointment API endpoints
│   │   ├── hospital/             # Hospital dashboard pages
│   │   │   ├── components/       # Hospital-specific components
│   │   │   ├── dashboard/        # Hospital dashboard page
│   │   │   └── page.js           # Hospital login page
│   │   ├── patient/              # Patient booking pages
│   │   │   ├── components/       # Patient-specific components
│   │   │   └── page.js           # Patient booking page
│   │   ├── globals.css           # Global styles
│   │   ├── layout.js             # Root layout component
│   │   └── page.js               # Homepage
│   ├── components/               # Shared UI components
│   ├── lib/
│   │   └── db/                   # Database connection
│   └── models/                   # Mongoose models
├── .env.local                    # Environment variables
└── package.json
```

## Deployment

This project can be deployed on any platform that supports Next.js applications, such as Vercel, Netlify, or a self-hosted server.

## License

This project is licensed under the MIT License.
