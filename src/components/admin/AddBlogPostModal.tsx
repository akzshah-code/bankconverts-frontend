// src/components/admin/AddBlogPostModal.tsx

import React, {
  useState,
  FormEvent,
  ChangeEvent,
} from 'react';
import RichTextEditor from '../shared/RichTextEditor';

interface BlogPostBase {
  title: string;
  author: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
}

interface AddBlogPostModalProps {
  onSave: (post: BlogPostBase) => void;
  onClose: () => void;
}

const AddBlogPostModal: React.FC<AddBlogPostModalProps> = ({
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] =
    useState<string | null>(null);

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFeaturedImage(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      author,
      excerpt,
      content,
      featuredImage: featuredImage || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-dark">
            Add New Blog Post
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700"
            >
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <label
              htmlFor="featuredImage"
              className="block text-sm font-medium text-gray-700"
            >
              Featured Image
            </label>
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Preview"
                className="mt-2 h-24 w-auto rounded-md object-cover"
              />
            )}
            <input
              type="file"
              id="featuredImage"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-light file:text-brand-blue hover:file:bg-brand-blue/20"
            />
          </div>
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              required
              placeholder="A short summary of the post..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogPostModal;
