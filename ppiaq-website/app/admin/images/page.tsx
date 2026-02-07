'use client';

import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/forms/ConfirmDialog';
import ImageUploader from '@/components/admin/ImageUploader';

interface ImageAsset {
  id: string;
  name: string;
  description?: string;
  mimeType: string;
  size: number;
  category: string;
  base64Data?: string;
  createdAt: Date;
}

export default function ImageLibraryPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);

  const categories = ['event', 'team', 'hero', 'general'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      setImages(data.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = filter === 'all' ? images : images.filter((img) => img.category === filter);

  const handleImageUpload = async (base64: string): Promise<void> => {
    setUploading(true);
    try {
      const fileName = `image_${Date.now()}.jpg`;
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          description: 'Uploaded image',
          base64Data: base64,
          mimeType: 'image/jpeg',
          category: 'general',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImages([...images, data.data]);
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id));
        alert('Image deleted successfully');
      }
    } catch (error) {
      alert('Failed to delete image');
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="mb-8">
        <div>
          <h1 className="font-tan-angleton font-bold text-3xl text-[#B64847] mb-2">Image Library</h1>
          <p className="text-[#886644] text-sm">Upload and manage images used across the site</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 mb-8">
        <h2 className="font-bold text-lg text-[#B64847] mb-4">Upload New Image</h2>
        <ImageUploader
          value=""
          onChange={handleImageUpload}
          category="general"
          maxSizeMB={5}
        />
        {uploading && <p className="text-[#886644] text-sm mt-4">Uploading...</p>}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
            filter === 'all' ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              filter === cat ? 'bg-[#B64847] text-white' : 'bg-white border border-[#E4DBCA] text-[#886644]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">⏳ Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4DBCA] p-8 text-center">
          <p className="text-[#886644] font-bold">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-2xl border border-[#E4DBCA] overflow-hidden shadow-sm hover:shadow-lg transition-all">
              {/* Image Preview */}
              <div className="w-full h-48 bg-[#FFFAF5] flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(image)}>
                {image.base64Data && (
                  <img src={image.base64Data} alt={image.name} className="w-full h-full object-cover" />
                )}
                {!image.base64Data && <p className="text-[#886644] text-sm">No preview</p>}
              </div>

              {/* Image Info */}
              <div className="p-4">
                <h3 className="font-bold text-sm text-[#B64847] mb-2 truncate">{image.name}</h3>
                <div className="space-y-1 text-xs text-[#886644] mb-4">
                  <p>
                    <span className="font-bold">Size:</span> {formatFileSize(image.size)}
                  </p>
                  <p>
                    <span className="font-bold">Category:</span> {image.category}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setDeleteConfirm({ show: true, id: image.id })}
                  className="w-full px-3 py-2 text-xs font-bold text-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-[#E4DBCA] bg-[#FFFAF5]">
              <h2 className="font-bold text-lg text-[#B64847]">Image Details</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-2xl text-[#886644] hover:text-[#B64847] transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {selectedImage.base64Data && (
                <img src={selectedImage.base64Data} alt={selectedImage.name} className="w-full rounded-xl mb-6 max-h-96 object-contain" />
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#886644]">Name</label>
                  <p className="text-sm text-[#303030]">{selectedImage.name}</p>
                </div>

                {selectedImage.description && (
                  <div>
                    <label className="text-xs font-bold uppercase text-[#886644]">Description</label>
                    <p className="text-sm text-[#303030]">{selectedImage.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#886644]">Size</label>
                    <p className="text-sm text-[#303030]">{formatFileSize(selectedImage.size)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-[#886644]">Category</label>
                    <p className="text-sm text-[#303030]">{selectedImage.category}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#886644]">Type</label>
                  <p className="text-sm text-[#303030]">{selectedImage.mimeType}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDeleteConfirm({ show: true, id: selectedImage.id });
                  setSelectedImage(null);
                }}
                className="w-full mt-6 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Image"
        message="Are you sure you want to delete this image?"
        confirmText="Delete"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        variant="danger"
      />
    </div>
  );
}
