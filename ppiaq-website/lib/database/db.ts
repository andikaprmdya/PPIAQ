// Database functions using Prisma ORM
import bcryptjs from 'bcryptjs';
import { prisma } from './prisma';
import { MembershipType, UserStatus, EventStatus, Division, ImageCategory, Prisma } from '@prisma/client';

// ==========================================
// ENUM MAPPING UTILITIES
// ==========================================

// Helper function to map enum values from API (lowercase) to database (UPPERCASE)
const ENUM_MAPS = {
  membershipType: {
    'ordinary': 'ORDINARY',
    'associate': 'ASSOCIATE',
  },
  role: {
    'user': 'USER',
    'admin': 'ADMIN',
  },
  userStatus: {
    'pending': 'PENDING',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
  },
  eventStatus: {
    'draft': 'DRAFT',
    'published': 'PUBLISHED',
  },
  division: {
    'core': 'CORE',
    'admin': 'ADMIN',
    'education': 'EDUCATION',
    'sports': 'SPORTS',
    'media': 'MEDIA',
    'partnership': 'PARTNERSHIP',
  },
  imageCategory: {
    'event': 'EVENT',
    'team': 'TEAM',
    'hero': 'HERO',
    'general': 'GENERAL',
  },
  contentType: {
    'text': 'TEXT',
    'richtext': 'RICHTEXT',
    'image': 'IMAGE',
    'url': 'URL',
  },
};

// Helper function to map enum value (API format to DB format)
const mapEnum = (enumType: keyof typeof ENUM_MAPS, value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const map = ENUM_MAPS[enumType];
  return map[value.toLowerCase() as keyof typeof map] || value.toUpperCase();
};

// ==========================================
// USER FUNCTIONS
// ==========================================

export async function registerUser(
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
) {
  const hashedPassword = bcryptjs.hashSync(password, 10);
  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      studentId,
      nationality,
      educationLevel,
      university,
      major,
      birthDate,
      membershipType: (mapEnum('membershipType', membershipType) || 'ORDINARY') as MembershipType,
      paymentProofUrl,
      role: 'USER',
      status: 'PENDING',
    },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isPasswordValid = bcryptjs.compareSync(password, user.password);
  return isPasswordValid ? user : null;
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function approveUser(userId: string, adminId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });
}

export async function rejectUser(userId: string, adminId: string, reason: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectedBy: adminId,
      rejectionReason: reason,
    },
  });
}

export async function unrejectUser(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'PENDING',
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    },
  });
}

export async function getUsersByStatus(status: 'pending' | 'approved' | 'rejected') {
  const statusMap = { pending: 'PENDING', approved: 'APPROVED', rejected: 'REJECTED' };
  return await prisma.user.findMany({
    where: { status: statusMap[status] as UserStatus },
  });
}

export async function getPendingUsers() {
  return await prisma.user.findMany({ where: { status: 'PENDING' } });
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}

// Optimized helper: checks admin without re-fetching user when you already have the user object
export function isAdminUser(user: { role: string }): boolean {
  return user.role === 'ADMIN';
}

export async function updateUser(userId: string, updates: Record<string, unknown>) {
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

  const cleanedUpdates: Record<string, unknown> = {};
  allowedFields.forEach((field) => {
    if (field in updates) {
      cleanedUpdates[field] = updates[field];
    }
  });

  // Map enum values
  if (cleanedUpdates.membershipType) {
    cleanedUpdates.membershipType = mapEnum('membershipType', cleanedUpdates.membershipType as string);
  }
  if (cleanedUpdates.status) {
    cleanedUpdates.status = mapEnum('userStatus', cleanedUpdates.status as string);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: cleanedUpdates as Prisma.UserUpdateInput,
  });
}

// ==========================================
// NEWSLETTER FUNCTIONS
// ==========================================

