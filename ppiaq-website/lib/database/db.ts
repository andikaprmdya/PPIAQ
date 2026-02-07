// Dummy Database
import bcryptjs from 'bcryptjs';

interface User {
  id: string;
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Hashed with bcryptjs
  phoneNumber?: string;
  studentId?: string;

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
  dateJoined?: Date;
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
  {
    id: '2',
    firstName: 'Budi',
    lastName: 'Santoso',
    email: 'budi@example.com',
    password: bcryptjs.hashSync('Test12345', 10),
    nationality: 'Indonesia',
    educationLevel: 'S1 (Bachelor)',
    university: 'University of Queensland',
    major: 'Computer Science',
    birthDate: '2000-05-15',
    membershipType: 'ordinary',
    paymentProofUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    role: 'user',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-16'),
    approvedBy: '1',
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
  paymentProofUrl: string,
  phoneNumber?: string,
  studentId?: string
): User {
  const newUser: User = {
    id: String(users.length + 1),
    firstName,
    lastName,
    email,
    password: bcryptjs.hashSync(password, 10), // Hash password
    phoneNumber,
    studentId,
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

export function getUserById(userId: string): User | null {
  return users.find((u) => u.id === userId) || null;
}

export function unrejectUser(userId: string): User | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  user.status = 'pending';
  user.rejectedAt = undefined;
  user.rejectedBy = undefined;
  user.rejectionReason = undefined;
  return user;
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  try {
    // List of fields yang bisa di-update
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'studentId',
      'nationality',
      'educationLevel',
      'university',
      'major',
      'birthDate',
      'membershipType',
      'status',
    ];

    // Update hanya fields yang diizinkan
    allowedFields.forEach((field) => {
      if (field in updates) {
        (user as any)[field] = (updates as any)[field];
      }
    });

    return user;
  } catch (error) {
    console.error('Error in updateUser:', error);
    return null;
  }
}

// ============================================
// CMS CONTENT MANAGEMENT INTERFACES & FUNCTIONS
// ============================================

// Enhanced Event interface with bilingual support and status
interface CMSEvent {
  id: string;
  day: string;
  month: string;
  title: { id: string; en: string };
  date: string;
  location: { id: string; en: string };
  description: { id: string; en: string };
  image: string; // base64 or URL
  registrationUrl?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin user ID
}

// Enhanced Team Member interface with division and image
interface CMSTeamMember {
  id: string;
  name: string;
  role: { id: string; en: string };
  university: string;
  instagram: string;
  image: string; // base64
  bio: { id: string; en: string };
  division: 'core' | 'admin' | 'education' | 'sports' | 'media' | 'partnership';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Static content for pages
interface StaticContent {
  id: string;
  key: string; // unique identifier like 'homepage_hero_title'
  type: 'text' | 'richtext' | 'image' | 'url';
  content: { id: string; en: string };
  page: string; // 'home' | 'about' | 'membership' | 'visi-misi' | 'contact'
  section: string; // 'hero' | 'faq' | 'cta' etc
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// FAQ Items
interface FAQItem {
  id: string;
  question: { id: string; en: string };
  answer: { id: string; en: string };
  page: string; // 'home' | 'membership'
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Image Library
interface ImageAsset {
  id: string;
  name: string;
  description?: string;
  base64Data: string;
  mimeType: string;
  size: number; // in bytes
  category: 'event' | 'team' | 'hero' | 'general';
  usedIn: string[]; // Array of content IDs using this image
  createdAt: Date;
  uploadedBy: string; // admin user ID
}

// Dummy data storage for CMS content
let cmsEvents: CMSEvent[] = [
  {
    id: '1',
    day: '5',
    month: 'FEB',
    title: { id: 'Pre-Departure Briefing - Semester 1, 2026', en: 'Pre-Departure Briefing - Semester 1, 2026' },
    date: 'Thursday, February 5, 2026',
    location: { id: 'Zoom', en: 'Zoom' },
    description: { id: 'Persiapan keberangkatan untuk semester 1, 2026', en: 'Preparation briefing for semester 1, 2026' },
    image: '/images/predeparture.jpg',
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: '1',
  },
  {
    id: '2',
    day: '16',
    month: 'FEB',
    title: { id: 'QUT Market Day - Join ISAQ / PPIA QUT', en: 'QUT Market Day - Join ISAQ / PPIA QUT' },
    date: 'Monday, February 16, 2026',
    location: { id: 'QUT', en: 'QUT' },
    description: { id: 'Bergabunglah dengan ISAQ di Market Day QUT', en: 'Join ISAQ at QUT Market Day' },
    image: '/images/qutmarketday.jpg',
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: '1',
  },
  {
    id: '3',
    day: '18',
    month: 'FEB',
    title: { id: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ', en: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ' },
    date: 'Wednesday, February 18, 2026',
    location: { id: 'UQ St. Lucia', en: 'UQ St. Lucia' },
    description: { id: 'Bergabunglah dengan UQISA di Market Day', en: 'Join UQISA at Market Day' },
    image: '/images/uqmarketday.jpg',
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: '1',
  },
];

let cmsTeamMembers: CMSTeamMember[] = [
  {
    id: '1',
    name: 'Rafika Kusuma',
    role: { id: 'Ketua', en: 'President' },
    university: 'University of Queensland',
    instagram: '@rafikakusuma',
    image: '/images/rafika.png',
    bio: { id: 'Pemimpin Kabinet PAGI 2026 dengan fokus pada visi dan misi organisasi.', en: 'Leader of Kabinet PAGI 2026 with focus on the organization\'s vision and mission.' },
    division: 'core',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Andika Pramudya Wardana',
    role: { id: 'Wakil Ketua Internal', en: 'Vice President Internal' },
    university: 'University of Queensland',
    instagram: '@andikawdna',
    image: '/images/Andika.png',
    bio: { id: 'Mengelola operasional internal dan koordinasi dengan divisi-divisi.', en: 'Managing internal operations and coordination with divisions.' },
    division: 'core',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Vincent Hamdali',
    role: { id: 'Wakil Ketua Eksternal', en: 'Vice President External' },
    university: 'University of Queensland',
    instagram: '@vincenthamdali',
    image: '/images/vincent.jpg',
    bio: { id: 'Membangun hubungan eksternal dan kemitraan strategis dengan organisasi lain.', en: 'Building external relations and strategic partnerships with other organizations.' },
    division: 'core',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Emmanuela Stefany Sugiarto',
    role: { id: 'Sekretaris Jenderal', en: 'Secretary General' },
    university: 'University of Queensland',
    instagram: '@emmanuelas',
    image: '/images/emma.png',
    bio: { id: 'Mengelola dokumentasi dan administrasi keseluruhan organisasi.', en: 'Managing documentation and overall organizational administration.' },
    division: 'core',
    order: 4,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Fanny Alfianti',
    role: { id: 'Bendahara Jenderal', en: 'Treasurer General' },
    university: 'University of Queensland',
    instagram: '@fannyalfianti',
    image: '/images/Fani.png',
    bio: { id: 'Mengelola keuangan dan anggaran organisasi untuk semua program.', en: 'Managing organization finances and budget for all programs.' },
    division: 'core',
    order: 5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Admin Division
  {
    id: '6',
    name: 'John Doe',
    role: { id: 'Direktur Administrasi & Logistik', en: 'Administration & Logistics Director' },
    university: 'University of Queensland',
    instagram: '@johndoe',
    image: '/images/placeholder.jpg',
    bio: { id: 'Memimpin divisi administrasi dan logistik', en: 'Leading the administration and logistics division' },
    division: 'admin',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '7',
    name: 'Jane Smith',
    role: { id: 'Petugas Administrasi & Logistik', en: 'Administration & Logistics Officer' },
    university: 'University of Queensland',
    instagram: '@janesmith',
    image: '/images/placeholder.jpg',
    bio: { id: 'Mengelola administrasi organisasi', en: 'Managing organizational administration' },
    division: 'admin',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '8',
    name: 'Michael Johnson',
    role: { id: 'Petugas Administrasi & Logistik', en: 'Administration & Logistics Officer' },
    university: 'University of Queensland',
    instagram: '@mjohnson',
    image: '/images/placeholder.jpg',
    bio: { id: 'Koordinator logistik untuk acara', en: 'Event logistics coordinator' },
    division: 'admin',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Education Division
  {
    id: '9',
    name: 'Sarah Williams',
    role: { id: 'Direktur Pendidikan & Pengembangan', en: 'Education & Development Director' },
    university: 'University of Queensland',
    instagram: '@sarahwilliams',
    image: '/images/placeholder.jpg',
    bio: { id: 'Mengarahkan program pendidikan dan pengembangan', en: 'Directing education and development programs' },
    division: 'education',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '10',
    name: 'David Brown',
    role: { id: 'Petugas Pendidikan & Pengembangan', en: 'Education & Development Officer' },
    university: 'University of Queensland',
    instagram: '@davidbrown',
    image: '/images/placeholder.jpg',
    bio: { id: 'Mengelola workshop dan seminar', en: 'Managing workshops and seminars' },
    division: 'education',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '11',
    name: 'Emma Davis',
    role: { id: 'Petugas Pendidikan & Pengembangan', en: 'Education & Development Officer' },
    university: 'University of Queensland',
    instagram: '@emmadavis',
    image: '/images/placeholder.jpg',
    bio: { id: 'Program pengembangan kepemimpinan', en: 'Leadership development programs' },
    division: 'education',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Sports Division
  {
    id: '12',
    name: 'Lucas Martinez',
    role: { id: 'Direktur Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Director' },
    university: 'University of Queensland',
    instagram: '@lucasmartinez',
    image: '/images/placeholder.jpg',
    bio: { id: 'Memimpin acara olahraga dan budaya', en: 'Leading sports and cultural events' },
    division: 'sports',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '13',
    name: 'Sophia Garcia',
    role: { id: 'Petugas Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Officer' },
    university: 'University of Queensland',
    instagram: '@sophiagarcia',
    image: '/images/placeholder.jpg',
    bio: { id: 'Mengorganisir turnamen olahraga', en: 'Organizing sports tournaments' },
    division: 'sports',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '14',
    name: 'Oliver Taylor',
    role: { id: 'Petugas Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Officer' },
    university: 'University of Queensland',
    instagram: '@olivertaylor',
    image: '/images/placeholder.jpg',
    bio: { id: 'Program seni dan budaya', en: 'Arts and culture programs' },
    division: 'sports',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Media Division
  {
    id: '15',
    name: 'Isabella Anderson',
    role: { id: 'Direktur Media & Komunikasi', en: 'Media & Communications Director' },
    university: 'University of Queensland',
    instagram: '@isabellaanderson',
    image: '/images/placeholder.jpg',
    bio: { id: 'Mengelola komunikasi dan media sosial', en: 'Managing communications and social media' },
    division: 'media',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '16',
    name: 'James Wilson',
    role: { id: 'Petugas Media & Komunikasi', en: 'Media & Communications Officer' },
    university: 'University of Queensland',
    instagram: '@jameswilson',
    image: '/images/placeholder.jpg',
    bio: { id: 'Content creator dan photographer', en: 'Content creator and photographer' },
    division: 'media',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '17',
    name: 'Charlotte Moore',
    role: { id: 'Petugas Media & Komunikasi', en: 'Media & Communications Officer' },
    university: 'University of Queensland',
    instagram: '@charlottemoore',
    image: '/images/placeholder.jpg',
    bio: { id: 'Desain grafis dan branding', en: 'Graphic design and branding' },
    division: 'media',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Partnership Division
  {
    id: '18',
    name: 'Benjamin Lee',
    role: { id: 'Petugas Kemitraan', en: 'Partnership Officer' },
    university: 'University of Queensland',
    instagram: '@benjaminlee',
    image: '/images/placeholder.jpg',
    bio: { id: 'Membangun hubungan kemitraan strategis', en: 'Building strategic partnerships' },
    division: 'partnership',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

let staticContents: StaticContent[] = [];
let faqItems: FAQItem[] = [
  {
    id: '1',
    question: { id: 'Apa saja manfaat menjadi anggota?', en: 'What are the benefits of becoming a member?' },
    answer: { id: 'Anggota PPIAQ mendapatkan akses eksklusif ke acara khusus, diskon dari mitra, akses awal ke kalender program, dan akses penuh ke papan komunitas.', en: 'PPIAQ members receive exclusive pricing to special events, early access to our program calendar, full access to our community board, and special partner discounts.' },
    page: 'home',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    question: { id: 'Bisakah saya menjadi anggota?', en: 'Can I become a member?' },
    answer: { id: 'Ya! Jika Anda mahasiswa Indonesia di Queensland atau tertarik mendukung komunitas, Anda bisa mendaftar sebagai Ordinary Member atau Associate Member.', en: 'Yes! If you\'re an Indonesian student in Queensland or interested in supporting our community, you can register as an Ordinary Member or Associate Member.' },
    page: 'home',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    question: { id: 'Mengapa saya harus menyelesaikan formulir database?', en: 'Why should I complete the database form?' },
    answer: { id: 'Formulir database membantu kami tetap terhubung dengan semua pelajar Indonesia dan memberikan informasi penting tentang peluang, acara, dan dukungan komunitas.', en: 'The database form helps us stay connected with all Indonesian students and allows us to share important information about opportunities, events, and community support.' },
    page: 'home',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
let imageAssets: ImageAsset[] = [];

// ============================================
// CMS EVENT CRUD FUNCTIONS
// ============================================

export function getAllCMSEvents(publishedOnly = false): CMSEvent[] {
  return publishedOnly ? cmsEvents.filter((e) => e.status === 'published') : cmsEvents;
}

export function getCMSEventById(id: string): CMSEvent | null {
  return cmsEvents.find((e) => e.id === id) || null;
}

export function createCMSEvent(data: Omit<CMSEvent, 'id' | 'createdAt' | 'updatedAt'>): CMSEvent {
  const newEvent: CMSEvent = {
    id: String(cmsEvents.length + 1),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  cmsEvents.push(newEvent);
  return newEvent;
}

export function updateCMSEvent(id: string, updates: Partial<CMSEvent>): CMSEvent | null {
  const event = cmsEvents.find((e) => e.id === id);
  if (!event) return null;

  const updatedEvent = {
    ...event,
    ...updates,
    updatedAt: new Date(),
  };

  const index = cmsEvents.findIndex((e) => e.id === id);
  cmsEvents[index] = updatedEvent;
  return updatedEvent;
}

export function deleteCMSEvent(id: string): boolean {
  const index = cmsEvents.findIndex((e) => e.id === id);
  if (index === -1) return false;

  cmsEvents.splice(index, 1);
  return true;
}

export function publishCMSEvent(id: string): CMSEvent | null {
  return updateCMSEvent(id, { status: 'published' });
}

export function unpublishCMSEvent(id: string): CMSEvent | null {
  return updateCMSEvent(id, { status: 'draft' });
}

// ============================================
// CMS TEAM MEMBER CRUD FUNCTIONS
// ============================================

export function getAllCMSTeamMembers(activeOnly = false): CMSTeamMember[] {
  return activeOnly ? cmsTeamMembers.filter((m) => m.isActive) : cmsTeamMembers;
}

export function getCMSTeamMemberById(id: string): CMSTeamMember | null {
  return cmsTeamMembers.find((m) => m.id === id) || null;
}

export function createCMSTeamMember(data: Omit<CMSTeamMember, 'id' | 'createdAt' | 'updatedAt'>): CMSTeamMember {
  const newMember: CMSTeamMember = {
    id: String(cmsTeamMembers.length + 1),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  cmsTeamMembers.push(newMember);
  return newMember;
}

export function updateCMSTeamMember(id: string, updates: Partial<CMSTeamMember>): CMSTeamMember | null {
  const member = cmsTeamMembers.find((m) => m.id === id);
  if (!member) return null;

  const updatedMember = {
    ...member,
    ...updates,
    updatedAt: new Date(),
  };

  const index = cmsTeamMembers.findIndex((m) => m.id === id);
  cmsTeamMembers[index] = updatedMember;
  return updatedMember;
}

export function deleteCMSTeamMember(id: string): boolean {
  const index = cmsTeamMembers.findIndex((m) => m.id === id);
  if (index === -1) return false;

  cmsTeamMembers.splice(index, 1);
  return true;
}

export function reorderCMSTeamMembers(ids: string[]): boolean {
  try {
    ids.forEach((id, index) => {
      const member = cmsTeamMembers.find((m) => m.id === id);
      if (member) {
        member.order = index + 1;
        member.updatedAt = new Date();
      }
    });
    return true;
  } catch (error) {
    console.error('Error reordering team members:', error);
    return false;
  }
}

// ============================================
// STATIC CONTENT CRUD FUNCTIONS
// ============================================

export function getStaticContentByPage(page: string): StaticContent[] {
  return staticContents.filter((c) => c.page === page).sort((a, b) => a.order - b.order);
}

export function getStaticContentByKey(key: string): StaticContent | null {
  return staticContents.find((c) => c.key === key) || null;
}

export function createStaticContent(data: Omit<StaticContent, 'id' | 'createdAt' | 'updatedAt'>): StaticContent {
  const newContent: StaticContent = {
    id: String(staticContents.length + 1),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  staticContents.push(newContent);
  return newContent;
}

export function updateStaticContent(id: string, updates: Partial<StaticContent>): StaticContent | null {
  const content = staticContents.find((c) => c.id === id);
  if (!content) return null;

  const updatedContent = {
    ...content,
    ...updates,
    updatedAt: new Date(),
  };

  const index = staticContents.findIndex((c) => c.id === id);
  staticContents[index] = updatedContent;
  return updatedContent;
}

export function deleteStaticContent(id: string): boolean {
  const index = staticContents.findIndex((c) => c.id === id);
  if (index === -1) return false;

  staticContents.splice(index, 1);
  return true;
}

// ============================================
// FAQ CRUD FUNCTIONS
// ============================================

export function getAllFAQs(page?: string): FAQItem[] {
  const faqs = page ? faqItems.filter((f) => f.page === page && f.isActive) : faqItems.filter((f) => f.isActive);
  return faqs.sort((a, b) => a.order - b.order);
}

export function getFAQById(id: string): FAQItem | null {
  return faqItems.find((f) => f.id === id) || null;
}

export function createFAQ(data: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>): FAQItem {
  const newFAQ: FAQItem = {
    id: String(faqItems.length + 1),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  faqItems.push(newFAQ);
  return newFAQ;
}

export function updateFAQ(id: string, updates: Partial<FAQItem>): FAQItem | null {
  const faq = faqItems.find((f) => f.id === id);
  if (!faq) return null;

  const updatedFAQ = {
    ...faq,
    ...updates,
    updatedAt: new Date(),
  };

  const index = faqItems.findIndex((f) => f.id === id);
  faqItems[index] = updatedFAQ;
  return updatedFAQ;
}

export function deleteFAQ(id: string): boolean {
  const index = faqItems.findIndex((f) => f.id === id);
  if (index === -1) return false;

  faqItems.splice(index, 1);
  return true;
}

export function reorderFAQs(ids: string[]): boolean {
  try {
    ids.forEach((id, index) => {
      const faq = faqItems.find((f) => f.id === id);
      if (faq) {
        faq.order = index + 1;
        faq.updatedAt = new Date();
      }
    });
    return true;
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return false;
  }
}

// ============================================
// IMAGE LIBRARY CRUD FUNCTIONS
// ============================================

export function getAllImageAssets(category?: string): ImageAsset[] {
  return category ? imageAssets.filter((i) => i.category === category) : imageAssets;
}

export function getImageAssetById(id: string): ImageAsset | null {
  return imageAssets.find((i) => i.id === id) || null;
}

export function uploadImageAsset(data: Omit<ImageAsset, 'id' | 'createdAt'>): ImageAsset {
  const newImage: ImageAsset = {
    id: String(imageAssets.length + 1),
    ...data,
    createdAt: new Date(),
  };
  imageAssets.push(newImage);
  return newImage;
}

export function deleteImageAsset(id: string): boolean {
  const image = imageAssets.find((i) => i.id === id);
  if (!image) return false;

  // Check if image is used
  if (image.usedIn.length > 0) {
    console.warn(`Image ${id} is used in ${image.usedIn.length} content items`);
    // Still allow deletion, but log warning
  }

  const index = imageAssets.findIndex((i) => i.id === id);
  imageAssets.splice(index, 1);
  return true;
}

export function updateImageAssetUsage(imageId: string, usedInId: string, remove = false): boolean {
  const image = imageAssets.find((i) => i.id === imageId);
  if (!image) return false;

  const index = image.usedIn.indexOf(usedInId);
  if (remove && index > -1) {
    image.usedIn.splice(index, 1);
  } else if (!remove && index === -1) {
    image.usedIn.push(usedInId);
  }

  return true;
}
