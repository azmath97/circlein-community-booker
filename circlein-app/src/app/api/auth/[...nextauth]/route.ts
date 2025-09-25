import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// Removed: import { signInWithEmailAndPassword } from 'firebase/auth'; // No longer needed here
// Removed: import { doc, getDoc } from 'firebase/firestore'; // No longer needed here
// Removed: import { auth, db } from '@/lib/firebase'; // No longer needed here for CredentialsProvider's server-side logic

// Import Firebase Admin SDK instances
import { adminAuth, adminFirestore } from '@/lib/firebase-admin'; // Adjust path if needed

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Email or password not provided.');
          return null;
        }

        // Check if admin services are available
        if (!adminFirestore) {
          console.error('Firebase Admin Firestore service not available');
          
          // Fallback for development - hardcoded user check
          if (credentials.email === 'admin@circlein.com' && credentials.password === 'admin123') {
            return {
              id: 'admin-1',
              email: 'admin@circlein.com',
              name: 'Admin User',
              role: 'admin',
            };
          }
          
          if (credentials.email === 'resident@circlein.com' && credentials.password === 'resident123') {
            return {
              id: 'resident-1',
              email: 'resident@circlein.com',
              name: 'John Doe',
              role: 'resident',
            };
          }
          
          return null;
        }

        try {
          // Get user document from Firestore using Admin SDK
          const usersRef = adminFirestore.collection('users');
          const userQuery = await usersRef.where('email', '==', credentials.email).get();
          
          if (userQuery.empty) {
            console.error('User not found with email:', credentials.email);
            return null;
          }

          const userDoc = userQuery.docs[0];
          const userData = userDoc.data();
          const uid = userDoc.id;

          // In a real app, you should hash and compare passwords
          // For now, we'll do a simple comparison (NOT SECURE FOR PRODUCTION)
          if (userData.password !== credentials.password) {
            console.error('Invalid password for user:', credentials.email);
            return null;
          }

          // Return a NextAuth.js user object
          return {
            id: uid,
            email: userData.email,
            name: userData.name || userData.email,
            role: userData.role || 'resident',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  // Ensure NEXTAUTH_URL is correctly set in your .env.local
  // This is crucial for NextAuth.js internal routing
  secret: process.env.NEXTAUTH_SECRET, // Make sure you have a NEXTAUTH_SECRET in your .env.local
});

export { handler as GET, handler as POST };
