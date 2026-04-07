import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { MembershipType, UserStatus } from '@prisma/client';
import { checkAdmin } from '@/lib/auth/check-admin';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import bcryptjs from 'bcryptjs';

type ImportRow = Record<string, unknown>;

const getCellValue = (row: ImportRow, keys: string[]): string => {
  const normalizedTargets = keys.map((key) =>
    key.toLowerCase().replace(/\uFEFF/g, '').trim()
  );

  for (const [rawKey, rawValue] of Object.entries(row)) {
    const normalizedKey = rawKey.toLowerCase().replace(/\uFEFF/g, '').trim();
    if (normalizedTargets.includes(normalizedKey)) {
      const normalizedValue = String(rawValue ?? '').trim();
      if (normalizedValue) return normalizedValue;
    }
  }
  return '';
};

const parseDate = (value: string): Date | null => {
  if (!value) return null;

  // Excel serial date support (e.g. 45678)
  if (/^\d{4,6}$/.test(value)) {
    const serial = Number(value);
    if (!Number.isNaN(serial)) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const parsedFromSerial = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
      if (!Number.isNaN(parsedFromSerial.getTime())) return parsedFromSerial;
    }
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  // Supports DD/MM/YYYY or DD-MM-YYYY
  const match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const plusOneYear = (date: Date): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + 1);
  return result;
};

const minusOneYear = (date: Date): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - 1);
  return result;
};

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const cleaned = fullName.trim().replace(/\s+/g, ' ');
  if (!cleaned) return { firstName: '', lastName: '' };
  const [firstName, ...rest] = cleaned.split(' ');
  return {
    firstName,
    lastName: rest.join(' ') || '-',
  };
};

export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
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

    const firstRow = data[0] || {};
    const isFinancialMemberFormat =
      'Member No' in firstRow ||
      'Nama Lengkap' in firstRow ||
      'Membership term ends' in firstRow;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const memberNo = getCellValue(row, ['Member No', 'Member Number', 'MemberNo']);
        const fullName = getCellValue(row, ['Nama Lengkap', 'Full Name', 'Name']);
        let firstName = getCellValue(row, ['First Name', 'FirstName']);
        let lastName = getCellValue(row, ['Last Name', 'LastName']);

        if ((!firstName || !lastName) && fullName) {
          const splitName = splitFullName(fullName);
          firstName = firstName || splitName.firstName;
          lastName = lastName || splitName.lastName;
        }

        const email = getCellValue(row, ['Email address', 'Email Address', 'Email']).toLowerCase();
        const phoneNumber = getCellValue(row, ['Telephone #', 'Phone Number', 'Phone']);
        const studentId = getCellValue(row, ['Student ID']);
        const branch = getCellValue(row, ['Ranting', 'Branch']);
        const domicileCampus = getCellValue(row, ['Domisili / Kampus', 'Domisili/Kampus', 'Domicile / Campus']);
        const educationLevel = getCellValue(row, ['Jenjang Studi', 'Education Level']) || 'Undergraduate';
        const university = getCellValue(row, ['Universitas', 'University']) || 'University of Queensland';
        const major = getCellValue(row, ['Jurusan', 'Major']) || '-';
        const intake = getCellValue(row, ['Intake']);
        const expectedGraduation = getCellValue(row, ['Expected Graduation']);
        const nationality = getCellValue(row, ['Nationality']) || 'Indonesia';

        const rawMembership = getCellValue(row, ['Membership Type']).toLowerCase();
        const rawStatus = getCellValue(row, ['Status']).toLowerCase();
        const rawDateJoined = getCellValue(row, ['Date Joined']);
        const rawMembershipTermEnds = getCellValue(row, ['Membership term ends', 'Membership Term Ends']);

        // Validate required fields
        if (!firstName || !lastName || !email) {
          results.errors.push(`Row ${index + 2}: Missing required fields (name and email)`);
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

        let membershipType: MembershipType = MembershipType.ORDINARY;
        if (rawMembership === 'ordinary') membershipType = MembershipType.ORDINARY;
        if (rawMembership === 'associate') membershipType = MembershipType.ASSOCIATE;
        if (!rawMembership && nationality && nationality.toLowerCase() !== 'indonesia') {
          membershipType = MembershipType.ASSOCIATE;
        }

        const statusMap: Record<string, UserStatus> = {
          pending: UserStatus.PENDING,
          approved: UserStatus.APPROVED,
          rejected: UserStatus.REJECTED,
        };
        const status =
          statusMap[rawStatus] ??
          ((isFinancialMemberFormat || rawMembershipTermEnds) ? UserStatus.APPROVED : UserStatus.PENDING);

        const parsedMembershipTermEnds = parseDate(rawMembershipTermEnds);
        const parsedDateJoined = parseDate(rawDateJoined);

        let dateJoined =
          parsedDateJoined ||
          (parsedMembershipTermEnds ? minusOneYear(parsedMembershipTermEnds) : null);

        let membershipTermEnds =
          parsedMembershipTermEnds ||
          (dateJoined ? plusOneYear(dateJoined) : null);

        if (status === UserStatus.APPROVED && !dateJoined) {
          dateJoined = new Date();
        }
        if (status === UserStatus.APPROVED && !membershipTermEnds && dateJoined) {
          membershipTermEnds = plusOneYear(dateJoined);
        }

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
              memberNo: memberNo || existingUser.memberNo,
              branch: branch || existingUser.branch,
              domicileCampus: domicileCampus || existingUser.domicileCampus,
              nationality: nationality || existingUser.nationality,
              educationLevel: educationLevel || existingUser.educationLevel,
              university: university || existingUser.university,
              major: major || existingUser.major,
              intake: intake || existingUser.intake,
              expectedGraduation: expectedGraduation || existingUser.expectedGraduation,
              membershipType,
              status,
              dateJoined: dateJoined || existingUser.dateJoined,
              membershipTermEnds: membershipTermEnds || existingUser.membershipTermEnds,
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
              memberNo: memberNo || null,
              branch: branch || null,
              domicileCampus: domicileCampus || null,
              nationality,
              educationLevel,
              university,
              major,
              intake: intake || null,
              expectedGraduation: expectedGraduation || null,
              birthDate: '1990-01-01',
              membershipType,
              status,
              paymentProofUrl: '',
              role: 'USER',
              dateJoined: dateJoined,
              membershipTermEnds: membershipTermEnds,
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
