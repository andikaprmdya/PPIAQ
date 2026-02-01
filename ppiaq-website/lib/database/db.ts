// Dummy Database
import bcryptjs from 'bcryptjs';

interface User {
  id: string;
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Hashed with bcryptjs

  // Educational Info
  nationality: string;
  educationLevel: string; // S1, S2, S3, etc
  university: string;
  major: string;
  birthDate: string; // YYYY-MM-DD format

  // Membership
  membershipType: 'ordinary' | 'associate';
  paymentProofUrl: string; // Path to uploaded payment proof (base64 or file path)

  // Auth & Status
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';

  // Audit Trail
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // Admin ID
  rejectedAt?: Date;
  rejectedBy?: string; // Admin ID
  rejectionReason?: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: Date;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: Date;
}

interface Event {
  id: string;
  day: string;
  month: string;
  title: string;
  date: string;
  location: string;
  image?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
}

// Dummy data storage
let users: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ppiaq.org',
    password: bcryptjs.hashSync('Admin123!', 10), // Default admin password
    nationality: 'Indonesia',
    educationLevel: 'S2',
    university: 'University of Queensland',
    major: 'Engineering',
    birthDate: '1990-01-01',
    membershipType: 'ordinary',
    paymentProofUrl: '',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
    approvedAt: new Date('2024-01-01'),
    approvedBy: 'system',
  },
];

let newsletterSubscribers: NewsletterSubscriber[] = [
  {
    id: '1',
    email: 'subscriber@example.com',
    subscribedAt: new Date('2024-01-10'),
  },
];

let contactMessages: ContactMessage[] = [];

let events: Event[] = [
  {
    id: '1',
    day: '5',
    month: 'FEB',
    title: 'Pre-Departure Briefing - Semester 1, 2026',
    date: 'Thursday, February 5, 2026',
    location: 'Zoom',
    image: '/images/predeparture.jpg',
  },
  {
    id: '2',
    day: '16',
    month: 'FEB',
    title: 'QUT Market Day - Join ISAQ / PPIA QUT',
    date: 'Monday, February 16, 2026',
    location: 'QUT',
    image: '/images/qutmarketday.jpg',
  },
  {
    id: '3',
    day: '18',
    month: 'FEB',
    title: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ',
    date: 'Wednesday, February 18, 2026',
    location: 'UQ St. Lucia',
    image: '/images/uqmarketday.jpg',
  },
];

let teamMembers: TeamMember[] = [
  { id: '1', name: 'Ahmad Wijaya', role: { id: 'Ketua', en: 'President' }, university: 'University of Queensland', instagram: '@ahmadwijaya' },
  { id: '2', name: 'Siti Nurhaliza', role: { id: 'Sekretaris', en: 'Secretary' }, university: 'Griffith University', instagram: '@sitihaliza' },
  { id: '3', name: 'Budi Santoso', role: { id: 'Bendahara', en: 'Treasurer' }, university: 'James Cook University', instagram: '@budisantoso' },
  { id: '4', name: 'Lisa Rahmawati', role: { id: 'Kepala Acara', en: 'Events Head' }, university: 'QUT', instagram: '@lisarahmawati' },
  { id: '5', name: 'Rina Kartika', role: { id: 'Humas', en: 'Public Relations' }, university: 'University of Queensland', instagram: '@rinakartika' },
];

// User functions
export function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  nationality: string,
  educationLevel: string,
  university: string,
  major: string,
  birthDate: string,
  membershipType: 'ordinary' | 'associate',
  paymentProofUrl: string
): User {
  const newUser: User = {
    id: String(users.length + 1),
    firstName,
    lastName,
    email,
    password: bcryptjs.hashSync(password, 10), // Hash password
    nationality,
    educationLevel,
    university,
    major,
    birthDate,
    membershipType,
    paymentProofUrl,
    role: 'user',
    status: 'pending', // Users start as pending
    createdAt: new Date(),
  };
  users.push(newUser);
  return newUser;
}

export function loginUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email);
  if (!user) return null;

  // Compare hashed passwords using bcryptjs
  const isPasswordValid = bcryptjs.compareSync(password, user.password);
  return isPasswordValid ? user : null;
}

export function getUserByEmail(email: string): User | null {
  return users.find((u) => u.email === email) || null;
}

export function getUserByUsername(username: string): User | null {
  return users.find((u) => u.username === username) || null;
}

export function getAllUsers(): User[] {
  return users;
}

// Newsletter functions
export function subscribeToNewsletter(email: string): NewsletterSubscriber {
  const existingSubscriber = newsletterSubscribers.find((s) => s.email === email);
  if (existingSubscriber) return existingSubscriber;

  const newSubscriber: NewsletterSubscriber = {
    id: String(newsletterSubscribers.length + 1),
    email,
    subscribedAt: new Date(),
  };
  newsletterSubscribers.push(newSubscriber);
  return newSubscriber;
}

export function getAllNewsletterSubscribers(): NewsletterSubscriber[] {
  return newsletterSubscribers;
}

// Contact functions
export function submitContactMessage(
  name: string,
  email: string,
  message: string
): ContactMessage {
  const newMessage: ContactMessage = {
    id: String(contactMessages.length + 1),
    name,
    email,
    message,
    submittedAt: new Date(),
  };
  contactMessages.push(newMessage);
  return newMessage;
}

export function getAllContactMessages(): ContactMessage[] {
  return contactMessages;
}

// Event functions
export function getAllEvents(): Event[] {
  return events;
}

export function getEventById(id: string): Event | null {
  return events.find((e) => e.id === id) || null;
}

// Team functions
export function getAllTeamMembers(): TeamMember[] {
  return teamMembers;
}

export function getTeamMemberById(id: string): TeamMember | null {
  return teamMembers.find((m) => m.id === id) || null;
}

// NEW: Approval & Status functions
export function getPendingUsers(): User[] {
  return users.filter((u) => u.status === 'pending');
}

export function approveUser(userId: string, adminId: string): User | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  user.status = 'approved';
  user.approvedAt = new Date();
  user.approvedBy = adminId;
  return user;
}

export function rejectUser(userId: string, adminId: string, reason: string): User | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  user.status = 'rejected';
  user.rejectedAt = new Date();
  user.rejectedBy = adminId;
  user.rejectionReason = reason;
  return user;
}

export function getUsersByStatus(status: 'pending' | 'approved' | 'rejected'): User[] {
  return users.filter((u) => u.status === status);
}

export function isAdmin(userId: string): boolean {
  const user = users.find((u) => u.id === userId);
  return user?.role === 'admin' ? true : false;
}