export async function subscribeToNewsletter(email: string) {
  return await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

export async function getAllNewsletterSubscribers() {
  return await prisma.newsletterSubscriber.findMany();
}

// ==========================================
// CONTACT FUNCTIONS
// ==========================================

export async function submitContactMessage(name: string, email: string, message: string) {
  return await prisma.contactMessage.create({
    data: { name, email, message },
  });
}

export async function getAllContactMessages() {
  return await prisma.contactMessage.findMany({
    orderBy: { submittedAt: 'desc' },
  });
}

// ==========================================
// EVENT FUNCTIONS (CMS)
// ==========================================

export async function getAllCMSEvents(publishedOnly = false) {
  return await prisma.event.findMany({
    where: publishedOnly ? { status: 'PUBLISHED' } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCMSEventById(id: string) {
  return await prisma.event.findUnique({ where: { id } });
}

export async function createCMSEvent(data: Record<string, unknown>) {
  return await prisma.event.create({
    data: {
      day: data.day as string,
      month: data.month as string,
      title: data.title as Prisma.InputJsonValue,
      date: data.date as string,
      location: data.location as Prisma.InputJsonValue,
      description: data.description as Prisma.InputJsonValue,
      image: data.image as string,
      registrationUrl: data.registrationUrl as string | undefined,
      status: (mapEnum('eventStatus', data.status as string) || 'DRAFT') as EventStatus,
      createdBy: data.createdBy as string,
    },
  });
}

export async function updateCMSEvent(id: string, updates: Record<string, unknown>) {
  const cleanedUpdates: Record<string, unknown> = { ...updates };
  if (typeof cleanedUpdates.status === 'string' && cleanedUpdates.status) {
    cleanedUpdates.status = mapEnum('eventStatus', cleanedUpdates.status) as EventStatus;
  }
  return await prisma.event.update({
    where: { id },
    data: {
      ...(cleanedUpdates as Prisma.EventUpdateInput),
      updatedAt: new Date(),
    },
  });
}

export async function deleteCMSEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  return true;
}

export async function publishCMSEvent(id: string) {
  return await updateCMSEvent(id, { status: 'PUBLISHED' });
}

export async function unpublishCMSEvent(id: string) {
  return await updateCMSEvent(id, { status: 'DRAFT' });
}

// ==========================================
// TEAM MEMBER FUNCTIONS (CMS)
// ==========================================

export async function getAllCMSTeamMembers(activeOnly = false) {
  return await prisma.teamMember.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { order: 'asc' },
  });
}

export async function getCMSTeamMemberById(id: string) {
  return await prisma.teamMember.findUnique({ where: { id } });
}

export async function createCMSTeamMember(data: Record<string, unknown>) {
  return await prisma.teamMember.create({
    data: {
      name: data.name as string,
      role: data.role as Prisma.InputJsonValue,
      university: data.university as string,
      instagram: data.instagram as string,
      image: data.image as string,
      bio: data.bio as Prisma.InputJsonValue,
      division: (mapEnum('division', data.division as string) || 'CORE') as Division,
      order: (data.order as number) || 1,
      isActive: data.isActive !== false,
    },
  });
}

export async function updateCMSTeamMember(id: string, updates: Record<string, unknown>) {
  const cleanedUpdates: Record<string, unknown> = { ...updates };
  if (typeof cleanedUpdates.division === 'string' && cleanedUpdates.division) {
    cleanedUpdates.division = mapEnum('division', cleanedUpdates.division) as Division;
  }

  return await prisma.teamMember.update({
    where: { id },
    data: {
      ...(cleanedUpdates as Prisma.TeamMemberUpdateInput),
      updatedAt: new Date(),
    },
  });
}

export async function deleteCMSTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
  return true;
}

export async function reorderCMSTeamMembers(ids: string[]) {
  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.teamMember.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
    return true;
  } catch (error) {
    console.error('Error reordering team members:', error);
    return false;
  }
}

// ==========================================
// STATIC CONTENT FUNCTIONS
// ==========================================

export async function getStaticContentByPage(page: string) {
  return await prisma.staticContent.findMany({
    where: { page },
    orderBy: { order: 'asc' },
  });
}

