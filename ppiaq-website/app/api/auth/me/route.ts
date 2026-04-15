import { cookies } from 'next/headers';
import { getUserByEmail, updateUser } from '@/lib/database/db';
import { validateFirstLastName } from '@/lib/name-validation';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (without password)
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;
    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const REQUIRED_PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'nationality',
  'educationLevel',
  'university',
  'major',
  'birthDate',
] as const;

const OPTIONAL_PROFILE_FIELDS = [
  'phoneNumber',
  'studentId',
  'domicileCampus',
  'intake',
  'expectedGraduation',
] as const;

const normalizeString = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = await getUserByEmail(userEmail);
    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, string | null> = {};

    for (const field of REQUIRED_PROFILE_FIELDS) {
      if (!(field in body)) continue;
      const value = normalizeString(body[field]);
      if (!value) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
      updates[field] = value;
    }

    const nextFirstName = (updates.firstName as string | null | undefined) ?? currentUser.firstName;
    const nextLastName = (updates.lastName as string | null | undefined) ?? currentUser.lastName;
    const nameValidationError = validateFirstLastName(nextFirstName, nextLastName);
    if (nameValidationError) {
      return Response.json({ error: nameValidationError }, { status: 400 });
    }

    for (const field of OPTIONAL_PROFILE_FIELDS) {
      if (!(field in body)) continue;
      const value = normalizeString(body[field]);
      updates[field] = value || null;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    if (typeof updates.birthDate === 'string') {
      const parsedDate = new Date(updates.birthDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return Response.json({ error: 'Invalid birthDate format' }, { status: 400 });
      }
    }

    const updatedUser = await updateUser(currentUser.id, updates);
    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as { password?: string }).password;

    return Response.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('PUT /api/auth/me error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
