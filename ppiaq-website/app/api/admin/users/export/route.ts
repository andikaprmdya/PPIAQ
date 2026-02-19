import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query param for format (csv or excel)
    const format = request.nextUrl.searchParams.get('format') || 'excel';

    // Get all users
    const users = await getAllUsers();

    // Transform data for export (exclude password)
    const exportData = users.map((user) => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Email: user.email,
      'Phone Number': user.phoneNumber || '',
      'Student ID': user.studentId || '',
      Nationality: user.nationality,
      'Education Level': user.educationLevel,
      University: user.university,
      Major: user.major,
      'Birth Date': user.birthDate,
      'Membership Type': user.membershipType,
      Role: user.role,
      Status: user.status,
      'Created At': user.createdAt.toISOString(),
      'Date Joined': user.dateJoined ? user.dateJoined.toISOString() : '',
      'Approved At': user.approvedAt ? user.approvedAt.toISOString() : '',
      'Rejected At': user.rejectedAt ? user.rejectedAt.toISOString() : '',
      'Rejection Reason': user.rejectionReason || '',
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
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
          'Content-Disposition': 'attachment; filename="ppiaq-members.csv"',
        },
      });
    } else {
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 }, // First Name
        { wch: 12 }, // Last Name
        { wch: 20 }, // Email
        { wch: 15 }, // Phone Number
        { wch: 15 }, // Student ID
        { wch: 12 }, // Nationality
        { wch: 15 }, // Education Level
        { wch: 20 }, // University
        { wch: 12 }, // Major
        { wch: 12 }, // Birth Date
        { wch: 15 }, // Membership Type
        { wch: 10 }, // Role
        { wch: 10 }, // Status
        { wch: 20 }, // Created At
        { wch: 20 }, // Date Joined
        { wch: 20 }, // Approved At
        { wch: 20 }, // Rejected At
        { wch: 30 }, // Rejection Reason
      ];

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="ppiaq-members.xlsx"',
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
