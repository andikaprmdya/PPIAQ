import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, isAdmin } from '@/lib/database/db';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import { MembershipType, UserStatus } from '@prisma/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import bcryptjs from 'bcryptjs';

interface ImportRow {
  'First Name': string;
  'Last Name': string;
  Email: string;
  'Phone Number'?: string;
  'Student ID'?: string;
  'Membership Type'?: string;
  Status?: string;
  'Date Joined'?: string;
  Nationality?: string;
  'Education Level'?: string;
  University?: string;
  Major?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminUser = await getUserByEmail(userEmail);
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let data: ImportRow[] = [];

    if (file.name.endsWith('.csv')) {
      const text = Buffer.from(buffer).toString('utf-8');
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      data = parsed.data as ImportRow[];
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please use CSV or Excel.' },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const firstName = row['First Name']?.toString().trim();
        const lastName = row['Last Name']?.toString().trim();
        const email = row['Email']?.toString().trim().toLowerCase();
        const phoneNumber = row['Phone Number']?.toString().trim() || '';
        const studentId = row['Student ID']?.toString().trim() || '';
        const rawMembership = row['Membership Type']?.toString().trim().toLowerCase() || 'ordinary';
        const rawStatus = row['Status']?.toString().trim().toLowerCase() || 'pending';
        const dateJoined = row['Date Joined']?.toString().trim();
        const nationality = row['Nationality']?.toString().trim() || 'Indonesia';
        const educationLevel = row['Education Level']?.toString().trim() || 'S1 (Bachelor)';
        const university = row['University']?.toString().trim() || 'University of Queensland';
        const major = row['Major']?.toString().trim() || '-';

        // Validate required fields
        if (!firstName || !lastName || !email) {
          results.errors.push(`Row ${index + 2}: Missing required fields (First Name, Last Name, Email)`);
          results.skipped++;
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push(`Row ${index + 2}: Invalid email format — "${email}"`);
          results.skipped++;
          continue;
        }

        // Normalize & validate membership type
        const membershipType = ['ordinary', 'associate'].includes(rawMembership)
          ? rawMembership.toUpperCase() as MembershipType
          : MembershipType.ORDINARY;

        // Normalize & validate status
        const statusMap: Record<string, UserStatus> = {
          pending: UserStatus.PENDING,
          approved: UserStatus.APPROVED,
          rejected: UserStatus.REJECTED,
        };
        const status = statusMap[rawStatus] ?? UserStatus.PENDING;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { email },
            data: {
              firstName,
              lastName,
              phoneNumber: phoneNumber || existingUser.phoneNumber,
              studentId: studentId || existingUser.studentId,
              membershipType,
              status,
              dateJoined: dateJoined ? new Date(dateJoined) : existingUser.dateJoined,
            },
          });
          results.updated++;
        } else {
          // Create new user with a temporary hashed password
          const tempPassword = await bcryptjs.hash('TempPass123!', 10);
          await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              password: tempPassword,
              phoneNumber,
              studentId,
              nationality,
              educationLevel,
              university,
              major,
              birthDate: '1990-01-01',
              membershipType,
              status,
              paymentProofUrl: '',
              role: 'USER',
              dateJoined: dateJoined ? new Date(dateJoined) : (status === UserStatus.APPROVED ? new Date() : null),
            },
          });
          results.imported++;
        }
      } catch (error) {
        results.errors.push(`Row ${index + 2}: ${String(error)}`);
        results.skipped++;
      }
    }

    return NextResponse.json({ message: 'Import completed', results }, { status: 200 });
  } catch (error) {
    console.error('POST /api/admin/users/import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
