import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { MembershipType, UserStatus } from '@prisma/client';
import { checkAdmin } from '@/lib/auth/check-admin';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import bcryptjs from 'bcryptjs';
import { createHash } from 'crypto';
import { isEligibleForMembershipList } from '@/lib/membership-rules';
import { validateFirstLastName } from '@/lib/name-validation';
import { TEMP_IMPORTED_MEMBER_PASSWORD } from '@/lib/auth/password-reset';

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

const normalizeOrNA = (value: string): string => value.trim() || 'N/A';

const buildFallbackEmail = (rowIndex: number, seeds: string[]): string => {
  const seedBase = seeds
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .join('|') || `row-${rowIndex + 2}`;
  const digest = createHash('sha1').update(seedBase).digest('hex').slice(0, 12);
  return `na+${digest}@ppiaq.local`;
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const firstRow = data[0] || {};
    const isFinancialMemberFormat =
      'Member No' in firstRow ||
      'Nama Lengkap' in firstRow ||
      'Membership term ends' in firstRow;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const rawMemberNo = getCellValue(row, ['Member No', 'Member Number', 'MemberNo']);
        const fullName = getCellValue(row, ['Nama Lengkap', 'Full Name', 'Name']);
        let firstName = getCellValue(row, ['First Name', 'FirstName']);
        let lastName = getCellValue(row, ['Last Name', 'LastName']);

        if ((!firstName || !lastName) && fullName) {
          const splitName = splitFullName(fullName);
          firstName = firstName || splitName.firstName;
          lastName = lastName || splitName.lastName;
        }
        firstName = firstName.trim();
        lastName = lastName.trim();

        const nameValidationError = validateFirstLastName(firstName, lastName);
        if (nameValidationError) {
          results.skipped++;
          results.errors.push(`Row ${index + 2}: ${nameValidationError}`);
          continue;
        }

        const rawEmail = getCellValue(row, ['Email address', 'Email Address', 'Email']).toLowerCase();
        const hasValidEmail = emailRegex.test(rawEmail);
        const email = hasValidEmail
          ? rawEmail
          : buildFallbackEmail(index, [
              rawMemberNo,
              fullName,
              firstName,
              lastName,
              getCellValue(row, ['Telephone #', 'Phone Number', 'Phone']),
              getCellValue(row, ['Ranting', 'Branch']),
              getCellValue(row, ['Domisili / Kampus', 'Domisili/Kampus', 'Domicile / Campus']),
              getCellValue(row, ['Universitas', 'University']),
              getCellValue(row, ['Jurusan', 'Major']),
              getCellValue(row, ['Intake']),
            ]);

        const memberNo = normalizeOrNA(rawMemberNo);
        const phoneNumber = normalizeOrNA(getCellValue(row, ['Telephone #', 'Phone Number', 'Phone']));
        const studentId = normalizeOrNA(getCellValue(row, ['Student ID']));
        const branch = normalizeOrNA(getCellValue(row, ['Ranting', 'Branch']));
        const domicileCampus = normalizeOrNA(getCellValue(row, ['Domisili / Kampus', 'Domisili/Kampus', 'Domicile / Campus']));
        const educationLevel = normalizeOrNA(getCellValue(row, ['Jenjang Studi', 'Education Level']));
        const university = normalizeOrNA(getCellValue(row, ['Universitas', 'University']));
        const major = normalizeOrNA(getCellValue(row, ['Jurusan', 'Major']));
        const intake = normalizeOrNA(getCellValue(row, ['Intake']));
        const expectedGraduation = normalizeOrNA(getCellValue(row, ['Expected Graduation']));
        const nationality = getCellValue(row, ['Nationality']) || 'Indonesia';

        if (
          !isEligibleForMembershipList({
            university,
            nationality,
          })
        ) {
          results.skipped++;
          results.errors.push(
            `Row ${index + 2}: Griffith University membership list only accepts Indonesian nationality`
          );
          continue;
        }

        const rawMembership = getCellValue(row, ['Membership Type']).toLowerCase();
        const rawStatus = getCellValue(row, ['Status']).toLowerCase();
        const rawDateJoined = getCellValue(row, ['Date Joined']);
        const rawMembershipTermEnds = getCellValue(row, ['Membership term ends', 'Membership Term Ends']);

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

        const [existingByEmail, existingByMemberNo] = await Promise.all([
          prisma.user.findUnique({ where: { email } }),
          memberNo !== 'N/A' ? prisma.user.findFirst({ where: { memberNo } }) : Promise.resolve(null),
        ]);

        // Skip duplicates instead of updating existing records.
        if (existingByEmail || existingByMemberNo) {
          results.skipped++;
          continue;
        }

        // Create new user with a temporary hashed password
        const tempPassword = await bcryptjs.hash(TEMP_IMPORTED_MEMBER_PASSWORD, 10);
        await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: tempPassword,
            phoneNumber,
            studentId,
            memberNo,
            branch,
            domicileCampus,
            nationality,
            educationLevel,
            university,
            major,
            intake,
            expectedGraduation,
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
