'use client';

import { useEffect, useState } from 'react';
import ContentEditModal from '@/components/admin/content/ContentEditModal';

interface ContentSection {
  id: string;
  key: string;
  section: string;
  content: { id: string; en: string };
  image?: string;
  type: string;
  page: string;
}

export default function AboutContentPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content?page=about');
      const data = await res.json();
      setSections(data.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (section: ContentSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSaveSection = async (updatedData: any) => {
    try {
      const res = await fetch(`/api/admin/content/${editingSection?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        fetchContent();
        setIsModalOpen(false);
        setEditingSection(null);
        alert('Content updated successfully');
      } else {
        alert('Failed to update content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  const availableSections = [
    { key: 'about_title', label: 'About Title', section: 'hero' },
    { key: 'about_description', label: 'About Description', section: 'hero' },
    { key: 'mission_title', label: 'Mission Title', section: 'mission' },
    { key: 'mission_content', label: 'Mission Content', section: 'mission' },
    { key: 'vision_title', label: 'Vision Title', section: 'vision' },
    { key: 'vision_content', label: 'Vision Content', section: 'vision' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">About Page Content</h1>
        <p className="text-[#886644] text-sm">Edit sections of your about page with bilingual support</p>
      </div>

      {/* Content Sections */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644]">Loading content...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableSections.map((sectionConfig) => {
            const existingContent = sections.find((s) => s.key === sectionConfig.key);
            return (
              <div key={sectionConfig.key} className="bg-white border border-[#E4DBCA] rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#B64847] mb-2">{sectionConfig.label}</h3>
                    <p className="text-xs text-[#886644] font-mono mb-3">{sectionConfig.key}</p>

                    {existingContent ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-bold text-[#886644] uppercase mb-1">Indonesian</p>
                          <p className="text-sm text-[#303030]">{existingContent.content.id || '(empty)'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#886644] uppercase mb-1">English</p>
                          <p className="text-sm text-[#303030]">{existingContent.content.en || '(empty)'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#886644] italic">No content set yet</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditSection(existingContent || { id: '', key: sectionConfig.key, section: sectionConfig.section, content: { id: '', en: '' }, type: 'TEXT', page: 'about' })}
                    className="ml-4 px-4 py-2 bg-[#B64847] text-white font-bold rounded-xl hover:bg-[#303030] transition-all text-sm uppercase whitespace-nowrap"
                  >
                    {existingContent ? 'Edit' : 'Create'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingSection && (
        <ContentEditModal
          section={editingSection}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSection(null);
          }}
          onSave={handleSaveSection}
        />
      )}
    </div>
  );
}
