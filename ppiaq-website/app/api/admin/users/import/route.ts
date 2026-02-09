import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, isAdmin, getAllUsers } from '@/lib/database/db';
import { cookies } from 'next/headers';
import { MembershipType, UserStatus } from '@prisma/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportRow {
  'First Name': string;
  'Last Name': string;
  Email: string;
  'Phone Number': string;
  'Student ID': string;
  'Membership Type': string;
  Status: string;
  'Date Joined': string;
}

export async function POST(request: NextRequest) {
  try {
    // Get admin user from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminUser = await getUserByEmail(userEmail);

    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8');
    let data: ImportRow[] = [];

    // Parse based on file type
    if (file.name.endsWith('.csv')) {
      // Parse CSV
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      data = parsed.data as ImportRow[];
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please use CSV or Excel.' },
        { status: 400 }
      );
    }

    // Validate data
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    // Get existing emails
    const existingUsers = await getAllUsers();
    const existingEmails = existingUsers.map((u) => u.email);

    // Process data - update or skip existing emails
    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    data.forEach((row, index) => {
      try {
        const {
          'First Name': firstName,
          'Last Name': lastName,
          Email: email,
          'Phone Number': phoneNumber,
          'Student ID': studentId,
          'Membership Type': membershipType,
          Status: status,
          'Date Joined': dateJoined,
        } = row;

        // Validate required fields
        if (!firstName || !lastName || !email) {
          results.errors.push(`Row ${index + 2}: Missing required fields`);
          results.skipped++;
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push(`Row ${index + 2}: Invalid email format`);
          results.skipped++;
          return;
        }

        // Validate membership type
        if (!['ordinary', 'associate'].includes(membershipType?.toLowerCase())) {
          results.errors.push(`Row ${index + 2}: Invalid membership type`);
          results.skipped++;
          return;
        }

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status?.toLowerCase())) {
          results.errors.push(`Row ${index + 2}: Invalid status`);
          results.skipped++;
          return;
        }

        // Check if email exists
        const existingUserIndex = existingUsers.findIndex((u) => u.email === email);
        if (existingUserIndex !== -1) {
          // Update existing user
          const existingUser = existingUsers[existingUserIndex];
          existingUser.firstName = firstName;
          existingUser.lastName = lastName;
          existingUser.phoneNumber = phoneNumber;
          existingUser.studentId = studentId;
          existingUser.membershipType = (membershipType as string).toUpperCase() as MembershipType;
          existingUser.status = (status as string).toUpperCase() as UserStatus;
          if (dateJoined) {
            existingUser.dateJoined = new Date(dateJoined);
          }
          results.updated++;
        } else {
          // Note: We're only updating existing data, not creating new users via import
          // because new users need password and other fields
          results.skipped++;
        }
      } catch (error) {
        results.errors.push(`Row ${index + 2}: ${String(error)}`);
        results.skipped++;
      }
    });

    return NextResponse.json(
      {
        message: 'Import completed',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/users/import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
