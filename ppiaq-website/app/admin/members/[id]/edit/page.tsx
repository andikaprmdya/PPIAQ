'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { createTranslator, getTranslation, translations } from '@/lib/translations';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { isInvalidNameValue } from '@/lib/name-validation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  studentId?: string;
  nationality: string;
  educationLevel: string;
  university: string;
  major: string;
  birthDate: string;
  membershipType: 'ordinary' | 'associate';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export default function EditMemberPage() {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = createTranslator(language);
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({});

  const normalizeMemberData = (data: User): User => ({
    ...data,
    membershipType: (data.membershipType || '').toLowerCase() as User['membershipType'],
    status: (data.status || '').toLowerCase() as User['status'],
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  // Load member data
  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${memberId}`);
      if (response.ok) {
        const data = await response.json() as User;
        const normalizedData = normalizeMemberData(data);
        setMember(normalizedData);
        setFormData(normalizedData);
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
      setMessage({ type: 'error', text: t('admin.members.failedToLoadMemberData', 'Failed to load member data') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (isInvalidNameValue(formData.firstName || '') || isInvalidNameValue(formData.lastName || '')) {
      setMessage({
        type: 'error',
        text: t('admin.members.invalidName', 'First name and last name cannot use N/A'),
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedData = normalizeMemberData(data.user as User);
        setMember(normalizedData);
        setFormData(normalizedData);
        setMessage({ type: 'success', text: t('admin.members.memberUpdatedSuccessfully', 'Member updated successfully') });
      } else {
        setMessage({ type: 'error', text: t('admin.members.failedToUpdateMember', 'Failed to update member') });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: t('admin.members.errorUpdatingMember', 'Error updating member') });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-gray-600">{t('admin.members.loadingMemberData', 'Loading member data...')}</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-600">{t('admin.members.memberNotFound', 'Member not found')}</p>
          <Link href="/admin/members" className="text-[#B64847] hover:text-[#9a3a3e] font-semibold mt-4 inline-block">
            ← {getTranslation(translations.common.backToMembers, language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/members"
            className="text-[#B64847] hover:text-[#9a3a3e] font-semibold mb-4 inline-block"
          >
            ← {getTranslation(translations.common.backToMembers, language)}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.members.editMember', 'Edit Member')}</h1>
          <p className="text-gray-600 mt-2">{member.firstName} {member.lastName}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('admin.members.basicInformation', 'Basic Information')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.firstName', 'First Name')}</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.lastName', 'Last Name')}</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{getTranslation(translations.common.email, language)}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.phoneNumber', 'Phone Number')}</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{getTranslation(translations.common.studentId, language)}</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.birthDate', 'Birth Date')}</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
            </div>
          </div>

          {/* Educational Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('admin.members.educationalInformation', 'Educational Information')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.nationality', 'Nationality')}</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.educationLevel', 'Education Level')}</label>
                <input
                  type="text"
                  name="educationLevel"
                  value={formData.educationLevel || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{getTranslation(translations.common.university, language)}</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.major', 'Major')}</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('admin.members.membershipInformation', 'Membership Information')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.membershipType', 'Membership Type')}</label>
                <select
                  name="membershipType"
                  value={formData.membershipType || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                >
                  <option value="ordinary">{getTranslation(translations.common.ordinary, language)}</option>
                  <option value="associate">{getTranslation(translations.common.associate, language)}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{getTranslation(translations.common.status, language)}</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                >
                  <option value="pending">{getTranslation(translations.common.pending, language)}</option>
                  <option value="approved">{getTranslation(translations.common.approved, language)}</option>
                  <option value="rejected">{getTranslation(translations.common.rejected, language)}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {formData.status === 'rejected' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('admin.members.rejectionDetails', 'Rejection Details')}</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.members.rejectionReason', 'Rejection Reason')}</label>
                <input
                  type="text"
                  name="rejectionReason"
                  value={formData.rejectionReason || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B64847]"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#B64847] text-white rounded-lg hover:bg-[#9a3a3e] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? getTranslation(translations.common.processing, language) : getTranslation(translations.common.saveChanges, language)}
            </button>
            <Link
              href="/admin/members"
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition"
            >
              {getTranslation(translations.common.cancel, language)}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
