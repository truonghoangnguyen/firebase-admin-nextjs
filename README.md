# Next.js Firebase Authentication and Profile Management

A modern web application built with Next.js and Firebase that provides seamless user authentication and profile management using Google Sign-In.

## Features

- Google Sign-In Authentication
- User Profile Management
- Real-time Profile Updates
- Responsive Design with Tailwind CSS
- Built with Next.js 14 and TypeScript

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- React Context API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Sign-In in Authentication > Sign-in method
   - Enable Firestore Database
   - Copy your Firebase configuration
   - Create a `.env.local` file based on `env.local.example` and fill in your Firebase configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with AuthProvider
│   └── page.tsx      # Home page with conditional rendering
├── components/
│   ├── LoginPage.tsx    # Login component with Google Sign-In
│   └── ProfilePage.tsx  # Profile management component
├── context/
│   └── AuthContext.tsx  # Authentication context provider
└── lib/
    └── firebase.ts      # Firebase configuration and initialization
```

## Features

### Authentication
- Secure Google Sign-In integration
- Persistent user sessions
- Protected routes and components

### Profile Management
- View and edit profile information
- Real-time updates with Firestore
- Profile picture display
- Bio and personal information management

## Best Practices

- TypeScript for type safety
- Modern React patterns with hooks and context
- Responsive design with Tailwind CSS
- Environment variable management
- Clean project structure
- Component-based architecture
