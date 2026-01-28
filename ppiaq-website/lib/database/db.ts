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
