// Dummy Database
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string; // In production, hash this!
  membershipType: 'ordinary' | 'associate';
  university: string;
  createdAt: Date;
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
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'Password123',
    membershipType: 'ordinary',
    university: 'University of Queensland',
    createdAt: new Date('2024-01-15'),
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
  },
  {
    id: '2',
    day: '16',
    month: 'FEB',
    title: 'QUT Market Day - Join ISAQ / PPIA QUT',
    date: 'Monday, February 16, 2026',
    location: 'QUT',
  },
  {
    id: '3',
    day: '18',
    month: 'FEB',
    title: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ',
    date: 'Wednesday, February 18, 2026',
    location: 'UQ St. Lucia',
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
  username: string,
  password: string,
  membershipType: 'ordinary' | 'associate',
  university: string
): User {
  const newUser: User = {
    id: String(users.length + 1),
    firstName,
    lastName,
    email,
    username,
    password,
    membershipType,
    university,
    createdAt: new Date(),
  };
  users.push(newUser);
  return newUser;
}

export function loginUser(email: string, password: string): User | null {
  return users.find((u) => u.email === email && u.password === password) || null;
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
