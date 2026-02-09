// Database functions using Prisma ORM
import bcryptjs from 'bcryptjs';
import { prisma } from './prisma';

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
      membershipType: (mapEnum('membershipType', membershipType) || 'ORDINARY') as any,
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
    where: { status: statusMap[status] as any },
  });
}

export async function getPendingUsers() {
  return await prisma.user.findMany({ where: { status: 'PENDING' } });
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === 'ADMIN' ? true : false;
}

export async function updateUser(userId: string, updates: any) {
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

  const cleanedUpdates: any = {};
  allowedFields.forEach((field) => {
    if (field in updates) {
      cleanedUpdates[field] = updates[field];
    }
  });

  // Map enum values
  if (cleanedUpdates.membershipType) {
    cleanedUpdates.membershipType = mapEnum('membershipType', cleanedUpdates.membershipType);
  }
  if (cleanedUpdates.status) {
    cleanedUpdates.status = mapEnum('userStatus', cleanedUpdates.status);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: cleanedUpdates,
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

export async function createCMSEvent(data: any) {
  return await prisma.event.create({
    data: {
      day: data.day,
      month: data.month,
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      image: data.image,
      registrationUrl: data.registrationUrl,
      status: (mapEnum('eventStatus', data.status) || 'DRAFT') as any,
      createdBy: data.createdBy,
    },
  });
}

export async function updateCMSEvent(id: string, updates: any) {
  const cleanedUpdates = { ...updates };
  if (cleanedUpdates.status) {
    cleanedUpdates.status = mapEnum('eventStatus', cleanedUpdates.status);
  }
  return await prisma.event.update({
    where: { id },
    data: {
      ...cleanedUpdates,
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

export async function createCMSTeamMember(data: any) {
  return await prisma.teamMember.create({
    data: {
      name: data.name,
      role: data.role,
      university: data.university,
      instagram: data.instagram,
      image: data.image,
      bio: data.bio,
      division: (mapEnum('division', data.division) || 'CORE') as any,
      order: data.order || 1,
      isActive: data.isActive !== false,
    },
  });
}

export async function updateCMSTeamMember(id: string, updates: any) {
  const cleanedUpdates: any = { ...updates };
  if (cleanedUpdates.division) {
    cleanedUpdates.division = mapEnum('division', cleanedUpdates.division);
  }

  return await prisma.teamMember.update({
    where: { id },
    data: {
      ...cleanedUpdates,
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

export async function createStaticContent(data: any) {
  return await prisma.staticContent.create({ data });
}

export async function updateStaticContent(id: string, updates: any) {
  return await prisma.staticContent.update({
    where: { id },
    data: {
      ...updates,
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

export async function createFAQ(data: any) {
  return await prisma.fAQ.create({ data });
}

export async function updateFAQ(id: string, updates: any) {
  return await prisma.fAQ.update({
    where: { id },
    data: {
      ...updates,
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
    where: category ? { category: category.toUpperCase() as any } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getImageAssetById(id: string) {
  return await prisma.imageAsset.findUnique({ where: { id } });
}

export async function uploadImageAsset(data: any) {
  return await prisma.imageAsset.create({
    data: {
      name: data.name,
      description: data.description,
      base64Data: data.base64Data,
      mimeType: data.mimeType,
      size: data.size,
      category: (mapEnum('imageCategory', data.category) || 'GENERAL') as any,
      usedIn: data.usedIn || [],
      uploadedBy: data.uploadedBy,
    },
  });
}

export async function deleteImageAsset(id: string) {
  const image = await prisma.imageAsset.findUnique({ where: { id } });
  if (!image) return false;

  const usedIn = (image.usedIn as any[]) || [];
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