export async function getStaticContentByKey(key: string) {
  return await prisma.staticContent.findUnique({ where: { key } });
}

export async function createStaticContent(data: Record<string, unknown>) {
  return await prisma.staticContent.create({ data: data as Prisma.StaticContentCreateInput });
}

export async function updateStaticContent(id: string, updates: Record<string, unknown>) {
  return await prisma.staticContent.update({
    where: { id },
    data: {
      ...(updates as Prisma.StaticContentUpdateInput),
      updatedAt: new Date(),
    },
  });
}

export async function deleteStaticContent(id: string) {
  await prisma.staticContent.delete({ where: { id } });
  return true;
}

// ==========================================
// FAQ FUNCTIONS
// ==========================================

export async function getAllFAQs(page?: string) {
  return await prisma.fAQ.findMany({
    where: {
      ...(page ? { page } : {}),
      isActive: true,
    },
    orderBy: { order: 'asc' },
  });
}

export async function getFAQById(id: string) {
  return await prisma.fAQ.findUnique({ where: { id } });
}

export async function createFAQ(data: Record<string, unknown>) {
  return await prisma.fAQ.create({ data: data as Prisma.FAQCreateInput });
}

export async function updateFAQ(id: string, updates: Record<string, unknown>) {
  return await prisma.fAQ.update({
    where: { id },
    data: {
      ...(updates as Prisma.FAQUpdateInput),
      updatedAt: new Date(),
    },
  });
}

export async function deleteFAQ(id: string) {
  await prisma.fAQ.delete({ where: { id } });
  return true;
}

export async function reorderFAQs(ids: string[]) {
  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.fAQ.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
    return true;
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return false;
  }
}

// ==========================================
// IMAGE LIBRARY FUNCTIONS
// ==========================================

export async function getAllImageAssets(category?: string) {
  return await prisma.imageAsset.findMany({
    where: category ? { category: category.toUpperCase() as ImageCategory } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getImageAssetById(id: string) {
  return await prisma.imageAsset.findUnique({ where: { id } });
}

export async function uploadImageAsset(data: Record<string, unknown>) {
  return await prisma.imageAsset.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      base64Data: data.base64Data as string,
      mimeType: data.mimeType as string,
      size: data.size as number,
      category: (mapEnum('imageCategory', data.category as string) || 'GENERAL') as ImageCategory,
      usedIn: (data.usedIn as Prisma.InputJsonValue) || [],
      uploadedBy: data.uploadedBy as string,
    },
  });
}

export async function deleteImageAsset(id: string) {
  const image = await prisma.imageAsset.findUnique({ where: { id } });
  if (!image) return false;

  const usedIn = (image.usedIn as string[]) || [];
  if (usedIn.length > 0) {
    console.warn(`Image ${id} is used in ${usedIn.length} content items`);
  }

  await prisma.imageAsset.delete({ where: { id } });
  return true;
}

export async function updateImageAssetUsage(imageId: string, usedInId: string, remove = false) {
  const image = await prisma.imageAsset.findUnique({ where: { id: imageId } });
  if (!image) return false;

  let usedIn = (image.usedIn as string[]) || [];

  if (remove) {
    usedIn = usedIn.filter((id) => id !== usedInId);
  } else if (!usedIn.includes(usedInId)) {
    usedIn.push(usedInId);
  }

  await prisma.imageAsset.update({
    where: { id: imageId },
    data: { usedIn },
  });

  return true;
}

// ==========================================
// LEGACY FUNCTIONS (for public API compatibility)
// ==========================================

export async function getAllEvents() {
  return await prisma.event.findMany({ where: { status: 'PUBLISHED' } });
}

export async function getEventById(id: string) {
  return await prisma.event.findUnique({ where: { id } });
}

export async function getAllTeamMembers() {
  return await prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
}

export async function getTeamMemberById(id: string) {
  return await prisma.teamMember.findUnique({ where: { id } });
}
