import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsletterSubscribers, getAllUsers, getUsersByStatus } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';
import * as XLSX from 'xlsx';
import { UserStatus } from '@prisma/client';
import { isEligibleForMembershipList } from '@/lib/membership-rules';

type ExportScope = 'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'nonactive' | 'newsletter';
const USER_HEADERS = [
  'Member No',
  'Nama Lengkap',
  'Email address',
  'Telephone #',
  'Ranting',
  'Domisili / Kampus',
  'Jenjang Studi',
  'Universitas',
  'Jurusan',
  'Intake',
  'Expected Graduation',
  'Membership term ends',
] as const;
const NEWSLETTER_HEADERS = ['Email address', 'Subscribed at'] as const;

const toCsvDate = (value: Date | string | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getMembershipTermEnds = (
  user: {
    membershipTermEnds?: Date | null;
    dateJoined?: Date | null;
    approvedAt?: Date | null;
    createdAt: Date;
    status: UserStatus;
  }
): Date | null => {
  if (user.membershipTermEnds) return user.membershipTermEnds;

  const base =
    user.dateJoined ||
    user.approvedAt ||
    (user.status === UserStatus.APPROVED ? user.createdAt : null);

  if (!base) return null;
  const end = new Date(base);
  end.setFullYear(end.getFullYear() + 1);
  return end;
};

const isActiveMember = (
  user: {
    membershipTermEnds?: Date | null;
    dateJoined?: Date | null;
    approvedAt?: Date | null;
    createdAt: Date;
    status: UserStatus;
  }
): boolean => {
  if (user.status !== UserStatus.APPROVED) return false;
  const end = getMembershipTermEnds(user);
  if (!end) return false;
  return end.getTime() > Date.now();
};

export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query params
    const format = request.nextUrl.searchParams.get('format') || 'excel';
    const rawScope = (request.nextUrl.searchParams.get('scope') || 'all').toLowerCase();
    const normalizedScope = rawScope === 'inactive' ? 'nonactive' : rawScope;
    const scope: ExportScope = ['pending', 'approved', 'rejected', 'active', 'nonactive', 'newsletter', 'all'].includes(normalizedScope)
      ? normalizedScope as ExportScope
      : 'all';

    let exportData: Array<Record<string, string>> = [];
    let headers: readonly string[] = [];
    let filenameBase = 'ppiaq-members';

    if (scope === 'newsletter') {
      headers = NEWSLETTER_HEADERS;
      const subscribers = await getAllNewsletterSubscribers();
      exportData = subscribers.map((subscriber) => ({
        'Email address': subscriber.email,
        'Subscribed at': toCsvDate(subscriber.subscribedAt),
      }));
      filenameBase = 'ppiaq-newsletter';
    } else {
      headers = USER_HEADERS;
      const users =
        scope === 'pending' || scope === 'approved' || scope === 'rejected'
          ? await getUsersByStatus(scope)
          : scope === 'active'
          ? (await getUsersByStatus('approved')).filter(isActiveMember)
          : scope === 'nonactive'
          ? (await getUsersByStatus('approved')).filter((user) => !isActiveMember(user))
          : await getAllUsers();
      const filteredUsers = users.filter((member) =>
        isEligibleForMembershipList({
          university: member.university,
          nationality: member.nationality,
        })
      );

      exportData = filteredUsers.map((user) => ({
        'Member No': user.memberNo || '',
        'Nama Lengkap': `${user.firstName} ${user.lastName}`.trim(),
        'Email address': user.email,
        'Telephone #': user.phoneNumber || '',
        Ranting: user.branch || '',
        'Domisili / Kampus': user.domicileCampus || '',
        'Jenjang Studi': user.educationLevel || '',
        Universitas: user.university || '',
        Jurusan: user.major || '',
        Intake: user.intake || '',
        'Expected Graduation': user.expectedGraduation || '',
        'Membership term ends': toCsvDate(getMembershipTermEnds(user)),
      }));

      filenameBase =
        scope === 'all'
          ? 'ppiaq-members'
          : scope === 'active'
          ? 'ppiaq-active-members'
          : scope === 'nonactive'
          ? 'ppiaq-nonactive-members'
          : `ppiaq-${scope}-members`;
    }

    if (format === 'csv') {
      // Convert to CSV and keep headers even when there is no row data.
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row] || '';
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
          }).join(',')
        ),
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    } else {
      // Convert to Excel
      const worksheet =
        exportData.length > 0
          ? XLSX.utils.json_to_sheet(exportData, { header: [...headers] })
          : XLSX.utils.aoa_to_sheet([[...headers]]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

      // Set column widths dynamically
      worksheet['!cols'] = headers.map((header) => ({ wch: Math.max(16, header.length + 2) }));

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('GET /api/admin/users/export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
